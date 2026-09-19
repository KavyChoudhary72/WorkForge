import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Organization from './models/Organization.js';

dotenv.config();

const resetAvatars = async () => {
  try {
    await connectDB();
    const uRes = await User.updateMany({}, { $set: { profileImage: '' } });
    console.log('[Reset] Cleared user profileImages:', uRes.modifiedCount);
    const oRes = await Organization.updateMany({}, { $set: { logo: '' } });
    console.log('[Reset] Cleared organization logos:', oRes.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('[Reset Error]', err);
    process.exit(1);
  }
};

resetAvatars();
