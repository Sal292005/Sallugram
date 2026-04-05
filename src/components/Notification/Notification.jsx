import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaUser, FaVideo, FaFilm, FaFileImage } from 'react-icons/fa';
import './Notification.css';

const Notification = ({ notifications, onClearNotification, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post':
        return <FaFileImage className="notification-icon post" />;
      case 'video':
        return <FaVideo className="notification-icon video" />;
      case 'short':
        return <FaFilm className="notification-icon short" />;
      default:
        return <FaUser className="notification-icon default" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const diffInMs = now - time;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onClearNotification(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    unreadNotifications.forEach(notification => {
      onClearNotification(notification.id);
    });
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {notifications.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={() => {
                    onClearAll();
                    setIsOpen(false);
                  }}
                >
                  Clear All
                </button>
              )}
              <button 
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <FaBell />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-text">
                      <p className="notification-message">
                        <strong>{notification.authorName}</strong> uploaded a new {notification.type}
                      </p>
                      <p className="notification-title">{notification.title}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="notification-dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearNotification(notification.id);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
