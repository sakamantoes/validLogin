import { getTransactionStatusBadge } from "../../utils/transaction.js";

export default function TransactionStatusBadge({ status, className = "" }) {
  const statusBadge = getTransactionStatusBadge(status);
  const StatusIcon = statusBadge.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className} ${className}`}
    >
      <StatusIcon size={12} />
      {statusBadge.label}
    </span>
  );
}
