import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../../viewmodels';
import { ProductType, Category } from '../../models';
import { catalogService } from '../../services';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  const typeParam = searchParams.get('type') as ProductType | null;
  const categoryParam = searchParams.get('categoryId');
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'name';

  const { products, isLoading, filters, updateFilters } = useProducts({
    productType: typeParam || undefined,
    categoryId: categoryParam || undefined,
    search: searchQuery,
    sortBy: sortBy as 'name' | 'price' | 'rating' | 'popular',
  });

  useEffect(() => {
    catalogService.getCategories().then(setCategories);
  }, []);

  const handleTypeChange = (type: ProductType | '') => {
    const newParams = new URLSearchParams(searchParams);
    if (type) {
      newParams.set('type', type);
    } else {
      newParams.delete('type');
    }
    setSearchParams(newParams);
    updateFilters({ productType: type || undefined });
  };

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set('categoryId', categoryId);
    } else {
      newParams.delete('categoryId');
    }
    setSearchParams(newParams);
    updateFilters({ categoryId: categoryId || undefined });
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sort);
    setSearchParams(newParams);
    updateFilters({ sortBy: sort as 'name' | 'price' | 'rating' | 'popular' });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
    updateFilters({ search: query });
  };

  const productTypes: { value: ProductType | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PHYSICAL', label: 'Productos Físicos' },
    { value: 'SERVICE', label: 'Servicios' },
    { value: 'SUBSCRIPTION', label: 'Suscripciones' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-gray-500 mt-2">
          Explora nuestra variedad de productos, servicios y suscripciones
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Buscar productos..."
                className="input-field pl-10 w-full"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={categoryParam || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
            <option value="rating">Mejor valorados</option>
            <option value="popular">Más populares</option>
          </select>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {productTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (typeParam || '') === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {products.length} productos encontrados
        </p>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500">
            Intenta cambiar los filtros o el término de búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
