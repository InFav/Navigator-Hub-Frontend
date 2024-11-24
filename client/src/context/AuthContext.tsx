import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, signOut, AuthProvider as FirebaseAuthProvider } from 'firebase/auth';
import { auth, googleProvider, linkedInProvider } from '../firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithProvider: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkExistingAccount: (email: string) => Promise<boolean>;
}

interface AuthError {
  code?: string;
  message: string;
  email?: string;
  credential?: any;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            await axios.get(`${API_URL}/api/auth/check`);
            setUser(firebaseUser);
            setError(null);
          } catch (error) {
            console.error('Backend verification failed:', error);
            await auth.signOut();
            setUser(null);
            setError('Authentication failed with backend');
          }
        } else {
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getProvider = (providerName: string): FirebaseAuthProvider => {
    switch (providerName) {
      case 'google':
        return googleProvider;
      case 'linkedin':
        return linkedInProvider;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  };

  const signInWithProvider = async (providerName: string) => {
    try {
      setError(null);
      setLoading(true);
      const provider = getProvider(providerName);
      
      const result = await signInWithPopup(auth, provider);
      
      // Create/update user in backend
      await axios.post(`${API_URL}/api/users`, {
        email: result.user.email,
        uid: result.user.uid,
        name: result.user.displayName,
        picture: result.user.photoURL,
        provider: providerName // Track which provider was used
      });
      
    } catch (error: any) {
      const authError = error as AuthError;
      console.error('Sign-in error:', authError);
      
      if (authError.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email. Please sign in with the original provider.');
      } else {
        setError(authError.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAccount = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_URL}/api/users/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking existing account:', error);
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      // Clear backend session if needed
      try {
        await axios.post(`${API_URL}/api/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
          }
        });
      } catch (error) {
        console.error('Error clearing backend session:', error);
      }

      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear local state
      setUser(null);
      setError(null);
      
      // Clear any local storage if you're using it
      localStorage.removeItem('lastProvider');
      
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        signInWithProvider, 
        signOut: handleSignOut,
        checkExistingAccount 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}