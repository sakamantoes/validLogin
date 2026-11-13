import crypto from "crypto";
import User from "../model/User.js";

// Nigerian MTN / Airtel / Glo / 9mobile prefixes that are in active use.
// You can trim this list, but keeping a realistic set avoids generating
// numbers that look obviously fake.
const NIGERIAN_PREFIXES = [
  "0803", "0806", "0703", "0706", "0813", "0816", "0810", "0814", // MTN
  "0802", "0808", "0708", "0812", "0701", "0902", "0901", "0904", // Airtel
  "0805", "0807", "0705", "0815", "0811", "0905", // Glo
  "0809", "0817", "0818", "0908", "0909", // 9mobile
];

const generateCandidate = () => {
  const prefix =
    NIGERIAN_PREFIXES[crypto.randomInt(0, NIGERIAN_PREFIXES.length)];
  // 7 remaining digits → 10,000,000 combinations per prefix
  const suffix = String(crypto.randomInt(0, 10_000_000)).padStart(7, "0");
  return prefix + suffix;
};

/**
 * Generate a Nigerian phone number that does not exist on any user.
 *
 * @param {number} maxAttempts - how many times to try before giving up
 * @returns {Promise<string>} an 11-digit phone number
 * @throws {Error} if it cannot find a free number within maxAttempts
 */
export const generateUniqueNigerianPhone = async (maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateCandidate();
    const exists = await User.exists({ phone: candidate });
    if (!exists) return candidate;
  }

  throw new Error(
    "Could not generate a unique Nigerian phone number after multiple attempts"
  );
};