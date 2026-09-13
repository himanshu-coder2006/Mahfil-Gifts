import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { showNotification } from '../store/slices/notificationSlice';
import { useDispatch } from 'react-redux';
import Button from '../components/ui/Button';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      dispatch(showNotification({ message: 'Password reset successful! Please login.' }));
      navigate('/login');
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
            <p className="mt-1 text-sm text-muted">Set your new password</p>
          </div>

          {error && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">New Password</label>
              <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
            </div>
            <div>
              <label className="field-label">Confirm Password</label>
              <input type="password" className="field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
            </div>
            <Button type="submit" variant="accent" size="block" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            <Link to="/login" className="font-semibold text-accent hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
