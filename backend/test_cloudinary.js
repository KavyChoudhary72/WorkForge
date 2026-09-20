import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const { CLOUDINARY_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

console.log('\n======================================================');
console.log('       CLOUDINARY CONFIGURATION DIAGNOSTIC TOOL       ');
console.log('======================================================\n');

console.log('Checking environment variables in backend/.env:');
if (CLOUDINARY_URL) {
  console.log(`- CLOUDINARY_URL:        ${CLOUDINARY_URL.split('@')[0]}@***`);
}
console.log(`- CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME ? CLOUDINARY_CLOUD_NAME : '[NOT SET]'}`);
console.log(`- CLOUDINARY_API_KEY:    ${CLOUDINARY_API_KEY ? CLOUDINARY_API_KEY.slice(0, 4) + '...' + CLOUDINARY_API_KEY.slice(-4) : '[NOT SET]'}`);
console.log(`- CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET ? '********' : '[NOT SET]'}\n`);

const isPlaceholder = (val) => !val || val.includes('your_') || val.includes('paste_');

if (!CLOUDINARY_URL && (isPlaceholder(CLOUDINARY_CLOUD_NAME) || isPlaceholder(CLOUDINARY_API_KEY) || isPlaceholder(CLOUDINARY_API_SECRET))) {
  console.log('⚠️  CLOUDINARY IS NOT FULLY CONFIGURED YET.');
  console.log('To activate Cloudinary:');
  console.log('1. Go to your Cloudinary Console: https://console.cloudinary.com/pm');
  console.log('2. Copy your "Cloud Name", "API Key", and "API Secret"');
  console.log('3. Open backend/.env and paste them into:');
  console.log('     CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('     CLOUDINARY_API_KEY=your_api_key');
  console.log('     CLOUDINARY_API_SECRET=your_api_secret');
  console.log('\n(Note: The SaaS system automatically uses local disk storage in /uploads until Cloudinary is configured.)\n');
  process.exit(0);
}

if (CLOUDINARY_URL && !CLOUDINARY_URL.includes('your_')) {
  cloudinary.config({ cloudinary_url: CLOUDINARY_URL, secure: true });
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
}

const runDiagnostics = async () => {
  try {
    console.log('Testing Cloudinary API connection...');
    const pingRes = await cloudinary.api.ping();
    console.log('  [PASS] Cloudinary API Ping successful:', pingRes.status || 'OK');

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
    const errorMsg = err.error?.message || err.message || JSON.stringify(err);
    console.error('\n❌ CLOUDINARY VERIFICATION FAILED:');
    console.error('Error message:', errorMsg);

    if (errorMsg.includes('cloud_name mismatch') || (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME.toLowerCase() === 'root')) {
      console.error('\n⚠️  ACTION REQUIRED: "Root" is NOT your Cloud Name.');
      console.error('In Cloudinary, "Root" is just the folder name shown in your Media Library.');
      console.error('\nHow to find your actual Cloud Name:');
      console.error('1. Open your Cloudinary Console: https://console.cloudinary.com/pm');
      console.error('2. Look at the top bar or under "Product Environment Settings" -> "API Keys"');
      console.error('3. Look at your "API Environment variable":');
      console.error('      cloudinary://<api_key>:<api_secret>@<YOUR_REAL_CLOUD_NAME>');
      console.error('4. The word after the "@" symbol is your real Cloud Name (usually a short code or unique word).');
      console.error('5. Replace CLOUDINARY_CLOUD_NAME=Root in backend/.env with that word!\n');
    } else {
      console.error('\nPossible causes:');
      console.error('1. The API Secret or API Key contains a typo or extra whitespace.');
      console.error('2. Cloud Name does not match your account.');
      console.error('3. Check your Cloudinary dashboard: https://console.cloudinary.com/pm\n');
    }
  }
};

runDiagnostics();
