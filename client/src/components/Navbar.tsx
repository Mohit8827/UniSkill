import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Wallet, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-gray-100 w-full select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20 items-center">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3 group cursor-pointer active:scale-95 transition-transform">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="bg-primary-600 p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg shadow-primary-200"
              >
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </motion.div>
              <span className="text-base sm:text-xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-400 transition-all duration-300 whitespace-nowrap">
                UNISKILL
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {user ? (
              <>
                <Link to="/wallet" className="flex items-center space-x-3 bg-gray-50 px-4 lg:px-5 py-2.5 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-white transition-all group cursor-pointer">
                  <div className="bg-primary-100 p-2 rounded-xl group-hover:bg-primary-600 transition-colors">
                    <Wallet className="h-5 w-5 text-primary-600 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                    <p className="font-black text-gray-900 leading-none">{user.credits?.toFixed(1)} <span className="text-xs text-gray-400">CR</span></p>
                  </div>
                </Link>

                <div className="flex items-center space-x-4 lg:space-x-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-black text-gray-900 leading-none mb-1">{user.name}</p>
                      <div className="flex items-center justify-end space-x-1">
                        {user.isVerified ? (
                          <>
                            <ShieldCheck className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-primary-100 uppercase border-2 border-white">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="p-3 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-black text-gray-500 hover:text-primary-600 transition-all cursor-pointer px-4 py-2 hover:bg-gray-50 rounded-xl">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-6 lg:px-8 py-3 rounded-2xl font-black text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95 cursor-pointer">
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-50">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-100 uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{user.name}</p>
                      <div className="flex items-center space-x-1">
                        {user.isVerified ? (
                          <>
                            <ShieldCheck className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verified</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link 
                    to="/wallet" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-primary-600" />
                      <span className="font-bold text-gray-700">Wallet</span>
                    </div>
                    <span className="font-black text-primary-600">{user.credits?.toFixed(1)} CR</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-4 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="text-center py-4 font-black text-gray-500 hover:text-primary-600 transition-colors cursor-pointer bg-gray-50 rounded-2xl"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsOpen(false)}
                    className="text-center bg-primary-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-100 cursor-pointer"
                  >
                    Join Platform
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
