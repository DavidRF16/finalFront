import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

function ReviewSection({ productId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/product/${productId}`);
      return data.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, comment }),
    onSuccess: () => {
      setComment('');
      setRating(5);
      setError('');
      queryClient.invalidateQueries(['reviews', productId]);
    },
    onError: (err) => setError(err.response?.data?.message || 'Error al publicar reseña'),
  });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
      <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '1rem', fontSize: '1.25rem' }}>
        ⭐ Reseñas {avgRating && <span style={{ color: '#7c3aed' }}>({avgRating}/5)</span>}
      </h3>

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Aún no hay reseñas para este producto</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {reviews.map((review) => (
            <div key={review._id} style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 'bold', color: '#111827' }}>{review.user?.username}</span>
                <span style={{ color: '#f59e0b' }}>{'⭐'.repeat(review.rating)}</span>
              </div>
              {review.comment && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Formulario reseña — solo si está logueado */}
      {token && (
        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
          <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>Dejar una reseña</h4>
          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '0.375rem' }}>
              {error}
            </p>
          )}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ color: '#6b7280', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Puntuación</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none' }}
            >
              {[5,4,3,2,1].map(n => (
                <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Cuéntanos tu experiencia (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', outline: 'none', minHeight: '80px', marginBottom: '0.75rem' }}
          />
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn btn-primary"
            style={{ opacity: mutation.isPending ? 0.5 : 1 }}
          >
            {mutation.isPending ? 'Publicando...' : 'Publicar reseña'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewSection;