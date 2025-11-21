import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/db';
import { Button } from '../../components/Button';
import { Trash2, ArrowRight, ChefHat, Sparkles, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { suggestRecipesFromCart } from '../../services/geminiService';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setIsOrdering(true);
    try {
      await mockApi.createOrder(user._id, items, cartTotal);
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error(error);
      alert('Failed to place order');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleAskAi = async () => {
    setAiLoading(true);
    const itemNames = items.map(i => i.name);
    const suggestion = await suggestRecipesFromCart(itemNames);
    setAiSuggestion(suggestion);
    setAiLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Trash2 size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="mb-6">Start adding products to create an order.</p>
        <Button onClick={() => navigate('/marketplace')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Review Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-center">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <p className="text-sm text-slate-500 mb-3">{item.unit} • ₹{item.price}/unit</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                     <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                     >
                        <Minus size={14} />
                     </button>
                     <span className="px-3 text-sm font-medium text-slate-900">{item.quantity}</span>
                     <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-2 hover:bg-slate-50 text-slate-600 transition-colors"
                     >
                        <Plus size={14} />
                     </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 p-2 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* AI Assistant Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mt-6">
            <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
              <Sparkles size={20} />
              <h3>Chef's Assistant</h3>
            </div>
            <p className="text-sm text-indigo-600 mb-4">Not sure what to do with this bulk order? Ask our AI for menu ideas.</p>
            
            {aiSuggestion ? (
              <div className="bg-white/80 p-4 rounded-lg text-sm text-slate-800 mb-4 whitespace-pre-line border border-indigo-100">
                {aiSuggestion}
              </div>
            ) : null}
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleAskAi} 
              isLoading={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <ChefHat size={16} className="mr-2" />
              {aiSuggestion ? 'Get More Ideas' : 'Suggest Recipes'}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 border-b border-slate-100 pb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (5%)</span>
                <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 mb-8">
              <span>Total</span>
              <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
            </div>
            
            <Button className="w-full" size="lg" onClick={handleCheckout} isLoading={isOrdering}>
              Place Order <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};