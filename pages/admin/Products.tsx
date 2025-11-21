import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db';
import { Product } from '../../types';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { generateProductDescription } from '../../services/geminiService';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

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
    if(confirm('Are you sure?')) {
      await mockApi.deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 flex items-center gap-4">
                  <img src={product.imageUrl} alt="" className="w-10 h-10 rounded bg-slate-200 object-cover" />
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{product.sku}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">₹{product.price}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${product.stock < 50 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {product.stock} {product.unit}
                  </span>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Product Name</label>
                  <input className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">SKU</label>
                  <input className="w-full p-2 border rounded-lg" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <input className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Price (₹)</label>
                  <input type="number" className="w-full p-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Stock</label>
                  <input type="number" className="w-full p-2 border rounded-lg" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                </div>
              </div>

              <div>
                  <label className="block text-xs font-medium mb-1">Unit (e.g., kg, box)</label>
                  <input className="w-full p-2 border rounded-lg" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium">Description</label>
                  <button 
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-800 font-medium"
                    disabled={generatingDesc}
                  >
                    <Sparkles size={12} className="mr-1" /> {generatingDesc ? 'Thinking...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea className="w-full p-2 border rounded-lg h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Image URL</label>
                <input className="w-full p-2 border rounded-lg" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={loading}>{editingId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};