import React from 'react';
import PropTypes from 'prop-types';

const NotificationContainer = ({ notifications, removeNotification }) => {
  const getNotificationStyle = (type) => {
    const baseStyle = "fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm border-l-4 transition-all duration-300 transform";
    
    switch (type) {
      case 'success':
        return `${baseStyle} bg-green-50 border-green-400 text-green-700`;
      case 'error':
        return `${baseStyle} bg-red-50 border-red-400 text-red-700`;
      case 'warning':
        return `${baseStyle} bg-yellow-50 border-yellow-400 text-yellow-700`;
      case 'info':
      default:
        return `${baseStyle} bg-blue-50 border-blue-400 text-blue-700`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={getNotificationStyle(notification.type)}
          style={{ 
            top: `${1 + index * 5}rem`,
            transform: `translateY(${index * 80}px)`
          }}
        >
          <div className="flex items-start">
            <span className="mr-2 text-lg">{getIcon(notification.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

NotificationContainer.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired
    })
  ).isRequired,
  removeNotification: PropTypes.func.isRequired
};

export default NotificationContainer;
