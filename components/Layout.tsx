import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, LayoutDashboard, Package, ShoppingBag, Users, Menu, X, FileText, RefreshCw } from 'lucide-react';
import { mockApi } from '../services/db';
import { UserRole } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, login, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = async () => {
    const targetRole = isAdmin ? UserRole.CUSTOMER : UserRole.ADMIN;
    const newUser = await mockApi.getDevUser(targetRole);
    login(newUser);
    navigate(targetRole === UserRole.ADMIN ? '/admin' : '/marketplace');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path ? 'bg-emerald-700' : '';

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="bg-slate-900 text-white md:hidden flex-shrink-0 h-16 flex items-center justify-between px-4 z-20">
         {/* Left: Menu Toggle */}
         <button className="w-10 flex justify-start" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>

         {/* Center: Brand */}
         <div className="flex items-center gap-2 font-bold text-xl text-emerald-400">
            <ShoppingBag size={24} />
            <span>WholesalePro</span>
         </div>

         {/* Right: Cart (Customer) or Spacer (Admin) */}
         <div className="w-10 flex justify-end">
            {!isAdmin && (
                <Link to="/cart" className="relative">
                    <ShoppingCart size={24} />
                    {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                    </span>
                    )}
                </Link>
            )}
         </div>
      </div>

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition duration-200 ease-in-out
        bg-slate-900 text-white w-64 flex-shrink-0 flex flex-col z-30
        md:h-screen
      `}>
        {/* Desktop Logo Area */}
        <div className="hidden md:flex items-center gap-2 font-bold text-xl text-emerald-400 p-6">
            <ShoppingBag size={24} />
            <span>WholesalePro</span>
        </div>

        {/* Mobile Menu Header (Close button usually inside but we have toggle on top bar, 
            so this is just user info area for mobile, match desktop padding) */}
        <div className="p-4 md:p-6 border-b border-slate-700 pt-20 md:pt-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Signed in as</p>
            <p className="font-medium truncate">{user.ownerName}</p>
            {user.shopName && <p className="text-sm text-slate-400 truncate">{user.shopName}</p>}
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {isAdmin ? (
            <>
              <Link to="/admin" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/admin')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/admin/products" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/admin/products')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Package size={20} /> Products
              </Link>
              <Link to="/admin/orders" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/admin/orders')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <FileText size={20} /> Orders
              </Link>
              <div className="opacity-50 cursor-not-allowed flex items-center gap-3 p-3 rounded-lg">
                <Users size={20} /> Customers
              </div>
            </>
          ) : (
            <>
              <Link to="/marketplace" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/marketplace')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <ShoppingBag size={20} /> Marketplace
              </Link>
              <Link to="/cart" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/cart')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <div className="relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </div>
                My Cart
              </Link>
              <Link to="/orders" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 ${isActive('/orders')}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Package size={20} /> My Orders
              </Link>
            </>
          )}
          
          <div className="mt-auto space-y-2 pt-4 border-t border-slate-800">
            <button onClick={handleSwitchRole} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-900/30 text-indigo-300 text-sm">
                <RefreshCw size={18} /> Switch to {isAdmin ? 'Customer' : 'Admin'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/30 text-red-400">
                <LogOut size={20} /> Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Overlay when mobile menu open */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-64px)] md:h-screen">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};