import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/LogIn';
import ChatInterface from './components/ChatInterface';
import { AuthContextProvider } from './context/AuthContext';


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
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />
        
        {/* Login route - redirect to chat if already logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/chat" replace /> : <Login />}
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

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthContextProvider>
  );
}

export default App;