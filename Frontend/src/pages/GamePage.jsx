import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { darken } from '@mui/system';
import CampusMap from '../components/CampusMap';
import { useEffect, useState } from 'react';
import { useGame } from '../components/GameHandler';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const GamePage = () => {
  const navigate = useNavigate();

  const { imgUrl, remTime, next_img, new_game } = useGame();
  const session_id = localStorage.getItem('session_id');

  const { difficulty } = useParams(); // 'easy' or 'hard'
  const [actual, setActual] = useState(null);
  const [next_img_btn, showNextImg] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [score, setScore] = useState(0);
  const [imgScore, setImgScore] = useState(0);
  const [dist, setDist] = useState(0);


  const [rank, setRank] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [guessPosition, setGuessPosition] = useState(null);


  const handleGuess = async (lat, lng) => {

    try {
      const response = await fetch(`${BACKEND_URL}/guess`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({ session_id, lat, lng })
      });

      if (!response.ok) throw new Error('Failed to handle guess input');
      const data = await response.json();
      
      if (data){
        //console.log("actual: ", data.lat, data.lng, data.score);
        setActual({ lat: data.lat, lng: data.lng });

        setDist(data.dist);

        setImgScore(data.score - score);
        setScore(data.score);

      } else{
        console.log("Incorrect data sent");
      }

    } catch (err) {
      console.error(err);
    }
    showNextImg(true);
    // setGuess({ lat, lng });
  };

  const fetchFinalResults = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/final_score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id })
      });

      if (!response.ok) throw new Error("Failed to fetch score");
      const data = await response.json();
      setScore(data.score);
      setRank(data.rank);
      setHighScore(data.h_score);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (remTime === 0) {
      setGameOver(true);
      fetchFinalResults();
    }
  }, [remTime]);

  const handle_next = () =>{
    setActual(null);
    showNextImg(false);
    setGuessPosition(null);
    next_img();
  };

  useEffect(() => {
    next_img(session_id);
  }, []);

  const handleNewGame = () => {
    new_game();
    setGameOver(false);
    handle_next();
  }

  const minutes = Math.floor(remTime / 60);
  const seconds = remTime % 60;

  const formattedTime =
    minutes < 1
      ? `${seconds}s`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const formattedDist = dist < 1
    ? `${Math.round(dist * 1000)} m`
    : `${dist.toFixed(2)} km`;

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      {/* Timer Display */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          bgcolor: (theme) => darken(theme.palette.primary.main, 0.25),  // matches yellow theme
          color: 'common.white',       // white text
          px: 3,
          py: 1,
          borderRadius: 2,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: 3,
          backdropFilter: 'blur(4px)',
        }}
      >
        Time Left: {formattedTime} | Total Score: {score}
      </Box>
      
      {/* Image floating card */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          width: 380,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 6,
          p: 2,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Where is this?
        </Typography>
        <Paper elevation={3}>
          <img
            src={imgUrl}
            alt="Guess location"
            style={{ width: '100%', display: 'block', borderRadius:'10px'}}
          />
        </Paper>
        {next_img_btn ? (
          <>
            <Box display="flex" marginTop='10px' justifyContent="center" gap={3}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                📍 Distance: {formattedDist}
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                ⭐ Score: {imgScore}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              sx={{ flex: 1, marginTop: 1}}
              onClick={() => handle_next()}
            >
              Next Image
            </Button>
          </>
          
        ):null}
      </Box>

      {/* Map */}
      <CampusMap 
        onGuess={handleGuess} 
        actual={actual} 
        difficulty={difficulty} 
        position={guessPosition}
        setPosition={setGuessPosition}/
      >

      {gameOver && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            px: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Game Over! ⏰
          </Typography>
          <Paper
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              p: 2,
              mb: 2,
              borderRadius: 2,
              width: '80%',
              maxWidth: 360,
            }}
          >
            <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'bold' }}>
              Final Score
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">💯 Total Score</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {score}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">🏆 High Score</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {highScore}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="subtitle1">🏅 Your Rank</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                #{rank}
              </Typography>
            </Box>

          </Paper>

          <Box
            sx={{
              width: '80%',
              maxWidth: 360,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Button variant="outlined" color="primary" sx={{ flex: 1 }} onClick={() => handleNewGame()}>
              Restart
            </Button>
            <Button variant="outlined" color="secondary" sx={{ flex: 1 }} onClick={() => navigate("/leaderboard")}>
              Leaderboard
            </Button>
            <Button variant="outlined" color="primary" sx={{ flex: 1 }} onClick={() => navigate("/")}>
              Home
            </Button>
          </Box>
        </Box>
      )}

    </Box>
  );
};

export default GamePage;
