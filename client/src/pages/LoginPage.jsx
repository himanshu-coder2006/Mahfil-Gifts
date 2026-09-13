import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showNotification({ message: 'Welcome back! You are logged in.' }));
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-light px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Mahfil<span className="text-accent">Gifts</span></p>
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
          <p className="mt-3 text-center text-sm text-muted">
            <Link to="/forgot-password" className="font-semibold text-accent hover:underline">Forgot Password?</Link>
          </p>
        </div>

      </div>
    </div>
  );
}