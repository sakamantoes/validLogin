const KEY = "ctex:pending-deposit";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const savePendingCtex = ({ reference, amount }) => {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ reference, amount, at: Date.now() }),
    );
  } catch {
    // storage unavailable (private mode) — ignore
  }
};

export const readPendingCtex = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.reference) return null;

    if (Date.now() - Number(parsed.at || 0) > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingCtex = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};