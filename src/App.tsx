import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Literacy } from './components/Literacy';
import { Health } from './components/Health';
import { Gallery } from './components/Gallery';
import { Profile } from './components/Profile';
import { Admin } from './components/Admin';

function App() {
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'literacy' && <Literacy />}
      {currentPage === 'health' && <Health />}
      {currentPage === 'gallery' && <Gallery />}
      {currentPage === 'profil' && <Profile />}
      {currentPage === 'admin' && (isAdmin ? <Admin /> : <Dashboard />)}
    </Layout>
  );
}

export default App;
