import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { setAdminSession } from '../utils/storage';
import Button from '../components/ui/Button';

const ADMIN_ACCOUNTS = [
  { email: 'admin@giftedthreads.com', password: 'admin123' },
  { email: 'admin@mahfilifts.com', password: 'Admin@123' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    const adminMatch = ADMIN_ACCOUNTS.find((a) => a.email === email.trim() && a.password === password);
    if (adminMatch) {
      setAdminSession({ name: 'GiftedThreads Admin', email: adminMatch.email });
      dispatch(showNotification({ message: 'Welcome back, Admin!' }));
      navigate('/admin');
      return;
    }
    if (email.trim() && password) {
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(showNotification({ message: 'Welcome back! You are logged in.' }));
        navigate('/account');
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-light px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Gifted<span className="text-accent">Threads</span></p>
            <p className="mt-1 text-sm text-muted">Login to continue shopping</p>
          </div>

          {error && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" variant="accent" size="block" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-accent hover:underline">Register</Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-primary p-4 text-center text-xs text-white/70">
          <p>Demo customer: <span className="font-mono">customer@mahfilifts.com / Customer@123</span></p>
          <p className="mt-1">Admin: <span className="font-mono">admin@mahfilifts.com / Admin@123</span></p>
        </div>
      </div>
    </div>
  );
}