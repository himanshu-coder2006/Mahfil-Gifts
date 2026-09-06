import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { showNotification } from '../store/slices/notificationSlice';
import ProductCard from '../components/product/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';

function WishlistPage() {
  const { items } = useSelector((s) => s.wishlist);
  const dispatch = useDispatch();

  const handleToggle = (productId) => {
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then(() => dispatch(showNotification({ message: 'Removed from wishlist.' })))
      .catch(() => {});
  };

  const handleAddAll = () => {
    const requests = items.map((product) => dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap());
    Promise.allSettled(requests).then(() => {
      dispatch(showNotification({ message: 'All items added to your bag. 🛍️' }));
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <Heart className="mx-auto h-16 w-16 text-line" />
        <h1 className="mt-6 font-display text-3xl font-bold text-primary">Your wishlist is empty</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">Save the gifts you love and find them here later.</p>
        <Link to="/shop" className="mt-8 inline-block"><Button variant="accent" size="lg">Shop gifts</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow">Wishlist</p>
          <h1 className="section-title">Your saved gifts ({items.length})</h1>
          <div className="section-underline" />
        </div>
        <Button variant="outline" onClick={handleAddAll}>Add all to cart</Button>
      </div>
      <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <div key={product._id} className="relative">
            <button
              onClick={() => handleToggle(product._id)}
              aria-label="Remove from wishlist"
              className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white shadow transition hover:bg-accent"
            >
              ✕
            </button>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;