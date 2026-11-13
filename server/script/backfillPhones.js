// scripts/backfillPhones.js
import mongoose from "mongoose";
import User from "../src/model/User.js";
import { generateUniqueNigerianPhone } from "../src/utils/nigerianPhone.js";
import { env } from "../src/config/constant.js";

const run = async () => {
  await mongoose.connect(env.mongo_uri);

  const usersWithoutPhone = await User.find({
    $or: [{ phone: { $exists: false } }, { phone: null }, { phone: "" }],
  });

  console.log(`Found ${usersWithoutPhone.length} users without phone`);

  for (const user of usersWithoutPhone) {
    let assigned = false;
    for (let i = 0; i < 5 && !assigned; i++) {
      try {
        user.phone = await generateUniqueNigerianPhone();
        await user.save();
        assigned = true;
        console.log(`Assigned ${user.phone} to ${user.email}`);
      } catch (err) {
        if (err?.code === 11000 && err?.keyPattern?.phone) continue;
        throw err;
      }
    }
    if (!assigned) {
      console.error(`Failed to assign phone to ${user.email}`);
    }
  }

  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});