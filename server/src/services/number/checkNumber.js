import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

const normalizeSmsBowerStatus = (response) => {
  let otpCode = null;
  let otpMessage =
    typeof response === "string" ? response : JSON.stringify(response);
  let status = "WAITING_FOR_SMS";

  if (typeof response === "string") {
    if (response.startsWith("STATUS_OK")) {
      const parts = response.split(":");
      otpCode = parts[parts.length - 1];
      status = "OTP_RECEIVED";
    }

    if (response === "STATUS_CANCEL") {
      status = "CANCELLED";
    }

    if (
      response === "STATUS_WAIT_CODE" ||
      response.startsWith("STATUS_WAIT_RETRY")
    ) {
      status = "WAITING_FOR_SMS";
    }
  } else if (response && typeof response === "object") {
    otpMessage =
      response.text ||
      response.smsText ||
      response.message ||
      JSON.stringify(response);
    otpCode = response.code || response.smsCode || null;

    if (otpCode) {
      status = "OTP_RECEIVED";
    }
  }

  return {
    provider: "smsbower",
    status,
    otpCode,
    otpMessage,
    raw: response,
  };
};

const normalizeSmsPoolStatus = (response) => {
  const providerStatus = Number(response?.status);
  const smsText = response?.full_sms || response?.sms || response?.message;
  let status = "WAITING_FOR_SMS";

  if (providerStatus === 1) {
    status = "WAITING_FOR_SMS";
  }

  if (providerStatus === 3) {
    status = "OTP_RECEIVED";
  }

  if (providerStatus === 2) {
    status = "FAILED";
  }

  if (providerStatus === 5 || providerStatus === 6) {
    status = "CANCELLED";
  }

  console.log("unfildwwt", response);

  return {
    provider: "smspool",
    status,
    otpCode: response?.sms || null,
    otpMessage: smsText ? String(smsText) : JSON.stringify(response),
    raw: response,
  };
};

export const requestUserOtp = async (payload) => {
  switch (payload.provider) {
    case "smsbower": {
      const response = await axios.get(
        "https://smsbower.page/stubs/handler_api.php",
        {
          params: {
            api_key: env.sms_bower_api_key,
            action: "getStatus",
            id: payload.activationId,
          },
        },
      );

      return normalizeSmsBowerStatus(response.data);
    }

    case "smspool": {
      const response = await smspool_api.post("/sms/check", {
        orderid: payload.activationId,
        key: env.sms_pool_api_key,
      });

      console.log("smspool status check: ", response.data);
      return normalizeSmsPoolStatus(response.data);
    }

    default:
      throw new Error("invalid provider");
  }
};
