import { useState, useEffect } from 'react';

function DigitalClock() {
    const [date, setDate] = useState(new Date().getDate());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Months are 0-based in JavaScript
    const [hours, setHours] = useState(new Date().getHours());
    const [minutes, setMinutes] = useState(new Date().getMinutes());
    const [ampm, setAmPm] = useState(new Date().getHours() < 12 ? 'AM' : 'PM');
    
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setDate(now.getDate());
            setMonth(now.getMonth() + 1);
            setHours(now.getHours());
            setMinutes(now.getMinutes());

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
          const now = new Date();
          // ...
          setHours(now.getHours() % 12 || 12); // Convert to 12-hour format
          setAmPm(now.getHours() < 12 ? 'AM' : 'PM');
        }, 1000);
        return () => clearInterval(interval);
      }, []);

    return (
        <div className="digital-clock">
            {month}/{date} {hours}:{minutes} {ampm}
        </div>
    );
}

export default DigitalClock;