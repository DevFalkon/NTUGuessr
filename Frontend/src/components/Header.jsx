import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';
import { useAuth } from './AuthContext';
import { EmojiEvents, Logout, LocationOn } from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AddTaskIcon from '@mui/icons-material/AddTask';
import LoginIcon from '@mui/icons-material/Login';

const Header = () => {

  const icon_spacing = 1.5;
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const location = useLocation();

  const isSignupPage = location.pathname === '/signup';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const storedGroup = localStorage.getItem('user_group');

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left: Icon + Logo */}
        <Box
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          <LocationOn/>
          <Typography variant="h6" component="div">
            NTUGuessr
          </Typography>
        </Box>

        {/* Right: Icons */}
        <Box>
          {storedGroup === "admin" ? (
            <>
              <IconButton color='inherit' onClick={ () => navigate('/admin')} sx={{ mr: icon_spacing }}>
                <AddTaskIcon/>
              </IconButton>
              
              <IconButton color='inherit' onClick={ () => navigate('/user_management')} sx={{ mr: icon_spacing }}>
                <AssignmentIndIcon/>
              </IconButton>
            </>
          ):null}

          <IconButton color="inherit" onClick={() => navigate('/leaderboard')}>
            <EmojiEvents />
          </IconButton>

          {isLoggedIn ? (
            <>
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: icon_spacing }}>
                <Logout />
              </IconButton>
            </>
          ):( isSignupPage ? (
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ ml: `calc(${icon_spacing} - 0.5)` }}>
                <LoginIcon sx={{mr:1, transform: 'scaleX(-1)'}}/>
                Login
              </Button>
            ):(
              <Button color="inherit" onClick={() => navigate('/signup')} sx={{ ml: `calc(${icon_spacing} - 0.5)` }}>
                <PersonAddIcon sx={{mr:1, transform: 'scaleX(-1)'}}/>
                Signup
              </Button>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
