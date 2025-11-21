import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db';
import { Order, Product } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([mockApi.getOrders(), mockApi.getProducts()])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData);
        setProducts(productsData);
      });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stock < 50).length;
  
  // Basic Chart Data (Mocked distribution)
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          color="emerald" 
          trend="+12% from last month"
        />
        <StatsCard 
          title="Total Orders" 
          value={orders.length} 
          icon={<ShoppingCart size={24} />} 
          color="blue"
        />
        <StatsCard 
          title="Products" 
          value={products.length} 
          icon={<Package size={24} />} 
          color="purple"
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          icon={<AlertTriangle size={24} />} 
          color="orange"
          trend="Requires attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Weekly Sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-mono text-slate-500">#{order._id.slice(0, 6)}</td>
                    <td className="py-3 text-slate-900 font-medium">{order.customerName}</td>
                    <td className="py-3 text-slate-600">₹{order.totalAmount.toFixed(0)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};