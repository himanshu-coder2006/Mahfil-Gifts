import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../../utils/storage';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../../components/ui/Button';

export default function AdminSettingsPage() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = (e) => {
    e.preventDefault();
    saveSettings({
      ...DEFAULT_SETTINGS,
      ...form,
      announcements: Array.isArray(form.announcements) ? form.announcements.filter((a) => a.trim()) : [],
      freeShippingThreshold: Number(form.freeShippingThreshold) || 999,
      deliveryCharge: Number(form.deliveryCharge) || 99,
      codCharge: Number(form.codCharge) || 40,
      buy2Discount: Number(form.buy2Discount) || 5,
      buy3Discount: Number(form.buy3Discount) || 10,
    });
    setSaved(true);
    dispatch(showNotification({ message: 'Store settings saved.' }));
    setTimeout(() => setSaved(false), 2000);
  };

  const setAnn = (i, v) => {
    const arr = [...form.announcements];
    arr[i] = v;
    set('announcements', arr);
  };

  return (
    <form onSubmit={save}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Store Settings</h1>
          <p className="mt-1 text-sm text-muted">Manage store info, announcements, delivery and discounts.</p>
        </div>
        <Button variant="accent" type="submit">{saved ? 'Saved ✓' : 'Save Settings'}</Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Store info */}
        <Section title="Store Info" icon="🏪">
          <div className="space-y-4">
            <div>
              <label className="field-label">Store Name</label>
              <input className="field" value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Contact Email</label>
                <input className="field" type="email" value={form.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Contact Phone</label>
                <input className="field" value={form.storePhone} onChange={(e) => set('storePhone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="field-label">Store Address</label>
              <textarea className="field" rows={2} value={form.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} />
            </div>
            <div>
              <label className="field-label">WhatsApp Number (with country code)</label>
              <input className="field" value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="919999000000" />
            </div>
          </div>
        </Section>

        {/* Announcements */}
        <Section title="Announcement Bar Messages" icon="📢">
          <p className="mb-4 text-xs text-muted">These rotate in the top announcement bar every 3 seconds.</p>
          <div className="space-y-3">
            {form.announcements.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light text-xs font-bold text-primary">{i + 1}</span>
                <input className="field" value={a} onChange={(e) => setAnn(i, e.target.value)} />
              </div>
            ))}
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
              <input className="field" type="number" value={form.deliveryCharge} onChange={(e) => set('deliveryCharge', e.target.value)} />
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