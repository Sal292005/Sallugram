import React, { useState, useEffect } from 'react';
import { FaClock, FaPlay, FaTrash, FaEye, FaThumbsUp, FaComment, FaShare, FaBookmark, FaEllipsisH } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import './WatchLaterPage.css';
import Navbar from '../../components/Navbar/Navbar';

const WatchLaterPage = () => {
  const [activeItem, setActiveItem] = useState('Watch Later');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchLaterVideos, setWatchLaterVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Fetch user's watch later videos
  useEffect(() => {
    console.log('WatchLaterPage useEffect - User:', user);
    
    if (!user) {
      console.log('No user found, setting loading to false');
      setLoading(false);
      return;
    }

    const fetchWatchLater = async () => {
      console.log('Fetching watch later videos...');
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        console.log('User document exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const watchLater = (userData.watchLater || []).map((item) => ({
            ...item,
            id: item.id || item.videoId,
            videoId: item.videoId || item.id,
            channelName: item.channelName || item.authorName
          }));
          console.log('Raw watch later data:', watchLater);
          console.log('Number of watch later videos:', watchLater.length);
          setWatchLaterVideos(watchLater);
        } else {
          console.log('No user document found for UID:', user.uid);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching watch later videos:', error);
        setLoading(false);
      }
    };

    fetchWatchLater();
  }, [user]);

  const filteredVideos = watchLaterVideos.filter(video =>
    video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channelName && video.channelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Total watch later videos:', watchLaterVideos.length);
  console.log('Filtered videos:', filteredVideos.length);
  console.log('Search query:', searchQuery);

  const handleRemoveFromWatchLater = async (video) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        watchLater: arrayRemove(video)
      });
      
      // Update local state
      setWatchLaterVideos(prev => prev.filter(v => (v.id || v.videoId) !== (video.id || video.videoId)));
      console.log('Removed from watch later:', video.title);
    } catch (error) {
      console.error('Error removing from watch later:', error);
    }
  };

  const handleVideoClick = (video) => {
    console.log('Clicked video data:', video);
    const targetVideoId = video.id || video.videoId;
    console.log('Video ID:', targetVideoId);
    console.log('Video type:', video.type);
    
    // Navigate to video page based on video type
    if (video.type === 'short') {
      navigate(`/short/${targetVideoId}`);
    } else {
      navigate(`/video/${targetVideoId}`);
    }
  };

  return (
    <div className="watch-later-page" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Header Section */}
      <div className="watch-later-header">
        <div className="header-left">
          <h1><FaClock className="header-icon" /> Watch Later</h1>
        </div>
        <div className="header-right">
          <div className="header-search-bar">
            <div className="search-icon-wrapper">
              <FaPlay className="header-search-icon" />
              <span className="search-tooltip">Search</span>
            </div>
            <input
              type="text"
              placeholder="Search watch later videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">Loading watch later videos...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && watchLaterVideos.length === 0 && (
        <div className="empty-state">
          <FaClock className="empty-icon" />
          <h3>No videos in Watch Later</h3>
          <p>Add videos to watch later and they'll appear here!</p>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && filteredVideos.length > 0 && (
      <div className="watch-later-grid">
        {filteredVideos.map(video => (
          <div key={video.id || video.videoId} className="video-card" onClick={() => handleVideoClick(video)}>
            <div className="video-thumbnail">
              <img src={video.thumbnailUrl || video.thumbnail || 'https://picsum.photos/400/225?random=' + (video.id || video.videoId)} alt={video.title} />
              <div className="video-duration">{video.duration || '00:00'}</div>
              <div className="video-overlay">
                <div className="overlay-title">{video.title}</div>
                <div className="overlay-stats">{video.views || '0 views'}</div>
              </div>
            </div>

            <button 
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevent video click
                handleRemoveFromWatchLater(video);
              }}
              title="Remove from Watch Later"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      )}

      {/* Load More Button */}
      <div className="load-more-section">
        <button className="load-more-btn">Load More </button>
      </div>
    </div>
  );
};

export default WatchLaterPage;
