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
import supportRoute from "./routes/supportRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import CronJob from "../cron-job.js";
import compression from "compression";
import SMSPOOLCRON from "../smspool-cron.js";

const app = express();

app.set("trust proxy", 1);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dera-verify.vercel.app",
      "https://www.waveverify.com",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to wave verify API");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoute);

app.get("/cron-jobs", (req, res) => {
  CronJob();
  res.status(200).send("SMSBOWER Cron Job Ran");
});

app.get("/smspool", (req, res) => {
  SMSPOOLCRON();
  res.status(200).send("SMSPOOL Cron Job Ran");
});

// database connection
connectDB();

// global error
app.use(errorHandle);

export default app;
