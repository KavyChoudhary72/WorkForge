import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

console.log('\n======================================================');
console.log('       CLOUDINARY CONFIGURATION DIAGNOSTIC TOOL       ');
console.log('======================================================\n');

console.log('Checking environment variables in backend/.env:');
console.log(`- CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME ? CLOUDINARY_CLOUD_NAME : '[NOT SET]'}`);
console.log(`- CLOUDINARY_API_KEY:    ${CLOUDINARY_API_KEY ? CLOUDINARY_API_KEY.slice(0, 4) + '...' + CLOUDINARY_API_KEY.slice(-4) : '[NOT SET]'}`);
console.log(`- CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET ? '********' : '[NOT SET]'}\n`);

const isPlaceholder = (val) => !val || val.includes('your_') || val.includes('paste_');

if (isPlaceholder(CLOUDINARY_CLOUD_NAME) || isPlaceholder(CLOUDINARY_API_KEY) || isPlaceholder(CLOUDINARY_API_SECRET)) {
  console.log('⚠️  CLOUDINARY IS NOT FULLY CONFIGURED YET.');
  console.log('To activate Cloudinary:');
  console.log('1. Go to your Cloudinary Console: https://console.cloudinary.com/pm');
  console.log('2. Copy your "Cloud Name", "API Key", and "API Secret"');
  console.log('3. Open backend/.env and paste them into:');
  console.log('     CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('     CLOUDINARY_API_KEY=your_api_key');
  console.log('     CLOUDINARY_API_SECRET=your_api_secret');
  console.log('\n(Note: The SaaS system will automatically use local disk storage in /uploads until Cloudinary is configured.)\n');
  process.exit(0);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

const runDiagnostics = async () => {
  try {
    console.log('Testing Cloudinary API connection...');
    const pingRes = await cloudinary.api.ping();
    console.log('  [PASS] Cloudinary API Ping successful:', pingRes.status);

    console.log('Testing asset upload with sample 1x1 test image...');
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await cloudinary.uploader.upload(sampleBase64, {
      folder: 'workforge/tests',
      public_id: `test-diagnostic-${Date.now()}`
    });
    console.log('  [PASS] Sample upload succeeded! URL:', uploadRes.secure_url);

    console.log('Cleaning up diagnostic test asset...');
    await cloudinary.uploader.destroy(uploadRes.public_id);
    console.log('  [PASS] Test asset cleaned up successfully.');

    console.log('\n======================================================');
    console.log('🎉 SUCCESS: Cloudinary is 100% active and ready for SaaS production!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ CLOUDINARY VERIFICATION FAILED:');
    console.error('Error message:', err.message);
    console.error('\nPossible causes:');
    console.error('1. The API Secret or API Key contains a typo or extra whitespace.');
    console.error('2. Cloud Name does not match your account.');
    console.error('3. Check your Cloudinary dashboard: https://console.cloudinary.com/pm\n');
  }
};

runDiagnostics();
