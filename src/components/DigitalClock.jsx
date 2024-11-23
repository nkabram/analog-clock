import { useState, useEffect } from "react";

function DigitalClock({ militaryTime }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    if (!militaryTime) {
      hours = hours % 12;
      hours = hours ? hours : 12;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${!militaryTime ? ' ' + ampm : ''}`;
  };

  return <div className="digital-clock">{formatTime()}</div>;
}

export default DigitalClock;
