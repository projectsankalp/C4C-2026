const { supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/cart
 * Protected — buyer only.
 * Returns all cart items for the logged-in user, joining product details.
 */
const getCart = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select(`
      id, quantity, created_at,
      product:products(id, title, price, image_urls, stock, is_available, seller_id)
    `)
    .eq('buyer_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ cart: data || [] });
});

/**
 * POST /api/cart
 * Protected — buyer only.
 * Body: { product_id, quantity }
 * Adds a product to the cart or increments the quantity if already present.
 */
const addToCart = asyncHandler(async (req, res, next) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    res.status(400);
    return next(new Error('product_id is required'));
  }

  const reqQty = Number(quantity);
  if (isNaN(reqQty) || reqQty <= 0) {
    res.status(400);
    return next(new Error('quantity must be a positive integer'));
  }

  // 1. Verify the product exists, is available, and check stock
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('stock, is_available, title')
    .eq('id', product_id)
    .single();

  if (productError || !product) {
    res.status(404);
    return next(new Error('Product not found'));
  }

  if (!product.is_available) {
    res.status(400);
    return next(new Error('This product is currently unavailable'));
  }

  // 2. Check if the product is already in the buyer's cart
  const { data: existing, error: findError } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity')
    .eq('buyer_id', req.user.id)
    .eq('product_id', product_id)
    .single();

  let finalQty = reqQty;
  if (existing) {
    finalQty += existing.quantity;
  }

  // Verify total quantity doesn't exceed stock
  if (product.stock < finalQty) {
    res.status(400);
    return next(new Error(`Cannot add items. Available stock: ${product.stock}, desired in cart: ${finalQty}`));
  }

  let result;
  if (existing) {
    // Update existing item quantity
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: finalQty })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) {
      res.status(500);
      return next(new Error(updateError.message));
    }
    result = updated;
  } else {
    // Insert new cart item
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('cart_items')
      .insert({
        buyer_id: req.user.id,
        product_id,
        quantity: finalQty,
      })
      .select()
      .single();

    if (insertError) {
      res.status(500);
      return next(new Error(insertError.message));
    }
    result = inserted;
  }

  res.status(200).json({ message: 'Cart updated successfully', cartItem: result });
});

/**
 * PATCH /api/cart/:id
 * Protected — buyer only.
 * Body: { quantity }
 * Updates the quantity of a specific cart item.
 */
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const reqQty = Number(quantity);
  if (isNaN(reqQty) || reqQty <= 0) {
    res.status(400);
    return next(new Error('quantity must be a positive integer'));
  }

  // Fetch the cart item to check product and ownership
  const { data: item, error: fetchError } = await supabaseAdmin
    .from('cart_items')
    .select('buyer_id, product_id')
    .eq('id', id)
    .single();

  if (fetchError || !item) {
    res.status(404);
    return next(new Error('Cart item not found'));
  }

  if (item.buyer_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you do not own this cart item'));
  }

  // Check product stock
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock, title')
    .eq('id', item.product_id)
    .single();

  if (product && product.stock < reqQty) {
    res.status(400);
    return next(new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}`));
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity: reqQty })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    res.status(500);
    return next(new Error(updateError.message));
  }

  res.status(200).json({ message: 'Cart item updated', cartItem: updated });
});

/**
 * DELETE /api/cart/:id
 * Protected — buyer only.
 * Removes a specific product from the cart.
 */
const removeCartItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Confirm ownership
  const { data: item, error: fetchError } = await supabaseAdmin
    .from('cart_items')
    .select('buyer_id')
    .eq('id', id)
    .single();

  if (fetchError || !item) {
    res.status(404);
    return next(new Error('Cart item not found'));
  }

  if (item.buyer_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you do not own this cart item'));
  }

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ message: 'Item removed from cart' });
});

/**
 * DELETE /api/cart/clear
 * Protected — buyer only.
 * Clears the entire cart of the logged-in user.
 */
const clearCart = asyncHandler(async (req, res, next) => {
  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('buyer_id', req.user.id);

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ message: 'Cart cleared successfully' });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
