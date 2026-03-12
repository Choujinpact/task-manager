import React, { useState } from 'react';
import { MainLayout } from '../widgets/layout/ui/MainLayout';
import { TasksPage } from '../pages/tasks/ui/TasksPage';
import { PomodoroPage } from '../pages/pomodoro/ui/PomodoroPage';
import { TimeBlocksPage } from '../pages/timeblocks/ui/TimeBlocksPage';
import { SettingsPage } from '../pages/settings/ui/SettingsPage';
import '../app/styles/index.css';

export type PageId = 'tasks' | 'pomodoro' | 'timeblocks' | 'settings';

export const App: React.FC = () => {
  const [page, setPage] = useState<PageId>('tasks');

  return (
    <MainLayout currentPage={page} onChangePage={setPage}>
      {page === 'tasks' && <TasksPage />}
      {page === 'pomodoro' && <PomodoroPage />}
      {page === 'timeblocks' && <TimeBlocksPage />}
      {page === 'settings' && <SettingsPage />}
    </MainLayout>
  );
};

