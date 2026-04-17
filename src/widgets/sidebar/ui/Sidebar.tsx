import React from 'react'
import type { PageId } from '../../../app/App'
import { NavItem } from './NavItem'

interface SidebarProps {
  currentPage: PageId
  onChangePage: (page: PageId) => void
  userEmail: string
  onLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onChangePage,
  userEmail,
  onLogout,
}) => {
  return (
    <aside className='sidebar'>
      <div className='logo'>RED planner</div>
      <ul className='nav'>
        <NavItem
          icon=''
          label='Задачи'
          pageId='tasks'
          isActive={currentPage === 'tasks'}
          onClick={onChangePage}
        />
        <NavItem
          icon=''
          label='Pomodoro'
          pageId='pomodoro'
          isActive={currentPage === 'pomodoro'}
          onClick={onChangePage}
        />
        <NavItem
          icon=''
          label='Временные блоки'
          pageId='timeblocks'
          isActive={currentPage === 'timeblocks'}
          onClick={onChangePage}
        />
        <NavItem
          icon=''
          label='Настройки'
          pageId='settings'
          isActive={currentPage === 'settings'}
          onClick={onChangePage}
        />
      </ul>
      <div className='user-info'>
        <span>👤</span> {userEmail}
        <button className='logout-btn' onClick={onLogout}>
          Выйти
        </button>
      </div>
    </aside>
  )
}
