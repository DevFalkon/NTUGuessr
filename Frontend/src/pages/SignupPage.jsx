import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import groupConfig from '../config/groupConfig.json';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [clan, setClan] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleClanChange = (e, newClan) => {
    if (newClan !== null) setClan(newClan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !clan || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok || data.exists) {
        setError('Username already taken.');
        return;
      }

      // Proceed with signup (or send to backend)
      const signupRes = await fetch(`${BACKEND_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          clan,
          password,
        }),
      });

      if (!signupRes.ok) {
        setError('Signup failed. Please try again.');
        return;
      }

      setSuccess('Account created successfully!');

      navigate("/login");

    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212', // full dark background
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 3,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          gutterBottom     
          color="primary" 
          sx={{ fontWeight: 'bold', letterSpacing: 1 }}
        >
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Select Your Group
          </Typography>

          <ToggleButtonGroup
            value={clan}
            exclusive
            onChange={handleClanChange}
            fullWidth
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            {groupConfig.groups.map((option) => (
              <ToggleButton
                key={option.name}
                value={option.name}
                sx={{
                  flex: 1,
                  minWidth: '10px',
                  borderRadius: 2,
                  color: '#fff',
                  backgroundColor:
                    clan === option.name ? option.color : '#2c2c2c',
                  border: '1px solid #444',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: option.color,
                    opacity: 0.9,
                  },
                  '&.Mui-selected': {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  },
                }}
              >
                {option.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            fullWidth
            type="password"
            label="Password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color='secondary'
            sx={{ mt: 3, py: 1.2 }}
          >
            Create Account
          </Button>
        </form>
      </Box>
    </Box>
  );
}
