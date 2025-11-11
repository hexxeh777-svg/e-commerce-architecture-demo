import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        limit,
        offset,
      };
      
      if (search) params.search = search;
      if (category) params.category = parseInt(category);
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      // Запрос к вашему API
      const response = await axios.get('http://localhost:3000/products', { params });
      setProducts(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, minPrice, maxPrice, limit, offset]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0); // Сброс пагинации при поиске
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Товары</h1>
      
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-gray-100 rounded">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Поиск</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Название товара"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Все</option>
              <option value="1">Электроника</option>
              <option value="2">Одежда</option>
              <option value="3">Книги</option>
              <option value="4">Дом и сад</option>
              <option value="5">Спорт</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Мин. цена</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Макс. цена</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">На странице</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Поиск
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <>
          <div className="mb-4">
            Найдено: {total} товаров
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded shadow">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-600">SKU: {product.sku}</p>
                <p className="text-gray-700">{product.description}</p>
                <p className="font-semibold text-xl mt-2">{product.price} руб.</p>
                <p className="text-sm text-gray-500">Категория: {product.category.name}</p>
                <p className="text-xs text-gray-400">ID: {product.id}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <button
                  key={page}
                  onClick={() => setOffset(page * limit)}
                  className={`px-3 py-1 rounded ${
                    offset / limit === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;