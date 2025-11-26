import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  description?: string;
  productsCount: number;
  isActive: boolean;
  imageUrl?: string;
}

const mockCategories: Category[] = [
  { id: 1, name: 'Electrónica', description: 'Dispositivos electrónicos y gadgets', productsCount: 45, isActive: true, imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200' },
  { id: 2, name: 'Ropa', description: 'Moda y accesorios', productsCount: 120, isActive: true, imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200' },
  { id: 3, name: 'Servicios Médicos', description: 'Consultas y servicios de salud', productsCount: 15, isActive: true, imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200' },
  { id: 4, name: 'Suscripciones', description: 'Planes y membresías digitales', productsCount: 8, isActive: true, imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200' },
  { id: 5, name: 'Hogar', description: 'Artículos para el hogar', productsCount: 67, isActive: false, imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200' },
];

export const Categories = () => {
  const [categories] = useState<Category[]>(mockCategories);
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="text-gray-500">Organiza las categorías del catálogo</p>
        </div>
        <button className="btn-primary">+ Nueva Categoría</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="stat-label">Total Categorías</p>
          <p className="stat-value">{categories.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Activas</p>
          <p className="stat-value text-green-600">{categories.filter(c => c.isActive).length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Inactivas</p>
          <p className="stat-value text-gray-400">{categories.filter(c => !c.isActive).length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Productos</p>
          <p className="stat-value">{categories.reduce((sum, c) => sum + c.productsCount, 0)}</p>
        </div>
      </div>

      <div className="card p-4">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="card overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`badge ${category.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {category.productsCount} productos
                </span>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
