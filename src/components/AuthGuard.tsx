// src/components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        history.replace('/login'); // Redirect to login if no session
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
  }, [history]);

  if (loading) return null; // or a loading spinner

  return children;
};

export default AuthGuard;
