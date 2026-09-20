import dns from 'node:dns';
import mongoose from 'mongoose';

// Only set custom DNS fallback in local development; containers use their own network resolver
try {
  if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    dns.setServers(['1.1.1.1', '1.0.0.1']);
  }
} catch (e) {
  // Ignore DNS setServers error in container environments
}

let isConnected = false;

const connectDB = async (retries = 5, delay = 3000) => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_pulse_db';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[MongoDB Warning] Attempt ${attempt}/${retries} failed (${primaryErr.message}).`);
      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('[MongoDB Error] All connection attempts failed. Server remaining online in fallback mode.');
      }
    }
  }
};

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null
});

export default connectDB;
