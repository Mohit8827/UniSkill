import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownLeft, Plus, Landmark, ShieldCheck, History, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Wallet: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawCredits, setWithdrawCredits] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/wallet/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const creditsToAdd = parseFloat(depositAmount) / 10;
      await axios.post('/wallet/deposit', { amount: creditsToAdd });
      setDepositAmount('');
      fetchTransactions();
      await refreshUser();
    } catch (err) {
      alert('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(withdrawCredits) > (user?.credits || 0)) {
      alert('Insufficient credits');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/wallet/withdraw', { 
        amount: parseFloat(withdrawCredits),
        bankAccount 
      });
      setWithdrawCredits('');
      setBankAccount('');
      fetchTransactions();
      await refreshUser();
    } catch (err) {
      alert('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-10">
      {/* Dynamic Wallet Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl md:rounded-[3rem] p-6 md:p-12 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary-600/20 blur-[80px] md:blur-[100px] -mr-32 md:-mr-48 -mt-32 md:-mt-48 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 bg-white/5 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/10 mx-auto lg:mx-0">
              <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-primary-400" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-primary-100">Verified Student Wallet</span>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-1 md:mb-2">Total Balance</p>
              <div className="flex items-baseline justify-center lg:justify-start space-x-2 md:space-x-4">
                <span className="text-5xl md:text-7xl font-black tracking-tighter">{user?.credits?.toFixed(2)}</span>
                <span className="text-xl md:text-2xl font-black text-primary-500 uppercase">Credits</span>
              </div>
              <p className="mt-3 md:mt-4 text-gray-500 font-bold text-xs md:text-sm flex items-center justify-center lg:justify-start">
                <Info className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Current Rate: 10 INR = 1 Credit
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/10 w-full max-w-sm space-y-4 md:space-y-6">
            <div className="flex justify-between items-center">
              <p className="font-black text-base md:text-lg">Quick Stats</p>
              <History className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
                <span className="text-gray-400 font-bold text-xs md:text-sm">Earnings</span>
                <span className="text-green-400 font-black text-lg md:text-xl">+{transactions.filter((t: any) => t.type === 'EARNING' || t.type === 'DEPOSIT').reduce((acc, curr: any) => acc + curr.amount, 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
                <span className="text-gray-400 font-bold text-xs md:text-sm">Spent</span>
                <span className="text-primary-400 font-black text-lg md:text-xl">-{Math.abs(transactions.filter((t: any) => t.type === 'PAYMENT' || t.type === 'WITHDRAW').reduce((acc, curr: any) => acc + curr.amount, 0)).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Deposit/Withdraw Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Add Credits */}
          <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 space-y-6 md:space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                <Plus className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Add Credits</h2>
                <p className="text-gray-400 text-xs md:text-sm font-bold">Top-up via UPI / Card</p>
              </div>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Amount in INR</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl md:text-2xl text-gray-300">₹</span>
                  <input
                    type="number"
                    placeholder="500"
                    className="w-full pl-10 md:pl-12 pr-4 py-4 md:py-5 rounded-xl md:rounded-2xl bg-gray-50 border-transparent outline-none text-xl md:text-2xl font-black transition-all focus:bg-white focus:ring-4 focus:ring-primary-50/50"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 font-bold mt-1 ml-1">Received: {(parseFloat(depositAmount) / 10 || 0).toFixed(1)} Credits</p>
              </div>
              <button disabled={loading} className="w-full bg-primary-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95 disabled:opacity-50">
                {loading ? 'Processing...' : 'Deposit Now'}
              </button>
            </form>
          </div>

          {/* Withdraw Credits */}
          <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 space-y-6 md:space-y-8">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 p-2.5 md:p-3 rounded-xl md:rounded-2xl">
                <Landmark className="h-6 w-6 md:h-8 md:w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Redeem</h2>
                <p className="text-gray-400 text-xs md:text-sm font-bold">Transfer to Bank</p>
              </div>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Credits</label>
                <input
                  type="number"
                  placeholder="Min 10"
                  className="w-full px-5 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl bg-gray-50 border-transparent outline-none text-xl md:text-2xl font-black transition-all focus:bg-white focus:ring-4 focus:ring-primary-50/50"
                  value={withdrawCredits}
                  onChange={(e) => setWithdrawCredits(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest ml-1">UPI ID / Acc No.</label>
                <input
                  type="text"
                  placeholder="name@upi"
                  className="w-full px-5 md:px-6 py-4 md:py-5 rounded-xl md:rounded-2xl bg-gray-50 border-transparent outline-none font-bold transition-all focus:bg-white focus:ring-4 focus:ring-primary-50/50"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  required
                />
              </div>
              <button disabled={loading || parseFloat(withdrawCredits) < 10} className="w-full bg-gray-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? 'Processing...' : 'Withdraw Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">History</h2>
            <button className="text-primary-600 font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-gray-50 max-h-[400px] md:max-h-[600px]">
            {transactions.length > 0 ? transactions.map((tx: any) => (
              <div key={tx.id} className="p-5 md:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3 md:space-x-5">
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${tx.type === 'EARNING' || tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'EARNING' || tx.type === 'DEPOSIT' ? (
                      <ArrowDownLeft className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-sm md:text-base text-gray-900">{tx.type}</p>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base md:text-xl font-black ${tx.type === 'EARNING' || tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'EARNING' || tx.type === 'DEPOSIT' ? '+' : '-'}{Math.abs(tx.amount).toFixed(1)}
                  </p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            )) : (
              <div className="p-12 md:p-20 text-center space-y-4">
                <div className="bg-gray-100 h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <History className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <p className="text-gray-400 font-bold text-sm">No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
