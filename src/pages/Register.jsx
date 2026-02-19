import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('username', form.username);
    data.append('email', form.email);
    data.append('password', form.password);
    if (file) data.append('avatar', file);

    try {
      await api.post('/auth/register', data);
      alert('Registrado! Revisa tu email para verificar.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '28rem', margin: '2.5rem auto 0' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1.5rem', textAlign: 'center' }}>Crear Cuenta</h2>

        {error && <p style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.375rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Usuario"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
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
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ width: '100%', marginBottom: '1.5rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;