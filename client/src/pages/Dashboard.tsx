import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Briefcase, Star, Clock, Zap, Users, Wallet, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [mode, setMode] = useState<'LEARN' | 'SWAP' | 'FREELANCE'>('LEARN');
  const [search, setSearch] = useState('');
  const [mentors, setMentors] = useState([]);
  const [swapMatches, setSwapMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [_loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [mode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (mode === 'LEARN') {
        const res = await axios.get(`/marketplace/mentors?query=${search}`);
        setMentors(res.data);
      } else if (mode === 'SWAP') {
        const res = await axios.get('/marketplace/swap-matches');
        setSwapMatches(res.data);
      } else {
        const res = await axios.get('/marketplace/my-sessions');
        setSessions(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-primary-200 gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Welcome back, {user?.name}! 👋</h1>
          <p className="text-primary-100 text-base md:text-lg">Ready to level up your skills today?</p>
        </div>
        <div className="flex items-center justify-between lg:justify-start space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="flex items-center space-x-4">
            <Wallet className="h-6 w-6 md:h-8 md:w-8 text-primary-200" />
            <div>
              <p className="text-[10px] md:text-sm font-medium text-primary-200 uppercase tracking-wider">Balance</p>
              <p className="text-xl md:text-3xl font-black">{user?.credits?.toFixed(2)} <span className="text-xs md:text-sm font-normal uppercase">CR</span></p>
            </div>
          </div>
          <Link to="/wallet" className="bg-white text-primary-700 p-2 rounded-xl hover:bg-primary-50 transition-colors">
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-3 md:gap-4 no-scrollbar">
        {[
          { id: 'LEARN', icon: BookOpen, label: 'Find a Mentor' },
          { id: 'SWAP', icon: Zap, label: 'Skill Swap' },
          { id: 'FREELANCE', icon: Briefcase, label: 'My Sessions' }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`flex items-center space-x-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all duration-300 whitespace-nowrap shrink-0 ${
              mode === m.id 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 md:border-transparent'
            }`}
          >
            <m.icon className={`h-5 w-5 md:h-6 md:w-6 ${mode === m.id ? 'animate-pulse' : ''}`} />
            <span className="text-sm md:text-base">{m.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'LEARN' && (
            <div className="space-y-6 md:space-y-8">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
                <div className="absolute inset-0 bg-primary-400 blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                <div className="relative flex flex-col md:flex-row items-center bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-2 gap-2">
                  <div className="flex items-center flex-grow w-full px-2">
                    <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search for skills..."
                      className="w-full px-3 py-3 md:py-4 outline-none text-base md:text-xl font-medium placeholder:text-gray-300"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-primary-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-primary-700 transition-all active:scale-95">
                    Search
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {mentors.map((mentor: any) => (
                  <div key={mentor.id} className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary-50 rounded-bl-full -mr-8 -mt-8 md:-mr-10 md:-mt-10"></div>
                    <div className="relative space-y-4 md:space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-2xl md:text-3xl uppercase">
                          {mentor.name.charAt(0)}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-yellow-500 mb-0.5">
                            <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
                            <span className="ml-1 font-black text-base md:text-lg">{mentor.rating || '5.0'}</span>
                          </div>
                          <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-wider">{mentor.numReviews} Reviews</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">{mentor.name}</h3>
                        <p className="text-primary-600 text-sm md:text-base font-bold flex items-center mt-0.5">
                          <Users className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5" />
                          {mentor.college}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.map((skill: string) => (
                          <span key={skill} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border border-gray-100 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <Link
                        to={`/session/book/${mentor.id}`}
                        className="flex items-center justify-center w-full bg-gray-900 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-primary-600 transition-all active:scale-95 shadow-lg shadow-gray-100"
                      >
                        Book Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'SWAP' && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2 md:space-y-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Recommended Matches ⚡</h2>
                <p className="text-gray-500 text-base md:text-lg px-4">Students who have what you want and want what you have!</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {swapMatches.map((match: any) => (
                  <div key={match.id} className="bg-white rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-6 md:gap-8 items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-primary-600"></div>
                    <div className="h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center text-white font-black text-4xl md:text-5xl uppercase shadow-xl">
                      {match.name.charAt(0)}
                    </div>
                    <div className="flex-grow space-y-4 md:space-y-6 text-center md:text-left w-full">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900">{match.name}</h3>
                        <p className="text-primary-600 font-bold text-base md:text-lg">{match.college}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-1 md:space-y-2">
                          <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Offers</p>
                          <p className="text-base md:text-lg font-bold text-green-600 bg-green-50 px-4 py-1.5 rounded-xl inline-block w-full">{match.matchSkill}</p>
                        </div>
                        <div className="space-y-1 md:space-y-2">
                          <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Wants</p>
                          <p className="text-base md:text-lg font-bold text-primary-600 bg-primary-50 px-4 py-1.5 rounded-xl inline-block w-full">{match.wantSkill}</p>
                        </div>
                      </div>
                      <button className="w-full md:w-auto bg-primary-600 text-white px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-100">
                        Propose Swap
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'FREELANCE' && (
            <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Learning Sessions</h2>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Total: {sessions.length}
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-white">
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Participant</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Topic</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Schedule</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sessions.map((session: any) => (
                      <tr key={session.id} className="hover:bg-primary-50/30 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                              {session.otherUser.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-gray-900">{session.otherUser.name}</p>
                              <p className="text-xs font-bold text-gray-400 uppercase">@{session.otherUser.college}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
                            {session.skill}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="space-y-1">
                            <p className="font-black text-gray-700">{new Date(session.startTime).toLocaleDateString()}</p>
                            <p className="text-[10px] font-bold text-gray-400 flex items-center uppercase tracking-wider">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            session.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <Link
                            to={`/session/${session.id}`}
                            className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-primary-700 transition-all hover:shadow-lg shadow-primary-100 inline-block uppercase tracking-wider"
                          >
                            Enter Room
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-50">
                {sessions.map((session: any) => (
                  <div key={session.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center font-black text-primary-600">
                          {session.otherUser.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{session.otherUser.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{session.otherUser.college}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        session.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-black text-gray-500 uppercase tracking-widest">
                          <BookOpen className="h-3 w-3" />
                          <span>{session.skill}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <Link
                        to={`/session/${session.id}`}
                        className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-primary-100"
                      >
                        Enter
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
