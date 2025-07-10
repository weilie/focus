
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [avatar, setAvatar] = useState('assets/avatar_idle.png');
  const audioRef = useRef(null);

  // This effect handles the timer logic
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsRunning(false); // This will trigger the cleanup effect below
          endSession();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // This effect handles the side-effects of starting/stopping the session
  useEffect(() => {
    if (isRunning) {
      // Enter fullscreen and play audio when the session starts
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.log(`Error attempting to play audio: ${err.message} (${err.name})`);
        });
      }
    } else {
      // Exit fullscreen and pause audio when the session stops
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isRunning]);

  const startSession = () => {
    // Just set the state, the useEffect will handle the rest
    setIsRunning(true);
  };

  const endSession = () => {
    const productive = window.confirm("Did you stay focused?");
    if (productive) {
      setAvatar('assets/avatar_celebrate.png');
    } else {
      setAvatar('assets/avatar_penalty.png');
      setTimeout(() => {
        setAvatar('assets/avatar_idle.png');
      }, 30 * 60 * 1000); // 30-minute penalty
    }
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  if (!isRunning) {
    return (
      <div className="App">
        <button onClick={startSession}>Start 30-Minute Session</button>
      </div>
    );
  }

  return (
    <div className="scene">
      <div className="clock">{formatTime(timeLeft)}</div>
      <img src={avatar} alt="Avatar" className="avatar" />
      <audio ref={audioRef} src="assets/soothing_music.mp3" loop />
    </div>
  );
}

export default App;
