// src/components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const history = useHistory(); // Use useHistory instead of useNavigate

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        history.push('/login'); // Redirect to login if no session
      }
      setLoading(false);
    };

    checkAuth();

    // Listen to auth state changes across tabs
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [history]); // Add history to the dependency array

  if (loading) return null; // Or a loading spinner

  return children;
};

export default AuthGuard;
