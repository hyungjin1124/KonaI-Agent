import React from 'react';

export interface DropdownMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  icon,
  label,
  onClick,
  variant = 'default',
}) => {
  const baseClasses =
    'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors focus:outline-none focus:bg-gray-50 cursor-pointer';

  const variantClasses = {
    default: 'text-gray-700 hover:bg-gray-50 hover:text-[#FF3C42]',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700 font-medium',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      role="menuitem"
      tabIndex={0}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

export default DropdownMenuItem;
