import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Smartphone,
  Wallet,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState.jsx";
import useWallet from "../../hooks/useWallet.js";
import {
  buyNumber,
  getAvailableCountries,
  getAvailableServices,
} from "../../service/number.js";
import { formatCurrency } from "../../utils/transaction.js";
import { toast } from "react-toastify";
import { formatServiceName } from "../../utils/serviceCode.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const PhoneNumber = () => {
  const navigate = useNavigate();
  const {
    balance,
    isLoading: isWalletLoading,
    isError: isWalletError,
  } = useWallet();
  const [showBalance, setShowBalance] = useState(false);

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState("country");
  const [serviceSummaries, setServiceSummaries] = useState([]);
  const [revealedService, setRevealedService] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);
  const [buyingService, setBuyingService] = useState("");
  const [purchaseData, setPurchaseData] = useState(null);
  const [servicesError, setServicesError] = useState("");

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true);

      const response = await getAvailableCountries();
      setCountries(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  useEffect(() => {
    void fetchCountries();
  }, []);

  const fetchServices = async () => {
    if (!selectedCountry) return;

    try {
      setLoadingServices(true);
      setServicesError("");

      const response = await getAvailableServices({ country: selectedCountry });
      setServiceSummaries(
        Array.isArray(response?.services) ? response.services : [],
      );
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServicesError(
        err?.response?.data?.message || "Failed to load services",
      );
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    if (!selectedCountry) {
      setServiceSummaries([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchServices();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const serviceOptions = useMemo(
    () =>
      serviceSummaries
        .map((item) => ({
          code: item.internalService,
          name: formatServiceName(item.internalService),
          price: item.sellingPrice != null ? Number(item.sellingPrice) : null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [serviceSummaries],
  );

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((item) =>
      item.internalCountry.toLowerCase().includes(query),
    );
  }, [countries, countryQuery]);

  const filteredServiceOptions = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase();
    if (!query) return serviceOptions;
    return serviceOptions.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query),
    );
  }, [serviceOptions, serviceQuery]);

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry((current) =>
      current === countryCode ? current : countryCode,
    );
    setRevealedService("");
    setServiceQuery("");
    setPurchaseData(null);
    setMobilePanel("service");
  };

  const toggleRevealService = (code) => {
    setRevealedService((current) => (current === code ? "" : code));
  };

  const handleBuyNumber = async (serviceCode) => {
    if (!selectedCountry || !serviceCode) return;

    try {
      setBuyingService(serviceCode);
      setPurchaseData(null);

      const response = await buyNumber({
        country: selectedCountry,
        service: serviceCode,
      });

      const otpOrder = response?.data?.otpOrder || response?.data;
      const nextPurchaseData = {
        ...otpOrder,
        orderId: otpOrder?._id,
        phone: otpOrder?.phoneNumber,
        cost: otpOrder?.sellingPrice,
        country: selectedCountry,
      };

      setPurchaseData(nextPurchaseData);
      toast.success(response?.message || "Number purchased successfully");
    } catch (err) {
      console.error("Failed to purchase number:", err);
      toast.error(err?.response?.data?.message || "Failed to purchase number");
    } finally {
      setBuyingService("");
    }
  };

  const handleCopy = async (value, successMessage) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleBuyAnother = () => {
    setPurchaseData(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
      {/* Header — wallet balance sits left, funding action sits right. */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-medium uppercase tracking-wider text-muted"
              style={FONT_MONO}
            >
              Wallet Balance
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="text-base font-bold text-heading sm:text-lg"
                style={FONT_MONO}
              >
                {isWalletLoading
                  ? "..."
                  : isWalletError
                    ? "N/A"
                    : showBalance
                      ? formatCurrency(balance)
                      : "NGN ******"}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance((prev) => !prev)}
                className="text-muted transition-colors hover:text-heading"
                aria-label={
                  showBalance ? "Hide wallet balance" : "Show wallet balance"
                }
              >
                {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate("/f/fund-account", {
              state: { from: "/f/numbers" },
            })
          }
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Wallet size={15} />
          Fund Wallet
        </button>
      </section>

      {/* Unified workspace — pick a country, then a service, then buy. */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="px-5 py-5">
          {/* Mobile tab switcher */}
          <div className="flex rounded-full border border-border bg-bg p-1 lg:hidden">
            <button
              type="button"
              onClick={() => setMobilePanel("country")}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                mobilePanel === "country"
                  ? "bg-brand text-on-brand"
                  : "text-muted hover:text-heading"
              }`}
              style={FONT_MONO}
            >
              Countries
            </button>
            <button
              type="button"
              onClick={() => setMobilePanel("service")}
              disabled={!selectedCountry}
              className={`flex-1 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                mobilePanel === "service"
                  ? "bg-brand text-on-brand"
                  : "text-muted hover:text-heading"
              }`}
              style={FONT_MONO}
            >
              Services
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* Country panel */}
            <div
              className={`overflow-hidden rounded-xl border border-border bg-bg ${
                mobilePanel === "country" ? "block" : "hidden"
              } lg:block`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
                    <Globe size={15} />
                  </div>
                  <h3
                    className="text-sm font-semibold text-heading"
                    style={FONT_DISPLAY}
                  >
                    Select Country
                  </h3>
                </div>
                <span
                  className="shrink-0 rounded-full border border-border bg-brand px-3 py-1 text-xs font-medium text-on-brand"
                  style={FONT_MONO}
                >
                  {countries.length} Countries
                </span>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <input
                    value={countryQuery}
                    onChange={(event) => setCountryQuery(event.target.value)}
                    placeholder="Find country"
                    className="h-10 w-full rounded-lg border border-border bg-bg pl-10 pr-3 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                    style={FONT_MONO}
                  />
                </div>
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto px-4 pb-4">
                {loadingCountries ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                    <Loader2 size={16} className="animate-spin" />
                    Loading countries...
                  </div>
                ) : filteredCountries.length === 0 ? (
                  <p className="px-2 py-8 text-center text-sm text-muted">
                    No countries match your search.
                  </p>
                ) : (
                  filteredCountries.map((item) => {
                    const isSelected = item.internalCountry === selectedCountry;

                    return (
                      <button
                        key={item.internalCountry}
                        type="button"
                        onClick={() =>
                          handleCountrySelect(item.internalCountry)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-brand bg-brand text-on-brand"
                            : "border-border bg-bg text-muted hover:border-brand hover:bg-surface"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-brand text-on-brand"
                              : "bg-surface text-muted"
                          }`}
                        >
                          <Globe size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.internalCountry}
                        </span>
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            className="shrink-0 text-brand-text"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Service panel */}
            <div
              className={`overflow-hidden rounded-xl border border-border bg-bg ${
                mobilePanel === "service" ? "block" : "hidden"
              } lg:block`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand">
                    <LayoutGrid size={15} />
                  </div>
                  <h3
                    className="text-sm font-semibold text-heading"
                    style={FONT_DISPLAY}
                  >
                    Select Service
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="rounded-full border border-border bg-brand px-3 py-1 text-xs font-medium text-on-brand"
                    style={FONT_MONO}
                  >
                    {serviceOptions.length} Services
                  </span>
                  {selectedCountry && (
                    <button
                      type="button"
                      onClick={() => void fetchServices()}
                      disabled={loadingServices}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Refresh available services"
                    >
                      <RefreshCw
                        size={13}
                        className={loadingServices ? "animate-spin" : ""}
                      />
                    </button>
                  )}
                </div>
              </div>

              {!selectedCountry ? (
                <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
                    <Globe size={24} />
                  </div>
                  <p
                    className="mt-4 text-sm font-semibold text-heading"
                    style={FONT_DISPLAY}
                  >
                    Step 1: Select Country
                  </p>
                  <p className="mt-1 max-w-[240px] text-xs text-muted">
                    Please select a country to see the services available there.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                      <input
                        value={serviceQuery}
                        onChange={(event) =>
                          setServiceQuery(event.target.value)
                        }
                        placeholder="Find a service"
                        className="h-10 w-full rounded-lg border border-border bg-bg pl-10 pr-3 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                        style={FONT_MONO}
                      />
                    </div>
                  </div>

                  {servicesError && (
                    <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg border border-border bg-brand p-3 text-xs text-on-brand">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{servicesError}</span>
                    </div>
                  )}

                  <div className="max-h-80 space-y-2 overflow-y-auto px-4 pb-4">
                    {loadingServices ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                        <Loader2 size={16} className="animate-spin" />
                        Loading services...
                      </div>
                    ) : filteredServiceOptions.length === 0 ? (
                      <EmptyState
                        icon={Server}
                        title="No services available"
                        description="The admin hasn't made any services live for this country yet."
                      />
                    ) : (
                      filteredServiceOptions.map((service) => {
                        const isRevealed = revealedService === service.code;
                        const isBuying = buyingService === service.code;
                        const hasPrice = service.price != null;

                        return (
                          <div
                            key={service.code}
                            onClick={() => toggleRevealService(service.code)}
                            className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                              isRevealed
                                ? "border-brand bg-brand text-on-brand"
                                : "border-border bg-bg text-muted hover:border-brand hover:bg-surface"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-muted transition-colors group-hover:bg-brand group-hover:text-on-brand">
                              <Server size={14} />
                            </span>
                            <span className="min-w-0 flex-1 truncate font-medium text-muted group-hover:text-heading">
                              {service.name}
                            </span>

                            {hasPrice && (
                              <span
                                className={`shrink-0 text-sm font-semibold text-heading ${
                                  isRevealed
                                    ? "hidden"
                                    : "block group-hover:hidden"
                                }`}
                                style={FONT_MONO}
                              >
                                {formatCurrency(service.price)}
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={!hasPrice || isBuying}
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleBuyNumber(service.code);
                              }}
                              className={`shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 ${
                                isRevealed ? "flex" : "hidden group-hover:flex"
                              }`}
                            >
                              {isBuying ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <>
                                  <Smartphone size={13} />
                                  Buy
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Purchase result */}
        {purchaseData && (
          <div className="border-t border-border bg-bg p-5">
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3
                    className="font-semibold text-heading"
                    style={FONT_DISPLAY}
                  >
                    Number Purchased
                  </h3>
                  <p className="text-xs text-muted">
                    {purchaseData.status || "Waiting for SMS"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-border bg-bg p-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider text-muted"
                    style={FONT_MONO}
                  >
                    Phone Number
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <p
                      className="break-all text-lg font-bold text-heading"
                      style={FONT_MONO}
                    >
                      {purchaseData.phone}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopy(
                          purchaseData.phone,
                          "Phone number copied",
                        )
                      }
                      className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-heading"
                      aria-label="Copy phone number"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-bg p-4">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider text-muted"
                      style={FONT_MONO}
                    >
                      Cost
                    </p>
                    <p
                      className="mt-1.5 text-base font-bold text-heading"
                      style={FONT_MONO}
                    >
                      {formatCurrency(purchaseData.cost)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-bg p-4">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider text-muted"
                      style={FONT_MONO}
                    >
                      Country
                    </p>
                    <p className="mt-1.5 truncate text-base font-medium text-heading">
                      {purchaseData.country}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/f/otp-box")}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Open OTP Box
              </button>
              <button
                type="button"
                onClick={handleBuyAnother}
                className="mt-2 w-full rounded-lg py-2.5 text-xs font-semibold text-muted transition-colors hover:text-heading"
              >
                Buy another number
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PhoneNumber;