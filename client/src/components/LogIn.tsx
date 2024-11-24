import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaGoogle, FaLinkedin } from 'react-icons/fa';

const Login = () => {
  const { user, signInWithProvider, loading, error } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
  }, [user, navigate]);

  const handleProviderSignIn = async (provider: string) => {
    try {
      setAuthError(null);
      await signInWithProvider(provider);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200">
        <div className="p-4 rounded-full bg-white shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 animate-gradient-xy" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex justify-between items-center h-16 px-8">
          <div className="absolute left-8">
            <a href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                Navigator Hub
              </h1>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-xl">
          <div>
            <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome!
            </h2>
            <p className="mt-4 text-center text-lg text-gray-600">
              Sign in to continue your journey
            </p>
          </div>
          
          <div className="space-y-6 mt-8">
            <button
              onClick={() => handleProviderSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl shadow-md 
                         bg-white text-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaGoogle className="w-6 h-6 text-red-500" />
              <span className="text-lg">Continue with Google</span>
            </button>

            <button
              onClick={() => handleProviderSignIn('linkedin')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-xl shadow-md 
                         bg-white text-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaLinkedin className="w-6 h-6 text-blue-600" />
              <span className="text-lg">Continue with LinkedIn</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">

              </div>
            </div>
          </div>

          {(error || authError) && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
              {error || authError}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors text-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;