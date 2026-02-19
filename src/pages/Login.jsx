import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ maxWidth: '28rem', margin: '2.5rem auto 0' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1.5rem', textAlign: 'center' }}>Iniciar Sesión</h2>

        {error && <p style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.375rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;