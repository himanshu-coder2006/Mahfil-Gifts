import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { getAdminSession, clearAdminSession } from '../../utils/storage';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const admin = getAdminSession();

  useEffect(() => {
    if (!admin) navigate('/admin/login', { replace: true });
  }, [admin, navigate]);

  if (!admin) return null;

  const logout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-light">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-primary text-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="font-display text-lg font-bold">
            Gifted<span className="text-accent">Threads</span>
          </span>
        </div>
        <p className="px-6 text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase">Admin Panel</p>

        <nav className="mt-4 flex-1 space-y-1 px-4">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-semibold">{admin.name}</p>
            <p className="truncate text-xs text-white/50">{admin.email}</p>
          </div>
          <button onClick={logout} className="admin-nav-link !text-accent hover:!bg-accent/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}