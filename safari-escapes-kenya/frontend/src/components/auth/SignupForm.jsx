import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function SignupForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {[
        { label: 'Full Name', name: 'name', type: 'text', autoComplete: 'name' },
        { label: 'Email', name: 'email', type: 'email', autoComplete: 'email' },
        { label: 'Password', name: 'password', type: 'password', autoComplete: 'new-password' },
        { label: 'Confirm Password', name: 'confirm', type: 'password', autoComplete: 'new-password' },
      ].map(({ label, name, type, autoComplete }) => (
        <div key={name}>
          <label className="block text-sm text-gray-600 mb-1">{label}</label>
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            required
            autoComplete={autoComplete}
            className="w-full border border-gray-mid rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-light"
          />
        </div>
      ))}
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-light hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
