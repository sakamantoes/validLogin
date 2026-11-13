// utils/createUserWithPhone.js
import User from "../model/User.js";
import { generateUniqueNigerianPhone } from "./nigerianPhone.js";

export const createUserWithPhone = async (userData, maxAttempts = 5) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const phone = await generateUniqueNigerianPhone();
    try {
      return await User.create({ ...userData, phone });
    } catch (err) {
      // Duplicate key on phone → retry with a new candidate
      const isPhoneDup =
        err?.code === 11000 && err?.keyPattern?.phone;
      if (!isPhoneDup) throw err;
    }
  }
  throw new Error("Could not create user with a unique phone after retries");
};