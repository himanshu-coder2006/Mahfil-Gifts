import Setting from '../models/Setting.js';

const DEFAULT_PRICING = {
  freeShippingThreshold: 1999,
  shippingCharge: 99,
  codCharge: 40,
  buy2Discount: 5,
  buy3Discount: 10,
};

export const getPricing = async () => {
  try {
    const s = await Setting.findOne();
    if (!s) return DEFAULT_PRICING;
    return {
      freeShippingThreshold: s.freeShippingThreshold ?? DEFAULT_PRICING.freeShippingThreshold,
      shippingCharge: s.shippingCharge ?? DEFAULT_PRICING.shippingCharge,
      codCharge: s.codCharge ?? DEFAULT_PRICING.codCharge,
      buy2Discount: s.buy2Discount ?? DEFAULT_PRICING.buy2Discount,
      buy3Discount: s.buy3Discount ?? DEFAULT_PRICING.buy3Discount,
    };
  } catch {
    return DEFAULT_PRICING;
  }
};

const priceOf = (item) => Number(item.price ?? item.product?.price ?? 0);

export const computeTotals = (items, pricing = {}) => {
  const p = { ...DEFAULT_PRICING, ...pricing };
  const subtotal = items.reduce((sum, item) => sum + priceOf(item) * Number(item.quantity || 0), 0);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  let discount = 0;
  if (totalItems >= 3) {
    discount = Math.round((subtotal * p.buy3Discount) / 100);
  } else if (totalItems >= 2) {
    discount = Math.round((subtotal * p.buy2Discount) / 100);
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = afterDiscount >= p.freeShippingThreshold ? 0 : p.shippingCharge;

  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    shipping,
    codFee: p.codCharge,
    total: afterDiscount + shipping,
    totalItems,
  };
};

export const computeOrderTotals = async (items, paymentMethod) => {
  const pricing = await getPricing();
  const totals = computeTotals(items, pricing);
  const codFee = paymentMethod === 'cod' ? pricing.codCharge : 0;
  return {
    ...totals,
    codFee,
    totalAmount: totals.total + codFee,
  };
};