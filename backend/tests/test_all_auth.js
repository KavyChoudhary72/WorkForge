process.env.NODE_ENV = 'test';
import connectDB from '../src/config/db.js';
import app from '../src/server.js';
import User from '../src/models/User.js';
import Organization from '../src/models/Organization.js';
import Session from '../src/models/Session.js';

let server;

const runTests = async () => {
  try {
    await connectDB();
    server = app.listen(5005, async () => {
      console.log('Test server active on port 5005');
      const BASE_URL = 'http://localhost:5005/api/auth';

      // Clean up previous test users
      await User.deleteMany({ email: { $in: ['testcompany@acme.com', 'testemp@acme.com'] } });
      await Organization.deleteMany({ name: 'Test Acme Corp' });

      // 1. Test Company Registration
      console.log('\n--- 1. Testing Company Registration ---');
      const regRes = await fetch(`${BASE_URL}/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Acme Admin',
          email: 'testcompany@acme.com',
          password: 'Password@123',
          companyName: 'Test Acme Corp'
        })
      });
      const regData = await regRes.json();
      console.log('Register Response Status:', regRes.status);
      console.log('Register Message:', regData.message);
      console.log('Verification Token Generated:', !!regData.verificationToken);

      if (!regRes.ok) throw new Error(`Registration failed: ${regData.message}`);

      // 2. Test Email Verification
      console.log('\n--- 2. Testing Email Verification ---');
      const verifRes = await fetch(`${BASE_URL}/verify-email?token=${regData.verificationToken}`, {
        method: 'GET'
      });
      const verifData = await verifRes.json();
      console.log('Verification Response Status:', verifRes.status);
      console.log('Verification Message:', verifData.message);

      if (!verifRes.ok) throw new Error(`Verification failed: ${verifData.message}`);

      // 3. Test Company Login
      console.log('\n--- 3. Testing Company Admin Login ---');
      const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testcompany@acme.com',
          password: 'Password@123',
          rememberMe: true
        })
      });
      const cookies = loginRes.headers.get('set-cookie');
      const loginData = await loginRes.json();
      console.log('Login Response Status:', loginRes.status);
      console.log('Login User Role:', loginData.user?.role);
      console.log('Access Token Received:', !!loginData.accessToken);
      console.log('Set-Cookie Refresh Token Received:', !!cookies);

      if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

      // 4. Test Super Admin Login (/admin-login)
      console.log('\n--- 4. Testing Super Admin Login ---');
      let superAdmin = await User.findOne({ email: 'kavychoudhary49@gmail.com' });
      if (!superAdmin) {
        superAdmin = await User.create({
          name: 'Kavy Choudhary',
          email: 'kavychoudhary49@gmail.com',
          password: 'SuperAdminPass@2026',
          role: 'SUPER_ADMIN',
          isEmailVerified: true,
          accountStatus: 'Active'
        });
      } else {
        superAdmin.password = 'SuperAdminPass@2026';
        await superAdmin.save();
      }

      const superLoginRes = await fetch(`${BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'kavychoudhary49@gmail.com',
          password: 'SuperAdminPass@2026'
        })
      });
      const superLoginData = await superLoginRes.json();
      console.log('Super Admin Login Status:', superLoginRes.status);
      console.log('Super Admin Role:', superLoginData.user?.role);

      if (!superLoginRes.ok) throw new Error(`Super Admin Login failed: ${superLoginData.message}`);

      // 5. Test Normal User trying to authenticate via /admin-login (MUST FAIL with 403)
      console.log('\n--- 5. Testing Normal User blocked on /admin-login ---');
      const badAdminRes = await fetch(`${BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testcompany@acme.com',
          password: 'Password@123'
        })
      });
      const badAdminData = await badAdminRes.json();
      console.log('Blocked Normal User Status:', badAdminRes.status);
      console.log('Blocked Normal User Message:', badAdminData.message);

      if (badAdminRes.status !== 403) throw new Error('Normal user was NOT blocked on /admin-login!');

      // 6. Test Silent Token Refresh with Cookie
      console.log('\n--- 6. Testing Token Refresh ---');
      const refreshRes = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        }
      });
      const refreshData = await refreshRes.json();
      console.log('Refresh Response Status:', refreshRes.status);
      console.log('New Access Token Issued:', !!refreshData.accessToken);

      if (!refreshRes.ok) throw new Error(`Refresh failed: ${refreshData.message}`);

      console.log('\n=============================================');
      console.log('ALL AUTHENTICATION API TESTS PASSED 100%!');
      console.log('=============================================\n');

      server.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('Test script failed with error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
