import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from server root directory
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Environment variables loaded from:', envPath);
}

/**
 * Centralized environment configuration
 * All environment variables should be accessed through this module
 */
const env = {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5001,

    // Database
    MONGO_URI: process.env.MONGO_URI,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,

    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret-change-in-production',

    // Cloudinary
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // Payment (Digistore24)
    DIGISTORE_VENDOR_ID: process.env.DIGISTORE_VENDOR_ID,
    DIGISTORE_IPN_PASSPHRASE: process.env.DIGISTORE_IPN_PASSPHRASE,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required Cloudinary credentials
if (!env.CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  WARNING: Cloudinary credentials not fully configured!');
    console.warn('   CLOUD_NAME:', env.CLOUD_NAME ? '✓ Set' : '✗ Missing');
    console.warn('   CLOUDINARY_API_KEY:', env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
    console.warn('   CLOUDINARY_API_SECRET:', env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
} else {
    console.log('✓ Cloudinary credentials loaded successfully');
}

// Validate payment configuration
if (!env.DIGISTORE_VENDOR_ID || !env.DIGISTORE_IPN_PASSPHRASE) {
    console.warn('⚠️  WARNING: Digistore24 payment not fully configured!');
    console.warn('   DIGISTORE_VENDOR_ID:', env.DIGISTORE_VENDOR_ID ? '✓ Set' : '✗ Missing');
    console.warn('   DIGISTORE_IPN_PASSPHRASE:', env.DIGISTORE_IPN_PASSPHRASE ? '✓ Set' : '✗ Missing');
    console.warn('   Paid content purchases will NOT work without these.');
} else {
    console.log('✓ Digistore24 payment configured');
}

export default env;

