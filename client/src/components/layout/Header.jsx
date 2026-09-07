import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import { productAPI } from '../../services/api';
import { formatINR, productImage } from '../../utils/format';

const to = {
  cat: (s) => `/shop?category=${s}`,
  tag: (s) => `/shop?tag=${s}`,
  gender: (s) => `/shop?gender=${s}`,
  sale: () => '/shop?sale=1',
  search: (s) => `/shop?search=${encodeURIComponent(s)}`,
  best: () => '/shop?bestseller=true',
  new: () => '/shop?newArrival=true',
  all: () => '/shop',
};

const NAV = [
  {
    label: 'Men',
    columns: [
      { title: 'Shop Men', links: [['Shop All Men', to.gender('men')], ['Gift Sets', to.tag('gift-set')], ['Wallets', to.tag('wallet')], ['Laptop Bags', to.tag('laptop')]] },
      { title: 'Popular', links: [['Leather Wallets', to.tag('leather')], ['Travel Kits', to.cat('travel')], ['Drinkware', to.cat('drinkware')], ['Personalised', to.cat('personalised-gifts')]] },
      { title: 'Curated', links: [['Bestsellers', to.best()], ['New Arrivals', to.new()], ['Sale 🔥', to.sale()]] },
    ],
  },
  {
    label: 'Women',
    columns: [
      { title: 'Shop Women', links: [['Shop All Women', to.gender('women')], ['Gift Sets', to.tag('gift-set')], ['Bags & Totes', to.cat('bags-totes')], ['Wallets & Pouches', to.cat('wallets-pouches')]] },
      { title: 'Discover', links: [['Jewellery', to.cat('jewellery')], ['Home Decor', to.cat('home-decor')], ['Photo Mugs', to.tag('mug')], ['Name Necklaces', to.tag('name necklace')]] },
      { title: 'Curated', links: [['Bestsellers', to.best()], ['New Arrivals', to.new()], ['Sale 🔥', to.sale()]] },
    ],
  },
  {
    label: 'Kids',
    columns: [
      { title: 'Shop Kids', links: [['Shop All Kids', to.cat('kids')], ['Lunch Bags', to.tag('lunch-bag')], ['Duffle Bags', to.tag('duffle')], ['Sling & Bottle Combos', to.tag('combo')]] },
      { title: 'Curated', links: [['Drinkware', to.cat('drinkware')], ['Bestsellers', to.best()], ['New Arrivals', to.new()], ['Sale 🔥', to.sale()]] },
    ],
  },
  {
    label: 'Bags',
    columns: [
      { title: 'Shop Bags', links: [['Shop All Bags', to.cat('bags-totes')], ['Box Bags', to.tag('box-bag')], ['Totes', to.tag('tote')], ['Pouches', to.tag('pouch')]] },
      { title: 'Carry', links: [['Laptop Sleeves', to.tag('laptop')], ['Shoulder Bags', to.tag('shoulder-bag')], ['Travel Bags', to.cat('travel')], ['Sale 🔥', to.sale()]] },
    ],
  },
  { labelExtra: 'Sale 🔥', href: to.sale(), accent: true },
];

function MVLink({ href, onClick, children, className = '' }) {
  return (
    <Link to={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const user = useSelector((s) => s.auth.user);
  const cartItems = useSelector((s) => s.cart.items);
  const wishlist = useSelector((s) => s.wishlist.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);
  const searchTimer = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  const openSearch = () => { setSearchOpen(true); setSearchError(false); };
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  const runSearch = (q) => {
    setSearching(true);
    productAPI.getAll({ search: q })
      .then((res) => {
        setResults(res.data || []);
        setSearchError(false);
      })
      .catch(() => setSearchError(true))
      .finally(() => setSearching(false));
  };

  const onQuery = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setResults([]); return; }
    searchTimer.current = setTimeout(() => runSearch(q.trim()), 350);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserMenu(false);
    setMobileOpen(false);
    navigate('/');
    dispatch(showNotification({ message: 'You have been logged out.' }));
  };

  const resetHover = () => { clearTimeout(closeTimer.current); setOpenMenu(null); };

  return (
    <>
      {/* Desktop / sticky header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-none'}`}
        onMouseLeave={resetHover}
      >
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Mobile hamburger */}
          <button className="p-2 text-primary md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0 select-none md:mr-6" onClick={() => setMobileOpen(false)}>
            <span className="font-display text-xl font-bold tracking-tight text-primary md:text-2xl">
              Gifted<span className="text-accent">Threads</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              if (item.labelExtra) {
                return (
                  <MVLink key={item.labelExtra} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/10">
                    {item.labelExtra}
                  </MVLink>
                );
              }
              return (
                <div key={item.label} className="relative" onMouseEnter={() => { clearTimeout(closeTimer.current); setOpenMenu(item.label); }}>
                  <button
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-light ${openMenu === item.label ? 'text-accent' : 'text-primary'}`}
                  >
                    {item.label} <ChevronDown className={`h-3.5 w-3.5 transition ${openMenu === item.label ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <button onClick={openSearch} className="rounded-full p-2 text-primary hover:bg-light" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full p-2 text-primary hover:bg-light"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
                {user && <span className="hidden max-w-[90px] truncate text-sm font-medium md:block">{user.name?.split(' ')[0]}</span>}
              </button>
              {userMenu && (
                <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-line">
                  {user ? (
                    <>
                      <div className="border-b border-line bg-light px-4 py-3">
                        <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <MVLink href="/account" className="block border-b border-line px-4 py-2.5 text-sm text-ink hover:bg-light" onClick={() => setUserMenu(false)}>My Account</MVLink>
                      <MVLink href="/wishlist" className="block border-b border-line px-4 py-2.5 text-sm text-ink hover:bg-light" onClick={() => setUserMenu(false)}>My Wishlist</MVLink>
                      <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm text-accent hover:bg-light">Logout</button>
                    </>
                  ) : (
                    <>
                      <MVLink href="/login" className="block border-b border-line px-4 py-3 text-sm font-medium text-primary hover:bg-light" onClick={() => setUserMenu(false)}>Login</MVLink>
                      <MVLink href="/register" className="block px-4 py-3 text-sm text-ink hover:bg-light" onClick={() => setUserMenu(false)}>Create Account</MVLink>
                    </>
                  )}
                </div>
              )}
            </div>

            <MVLink href="/wishlist" className="relative hidden rounded-full p-2 text-primary hover:bg-light sm:block" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{wishlist.length}</span>
              )}
            </MVLink>

            <MVLink href="/cart" className="relative rounded-full p-2 text-primary hover:bg-light" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{cartCount}</span>
              )}
            </MVLink>
          </div>
        </div>

        {/* Mega dropdowns */}
        {openMenu && (
          <div className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-xl lg:block">
            {(() => {
              const item = NAV.find((n) => n.label === openMenu);
              if (!item) return null;
              return (
                <div className="grid max-w-4xl gap-8 px-8 py-8" style={{ gridTemplateColumns: `repeat(${item.columns.length}, 1fr)` }}>
                  {item.columns.map((col) => (
                    <div key={col.title}>
                      <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">{col.title}</p>
                      <ul className="space-y-2">
                        {col.links.map(([label, href]) => (
                          <li key={label}>
                            <MVLink href={href} className="mega-link" onClick={resetHover}>{label}</MVLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-primary/60 backdrop-blur-sm" onClick={closeSearch}>
          <div
            className="anim-fade-up mx-auto mt-20 w-[94%] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-primary">Search GiftedThreads</h3>
              <button onClick={closeSearch} className="rounded-full p-2 text-muted hover:bg-light" aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-full border border-line bg-light px-4 py-3">
              <Search className="h-5 w-5 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={onQuery}
                placeholder="Search bags, wallets, mugs, gifts..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
              />
            </div>
            {window.innerWidth <= 640 && <p className="mt-2 text-[11px] text-muted">Live results below as you type</p>}

            <div className="mt-4 space-y-1">
              {searching && <p className="py-4 text-center text-sm text-muted">Searching…</p>}
              {searchError && <p className="py-4 text-center text-sm text-accent">Could not search right now.</p>}
              {query.trim().length >= 2 && !searching && !searchError && results.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">No products found for "{query}".</p>
              )}
              {results.slice(0, 6).map((p) => (
                <MVLink key={p._id} href={`/product/${p.slug}`} onClick={closeSearch} className="flex items-center gap-3 rounded-xl p-2 hover:bg-light">
                  <img src={productImage(p)} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary">{p.name}</p>
                    <p className="text-xs text-muted">{p.category?.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-accent">{formatINR(p.price)}</p>
                </MVLink>
              ))}
            </div>

            <button
              onClick={() => { navigate(`/shop?search=${encodeURIComponent(query)}`); closeSearch(); }}
              className="mt-4 w-full rounded-full border border-primary py-2.5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
            >
              View all results for "{query}"
            </button>
          </div>
        </div>
      )}

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] bg-primary/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-[86%] max-w-sm overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4">
              <span className="font-display text-xl font-bold text-primary">Gifted<span className="text-accent">Threads</span></span>
              <button className="rounded-full p-2 text-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-5 pb-8">
              {user ? (
                <div className="mb-4 rounded-xl bg-light p-4">
                  <p className="font-semibold text-primary">Hi, {user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              ) : (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <MVLink href="/login" className="btn btn-primary !rounded-full py-2.5 text-center text-sm" onClick={() => setMobileOpen(false)}>Login</MVLink>
                  <MVLink href="/register" className="btn btn-outline !rounded-full py-2.5 text-center text-sm" onClick={() => setMobileOpen(false)}>Register</MVLink>
                </div>
              )}

              <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Shop</p>
              <div className="space-y-1">
                {NAV.map((item) => {
                  if (item.labelExtra) {
                    return (
                      <MVLink key="sale" href={item.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-semibold text-accent">
                        {item.labelExtra}
                      </MVLink>
                    );
                  }
                  return (
                    <div key={item.label} className="border-b border-line/60 py-1">
                      <p className="py-1.5 text-sm font-semibold text-primary">{item.label}</p>
                      <div className="grid grid-cols-2 gap-x-2 pb-2 pl-2">
                        {item.columns.flatMap((c) => c.links).map(([label, href]) => (
                          <MVLink key={label} href={href} onClick={() => setMobileOpen(false)} className="py-1 text-[13px] text-ink/80 hover:text-accent">
                            {label}
                          </MVLink>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 mb-2 text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">Account</p>
              <div className="space-y-1">
                <MVLink href="/account" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-ink">My Account</MVLink>
                <MVLink href="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-ink">My Wishlist</MVLink>
                <MVLink href="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-ink">My Cart ({cartCount})</MVLink>
                {user && (
                  <button onClick={handleLogout} className="block py-2 text-sm text-accent">Logout</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}