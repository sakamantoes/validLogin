import { OAuth2Client } from "google-auth-library";
import { env } from "../config/constant.js";

const client = new OAuth2Client(env.google_client_id);


export default client;
