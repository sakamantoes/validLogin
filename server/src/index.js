import app from "./app.js";
import { env } from "./config/constant.js";
import { disconnectDb } from "./config/db.js";
const PORT = process.env.PORT || env.port

app.listen(PORT, () => {
  console.log(`server running on port:http://localhost:${env.port}`);
});

process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Rejecton:", err.message);
  await disconnectDb();
  process.exit(1);
});

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err.message);
  await disconnectDb();
  process.exit(1);
});

process.on("SIGTERM", async (err) => {
  console.error("sigterm error:", err.message);
  await disconnectDb();
  process.exit(1);
});
