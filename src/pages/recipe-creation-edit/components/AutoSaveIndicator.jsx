import React from 'react';
import Icon from '../../../components/AppIcon';

const AutoSaveIndicator = ({ status, lastSaved }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: 'Loader2',
          text: 'Saving...',
          color: 'var(--color-text-secondary)',
          className: 'animate-spin'
        };
      case 'saved':
        return {
          icon: 'Check',
          text: 'Saved',
          color: 'var(--color-success)',
          className: ''
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          text: 'Save failed',
          color: 'var(--color-error)',
          className: ''
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  if (!statusConfig) return null;

  const formatLastSaved = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const saved = new Date(timestamp);
    const diffInSeconds = Math.floor((now - saved) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Icon
        name={statusConfig.icon}
        size={16}
        color={statusConfig.color}
        className={statusConfig.className}
      />
      <span style={{ color: statusConfig.color }}>
        {statusConfig.text}
      </span>
      {status === 'saved' && lastSaved && (
        <span className="text-text-secondary">
          • {formatLastSaved(lastSaved)}
        </span>
      )}
    </div>
  );
};

export default AutoSaveIndicator;