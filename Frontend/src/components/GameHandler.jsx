import { createContext, useContext, useState, useEffect } from 'react';
import {  } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const GameHandler = createContext();

export const GameProvider = ({ children }) => {
  const session_id = localStorage.getItem('session_id');

  const [imgUrl, setImgUrl] = useState('placeholder.jpg');
  const [remTime, setRemTime] = useState(-1);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  useEffect(() => {
    let interval = null;

    if (remTime > 0) {
      interval = setInterval(() => {
        setRemTime((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [remTime]);

  const fetchRemainingTime = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get_remaining_time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id })
      });
      const data = await response.json();
      if (data.remTime !== undefined) {
        setRemTime(data.remTime);
      }
    } catch (err) {
      console.error('Failed to sync remaining time:', err);
    }
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRemainingTime();
      }
    };

    const handleFocus = () => {
      fetchRemainingTime();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const next_img = async () => {
    try{
      const response = await fetch(`${BACKEND_URL}/next_image`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({ session_id })
      });
      
      if (!response.ok) throw new Error('Failed to start new game');
      const data = await response.json();
      
      console.log(data);
      if (data.url){
        setImgUrl(data.url);
      }
      setRemTime(data.remTime);
    }

    catch (err) {
      console.error(err);
    }

  };

  const get_score = async (lat, lng) => {

  };

  const new_game = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/new_game`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({ session_id })
      });

      if (!response.ok) throw new Error('Failed to start new game');
      const data = await response.json();
      
      if (data.done){
        console.log("New game created");

        localStorage.setItem('hasInitialized', 'true');

        await next_img();
      } else{
        console.log("Could not start new game!");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <GameHandler.Provider value={{
      imgUrl,
      remTime,
      new_game,
      next_img,
    }}>
      {children}
    </GameHandler.Provider>
  );
};

export const useGame = () => useContext(GameHandler);
