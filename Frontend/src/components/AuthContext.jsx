import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGroup, setUserGroup] = useState("");

  // Initialize isLoggedIn on first load
  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    setIsLoggedIn(!!sessionId);

    const storedGroup = localStorage.getItem('user_group');
    if (storedGroup) {
      setUserGroup(storedGroup);
    }
  }, []);

  // Optional: update isLoggedIn across tabs
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('session_id'));
    };
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    console.log(userGroup);
    if (userGroup === "admin" && 
      (window.location.pathname !== "/admin" && 
        window.location.pathname !== "/leaderboard" &&
        window.location.pathname !== "/user_management")) {
      navigate("/admin", { replace: true });
    }

    if (userGroup !== "admin" &&
      (window.location.pathname === "/admin" ||
      window.location.pathname === "/user_management")
    ){
      navigate("/", {replace: true});
    }

  }, [isLoggedIn, userGroup, navigate]);

  const getUserGroup = async (username) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/user_group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await resp.json();

      if (resp.ok) {
        if (data.group) {
          setUserGroup(data.group);
          localStorage.setItem('user_group', data.group);
        }
      }
    } catch (err) {
      if (err.name === 'TypeError') {
        throw new Error('Unable to connect to server');
      } else {
        throw err;
      }
    }
  };


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
          // Get user group if login in successfull
          const group = await getUserGroup(username);
          setIsLoggedIn(true);
          
          if (group === "admin"){
            navigate("/admin");
          }
          else{
            navigate('/');
          }
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
    localStorage.removeItem('user_group');
    setIsLoggedIn(false);
    navigate('/login');
  };

  // Optional: expose session ID if needed
  const getSessionId = () => localStorage.getItem('session_id');

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, getSessionId, userGroup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
