import React from 'react';
import type { PageId } from '../../../app/App';

interface NavItemProps {
  icon: string;
  label: string;
  pageId: PageId;
  isActive: boolean;
  onClick: (page: PageId) => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  pageId,
  isActive,
  onClick,
}) => {
  const className = `nav-item${isActive ? ' active' : ''}`;

  return (
    <li className={className} onClick={() => onClick(pageId)}>
      <i>{icon}</i> {label}
    </li>
  );
};

