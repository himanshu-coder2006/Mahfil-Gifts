const getShippingCost = ({ pincode, subtotal = 0, zone = 'A' }) => {
  const zoneMap = {
    A: { shippingCharge: 99, freeShippingThreshold: 1999, cod: true, deliveryDays: 4 },
    B: { shippingCharge: 149, freeShippingThreshold: 2499, cod: true, deliveryDays: 5 },
    C: { shippingCharge: 199, freeShippingThreshold: 2999, cod: false, deliveryDays: 7 },
    'Remote Area': { shippingCharge: 299, freeShippingThreshold: 3999, cod: false, deliveryDays: 10 },
  };

  const config = zoneMap[zone] || zoneMap.A;
  const shippingCharge = subtotal >= config.freeShippingThreshold ? 0 : config.shippingCharge;

  return {
    serviceable: Boolean(pincode && pincode.length >= 6),
    estimatedDelivery: `Estimated delivery in ${config.deliveryDays} days`,
    codAvailable: config.cod,
    shippingCharge,
    zone,
  };
};

export default { getShippingCost };
