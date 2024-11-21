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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Navigator Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue to your journey
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleProviderSignIn('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleProviderSignIn('linkedin')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <FaLinkedin className="w-5 h-5 text-blue-600" />
            <span>Continue with LinkedIn</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        {(error || authError) && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error || authError}
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;