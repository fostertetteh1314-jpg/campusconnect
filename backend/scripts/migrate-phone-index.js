require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { normalizeGhanaPhone } = require('../utils/phone');

const apply = process.argv.includes('--apply');

const run = async () => {
  await connectDB();
  const users = await User.find({ phone: { $type: 'string', $ne: '' } }).select('_id phone').lean();
  const groups = new Map();

  for (const user of users) {
    const normalized = normalizeGhanaPhone(user.phone);
    groups.set(normalized, [...(groups.get(normalized) || []), user]);
  }

  const duplicates = [...groups.entries()]
    .filter(([, matches]) => matches.length > 1)
    .map(([phone, matches]) => ({ phone, userIds: matches.map((user) => user._id.toString()) }));
  const updates = users.filter((user) => normalizeGhanaPhone(user.phone) !== user.phone);
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', users: users.length, updates: updates.length, duplicates }, null, 2));

  if (!apply) return;
  if (duplicates.length) throw new Error('Resolve duplicate phone numbers before applying this migration');

  if (updates.length) {
    await User.bulkWrite(updates.map((user) => ({
      updateOne: { filter: { _id: user._id }, update: { $set: { phone: normalizeGhanaPhone(user.phone) } } },
    })));
  }

  await User.collection.createIndex(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $type: 'string', $ne: '' } }, name: 'phone_1' }
  );
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
