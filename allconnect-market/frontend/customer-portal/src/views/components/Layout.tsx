import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../viewmodels';
import { useState } from 'react';

export const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-xl text-gray-900">AllConnect</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-gray-600 hover:text-primary-600 transition-colors">
                Catálogo
              </Link>
              <Link to="/catalog?type=PHYSICAL" className="text-gray-600 hover:text-primary-600 transition-colors">
                Productos
              </Link>
              <Link to="/catalog?type=SERVICE" className="text-gray-600 hover:text-primary-600 transition-colors">
                Servicios
              </Link>
              <Link to="/catalog?type=SUBSCRIPTION" className="text-gray-600 hover:text-primary-600 transition-colors">
                Suscripciones
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden sm:block">{user?.firstName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      <Link
                        to="/my-orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mis Pedidos
                      </Link>
                      <Link
                        to="/my-bookings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mis Reservas
                      </Link>
                      <Link
                        to="/my-subscriptions"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mis Suscripciones
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              <Link to="/catalog" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Catálogo
              </Link>
              <Link to="/catalog?type=PHYSICAL" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Productos
              </Link>
              <Link to="/catalog?type=SERVICE" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Servicios
              </Link>
              <Link to="/catalog?type=SUBSCRIPTION" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
                Suscripciones
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="font-bold text-xl">AllConnect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Tu marketplace multicanal para productos físicos, servicios y suscripciones digitales.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categorías</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/catalog?type=PHYSICAL" className="hover:text-white">Productos Físicos</Link></li>
                <li><Link to="/catalog?type=SERVICE" className="hover:text-white">Servicios</Link></li>
                <li><Link to="/catalog?type=SUBSCRIPTION" className="hover:text-white">Suscripciones</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Mi Cuenta</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/profile" className="hover:text-white">Perfil</Link></li>
                <li><Link to="/my-orders" className="hover:text-white">Mis Pedidos</Link></li>
                <li><Link to="/my-bookings" className="hover:text-white">Mis Reservas</Link></li>
                <li><Link to="/my-subscriptions" className="hover:text-white">Mis Suscripciones</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">Términos y Condiciones</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AllConnect Market. Proyecto de Arquitectura de Software - PUJ</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
