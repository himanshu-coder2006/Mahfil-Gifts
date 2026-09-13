import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { adminAPI } from '../../services/api';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../../components/ui/Button';

const BLANK = {
  websiteName: '',
  email: '',
  phone: '',
  address: '',
  freeShippingThreshold: 1999,
  shippingCharge: 99,
  codCharge: 40,
  buy2Discount: 5,
  buy3Discount: 10,
};

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(BLANK);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getSettings()
      .then((res) => setForm((prev) => ({ ...prev, ...(res.data || {}) })))
      .catch(() => setForm(BLANK))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.saveSettings({
        websiteName: form.websiteName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        freeShippingThreshold: Number(form.freeShippingThreshold) || 1999,
        shippingCharge: Number(form.shippingCharge) || 99,
        codCharge: Number(form.codCharge) || 40,
        buy2Discount: Number(form.buy2Discount) || 5,
        buy3Discount: Number(form.buy3Discount) || 10,
      });
      setSaved(true);
      dispatch(showNotification({ message: 'Store settings saved.' }));
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      dispatch(showNotification({ message: err?.message || 'Could not save settings.', type: 'error' }));
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">Loading settings…</div>;
  }

  return (
    <form onSubmit={save}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Store Settings</h1>
          <p className="mt-1 text-sm text-muted">Manage store info, delivery and discounts.</p>
        </div>
        <Button variant="accent" type="submit">{saved ? 'Saved ✓' : 'Save Settings'}</Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Store info */}
        <Section title="Store Info" icon="🏪">
          <div className="space-y-4">
            <div>
              <label className="field-label">Store Name</label>
              <input className="field" value={form.websiteName} onChange={(e) => set('websiteName', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Contact Email</label>
                <input className="field" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Contact Phone</label>
                <input className="field" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Store Address</label>
              <textarea className="field" rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Delivery Settings" icon="🚚">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Free Delivery Above (₹)</label>
              <input className="field" type="number" value={form.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Standard Delivery (₹)</label>
              <input className="field" type="number" value={form.shippingCharge} onChange={(e) => set('shippingCharge', e.target.value)} />
            </div>
            <div>
              <label className="field-label">COD Charge (₹)</label>
              <input className="field" type="number" value={form.codCharge} onChange={(e) => set('codCharge', e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">Cart & checkout totals update automatically after saving.</p>
        </Section>

        {/* Discounts */}
        <Section title="Discount Rules" icon="🏷️">
          <p className="mb-4 text-xs text-muted">Auto-applied in the cart based on total quantities.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Buy 2 items — % off</label>
              <input className="field" type="number" min={0} max={100} value={form.buy2Discount} onChange={(e) => set('buy2Discount', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Buy 3+ items — % off</label>
              <input className="field" type="number" min={0} max={100} value={form.buy3Discount} onChange={(e) => set('buy3Discount', e.target.value)} />
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-6 text-right">
        <Button variant="accent" type="submit">{saved ? 'Saved ✓' : 'Save Settings'}</Button>
      </div>
    </form>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-display text-lg font-bold text-primary">{icon} {title}</h2>
      {children}
    </div>
  );
}