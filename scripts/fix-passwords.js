const { Client } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
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
  const hashMahasiswa = bcrypt.hashSync('mahasiswa123', 10);
  const hashBirokrasi = bcrypt.hashSync('birokrasi123', 10);
  
  await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashMahasiswa, 'zaidan@kampus.ac.id']);
  await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashBirokrasi, 'budi@kampus.ac.id']);
  
  console.log('Password updated successfully:');
  console.log('- zaidan@kampus.ac.id -> mahasiswa123');
  console.log('- budi@kampus.ac.id -> birokrasi123');
  
  await client.end();
}

run().catch(console.error);
