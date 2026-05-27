import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, Info, CreditCard, History } from 'lucide-react';
import '../index.css';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(125.50);
  const [amount, setAmount] = useState<number>(0);

  const handleTopUp = () => {
    setBalance(prev => prev + amount);
    setAmount(0);
  };

  const handleRedeem = () => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setAmount(0);
    } else {
      alert('Insufficient balance');
    }
  };

  return (
    <div className="wallet-container" style={{ maxWidth: '800px', margin: '3rem auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <WalletIcon size={28} color="var(--primary)" /> My Digital Wallet
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm"><History size={16} /> History</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="balance-card" style={{ background: 'linear-gradient(135deg, var(--primary), #818cf8)', color: 'white', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Balance</p>
            <h3 className="amount" style={{ color: 'white', margin: '0.5rem 0 1.5rem', fontSize: '3rem' }}>${balance.toFixed(2)}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '100px', width: 'fit-content' }}>
              <CreditCard size={16} /> **** **** **** 4242
            </div>
          </div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
            <WalletIcon size={150} />
          </div>
        </div>

        <div className="transaction-section" style={{ background: 'var(--white)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--shadow)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ marginTop: 0, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Amount to transfer</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--text-muted)' }}>$</span>
              <input 
                type="number" 
                value={amount || ''} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                placeholder="0.00"
                style={{ width: '100%', padding: '1rem 1rem 1rem 2rem', borderRadius: '12px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '1.125rem', fontWeight: 600 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleTopUp} style={{ flex: 1 }}>
              <ArrowUpCircle size={18} /> Top Up
            </button>
            <button className="btn btn-secondary" onClick={handleRedeem} style={{ flex: 1 }}>
              <ArrowDownCircle size={18} /> Redeem
            </button>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Info size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
              Platform fees of 10% apply to all bank redemptions. Transfers between students are always free.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .balance-card {
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Wallet;
