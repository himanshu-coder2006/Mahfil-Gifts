import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authAPI.forgotPassword(email.trim());
      setMessage('Reset link sent to your email.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-light px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Mahfil<span className="text-accent">Gifts</span></p>
            <p className="mt-1 text-sm text-muted">Enter your email to reset your password</p>
          </div>

          {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-700">{message}</p>}
          {error && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <Button type="submit" variant="accent" size="block" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
