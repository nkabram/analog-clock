import { useState, useEffect } from 'react';

function DigitalClock() {
    const [date, setDate] = useState(new Date().getDate());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Months are 0-based in JavaScript
    const [year, setYear] = useState(new Date().getFullYear());
    const [hours, setHours] = useState(new Date().getHours());
    const [minutes, setMinutes] = useState(new Date().getMinutes());
    const [seconds, setSeconds] = useState(new Date().getSeconds());

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setDate(now.getDate());
            setMonth(now.getMonth() + 1);
            setYear(now.getFullYear());
            setHours(now.getHours());
            setMinutes(now.getMinutes());
            setSeconds(now.getSeconds());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="digital-clock">
            {month}/{date} - {hours}:{minutes}:{seconds}
        </div>
    );
}

export default DigitalClock;