import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pendiente' | 'autorizado' | 'rechazado';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    pendiente: {
      label: 'Pendiente',
      classes: 'bg-amber-50 text-amber-800 border-sucua-yellow',
      icon: <Clock className="w-4 h-4 mr-1 text-sucua-yellow" aria-hidden="true" />,
    },
    autorizado: {
      label: 'Autorizado',
      classes: 'bg-emerald-50 text-sucua-green border-sucua-green',
      icon: <CheckCircle2 className="w-4 h-4 mr-1 text-sucua-green" aria-hidden="true" />,
    },
    rechazado: {
      label: 'Rechazado',
      classes: 'bg-red-50 text-red-800 border-red-500',
      icon: <XCircle className="w-4 h-4 mr-1 text-red-500" aria-hidden="true" />,
    },
  };

  const current = configs[status] || configs.pendiente;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.classes}`}
      role="status"
    >
      {current.icon}
      <span>{current.label}</span>
    </span>
  );
};
