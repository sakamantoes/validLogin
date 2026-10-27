import { Resend } from "resend";
import { env } from "../config/constant.js";

const resend = new Resend(env.resend_api);

export const sendMail = async ({ to, message, subject }) => {
  const { data, error } = await resend.emails.send({
    from: "SMSWINNER <wowwin96@smswinners.online>",
    to: [to],
    subject,
    html: message,
  });

  if (error) {
    console.error("Resend Error:", error);

    throw error;
  }

  return data;
};
