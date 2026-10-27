import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

export const buyNumberOption = async (payload) => {
  switch (payload.provider) {
    case "smsbower":
      const resBower = await axios.get(
        `https://smsbower.page/stubs/handler_api.php?api_key=${env.sms_bower_api_key}&action=getNumberV2&service=${payload.providerService}&country=${payload.providerCountry}&maxPrice=${payload.providerPrice + 0.5}&providerIds=${payload.providerId}&exceptProviderIds=$exceptProviderIds&userID=${env.sms_bower_user_id}&minPrice=${0.0001}`,
      );

      const data = resBower.data;
      console.log("smsbower data:", data);

      if (typeof data === "string") {
        console.error("smsbower error: ", data);
        throw new Error(`SMSBower purchase failed: ${data}`);
      }

      if (!data.activationId || !data.phoneNumber) {
        throw new Error(`SMSBower purchase returned invalid data`);
      }

      return {
        provider: "smsbower",
        activationId: data.activationId,
        phoneNumber: data.phoneNumber,
        canGetAnotherSms: data.canGetAnotherSms,
        activationOperator: data.activationOperator,
        activationTime: data.activationTime,
        activationCost: data.activationCost,
        raw: data,
      };
    case "smspool":
      const res = await smspool_api.post("/purchase/sms", {
        country: payload.providerCountry,
        service: payload.providerService,
        pool: Number(payload.providerId),
        max_price: payload.providerPrice + 0.5,
        pricing_option: 1,
      });

      const dataPool = res.data;

      if (dataPool.success === 0) {
        console.error("smspool error: ", dataPool);
        throw new Error(
          `SMSPOOL purchase failed: ${dataPool.message || "Unknown error"}`,
        );
      }

      if (!dataPool.order_id || !dataPool.number) {
        console.error("smspool error: ", dataPool);
        throw new Error(
          dataPool.message || "SMSPOOL purchase returned invalid data",
        );
      }

      console.log(dataPool);

      return {
        provider: "smspool",
        activationId: dataPool.order_id,
        phoneNumber: dataPool.number,
        activationTime: new Date(Number(dataPool.expiration) * 1000),
        canGetAnotherSms: true,
        activationCost: dataPool.cost,
        raw: dataPool,
      };

    default:
      throw new Error("invalid provider");
  }
};
