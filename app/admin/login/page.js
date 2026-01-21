'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-thandi-cream flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-thandi-gradient rounded-full flex items-center justify-center ring-4 ring-thandi-gold">
              <span className="text-white font-bold text-2xl font-heading">T</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold font-heading text-thandi-brown">
            Thandi Admin
          </h2>
          <p className="mt-2 text-sm text-thandi-brown/70 font-body">
            System Administrator Login
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-thandi-brown font-body mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
                placeholder="admin@thandi.online"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-thandi-brown font-body mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-thandi-teal focus:border-transparent font-body"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-thandi-gradient text-white py-3 px-4 rounded-lg font-semibold font-body hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-thandi-teal hover:text-thandi-teal-dark font-body"
            >
              ← Back to Thandi Home
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-thandi-brown/60 font-body">
          <p>This is a secure admin area. All access is logged.</p>
          <p className="mt-1">For school portal access, visit <Link href="/school/claim" className="text-thandi-teal hover:underline">School Portal</Link></p>
        </div>
      </div>
    </div>
  );
}
