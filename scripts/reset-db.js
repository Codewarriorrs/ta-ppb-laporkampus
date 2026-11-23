const fs = require('fs');
const path = require('path');
const { Client } = require('@neondatabase/serverless');

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

console.log('Menghubungkan ke Neon PostgreSQL untuk reset total...');

async function resetDb() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  console.log('Terhubung ke database Neon.');

  // 1. Bersihkan tabel
  console.log('Membersihkan data lama (TRUNCATE reports, facilities, users CASCADE)...');
  await client.query('TRUNCATE TABLE reports, facilities, users CASCADE;');

  // 2. Eksekusi Schema
  const schemaPath = path.join(__dirname, '..', 'neon', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Memastikan schema terbaru terpasang...');
  await client.query(schemaSql);

  // 3. Eksekusi Seed Baru
  const seedPath = path.join(__dirname, '..', 'neon', 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  console.log('Memasukkan data fasilitas & laporan Departemen Teknik Komputer Undip...');
  await client.query(seedSql);

  // 4. Verifikasi
  const usersRes = await client.query('SELECT count(*) FROM users');
  const facilitiesRes = await client.query('SELECT count(*) FROM facilities');
  const reportsRes = await client.query('SELECT count(*) FROM reports');

  console.log('Hasil Reset Database Neon:');
  console.log(`- Jumlah User: ${usersRes.rows[0].count}`);
  console.log(`- Jumlah Fasilitas: ${facilitiesRes.rows[0].count}`);
  console.log(`- Jumlah Laporan: ${reportsRes.rows[0].count}`);

  await client.end();
  console.log('Reset database Neon selesai dengan sukses!');
}

resetDb().catch((err) => {
  console.error('Gagal mereset database:', err);
  process.exit(1);
});
