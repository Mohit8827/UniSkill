import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Session from './pages/Session';
import Navbar from './components/Navbar';

// Simple Error Boundary for debugging
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("APP CRASH:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 text-center">
          <h1 className="text-3xl font-bold text-red-600">Something went wrong.</h1>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-w-2xl mx-auto">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 bg-primary-600 text-white px-6 py-2 rounded-xl">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, requireVerified = true }: { children: React.ReactNode, requireVerified?: boolean }) => {
  const auth = useAuth();
  console.log("ProtectedRoute - User:", auth?.user?.email, "Loading:", auth?.loading);

  if (auth?.loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary-600 uppercase tracking-[0.3em] animate-pulse text-sm">Initializing UniSkill...</p>
    </div>
  );
  
  if (!auth?.user) return <Navigate to="/login" />;
  if (requireVerified && !auth?.user?.isVerified) return <Navigate to="/verify" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  console.log("App Component Rendering");
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow flex flex-col">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<ProtectedRoute requireVerified={false}><Verify /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/session/:id" element={<ProtectedRoute><Session /></ProtectedRoute>} />
                
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
