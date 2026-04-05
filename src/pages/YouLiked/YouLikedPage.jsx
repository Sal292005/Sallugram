import { useState, useEffect } from 'react';
import { FaHeart, FaSearch, FaPlay, FaTrash, FaEllipsisH, FaSortAmountDown, FaFilm } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../../firebase/firebase';
import { doc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './YouLikedPage.css';
import Navbar from '../../components/Navbar/Navbar';

const YouLikedPage = () => {
  const [activeItem, setActiveItem] = useState('You Liked');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'title', 'views'
  const [showFilters, setShowFilters] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();

  // Fetch user's liked videos from Firestore
  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const youLiked = userData.youLiked || [];
        
        // Sort by likedAt timestamp (most recent first)
        const sortedLikedVideos = youLiked.sort((a, b) => {
          const timeA = typeof a.likedAt === 'string' ? new Date(a.likedAt) : new Date(a.likedAt);
          const timeB = typeof b.likedAt === 'string' ? new Date(b.likedAt) : new Date(b.likedAt);
          return timeB - timeA;
        });
        
        setLikedVideos(sortedLikedVideos);
      } else {
        setLikedVideos([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching liked videos:', error);
      setLikedVideos([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading, user]);

  // Helper function to get thumbnail URL based on content type
  const getThumbnailUrl = (item) => {
    switch (item.type) {
      case 'short':
        return item.videoUrl || item.thumbnailUrl || 'https://picsum.photos/400/225?random=' + item.videoId;
      case 'post':
        return item.imageUrl || item.thumbnailUrl || 'https://picsum.photos/400/225?random=' + item.videoId;
      case 'video':
      default:
        return item.thumbnailUrl || 'https://picsum.photos/400/225?random=' + item.videoId;
    }
  };
  const getNavigationRoute = (item) => {
    switch (item.type) {
      case 'short':
        return `/short/${item.videoId}`;
      case 'post':
        return `/post/${item.videoId}`;
      case 'video':
      default:
        return `/video/${item.videoId}`;
    }
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
    switch (item) {
      case 'Home': navigate('/home'); break;
      case 'Videos': navigate('/videos'); break;
      case 'Shorts': navigate('/shorts'); break;
      case 'Posts': navigate('/posts'); break;
      case 'Explore': navigate('/explore'); break;
      case 'Settings': navigate('/settings'); break;
      case 'Send Feedback': navigate('/feedback'); break;
      case 'Help': navigate('/help'); break;
      default: break;
    }
  };

  const filteredLikedVideos = likedVideos.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort videos based on selected criteria
  const sortedLikedVideos = [...filteredLikedVideos].sort((a, b) => {
    switch (sortBy) {
      case 'recent': {
        const timeA = typeof a.likedAt === 'string' ? new Date(a.likedAt) : new Date(a.likedAt);
        const timeB = typeof b.likedAt === 'string' ? new Date(b.likedAt) : new Date(b.likedAt);
        return timeB - timeA;
      }
      case 'oldest': {
        const timeAOld = typeof a.likedAt === 'string' ? new Date(a.likedAt) : new Date(a.likedAt);
        const timeBOld = typeof b.likedAt === 'string' ? new Date(b.likedAt) : new Date(b.likedAt);
        return timeAOld - timeBOld;
      }
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'views':
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const itemsToDelete = Array.from(selectedItems);
      
      // Remove selected items from liked videos
      await updateDoc(userDocRef, {
        youLiked: arrayRemove(...itemsToDelete)
      });
      
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error deleting liked videos:', error);
    }
  };

  const handleClearLiked = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        youLiked: []
      });
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error clearing liked videos:', error);
    }
  };

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const formatDuration = (duration) => {
    return duration || '0:00';
  };

  const formatDate = (timestamp) => {
    let date;
    
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 24) {
      return diffInHours < 1 ? 'Today' : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <div className="you-liked-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={handleItemClick} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />

      <div className="main-content" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
        {/* Header Section */}
        <div className="you-liked-header">
          <div className="header-left">
            <div className="header-title">
              <FaHeart className="header-icon" />
              <h1>You Liked</h1>
            </div>
            <p className="header-subtitle">Manage your liked videos and favorite content</p>
          </div>
          <div className="header-right">
            <button className="clear-all-btn" onClick={handleClearLiked}>
              <FaTrash />
              Clear All
            </button>
          </div>
        </div>

        {/* Enhanced Controls Section */}
        <div className="you-liked-controls">
          <div className="controls-left">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search liked videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="controls-right">
            <div className="sort-controls">
              <button 
                className="sort-btn"
                onClick={() => setShowFilters(!showFilters)}
                title="Sort Options"
              >
                <FaSortAmountDown />
                <span>Sort</span>
              </button>
              
              {showFilters && (
                <div className="sort-dropdown">
                  <button 
                    className={`sort-option ${sortBy === 'recent' ? 'active' : ''}`}
                    onClick={() => { setSortBy('recent'); setShowFilters(false); }}
                  >
                    Most Recent
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`}
                    onClick={() => { setSortBy('oldest'); setShowFilters(false); }}
                  >
                    Oldest First
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'title' ? 'active' : ''}`}
                    onClick={() => { setSortBy('title'); setShowFilters(false); }}
                  >
                    Title A-Z
                  </button>
                  <button 
                    className={`sort-option ${sortBy === 'views' ? 'active' : ''}`}
                    onClick={() => { setSortBy('views'); setShowFilters(false); }}
                  >
                    Most Views
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">Loading liked videos...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && likedVideos.length === 0 && (
        <div className="empty-state">
          <FaHeart className="empty-icon" />
          <h3>No liked videos yet</h3>
          <p>Start liking videos to see them here</p>
          <button className="browse-videos-btn" onClick={() => navigate('/home')}>
            Browse Videos
          </button>
        </div>
      )}

      {/* Liked Items */}
      {!loading && likedVideos.length > 0 && (
        <>
          {selectedItems.size > 0 && (
            <div className="selection-indicator" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{selectedItems.size} video{selectedItems.size > 1 ? 's' : ''} selected</span>
              <button className="delete-selected-btn" onClick={handleDeleteSelected}>
                <FaTrash />
                Delete Selected
              </button>
            </div>
          )}
          <div className="you-liked-content">
            {/* Shorts Section */}
            {(() => {
              const shortsItems = sortedLikedVideos.filter(item => 
                item.type === 'short' || item.thumbnailUrl?.includes('shorts')
              );
              if (shortsItems.length === 0) return null;
              
              return (
                <div className="content-type-section">
                  <div className="type-header">
                    <FaFilm className="type-icon short" />
                    <h2 className="type-title">Shorts</h2>
                    <span className="type-count">({shortsItems.length} shorts)</span>
                  </div>
                  <div className="history-items shorts-view">
                    {shortsItems.map(item => (
                      <div 
                        key={item.videoId} 
                        className={`history-item ${selectedItems.has(item) ? 'selected' : ''}`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="item-thumbnail" onClick={(e) => { e.stopPropagation(); navigate(getNavigationRoute(item)); }}>
                          <div className="shorts-preview-video">
                            <img
                              src={getThumbnailUrl(item)}
                              alt={item.title}
                              className="shorts-thumbnail-image"
                            />
                          </div>
                          <div className="thumbnail-overlay">
                            <FaPlay className="play-icon" />
                            <span className="duration">{formatDuration(item.duration)}</span>
                          </div>
                        </div>
                        <div className="item-info">
                          <h3 className="item-title">{item.title}</h3>
                          <div className="item-details">
                            <span className="channel-name">{item.authorName}</span>
                            <span className="item-views">{formatViews(item.views)} views</span>
                            <span className="item-timestamp">{formatDate(item.likedAt)}</span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button className="action-btn" onClick={(e) => {
                            e.stopPropagation();
                            // Handle action
                          }}>
                            <FaEllipsisH />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Videos Section */}
            {(() => {
              const videoItems = sortedLikedVideos.filter(item => 
                (!item.type || item.type === 'video') && 
                (!item.thumbnailUrl?.includes('shorts'))
              );
              if (videoItems.length === 0) return null;
              
              return (
                <div className="content-type-section">
                  <div className="type-header">
                    <FaPlay className="type-icon video" />
                    <h2 className="type-title">Videos</h2>
                    <span className="type-count">({videoItems.length} videos)</span>
                  </div>
                  <div className="history-items">
                    {videoItems.map(item => (
                      <div 
                        key={item.videoId} 
                        className={`history-item ${selectedItems.has(item) ? 'selected' : ''}`}
                        onClick={() => handleSelectItem(item)}
                      >
                        <div className="item-thumbnail" onClick={(e) => { e.stopPropagation(); navigate(getNavigationRoute(item)); }}>
                          <img src={getThumbnailUrl(item)} alt={item.title} />
                          <div className="thumbnail-overlay">
                            <FaPlay className="play-icon" />
                            <span className="duration">{formatDuration(item.duration)}</span>
                          </div>
                          <div className="thumbnail-badge video">
                            <FaPlay className="badge-icon" />
                            <span>Video</span>
                          </div>
                        </div>
                        <div className="item-info">
                          <h3 className="item-title">{item.title}</h3>
                          <div className="item-details">
                            <span className="channel-name">{item.authorName}</span>
                            <span className="item-views">{formatViews(item.views)} views</span>
                            <span className="item-timestamp">{formatDate(item.likedAt)}</span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <button className="action-btn" onClick={(e) => {
                            e.stopPropagation();
                            // Handle action
                          }}>
                            <FaEllipsisH />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default YouLikedPage;
