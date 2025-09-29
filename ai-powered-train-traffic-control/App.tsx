import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  // Default view is now 'login' as requested for direct access to the portal
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('login');

  const handleLoginSuccess = useCallback(() => {
    setView('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    // For a real app, you'd clear tokens here. For the prototype, we go back to login.
    setView('login');
  }, []);

  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingPage onLaunch={() => setView('login')} />;
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} />;
      default:
        // Fallback to login to ensure secure access
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {renderView()}
    </div>
  );
};

export default App;