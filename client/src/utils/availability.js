export const getNumberAvailabilityInfo = (item) => {
  const stock = Number(item.stock ?? 0);

  // Providers that expose stock (e.g. SMSBower)
  if (Number.isFinite(stock) && stock > 0) {
    if (stock >= 100) {
      return {
        label: "High Availability",
        detail: `${stock} in stock`,
        score: stock,
        className:
          "border-success bg-success-soft text-success",
      };
    }

    if (stock >= 25) {
      return {
        label: "Good Availability",
        detail: `${stock} in stock`,
        score: stock,
        className: "border-info bg-info-soft text-info",
      };
    }

    if (stock >= 5) {
      return {
        label: "Limited Availability",
        detail: `${stock} in stock`,
        score: stock,
        className: "border-warning bg-warning-soft text-warning",
      };
    }

    return {
      label: "Very Limited",
      detail: `${stock} in stock`,
      score: stock,
      className:
        "border-brand bg-brand-soft text-on-brand",
    };
  }

  // Providers that don't expose stock (e.g. SMSPool)
  if (item?.availability === true) {
    return {
      label: "Available",
      detail: "Stock unavailable",
      score: 1,
      className: "border-info bg-info-soft text-info",
    };
  }

  return {
    label: "Unavailable",
    detail: "No active route",
    score: 0,
    className: "border-brand bg-brand text-on-brand",
  };
};