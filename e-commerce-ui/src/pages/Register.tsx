import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';

const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CONSUMER' | 'MANAGER'>('CONSUMER');
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
        showToast("Name is required.", "error");
        return;
    }

    if (!email.trim()) {
        showToast("Email is required.", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        showToast("Enter a valid email.", "error");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    if (!agreeTerms) {
        showToast("Please accept the Terms & Conditions.", "error");
        return;
    }

    setIsLoading(true);

    try {

        const success = await register(
            name.trim(),
            email.trim(),
            password,
            role
        );

        if (success) {

            showToast(
                `Account created successfully as ${
                    role === "MANAGER"
                        ? "Seller"
                        : "Consumer"
                }`,
                "success"
            );

            navigate(role === "MANAGER" ? "/seller" : "/");

        }

    } catch (err: any) {

        const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Registration failed.";

        showToast(message, "error");

    } finally {

        setIsLoading(false);

    }
};

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          Create a customer or seller account.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Role Choice */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              className="btn"
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                backgroundColor: role === 'CONSUMER' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                borderColor: role === 'CONSUMER' ? 'var(--primary)' : 'var(--border-color)',
                color: role === 'CONSUMER' ? 'var(--primary)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                height: 'auto',
                gap: '4px'
              }}
            >
              <Icon name="shopping-bag" size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Consumer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('MANAGER')}
              className="btn"
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                backgroundColor: role === 'MANAGER' ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)',
                borderColor: role === 'MANAGER' ? 'var(--secondary)' : 'var(--border-color)',
                color: role === 'MANAGER' ? 'var(--secondary)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                height: 'auto',
                gap: '4px'
              }}
            >
              <Icon name="settings" size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Seller</span>
            </button>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Liam Kensington"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. liam@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          {/* Agree to terms */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', textAlign: 'left', margin: '4px 0' }}>
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ marginTop: '4px', cursor: 'pointer' }}
            />
            <label htmlFor="agree-checkbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              I agree to the <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Terms of Service</span> and <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Privacy Policy</span>.
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', height: '44px' }} disabled={isLoading}>
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <Icon name="check-circle" size={16} />
                <span>Sign Up as {role === 'MANAGER' ? 'Seller' : 'Consumer'}</span>
              </>
            )}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
