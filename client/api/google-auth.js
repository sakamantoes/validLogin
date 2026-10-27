// api/google-auth.js
import "dotenv/config";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Missing Google token" });
  }

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ success: false, message: "Invalid Google token" });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ success: false, message: "Google email not verified" });
    }

    // Extract verified user info
    const verifiedUser = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };

    // Forward to Render backend with shared secret
    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/google-verified`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET,
        },
        body: JSON.stringify(verifiedUser),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log("error message", errorData)
      return res.status(backendResponse.status).json({
        success: false,
        message: errorData.message || "Backend authentication failed",
      });
    }

    const data = await backendResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Google verification error:", error.message);

    if (error.message?.includes("Token used too late")) {
      return res.status(401).json({ success: false, message: "Google token expired" });
    }
    if (error.message?.includes("Invalid token signature")) {
      return res.status(401).json({ success: false, message: "Invalid Google token signature" });
    }
    if (error.message?.includes("Wrong recipient")) {
      return res.status(401).json({ success: false, message: "Token audience mismatch" });
    }

    return res.status(500).json({ success: false, message: "Google verification failed" });
  }
}
