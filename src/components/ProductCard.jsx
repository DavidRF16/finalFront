function ProductCard({ product }) {
  return (
    <div className="card">
      <img
        src={product.image || 'https://via.placeholder.com/400x300?text=Producto'}
        alt={product.title}
      />
      <div className="card-content">
        <h3 className="card-title">{product.title}</h3>
        <p className="card-price">${product.price}</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          {product.description?.substring(0, 100)}...
        </p>
      </div>
    </div>
  );
}

export default ProductCard;