export const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const percentOff = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const productPrice = (p) => Number(p?.price || 0);
export const productOriginal = (p) => Number(p?.originalPrice || 0);
export const productImage = (p) => p?.thumbnail || p?.images?.[0] || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85';
export const productImages = (p) =>
  (p?.images && p.images.length ? p.images : [productImage(p)]);

export const STAR_ROWS = [1, 2, 3, 4, 5];