const calculateSellingPrice = (item, settings) => {
  const nairaPrice = item.providerPrice * settings.usdToNgnRate;

  if (Number(item.customPrice)) {
    return item.customPrice;
  }

  if (settings.globalMarkupType === "percentage") {
    return nairaPrice + (nairaPrice * settings.globalMarkupValue) / 100;
  }

  return nairaPrice + settings.globalMarkupValue;
};

export default calculateSellingPrice;
