import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.js';

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadPdfToCloudinary(buffer: Buffer, key: string): Promise<{ url: string; publicId: string }> {
  const folder = ENV.CLOUDINARY_FOLDER?.replace(/\/$/, '') || '';
  const public_id = folder ? `${folder}/${key}` : key;
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id, overwrite: false },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url!, publicId: result.public_id! });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}
