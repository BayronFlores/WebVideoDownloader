import React from 'react';

interface StatusMessageProps {
  estado: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ estado }) => {
  if (!estado) return null;

  const getStatusStyle = () => {
    if (estado.includes('❌'))
      return 'bg-red-50 text-red-700 border border-red-200';
    if (estado.includes('✅'))
      return 'bg-green-50 text-green-700 border border-green-200';
    if (estado.includes('📱'))
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-blue-50 text-blue-700 border border-blue-200';
  };

  return (
    <div
      className={`p-4 rounded-lg mb-6 text-center font-medium transition-all text-sm ${getStatusStyle()}`}
    >
      {estado}
    </div>
  );
};
