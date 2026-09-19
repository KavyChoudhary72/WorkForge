import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from './src/config/db.js';
import Organization from './src/models/Organization.js';

dotenv.config();

const importCompanies = async () => {
  try {
    await connectDB();
    console.log('[Import] Connected to MongoDB.');

    // Read the companies.json file
    const filePath = path.join(process.cwd(), 'companies.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const companies = JSON.parse(rawData);

    console.log(`[Import] Found ${companies.length} companies in JSON.`);

    // Insert or update companies in the database
    for (const company of companies) {
      const existing = await Organization.findOne({ slug: company.slug });
      if (existing) {
        await Organization.findByIdAndUpdate(existing._id, company);
        console.log(`[Import] Updated organization: ${company.name}`);
      } else {
        await Organization.create(company);
        console.log(`[Import] Created organization: ${company.name}`);
      }
    }

    console.log('\n======================================================');
    console.log('COMPANIES IMPORTED SUCCESSFULLY TO MONGODB DATABASE');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('[Import Error]', error);
    process.exit(1);
  }
};

importCompanies();
