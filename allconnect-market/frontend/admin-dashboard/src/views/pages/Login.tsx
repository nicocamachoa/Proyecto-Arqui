import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { mockUsers } from '../../data/mockData';

export const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock login - check for admin users only
    const user = mockUsers.find(u => u.email === formData.email);

    if (!user) {
      setError('Usuario no encontrado');
      setIsLoading(false);
      return;
    }

    if (!user.role.startsWith('ADMIN_')) {
      setError('Acceso denegado. Solo administradores pueden acceder.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== 'password123') {
      setError('Contraseña incorrecta');
      setIsLoading(false);
      return;
    }

    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 3600000 }));
    setAuth(user, token);
    navigate('/');
  };

  const quickLogin = (email: string) => {
    setFormData({ email, password: 'password123' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Admin Panel
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          AllConnect Market - Panel de Administración
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field mt-1"
                placeholder="admin@test.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field mt-1"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Quick Login for Demo */}
          <div className="mt-6 border-t pt-6">
            <p className="text-center text-sm text-gray-500 mb-4">Demo: Acceso rápido</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin.negocio@test.com')}
                className="btn-secondary text-xs py-2"
              >
                Admin Negocio
              </button>
              <button
                onClick={() => quickLogin('admin.contenido@test.com')}
                className="btn-secondary text-xs py-2"
              >
                Admin Contenido
              </button>
              <button
                onClick={() => quickLogin('admin.it@test.com')}
                className="btn-secondary text-xs py-2"
              >
                Admin IT
              </button>
              <button
                onClick={() => quickLogin('admin.operaciones@test.com')}
                className="btn-secondary text-xs py-2"
              >
                Admin Operaciones
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Contraseña: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
