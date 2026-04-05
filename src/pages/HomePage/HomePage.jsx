import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { firestore } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './HomePage.css';
import './ShortOverlay.css';
import Navbar from '../../components/Navbar/Navbar';
import SeeAllButton from '../../components/SeeAllButton/SeeAllButton';
// import SubscribeButton from '../../components/SubscribeButton/SubscribeButton.jsx';
// import WatchLaterButton from '../../components/WatchLaterButton/WatchLaterButton.jsx';

const HomePage = () => {
  const [activeItem, setActiveItem] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shorts, setShorts] = useState([]);
  const [shortsLoading, setShortsLoading] = useState(true);
  const [seeAllActive, setSeeAllActive] = useState(false);
  const [touchedShortId, setTouchedShortId] = useState(null);
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectionBarRef = React.useRef(null);
  const selectionItemRefs = React.useRef([]);

  const handleItemClick = (item) => {
    setActiveItem(item);
    switch (item) {
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

  const scrollSelectionByOne = (direction) => {
    const container = selectionBarRef.current;
    const items = selectionItemRefs.current.filter(Boolean);
    if (!container || items.length === 0) return;

    const scrollLeft = container.scrollLeft;

    if (direction === 'right') {
      const next = items.find((el) => el.offsetLeft > scrollLeft + 1);
      if (next) container.scrollTo({ left: next.offsetLeft, behavior: 'smooth' });
      else container.scrollTo({ left: items[items.length - 1].offsetLeft, behavior: 'smooth' });
      return;
    }

    const prevCandidates = items.filter((el) => el.offsetLeft < scrollLeft - 1);
    const prev = prevCandidates[prevCandidates.length - 1];
    if (prev) container.scrollTo({ left: prev.offsetLeft, behavior: 'smooth' });
    else container.scrollTo({ left: 0, behavior: 'smooth' });
  };

  // Fetch videos from Firestore
  useEffect(() => {
    if (authLoading) return;
    
    setLoading(true);

    // NOTE: Avoid Firestore composite-index requirements by fetching ordered videos
    // and doing category/type filtering client-side.
    const q = query(
      collection(firestore, 'videos'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const videosData = await Promise.all(snapshot.docs.map(async documentSnapshot => {
        const videoData = {
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
          createdAt: documentSnapshot.data().createdAt?.toDate() || new Date()
        };
        
        return videoData;
      }));
      
      // Client-side filtering (keeps shorts out of selected categories)
      let filteredVideos = videosData.filter(v => (v.type || 'video') === 'video');
      if (activeCategory !== 'All') {
        filteredVideos = filteredVideos.filter(video =>
          video.category?.toLowerCase() === activeCategory.toLowerCase()
        );
      }
      
      setVideos(filteredVideos);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching videos:', error);
      setVideos([]);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [authLoading, activeCategory]);

  // Fetch shorts from Firestore
  useEffect(() => {
    if (authLoading) return;

    setShortsLoading(true);
    const q = query(
      collection(firestore, 'shorts'),
      orderBy('createdAt', 'desc'),
      limit(12)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shortsData = snapshot.docs.map((documentSnapshot) => ({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
        createdAt: documentSnapshot.data().createdAt?.toDate() || new Date(),
      }));

      setShorts(shortsData);
      setShortsLoading(false);
    }, (error) => {
      console.error('Error fetching shorts:', error);
      setShortsLoading(false);
    });

    return () => unsubscribe();
  }, [authLoading]);

  // Handle URL search parameters
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
      setIsSearching(true);
    } else {
      setSearchQuery('');
      setIsSearching(false);
    }
  }, [searchParams]);

  // Filter videos based on search query
  const filteredVideos = isSearching && searchQuery
    ? videos.filter(video => 
        (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.authorName && video.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.category && video.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : videos;

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const videoTime = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const diffInMs = now - videoTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return videoTime.toLocaleDateString();
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const videosFirstRow = filteredVideos.slice(0, 4);
  const videosAfterFirstRow = filteredVideos.slice(4);

  return (
    <div className="youtube-container">
      <Navbar
        activeItem={activeItem}
        onItemChange={handleItemClick}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Selection Bar */}
      <div className="selection-bar">
        <button
          className="scroll-nav scroll-nav-left"
          onClick={() => scrollSelectionByOne('left')}
          style={{ left: isSidebarCollapsed ? '100px' : '240px' }}
        >
          <FaChevronLeft />
        </button>

        <div
          className={`selection-bar-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
          ref={selectionBarRef}
        >
          {categories.map((category, index) => (
            <button
              key={category}
              ref={(el) => { selectionItemRefs.current[index] = el; }}
              className={`selection-item ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <button className="scroll-nav" onClick={() => scrollSelectionByOne('right')}>
          <FaChevronRight />
        </button>
      </div>

      <div className="main-content" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
        {/* Search Results Header */}
        {isSearching && (
          <div className="search-results-header">
            <h2>Search Results for "{searchQuery}"</h2>
            <p>{filteredVideos.length} videos found</p>
          </div>
        )}
        
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
          <div className="home-videos-grid">
            {videosFirstRow.map((video) => (
              <div key={video.id} className="home-video-card" onClick={() => navigate(`/video/${video.id}`)}>

                {/* Thumbnail with hover overlay */}
                <div 
                  className="home-thumbnail"
                >
                  {video.videoUrl ? (
                    <video
                      data-video-id={video.id}
                      src={video.videoUrl}
                      muted
                      playsInline
                      preload="auto"
                      poster={video.thumbnailUrl || 'https://picsum.photos/400/225?random=' + video.id}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : (
                    <img src={video.thumbnailUrl || 'https://picsum.photos/400/225?random=' + video.id} alt={video.title} />
                  )}

                  {/* Gradient overlay — always present, fades in on hover */}
                  <div className="home-thumbnail-overlay">
                    <p className="home-overlay-title">{video.title}</p>
                    <p className="home-overlay-stats">{formatViews(video.views)} • {formatTimestamp(video.createdAt)}</p>
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

            {/* Shorts Row */}
            {activeCategory === 'All' && !shortsLoading && shorts.length > 0 && (
              <div className="home-shorts-row">
                <div className="home-shorts-row-header">
                  <h3>Shorts</h3>
                  <SeeAllButton 
                    onClick={() => {
                      console.log('See all button clicked, current state:', seeAllActive);
                      setSeeAllActive(!seeAllActive);
                      navigate('/shorts');
                    }}
                    isActive={seeAllActive}
                  />
                </div>
                <div className="home-shorts-scroller">
                  {shorts.map((short) => (
                    <div
                      key={short.id}
                      className={`home-short-card ${touchedShortId === short.id ? 'touched' : ''}`}
                      onTouchStart={(e) => {
                        console.log('Touch start on short:', short.id);
                        setTouchedShortId(short.id);
                        
                        // Auto-hide after 2 seconds if not released
                        setTimeout(() => {
                          if (touchedShortId === short.id) {
                            setTouchedShortId(null);
                            navigate(`/shorts?shortId=${short.id}`);
                          }
                        }, 2000);
                      }}
                      onTouchEnd={(e) => {
                        console.log('Touch end on short:', short.id);
                        setTimeout(() => {
                          setTouchedShortId(null);
                          navigate(`/shorts?shortId=${short.id}`);
                        }, 300);
                      }}
                      onMouseDown={() => {
                        console.log('Mouse down on short:', short.id);
                        setTouchedShortId(short.id);
                      }}
                      onMouseUp={() => {
                        console.log('Mouse up on short:', short.id);
                        setTouchedShortId(null);
                        navigate(`/shorts?shortId=${short.id}`);
                      }}
                      onMouseLeave={() => {
                        console.log('Mouse leave on short:', short.id);
                        setTouchedShortId(null);
                      }}
                      onMouseEnter={() => {
                        console.log('Mouse enter on short:', short.id);
                        setTouchedShortId(short.id);
                      }}
                      onClick={() => navigate(`/shorts?shortId=${short.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="home-short-media">
                        <img 
                          src={short.thumbnailUrl || 'https://picsum.photos/400/700?random=' + short.id} 
                          alt={short.title || 'Short thumbnail'} 
                          className="home-short-thumbnail"
                        />
                        {touchedShortId === short.id && (
                          <>
                            {console.log('Rendering overlay for short:', short.id)}
                            <div className="home-short-overlay">
                              <div className="home-short-overlay-content">
                                <h4 className="home-short-overlay-title">{short.title || 'Untitled'}</h4>
                                <div className="home-short-overlay-stats">
                                  <span>{formatViews(short.views)}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="home-short-meta">
                        <p className="home-short-title">{short.title || 'Untitled'}</p>
                        <p className="home-short-stats">{formatViews(short.views)} • {short.duration || '0:00'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videosAfterFirstRow.map((video) => (
              <div key={video.id} className="home-video-card" onClick={() => navigate(`/video/${video.id}`)}>

                {/* Thumbnail with hover overlay */}
                <div 
                  className="home-thumbnail"
                >
                  {video.videoUrl ? (
                    <video
                      data-video-id={video.id}
                      src={video.videoUrl}
                      muted
                      playsInline
                      preload="auto"
                      poster={video.thumbnailUrl || 'https://picsum.photos/400/225?random=' + video.id}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : (
                    <img src={video.thumbnailUrl || 'https://picsum.photos/400/225?random=' + video.id} alt={video.title} />
                  )}

                  {/* Gradient overlay — always present, fades in on hover */}
                  <div className="home-thumbnail-overlay">
                    <p className="home-overlay-title">{video.title}</p>
                    <p className="home-overlay-stats">{formatViews(video.views)} • {formatTimestamp(video.createdAt)}</p>
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

export default HomePage;