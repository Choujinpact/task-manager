import React from 'react';
import type { PageId } from '../../../app/App';
import { Sidebar } from '../../sidebar/ui/Sidebar';

interface MainLayoutProps {
  currentPage: PageId;
  onChangePage: (page: PageId) => void;
  userEmail: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onChangePage,
  userEmail,
  onLogout,
  children,
}) => {
  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        onChangePage={onChangePage}
        userEmail={userEmail}
        onLogout={onLogout}
      />
      <main className="main">{children}</main>
    </div>
  );
};

