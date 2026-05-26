const { supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/seller/dashboard
 * Protected — seller only.
 * Returns dashboard overview metrics: total products, total orders, total revenue, pending orders.
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const sellerId = req.user.id;

  // 1. Get total products count (including unavailable ones)
  const { count: totalProducts, error: prodError } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', sellerId);

  if (prodError) {
    res.status(500);
    return next(new Error(`Failed to fetch product stats: ${prodError.message}`));
  }

  // 2. Get orders stats
  const { data: orders, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('total_amount, order_status')
    .eq('seller_id', sellerId);

  if (orderError) {
    res.status(500);
    return next(new Error(`Failed to fetch order stats: ${orderError.message}`));
  }

  const totalOrders = orders ? orders.length : 0;
  const revenue = orders ? orders.reduce((sum, o) => sum + Number(o.total_amount), 0) : 0;
  const pendingOrdersCount = orders ? orders.filter(o => o.order_status === 'pending').length : 0;

  res.status(200).json({
    stats: {
      totalProducts,
      totalOrders,
      revenue,
      pendingOrdersCount,
    },
  });
});

/**
 * GET /api/seller/products
 * Protected — seller only.
 * Returns all products listed by this seller (including unavailable ones).
 */
const getSellerProducts = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq('seller_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ products: data || [] });
});

/**
 * GET /api/seller/orders
 * Protected — seller only.
 * Returns all orders placed with this seller.
 */
const getSellerOrders = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, order_status, created_at,
      buyer:profiles!orders_buyer_id_fkey(id, full_name, phone_number, village, district, state),
      order_items(id, quantity, price, product:products(id, title, image_urls))
    `)
    .eq('seller_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ orders: data || [] });
});

/**
 * GET /api/seller/profile
 * Protected — seller only.
 * Returns the seller's profile details.
 */
const getSellerProfile = asyncHandler(async (req, res, next) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error || !profile) {
    res.status(404);
    return next(new Error('Seller profile not found'));
  }

  res.status(200).json({ profile });
});

module.exports = {
  getDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerProfile,
};
