import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';

function Home() {
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', sort: 'createdAt' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', appliedFilters],  // ✅ solo se lanza cuando se aplica
    queryFn: async () => {
      const params = new URLSearchParams();
      if (appliedFilters.category) params.append('category', appliedFilters.category);
      if (appliedFilters.minPrice) params.append('minPrice', appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.append('maxPrice', appliedFilters.maxPrice);
      if (appliedFilters.sort.startsWith('-')) {
        params.append('sort', appliedFilters.sort.slice(1));
        params.append('order', 'asc');
      } else {
        params.append('sort', appliedFilters.sort);
        params.append('order', 'desc');
      }
      const { data } = await api.get(`/products?${params}`);
      return data.data || data || [];
    },
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const reset = { category: '', minPrice: '', maxPrice: '', sort: 'createdAt' };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  if (isLoading) return <Loading />;
  if (error) return <p style={{ textAlign: 'center', color: '#dc2626' }}>Error cargando productos</p>;

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: '2rem' }}>
        Productos en LowissShop
      </h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
        >
          <option value="">Todas las categorías</option>
          <option value="electronics">Electrónicos</option>
          <option value="clothing">Ropa</option>
          <option value="home">Hogar</option>
        </select>

        <input
          type="number"
          name="minPrice"
          placeholder="Precio mín"
          value={filters.minPrice}
          onChange={handleFilterChange}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '100px' }}
        />

        <input
          type="number"
          name="maxPrice"
          placeholder="Precio máx"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '100px' }}
        />

        <select
          name="sort"
          value={filters.sort}
          onChange={handleFilterChange}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
        >
          <option value="createdAt">Más recientes</option>
          <option value="price">Precio ascendente</option>
          <option value="-price">Precio descendente</option>
        </select>

        <button
          onClick={handleApplyFilters}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem' }}
        >
          Filtrar
        </button>

        <button
          onClick={handleReset}
          className="btn btn-outline"
          style={{ padding: '0.5rem 1rem' }}
        >
          Limpiar
        </button>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <h2>No hay productos disponibles</h2>
          <p>¡Sé el primero en publicar algo!</p>
        </div>
      ) : (
        <div className="grid">
          {products.map(product => (
            <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;