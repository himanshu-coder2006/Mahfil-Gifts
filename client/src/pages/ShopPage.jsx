import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import Loader from '../components/Loader';
import { percentOff } from '../utils/format';

const PRICE_MAP = {
  'Under ₹500': [0, 500],
  '₹500 – ₹999': [500, 999],
  '₹1,000 – ₹1,499': [1000, 1499],
  'Above ₹1,500': [1500, null],
};

const FLAG_KEYS = ['sale', 'newArrival', 'bestseller'];
const SCALAR_KEYS = ['category', 'tag', 'gender', 'price'];

function genderMatch(p, gender) {
  const tags = (p.tags || []).map((t) => t.toLowerCase());
  if (gender === 'men') return tags.includes('mens') || tags.includes('men');
  if (gender === 'women') return tags.includes('women');
  if (gender === 'kids') return tags.includes('kids');
  return true;
}

function tagMatch(p, tag) {
  const target = tag.toLowerCase().replace(/-/g, ' ');
  return (p.tags || []).some((t) => t.toLowerCase() === target || t.toLowerCase().includes(target) || target.includes(t.toLowerCase()));
}

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const state = useMemo(
    () => ({
      category: params.get('category') || '',
      sort: params.get('sort') || 'newest',
      search: params.get('search') || '',
      tag: params.get('tag') || '',
      gender: params.get('gender') || '',
      price: params.get('price') || '',
      maxPrice: params.get('maxPrice') || '',
      sale: params.get('sale') || '',
      newArrival: params.get('newArrival') || '',
      bestseller: params.get('bestseller') || '',
    }),
    [params]
  );

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = { sort: state.sort };
    if (state.category) q.category = state.category;
    if (state.search) q.search = state.search;
    productAPI
      .getAll(q)
      .then((res) => setRaw(res.data || []))
      .catch(() => setRaw([]))
      .finally(() => setLoading(false));
  }, [state.category, state.search, state.sort]);

  const setFilter = (key, value) => {
    const sp = new URLSearchParams(params);
    if (value) sp.set(key, value);
    else sp.delete(key);
    navigate(`/shop${sp.toString() ? `?${sp.toString()}` : ''}`, { replace: true });
  };

  const clearAll = () => navigate('/shop', { replace: true });

  const filtered = useMemo(() => {
    let list = raw;
    if (state.maxPrice) list = list.filter((p) => Number(p.price) <= Number(state.maxPrice));
    if (state.price) {
      const [min, max] = PRICE_MAP[state.price] || [null, null];
      list = list.filter((p) => {
        const price = Number(p.price);
        if (min != null && price < min) return false;
        if (max != null && price >= max) return false;
        return true;
      });
    }
    if (state.tag) list = list.filter((p) => tagMatch(p, state.tag));
    if (state.gender) list = list.filter((p) => genderMatch(p, state.gender));
    if (state.sale) list = list.filter((p) => percentOff(p.price, p.originalPrice) >= 50);
    if (state.newArrival) list = list.filter((p) => p.newArrival);
    if (state.bestseller) list = list.filter((p) => p.bestseller);
    return list;
  }, [raw, state]);

  const activeCategory = categories.find((c) => c.slug === state.category);
  const activeChips = [
    state.category && activeCategory ? { label: activeCategory.name, clear: () => setFilter('category', '') } : null,
    state.tag ? { label: `Type: ${state.tag}`, clear: () => setFilter('tag', '') } : null,
    state.gender ? { label: `For: ${state.gender}`, clear: () => setFilter('gender', '') } : null,
    state.price ? { label: state.price, clear: () => setFilter('price', '') } : null,
    state.sale ? { label: 'On Sale', clear: () => setFilter('sale', '') } : null,
    state.newArrival ? { label: 'New Arrivals', clear: () => setFilter('newArrival', '') } : null,
    state.bestseller ? { label: 'Bestsellers', clear: () => setFilter('bestseller', '') } : null,
  ].filter(Boolean);

  return (
    <div className="bg-light">
      {/* Banner */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <nav className="text-xs text-white/50">
            <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>Home</span>
            <span className="mx-2">/</span>
            <span className="text-white/80">Shop{activeCategory ? ` / ${activeCategory.name}` : ''}</span>
          </nav>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            {activeCategory?.name || (state.search ? `Results for “${state.search}”` : 'All Gifts')}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {state.search ? 'Personalised gifts matching your search' : 'Made for them. Made by you.'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <ProductFilters state={state} set={setFilter} onClear={clearAll} counts={{ categories }} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Showing <span className="font-semibold text-primary">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-primary lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <select
                  value={state.sort}
                  onChange={(e) => setFilter('sort', e.target.value)}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="popular">Sort: Popular</option>
                  <option value="rating">Sort: Top Rated</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? <Loader /> : <ProductGrid products={filtered} cols={3} />}

            {activeChips.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted">Active filters:</span>
                {activeChips.map((c, i) => (
                  <button
                    key={i}
                    onClick={c.clear}
                    className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-dark"
                  >
                    {c.label} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-[75] bg-primary/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
            <div className="absolute top-0 right-0 bottom-0 w-[86%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-primary">Filters</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-muted">✕</button>
              </div>
              <ProductFilters state={state} set={setFilter} onClear={clearAll} counts={{ categories }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}