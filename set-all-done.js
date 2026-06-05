// =============================================
//  set-all-done.js
//  Suntik status "done" semua sesi untuk 1 klien
//  Usage: node set-all-done.js <slug-klien>
//  Contoh: node set-all-done.js siti-lampung
// =============================================

const mongoose = require('mongoose');

// ── Ambil slug dari argumen CLI ──────────────────────────────
const slug = process.argv[2];
if (!slug) {
  console.error('❌  Harap masukkan slug klien.\n   Contoh: node set-all-done.js siti-lampung');
  process.exit(1);
}

// ── Koneksi MongoDB (dari .env.local) ───────────────────────
const MONGODB_URI =
  'mongodb+srv://defritanababan0_db_user:WXNhBLW2c21QYzyQ@cluster0.fqev8tf.mongodb.net/joki_db?retryWrites=true&w=majority';

// ── Schema (minimal, biar gak perlu import TS) ──────────────
const SessionSchema = new mongoose.Schema({
  sessionNumber: Number,
  type: String,
  price: Number,
  status: { type: String, default: 'antrian' },
  isPaid: { type: Boolean, default: false },
});

const CourseSchema = new mongoose.Schema({
  courseName: String,
  sessions: [SessionSchema],
});

const CustomerSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  courses: [CourseSchema],
  createdAt: Date,
});

const Customer =
  mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔌  Konek ke MongoDB...`);
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Terhubung!\n');

  const customer = await Customer.findOne({ slug });
  if (!customer) {
    console.error(`❌  Klien dengan slug "${slug}" tidak ditemukan.`);
    process.exit(1);
  }

  console.log(`👤  Klien ditemukan: ${customer.name} (${customer.slug})`);
  console.log(`📚  Jumlah matkul  : ${customer.courses.length}`);

  let totalSesi = 0;
  let sudahDone = 0;

  // Set semua sesi → done
  for (const course of customer.courses) {
    for (const session of course.sessions) {
      if (session.status === 'done') {
        sudahDone++;
      }
      session.status = 'done';
      totalSesi++;
    }
  }

  await customer.save();

  console.log(`\n🎉  Selesai!`);
  console.log(`   Total sesi diupdate : ${totalSesi}`);
  console.log(`   Sudah done sebelumnya: ${sudahDone}`);
  console.log(`   Baru di-set done     : ${totalSesi - sudahDone}`);
  console.log(`\n✔  Semua sesi ${customer.name} sekarang berstatus "done".\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('💥  Error:', err.message);
  process.exit(1);
});