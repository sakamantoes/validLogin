import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  MapPin,
  Package,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getAdminServiceGroups,
  getPlatformServiceNames,
  updatePlatformServiceActiveStatus,
} from "../../service/admin.js";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";
import AdminPriceSetting from "../../components/AdminPriceSetting.jsx";
import ServiceGroupModal from "../../components/Admin/ServiceGroupModal.jsx";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const GROUPS_PER_PAGE = 25;

const normalizeGroups = (response) => {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows
    .filter((item) => item?.internalService && item?.internalCountry)
    .map((item) => ({
      service: item.internalService,
      serviceName: formatServiceName(item.internalService),
      country: item.internalCountry,
      providerCount: Number(item.providerCount || 0),
      liveProviderCount: Number(item.liveProviderCount || 0),
      visibleListing: item.visibleListing
        ? {
            provider: item.visibleListing.provider || "Auto",
            providerPrice: Number(item.visibleListing.providerPrice || 0),
            sellingPrice: Number(item.visibleListing.sellingPrice || 0),
          }
        : null,
    }));
};

export default function AdminNumbers() {
  const [groups, setGroups] = useState([]);
  const [serviceNames, setServiceNames] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState("");
  const [updatingService, setUpdatingService] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeGroup, setActiveGroup] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: GROUPS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      setError("");

      const [response, namesResponse] = await Promise.all([
        getAdminServiceGroups({
          page: currentPage,
          limit: GROUPS_PER_PAGE,
          service: selectedService || undefined,
          search: searchTerm.trim() || undefined,
        }),
        getPlatformServiceNames(),
      ]);
      const nextGroups = normalizeGroups(response);
      setGroups(nextGroups);
      setPagination(
        response?.pagination || {
          page: currentPage,
          limit: GROUPS_PER_PAGE,
          total: nextGroups.length,
          totalPages: 1,
        },
      );
      setServiceNames(
        Array.isArray(namesResponse?.data) ? namesResponse.data : [],
      );
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoadingGroups(false);
    }
  }, [currentPage, searchTerm, selectedService]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const serviceOptions = useMemo(() => {
    if (serviceNames.length > 0) {
      return serviceNames
        .map((item) => ({
          code: item.internalService,
          name: formatServiceName(item.internalService),
          stock: Number(item.totalStock || 0),
          countries: Number(item.totalCountries || 0),
          active: Boolean(item.active),
          totalListings: Number(item.totalListings || 0),
          activeCount: Number(item.activeCount || 0),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    const summaries = new Map();

    groups.forEach((item) => {
      if (!summaries.has(item.service)) {
        summaries.set(item.service, { stock: 0, countries: new Set() });
      }

      const summary = summaries.get(item.service);
      summary.stock += item.liveProviderCount;
      summary.countries.add(item.country);
    });

    return Array.from(summaries.entries()).map(([service, item]) => ({
      code: service,
      name: formatServiceName(service),
      stock: item.stock,
      countries: item.countries.size,
      totalListings: 0,
      activeCount: 0,
      active: false,
    }));
  }, [groups, serviceNames]);

  const totalPages = Math.max(Number(pagination.totalPages || 1), 1);
  const totalGroups = Number(pagination.total || 0);
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = totalGroups === 0 ? 0 : (visiblePage - 1) * GROUPS_PER_PAGE;

  const selectedServiceLabel = selectedService
    ? serviceOptions.find((item) => item.code === selectedService)?.name ||
      formatServiceName(selectedService)
    : "All Services";

  const handleServiceToggle = async (service) => {
    const nextActive = !service.active;

    try {
      setUpdatingService(service.code);
      await updatePlatformServiceActiveStatus(service.code, nextActive);

      setServiceNames((prev) =>
        prev.map((item) =>
          item.internalService === service.code
            ? {
                ...item,
                active: nextActive,
                activeCount: nextActive ? item.totalListings : 0,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update service status:", err);
      setError(err?.response?.data?.message || "Failed to update service");
    } finally {
      setUpdatingService("");
    }
  };

  const liveGroups = groups.filter((item) => item.liveProviderCount > 0).length;
  const activeCountries = new Set(groups.map((item) => item.country)).size;
  const totalServices = serviceOptions.length;
  const visiblePrices = groups
    .filter((item) => item.visibleListing)
    .map((item) => item.visibleListing.sellingPrice);
  const averagePrice =
    visiblePrices.length > 0
      ? visiblePrices.reduce((sum, price) => sum + price, 0) /
        visiblePrices.length
      : 0;

  const stats = [
    {
      label: "Total Services",
      value: totalServices,
      change: "Available",
      icon: Server,
      iconBg: "bg-brand",
      iconColor: "text-brand-text",
    },
    {
      label: "Active Countries",
      value: activeCountries,
      change: `${liveGroups} live pairs`,
      icon: ShieldCheck,
      iconBg: "bg-success-soft",
      iconColor: "text-success",
      changeBg: "bg-success-soft text-success border-success",
    },
    {
      label: "Average Price",
      value: averagePrice === 0 ? "N/A" : formatCurrency(averagePrice),
      change: "Per number",
      icon: DollarSign,
      iconBg: "bg-info-soft",
      iconColor: "text-info",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6 overflow-hidden">
      {/* Page Header */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <Smartphone size={22} />
            </div>
            <div>
              <h1
                className="text-xl font-bold text-heading"
                style={FONT_DISPLAY}
              >
                Number Inventory
              </h1>
              <p className="mt-0.5 text-sm text-muted" style={FONT_MONO}>
                Manage service listings, pricing, and availability
              </p>
            </div>
          </div>
          <div
            className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-brand px-3 py-1.5 text-xs font-semibold text-on-brand sm:self-auto"
            style={FONT_MONO}
          >
            <Server size={13} />
            Admin Control
          </div>
        </div>
      </section>

      {/* Price Setting */}
      <AdminPriceSetting />

      {/* Stats Cards */}
      <section className="grid min-w-0 gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={19} />
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  stat.changeBg || "bg-surface text-muted border-border"
                }`}
                style={FONT_MONO}
              >
                {stat.change}
              </span>
            </div>
            <p
              className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
              style={FONT_MONO}
            >
              {stat.label}
            </p>
            <p
              className="mt-1 text-2xl font-bold tracking-tight text-heading"
              style={FONT_DISPLAY}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Main Grid: Service Sidebar + Listings */}
      <section className="grid w-full min-w-0 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Service Names Sidebar */}
        <div className="min-w-0 max-h-screen overflow-y-auto rounded-2xl border border-border bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-4">
            <div>
              <h2
                className="text-sm font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                Service Names
              </h2>
              <p className="mt-0.5 text-xs text-muted" style={FONT_MONO}>
                {serviceOptions.length} service
                {serviceOptions.length === 1 ? "" : "s"} available
              </p>
            </div>
            {loadingGroups && (
              <Loader2 size={18} className="animate-spin text-brand-text" />
            )}
          </div>

          <div className="space-y-2 overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => {
                setSelectedService("");
                setCurrentPage(1);
              }}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all ${
                selectedService === ""
                  ? "border-brand bg-brand"
                  : "border-border bg-bg hover:border-brand hover:bg-surface"
              }`}
            >
              <span>
                <span
                  className="block text-sm font-semibold text-heading"
                  style={FONT_DISPLAY}
                >
                  All Services
                </span>
                <span className="mt-0.5 block text-xs text-muted" style={FONT_MONO}>
                  {activeCountries} countries
                </span>
              </span>
              <span
                className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted"
                style={FONT_MONO}
              >
                {totalGroups}
              </span>
            </button>

            {serviceOptions.map((service) => (
              <div
                key={service.code}
                className={`rounded-lg border transition-all ${
                  selectedService === service.code
                    ? "border-brand bg-brand"
                    : "border-border bg-bg hover:border-brand hover:bg-surface"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(service.code);
                    setCurrentPage(1);
                  }}
                  className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span
                      className="block truncate text-sm font-semibold text-heading"
                      style={FONT_DISPLAY}
                    >
                      {service.name}
                    </span>
                    <span
                      className="mt-0.5 block text-xs text-muted"
                      style={FONT_MONO}
                    >
                      {service.countries} countr
                      {service.countries === 1 ? "y" : "ies"} | {service.stock}{" "}
                      live routes
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      service.active
                        ? "border-success bg-success-soft text-success"
                        : "border-border bg-surface text-muted"
                    }`}
                    style={FONT_MONO}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </button>

                <div className="border-t border-border px-3 py-2">
                  <button
                    type="button"
                    onClick={() => handleServiceToggle(service)}
                    disabled={updatingService === service.code}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-semibold text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
                    style={FONT_MONO}
                  >
                    {updatingService === service.code ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : service.active ? (
                      <ToggleRight size={16} className="text-success" />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    {service.active ? "Deactivate Service" : "Activate Service"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings Panel */}
        <div className="min-w-0 max-h-screen overflow-y-auto rounded-2xl border border-border bg-surface shadow-card">
          {/* Panel Header */}
          <div className="flex min-w-0 flex-col gap-4 border-b border-border bg-bg px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h2
                className="text-sm font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                {selectedServiceLabel}
              </h2>
              <p className="mt-0.5 text-xs text-muted" style={FONT_MONO}>
                {totalGroups} countr{totalGroups === 1 ? "y" : "ies"} found
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full min-w-0 sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search country..."
                  className="h-10 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-4 text-sm text-heading transition-all placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                  style={FONT_MONO}
                />
              </div>

              <button
                type="button"
                onClick={() => fetchGroups()}
                disabled={loadingGroups}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
                style={FONT_MONO}
              >
                <RefreshCw
                  size={16}
                  className={loadingGroups ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 flex items-start gap-2 rounded-lg border border-border bg-brand p-4 text-sm text-on-brand">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loadingGroups ? (
            <div className="flex items-center justify-center py-16 text-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-text" />
            </div>
          ) : totalGroups === 0 ? (
            <div className="px-5 py-14 text-center">
              <Package size={42} className="mx-auto text-muted" />
              <h3
                className="mt-4 text-lg font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                No listings found
              </h3>
              <p className="mt-1 text-sm text-muted">
                Try another service or country search.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
                  <tr style={FONT_MONO}>
                    <th className="px-5 py-3 font-semibold">Service</th>
                    <th className="px-5 py-3 font-semibold">Country</th>
                    <th className="px-5 py-3 font-semibold">Providers</th>
                    <th className="px-5 py-3 font-semibold">Visible Price</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {groups.map((group) => (
                    <tr
                      key={`${group.service}__${group.country}`}
                      className="bg-bg transition-colors hover:bg-surface/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-on-brand"
                          style={FONT_MONO}
                        >
                          <Smartphone size={12} />
                          {group.serviceName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-heading">
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-muted" />
                          {group.country}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {group.providerCount} provider
                        {group.providerCount === 1 ? "" : "s"}
                        <span className="ml-1.5 text-xs text-muted">
                          ({group.liveProviderCount} live)
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {group.visibleListing ? (
                          <div>
                            <p
                              className="text-sm font-semibold text-heading"
                              style={FONT_MONO}
                            >
                              {formatCurrency(
                                group.visibleListing.sellingPrice,
                              )}
                            </p>
                            <p className="text-xs text-muted">
                              {group.visibleListing.provider}
                            </p>
                          </div>
                        ) : (
                          <span
                            className="rounded-full border border-border bg-surface px-2 py-1 text-xs font-semibold text-muted"
                            style={FONT_MONO}
                          >
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setActiveGroup(group)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading"
                          style={FONT_MONO}
                        >
                          Manage
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                <span style={FONT_MONO}>
                  Showing {pageStart + 1}-
                  {Math.min(pageStart + GROUPS_PER_PAGE, totalGroups)} of{" "}
                  {totalGroups}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(page - 1, 1))
                    }
                    disabled={visiblePage === 1}
                    className="h-9 rounded-lg border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
                    style={FONT_MONO}
                  >
                    Previous
                  </button>
                  <span
                    className="rounded-lg border border-border bg-bg px-3 py-2 text-xs font-semibold text-heading"
                    style={FONT_MONO}
                  >
                    Page {visiblePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, totalPages))
                    }
                    disabled={visiblePage === totalPages}
                    className="h-9 rounded-lg border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
                    style={FONT_MONO}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {activeGroup && (
        <ServiceGroupModal
          group={activeGroup}
          onClose={() => setActiveGroup(null)}
          onChanged={fetchGroups}
        />
      )}
    </div>
  );
}