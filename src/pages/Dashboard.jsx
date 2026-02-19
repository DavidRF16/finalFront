import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Loading from '../components/Loading';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [avatar, setAvatar] = useState(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });

  useEffect(() => {
    if (user?.avatar) setAvatar(user.avatar);
  }, [user]);

  const { data: myProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/my-products');
      return data.data || [];
    },
  });

  const { data: myOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data.data || [];
    },
  });

  const { data: myFavorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get('/favorites/my-favorites');
      return data.data || [];
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: (productId) => api.delete(`/favorites/${productId}`),
    onSuccess: () => queryClient.invalidateQueries(['favorites']),
  });

  const randomizeAvatar = async () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    try {
      await api.put('/auth/update-avatar', { avatarUrl: url });
      setAvatar(url);
      queryClient.invalidateQueries(['user']);
    } catch (err) {
      alert('Error al actualizar avatar');
    }
  };

  if (userLoading) return <Loading />;

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #7c3aed' : '3px solid transparent',
    backgroundColor: 'transparent',
    color: activeTab === tab ? '#7c3aed' : '#6b7280',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    cursor: 'pointer',
    fontSize: '1rem',
  });

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '2rem' }}>Mi Dashboard</h1>

      {/* Perfil */}
      {user && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{ width: '5rem', height: '5rem', borderRadius: '50%', border: '4px solid #7c3aed', objectFit: 'cover', backgroundColor: '#ede9fe' }}
                />
              ) : (
                <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
              <button
                onClick={randomizeAvatar}
                title="Aleatorizar avatar"
                style={{ position: 'absolute', bottom: 0, right: 0, width: '1.75rem', height: '1.75rem', borderRadius: '50%', backgroundColor: '#7c3aed', border: '2px solid white', color: 'white', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                🎲
              </button>
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{user.username}</h2>
              <p style={{ color: '#6b7280' }}>{user.email}</p>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#ede9fe', color: '#7c3aed', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold' }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/create-product" className="btn btn-primary">+ Crear Producto</Link>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>
          Mis Productos ({myProducts.length})
        </button>
        <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>
          Mis Pedidos ({myOrders.length})
        </button>
        <button style={tabStyle('favorites')} onClick={() => setActiveTab('favorites')}>
          Favoritos ({myFavorites.length})
        </button>
      </div>

      {/* Tab: Mis Productos */}
      {activeTab === 'products' && (
        <section>
          {productsLoading ? <Loading /> : myProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
              <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Aún no has publicado productos</p>
              <Link to="/create-product" className="btn btn-primary">Crear mi primer producto</Link>
            </div>
          ) : (
            <div className="grid">
              {myProducts.map((product) => (
                <div key={product._id} className="card">
                  <img
                    src={product.image || 'https://placehold.co/300x200?text=Producto'}
                    alt={product.title}
                    style={{ width: '100%', height: '12rem', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>{product.title}</h4>
                    <p style={{ color: '#7c3aed', fontWeight: 'bold' }}>${product.price}</p>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: product.status === 'active' ? '#dcfce7' : product.status === 'sold' ? '#fee2e2' : '#fef9c3',
                      color: product.status === 'active' ? '#16a34a' : product.status === 'sold' ? '#dc2626' : '#ca8a04',
                      fontWeight: 'bold'
                    }}>
                      {product.status}
                    </span>
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/product/${product._id}`} style={{ color: '#7c3aed', fontSize: '0.875rem', textDecoration: 'none' }}>
                        Ver →
                      </Link>
                      <Link to={`/edit-product/${product._id}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>
                        ✏️ Editar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab: Mis Pedidos */}
      {activeTab === 'orders' && (
        <section>
          {ordersLoading ? <Loading /> : myOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>No tienes pedidos aún</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {myOrders.map((order) => (
                <div key={order._id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      {order.product?.title || 'Producto eliminado'}
                    </h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Pedido #{order._id.slice(-8)}</p>
                    {order.product?.price && (
                      <p style={{ color: '#7c3aed', fontWeight: 'bold' }}>${order.product.price}</p>
                    )}
                  </div>
                  <span style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    backgroundColor:
                      order.status === 'pending' ? '#fef9c3' :
                      order.status === 'accepted' ? '#dcfce7' :
                      order.status === 'completed' ? '#dbeafe' : '#fee2e2',
                    color:
                      order.status === 'pending' ? '#ca8a04' :
                      order.status === 'accepted' ? '#16a34a' :
                      order.status === 'completed' ? '#2563eb' : '#dc2626',
                  }}>
                    {order.status === 'pending' ? '⏳ Pendiente' :
                     order.status === 'accepted' ? '✅ Aceptado' :
                     order.status === 'completed' ? '🎉 Completado' :
                     order.status === 'rejected' ? '❌ Rechazado' : '🚫 Cancelado'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab: Favoritos */}
      {activeTab === 'favorites' && (
        <section>
          {favoritesLoading ? <Loading /> : myFavorites.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6b7280' }}>
              <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No tienes favoritos aún</p>
              <Link to="/" className="btn btn-primary">Explorar productos</Link>
            </div>
          ) : (
            <div className="grid">
              {myFavorites.map((fav) => (
                fav.product && (
                  <div key={fav._id} className="card">
                    <img
                      src={fav.product.image || 'https://placehold.co/300x200?text=Producto'}
                      alt={fav.product.title}
                      style={{ width: '100%', height: '12rem', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>{fav.product.title}</h4>
                      <p style={{ color: '#7c3aed', fontWeight: 'bold', marginBottom: '0.75rem' }}>${fav.product.price}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/product/${fav.product._id}`}
                          style={{ flex: 1, textAlign: 'center', padding: '0.5rem', backgroundColor: '#7c3aed', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem' }}
                        >
                          Ver producto
                        </Link>
                        <button
                          onClick={() => removeFavMutation.mutate(fav.product._id)}
                          style={{ padding: '0.5rem 0.75rem', border: '1px solid #dc2626', borderRadius: '0.375rem', backgroundColor: 'white', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;