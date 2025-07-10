import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [avatar, setAvatar] = useState('assets/avatar_idle.png');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputMinutes, setInputMinutes] = useState(30); // Default to 30 minutes
  const [inputSeconds, setInputSeconds] = useState(0);   // Default to 0 seconds
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false); // New state for dialog
  const audioRef = useRef(null);

  // This effect handles the timer logic
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsRunning(false); // This will trigger the cleanup effect below
          setShowEndSessionDialog(true); // Show custom dialog
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // This effect updates the current time clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

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
    const totalSeconds = (parseInt(inputMinutes) || 0) * 60 + (parseInt(inputSeconds) || 0);
    if (totalSeconds <= 0) {
      alert("Please set a timer duration greater than zero.");
      return;
    }
    setTimeLeft(totalSeconds);
    setIsRunning(true);
  };

  const endSession = () => {
    // This function is now primarily for triggering the dialog
    // The actual avatar change happens in handleProductiveYes/No
  };

  const handleProductiveYes = () => {
    setAvatar('assets/avatar_celebrate.png');
    setShowEndSessionDialog(false);
  };

  const handleProductiveNo = () => {
    setAvatar('assets/avatar_penalty.png');
    setTimeout(() => {
      setAvatar('assets/avatar_idle.png');
    }, 30 * 60 * 1000); // 30-minute penalty
    setShowEndSessionDialog(false);
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0) {
      setInputMinutes(value);
    }
  };

  const handleSecondsChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value >= 0 && value < 60) {
      setInputSeconds(value);
    }
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className={`App ${isRunning ? 'scene' : ''}`}>
      {!isRunning && (
        <div className="timer-setup">
          <input
            type="number"
            value={inputMinutes}
            onChange={handleMinutesChange}
            min="0"
            placeholder="Minutes"
          />
          <span>:</span>
          <input
            type="number"
            value={inputSeconds}
            onChange={handleSecondsChange}
            min="0"
            max="59"
            placeholder="Seconds"
          />
          <button onClick={startSession}>Start Session</button>
        </div>
      )}

      {showEndSessionDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>Did you stay focused?</p>
            <div className="dialog-buttons">
              <button onClick={handleProductiveYes}>Yes</button>
              <button onClick={handleProductiveNo}>No</button>
            </div>
          </div>
        </div>
      )}

      {(isRunning || timeLeft > 0) && <div className="clock">{formatTime(timeLeft)}</div>}
      <div className="current-time-clock">{currentTime.toLocaleTimeString()}</div>
      <img src={avatar} alt="Avatar" className="avatar" title={avatar} />
      <audio ref={audioRef} src="assets/soothing_music.mp3" loop />
    </div>
  );
}

export default App;