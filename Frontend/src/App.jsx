import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';

import { useState } from 'react';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import {GameProvider} from './components/GameHandler'

function App() {
  const [page, setPage] = useState('home');

  const handleLogout = () => console.log('Logged out!');
  const handleLeaderboard = () => setPage('leaderboard');
  const handleAccount = () => console.log('Account clicked!');

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Header />

      <Box component="main" flex={1} minHeight={0}>
        <Routes>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage/>}/>
          <Route path='/admin' 
            element={
              <ProtectedRoute>
                <AdminPage/>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <GameProvider>
                  <LandingPage />
                </GameProvider>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/startgame/:difficulty" 
            element={
              <ProtectedRoute>
                <GameProvider>
                  <GamePage />
                </GameProvider>
              </ProtectedRoute>
            }   
          />

          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </Box>

      <Footer />
    </Box>
  );
}

export default App;
