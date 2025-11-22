/**
 * Supabase Storage Helper
 * Handles image uploads to Supabase Storage bucket
 */

import { getSupabaseClient } from '@/lib/supabase';

const STORAGE_BUCKET = 'funeral_process';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a single image file to Supabase Storage
 * @param file - File object to upload
 * @param folder - Optional folder path within bucket
 * @returns Public URL of uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = ''
): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = folder
    ? `${folder}/${timestamp}-${randomString}.${fileExtension}`
    : `${timestamp}-${randomString}.${fileExtension}`;

  try {
    // Get Supabase client (this will throw if env vars are missing)
    const supabase = getSupabaseClient();

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[STORAGE] Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

    console.log('[STORAGE] Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[STORAGE] Upload error:', error);
    throw error;
  }
}

/**
 * Uploads multiple image files to Supabase Storage
 * @param files - Array of File objects to upload
 * @param folder - Optional folder path within bucket
 * @returns Array of public URLs of uploaded images
 */
export async function uploadMultipleImagesToStorage(
  files: File[],
  folder: string = ''
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImageToStorage(file, folder)
  );
  const urls = await Promise.all(uploadPromises);
  return urls;
}

/**
 * Deletes an image from Supabase Storage
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Get Supabase client (this will throw if env vars are missing)
    const supabase = getSupabaseClient();

    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('[STORAGE] Delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    console.log('[STORAGE] Image deleted successfully:', fileName);
  } catch (error) {
    console.error('[STORAGE] Delete error:', error);
    throw error;
  }
}
