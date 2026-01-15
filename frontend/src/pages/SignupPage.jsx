import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';

import { signup as signupApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const errorRef = useRef(null);

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================= ENTRY ANIMATION ================= */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from(formRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ================= ERROR SHAKE ================= */
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -10 },
        { x: 10, duration: 0.1, yoyo: true, repeat: 5 }
      );
    }
  }, [error]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const { data } = await signupApi(form);

      // ✅ Store token in localStorage for API interceptor
      localStorage.setItem('rabuste_token', data.token);

      // Update auth context
      login(data.token, data.user);

      // Exit animation before navigation
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power3.inOut',
        onComplete: () => navigate('/'),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" ref={containerRef}>
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join the Rabuste community.</p>

        {error && (
          <div className="auth-error" ref={errorRef}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" ref={formRef}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
