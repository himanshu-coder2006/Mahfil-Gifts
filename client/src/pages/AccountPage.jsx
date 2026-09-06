import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, User, MapPin, LogOut, Heart } from 'lucide-react';
import { orderAPI } from '../services/api';
import { logoutUser } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { getOrders } from '../utils/storage';
import { formatINR } from '../utils/format';
import Button from '../components/ui/Button';

const STATUS_COLORS = {
  Processing: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Shipped: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-emerald-600 text-white',
  Cancelled: 'bg-accent/10 text-accent',
  Pending: 'bg-line text-ink/70',
};

export default function AccountPage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    orderAPI.getAll()
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders(getOrders()));
    setAddresses(JSON.parse(localStorage.getItem('gt_addresses') || '[]').filter((a) => !a.email || a.email === user?.email));
  }, [user]);

  const saveProfile = () => {
    localStorage.setItem('gt_profile', JSON.stringify(profile));
    setProfileSaved(true);
    dispatch(showNotification({ message: 'Profile saved.' }));
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const logout = () => {
    dispatch(logoutUser());
    dispatch(showNotification({ message: 'Logged out successfully.' }));
    navigate('/');
  };

  const localOrders = getOrders().filter((o) => !o || o.customer?.email === user?.email || !o.orderId);
  const canFollowStatus = orders.length > 0 && user;

  const STATUS_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const [statusFilter, setStatusFilter] = useState('All');

  const statusOf = (o) => o.orderStatus || o.status || 'Processing';
  const filteredOrders = (statusFilter === 'All' ? orders : orders.filter((o) => statusOf(o) === statusFilter));

  return (
    <div className="bg-light">
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <h1 className="font-display text-3xl font-bold text-white">My Account</h1>
          <p className="mt-1 text-sm text-white/60">Welcome back, {user?.name || 'Valued Customer'} 👋</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar tabs */}
          <aside>
            <div className="card overflow-hidden">
              {[
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'addresses', label: 'My Addresses', icon: MapPin },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-3 border-b border-line px-5 py-3.5 text-sm font-medium transition ${tab === t.id ? 'bg-accent text-white' : 'text-ink/80 hover:bg-light'}`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
              <div className="p-5">
                <Link to="/wishlist" className="flex items-center gap-3 text-sm font-medium text-ink/80 hover:text-accent">
                  <Heart className="h-4 w-4" /> Wishlist
                </Link>
                <Button variant="ghost" size="sm" className="mt-3 w-full justify-start !px-0" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {tab === 'orders' && (
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {STATUS_TABS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${statusFilter === s ? 'bg-primary text-white' : 'bg-white text-muted hover:text-primary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="card p-10 text-center">
                    <p className="text-4xl">📦</p>
                    <p className="mt-3 font-display text-lg font-semibold text-primary">No orders yet</p>
                    <p className="mt-1 text-sm text-muted">Your orders will appear here once you place them.</p>
                    <Link to="/shop" className="mt-5 inline-block"><Button variant="accent" size="sm">Start Shopping</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((o) => {
                      const ostatus = statusOf(o);
                      const status = STATUS_COLORS[ostatus] || STATUS_COLORS.Processing;
                      const items = o.orderItems || o.items || [];
                      const total = o.totalAmount || o.total || 0;
                      return (
                        <div key={o._id || o.orderId} className="card p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-muted">ORDER #{o._id || o.orderId}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {new Date(o.createdAt || o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' '}· {items.length} {items.length === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status}`}>{ostatus}</span>
                          </div>
                          <div className="mt-4 space-y-2">
                            {items.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <p className="line-clamp-1 text-ink/80">
                                  <span className="text-muted">{item.quantity}×</span> {item.name}
                                </p>
                                <p className="shrink-0 font-medium text-primary">{formatINR(item.price * item.quantity)}</p>
                              </div>
                            ))}
                            {items.length > 3 && <p className="text-xs text-muted">+ {items.length - 3} more</p>}
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                            <p className="text-sm">
                              <span className="text-muted">Total: </span>
                              <span className="font-bold text-primary">{formatINR(total)}</span>
                              <span className="ml-2 text-xs text-muted">· {o.paymentMethod || 'Online'}</span>
                            </p>
                            {canFollowStatus && (
                              <Link to={`/order-success/${o._id}`} className="text-sm font-medium text-accent hover:underline">View Details →</Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-bold text-primary">My Profile</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Full Name</label>
                    <input className="field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input className="field" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Mobile</label>
                    <input className="field" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} maxLength={10} />
                  </div>
                </div>
                <Button variant="accent" className="mt-6" onClick={saveProfile}>
                  {profileSaved ? 'Saved ✓' : 'Save Changes'}
                </Button>
                <p className="mt-3 text-xs text-muted">Profile data is saved locally in this demo.</p>
              </div>
            )}

            {tab === 'addresses' && (
              <div>
                {addresses.length === 0 ? (
                  <div className="card p-10 text-center">
                    <p className="text-4xl">🏠</p>
                    <p className="mt-3 font-display text-lg font-semibold text-primary">No saved addresses</p>
                    <p className="mt-1 text-sm text-muted">Save an address during checkout to see it here.</p>
                    <Link to="/shop" className="mt-5 inline-block"><Button variant="accent" size="sm">Shop Now</Button></Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a, i) => (
                      <div key={i} className="card p-5">
                        <p className="font-semibold text-primary">{a.fullName}</p>
                        <p className="mt-2 text-sm text-ink/80">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                        <p className="text-sm text-ink/80">{a.city}, {a.state} - {a.pincode}</p>
                        <p className="mt-2 text-xs text-muted">{a.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}