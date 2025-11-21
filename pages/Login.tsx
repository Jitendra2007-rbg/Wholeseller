import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/db';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShoppingBag } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('shop@local.com'); // Pre-fill for demo
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await mockApi.login(email, password);
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/marketplace');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-100 p-3 rounded-full mb-4">
            <ShoppingBag className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500">Sign in to WholesalePro</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-medium hover:text-emerald-700">
            Register Shop
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
           <p className="text-xs text-center text-slate-400">Demo Credentials:</p>
           <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
             <span onClick={() => {setEmail('admin@wholesale.com'); setPassword('password')}} className="cursor-pointer hover:text-emerald-600">Admin: admin@wholesale.com</span>
             <span onClick={() => {setEmail('shop@local.com'); setPassword('password')}} className="cursor-pointer hover:text-emerald-600">Shop: shop@local.com</span>
           </div>
        </div>
      </div>
    </div>
  );
};