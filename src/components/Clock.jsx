import { useEffect, useState } from 'react';
import DigitalClock from './DigitalClock';
import './Clock.css';

function Clock() {
  const [date, setDate] = useState(new Date());
  const [showSecondHand, setShowSecondHand] = useState(true);

  const toggleSecondHand = () => {
    setShowSecondHand(!showSecondHand);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const secondsAngle = (seconds / 60) * 360;
  const minutesAngle = (minutes / 60) * 360 + (secondsAngle / 60);
  const hoursAngle = (hours / 12) * 360 + (minutesAngle / 12);

  return (
    <div>
      <div className='second-hand-toggle'>
        <label>
          Second Hand
          <input type="checkbox" checked={showSecondHand} onChange={toggleSecondHand} />
        </label>
      </div>
      <DigitalClock />
      <div className="clock">
        <div className="hand hour-hand" style={{ transform: `rotate(${hoursAngle}deg)` }}></div>
        <div className="hand minute-hand" style={{ transform: `rotate(${minutesAngle}deg)` }}></div>
        {showSecondHand && <div className="hand second-hand" style={{ transform: `rotate(${secondsAngle}deg)` }}></div>}
        <div className="center-dot"></div>
      </div>
    </div>
  );
}

export default Clock;
