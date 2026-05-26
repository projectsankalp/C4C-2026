const mongoose = require('mongoose');
require('dotenv').config();

const DailyMetric = require('./src/models/DailyMetric');
const User = require('./src/models/User');

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Seeding 7 days of DailyMetric data...`);

    let count = 0;
    const now = new Date();

    for (const user of users) {
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        await DailyMetric.updateOne(
          { userId: user._id, date: d },
          {
            $set: {
              steps: Math.floor(Math.random() * 5000) + 3000,
              activeMins: Math.floor(Math.random() * 40) + 10,
              sleepHours: Math.floor(Math.random() * 3) + 5,
              sleepMins: Math.floor(Math.random() * 60),
              heartRate: Math.floor(Math.random() * 20) + 65,
            }
          },
          { upsert: true }
        );
        count++;
      }
    }

    console.log(`Successfully seeded ${count} DailyMetric documents.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedData();
