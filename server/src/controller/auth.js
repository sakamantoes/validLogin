import User from "../model/User.js";
import client from "../utils/google.js";
import { generateToken } from "../utils/jwttoken.js";
import { comparePassword, hashPassword } from "../utils/bycrpt.js";
import { authCookieOptions, setAuthCookie } from "../utils/setCookie.js";
import { env } from "../config/constant.js";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendMail } from "../services/resend.js";


const googleSetup = async (req, res, next) => {
  const { token } = req.body;
  try {
    if (!token) {
      res.statusCode = 400;
      throw new Error("missing token");
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.google_client_id,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      res.statusCode = 400;
      throw new Error("invaild token");
    }

    const { email, name, sub } = payload;

    const hashedpassword = await hashPassword(sub);

    let user = await User.findOne({
      email,
    });

       if (user.role === "admin") {
         res.statusCode = 400;
         throw new Error("can't login with this portal");
       }

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        email,
        username: name,
        password: hashedpassword,
      });
    }

    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Set token to cookie header
    setAuthCookie(res, jwtToken);

    res.status(201).json({
      status: 201,
      success: true,
      message: "You're Google registration was successful",
      data: {
        token: jwtToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleVerified = async (req, res, next) => {
  const { googleId, email, name, picture, emailVerified } = req.body;

  try {
    if (!googleId || !email) {
      res.statusCode = 400;
      throw new Error("Missing required user fields from Vercel");
    }

    let user = await User.findOne({ email });

    if (user.role === "admin") {
      res.statusCode = 400;
      throw new Error("can't login with this portal");
    }

    if (!user) {
      const hashedPassword = await hashPassword(googleId); // use googleId as placeholder password
      user = await User.create({
        email,
        username: name,
        password: hashedPassword,
      });
    }

    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, jwtToken);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Google login successful",
      data: {
        token: jwtToken,
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAuthUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.statusCode = 404;
      throw new Error("User not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const emailSignup = async (req, res, next) => {
  const { email, password, username } = req.body;
  try {
    const isUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isUser) {
      res.statusCode = 400;
      throw new Error("An account with htese details could not be created");
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email,
      username,
      password: hashedPassword,
    });

    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, jwtToken);

    res.status(201).json({
      status: 201,
      success: true,
      message: "Registration successful",
      data: {
        token: jwtToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const emailLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.statusCode = 401;
      throw new Error("Invalid Credentials");
    }

    if (user.role === "admin") {
      res.statusCode = 400;
      throw new Error("can't login with this portal");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.statusCode = 401;
      throw new Error("Invalid Credentials");
    }

    const jwtToken = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, jwtToken);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        token: jwtToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find({
      role: "user",
    }).select("-password");

    res.status(200).json({
      message: "All users found",
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "User deactivated",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "User activated",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUsername = async (req, res, next) => {
  const { username } = req.body;
  try {
    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username: username,
      _id: { $ne: req.user._id }, // Exclude current user
    });

    if (existingUser) {
      res.statusCode = 400;
      throw new Error("Username already taken");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Username updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.statusCode = 400;
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("smsWinnerToken", {
      ...authCookieOptions,
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    // create reset url
    const resetUrl = `${env.client_url}/reset-password/${resetToken}`;

    // send email
    const mail = await sendMail({
      to: user.email,
      subject: "Reset Your Password",
      message: `
      <div>
        <h2>Password Reset</h2>

        <p>Click the link below to reset your password:</p>

        <a href="${resetUrl}">
          Reset Password
        </a>

        <p>This link expires in 15 minutes.</p>
      
      </div>
      `,
    });

    console.log("email sent reset password: ", mail);

    res.status(200).json({
      success: true,
      message: "Reset email sent",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      res.statusCode = 400;
      throw new Error("Invalid password reset token");
    }

    if (
      !user.resetPasswordTokenExpires ||
      user.resetPasswordTokenExpires < Date.now()
    ) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();

      res.statusCode = 400;
      throw new Error("Password reset token has expired");
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// EDIT USER WALLET BALANCE
const editUserWallet = async (req, res, next) => {
  const { id } = req.params;
  const { walletBalance } = req.body;
  try {
    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("Invalid user ID");
    }

    // Validate wallet balance
    if (walletBalance === undefined || walletBalance === null) {
      res.statusCode = 400;
      throw new Error("Wallet balance is required");
    }

    if (typeof walletBalance !== "number" || walletBalance < 0) {
      res.statusCode = 400;
      throw new Error("Wallet balance must be a positive number");
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { walletBalance: walletBalance },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      res.statusCode = 404;
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "User wallet balance updated successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletBalance: user.walletBalance,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  googleSetup,
  googleVerified,
  getAuthUser,
  emailSignup,
  emailLogin,
  getAllUser,
  deactivateUser,
  activateUser,
  updatePassword,
  updateUsername,
  logout,
  forgotPassword,
  resetPassword,
  editUserWallet,
};
