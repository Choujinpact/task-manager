import React, { useState } from 'react';

interface SettingsPageProps {
  notificationsEnabled: boolean;
  pomodoroLength: number;
  onSave: (options: {
    notificationsEnabled: boolean;
    pomodoroLength: number;
  }) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  notificationsEnabled,
  pomodoroLength,
  onSave,
}) => {
  const [notify, setNotify] = useState<boolean>(notificationsEnabled);
  const [length, setLength] = useState<number>(pomodoroLength);

  const handleSave = () => {
    const value = Number(length);
    if (!Number.isFinite(value) || value <= 0 || value > 60) {
      // eslint-disable-next-line no-alert
      alert('Длина помидора должна быть от 1 до 60 минут');
      return;
    }
    onSave({ notificationsEnabled: notify, pomodoroLength: value });
    // eslint-disable-next-line no-alert
    alert('Настройки сохранены');
  };

  return (
    <div className="page">
      <h2 className="page-title">⚙️ Настройки</h2>

      <div className="settings-group">
        <div className="setting-row">
          <input
            type="checkbox"
            id="notifyCheck"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          <label htmlFor="notifyCheck">Уведомления о раундах</label>
        </div>

        <div className="setting-row">
          <label htmlFor="pomodoroLength">Длина помидора (мин):</label>
          <input
            type="number"
            id="pomodoroLength"
            min={1}
            max={60}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </div>

        <button className="save-settings" onClick={handleSave}>
          Сохранить настройки
        </button>
      </div>
    </div>
  );
};

