import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

export const cancelNumberServices = async (payload) => {
  switch (payload.provider) {
    case "smsbower":
      const resBower = await axios.get(
        `https://smsbower.page/stubs/handler_api.php?api_key=${env.sms_bower_api_key}&action=setStatus&status=8&id=${payload.activationId}`,
      );

      console.log("cancelling smsbower: ", resBower.data);
      return resBower.data;
    case "smspool":
      const res = await smspool_api.post("/sms/cancel", {
        orderid: payload.activationId,
      });

      console.log("cancelling smspool: ", res.data);
      return res.data;
    default:
      break;
  }
};
