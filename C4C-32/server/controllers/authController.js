const { supabase, supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/signup
 * Body: { email, password, full_name, role, phone_number?, village?, district?, state? }
 */
const signup = asyncHandler(async (req, res, next) => {
  const { email, password, full_name, role, phone_number, village, district, state } = req.body;

  if (!email || !password || !full_name || !role) {
    res.status(400);
    return next(new Error('email, password, full_name, and role are required'));
  }

  if (!['buyer', 'seller'].includes(role)) {
    res.status(400);
    return next(new Error("role must be 'buyer' or 'seller'"));
  }

  // 1. Register via admin API — auto-confirms email so user.id is always returned
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role },
  });

  if (authError) {
    res.status(400);
    return next(new Error(authError.message));
  }

  const userId = authData.user?.id;

  if (!userId) {
    res.status(500);
    return next(new Error('User creation succeeded but no ID returned'));
  }

  // 2. Insert profile record using service role to bypass RLS on signup
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name,
      role,
      phone_number: phone_number || null,
      village: village || null,
      district: district || null,
      state: state || null,
    });

  if (profileError) {
    res.status(500);
    return next(new Error(`Profile creation failed: ${profileError.message}`));
  }

  // 3. Sign in immediately to return a valid session token
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });

  if (sessionError) {
    console.warn(`[KariGhar] Warning: Login after signup failed: ${sessionError.message}`);
  }

  res.status(201).json({
    message: 'Account created successfully',
    user: {
      id: userId,
      email,
      full_name,
      role,
      phone_number: phone_number || null,
      village: village || null,
      district: district || null,
      state: state || null,
    },
    session: sessionData?.session || null,
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('email and password are required'));
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    res.status(401);
    return next(new Error(error.message));
  }

  // Use supabaseAdmin to bypass RLS when fetching profile during login (stateless backend context)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('full_name, role, profile_pic_url')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    res.status(500);
    return next(new Error(`Profile fetch failed: ${profileError.message}`));
  }

  res.status(200).json({
    message: 'Login successful',
    user: {
      id: data.user.id,
      email: data.user.email,
      ...profile,
    },
    session: data.session,
  });
});

/**
 * GET /api/auth/profile
 * Protected — requires Bearer token.
 * Returns the authenticated user's profile.
 */
const getProfile = asyncHandler(async (req, res, next) => {
  // Use supabaseAdmin to bypass RLS when fetching profile
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    res.status(404);
    return next(new Error(`Profile not found: ${error.message}`));
  }

  res.status(200).json({ profile });
});

/**
 * PATCH /api/auth/profile
 * Protected — updates the authenticated user's profile.
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['full_name', 'phone_number', 'profile_pic_url', 'village', 'district', 'state', 'languages', 'bio'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(updates).length === 0) {
    res.status(400);
    return next(new Error('No valid fields provided for update'));
  }

  // Use supabaseAdmin to bypass RLS when updating profile
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    res.status(500);
    return next(new Error(`Profile update failed: ${error.message}`));
  }

  res.status(200).json({ message: 'Profile updated', profile });
});

module.exports = { signup, login, getProfile, updateProfile };
