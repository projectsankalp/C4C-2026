const { supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/products
 * Public. Optional query params: category_id, seller_id, search, limit, page
 */
const getProducts = asyncHandler(async (req, res, next) => {
  const { category_id, seller_id, search, limit = 20, page = 1 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Use supabaseAdmin for server-side queries to avoid RLS filtering when no user JWT is present
  let query = supabaseAdmin
    .from('products')
    .select(`
      id, title, description, price, stock, image_urls, is_available, created_at,
      seller:profiles(id, full_name, village, district, state),
      category:categories(id, name)
    `)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (category_id) query = query.eq('category_id', category_id);
  if (seller_id)   query = query.eq('seller_id', seller_id);
  if (search)      query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.json({ products: data, page: Number(page), limit: Number(limit) });
});

/**
 * GET /api/products/:id
 * Public. Returns single product with full seller + category info.
 */
const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      seller:profiles(id, full_name, village, district, state, profile_pic_url, bio),
      category:categories(id, name)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404);
    return next(new Error('Product not found'));
  }

  res.json({ product: data });
});

/**
 * POST /api/products
 * Protected — seller only.
 * Body: { title, description, price, stock, category_id?, image_urls? }
 */
const createProduct = asyncHandler(async (req, res, next) => {
  const { title, description, price, stock, category_id, image_urls } = req.body;

  if (!title || price === undefined || stock === undefined) {
    res.status(400);
    return next(new Error('title, price, and stock are required'));
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      seller_id:   req.user.id,
      title,
      description: description || null,
      price:       Number(price),
      stock:       Number(stock),
      category_id: category_id || null,
      image_urls:  image_urls  || [],
    })
    .select()
    .single();

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(201).json({ message: 'Product created', product: data });
});

/**
 * PATCH /api/products/:id
 * Protected — only the owning seller can update.
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const allowedFields = ['title', 'description', 'price', 'stock', 'category_id', 'image_urls', 'is_available', 'voice_description_url'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(updates).length === 0) {
    res.status(400);
    return next(new Error('No valid fields provided for update'));
  }

  // Verify ownership first using admin client
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404);
    return next(new Error('Product not found'));
  }

  if (existing.seller_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you do not own this product'));
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.json({ message: 'Product updated', product: data });
});

/**
 * DELETE /api/products/:id
 * Protected — only the owning seller can delete.
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Verify ownership using admin client
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('seller_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404);
    return next(new Error('Product not found'));
  }

  if (existing.seller_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you do not own this product'));
  }

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.json({ message: 'Product deleted' });
});

/**
 * GET /api/products/categories
 * Public. Returns all product categories.
 */
const getCategories = asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name, icon_name')
    .order('name');

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.json({ categories: data });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories };
