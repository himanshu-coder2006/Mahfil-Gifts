export const formatINR = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const percentOff = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const productPrice = (p) => Number(p?.price || 0);
export const productOriginal = (p) => Number(p?.originalPrice || 0);
export const productImage = (p) => p?.thumbnail || p?.images?.[0] || 'https://placehold.co/500x500/f8f0e8/1a1a2e?text=GiftedThreads';
export const productImages = (p) =>
  (p?.images && p.images.length ? p.images : [productImage(p)]);

export const STAR_ROWS = [1, 2, 3, 4, 5];