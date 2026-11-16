import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const initDatabase = async () => {
  try {
    await connectDB();

    console.log('[Init] Ensuring platform administrator account exists...');

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'kavychoudhary49@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminPass@2026';

    let superAdmin = await User.findOne({ email: superAdminEmail.toLowerCase() });
    if (!superAdmin) {
      superAdmin = await User.create({
        organizationId: null,
        name: 'Kavy Choudhary',
        email: superAdminEmail.toLowerCase(),
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        department: 'Platform Governance',
        designation: 'Super Administrator',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['ALL_SUPER_ADMIN_PERMISSIONS', 'GOVERNANCE_ALL']
      });
      console.log(`[Init] Super Admin created: ${superAdmin.email}`);
    } else {
      console.log(`[Init] Super Admin exists: ${superAdmin.email}`);
    }

    console.log('[Init] Clean database ready. No mock or seed data injected.');
  } catch (error) {
    console.error('[Init Error]:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

initDatabase();
