// File: config/env.js
import dns from "dns";

// Force IPv4 DNS resolution IMMEDIATELY - before any other imports
dns.setDefaultResultOrder("ipv4first");
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

import { configDotenv } from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
const envPath = join(__dirname, '../.env');
const result = configDotenv({ path: envPath });

if (result.error) {
  console.warn('⚠️ Warning: Could not load .env file:', result.error.message);
  console.log('📁 Looking for .env at:', envPath);
} else {
  console.log('✅ Environment variables loaded successfully');
  console.log('📊 Loaded', Object.keys(result.parsed || {}).length, 'environment variables');
}

export default result;