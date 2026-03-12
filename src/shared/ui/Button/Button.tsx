import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...rest
}) => {
  const base =
    variant === 'primary' ? 'btn-primary' : 'btn-outline';

  return (
    <button className={`${base} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
};

