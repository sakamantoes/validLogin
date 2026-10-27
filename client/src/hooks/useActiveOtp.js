import { useCallback, useEffect, useState } from "react";
import { getOtpOrder } from "../service/admin.js";

const useActiveOtp = () => {
  const [data, setData] = useState({
    isLoading: false,
    error: "",
    value: {},
    isError: false,
  });

  const fetchActiveOtp = useCallback(async () => {
    try {
      setData((it) => ({
        ...it,
        isLoading: true,
        error: null,
        isError: false,
      }));

      const response = await getOtpOrder();
      setData((it) => ({ ...it, value: response?.data || {} }));

      return response;
    } catch (err) {
      setData((it) => ({
        ...it,
        error: err?.response?.data?.message || err.message,
        isError: true,
      }));
      return null;
    } finally {
      setData((it) => ({ ...it, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    fetchActiveOtp();
  }, [fetchActiveOtp]);

  return {
    otpOrder: data.value.otpOrders,
    total: data.value.total,
    isLoading: data.isLoading,
    isError: data.isError,
    error: data.error,
    refetch: fetchActiveOtp,
  };
};

export default useActiveOtp;
