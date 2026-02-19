import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Loading from '../components/Loading';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', status: 'active' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data || data;
    },
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: product.categories?.[0]?.name || '',
        status: product.status || 'active',
      });
      setPreview(product.image || null);
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      queryClient.invalidateQueries(['my-products']);
      navigate('/dashboard');
    },
    onError: (err) => setError(err.response?.data?.message || 'Error al actualizar producto'),
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('categories', form.category);
    data.append('status', form.status);
    if (file) data.append('image', file);
    mutation.mutate(data);
  };

  if (isLoading) return <Loading />;

  return (
    <div style={{ maxWidth: '28rem', margin: '2.5rem auto 0' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1.5rem', textAlign: 'center' }}>
          Editar Producto
        </h2>

        {error && (
          <p style={{ color: '#dc2626', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.375rem' }}>
            {error}
          </p>
        )}

        {/* Preview imagen actual */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
          />
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Título"
            value={form.title}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', minHeight: '100px' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          <input
            name="price"
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
          >
            <option value="">Sin categoría</option>
            <option value="electronics">Electrónicos</option>
            <option value="clothing">Ropa</option>
            <option value="home">Hogar</option>
          </select>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
          >
            <option value="active">Activo</option>
            <option value="draft">Borrador</option>
            <option value="sold">Vendido</option>
          </select>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Cambiar imagen (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ width: '100%', marginBottom: '1.5rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary"
              style={{ flex: 1, opacity: mutation.isPending ? 0.5 : 1 }}
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;