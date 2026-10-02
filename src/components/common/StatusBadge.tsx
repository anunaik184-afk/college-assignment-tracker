import React from 'react';
import { SubmissionStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

interface Props {
  status: SubmissionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStyle = () => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/20',
          dot: 'bg-amber-500',
          label: 'Pending',
          Icon: Clock,
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'Completed',
          Icon: CheckCircle2,
        };
      case 'OVERDUE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500/20',
          dot: 'bg-rose-500',
          label: 'Overdue',
          Icon: AlertCircle,
        };
      case 'LATE':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-300 ring-purple-500/20',
          dot: 'bg-purple-500',
          label: 'Late Submission',
          Icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-500/20',
          dot: 'bg-slate-500',
          label: status,
          Icon: Clock,
        };
    }
  };

  const style = getStyle();
  const Icon = style.Icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${style.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{style.label}</span>
    </span>
  );
};
