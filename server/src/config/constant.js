import { config } from "dotenv";
config();

export const env = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  mongodb_url: process.env.MONGODB_URL,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  smsBowerApiKey: process.env.SMSBOWER_API_KEY,
  smsBowerBaseUrl: process.env.SMSBOWER_BASE_URL,
  sms_bower_api_key: process.env.SMS_BOWER_API_KEY,
  sms_bower_user_id: process.env.SMS_BOWER_USER_ID,
  node_env: process.env.NODE_ENV,
  resend_api: process.env.RESEND_API_KEY,
  client_url: process.env.CLIENT_URL,
  sms_pool_api_key: process.env.SMS_POOL_API_KEY,
  quest_api_secret: process.env.QUEST_API_SECRET, 
  internal_api_secret: process.env.INTERNAL_API_SECRET
};
