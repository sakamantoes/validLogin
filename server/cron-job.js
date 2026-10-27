import mongoose from "mongoose";
import { env } from "./src/config/constant.js";
import axios from "axios";
import { countries, services } from "./src/utils/neededCountries.js";
import AvailableService from "./src/model/ServicesAvailable.js";
import { formatServiceName } from "./src/utils/serviceCode.js";

const MAX_ALLOWED_PRICE = 5;
const REQUEST_TIMEOUT_MS = 15000;

const CronJob = async () => {
  console.log("Starting up SMSBOWER-CRON-JOB");
  try {
    console.log("connecting to mongoDb.....");
    await mongoose.connect(env.mongodb_url);
    console.log("MongoDB connected successfully");

    let arr = [];

    await AvailableService.updateMany(
      { provider: "smsbower" },
      { $set: { stock: 0 } },
    );

    console.log("fetching data...");

    await Promise.all(
      services.map(async (item) => {
        const response = await axios.get(
          `https://smsbower.page/stubs/handler_api.php?api_key=${env.sms_bower_api_key}&action=getPricesV3&service=${item.service}&country=${item.countryId}`,
          {
            timeout: REQUEST_TIMEOUT_MS
          }
        );

        for (const countryId in response.data) {
          const services = response.data[countryId];

          for (const serviceCode in services) {
            const providers = services[serviceCode];

            for (const providerKey in providers) {
              const details = providers[providerKey];

              // special rule for US numbers
              // global rule for others
              if (Number(details.price) > MAX_ALLOWED_PRICE) {
                continue;
              }
              const matchedCountry = countries.find(
                (i) => i.countryId === Number(countryId),
              );

              const mappedService = formatServiceName(serviceCode);

              if (!matchedCountry || !mappedService) {
                continue;
              }

               if ((Number(details.count) < 100) || !details.count) {
                continue;
              }

              arr.push({
                updateOne: {
                  filter: {
                    providerService: serviceCode,
                    providerCountry: countryId,
                    provider: "smsbower",
                    providerId: String(providerKey),
                  },

                  update: {
                    $set: {
                      providerPrice: details.price,
                      stock: details.count,
                      internalService: mappedService,
                      internalCountry: matchedCountry?.country,
                      lastFetchedAt: new Date(),
                    },
                  },

                  upsert: true,
                },
              });
            }
          }
        }
      }),
    );
    console.log("saving data....");
    await AvailableService.bulkWrite(arr);
    console.log("data saved successfully");

    console.log(
      `SMSBOWER cron job ran successfully and Prepared ${arr.length} operations`,
    );
  } catch (err) {
    console.error("SMSBOWER CRON JOB ERROR ", err);
  }
};

export default CronJob;