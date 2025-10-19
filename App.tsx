import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import FamilyTreeApp from './components/FamilyTreeApp';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Netlify Identity integration
  useEffect(() => {
    const identity = window.netlifyIdentity;
    if (identity) {
      identity.on('init', (user: any) => {
        setUser(user);
        setIsLoading(false);
      });
      identity.on('login', (user: any) => {
        setUser(user);
        identity.close();
      });
      identity.on('logout', () => {
        setUser(null);
      });
      identity.init();
    } else {
      setIsLoading(false); // If identity is not available
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (user) {
    return <FamilyTreeApp user={user} />;
  } else {
    return <LandingPage />;
  }
}

export default App;
