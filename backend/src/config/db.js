import dns from 'node:dns';
import { execSync } from 'node:child_process';
import mongoose from 'mongoose';

// Auto-configure active Windows network DNS or fallback
try {
  if (process.platform === 'win32') {
    const out = execSync('netsh interface ipv4 show dnsservers', { encoding: 'utf8', timeout: 2000 });
    const matches = out.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
    const valid = [...new Set(matches.filter(ip => !ip.startsWith('127.')))];
    if (valid.length > 0) {
      dns.setServers(valid);
    }
  } else if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (e) {
  // Ignore DNS setServers error in container environments
}

let isConnected = false;

const connectDB = async (retries = 3, delay = 2000) => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_pulse_db';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/nexus_pulse_db';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      });
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[MongoDB Warning] Attempt ${attempt}/${retries} failed on primary URI (${primaryErr.message}).`);
      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  // If primary URI failed and is not already local, attempt local MongoDB fallback
  if (primaryUri !== localFallbackUri) {
    try {
      console.log('[MongoDB] Primary database unreachable. Attempting local MongoDB connection (127.0.0.1:27017)...');
      const fallbackConn = await mongoose.connect(localFallbackUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      isConnected = true;
      console.log(`[MongoDB] Connected successfully to local fallback: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackErr) {
      console.error('[MongoDB Error] Local MongoDB fallback failed:', fallbackErr.message);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning] Connection lost. Attempting reconnection...');
  isConnected = false;
  setTimeout(() => {
    connectDB(3, 2000).catch(() => {});
  }, 2000);
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error Event]:', err.message);
});

export const getDbStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null
});

export default connectDB;
