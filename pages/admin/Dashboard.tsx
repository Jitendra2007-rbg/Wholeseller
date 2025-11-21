
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db.ts';
import { Order, Product } from '../../types.ts';
import { StatsCard } from '../../components/StatsCard.tsx';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [ordersData, productsData, topProds] = await Promise.all([
        mockApi.getOrders(),
        mockApi.getProducts(),
        mockApi.getTopProducts(4)
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setTopProducts(topProds);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = products.filter(p => p.stock < 50).length;
  
  // Chart Data: Revenue over time (Mock generated from orders or static if no orders)
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  // Stock Health Data
  const stockStatusData = [
    { name: 'In Stock', value: products.filter(p => p.stock >= 50).length, color: '#10b981' },
    { name: 'Low Stock', value: products.filter(p => p.stock < 50 && p.stock > 0).length, color: '#f59e0b' },
    { name: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: '#ef4444' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
            <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
            <Link to="/admin/products" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Manage Inventory
            </Link>
            <Link to="/admin/orders" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                View All Orders
            </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
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
          trend={`${orders.filter(o => o.status === 'PENDING').length} pending`}
        />
        <StatsCard 
          title="Total Products" 
          value={products.length} 
          icon={<Package size={24} />} 
          color="purple"
          trend={`${products.reduce((acc, p) => acc + p.stock, 0)} units on hand`}
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={lowStockCount} 
          icon={<AlertTriangle size={24} />} 
          color="orange"
          trend="Requires attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Revenue Analytics</h3>
            <select className="text-sm border-slate-200 rounded-lg text-slate-500 focus:ring-emerald-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Health Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Inventory Health</h3>
          <p className="text-sm text-slate-500 mb-4">Stock distribution by status</p>
          <div className="flex-1 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stockStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600"/> Top Selling Products
            </h3>
            <div className="space-y-4">
                {topProducts.map((product, idx) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-8 text-center font-bold text-slate-400">0{idx + 1}</div>
                        <img src={product.imageUrl} className="w-12 h-12 rounded-lg bg-slate-100 object-cover" alt={product.name} />
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-900 line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-slate-500">{product.sales || 0} units sold</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-emerald-600">₹{(product.revenue || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-400">Revenue</p>
                        </div>
                    </div>
                ))}
                {topProducts.length === 0 && <p className="text-slate-500 text-center py-4">No sales data available.</p>}
            </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-blue-600"/> Recent Activity
            </h3>
            <div className="relative pl-4 border-l border-slate-200 space-y-8">
                {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            order.status === 'PENDING' ? 'bg-yellow-400' : 'bg-emerald-500'
                        }`}></div>
                        <div>
                            <p className="text-sm text-slate-900">
                                New order <span className="font-mono font-medium text-slate-600">#{order.invoiceNumber}</span> received from <span className="font-medium">{order.customerName}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && <p className="text-slate-500 italic">No recent activity.</p>}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                <Link to="/admin/orders" className="inline-flex items-center text-sm text-emerald-600 font-medium hover:text-emerald-700">
                    View all activity <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};
