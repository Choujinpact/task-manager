import React, { useState } from 'react';

type TimeBlock = {
  id: number;
  title: string;
  start: string; // HH:MM
  end: string; // HH:MM
};

const INITIAL_BLOCKS: TimeBlock[] = [
  { id: 1, title: 'Работа над курсовой', start: '10:00', end: '12:30' },
  { id: 2, title: 'Обед', start: '12:30', end: '13:30' },
  { id: 3, title: 'Встреча с руководителем', start: '14:00', end: '15:00' },
  { id: 4, title: 'Pomodoro (фронтенд)', start: '15:30', end: '17:00' },
];

export const TimeBlocksPage: React.FC = () => {
  const [blocks, setBlocks] = useState<TimeBlock[]>(INITIAL_BLOCKS);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleAddBlock = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !start || !end) {
      // eslint-disable-next-line no-alert
      alert('Заполните название и время начала/конца');
      return;
    }

    if (start >= end) {
      // eslint-disable-next-line no-alert
      alert('Время начала должно быть меньше времени окончания');
      return;
    }

    const newBlock: TimeBlock = {
      id: Date.now(),
      title: trimmedTitle,
      start,
      end,
    };

    setBlocks((prev) => [...prev, newBlock]);
    setTitle('');
    setStart('');
    setEnd('');
  };

  return (
    <div className="page">
      <h2 className="page-title">⏳ Временные блоки</h2>

      <div className="block-list">
        {blocks.map((b) => (
          <div className="time-block" key={b.id}>
            <span>{b.title}</span>
            <span className="block-time">
              {b.start}–{b.end}
            </span>
          </div>
        ))}
      </div>

      <div className="add-task" style={{ marginTop: 24 }}>
        <input
          type="text"
          className="task-input"
          placeholder="Название блока"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="add-task">
        <input
          type="time"
          className="task-input"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          type="time"
          className="task-input"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button className="btn-primary" onClick={handleAddBlock}>
          ➕ Добавить блок
        </button>
      </div>
    </div>
  );
};

