const { Client } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const client = new Client({ connectionString: match[1].trim() });

async function run() {
  await client.connect();
  console.log('Adding auth verification columns to users table...');
  
  await client.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS verification_otp TEXT,
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS google_id TEXT;
  `);

  // Ensure default demo users are marked as verified
  await client.query(`
    UPDATE users SET email_verified = true WHERE email IN ('zaidan@kampus.ac.id', 'budi@kampus.ac.id', 'isya@students.undip.ac.id');
  `);
  
  console.log('Columns email_verified, verification_otp, otp_expires_at, google_id added successfully!');
  await client.end();
}

run().catch(console.error);
