import React from 'react';
import type { PageId } from '../../../app/App';
import { Sidebar } from '../../sidebar/ui/Sidebar';

interface MainLayoutProps {
  currentPage: PageId;
  onChangePage: (page: PageId) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onChangePage,
  children,
}) => {
  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onChangePage={onChangePage} />
      <main className="main">{children}</main>
    </div>
  );
};

