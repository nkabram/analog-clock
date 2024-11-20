import { useEffect, useState, useRef } from "react";
import DigitalClock from "./DigitalClock";
import Scratchpad from "./Scratchpad";
import "./clock.css";
import alarmSound from '../assets/alarm.mp3';

function Clock() {
  const [date, setDate] = useState(new Date());
  const [showSecondHand, setShowSecondHand] = useState(true);
  const [transition, setTransition] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerHashAngle, setTimerHashAngle] = useState(0);
  const clockRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const [timerSetTime, setTimerSetTime] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef(null);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);

  const toggleSecondHand = () => {
    setShowSecondHand(!showSecondHand);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDate(now);
      if (now.getSeconds() === 0) {
        setTransition(false);
      } else {
        setTransition(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      audioRef.current = new Audio('/assets/alarm.mp3');
      
      audioRef.current.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio loading error:', e.target.error);
      });

      audioRef.current.load();
    } catch (error) {
      console.error('Audio initialization error:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        setTimerSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            setTimerMinutes(prevMinutes => {
              if (prevMinutes === 0) {
                clearInterval(interval);
                playAlarmSound();
                setTimerActive(false);
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused]);

  const playAlarmSound = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/alarm.mp3');
      }

      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      
      if (window.confirm('Timer Complete!')) {
        resetTimer();
      }
    } catch (error) {
      console.error('Error playing alarm:', error);
      if (window.confirm('Timer Complete! (Sound not available)')) {
        resetTimer();
      }
    }
  };

  const startTimer = () => {
    if (timerMinutes > 0 || timerSeconds > 0) {
      setTimerActive(true);
      setTimerPaused(false);
    }
  };

  const handleTimerSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerMinutes > 0 || timerSeconds > 0) {
      setIsEditingTimer(false);
      startTimer();
    }
  };

  const startPauseTimer = () => {
    if (timerActive) {
      setTimerPaused(!timerPaused);
    } else {
      startTimer();
    }
  };

  const stopTimer = () => {
    resetTimer();
  };

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const secondsAngle = (seconds / 60) * 360;
  const minutesAngle = (minutes / 60) * 360 + secondsAngle / 60;
  const hoursAngle = (hours / 12) * 360 + minutesAngle / 12;

  const handleClockClick = (event) => {
    if (clockRef.current) {
      const rect = clockRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = event.clientX - rect.left - centerX;
      const y = event.clientY - rect.top - centerY;
      const angle = Math.atan2(y, x);
      let clickedMinutes = Math.round(((angle + Math.PI / 2) % (Math.PI * 2)) / (Math.PI * 2) * 60);
      if (clickedMinutes === 0) clickedMinutes = 60;

      const currentMinutes = date.getMinutes();
      let timerDuration = clickedMinutes - currentMinutes;
      if (timerDuration <= 0) timerDuration += 60;
      
      setTimerMinutes(timerDuration);
      setTimerSeconds(0);
      setTimerActive(false);
      setTimerPaused(false);
      setTimerHashAngle(clickedMinutes * 6);
    }
  };

  const handleTimerClick = (e) => {
    e.stopPropagation();
    setIsEditingTimer(true);
    if (!timerSeconds) setTimerSeconds(0);
  };

  const handleTimerChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    if (type === 'minutes') {
      setTimerMinutes(Math.min(59, Math.max(0, numValue)));
    } else {
      setTimerSeconds(Math.min(59, Math.max(0, numValue)));
    }
  };

  const resetTimer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTimerActive(false);
    setTimerPaused(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerHashAngle(0);
    setIsEditingTimer(false);
  };

  return (
    <div className="clock-container">
      <div className="controls">
        <label className="second-hand-toggle">
          Second Hand
          <input
            type="checkbox"
            checked={showSecondHand}
            onChange={toggleSecondHand}
          />
        </label>
      </div>
      
      <DigitalClock />
      
      <div 
        className="clock" 
        ref={clockRef}
        onClick={handleClockClick}
      >
        <div
          className="hand minute-hand"
          style={{
            transform: `rotate(${minutesAngle}deg)`,
            transition: transition ? "all 0.1s" : "none",
          }}
        />
        <div
          className="hand hour-hand"
          style={{
            transform: `rotate(${hoursAngle}deg)`,
            transition: transition ? "all 0.1s" : "none",
          }}
        />
        {showSecondHand && (
          <div
            className="hand second-hand"
            style={{
              transform: `rotate(${secondsAngle}deg)`,
              transition: transition ? "all 0.05s" : "none",
            }}
          />
        )}
        {(timerMinutes > 0 || timerSeconds > 0) && (
          <div
            className="timer-marker"
            style={{
              transform: `rotate(${timerHashAngle}deg)`,
            }}
          />
        )}
        <div className="center-dot"></div>
      </div>

      <div className="timer-controls">
        <button 
          className={`timer-button ${timerActive ? (timerPaused ? 'paused' : 'active') : ''}`}
          onClick={startPauseTimer}
        >
          {timerActive
            ? (timerPaused ? "Resume" : "Pause")
            : "Start Timer"
          }
        </button>
        {(timerActive || timerPaused || timerMinutes > 0 || timerSeconds > 0) && (
          <button 
            className="timer-button stop"
            onClick={stopTimer}
          >
            Stop Timer
          </button>
        )}
      </div>

      {(timerMinutes > 0 || timerSeconds > 0 || isEditingTimer) && (
        <div 
          className="timer-display"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditingTimer ? (
            <form 
              onSubmit={handleTimerSubmit} 
              className="timer-edit-form"
            >
              <input
                type="number"
                min="0"
                max="59"
                value={timerMinutes}
                onChange={(e) => handleTimerChange('minutes', e.target.value)}
                className="timer-input"
                onClick={(e) => e.stopPropagation()}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={timerSeconds.toString().padStart(2, '0')}
                onChange={(e) => handleTimerChange('seconds', e.target.value)}
                className="timer-input"
                onClick={(e) => e.stopPropagation()}
              />
              <button type="submit" style={{ display: 'none' }} />
            </form>
          ) : (
            <span onClick={handleTimerClick}>
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </span>
          )}
        </div>
      )}

      <Scratchpad />
    </div>
  );
}

export default Clock;
