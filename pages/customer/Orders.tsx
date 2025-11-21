import React, { useEffect, useState } from 'react';
import { mockApi } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      mockApi.getOrders(user._id).then(setOrders);
    }
  }, [user]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="text-yellow-500" />;
      case OrderStatus.DELIVERED: return <CheckCircle className="text-emerald-500" />;
      case OrderStatus.CANCELLED: return <XCircle className="text-red-500" />;
      default: return <Truck className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-indigo-100 text-indigo-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No orders placed yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Order ID</p>
                  <p className="font-mono font-bold text-slate-700">#{order._id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Date Placed</p>
                  <p className="text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Total Amount</p>
                  <p className="font-bold text-emerald-600">₹{(order.totalAmount * 1.05).toFixed(2)}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="p-6">
                <h4 className="font-medium text-slate-900 mb-4">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        <span className="font-medium text-slate-900">{item.quantity}x</span> {item.name}
                      </span>
                      <span className="text-slate-500">₹{item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                <button className="text-sm text-emerald-600 font-medium hover:underline">Download Invoice</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};