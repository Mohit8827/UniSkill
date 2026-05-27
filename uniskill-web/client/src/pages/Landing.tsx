import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Video, ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import '../index.css';

const Landing: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring" as const, stiffness: 100 } 
    }
  };

  return (
    <div className="landing-page" style={{ overflow: 'hidden' }}>
      {/* Animated Background Elements */}
      <div className="background-blobs">
        <motion.div 
          className="blob blob-1"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="blob blob-2"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <div className="grid-overlay"></div>
      </div>
      
      <motion.header 
        className="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '100px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '2rem', backdropFilter: 'blur(10px)' }}>
          <Sparkles size={16} fill="currentColor" className="sparkle-icon" />
          <span>The Next Generation Learning Platform</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#0f172a' }}>
          Master New Skills <br /> 
          <span className="text-gradient animated-gradient">With Your Peers</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', color: '#64748b', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          The exclusive P2P learning marketplace for students. Exchange knowledge, earn money, and grow together in a secure university environment.
        </motion.p>
        
        <motion.div variants={itemVariants} className="cta-group" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-epic"
            >
              Start Learning <ArrowRight size={20} className="arrow-icon" />
            </motion.button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(241, 245, 249, 1)" }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-secondary btn-epic-secondary"
            >
              Explore Tutors
            </motion.button>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={18} color="var(--accent)" /> .EDU Verified</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="var(--primary)" /> 10,000+ Students</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={18} color="#eab308" fill="#eab308" /> 4.9/5 Average Rating</div>
        </motion.div>
      </motion.header>
      
      <motion.section 
        className="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem', position: 'relative', zIndex: 10 }}
      >
        {[
          { icon: <ShieldCheck size={28} />, title: "Secure & Verified", desc: "Connect exclusively with real university peers through our stringent .EDU verification system.", color: "var(--accent)" },
          { icon: <Zap size={28} />, title: "AI Skill Matching", desc: "Our smart algorithm pairs you with the perfect tutor or student based on your precise learning style.", color: "var(--primary)" },
          { icon: <Video size={28} />, title: "Epic Video Sessions", desc: "Experience lag-free, HD integrated classrooms with collaborative whiteboards right in your browser.", color: "#8b5cf6" }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="feature-card glass-card"
          >
            <div className="feature-icon-wrapper" style={{ background: `linear-gradient(135deg, ${feature.color}22, ${feature.color}11)`, color: feature.color }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{feature.title}</h3>
            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '1.05rem' }}>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .background-blobs {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          background-color: #f8fafc;
        }

        .blob {
          position: absolute;
          width: 800px;
          height: 800px;
          filter: blur(120px);
          border-radius: 50%;
          opacity: 0.15;
        }

        .blob-1 { top: -20%; right: -10%; background: var(--primary); }
        .blob-2 { bottom: -20%; left: -10%; background: var(--accent); }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        .animated-gradient {
          background-size: 200% auto;
          background-image: linear-gradient(to right, var(--primary) 0%, #8b5cf6 50%, var(--accent) 100%);
          animation: shine 4s linear infinite;
        }

        @keyframes shine {
          to { background-position: 200% center; }
        }

        .btn-epic {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          border-radius: 100px;
          background: linear-gradient(135deg, var(--primary), #4f46e5);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-epic .arrow-icon {
          transition: transform 0.3s ease;
        }

        .btn-epic:hover .arrow-icon {
          transform: translateX(5px);
        }

        .btn-epic-secondary {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(15, 23, 42, 0.1);
          color: #0f172a;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }

        .feature-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .sparkle-icon {
          animation: sparkle 2s ease-in-out infinite alternate;
        }

        @keyframes sparkle {
          0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          100% { transform: scale(1.2) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 5px var(--primary)); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
