import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { orderAPI } from '../services/api';
import { clearCart } from '../store/slices/cartSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { formatINR } from '../utils/format';
import { computeCartTotals, SHIPPING_STATES } from '../utils/order';
import { getSettings, saveOrder, upsertCustomer } from '../utils/storage';
import Button from '../components/ui/Button';

const PAY_METHODS = [
  { id: 'UPI', title: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
  { id: 'Card', title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay, AmEx', icon: '💳' },
  { id: 'NetBanking', title: 'Net Banking', desc: 'All major banks', icon: '🏦' },
  { id: 'COD', title: 'Cash on Delivery', desc: 'Pay at your doorstep', icon: '💵' },
];

const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.auth.user);
  const settings = getSettings();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.mobile || '',
    email: user?.email || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    saveAddress: false,
  });
  const [errors, setErrors] = useState({});

  const [payMethod, setPayMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('user@upi');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState(BANKS[0]);

  const totals = useMemo(() => computeCartTotals(items), [items]);
  const codFee = payMethod === 'COD' ? settings.codCharge : 0;
  const finalTotal = totals.total + codFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-5xl">🧺</p>
        <h1 className="mt-5 font-display text-2xl font-bold text-primary">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted">Add some gifts before you check out.</p>
        <Link to="/shop" className="mt-6 inline-block"><Button variant="accent">Go to Shop</Button></Link>
      </div>
    );
  }

  const setFormField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'Select a state';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    if (payMethod === 'UPI' && !/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
      dispatch(showNotification({ message: 'Enter a valid UPI ID (e.g. name@upi).', type: 'error' }));
      return false;
    }
    if (payMethod === 'Card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length < 12) {
        dispatch(showNotification({ message: 'Enter a valid card number.', type: 'error' }));
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
        dispatch(showNotification({ message: 'Expiry must be MM/YY.', type: 'error' }));
        return false;
      }
      if (!/^\d{3,4}$/.test(card.cvv)) {
        dispatch(showNotification({ message: 'Enter a valid CVV.', type: 'error' }));
        return false;
      }
    }
    return true;
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const paymentMethodLabel =
        payMethod === 'COD' ? 'Cash on Delivery' : payMethod === 'Card' ? 'Credit/Debit Card' : payMethod === 'NetBanking' ? `Net Banking (${bank})` : 'UPI';

      let serverOrder = null;
      try {
        const res = await orderAPI.create({
          shippingAddress: {
            fullName: form.fullName, phone: form.phone, email: form.email,
            addressLine1: form.addressLine1, addressLine2: form.addressLine2,
            city: form.city, state: form.state, pincode: form.pincode,
          },
          paymentMethod: payMethod === 'COD' ? 'cod' : 'razorpay',
        });
        serverOrder = res.data;
      } catch (err) {
        // Backend unreachable — still complete the order locally (simulated checkout).
        dispatch(showNotification({ message: 'Seamless fallback: order saved locally.', type: 'success' }));
      }

      const mirror = {
        orderId: serverOrder?._id || 'GFT' + Date.now(),
        date: new Date().toISOString(),
        customer: { name: form.fullName, email: form.email, phone: form.phone },
        items: items.map((i) => ({ name: i.product?.name, quantity: i.quantity, price: Number(i.product?.price || 0), personalised: i.variant?.personalisation || '' })),
        address: { addressLine1: form.addressLine1, addressLine2: form.addressLine2, city: form.city, state: form.state, pincode: form.pincode },
        paymentMethod: paymentMethodLabel,
        subtotal: totals.subtotal,
        discount: totals.discount,
        delivery: totals.delivery,
        codFee,
        total: finalTotal,
        status: 'Processing',
      };
      saveOrder(mirror);
      upsertCustomer({
        name: form.fullName, email: form.email, phone: form.phone,
        joined: new Date().toISOString().slice(0, 10), orders: 1, spent: finalTotal,
      });

      if (form.saveAddress) {
        const key = `gt_addresses`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ ...form, saveAddress: undefined, email: user?.email || form.email });
        localStorage.setItem(key, JSON.stringify(existing));
      }

      dispatch(clearCart());
      navigate(`/order-success/${mirror.orderId}`);
    } finally {
      setPlacing(false);
    }
  };

  const steps = ['Delivery Details', 'Payment', 'Review'];

  return (
    <div className="bg-light">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-2">
          {steps.map((label, i) => {
            const n = i + 1;
            return (
              <React.Fragment key={label}>
                {i > 0 && <div className={`h-0.5 flex-1 rounded ${step > i ? 'bg-accent' : 'bg-line'}`} />}
                <button
                  onClick={() => n < step && setStep(n)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${step === n ? 'bg-accent text-white' : step > n ? 'text-accent' : 'bg-white text-muted'}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">{n}</span>
                  {label}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {/* STEP 1 */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-primary">Delivery Details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Full Name *</label>
                    <input className="field" value={form.fullName} onChange={(e) => setFormField('fullName', e.target.value)} placeholder="Receiver's name" />
                    {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="field-label">Phone *</label>
                    <input className="field" value={form.phone} onChange={(e) => setFormField('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
                    {errors.phone && <p className="field-error">{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Email *</label>
                    <input className="field" type="email" value={form.email} onChange={(e) => setFormField('email', e.target.value)} placeholder="you@example.com" />
                    {errors.email && <p className="field-error">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Address Line 1 *</label>
                    <input className="field" value={form.addressLine1} onChange={(e) => setFormField('addressLine1', e.target.value)} placeholder="House no, Building, Street" />
                    {errors.addressLine1 && <p className="field-error">{errors.addressLine1}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label">Address Line 2</label>
                    <input className="field" value={form.addressLine2} onChange={(e) => setFormField('addressLine2', e.target.value)} placeholder="Area, Landmark (optional)" />
                  </div>
                  <div>
                    <label className="field-label">City *</label>
                    <input className="field" value={form.city} onChange={(e) => setFormField('city', e.target.value)} placeholder="City" />
                    {errors.city && <p className="field-error">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="field-label">State *</label>
                    <select className="field" value={form.state} onChange={(e) => setFormField('state', e.target.value)}>
                      <option value="">Select state</option>
                      {SHIPPING_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="field-error">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="field-label">Pincode *</label>
                    <input className="field" value={form.pincode} onChange={(e) => setFormField('pincode', e.target.value)} placeholder="6-digit pincode" maxLength={6} />
                    {errors.pincode && <p className="field-error">{errors.pincode}</p>}
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
                      <input type="checkbox" checked={form.saveAddress} onChange={(e) => setFormField('saveAddress', e.target.checked)} className="h-4 w-4 accent-[#E94560]" />
                      Save this address for next time
                    </label>
                  </div>
                </div>
                <Button variant="accent" size="lg" className="mt-6 w-full sm:w-auto" onClick={() => validateStep1() && setStep(2)}>
                  Continue to Payment →
                </Button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-primary">Payment Method</h2>
                <p className="mt-1 text-xs text-muted">🔒 This is a demo checkout — no real payment is processed.</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {PAY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`rounded-2xl border-2 p-4 text-left transition ${payMethod === m.id ? 'border-accent bg-accent/5' : 'border-line bg-white hover:border-primary/30'}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{m.icon}</span>
                        <span className={`mt-1 h-4 w-4 rounded-full border-2 ${payMethod === m.id ? 'border-accent bg-accent' : 'border-muted'}`} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-primary">{m.title}</p>
                      <p className="text-xs text-muted">{m.desc}</p>
                      {m.id === 'COD' && <p className="mt-1 text-[11px] font-medium text-accent">+ {formatINR(settings.codCharge)} COD charge</p>}
                    </button>
                  ))}
                </div>

                {payMethod === 'UPI' && (
                  <div className="mt-5 rounded-xl bg-light p-4">
                    <label className="field-label">UPI ID</label>
                    <input className="field" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" />
                  </div>
                )}
                {payMethod === 'Card' && (
                  <div className="mt-5 grid gap-4 rounded-xl bg-light p-4 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className="field-label">Card Number</label>
                      <input
                        className="field"
                        value={card.number}
                        onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/[^\d]/g, '').slice(0, 16) }))}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <label className="field-label">Expiry (MM/YY)</label>
                      <input
                        className="field"
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))}
                        placeholder="12/29"
                      />
                    </div>
                    <div>
                      <label className="field-label">CVV</label>
                      <input
                        className="field"
                        type="password"
                        value={card.cvv}
                        onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/[^\d]/g, '').slice(0, 4) }))}
                        placeholder="•••"
                      />
                    </div>
                  </div>
                )}
                {payMethod === 'NetBanking' && (
                  <div className="mt-5 rounded-xl bg-light p-4">
                    <label className="field-label">Select Bank</label>
                    <select className="field" value={bank} onChange={(e) => setBank(e.target.value)}>
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-accent">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <Button variant="accent" size="lg" onClick={() => validateStep2() && setStep(3)}>
                    Review Order →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-primary">Review & Confirm</h2>

                <div className="mt-5 rounded-xl bg-light p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">Delivering to</p>
                    <button onClick={() => setStep(1)} className="text-xs font-medium text-accent hover:underline">Edit</button>
                  </div>
                  <p className="mt-2 text-sm text-ink/80">{form.fullName} · {form.phone}</p>
                  <p className="text-sm text-ink/80">{form.addressLine1}{form.addressLine2 ? `, ${form.addressLine2}` : ''}, {form.city}, {form.state} - {form.pincode}</p>
                </div>

                <div className="mt-4 rounded-xl bg-light p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">Payment</p>
                    <button onClick={() => setStep(2)} className="text-xs font-medium text-accent hover:underline">Edit</button>
                  </div>
                  <p className="mt-2 text-sm text-ink/80">
                    {PAY_METHODS.find((m) => m.id === payMethod)?.title}
                    {payMethod === 'UPI' ? ` (${upiId})` : payMethod === 'NetBanking' ? ` (${bank})` : ''}
                    {codFee > 0 && <span className="text-accent"> · + {formatINR(codFee)} COD fee</span>}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.product?.thumbnail || item.product?.images?.[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-primary">{item.product?.name}</p>
                        <p className="text-xs text-muted">Qty {item.quantity}{item.variant?.personalisation ? ` · “${item.variant.personalisation}”` : ''}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatINR(item.product?.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                  {totals.discount > 0 && <GreenRow label={totals.discountLabel} value={`− ${formatINR(totals.discount)}`} />}
                  <Row label="Delivery" value={totals.delivery === 0 ? 'FREE' : formatINR(totals.delivery)} />
                  {codFee > 0 && <Row label="COD charge" value={formatINR(codFee)} />}
                  <div className="mt-3 flex justify-between border-t border-line pt-3 text-lg font-bold text-primary">
                    <span>Total Payable</span><span>{formatINR(finalTotal)}</span>
                  </div>
                </div>

                <Button variant="accent" size="block" className="mt-6" onClick={placeOrder} disabled={placing}>
                  {placing ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</span> : 'Place Order · Pay ' + formatINR(finalTotal)}
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> This is a simulated payment — no money is deducted.
                </p>
              </div>
            )}
          </div>

          {/* Mini summary */}
          <div className="hidden h-fit lg:sticky lg:top-24 lg:block">
            <div className="card p-5">
              <h3 className="font-display text-lg font-bold text-primary">Your Order</h3>
              <div className="mt-4 space-y-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={item.product?.thumbnail || item.product?.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{item.quantity}</span>
                    </div>
                    <p className="line-clamp-2 flex-1 text-xs text-ink/80">{item.product?.name}</p>
                  </div>
                ))}
                {items.length > 3 && <p className="text-xs text-muted">+ {items.length - 3} more items</p>}
              </div>
              <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
                {totals.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatINR(totals.discount)}</span></div>}
                <div className="flex justify-between font-bold text-primary">
                  <span>Total</span><span>{formatINR(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between py-1 text-sm">
    <span className="text-muted">{label}</span>
    <span className="font-medium text-primary">{value}</span>
  </div>
);
const GreenRow = ({ label, value }) => (
  <div className="flex justify-between py-1 text-sm text-emerald-600">
    <span>{label}</span>
    <span className="font-semibold">− {value}</span>
  </div>
);