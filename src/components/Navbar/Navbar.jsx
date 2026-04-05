import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaHome, FaFileAlt, FaYoutube, FaVideo, FaComment, FaUser, FaCog, FaQuestion, FaPaperPlane, FaHistory, FaThumbsUp, FaClock, FaFolder, FaDownload, FaRocket, FaChevronRight, FaSearch, FaPlus, FaBell, FaBars, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import { Image } from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { signOutUser } from '../../firebase/authService';
import Notification from '../Notification/Notification';
import notificationService from '../../services/notificationService';
import './Navbar.css';
const Navbar = ({ activeItem = 'Home', onItemChange, isSidebarCollapsed: externalIsCollapsed, setIsSidebarCollapsed: externalSetCollapsed }) => {
  const [internalIsSidebarCollapsed, setInternalIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchInputRef = React.useRef(null);

  // Keep navbar input in sync with URL ?search= query
  React.useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // Initialize notification service when user is authenticated
  useEffect(() => {
    if (user) {
      notificationService.init((newNotifications) => {
        setNotifications(newNotifications);
      });
      
      return () => {
        notificationService.cleanup();
      };
    }
  }, [user]);

  // Use external state if provided, otherwise use internal state
  const isSidebarCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsSidebarCollapsed;
  const setIsSidebarCollapsed = externalSetCollapsed || setInternalIsSidebarCollapsed;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = () => {
    // Focus the input field
    searchInputRef.current?.focus();
    console.log('Search clicked, query:', searchQuery);
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      const encoded = encodeURIComponent(searchQuery.trim());

      // Route search to the current section/page
      const pathname = location.pathname || '/home';
      let basePath = '/home';

      if (pathname.startsWith('/videos')) basePath = '/videos';
      else if (pathname.startsWith('/shorts')) basePath = '/shorts';
      else if (pathname.startsWith('/posts')) basePath = '/posts';
      else if (pathname.startsWith('/home')) basePath = '/home';

      console.log('Navigating to:', `${basePath}?search=${encoded}`);
      navigate(`${basePath}?search=${encoded}`);
    } else {
      console.log('Empty search query, not navigating');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsSearchExpanded(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleCreateMenu = () => {
    setIsCreateMenuOpen(!isCreateMenuOpen);
    setIsProfileMenuOpen(false); // Close profile menu when opening create menu
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsProfileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Notification handlers
  const handleClearNotification = (notificationId) => {
    notificationService.clearNotification(notificationId);
  };

  const handleClearAllNotifications = () => {
    notificationService.clearAll();
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
      if (isCreateMenuOpen && !event.target.closest('.create-menu-container')) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isCreateMenuOpen]);

  const handleItemClick = (item) => {
    if (onItemChange) {
      onItemChange(item);
    }
    if (item === 'Home') {
      navigate('/home');
    } else if (item === 'Posts') {
      navigate('/posts');
    } else if (item === 'Shorts') {
      navigate('/shorts');
    } else if (item === 'Videos') {
      navigate('/videos');
    } else if (item === 'Watch Later') {
      navigate('/watch-later');
    } else if (item === 'About') {
      navigate('/about');
    } else if (item === 'Chats') {
      navigate('/chats');
    } else if (item === 'Subscriptions') {
      navigate('/subscriptions');
    } else if (item === 'History') {
      navigate('/history');
    } else if (item === 'Playlists') {
      navigate('/playlists');
    } else if (item === 'Downloads') {
      navigate('/downloads');
    } else if (item === 'You Liked') {
      navigate('/you-liked');
    } else if (item === 'Send Feedback') {
      navigate('/feedback');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <button className="nav-menu-icon" onClick={toggleSidebar}>
            <FaBars/>
          </button>
            <Image src='/Minisallu.png' alt='Logo' width={'90'} height={'20'}/>
          </div>
        </div>
        
        <div className="header-center">
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => {
                console.log('Input changed:', e.target.value);
                setSearchQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              aria-label="Search"
            >
              <FaSearch />
            </button>
        </div>
        
        <div className="header-right">
          <div className="create-menu-container">
            <button className={`icon-button create-btn1 ${isCreateMenuOpen ? 'active' : ''}`} onClick={toggleCreateMenu}>
              <FaPlus />
            </button>
            {isCreateMenuOpen && (
              <div className="create-dropdown">
                <button className="create-menu-item" onClick={() => { setIsCreateMenuOpen(false); navigate('/create-post'); }}>
                  <FaFileAlt />
                  <span>Create Post</span>
                </button>
                <button className="create-menu-item" onClick={() => { setIsCreateMenuOpen(false); navigate('/upload-short'); }}>
                  <FaVideo />
                  <span>Upload Short</span>
                </button>
                <button className="create-menu-item" onClick={() => { setIsCreateMenuOpen(false); navigate('/upload-video'); }}>
                  <FaYoutube />
                  <span>Upload Video</span>
                </button>
              </div>
            )}
          </div>
          <Notification 
            notifications={notifications}
            onClearNotification={handleClearNotification}
            onClearAll={handleClearAllNotifications}
          />
          <div className="profile-menu-container">
            <button className="user-avatar" onClick={toggleProfileMenu}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="user-avatar-img" />
              ) : (
                user?.displayName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </button>
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="profile-avatar-img" width={10} height={10}/>
                    ) : (
                      user?.displayName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{user?.displayName || 'User'}</div>
                    <div className="profile-email">{user?.email || 'user@sallugram.com'}</div>
                  </div>
                </div>
                <div className="profile-divider"></div>
                <button className="profile-menu-item settings" onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }}>
                  <FaCog />
                  <span>Settings</span>
                </button>
                <button className="profile-menu-item history" onClick={() => { setIsProfileMenuOpen(false); navigate('/history'); }}>
                  <FaHistory />
                  <span>History</span>
                </button>
                <button className="profile-menu-item watch-later" onClick={() => { setIsProfileMenuOpen(false); navigate('/watch-later'); }}>
                  <FaClock />
                  <span>Watch Later</span>
                </button>
                <button className="profile-menu-item downloads" onClick={() => { setIsProfileMenuOpen(false); navigate('/downloads'); }}>
                  <FaDownload />
                  <span>Downloads</span>
                </button>
                <div className="profile-divider"></div>
                <button className="profile-menu-item sign-out" onClick={handleSignOut}>
                  <FaSignOutAlt />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-section">
          <div 
            className={`sidebar-item ${activeItem === 'Home' ? 'active' : ''}`}
            onClick={() => handleItemClick('Home')}
          >
            <FaHome />
            <span>Home</span>
          </div>
          <div 
            className={`sidebar-item ${activeItem === 'Posts' ? 'active' : ''}`}
            onClick={() => handleItemClick('Posts')}
          >
            <FaFileAlt />
            <span>Posts</span>
          </div>
          <div 
            className={`sidebar-item ${activeItem === 'Shorts' ? 'active' : ''}`}
            onClick={() => handleItemClick('Shorts')}
          >
            <img src="/shorts-white.png" alt="shorts-icon" className="shorts-icon"/>
            <span>Shorts</span>
          </div>
          <div 
            className={`sidebar-item ${activeItem === 'Videos' ? 'active' : ''}`}
            onClick={() => handleItemClick('Videos')}
          >
            <FaVideo />
            <span>Videos</span>
          </div>
          <div 
            className={`sidebar-item ${activeItem === 'Chats' ? 'active' : ''}`}
            onClick={() => handleItemClick('Chats')}
          >
            <FaComment />
            <span>Chats</span>
          </div>
          {!isSidebarCollapsed && (
            <div 
              className={`sidebar-item ${activeItem === 'Subscriptions' ? 'active' : ''}`}
              onClick={() => handleItemClick('Subscriptions')}
            >
              <FaUser />
              <span>Subscriptions</span>
            </div>
          )}
          {!isSidebarCollapsed && (
            <div className="sidebar-divider" />
          )}

          {/* Your Space Section */}
          <div className="sidebar-section">
            <div className="sidebar-heading">
              {!isSidebarCollapsed?null:<FaUser/>}
			  <span>Your Space</span>
              {isSidebarCollapsed?null:<FaChevronRight/>}


            </div>
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'History' ? 'active' : ''}`}
                onClick={() => handleItemClick('History')}
              >
                <FaHistory />
                <span>History</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'You Liked' ? 'active' : ''}`}
                onClick={() => handleItemClick('You Liked')}
              >
                <FaThumbsUp />
                <span>You Liked</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Watch Later' ? 'active' : ''}`}
                onClick={() => handleItemClick('Watch Later')}
              >
                <FaClock />
                <span>Watch Later</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Playlists' ? 'active' : ''}`}
                onClick={() => handleItemClick('Playlists')}
              >
                <FaFolder />
                <span>Playlists</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'My Creations' ? 'active' : ''}`}
                onClick={() => handleItemClick('My Creations')}
              >
                <FaRocket />
                <span>My Creations</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Downloads' ? 'active' : ''}`}
                onClick={() => handleItemClick('Downloads')}
              >
                <FaDownload />
                <span>Downloads</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div className="sidebar-divider" />
            )}
          </div>

          {/* Settings and Help */}
          <div className="sidebar-section">
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Settings' ? 'active' : ''}`}
                onClick={() => navigate('/settings')}
              >
                <FaCog />
                <span>Settings</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Help' ? 'active' : ''}`}
                onClick={() => navigate('/help')}
              >
                <FaQuestion />
                <span>Help</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'Send Feedback' ? 'active' : ''}`}
                onClick={() => handleItemClick('Send Feedback')}
              >
                <FaPaperPlane />
                <span>Send Feedback</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <div 
                className={`sidebar-item ${activeItem === 'About' ? 'active' : ''}`}
                onClick={() => handleItemClick('About')}
              >
                <FaInfoCircle />
                <span>About</span>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <div className="sidebar-divider" />
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
