import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { upsertCustomer } from '../utils/storage';
import Button from '../components/ui/Button';
import { Check } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser({ ...form, confirmPassword: undefined }));
    if (result.meta.requestStatus === 'fulfilled') {
      upsertCustomer({
        name: form.name.trim(), email: form.email.trim(), phone: form.mobile,
        joined: new Date().toISOString().slice(0, 10), orders: 0, spent: 0,
      });
      dispatch(showNotification({ message: 'Account created! Welcome to GiftedThreads 🎉' }));
      navigate('/account');
    }
  };

  const field = (label, key, props) => (
    <div>
      <label className="field-label">{label}</label>
      <input className="field" value={form[key]} onChange={(e) => setField(key, e.target.value)} {...props} />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-light px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">Join <span className="text-accent">GiftedThreads</span></p>
            <p className="mt-1 text-sm text-muted">Create your account for a smoother gifting journey</p>
          </div>

          {/* Password criteria */}
          <div className="mt-4 rounded-xl bg-light p-4 text-xs text-ink/70">
            <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Track orders & manage wishlist</p>
            <p className="mt-1 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Faster checkout with saved addresses</p>
            <p className="mt-1 flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Exclusive offers for members</p>
          </div>

          {error && <p className="mt-4 rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">{error}</p>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {field('Full Name', 'name', { placeholder: 'Your name', autoComplete: 'name' })}
            {field('Email', 'email', { type: 'email', placeholder: 'you@example.com', autoComplete: 'email' })}
            {field('Mobile', 'mobile', { type: 'tel', maxLength: 10, placeholder: '10-digit mobile', autoComplete: 'tel' })}
            {field('Password', 'password', { type: 'password', placeholder: 'Min 6 characters', autoComplete: 'new-password' })}
            {field('Confirm Password', 'confirmPassword', { type: 'password', placeholder: 'Re-enter password', autoComplete: 'new-password' })}
            <Button type="submit" variant="accent" size="block" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}