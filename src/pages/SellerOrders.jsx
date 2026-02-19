import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Loading from '../components/Loading';

function SellerOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/seller-orders');
      return data.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => api.put(`/orders/${orderId}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['seller-orders']),
    onError: (err) => alert(err.response?.data?.message || 'Error al actualizar estado'),
  });

  if (isLoading) return <Loading />;
  if (error) return <p style={{ textAlign: 'center', color: '#dc2626' }}>Error cargando pedidos</p>;

  const pending = orders.filter(o => o.status === 'pending');
  const others = orders.filter(o => o.status !== 'pending');

  const statusBadge = (status) => {
    const map = {
      pending:   { bg: '#fef9c3', color: '#ca8a04', label: '⏳ Pendiente' },
      accepted:  { bg: '#dcfce7', color: '#16a34a', label: '✅ Aceptado' },
      rejected:  { bg: '#fee2e2', color: '#dc2626', label: '❌ Rechazado' },
      completed: { bg: '#dbeafe', color: '#2563eb', label: '🎉 Completado' },
      cancelled: { bg: '#f3f4f6', color: '#6b7280', label: '🚫 Cancelado' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', backgroundColor: s.bg, color: s.color, fontWeight: 'bold', fontSize: '0.85rem' }}>
        {s.label}
      </span>
    );
  };

  const OrderCard = ({ order }) => (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
            {order.product?.title || 'Producto eliminado'}
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Comprador: <strong>{order.buyer?.username || 'Desconocido'}</strong> ({order.buyer?.email})
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Pedido #{order._id.slice(-8)} · {new Date(order.createdAt).toLocaleDateString('es-ES')}
          </p>
          {order.product?.price && (
            <p style={{ color: '#7c3aed', fontWeight: 'bold' }}>${order.product.price}</p>
          )}
        </div>
        {statusBadge(order.status)}
      </div>

      {/* Acciones según estado */}
      {order.status === 'pending' && (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <button
            onClick={() => updateStatusMutation.mutate({ orderId: order._id, status: 'accepted' })}
            disabled={updateStatusMutation.isPending}
            style={{ flex: 1, padding: '0.6rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✅ Aceptar
          </button>
          <button
            onClick={() => updateStatusMutation.mutate({ orderId: order._id, status: 'rejected' })}
            disabled={updateStatusMutation.isPending}
            style={{ flex: 1, padding: '0.6rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ❌ Rechazar
          </button>
        </div>
      )}

      {order.status === 'accepted' && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <button
            onClick={() => updateStatusMutation.mutate({ orderId: order._id, status: 'completed' })}
            disabled={updateStatusMutation.isPending}
            style={{ width: '100%', padding: '0.6rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🎉 Marcar como completado
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '2rem' }}>
        Pedidos recibidos
      </h1>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>
          Aún no has recibido ningún pedido
        </p>
      ) : (
        <>
          {pending.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                🔔 Pendientes de respuesta ({pending.length})
              </h2>
              {pending.map(order => <OrderCard key={order._id} order={order} />)}
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Historial
              </h2>
              {others.map(order => <OrderCard key={order._id} order={order} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default SellerOrders;