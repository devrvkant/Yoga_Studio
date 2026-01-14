import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

// Configure Cloudinary using centralized env
cloudinary.config({
    cloud_name: env.CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

// Debug log to verify configuration
console.log('Cloudinary configured with:');
console.log('  cloud_name:', env.CLOUD_NAME);
console.log('  api_key:', env.CLOUDINARY_API_KEY ? `${env.CLOUDINARY_API_KEY.substring(0, 4)}...` : 'NOT SET');
console.log('  api_secret:', env.CLOUDINARY_API_SECRET ? '***' : 'NOT SET');

export default cloudinary;
