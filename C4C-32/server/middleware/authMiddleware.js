const { supabase, supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * protect — validates the Bearer token from the Authorization header.
 * Attaches req.user (Supabase auth user) on success.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized — no token provided'));
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401);
    return next(new Error('Not authorized — invalid or expired token'));
  }

  req.user = user;
  next();
});

/**
 * requireSeller — must run after protect.
 * Rejects non-seller roles by checking the profiles table.
 */
const requireSeller = asyncHandler(async (req, res, next) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || !profile || profile.role !== 'seller') {
    res.status(403);
    return next(new Error('Forbidden — seller account required'));
  }

  next();
});

module.exports = { protect, requireSeller };
