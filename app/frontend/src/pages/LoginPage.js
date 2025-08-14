import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

function LoginPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!usernameOrEmail || !password) {
      setError('Please enter your username/email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive HttpOnly session cookie
        body: JSON.stringify({
          username_or_email: usernameOrEmail,
          password,
        }),
      });

      if (!res.ok) {
        let msg = 'Login failed';
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch (_) {}
        throw new Error(msg);
      }

      // Logged in successfully — session cookie set.
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page" style={{ maxWidth: 420, margin: '8rem auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Aero Waste — Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Username or email
          <input
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="Enter your username or email"
            autoComplete="username"
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 8 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ width: '100%', padding: 10, marginTop: 6 }}
          />
        </label>

        {error && (
          <div style={{ color: '#b00020', margin: '8px 0 12px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ width: '100%', padding: 12, cursor: submitting ? 'not-allowed' : 'pointer' }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
