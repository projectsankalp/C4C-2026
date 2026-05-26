const { supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/feedback/product/:productId
 * Public.
 * Returns all reviews for a product, joining buyer profile details.
 */
const getProductFeedback = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .select(`
      id, rating, comment, voice_feedback_url, created_at,
      buyer:profiles!feedback_buyer_id_fkey(id, full_name, profile_pic_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ feedback: data || [] });
});

/**
 * GET /api/feedback/seller/:sellerId
 * Public.
 * Returns all reviews for a seller, joining buyer and product details.
 */
const getSellerFeedback = asyncHandler(async (req, res, next) => {
  const { sellerId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .select(`
      id, rating, comment, voice_feedback_url, created_at,
      buyer:profiles!feedback_buyer_id_fkey(id, full_name, profile_pic_url),
      product:products(id, title)
    `)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ feedback: data || [] });
});

/**
 * POST /api/feedback
 * Protected — buyer only.
 * Body: { product_id, seller_id, rating, comment, voice_feedback_url? }
 * Submits a new product/seller review.
 */
const createFeedback = asyncHandler(async (req, res, next) => {
  const { product_id, seller_id, rating, comment, voice_feedback_url } = req.body;

  if (!product_id || !seller_id || rating === undefined) {
    res.status(400);
    return next(new Error('product_id, seller_id, and rating are required'));
  }

  const rate = Number(rating);
  if (isNaN(rate) || rate < 1 || rate > 5) {
    res.status(400);
    return next(new Error('rating must be a number between 1 and 5'));
  }

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert({
      buyer_id: req.user.id,
      seller_id,
      product_id,
      rating: rate,
      comment: comment || null,
      voice_feedback_url: voice_feedback_url || null,
    })
    .select()
    .single();

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(201).json({ message: 'Feedback submitted successfully', feedback: data });
});

/**
 * PATCH /api/feedback/:id
 * Protected — buyer only.
 * Body: { rating?, comment?, voice_feedback_url? }
 * Updates an existing review.
 */
const updateFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment, voice_feedback_url } = req.body;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('feedback')
    .select('buyer_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404);
    return next(new Error('Feedback not found'));
  }

  if (existing.buyer_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you can only edit your own reviews'));
  }

  const updates = {};
  if (rating !== undefined) {
    const rate = Number(rating);
    if (isNaN(rate) || rate < 1 || rate > 5) {
      res.status(400);
      return next(new Error('rating must be a number between 1 and 5'));
    }
    updates.rating = rate;
  }
  if (comment !== undefined)     updates.comment = comment;
  if (voice_feedback_url !== undefined) updates.voice_feedback_url = voice_feedback_url;

  if (Object.keys(updates).length === 0) {
    res.status(400);
    return next(new Error('No valid fields provided for update'));
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('feedback')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    res.status(500);
    return next(new Error(updateError.message));
  }

  res.status(200).json({ message: 'Feedback updated successfully', feedback: updated });
});

/**
 * DELETE /api/feedback/:id
 * Protected — buyer only.
 * Deletes a review.
 */
const deleteFeedback = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('feedback')
    .select('buyer_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    res.status(404);
    return next(new Error('Feedback not found'));
  }

  if (existing.buyer_id !== req.user.id) {
    res.status(403);
    return next(new Error('Forbidden — you can only delete your own reviews'));
  }

  const { error } = await supabaseAdmin
    .from('feedback')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500);
    return next(new Error(error.message));
  }

  res.status(200).json({ message: 'Feedback deleted successfully' });
});

module.exports = {
  getProductFeedback,
  getSellerFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
