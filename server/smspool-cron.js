import axios from "axios";
import mongoose from "mongoose";
import AvailableService from "./src/model/ServicesAvailable.js";
import { env } from "./src/config/constant.js";
import { provider2CountryServices } from "./src/utils/serviceCode.js";

const REQUEST_TIMEOUT_MS = 15000;

const serviceCountryMap = new Map(
  provider2CountryServices.map((it) => [
    `${it.service.toLowerCase()}|${it.country.toLowerCase()}`,
    it,
  ]),
);

const SMSPOOLCRON = async () => {
  console.log("starting up SMSPOOL-CRON-JOB");
  const data = { max_price: 10, key: env.sms_pool_api_key };
  try {
    console.log("connecting to mongoDb.....");
    await mongoose.connect(env.mongodb_url);
    console.log("MongoDB connected successfully");

    await AvailableService.updateMany(
      { provider: "smspool" },
      { $set: { availability: false } },
    );

    const response = await axios.post(
      "https://api.smspool.net/request/pricing",
      data,
      { timeout: REQUEST_TIMEOUT_MS },
    );

    if (!Array.isArray(response.data)) {
      console.log("SMSPOOL: unexpected response shape", response.data);
      return [];
    }

    const arr = response.data
      .map((item) => {
        if (!item.service_name || !item.country_name) return;

        const service_name = serviceCountryMap.get(
          `${item.service_name.toLowerCase()}|${item.country_name.toLowerCase()}`,
        );

        if (!service_name) return;

        return {
          updateOne: {
            filter: {
              providerCountry: item.country,
              providerService: item.service,
              providerId: String(item.pool),
              provider: "smspool",
            },
            update: {
              $set: {
                internalService:
                  service_name.service === "TikTok/Douyin"
                    ? "TikTok"
                    : service_name.service,
                internalCountry: service_name.country,
                providerPrice: item.price,
                availability: true,
                lastFetchedAt: new Date(),
              },
            },
            upsert: true,
          },
        };
      })
      .filter(Boolean);

    if (arr.length === 0) {
      console.log("SMSPOOL: no valid operations to write");
      return [];
    }
    let chunkSize = 500;

    for (let index = 0; index < arr.length; chunkSize++) {
      const element = arr.slice(index, index + chunkSize);
      await AvailableService.bulkWrite(element);
    }
    console.log("data saved successfully");
    console.log(
      `smspool cron job ran successfully and Prepared ${arr.length} operations`,
    );
  } catch (error) {
    console.log("smspool CRON JOB ERROR: ", error.message);
  }
};

export default SMSPOOLCRON;
