const { supabaseAdmin } = require('../config/supabase');

/**
 * Upload a generic file to Supabase Storage.
 *
 * @param {string} bucket - The name of the storage bucket
 * @param {string} filePath - Path/filename inside the bucket
 * @param {Buffer} fileBuffer - The file content buffer
 * @param {string} mimetype - The file MIME type
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadFile = async (bucket, filePath, fileBuffer, mimetype) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Delete a file from Supabase Storage.
 *
 * @param {string} bucket - The name of the storage bucket
 * @param {string} filePath - Path/filename inside the bucket
 */
const deleteFile = async (bucket, filePath) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Supabase storage delete failed: ${error.message}`);
  }
};

/**
 * Upload a product image.
 * Path format: sellerId/productId/timestamp_filename
 */
const uploadProductImage = async (sellerId, productId, fileBuffer, mimetype, originalName) => {
  const fileExt = originalName ? originalName.split('.').pop() : 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${sellerId}/${productId}/${fileName}`;
  return await uploadFile('products', filePath, fileBuffer, mimetype);
};

/**
 * Upload a profile avatar.
 * Path format: userId/avatar_timestamp.ext
 */
const uploadProfileAvatar = async (userId, fileBuffer, mimetype, originalName) => {
  const fileExt = originalName ? originalName.split('.').pop() : 'jpg';
  const fileName = `avatar_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  return await uploadFile('avatars', filePath, fileBuffer, mimetype);
};

/**
 * Upload a voice/audio file.
 * Path format: voice/userId_timestamp.ext
 */
const uploadAudioFile = async (userId, fileBuffer, mimetype, originalName) => {
  // Common mime types: audio/wav, audio/mpeg, audio/webm, etc.
  const fileExt = originalName ? originalName.split('.').pop() : 'wav';
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;
  return await uploadFile('audio', filePath, fileBuffer, mimetype);
};

module.exports = {
  uploadFile,
  deleteFile,
  uploadProductImage,
  uploadProfileAvatar,
  uploadAudioFile,
};
