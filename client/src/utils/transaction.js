import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export const formatCurrency = (value) =>
  `NGN ${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;

export const formatPaymentMethod = (method) => {
  const methodMap = {
    MANUAL_TRANSFER: "Manual Transfer",
    SQUAD: "Squad",
    ALAT: "ALAT",
  };

  return methodMap[method] || method || "Unknown";
};

export const getObjectIdDate = (id) => {
  if (!id) {
    return null;
  }

  const timestamp = parseInt(String(id).slice(0, 8), 16);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp * 1000);
};

export const formatTransactionDate = (transaction) => {
  const dateValue =
    transaction?.createdAt ||
    transaction?.updatedAt ||
    getObjectIdDate(transaction?._id);

  if (!dateValue) {
    return "No timestamp";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "No timestamp";
  }

  return date.toLocaleString();
};

export const DATE_FILTER_OPTIONS = [
  { label: "All time", value: "ALL" },
  { label: "Today", value: "TODAY" },
  { label: "Last 7 days", value: "7D" },
  { label: "Last 30 days", value: "30D" },
];

export const normalizeStatus = (status) =>
  String(status || "PENDING").toUpperCase();

export const getTransactionStatusBadge = (status) => {
  switch (normalizeStatus(status)) {
    case "SUCCESS":
      return {
        label: "Success",
        value: "SUCCESS",
        className:
          "border-success bg-success-soft text-success",
        icon: CheckCircle2,
      };
    case "FAILED":
      return {
        label: "Failed",
        value: "FAILED",
        className: "border-brand bg-brand text-on-brand",
        icon: XCircle,
      };
    default:
      return {
        label: "Pending",
        value: "PENDING",
        className: "border-warning bg-warning-soft text-warning",
        icon: Clock3,
      };
  }
};
