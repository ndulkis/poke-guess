import React, { useState, useEffect } from 'react';

export default function Timer({ duration, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  // Color changes to red when under 10 seconds
  const textColor = timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-400';

  return (
    <div className={`text-4xl font-mono font-bold ${textColor}`}>
      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
    </div>
  );
}