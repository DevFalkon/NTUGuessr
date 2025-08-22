import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import { Co2Sharp, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../components/GameHandler';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LandingPage = () => {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const navigate = useNavigate();

  const handleStartClick = () => {
    setShowDifficulty(true);
  };

  const { new_game } = useGame();
  const session_id = localStorage.getItem('session_id');
  const [hasInitialized, setInitialized] = useState(false);


  useEffect(() => {
    const checkGameState = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/game_state`,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id }),
        });

        if (!response.ok) {
          setInitialized(false);
          return;
        }

        const data = await response.json();

        if (data.isActive) {
          setInitialized(true);
        } else {
          setInitialized(false);
        }

        // console.log('is active: ', data.isActive);
      } 
      
      catch (err) {
        console.error(err);
        setInitialized(false);
      }
    };

    checkGameState();
  }, []);

  const sendDifficulty = async (difficulty) => {
    try {
      const resp = await fetch(`${BACKEND_URL}/set_difficulty`,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id, difficulty }),
        });

      if (!resp.ok) {
        console.log("Could not set difficulty on backend!");
        return;
      }

      const data = await response.json();

      if (data.state){
        console.log("Difficulty on backend!");
      }
    }

    catch(err){
      console.log(err);
    }
  };


  const handleSelectDifficulty = async (difficulty) => {
    if (!hasInitialized){
      await new_game();
    }
    sendDifficulty(difficulty);
    localStorage.setItem('difficulty', difficulty);
    navigate(`/startgame/${difficulty}`);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 128px)" // adjust for header/footer
      px={2}
    >
      <Card sx={{ maxWidth: 600, width: '100%', p: 3 }}>
        <CardContent>
          <Typography
            variant="h4"
            color="primary"
            gutterBottom
            sx={{ textAlign: 'center' }}
          >
            Welcome to NTUGuessr!
          </Typography>

          {!showDifficulty ? (
            <Typography
              variant="body1"
              color="text.secondary"
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Explore the NTU campus by guessing locations from real photos taken by students.
              Compete with your friends and climb the leaderboard!
            </Typography>
          ) : (
            <Box component="p" sx={{ textAlign: 'center', color: 'text.secondary', mb: 0 }}>
              Choose the difficulty
            </Box>
          )}

          <Stack spacing={2} mt={4}>
            {!showDifficulty ? (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleStartClick}
                >
                  Start Game
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<EmojiEvents />}
                  color="secondary"
                  onClick={() => navigate('/leaderboard')}
                >
                  View Leaderboard
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ flex: 1 }}
                  onClick={() => handleSelectDifficulty('easy')}
                >
                  Easy
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ flex: 1 }}
                  onClick={() => handleSelectDifficulty('hard')}
                >
                  Hard
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LandingPage;
