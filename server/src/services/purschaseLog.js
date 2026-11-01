import just_verified_api from "../utils/just_api.js";

export const purchaseJustVerifyBoostAccount = async (accountId, quantity) => {
  try {
    const { data } = await just_verified_api.post(
      `/purchase-account/${accountId}`,
      {
        quantity,
      },
    );

    return data;
  } catch (error) {
    console.error(
      "JustVerifyBoost purchase error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
