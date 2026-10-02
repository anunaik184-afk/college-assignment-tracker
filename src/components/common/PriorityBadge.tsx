import React from 'react';
import { Priority } from '../../types';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'sm' }) => {
  const getStyle = () => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5'
      : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${getStyle()} ${sizeClasses}`}
    >
      {priority}
    </span>
  );
};
