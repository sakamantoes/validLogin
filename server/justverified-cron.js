import AccountListing from "./src/model/AccountListing.js";
import just_verified_api from "./src/utils/just_api.js";

export const syncJustVerifyBoostAccounts = async () => {
  try {
    const { data } = await just_verified_api.get("/get-accounts");

    if (!data.success || !Array.isArray(data.accounts)) {
      throw new Error("Invalid JustVerifyBoost accounts response");
    }

    const accounts = data.accounts;

    if (accounts.length === 0) {
      console.warn(
        "JustVerifyBoost returned an empty account list. Skipping deactivation.",
      );

      return {
        success: true,
        createdOrUpdated: 0,
        message: "No accounts returned; existing listings were preserved.",
      };
    }

    const providerAccountIds = accounts.map((account) => account._id);

    const operations = accounts.map((account) => ({
      updateOne: {
        filter: {
          provider: "justverifyboost",
          providerAccountId: account._id,
        },

        update: {
          $set: {
            name: account.title,
            providerPrice: Number(account.price),
            status: Number(account.quantity) > 0 ? "active" : "out_of_stock",
            description: account.description ?? " ",
            quantity: Number(account.quantity) ?? 0,

            productType: "account",
            category: account.socialMediaType ?? null,
            lastSyncedAt: new Date(),
          },

          $setOnInsert: {
            provider: "justverifyboost",
            providerAccountId: account._id,
          },
        },

        upsert: true,
      },
    }));

    const result = await AccountListing.bulkWrite(operations);

    // Mark listings missing from the latest provider response inactive.
    // Do not delete them because existing orders may reference them.
    const deactivated = await AccountListing.updateMany(
      {
        provider: "justverifyboost",
        productType: "account",
        providerAccountId: { $nin: providerAccountIds },
        status: { $ne: "inactive" },
      },
      {
        $set: {
          status: "inactive",
          lastSyncedAt: new Date(),
        },
      },
    );

    const summary = {
      success: true,
      totalFetched: accounts.length,
      created: result.upsertedCount,
      updated: result.modifiedCount,
      deactivated: deactivated.modifiedCount,
    };

    console.log("JustVerifyBoost account sync:", summary);

    return summary;
  } catch (error) {
    console.error(
      "JustVerifyBoost account sync failed:",
      error.response?.data || error.message,
    );
  }
};
