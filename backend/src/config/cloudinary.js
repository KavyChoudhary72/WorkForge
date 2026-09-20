import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Initialize Cloudinary SDK
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('your_')) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Check if valid Cloudinary credentials are provided in environment
 */
export const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('your_')) {
    return true;
  }
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    !CLOUDINARY_CLOUD_NAME.includes('your_') &&
    !CLOUDINARY_API_KEY.includes('your_') &&
    !CLOUDINARY_API_SECRET.includes('your_')
  );
};

/**
 * Upload a local file to Cloudinary with automatic cleanup of temp local file
 * @param {string} filePath - Local absolute or relative path to file
 * @param {string} folder - Destination folder on Cloudinary
 * @param {object} options - Additional Cloudinary upload options
 */
export const uploadFileToCloudinary = async (filePath, folder = 'workforge/files', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      ...options
    });

    // Remove local temp file from disk if upload succeeded to save disk space
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn('[Cloudinary] Could not unlink temp file:', unlinkErr.message);
      }
    }

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('[Cloudinary] File upload error:', error.message);
    throw error;
  }
};

/**
 * Upload base64 / data-URI (for cropped logos and user avatars)
 * @param {string} base64Data - Data URI string e.g. data:image/png;base64,...
 * @param {string} folder - Destination folder on Cloudinary
 */
export const uploadBase64ToCloudinary = async (base64Data, folder = 'workforge/logos') => {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'image'
    });
    return {
      url: result.secure_url || result.url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('[Cloudinary] Base64 upload error:', error.message);
    throw error;
  }
};

/**
 * Delete an asset from Cloudinary by publicId
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} resourceType - 'image', 'video', or 'raw'
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return res;
  } catch (error) {
    console.warn(`[Cloudinary] Failed to delete asset '${publicId}':`, error.message);
    return null;
  }
};

export default cloudinary;
