import { getSettings } from './storage';

export const computeCartTotals = (items) => {
  const settings = getSettings();
  const subtotal = items.reduce((sum, item) => sum + Number(item.product?.price || item.price || 0) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  let discountLabel = null;
  if (totalItems >= 3) {
    discount = Math.round((subtotal * settings.buy3Discount) / 100);
    discountLabel = `Buy 3+ — ${settings.buy3Discount}% off applied`;
  } else if (totalItems >= 2) {
    discount = Math.round((subtotal * settings.buy2Discount) / 100);
    discountLabel = `Buy 2+ — ${settings.buy2Discount}% off applied`;
  }

  const delivery = subtotal - discount >= settings.freeShippingThreshold ? 0 : settings.deliveryCharge;
  const total = Math.max(0, subtotal - discount) + delivery;

  return { subtotal, discount, discountLabel, delivery, total, totalItems };
};

export const orderTotalComputed = (order) => {
  const subtotal = order.items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);
  return { ...order, subtotal };
};

export const SHIPPING_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];