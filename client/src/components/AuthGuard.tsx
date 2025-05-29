import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { fetchUserProfile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Only fetch profile if we don't have user data
          if (!user) {
            await fetchUserProfile();
          }
          // If we're on the login/register page and user is authenticated, redirect to dashboard
          if (location.pathname === '/login' || location.pathname === '/register') {
            navigate('/dashboard');
          }
        } catch {
          // If token is invalid, redirect to login
          navigate('/login');
        }
      } else {
        // If no token and not on login/register page, redirect to login
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [fetchUserProfile, navigate, location.pathname, user]);

  // Show children while checking authentication
  return <>{children}</>;
} 