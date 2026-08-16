require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Listing = require('../models/Listing');
const Service = require('../models/Service');

const apply = process.argv.includes('--apply');

const run = async () => {
  await connectDB();
  const listingFilter = {
    $or: [
      { priceMinor: null },
      { quantity: { $exists: false } },
      { fulfilmentMethods: { $exists: false } },
      { lifecycleStatus: { $exists: false } },
    ],
  };
  const serviceFilter = {
    $or: [
      { priceMinor: null },
      { fulfilmentMethods: { $exists: false } },
      { location: { $exists: false } },
    ],
  };
  const [matchingListings, matchingServices] = await Promise.all([
    Listing.countDocuments(listingFilter),
    Service.countDocuments(serviceFilter),
  ]);

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', matchingListings, matchingServices }));
    return;
  }

  const [listings, services] = await Promise.all([
    Listing.updateMany(listingFilter, [{
      $set: {
        priceMinor: { $ifNull: ['$priceMinor', { $round: [{ $multiply: ['$price', 100] }, 0] }] },
        quantity: { $ifNull: ['$quantity', 1] },
        campus: { $ifNull: ['$campus', 'University of Cape Coast'] },
        location: { $ifNull: ['$location', ''] },
        fulfilmentMethods: { $cond: [{ $gt: [{ $size: { $ifNull: ['$fulfilmentMethods', []] } }, 0] }, '$fulfilmentMethods', ['campus_pickup', 'public_meetup']] },
        lifecycleStatus: { $ifNull: ['$lifecycleStatus', { $cond: ['$isActive', 'active', 'archived'] }] },
      },
    }]),
    Service.updateMany(serviceFilter, [{
      $set: {
        priceMinor: { $ifNull: ['$priceMinor', { $round: [{ $multiply: ['$price', 100] }, 0] }] },
        campus: { $ifNull: ['$campus', 'University of Cape Coast'] },
        location: { $ifNull: ['$location', ''] },
        fulfilmentMethods: { $cond: [{ $gt: [{ $size: { $ifNull: ['$fulfilmentMethods', []] } }, 0] }, '$fulfilmentMethods', ['public_meetup', 'digital']] },
      },
    }]),
  ]);

  console.log(JSON.stringify({
    mode: 'apply',
    listings: { matched: listings.matchedCount, modified: listings.modifiedCount },
    services: { matched: services.matchedCount, modified: services.modifiedCount },
  }));
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
