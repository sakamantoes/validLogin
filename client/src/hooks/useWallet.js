import { useEffect, useState } from "react";
import { getWalletBalance } from "../service/wallet.js";

const useWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const response = await getWalletBalance();
      setWallet(response?.data ?? null);

      return response;
    } catch (err) {
      setIsError(true);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const response = await getWalletBalance();

        if (!isMounted) {
          return;
        }

        setWallet(response?.data ?? null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setIsError(true);
        setError(err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    wallet,
    balance: typeof wallet === "number" ? wallet : wallet?.balance || 0,
    isLoading,
    isError,
    error,
    refetch: fetchWallet,
  };
};

export default useWallet;
