import React, { useEffect, useState } from 'react';
import { formatTime } from '../../../shared/lib/formatTime';

interface PomodoroPageProps {
  length: number;
  notificationsEnabled: boolean;
}

export const PomodoroPage: React.FC<PomodoroPageProps> = ({
  length,
  notificationsEnabled,
}) => {
  const [minutes, setMinutes] = useState<number>(length);
  const [seconds, setSeconds] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);

  // Сброс при изменении длины, если таймер не идёт
  useEffect(() => {
    if (!running) {
      setMinutes(length);
      setSeconds(0);
    }
  }, [length, running]);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds === 0) {
          // секунды на нуле — проверяем минуты
          setMinutes((prevMinutes) => {
            if (prevMinutes === 0) {
              // таймер завершён
              window.clearInterval(id);
              setRunning(false);
              if (notificationsEnabled) {
                // eslint-disable-next-line no-alert
                alert('🍅 Раунд завершён!');
              }
              return 0;
            }
            return prevMinutes - 1;
          });
          return 59;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, notificationsEnabled]);

  const handleStart = () => {
    if (!running) {
      setRunning(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setMinutes(length);
    setSeconds(0);
  };

  return (
    <div className="page pomodoro-box">
      <h2 className="page-title" style={{ alignSelf: 'start' }}>
        🍅 Pomodoro
      </h2>
      <div className="timer">{formatTime(minutes, seconds)}</div>
      <div className="timer-controls">
        <button
          className="timer-btn"
          onClick={handleStart}
          disabled={running}
        >
          Старт
        </button>
        <button className="timer-btn" onClick={handleReset}>
          Сброс
        </button>
      </div>
      <div className="round-info">
        Раунд #1 · длительность {length} мин
      </div>
    </div>
  );
};

