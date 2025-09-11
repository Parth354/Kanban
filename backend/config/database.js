import './env.js';
import { Sequelize } from "sequelize";

// Debug: Check if DATABASE_URL is loaded
console.log('🔍 DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('📝 Available env vars:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('DATABASE')));
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: { 
      require: true, 
      rejectUnauthorized: false 
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Test connection immediately
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err.message);
    // Don't exit here, let the app handle it
  });

export default sequelize;