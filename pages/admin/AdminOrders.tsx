import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db.ts';
import { Order, OrderStatus } from '../../types.ts';
import { Button } from '../../components/Button.tsx';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Order Management</h1>
      
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-sm font-medium text-emerald-700">{order.invoiceNumber}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-900">{order.customerName}</p>
                  <p className="text-xs text-slate-500">{order.items.length} items</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{(order.totalAmount * 1.05).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
                    className={`text-xs font-medium px-2 py-1 rounded border-0 ring-1 ring-inset focus:ring-2 focus:ring-emerald-600 cursor-pointer outline-none
                      ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : ''}
                      ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : ''}
                      ${order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 ring-red-600/20' : ''}
                    `}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                    <Button size="sm" variant="outline" className="text-xs">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};