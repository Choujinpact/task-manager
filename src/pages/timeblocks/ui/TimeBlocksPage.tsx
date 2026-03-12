import React from 'react';

const BLOCKS = [
  { title: 'Работа над курсовой', time: '10:00–12:30' },
  { title: 'Обед', time: '12:30–13:30' },
  { title: 'Встреча с руководителем', time: '14:00–15:00' },
  { title: 'Pomodoro (фронтенд)', time: '15:30–17:00' },
];

export const TimeBlocksPage: React.FC = () => {
  return (
    <div className="page">
      <h2 className="page-title">⏳ Временные блоки</h2>

      <div className="block-list">
        {BLOCKS.map((b) => (
          <div className="time-block" key={b.title}>
            <span>{b.title}</span>
            <span className="block-time">{b.time}</span>
          </div>
        ))}
      </div>

      <button
        className="add-block-btn"
        onClick={() =>
          // eslint-disable-next-line no-alert
          alert('Добавление нового блока (заглушка)')
        }
      >
        ➕ Создать блок (демо)
      </button>
    </div>
  );
};

