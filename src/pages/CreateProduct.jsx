import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

function CreateProduct() {
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      navigate('/dashboard');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Error creando producto');
    },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('categories', form.category); // ✅ plural, que es lo que espera el backend
    if (file) data.append('image', file);
    mutation.mutate(data);
  };

  return (
    <div style={{ maxWidth: '28rem', margin: '2.5rem auto 0' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1.5rem', textAlign: 'center' }}>Crear Producto</h2>

        {error && <p style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.375rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Título"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', minHeight: '100px' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Precio"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <select
            name="category"
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          >
            <option value="">Seleccionar categoría</option>
            <option value="electronics">Electrónicos</option>
            <option value="clothing">Ropa</option>
            <option value="home">Hogar</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ width: '100%', marginBottom: '1.5rem' }}
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn btn-primary"
            style={{ width: '100%', opacity: mutation.isPending ? 0.5 : 1, cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
          >
            {mutation.isPending ? 'Creando...' : 'Crear Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;