const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prism_surat';
const dbName = process.env.DB_NAME || 'prism_surat';

const client = new MongoClient(mongoURI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ MongoDB Connected successfully on: ${mongoURI}`);
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error('Database not connected yet!');
  return db;
}

module.exports = { connectDB, getDB };