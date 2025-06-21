import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-lg text-white">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'plans':
        return <SubscriptionPlans />;
      case 'customers':
        return <div>Gestion des clients (à implémenter)</div>;
      case 'subscriptions':
        return <div>Gestion des abonnements (à implémenter)</div>;
      case 'payments':
        return <div>Gestion des paiements (à implémenter)</div>;
      case 'notifications':
        return <div>Gestion des notifications (à implémenter)</div>;
      case 'support':
        return <div>Support client (à implémenter)</div>;
      case 'subscription':
        return <div>Mon abonnement (à implémenter)</div>;
      case 'profile':
        return <div>Mon profil (à implémenter)</div>;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onViewChange={setCurrentView}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;