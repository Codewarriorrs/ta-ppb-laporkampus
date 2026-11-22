const fs = require('fs');
const path = require('path');
const { Client } = require('@neondatabase/serverless');

// Baca .env.local untuk mendapatkan DATABASE_URL
const envPath = path.join(__dirname, '..', '.env.local');
let databaseUrl = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^#?\s*DATABASE_URL=(.+)$/m);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL || '';
}

if (!databaseUrl) {
  console.error('DATABASE_URL tidak ditemukan di .env.local');
  process.exit(1);
}

console.log('Menghubungkan ke Neon PostgreSQL...');

async function migrate() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  console.log('Terhubung ke database Neon.');

  // 1. Eksekusi Schema
  const schemaPath = path.join(__dirname, '..', 'neon', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Menjalankan schema.sql...');
  await client.query(schemaSql);
  console.log('Tabel users, facilities, dan reports berhasil dibuat!');

  // 2. Eksekusi Seed
  const seedPath = path.join(__dirname, '..', 'neon', 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  console.log('Menjalankan seed.sql...');
  await client.query(seedSql);
  console.log('Data seed (10 fasilitas, 2 user, 5 laporan) berhasil dimasukkan!');

  // 3. Verifikasi
  const usersRes = await client.query('SELECT count(*) FROM users');
  const facilitiesRes = await client.query('SELECT count(*) FROM facilities');
  const reportsRes = await client.query('SELECT count(*) FROM reports');

  console.log('Verifikasi data di Neon:');
  console.log(`- Jumlah User: ${usersRes.rows[0].count}`);
  console.log(`- Jumlah Fasilitas: ${facilitiesRes.rows[0].count}`);
  console.log(`- Jumlah Laporan: ${reportsRes.rows[0].count}`);

  await client.end();
  console.log('Migrasi selesai dengan sukses!');
}

migrate().catch((err) => {
  console.error('Gagal menjalankan migrasi:', err);
  process.exit(1);
});
