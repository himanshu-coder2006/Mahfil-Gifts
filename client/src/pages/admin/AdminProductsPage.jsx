import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { productAPI } from '../../services/api';
import { getAdminProducts, saveAdminProducts } from '../../utils/storage';
import { showNotification } from '../../store/slices/notificationSlice';
import { formatINR, productImage, percentOff } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const CATEGORY_OPTIONS = [
  { slug: 'bags-totes', name: 'Bags & Totes' },
  { slug: 'wallets-pouches', name: 'Wallets & Pouches' },
  { slug: 'drinkware', name: 'Drinkware' },
  { slug: 'home-decor', name: 'Home Decor' },
  { slug: 'jewellery', name: 'Jewellery' },
  { slug: 'kids', name: 'Kids' },
  { slug: 'travel', name: 'Travel' },
  { slug: 'personalised-gifts', name: 'Personalised Gifts' },
];

const blankForm = {
  name: '', slug: '', category: CATEGORY_OPTIONS[0].slug, price: '',
  originalPrice: '', description: '', stock: 1, status: true,
};

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const local = getAdminProducts();
    if (local.length > 0) {
      setProducts(local);
      setLoading(false);
    } else {
      productAPI
        .getAll({})
        .then((res) => {
          const mapped = (res.data || []).map((p) => ({
            _id: p._id,
            name: p.name,
            slug: p.slug,
            category: { slug: p.category?.slug, name: p.category?.name },
            price: p.price,
            originalPrice: p.originalPrice,
            thumbnail: p.thumbnail || p.images?.[0],
            stock: p.stock,
            description: p.description,
            status: true,
            tags: p.tags || [],
          }));
          saveAdminProducts(mapped);
          setProducts(mapped);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, []);

  const persist = (next) => {
    saveAdminProducts(next);
    setProducts(next);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(blankForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, category: p.category?.slug || p.category || '', price: p.price,
      originalPrice: p.originalPrice, description: p.description || '', stock: p.stock ?? 0, status: p.status ?? true,
    });
    setModalOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.price) {
      dispatch(showNotification({ message: 'Name and price are required.', type: 'error' }));
      return;
    }
    const payload = {
      _id: editing?._id || 'local-' + Date.now(),
      name: form.name.trim(),
      slug: (form.slug || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, ''),
      category: { slug: form.category, name: CATEGORY_OPTIONS.find((c) => c.slug === form.category)?.name },
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || 0,
      thumbnail: editing?.thumbnail || productImage({}),
      stock: Number(form.stock),
      description: form.description,
      status: form.status,
      tags: editing?.tags || [],
    };
    const next = editing ? products.map((p) => (p._id === editing._id ? payload : p)) : [payload, ...products];
    persist(next);
    setModalOpen(false);
    dispatch(showNotification({ message: editing ? 'Product updated successfully.' : 'Product added successfully.' }));
  };

  const confirmDelete = (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    persist(products.filter((x) => x._id !== p._id));
    dispatch(showNotification({ message: 'Product deleted.' }));
  };

  const filtered = products.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
          <p className="mt-1 text-sm text-muted">{products.length} products in your store.</p>
        </div>
        <Button variant="accent" size="md" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <input
          className="field max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
        />

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading products…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wider text-muted uppercase">
                  <th className="pb-2 font-semibold">Product</th>
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold">Price</th>
                  <th className="pb-2 font-semibold">Stock</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const off = percentOff(p.price, p.originalPrice);
                  return (
                    <tr key={p._id} className="border-b border-line/60">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnail || productImage(p)} alt="" className="h-11 w-11 rounded-lg object-cover" />
                          <div>
                            <p className="max-w-xs truncate font-medium text-primary">{p.name}</p>
                            {off > 0 && <p className="text-xs text-accent">{off}% off</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-ink/70">{p.category?.name || p.category || '—'}</td>
                      <td className="py-3">
                        <p className="font-semibold text-primary">{formatINR(p.price)}</p>
                        {p.originalPrice > p.price && <p className="text-xs text-muted line-through">{formatINR(p.originalPrice)}</p>}
                      </td>
                      <td className="py-3">
                        <span className={`font-medium ${p.stock <= 5 ? 'text-accent' : 'text-ink/80'}`}>{p.stock}</span>
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === false ? 'bg-accent/10 text-accent' : 'bg-emerald-100 text-emerald-700'}`}>
                          {p.status === false ? 'Inactive' : p.stock <= 5 ? 'Low stock' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => openEdit(p)} className="rounded-full p-2 text-primary hover:bg-light" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => confirmDelete(p)} className="rounded-full p-2 text-accent hover:bg-accent/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-10 text-center text-muted">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label">Product Name *</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Personalised Floral Box Bag" />
          </div>
          <div>
            <label className="field-label">Category *</label>
            <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORY_OPTIONS.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Slug (URL)</label>
            <input className="field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated if empty" />
          </div>
          <div>
            <label className="field-label">Price (₹) *</label>
            <input className="field" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1299" />
          </div>
          <div>
            <label className="field-label">Original Price (₹)</label>
            <input className="field" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="2999" />
          </div>
          <div>
            <label className="field-label">Stock</label>
            <input className="field" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
              <input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} className="h-4 w-4 accent-[#E94560]" />
              In stock / Active
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">Description</label>
            <textarea className="field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the product page" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="accent" onClick={save}>Save Product</Button>
        </div>
      </Modal>
    </div>
  );
}