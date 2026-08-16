require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Service = require('../models/Service');

const apply = process.argv.includes('--apply');

const run = async () => {
  await connectDB();
  const filter = { category: 'Assignment Help' };
  const count = await Service.countDocuments(filter);

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', matchingServices: count }));
    return;
  }

  const result = await Service.updateMany(filter, { $set: { category: 'Academic Support' } });
  console.log(JSON.stringify({ mode: 'apply', matched: result.matchedCount, modified: result.modifiedCount }));
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
