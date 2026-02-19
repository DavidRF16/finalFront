import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header>
      <nav>
        <div className="container">
          <Link to="/" className="logo">
            <div className="logo-icon">L</div>
            LowissShop
          </Link>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            {token ? (
              <>
                <li><Link to="/dashboard">Mi Cuenta</Link></li>
                <li><Link to="/messages">💬 Mensajes</Link></li>
                <li><Link to="/seller-orders">Pedidos recibidos</Link></li>
                <li><Link to="/create-product" className="btn btn-primary">Crear Producto</Link></li>
                <li><button onClick={handleLogout} className="btn btn-outline">Cerrar Sesión</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="btn btn-primary">Registrarse</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;