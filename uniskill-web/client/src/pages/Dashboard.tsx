import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, BookOpen, UserCheck, Video, MessageCircle, Filter, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

interface User {
  id: string;
  studentId: string;
  email: string;
  skillsHave: string[];
  skillsWant: string[];
  role: string;
  rating?: number;
}

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('tutor');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      if (searchQuery.length === 0) {
        setResults([
          { id: '1', studentId: '2024001', email: 'alex@edu.com', skillsHave: ['React', 'TypeScript', 'UI Design'], skillsWant: ['Python', 'Data Science'], role: 'tutor', rating: 4.9 },
          { id: '2', studentId: '2024002', email: 'sam@edu.com', skillsHave: ['Calculus', 'Linear Algebra', 'Physics'], skillsWant: ['React', 'Next.js'], role: 'tutor', rating: 4.7 },
          { id: '3', studentId: '2024003', email: 'jordan@edu.com', skillsHave: ['Machine Learning', 'Python'], skillsWant: ['Public Speaking'], role: 'tutor', rating: 5.0 },
        ]);
      } else if (searchQuery.length > 2) {
        fetch(`/api/matches?skill=${searchQuery}&type=${searchType}`)
          .then(res => res.json())
          .then(data => setResults(data))
          .catch(() => {
            setResults([
              { id: '4', studentId: '2024004', email: 'demo@edu.com', skillsHave: [searchQuery, 'Related Skill'], skillsWant: ['Design'], role: 'tutor', rating: 4.8 }
            ]);
          });
      }
      setIsSearching(false);
    }, 600); // Fake delay for epic loading effect

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring" as const, stiffness: 200, damping: 20 } 
    }
  };

  return (
    <div className="dashboard-container epic-bg">
      <div className="epic-grid-bg"></div>
      
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dashboard-header epic-glass-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-box epic-icon-box">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #1e293b, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Dashboard</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Welcome back, scholar!</p>
          </div>
        </div>
        <div className="profile-summary" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <motion.div whileHover={{ scale: 1.05 }} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <UserCheck size={14} /> VERIFIED .EDU
          </motion.div>
        </div>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="search-section epic-search-section"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <Sparkles size={20} color="var(--primary)" /> Find Your Perfect Learning Partner
          </h3>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ background: 'transparent', border: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={16} /> Advanced Filters
          </motion.button>
        </div>
        
        <div className="search-controls" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 2 }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
              type="text" 
              placeholder="E.g., Machine Learning, Calculus, Spanish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="epic-input"
            />
          </div>
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="epic-select"
          >
            <option value="tutor">I want to LEARN (Find Tutors)</option>
            <option value="student">I want to TEACH (Find Students)</option>
          </select>
        </div>
      </motion.div>

      <div className="results-section" style={{ marginTop: '3rem', position: 'relative', zIndex: 10 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
          <BookOpen size={20} color="var(--primary)" />
          {searchQuery ? `Searching for "${searchQuery}"...` : `Top Rated ${searchType === 'tutor' ? 'Tutors' : 'Students'} For You`}
        </h3>
        
        {isSearching ? (
           <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
               <Search size={40} color="var(--primary)" style={{ opacity: 0.5 }} />
             </motion.div>
           </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="results-grid"
          >
            <AnimatePresence>
              {results.map(user => (
                <motion.div 
                  key={user.id} 
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="user-card epic-user-card"
                >
                  <div className="card-glow"></div>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar-placeholder epic-avatar">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{user.email.split('@')[0]}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308', fontSize: '0.875rem', marginTop: '0.25rem', fontWeight: 600 }}>
                            <Star size={14} fill="#eab308" /> {user.rating || 'New'}
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {user.role}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Teaches:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {user.skillsHave.map(skill => (
                          <span key={skill} className="skill-chip epic-chip-primary">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Wants to learn:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {user.skillsWant.map(skill => (
                          <span key={skill} className="skill-chip epic-chip-secondary">{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link to={`/session/${user.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary epic-btn-action" style={{ width: '100%', padding: '0.75rem' }}>
                          <Video size={18} /> Start Session
                        </motion.button>
                      </Link>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn btn-secondary epic-btn-icon">
                        <MessageCircle size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <style>{`
        .epic-bg {
          position: relative;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        .epic-grid-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 30px 30px;
          z-index: 0;
          pointer-events: none;
        }

        .epic-glass-header {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
          border-radius: 16px !important;
        }

        .epic-icon-box {
          background: linear-gradient(135deg, var(--primary), #8b5cf6) !important;
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3) !important;
        }

        .epic-search-section {
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(99, 102, 241, 0.1) !important;
          border-radius: 24px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02) !important;
        }

        .epic-input {
          padding-left: 3.5rem !important;
          width: 100%;
          box-sizing: border-box;
          height: 4rem !important;
          border-radius: 16px !important;
          border: 2px solid #e2e8f0 !important;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          font-size: 1.125rem;
          font-weight: 500;
          background: #f8fafc;
        }

        .epic-input:focus {
          border-color: var(--primary) !important;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .epic-select {
          padding: 0 1.5rem !important;
          border-radius: 16px !important;
          border: 2px solid #e2e8f0 !important;
          outline: none;
          background: white !important;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .epic-select:focus {
          border-color: var(--primary) !important;
        }

        .epic-user-card {
          position: relative;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
          border-radius: 24px !important;
          padding: 2rem !important;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
        }

        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 70%);
          z-index: 1;
        }

        .epic-avatar {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0) !important;
          color: var(--primary) !important;
          font-weight: 800 !important;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 6px rgba(0,0,0,0.05);
        }

        .skill-chip {
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.025em;
          transition: all 0.2s ease;
          cursor: default;
        }

        .skill-chip:hover {
          transform: translateY(-2px);
        }

        .epic-chip-primary {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .epic-chip-secondary {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .epic-btn-action {
          background: linear-gradient(135deg, var(--primary), #4f46e5) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3) !important;
        }

        .epic-btn-icon {
          padding: 0.75rem !important;
          border-radius: 12px !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          color: var(--primary) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
