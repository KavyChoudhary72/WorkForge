import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import Organization from './src/models/Organization.js';

dotenv.config();

const verifyCompanies = async () => {
  try {
    await connectDB();
    console.log('[Verification] Connected to MongoDB.');

    const organizations = await Organization.find({
      slug: { $in: [
        'nova-tech-solutions',
        'apex-digital-marketing',
        'vortex-biotech',
        'horizon-real-estate',
        'quantum-financial-systems',
        'zion-logistics-corp',
        'stellar-creative-studio',
        'beacon-e-commerce',
        'ironclad-cyber-security',
        'greenlife-renewable-energy'
      ]}
    });

    console.log(`\n--- Fetched ${organizations.length} Companies from MongoDB ---\n`);
    organizations.forEach((org, idx) => {
      console.log(`${idx + 1}. Name: ${org.name}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Industry: ${org.industry}`);
      console.log(`   Plan: ${org.plan}`);
      console.log(`   Status: ${org.status}`);
      console.log(`   MRR: ₹${org.mrr}`);
      console.log('----------------------------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('[Verification Error]', error);
    process.exit(1);
  }
};

verifyCompanies();
