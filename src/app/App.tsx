import React, { useEffect, useState } from 'react';
import { MainLayout } from '../widgets/layout/ui/MainLayout';
import { TasksPage } from '../pages/tasks/ui/TasksPage';
import { PomodoroPage } from '../pages/pomodoro/ui/PomodoroPage';
import { TimeBlocksPage } from '../pages/timeblocks/ui/TimeBlocksPage';
import { SettingsPage } from '../pages/settings/ui/SettingsPage';
import '../app/styles/index.css';

export type PageId = 'tasks' | 'pomodoro' | 'timeblocks' | 'settings';

const SETTINGS_STORAGE_KEY = 'red_planner_settings';

export const App: React.FC = () => {
  const [page, setPage] = useState<PageId>('tasks');

  // Глобальные настройки, которые влияют и на Pomodoro, и на страницу настроек
  const [pomodoroLength, setPomodoroLength] = useState<number>(() => {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return 25;
    try {
      const parsed = JSON.parse(raw) as { pomodoroLength?: number };
      return parsed.pomodoroLength ?? 25;
    } catch {
      return 25;
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return true;
      try {
        const parsed = JSON.parse(raw) as { notificationsEnabled?: boolean };
        return parsed.notificationsEnabled ?? true;
      } catch {
        return true;
      }
    },
  );

  useEffect(() => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ pomodoroLength, notificationsEnabled }),
    );
  }, [pomodoroLength, notificationsEnabled]);

  const handleSaveSettings = (options: {
    notificationsEnabled: boolean;
    pomodoroLength: number;
  }) => {
    setNotificationsEnabled(options.notificationsEnabled);
    setPomodoroLength(options.pomodoroLength);
  };

  return (
    <MainLayout currentPage={page} onChangePage={setPage}>
      {page === 'tasks' && <TasksPage />}
      {page === 'pomodoro' && (
        <PomodoroPage
          length={pomodoroLength}
          notificationsEnabled={notificationsEnabled}
        />
      )}
      {page === 'timeblocks' && <TimeBlocksPage />}
      {page === 'settings' && (
        <SettingsPage
          notificationsEnabled={notificationsEnabled}
          pomodoroLength={pomodoroLength}
          onSave={handleSaveSettings}
        />
      )}
    </MainLayout>
  );
};

