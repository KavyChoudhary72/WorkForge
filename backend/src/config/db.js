import dns from 'node:dns';
dns.setServers(['1.1.1.1', '1.0.0.1']);
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_pulse_db';
    let conn;
    try {
      conn = await mongoose.connect(mongoUri);
    } catch (primaryErr) {
      console.warn(`[MongoDB Warning] Primary connection failed (${primaryErr.message}). Trying fallback local database...`);
      conn = await mongoose.connect('mongodb://127.0.0.1:27017/nexus_pulse_db');
    }
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
