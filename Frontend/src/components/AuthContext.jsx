import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize isLoggedIn on first load
  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    setIsLoggedIn(!!sessionId);
  }, []);

  // Optional: update isLoggedIn across tabs
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('session_id'));
    };
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data.session_id, data.login);

      if (response.ok){
        if (data.login === false){
          console.log("Unable to log in");
          throw new Error(data.login || 'Incorrect username or password');
        }
        else if (data.session_id){
          localStorage.setItem('session_id', data.session_id);
          setIsLoggedIn(true);
          navigate('/');
        }
        else{
          throw new Error(data.login || 'Login failed');
        }
      }
    } 
    catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Unable to connect to server');
      } else {
        throw err;
      }
    }
  };

  // Logout function
  const logout = async () => {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return;

    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    localStorage.removeItem('session_id');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Optional: expose session ID if needed
  const getSessionId = () => localStorage.getItem('session_id');

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, getSessionId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
