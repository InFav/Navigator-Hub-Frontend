import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/LogIn';
import ChatInterface from './components/ChatInterface';
import ContentSchedule from './components/ContentSchedule';
import Dashboard from './components/Dashboard';
import { useEffect } from 'react';
import { AuthContextProvider } from './context/AuthContext';

const initializeDarkMode = () => {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
};

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    initializeDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContextProvider>
      <Router>
        <div className="min-h-screen dark:bg-gray-900">
          <Routes>
            {/* Home route */}
            <Route path="/" element={<Home />} />
            
            {/* Login route - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            
            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            
            {/* Protected chat route */}
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatInterface />
                </RequireAuth>
              }
            />

            <Route 
              path="/schedule"
              element={
                <RequireAuth>
                  <ContentSchedule />
                </RequireAuth>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContextProvider>
  );
}

export const toggleDarkMode = () => {
  const element = document.documentElement;
  element.classList.toggle('dark');
  const isDark = element.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

export default App;