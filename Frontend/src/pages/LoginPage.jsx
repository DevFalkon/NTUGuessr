import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [Unameerror, setUnameError] = useState('');
  const [Passerror, setPassError] = useState('');

  const navigate = useNavigate();
  const {isLoggedIn, login, userGroup} = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      if (userGroup === "admin"){
        navigate('/admin');
      }
      else{
        navigate('/');
      }
    }
  }, [isLoggedIn, navigate, userGroup]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setUnameError('Please enter a valid username');
      return;
    }

    if (!password.trim()){
        setPassError('Please enter a valid password.');
        return;
    }
    
    try {
      await login(username, password);
    } catch (err) {
      setPassError(err.message);
      setUnameError(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height='100%'
      px={2}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 3 }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom textAlign="center">
            Welcome to NTUGuessr
          </Typography>

          <Typography variant="body1" textAlign="center" mb={2}>
            Login to begin your adventure
          </Typography>

          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!Unameerror}
                helperText={Unameerror}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!Passerror}
                helperText={Passerror}
                />
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                size="large"
              >
                Login
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
