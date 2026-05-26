const { supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/orders
 * Protected — buyers only.
 * Body: { seller_id, items: [{ product_id, quantity, price }] }
 * Atomically validates stock, creates the order + order_items, and decrements stock.
 */
const placeOrder = asyncHandler(async (req, res, next) => {
  const { seller_id, items } = req.body;

  if (!seller_id || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    return next(new Error('seller_id and at least one item are required'));
  }

  // 1. Fetch current stock for all items
  const productIds = items.map(i => i.product_id);
  const { data: productsData, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, title, stock, is_available')
    .in('id', productIds);

  if (productsError || !productsData) {
    res.status(500);
    return next(new Error(`Failed to fetch product stocks: ${productsError?.message}`));
  }

  // Map for easy lookup
  const productMap = {};
  for (const p of productsData) {
    productMap[p.id] = p;
  }

  // Validate stock and availability
  for (const item of items) {
    const prod = productMap[item.product_id];
    if (!prod) {
      res.status(400);
      return next(new Error(`Product not found: ${item.product_id}`));
    }
    if (!prod.is_available) {
      res.status(400);
      return next(new Error(`Product is not available: ${prod.title}`));
    }
    if (prod.stock < item.quantity) {
      res.status(400);
      return next(new Error(`Insufficient stock for product "${prod.title}". Available: ${prod.stock}, Requested: ${item.quantity}`));
    }
  }

  // 2. Create the order row
  const total_amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({ buyer_id: req.user.id, seller_id, total_amount })
    .select()
    .single();

  if (orderError) {
    res.status(500);
    return next(new Error(`Order creation failed: ${orderError.message}`));
  }

  // 3. Insert all order_items
  const orderItems = items.map(({ product_id, quantity, price }) => ({
    order_id: order.id,
    product_id,
    quantity,
    price,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback order
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    res.status(500);
    return next(new Error(`Order items creation failed: ${itemsError.message}`));
  }

  // 4. Decrement stock atomically and keep track of decremented items in case we need to roll back
  const decrementedItems = [];
  let stockErrorOccurred = false;
  let stockErrorMessage = '';

  for (const { product_id, quantity } of items) {
    const currentStock = productMap[product_id].stock;
    const { data: updatedProd, error: updateError } = await supabaseAdmin
      .from('products')
      .update({ stock: currentStock - quantity })
      .eq('id', product_id)
      .gte('stock', quantity)
      .select();

    if (updateError || !updatedProd || updatedProd.length === 0) {
      stockErrorOccurred = true;
      stockErrorMessage = updateError ? updateError.message : `Product stock was updated concurrently by another order`;
      break;
    }
    
    decrementedItems.push({ product_id, quantity, prevStock: currentStock });
  }

  if (stockErrorOccurred) {
    // Rollback stock decrements
    for (const { product_id, prevStock } of decrementedItems) {
      await supabaseAdmin
        .from('products')
        .update({ stock: prevStock })
        .eq('id', product_id);
    }
    // Delete order
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    
    res.status(409); // Conflict
    return next(new Error(`Order failed due to concurrent stock changes: ${stockErrorMessage}`));
  }

  // 5. Seed initial tracking entry
  await supabaseAdmin
    .from('order_tracking')
    .insert({ order_id: order.id, status: 'pending' });

  res.status(201).json({ message: 'Order placed successfully', order });
});

/**
 * GET /api/orders
 * Protected — returns orders belonging to the authenticated user (buyer or seller).
 */
const getMyOrders = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, order_status, created_at,
      buyer:profiles!orders_buyer_id_fkey(id, full_name),
      seller:profiles!orders_seller_id_fkey(id, full_name),
      order_items(id, quantity, price, product:products(id, title, image_urls))
    `)
    .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.json({ orders: data });
});

/**
 * GET /api/orders/:id
 * Protected — returns a single order with full tracking history.
 */
const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      buyer:profiles!orders_buyer_id_fkey(id, full_name, phone_number),
      seller:profiles!orders_seller_id_fkey(id, full_name, phone_number),
      order_items(id, quantity, price, product:products(id, title, image_urls, description)),
      order_tracking(id, status, updated_at)
    `)
    .eq('id', id)
    .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
    .single();

  if (error || !data) {
    res.status(404);
    return next(new Error('Order not found or access denied'));
  }

  res.json({ order: data });
});

/**
 * PATCH /api/orders/:id/status
 * Protected — seller only. Updates order_status + appends tracking row.
 * Body: { status: 'packed' | 'shipped' | 'delivered' }
 */
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id }     = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'packed', 'shipped', 'delivered'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    return next(new Error(`status must be one of: ${validStatuses.join(', ')}`));
  }

  // Confirm this seller owns the order using supabaseAdmin
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError || !order) {
    res.status(404);
    return next(new Error('Order not found'));
  }

  if (order.seller_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you are not the seller for this order'));
  }

  // Update status using supabaseAdmin
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ order_status: status })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    res.status(500);
    return next(new Error(updateError.message));
  }

  // Append tracking log
  await supabaseAdmin
    .from('order_tracking')
    .insert({ order_id: id, status });

  res.json({ message: `Order marked as ${status}`, order: updated });
});

module.exports = { placeOrder, getMyOrders, getOrderById, updateOrderStatus };
