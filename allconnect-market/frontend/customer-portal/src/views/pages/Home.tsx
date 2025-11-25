import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useAuthStore } from '../../stores';
import { recommendationService, catalogService } from '../../services';
import { Product, Category } from '../../models';

export const Home = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [trendingData, categoriesData, featuredData] = await Promise.all([
          recommendationService.getTrending(),
          catalogService.getCategories(),
          catalogService.getFeaturedProducts(),
        ]);

        setTrending(trendingData);
        setCategories(categoriesData);
        setFeatured(featuredData);

        // Load personalized recommendations if authenticated
        if (isAuthenticated && user) {
          const recsData = await recommendationService.getForUser(user.id);
          setRecommendations(recsData);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Todo lo que necesitas en un solo lugar
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Productos físicos, servicios profesionales y suscripciones digitales.
              Descubre la nueva forma de comprar.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog" className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-colors">
                Explorar Catálogo
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="bg-primary-500 hover:bg-primary-400 px-6 py-3 rounded-lg font-medium transition-colors">
                  Crear Cuenta Gratis
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Product Type Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/catalog?type=PHYSICAL"
            className="card p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Productos Físicos</h3>
              <p className="text-sm text-gray-500">Electrónica, ropa, hogar y más</p>
            </div>
          </Link>

          <Link
            to="/catalog?type=SERVICE"
            className="card p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Servicios</h3>
              <p className="text-sm text-gray-500">Consultas, asesorías, bienestar</p>
            </div>
          </Link>

          <Link
            to="/catalog?type=SUBSCRIPTION"
            className="card p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Suscripciones</h3>
              <p className="text-sm text-gray-500">Streaming, software, educación</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Personalized Recommendations (if authenticated) */}
      {isAuthenticated && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recomendados para ti, {user?.firstName}
              </h2>
              <p className="text-gray-500">Basado en tu historial de navegación y compras</p>
            </div>
            <Link to="/catalog" className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tendencias</h2>
            <p className="text-gray-500">Los productos más populares de la semana</p>
          </div>
          <Link to="/catalog?sortBy=popular" className="text-primary-600 hover:text-primary-700 font-medium">
            Ver todos →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Destacados</h2>
              <p className="text-gray-500">Productos seleccionados por nuestro equipo</p>
            </div>
            <Link to="/catalog?featured=true" className="text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorías</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/catalog?categoryId=${category.id}`}
              className="card p-6 text-center hover:shadow-lg transition-shadow group"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Crea tu cuenta gratis y accede a ofertas exclusivas, seguimiento de pedidos
              y recomendaciones personalizadas.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
