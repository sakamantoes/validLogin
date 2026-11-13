import express from "express";
import { connectDB } from "./config/db.js";
import errorHandle from "./middleware/errorHandler.js";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js";
import otpRoutes from "./routes/otpRoutes.js";
import notificationRoute from "./routes/notification.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import platformLogsRoutes from "./routes/logs.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import CronJob from "../cron-job.js";
import compression from "compression";
import SMSPOOLCRON from "../smspool-cron.js";
import { syncJustVerifyBoostAccounts } from "../justverified-cron.js";
import { captureRawBody } from "./middleware/rawBody.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(compression());
app.use(morgan("dev"));
app.use(captureRawBody);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://valid-login-5k2c.vercel.app",
      "https://www.validlogin.online",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to validlogin API");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/log", platformLogsRoutes);
app.use("/api/logs", platformLogsRoutes);

let isRunning = false;

app.get("/cron-jobs", async (req, res) => {
  try {
    if (isRunning) {
      return res
        .status(200)
        .send("Cron jobs are already running. Please wait for them to finish.");
    }

    isRunning = true;
    await CronJob();
    await SMSPOOLCRON();
    await syncJustVerifyBoostAccounts();
    res.status(200).send("SMSBOWER Cron Job Ran");
  } catch (error) {
    console.error("Error running cron jobs:", error);
    res.status(500).send("Error running cron jobs");
  } finally {
    isRunning = false;
  }
});

app.get("/smspool", (req, res) => {
  res.status(200).send("SMSPOOL Cron Job Ran");
});

// database connection
connectDB();

// global error
app.use(errorHandle);

export default app;
