import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { firestore } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './VideosPage.css';
import Navbar from '../../components/Navbar/Navbar';

const VideosPage = () => {
  const [activeItem, setActiveItem] = useState('Videos');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectionBarRef = React.useRef(null);
  const selectionItemRefs = React.useRef([]);

  const handleItemClick = (item) => {
    setActiveItem(item);
    switch (item) {
      case 'Home': navigate('/home'); break;
      case 'Shorts': navigate('/shorts'); break;
      case 'Posts': navigate('/posts'); break;
      case 'Explore': navigate('/explore'); break;
      case 'Settings': navigate('/settings'); break;
      case 'Send Feedback': navigate('/feedback'); break;
      case 'Help': navigate('/help'); break;
      default: break;
    }
  };

  const categories = [
    'All', 'Trending', 'Comedy', 'Education', 'Entertainment', 'Fashion',
    'Finance', 'Food', 'Gaming', 'Lifestyle', 'Live', 'Motivation', 'Movies',
    'Music', 'News', 'Pets & Animals', 'Sports', 'Reactions', 'Podcasts',
    'Technology', 'Travel', 'Vlogs', 'Watched', 'New to you'
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    console.log('Selected category:', category);
  };

  // Handle URL search parameters
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
      setIsSearching(true);
    } else {
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [searchParams]);

  // Filter videos based on search query
  const filteredVideos = videos.filter(video =>
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch videos from Firestore
  useEffect(() => {
    if (authLoading) return;
    
    setLoading(true);
    const q = query(
      collection(firestore, 'videos'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('Videos snapshot received:', snapshot);
      console.log('Snapshot size:', snapshot.size);
      
      const videosData = await Promise.all(snapshot.docs.map(async documentSnapshot => {
        const videoData = {
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
          createdAt: documentSnapshot.data().createdAt?.toDate() || new Date()
        };
        
        console.log('Processing video:', videoData);
        
        return videoData;
      }));
      
      setVideos(videosData);
      setLoading(false);
      console.log('Final videos data:', videosData);
      console.log('Videos array length:', videosData.length);
    }, (error) => {
      console.error('Error fetching videos:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [authLoading]);

  // Format view count
  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const diffInMs = now - timestamp;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  // Get first row videos (8 videos)
  const videosFirstRow = filteredVideos.slice(0, 8);

  return (
    <div className="youtube-container">
      <Navbar
        activeItem={activeItem}
        onItemChange={setActiveItem}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <div className="video-main-content" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">Loading videos...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVideos.length === 0 && (
          <div className="empty-state">
            <h3>No videos found</h3>
            <p>Be the first to create a video!</p>
            <button className="create-first-video-btn" onClick={() => navigate('/upload-video')}>
              Create First Video
            </button>
          </div>
        )}
        
        {/* Videos Grid */}
        {!loading && filteredVideos.length > 0 && (
          <div className="videos-grid">
            {videosFirstRow.map((video) => (
              <div key={video.id} className="video-home-video-card" onClick={() => navigate(`/video/${video.id}`)}>

                {/* Thumbnail with hover overlay */}
                <div className="home-thumbnail">
                  <img src={video.thumbnailUrl || 'https://picsum.photos/400/225?random=' + video.id} alt={video.title} />
                  
                  {/* Gradient overlay — always present, fades in on hover */}
                  <div className="home-thumbnail-overlay">
                    <p className="home-overlay-title">{video.title}</p>
                    <p className="home-overlay-stats">{formatViews(video.views)} views • {formatTimestamp(video.createdAt)}</p>
                    <span className="home-duration">{video.duration}</span>
                  </div>
                </div>

                {/* Below thumbnail: avatar + info */}
                <div className="home-video-details">
                  <div className="author-avatar">
                    {video.authorProfile?.photoURL ? (
                      <img 
                        src={video.authorProfile.photoURL} 
                        alt={video.authorName || 'User'} 
                        className="home-channel-avatar"
                      />
                    ) : (
                      <div className="home-channel-avatar-letter">
                        {video.authorName?.charAt(0)?.toUpperCase() || 
                         video.authorProfile?.displayName?.charAt(0)?.toUpperCase() || 
                         video.authorEmail?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="home-video-info">
                    <p className="home-channel-name">
                      {video.authorProfile?.displayName || video.authorName || 'Anonymous'}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;
