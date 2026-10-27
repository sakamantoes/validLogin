import crypto from "crypto";

const recieptNumberGenerator = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomCode = crypto.randomBytes(6).toString("hex").toUpperCase();

  return `WaveVerify-${date}-${randomCode}`;
};

export default recieptNumberGenerator;
