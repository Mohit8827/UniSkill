import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Zap, Shield, ArrowRight, Sparkles, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-primary-400/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-16 md:pb-32 flex flex-col items-center text-center">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 mb-8"
        >
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-[10px] md:text-sm font-black text-gray-600 uppercase tracking-widest">The Future of Campus Learning</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-900 leading-[1.2] md:leading-[1.1] tracking-tight max-w-4xl"
        >
          Master Any Skill. <br /> 
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Powered by Peers.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 md:mt-8 text-base md:text-xl text-gray-500 max-w-2xl leading-relaxed px-4"
        >
          Eliminate high costs and rigid schedules. UniSkill connects you with talented students 
          on your campus for instant, 1-on-1 video learning sessions.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6"
        >
          {user ? (
             <Link to="/dashboard" className="w-full sm:w-auto bg-primary-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 flex items-center justify-center space-x-2 active:scale-95">
                <span>Enter Dashboard</span>
                <ArrowRight className="h-5 w-5" />
             </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto bg-primary-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 flex items-center justify-center space-x-2 active:scale-95">
                <span>Join the Network</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="w-full sm:w-auto bg-white text-gray-900 px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center active:scale-95">
                How it Works
              </a>
            </>
          )}
        </motion.div>

        {/* Feature Grid */}
        <div id="features" className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-left w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="bg-primary-50 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
               <Globe className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Universal Access</h2>
            <p className="mt-4 text-gray-500 text-base md:text-lg leading-relaxed">
              From Python to Piano, find a mentor for any subject instantly. No more searching through outdated forums or expensive tutoring sites.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
          >
             <div className="bg-primary-50 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
               <Cpu className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Credit Economy</h2>
            <p className="mt-4 text-gray-500 text-base md:text-lg leading-relaxed">
              Our smart credit system ensures fair exchange. Teach what you love to earn, and spend those earnings to learn something new.
            </p>
          </motion.div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-24 md:mt-32 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-sm"><Shield className="h-5 w-5" /> Campus Verified</div>
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-sm"><Zap className="h-5 w-5" /> Instant Matching</div>
            <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] md:text-sm"><Users className="h-5 w-5" /> 10,000+ Students</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
