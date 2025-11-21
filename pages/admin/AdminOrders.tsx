
import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db.ts';
import { Order, OrderStatus } from '../../types.ts';
import { Button } from '../../components/Button.tsx';
import { Filter, Search } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    mockApi.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await mockApi.updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const statusOptions = Object.values(OrderStatus);
  
  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'].map(status => (
                <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                        statusFilter === status 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>
      
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {order.invoiceNumber}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{order.customerName}</span>
                            <span className="text-xs text-slate-500">{order.items.length} items</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{(order.totalAmount * 1.05).toFixed(2)}</td>
                    <td className="px-6 py-4">
                    <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer outline-none appearance-none transition-all
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'PACKED' ? 'bg-purple-100 text-purple-700' : ''}
                        ${order.status === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                        `}
                    >
                        {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    </td>
                    <td className="px-6 py-4">
                        <Button size="sm" variant="outline" className="text-xs h-8 border-slate-300">View Details</Button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    No orders found.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
