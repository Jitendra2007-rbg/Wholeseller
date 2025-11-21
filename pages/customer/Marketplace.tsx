import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/Button';
import { Search, Plus, Check } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();
  const [addedEffects, setAddedEffects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await mockApi.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedEffects({ ...addedEffects, [product._id]: true });
    setTimeout(() => {
      setAddedEffects(prev => ({ ...prev, [product._id]: false }));
    }, 1000);
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
          <p className="text-slate-500">Browse wholesale items for your shop</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-32 md:h-48 overflow-hidden relative bg-slate-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                {product.stock < 50 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                    Low Stock
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <div>
                    <p className="text-[10px] md:text-xs text-emerald-600 font-semibold uppercase tracking-wide">{product.category}</p>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base line-clamp-1" title={product.name}>{product.name}</h3>
                  </div>
                  <span className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{product.sku}</span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mb-2 md:mb-4 flex-1 line-clamp-2">{product.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-auto gap-2">
                  <div>
                    <p className="text-base md:text-lg font-bold text-emerald-700">₹{product.price.toFixed(2)}</p>
                    <p className="text-[10px] md:text-xs text-slate-500">per {product.unit}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full sm:w-auto flex justify-center ${addedEffects[product._id] ? 'bg-emerald-800' : ''}`}
                  >
                    {addedEffects[product._id] ? <Check size={16} /> : <Plus size={16} />}
                    <span className="ml-1 text-xs md:text-sm">{addedEffects[product._id] ? 'Added' : 'Add'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};