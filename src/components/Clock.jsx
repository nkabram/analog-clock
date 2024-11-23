import { useEffect, useState, useRef } from "react";
import DigitalClock from "./DigitalClock";
import Scratchpad from "./Scratchpad";
import "./clock.css";

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
  const timerEndTimeRef = useRef(null);
  const [timerSetTime, setTimerSetTime] = useState(null);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const audioRef = useRef(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioSourceRef = useRef(null);
  const alarmTimeoutRef = useRef(null);

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
    const setupAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        const response = await fetch('/assets/alarm.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        audioRef.current = {
          context: audioContext,
          buffer: audioBuffer,
          gainNode: audioContext.createGain()
        };
        
        audioRef.current.gainNode.connect(audioContext.destination);
      } catch (error) {
        console.error('Audio initialization error:', error);
      }
    };

    setupAudio();
    
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!timerActive || timerPaused || !timerEndTimeRef.current) return;

    const workerCode = `
      let intervalId = null;
      
      self.onmessage = function(e) {
        if (e.data.type === 'start') {
          if (intervalId) clearInterval(intervalId);
          const endTime = e.data.endTime;
          
          intervalId = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            
            self.postMessage({ 
              type: 'tick',
              remaining: remaining
            });
            
            if (now >= endTime) {
              self.postMessage({ type: 'complete' });
              clearInterval(intervalId);
            }
          }, 100);
        } else if (e.data.type === 'stop') {
          if (intervalId) clearInterval(intervalId);
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.postMessage({
      type: 'start',
      endTime: timerEndTimeRef.current
    });

    worker.onmessage = (e) => {
      if (e.data.type === 'complete') {
        handleTimerComplete();
      } else if (e.data.type === 'tick') {
        const remaining = e.data.remaining;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      }
    };

    return () => {
      worker.postMessage({ type: 'stop' });
      worker.terminate();
    };
  }, [timerActive, timerPaused]);

  const handleTimerComplete = async () => {
    if (isAlarmPlaying) return;
    
    setIsAlarmPlaying(true);
    setTimerActive(false);
    timerEndTimeRef.current = null;
    setTimerMinutes(0);
    setTimerSeconds(0);
    
    await playAlarmSound();

    if (Notification.permission === "granted") {
      new Notification("Timer Complete!", {
        body: "Your timer has finished!",
        requireInteraction: true
      });
    }
  };

  const playAlarmSound = async () => {
    try {
      if (!audioRef.current || isAlarmPlaying) return;

      const { context, buffer, gainNode } = audioRef.current;
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.loop = true;
      source.start(0);
      
      audioSourceRef.current = source;

      if (window.confirm('Timer Complete! Click OK to stop the alarm.')) {
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
      const totalMilliseconds = (timerMinutes * 60 + timerSeconds) * 1000;
      timerEndTimeRef.current = Date.now() + totalMilliseconds;
      setTimerActive(true);
      setTimerPaused(false);

      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
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
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      } catch (e) {
        console.error('Error stopping audio:', e);
      }
    }

    if (audioRef.current?.context) {
      audioRef.current.context.suspend();
    }

    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }

    setTimerActive(false);
    setTimerPaused(false);
    setTimerMinutes(0);
    setTimerSeconds(0);
    setTimerHashAngle(0);
    setIsEditingTimer(false);
    setIsAlarmPlaying(false);
    timerEndTimeRef.current = null;
  };

  const handleModalClose = () => {
    setShowTimerModal(false);
    resetTimer();
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
        {isAlarmPlaying ? (
          <button 
            className="timer-button stop"
            onClick={resetTimer}
          >
            Stop Alarm
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="timer-display" onClick={(e) => e.stopPropagation()}>
        {isEditingTimer ? (
          <form onSubmit={handleTimerSubmit} className="timer-edit-form">
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

      {showTimerModal && (
        <div className="timer-modal-overlay">
          <div className="timer-modal">
            <h2>Timer Complete!</h2>
            <button onClick={handleModalClose}>Stop Timer</button>
          </div>
        </div>
      )}

      <Scratchpad />
    </div>
  );
}

export default Clock;
