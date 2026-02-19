import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Loading from '../components/Loading';

function Orders() {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data.data || data || [];
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <p style={{ textAlign: 'center', color: '#dc2626' }}>Error cargando pedidos</p>;

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '2rem' }}>Mis Pedidos</h1>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>No tienes pedidos aún</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                Pedido #{order._id.slice(-8)}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Producto: {order.product?.title || 'N/A'}</p>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Precio: ${order.product?.price ?? '—'}</p>
              <p style={{ fontWeight: 'bold', color: order.status === 'pending' ? '#f59e0b' : order.status === 'completed' ? '#10b981' : '#dc2626' }}>
                Estado: {order.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;