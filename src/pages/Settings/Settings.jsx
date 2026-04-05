import React, { useState } from 'react';
import { FaCog, FaUser, FaBell, FaLock, FaPalette, FaGlobe, FaDownload, FaHistory, FaQuestionCircle, FaInfoCircle, FaChevronRight, FaMoon, FaSun, FaPlay, FaClosedCaptioning, FaEnvelope, FaShieldAlt, FaYoutube, FaComment } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  
  const [activeSection, setActiveSection] = useState('general');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [language, setLanguage] = useState('english');
  const [videoQuality, setVideoQuality] = useState('auto');

  const settingsSections = [
    { id: 'general', name: 'General', icon: FaCog },
    { id: 'account', name: 'Account', icon: FaUser },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy', icon: FaLock },
    { id: 'appearance', name: 'Appearance', icon: FaPalette },
    { id: 'language', name: 'Language', icon: FaGlobe },
    { id: 'data', name: 'Data & Storage', icon: FaDownload },
    { id: 'history', name: 'History', icon: FaHistory },
  ];

  const generalSettings = [
    {
      title: 'Dark Mode',
      description: 'Toggle dark theme on or off',
      type: 'toggle',
      value: darkMode,
      onChange: setDarkMode,
      icon: darkMode ? FaSun : FaMoon
    },
    {
      title: 'Notifications',
      description: 'Receive updates via email',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaEnvelope
    },
    {
      title: 'Subscription Updates',
      description: 'Get notified about new content',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaYoutube
    },
    {
      title: 'Comment Replies',
      description: 'Notify when someone replies to your comments',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaComment
    }
  ];

  const accountSettings = [
    {
      title: 'Email',
      description: 'user@sallugram.com',
      type: 'link',
      icon: FaEnvelope
    },
    {
      title: 'Password',
      description: 'Change password',
      type: 'link',
      icon: FaLock
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Add extra security',
      type: 'link',
      icon: FaShieldAlt
    }
  ];

  const notificationSettings = [
    {
      title: 'Push Notifications',
      description: 'Get notified on mobile',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaBell
    },
    {
      title: 'Email Notifications',
      description: 'Receive updates via email',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaEnvelope
    },
    {
      title: 'Subscription Updates',
      description: 'Get notified about new content',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaYoutube
    },
    {
      title: 'Comment Replies',
      description: 'Notify when someone replies to your comments',
      type: 'toggle',
      value: true,
      onChange: () => {},
      icon: FaComment
    }
  ];

  const getSettingsContent = () => {
    switch (activeSection) {
      case 'general':
        return generalSettings;
      case 'account':
        return accountSettings;
      case 'notifications':
        return notificationSettings;
      default:
        return generalSettings;
    }
  };

  const renderSettingItem = (setting, index) => {
    const Icon = setting.icon;
    
    return (
      <div key={index} className={`setting-item ${darkMode ? '' : 'light-mode'}`}>
        <div className="setting-left">
          <div className="setting-icon">
            <Icon />
          </div>
          <div className="setting-info">
            <h3 className={darkMode ? '' : 'light-mode'}>{setting.title}</h3>
            <p className={darkMode ? '' : 'light-mode'}>{setting.description}</p>
          </div>
        </div>
        <div className="setting-right">
          {setting.type === 'toggle' && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={setting.value}
                onChange={() => setting.onChange(!setting.value)}
              />
              <span className="toggle-slider"></span>
            </label>
          )}
          {setting.type === 'select' && (
            <select value={setting.value} onChange={(e) => setting.onChange(e.target.value)} className="setting-select">
              {setting.options.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          )}
          {setting.type === 'link' && (
            <FaChevronRight className="setting-arrow" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={darkMode ? '' : 'light-mode'}>
      <header className={`settings-header ${darkMode ? '' : 'light-mode'}`}>
        <div className="header-content">
          <FaCog className="settings-icon" />
          <h1 className={darkMode ? '' : 'light-mode'}>Settings</h1>
        </div>
      </header>

      <div className="settings-content">
        <aside className={`settings-sidebar ${darkMode ? '' : 'light-mode'}`}>
          <nav className="settings-nav">
            {settingsSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={`settings-main ${darkMode ? '' : 'light-mode'}`}>
          <div className={`settings-section ${darkMode ? '' : 'light-mode'}`}>
            <h2 className={darkMode ? '' : 'light-mode'}>{settingsSections.find(s => s.id === activeSection)?.name}</h2>
            <div className="settings-list">
              {getSettingsContent().map((setting, index) => renderSettingItem(setting, index))}
            </div>
          </div>

          <div className="settings-footer">
            <div className="footer-links">
              <a href="/help" className="footer-link">
                <FaQuestionCircle />
                <span>Help & Support</span>
              </a>
              <a href="/about" className="footer-link">
                <FaInfoCircle />
                <span>About</span>
              </a>
            </div>
            <div className="app-info">
              <p>Sallugram Version 1.0.0</p>
              <p>&copy; 2026 Sallugram</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
