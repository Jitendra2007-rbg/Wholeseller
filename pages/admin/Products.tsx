
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db.ts';
import { Product } from '../../types.ts';
import { Button } from '../../components/Button.tsx';
import { Plus, Edit2, Trash2, Sparkles, Search, Filter } from 'lucide-react';
import { generateProductDescription } from '../../services/geminiService.ts';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: '', price: 0, stock: 0, unit: '', description: '', imageUrl: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => mockApi.getProducts().then(setProducts);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product._id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({ name: '', sku: '', category: '', price: 0, stock: 0, unit: '', description: '', imageUrl: 'https://picsum.photos/200' });
    }
    setIsModalOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      alert('Please enter Name and Category first');
      return;
    }
    setGeneratingDesc(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData({ ...formData, description: desc });
    setGeneratingDesc(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mockApi.saveProduct({ ...formData, _id: editingId || '' } as Product);
      await loadProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
      await mockApi.deleteProduct(id);
      loadProducts();
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', barColor: 'bg-red-500' };
    if (stock < 50) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700', barColor: 'bg-orange-500' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700', barColor: 'bg-emerald-500' };
  };

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
        filterStatus === 'all' ? true :
        filterStatus === 'low' ? p.stock < 50 && p.stock > 0 :
        filterStatus === 'out' ? p.stock === 0 : true;
    return matchesSearch && matchesFilter;
  });

  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="text-slate-500">Manage products and stock levels</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search SKU or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                />
            </div>
            <Button onClick={() => handleOpenModal()}>
                <Plus size={18} className="mr-2" /> Add Product
            </Button>
        </div>
      </div>

      {/* Inventory Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Items</p>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Value</p>
              <p className="text-2xl font-bold text-emerald-600">₹{totalStockValue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-orange-500">{products.filter(p => p.stock < 50 && p.stock > 0).length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-red-500">{products.filter(p => p.stock === 0).length}</p>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 pb-1">
        <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 text-sm font-medium transition-colors relative ${filterStatus === 'all' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
            All Products
            {filterStatus === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full"></div>}
        </button>
        <button onClick={() => setFilterStatus('low')} className={`px-4 py-2 text-sm font-medium transition-colors relative ${filterStatus === 'low' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Low Stock
            {filterStatus === 'low' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></div>}
        </button>
        <button onClick={() => setFilterStatus('out')} className={`px-4 py-2 text-sm font-medium transition-colors relative ${filterStatus === 'out' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Out of Stock
            {filterStatus === 'out' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
        </button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-1/4">Stock Level</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => {
                    const status = getStockStatus(product.stock);
                    const maxStock = 500; // Arbitrary max for visuals
                    const percentage = Math.min(100, (product.stock / maxStock) * 100);
                    
                    return (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-lg bg-slate-200 object-cover border border-slate-200" />
                                <div>
                                    <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${status.color}`}>
                                {status.label}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-700">{product.stock} {product.unit}</span>
                                <span className="text-[10px] text-slate-400">Target: {maxStock}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${status.barColor} transition-all duration-500`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">₹{product.price}</p>
                        </td>
                        <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{product.sales || 0} units</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(product._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    );
                })}
            </tbody>
            </table>
            {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No products found matching your criteria.
                </div>
            )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-slate-200">
            <h2 className="text-xl font-bold mb-6 text-slate-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Product Name</label>
                  <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g., Premium Rice" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">SKU Code</label>
                  <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required placeholder="e.g., RC-001"/>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                  <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Stock Qty</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Unit Type</label>
                  <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required placeholder="e.g., kg, box, litre" />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
                  <button 
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-100 hover:bg-purple-100 transition-colors"
                    disabled={generatingDesc}
                  >
                    <Sparkles size={12} className="mr-1" /> {generatingDesc ? 'Generating...' : 'Auto-Generate with AI'}
                  </button>
                </div>
                <textarea className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Enter product description..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Image URL</label>
                <input className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={loading}>{editingId ? 'Update Product' : 'Create Product'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
