require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const apply = process.argv.includes('--apply');

const run = async () => {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('Set ADMIN_BOOTSTRAP_EMAIL to an existing, phone-verified user.');
  await connectDB();
  const user = await User.findOne({ email }).select('_id email role phoneVerifiedAt');
  if (!user) throw new Error('No user exists with ADMIN_BOOTSTRAP_EMAIL. Register that account first.');
  if (!user.phoneVerifiedAt) throw new Error('The bootstrap account must verify its phone before promotion.');

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', email: user.email, currentRole: user.role, eligible: true }));
    return;
  }

  if (user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
    await AuditLog.create({
      actorId: user._id,
      action: 'admin.bootstrap',
      targetType: 'user',
      targetId: user._id,
      metadata: { source: 'bootstrap-admin-script' },
    });
  }
  console.log(JSON.stringify({ mode: 'apply', email: user.email, role: user.role }));
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
