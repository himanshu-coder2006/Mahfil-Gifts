import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, setAdminSession } from '../../utils/storage';
import Button from '../../components/ui/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (getAdminSession()) {
    navigate('/admin', { replace: true });
    return null;
  }

  const submit = (e) => {
    e.preventDefault();
    if (email.trim() === 'admin@giftedthreads.com' && password === 'admin123') {
      setAdminSession({ name: 'GiftedThreads Admin', email: email.trim() });
      navigate('/admin', { replace: true });
    } else if (email.trim() === 'admin@mahfilifts.com' && password === 'Admin@123') {
      setAdminSession({ name: 'Mahfilifts Admin', email: email.trim() });
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Gifted<span className="text-accent">Threads</span></p>
            <p className="mt-1 text-sm text-muted">Admin Console</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Admin Email</label>
              <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@giftedthreads.com" required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}
            <Button type="submit" variant="accent" size="block">Login to Admin</Button>
          </form>
          <p className="mt-4 rounded-xl bg-light p-3 text-xs text-muted">
            Demo credentials: <span className="font-mono">admin@giftedthreads.com / admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}