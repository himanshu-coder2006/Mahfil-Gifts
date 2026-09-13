import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession, setAdminSession, setAdminToken } from '../../utils/storage';
import { adminAPI } from '../../services/api';
import Button from '../../components/ui/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAdminSession()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await adminAPI.login({ email: email.trim(), password });
      const admin = response?.data?.admin || response?.admin || null;

      if (!admin) {
        throw new Error('Admin profile not returned by server.');
      }

      setAdminToken(response?.data?.token || response?.token || '');
      setAdminSession(admin);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Mahfil<span className="text-accent">Gifts</span></p>
            <p className="mt-1 text-sm text-muted">Admin Console</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Admin Email</label>
              <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mahfilgifts.com" required />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <p className="rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}
            <Button type="submit" variant="accent" size="block" disabled={loading}>
              {loading ? 'Logging in…' : 'Login to Admin'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}