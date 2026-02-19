import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ReviewSection from '../components/ReviewSection';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data.data || data;
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    enabled: !!token,
    queryFn: async () => {
      const { data } = await api.get('/favorites/my-favorites');
      return data.data || [];
    },
  });

  const isFavorite = favorites.some(f => f.product?._id === id || f.product === id);

  const addFavMutation = useMutation({
    mutationFn: () => api.post('/favorites', { productId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      setFeedback({ type: 'success', text: '¡Añadido a favoritos!' });
    },
    onError: (err) => setFeedback({ type: 'error', text: err.response?.data?.message || 'Error al añadir favorito' }),
  });

  const removeFavMutation = useMutation({
    mutationFn: () => api.delete(`/favorites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      setFeedback({ type: 'success', text: 'Eliminado de favoritos' });
    },
    onError: (err) => setFeedback({ type: 'error', text: err.response?.data?.message || 'Error al eliminar favorito' }),
  });

  const orderMutation = useMutation({
    mutationFn: () => api.post('/orders', { productId: id }),
    onSuccess: () => {
      setFeedback({ type: 'success', text: '¡Pedido enviado! El vendedor te responderá pronto.' });
      queryClient.invalidateQueries(['orders']);
    },
    onError: (err) => setFeedback({ type: 'error', text: err.response?.data?.message || 'Error al crear pedido' }),
  });

  const messageMutation = useMutation({
    mutationFn: () => api.post('/messages', {
      receiverId: product.seller._id,
      productId: id,
      text: message
    }),
    onSuccess: () => {
      setMessage('');
      setFeedback({ type: 'success', text: '¡Mensaje enviado al vendedor!' });
    },
    onError: (err) => setFeedback({ type: 'error', text: err.response?.data?.message || 'Error al enviar mensaje' }),
  });

  const handleFavorite = () => {
    if (!token) return navigate('/login');
    isFavorite ? removeFavMutation.mutate() : addFavMutation.mutate();
  };

  const handleOrder = () => {
    if (!token) return navigate('/login');
    if (window.confirm('¿Confirmas que quieres solicitar este producto?')) {
      orderMutation.mutate();
    }
  };

  const handleMessage = (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    if (!message.trim()) return;
    messageMutation.mutate();
  };

  if (isLoading) return <Loading />;
  if (error) return <p style={{ textAlign: 'center', color: '#dc2626' }}>Error cargando producto</p>;
  if (!product) return <p style={{ textAlign: 'center' }}>Producto no encontrado</p>;

  return (
    <div className="container">
      <Link to="/" style={{ color: '#7c3aed', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        ← Volver al listado
      </Link>

      {feedback.text && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '0.375rem',
          marginBottom: '1rem',
          backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: feedback.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {feedback.text}
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <img
          src={product.image || 'https://placehold.co/400x300?text=Producto'}
          alt={product.title}
          style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1.5rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{product.title}</h1>
            <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1rem' }}>${product.price}</p>
          </div>

          {token && (
            <button
              onClick={handleFavorite}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '2px solid #7c3aed',
                backgroundColor: isFavorite ? '#7c3aed' : 'white',
                color: isFavorite ? 'white' : '#7c3aed',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              {isFavorite ? '❤️ En favoritos' : '🤍 Añadir a favoritos'}
            </button>
          )}
        </div>

        <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem' }}>{product.description}</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Estado: {product.status}</p>

        {product.seller && (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            Vendedor: <strong style={{ color: '#111827' }}>{product.seller.username}</strong>
          </p>
        )}

        {token && product.seller && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleOrder}
              disabled={orderMutation.isPending}
              className="btn btn-primary"
              style={{ opacity: orderMutation.isPending ? 0.5 : 1 }}
            >
              {orderMutation.isPending ? 'Enviando solicitud...' : '🛒 Solicitar compra'}
            </button>

            <div>
              <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Contactar al vendedor</h3>
              <form onSubmit={handleMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={messageMutation.isPending || !message.trim()}
                  className="btn btn-outline"
                  style={{ opacity: messageMutation.isPending ? 0.5 : 1 }}
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        {!token && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Inicia sesión para comprar o contactar al vendedor</p>
            <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
          </div>
        )}

        {/* Reseñas */}
        <ReviewSection productId={id} />
      </div>
    </div>
  );
}

export default ProductDetail;