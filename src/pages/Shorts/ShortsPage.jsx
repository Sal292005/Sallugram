import React, { useState, useEffect, useRef } from 'react';

import {

  FaHeart, FaComment, FaShare, FaBookmark,

  FaPlay, FaVolumeMute, FaVolumeUp,FaThumbsUp,

  FaThumbsDown, FaRedo, FaEllipsisV, FaExpand,

  FaChevronUp, FaChevronDown, FaClock, FaList, FaDownload

} from 'react-icons/fa';

import { firestore } from '../../firebase/firebase';

import { collection, query, orderBy, onSnapshot, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';

import { auth } from '../../firebase/firebase';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import './ShortsPage.css';

import './AvatarCircleFix.css';

import './AvatarFinalFix.css';

import Navbar from '../../components/Navbar/Navbar';



const ShortsPage = () => {

  const [activeItem, setActiveItem] = useState('Shorts');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [currentShortIndex, setCurrentShortIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(true);

  const [isMuted, setIsMuted] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [likedItems, setLikedItems] = useState({});

  const [dislikedItems, setDislikedItems] = useState({});

  const [commentedItems, setCommentedItems] = useState({});

  const [sharedItems, setSharedItems] = useState({});

  const [savedItems, setSavedItems] = useState({});

  const [subscribedItems, setSubscribedItems] = useState({});

  const [touchStart, setTouchStart] = useState(0);

  const [touchEnd, setTouchEnd] = useState(0);

  const [shorts, setShorts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [user, authLoading] = useAuthState(auth);

  const [watchedShorts, setWatchedShorts] = useState(new Set());

  const navigate = useNavigate();

  const { shortId: shortIdParam } = useParams();

  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');

  const [isSearching, setIsSearching] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null); // Track which dropdown is open

  const videoRefs = useRef([]);



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



  // Handle URL parameter for specific short ID

  useEffect(() => {

    const shortId = shortIdParam || searchParams.get('shortId');

    if (shortId && shorts.length > 0) {

      const shortIndex = shorts.findIndex(short => short.id === shortId);

      if (shortIndex !== -1) {

        setCurrentShortIndex(shortIndex);

      }

    }

  }, [searchParams, shorts, shortIdParam]);



  // Filter shorts based on search query

  const displayedShorts = isSearching && searchQuery

    ? shorts.filter(short =>

        (short.title && short.title.toLowerCase().includes(searchQuery.toLowerCase())) ||

        (short.description && short.description.toLowerCase().includes(searchQuery.toLowerCase())) ||

        (short.authorName && short.authorName.toLowerCase().includes(searchQuery.toLowerCase()))

      )

    : shorts;



  // Reset carousel index when filtering changes (but not when navigating to specific short)

  useEffect(() => {

    const shortId = shortIdParam || searchParams.get('shortId');

    if (!shortId) {

      setCurrentShortIndex(0);

    }

  }, [isSearching, searchQuery, searchParams, shortIdParam]);



  // Redirect if not authenticated

  useEffect(() => {

    if (!authLoading && !user) {

      navigate('/login');

    }

  }, [user, authLoading, navigate]);



  // Fetch shorts from Firestore

  useEffect(() => {

    if (authLoading) return;

    

    setLoading(true);

    const q = query(

      collection(firestore, 'shorts'),

      orderBy('createdAt', 'desc')

    );

    

    const unsubscribe = onSnapshot(q, async (snapshot) => {

      const shortsData = await Promise.all(snapshot.docs.map(async documentSnapshot => {

        const shortData = {

          id: documentSnapshot.id,

          ...documentSnapshot.data(),

          createdAt: documentSnapshot.data().createdAt?.toDate() || new Date()

        };

        

        return shortData;

      }));

      

      setShorts(shortsData);

      setLoading(false);

      

      // Trigger autoplay for appropriate video when shorts are loaded

      if (shortsData.length > 0 && !loading) {

        setTimeout(() => {

          const shortId = shortIdParam || searchParams.get('shortId');

          const videoIndex = shortId ? shortsData.findIndex(short => short.id === shortId) : 0;

          const video = videoRefs.current[videoIndex];

          if (video) {

            video.play().catch(() => setIsPlaying(false));

            setIsPlaying(true);

          }

        }, 300); // Reduced timeout for faster loading

      }

    }, (error) => {

      console.error('Error fetching shorts:', error);

      setLoading(false);

    });

    

    return () => unsubscribe();

  }, [authLoading]);



  // Check if shorts are already liked

  useEffect(() => {

    if (!user || authLoading || shorts.length === 0) return;



    const checkLikedStatus = async () => {

      try {

        const userDocRef = doc(firestore, 'users', user.uid);

        const userDoc = await getDoc(userDocRef);

        

        if (userDoc.exists()) {

          const userData = userDoc.data();

          const youLiked = userData.youLiked || [];

          

          // Create a map of liked items

          const likedMap = {};

          youLiked.forEach(item => {

            likedMap[item.videoId] = true;

          });

          

          setLikedItems(likedMap);

        }

      } catch (error) {

        console.error('Error checking liked status:', error);

      }

    };



    checkLikedStatus();

  }, [user, authLoading, shorts]);



  const handlePlayPause = () => setIsPlaying(prev => !prev);

  const handleMute = () => setIsMuted(prev => !prev);



  const handleNext = () => {

    if (currentShortIndex < displayedShorts.length - 1) {

      setCurrentShortIndex(prev => prev + 1);

      setIsPlaying(true);

    }

  };



  const handlePrevious = () => {

    if (currentShortIndex > 0) {

      setCurrentShortIndex(prev => prev - 1);

      setIsPlaying(true);

    }

  };



  const handleWheel = (e) => {

    if (e.deltaY > 50) handleNext();

    else if (e.deltaY < -50) handlePrevious();

  };



  const handleTouchStart = (e) => {

    setTouchEnd(0);

    setTouchStart(e.targetTouches[0].clientY);

  };



  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientY);



  const handleTouchEnd = (e) => {
    // Check if the event target is one of the action buttons
    if (e.target.closest('.shorts-action, .shorts-action-button, .subscribe-button-shorts')) {
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrevious();
  };



  const toggleLike = async (id, e) => {
    e.stopPropagation();
    if (!user) return;
    
    try {

      const userDocRef = doc(firestore, 'users', user.uid);

      const short = displayedShorts.find(s => s.id === id);

      

      if (!short) return;
      

      // Get current user document

      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.exists() ? userDoc.data() : { youLiked: [] };

      const youLiked = userData.youLiked || [];

      

      const likedEntry = {

        videoId: short.id,

        title: short.title || 'Untitled Short',

        thumbnailUrl: short.thumbnailUrl || short.videoUrl || short.videoFileUrl || 'https://picsum.photos/400/225?random=' + short.id,

        duration: short.duration || '0:00',

        views: short.views || 0,

        authorName: short.authorName || short.authorProfile?.displayName || 'Unknown',

        likedAt: new Date().toISOString(),

        type: 'short' // Add type to distinguish shorts from videos

      };



      let updatedYouLiked;

      if (likedItems[id]) {

        // Remove from liked shorts

        updatedYouLiked = youLiked.filter(item => item.videoId !== id);

        setLikedItems(prev => ({ ...prev, [id]: false }));

      } else {

        // Add to liked shorts

        updatedYouLiked = [likedEntry, ...youLiked];

        setLikedItems(prev => ({ ...prev, [id]: true }));

        // Remove dislike if present

        setDislikedItems(prev => ({ ...prev, [id]: false }));

      }



      // Update the entire youLiked array

      await updateDoc(userDocRef, {

        youLiked: updatedYouLiked

      });



      // Also update short likes count in shorts collection

      const shortDocRef = doc(firestore, 'shorts', id);

      await updateDoc(shortDocRef, {

        likes: likedItems[id] ? (short.likes || 0) - 1 : (short.likes || 0) + 1

      });



    } catch (error) {

      console.error('Error updating like status:', error);

    }
  };

  const toggleDislike = (id, e) => {
    e.stopPropagation();
    setDislikedItems(prev => ({ ...prev, [id]: !prev[id] }));
    // If disliking, remove like
    if (!dislikedItems[id]) {
      setLikedItems(prev => ({ ...prev, [id]: false }));
    }
  };



  // Dropdown menu functions

  const toggleDropdown = (shortId) => {

    setActiveDropdown(activeDropdown === shortId ? null : shortId);

  };



  const handleWatchLater = async (short) => {

    if (!user) return;

    console.log('Added to Watch Later:', short.title);

    setActiveDropdown(null);

    // TODO: Implement watch later functionality

  };



  const handleAddToPlaylist = async (short) => {

    if (!user) return;

    console.log('Added to Playlist:', short.title);

    setActiveDropdown(null);

    // TODO: Implement playlist functionality

  };



  const handleDownload = async (short) => {

    console.log('Download:', short.title);

    setActiveDropdown(null);

    // TODO: Implement download functionality

  };



  const toggleComment = (id) => {

    setCommentedItems(prev => ({ ...prev, [id]: !prev[id] }));

  };



  const toggleShare = (id) => {

    setSharedItems(prev => ({ ...prev, [id]: !prev[id] }));

  };



  const toggleSave = (id) => {

    setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));

  };



  const toggleSubscribe = (id) => {

    setSubscribedItems(prev => ({ ...prev, [id]: !prev[id] }));

  };



  // Save watch history for shorts

  const saveWatchHistory = async (short) => {

    if (!user || !short) return;

    

    try {

      const userDocRef = doc(firestore, 'users', user.uid);

      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.exists() ? userDoc.data() : { watchHistory: [] };

      const watchHistory = userData.watchHistory || [];

      

      const historyEntry = {

        videoId: short.id,

        title: short.title || 'Untitled Short',

        thumbnailUrl: short.thumbnailUrl || short.videoUrl || short.videoFileUrl || 'https://picsum.photos/400/225?random=' + short.id,

        duration: short.duration || '0:00',

        views: short.views || 0,

        authorName: short.authorName || short.authorProfile?.displayName || 'Unknown',

        watchedAt: new Date().toISOString(),

        type: 'short' // Add type to distinguish shorts from videos

      };



      // Remove existing entry for this short if it exists

      const filteredHistory = watchHistory.filter(item => item.videoId !== short.id);

      

      // Add the new entry at the beginning

      const updatedHistory = [historyEntry, ...filteredHistory];



      // Update the entire watchHistory array

      await updateDoc(userDocRef, {

        watchHistory: updatedHistory

      });



      // Update watched shorts set

      setWatchedShorts(prev => new Set([...prev, short.id]));



    } catch (error) {

      console.error('Error saving watch history:', error);

    }

  };



  useEffect(() => {

    const timer = setTimeout(() => {

      const video = videoRefs.current[currentShortIndex];

      if (video && displayedShorts.length > 0) {

        video.play().catch(() => setIsPlaying(false));

        setIsPlaying(true);

      }

    }, 200); // Faster autoplay for better UX

    return () => clearTimeout(timer);

  }, [currentShortIndex, displayedShorts.length]);



  useEffect(() => {

    videoRefs.current.forEach((video, i) => {

      if (!video) return;

      if (i === currentShortIndex) {

        if (isPlaying) {

          video.play().catch(() => {});

          // Save to watch history when video starts playing

          if (!watchedShorts.has(displayedShorts[i]?.id)) {

            saveWatchHistory(displayedShorts[i]);

          }

        } else {

          video.pause();

        }

      } else {

        video.pause();

        video.currentTime = 0;

      }

    });

  }, [currentShortIndex, isPlaying, displayedShorts, watchedShorts]);



  useEffect(() => {

    return () => videoRefs.current.forEach(v => v && v.pause());

  }, [currentShortIndex]);



  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === 'ArrowUp') {

        e.preventDefault();

        handlePrevious();

      } else if (e.key === 'ArrowDown') {

        e.preventDefault();

        handleNext();

      }

    };



    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [currentShortIndex]);



  const currentShort = displayedShorts[currentShortIndex];



  // Format timestamp for display

  const formatTimestamp = (timestamp) => {

    if (!timestamp) return 'Just now';

    

    const now = new Date();

    const shortTime = timestamp instanceof Date ? timestamp : timestamp.toDate();

    const diffInMs = now - shortTime;

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    const diffInDays = Math.floor(diffInHours / 24);

    

    if (diffInHours < 1) return 'Just now';

    if (diffInHours < 24) return `${diffInHours}h ago`;

    if (diffInDays < 7) return `${diffInDays}d ago`;

    

    return shortTime.toLocaleDateString();

  };



  // Handle empty state

  if (loading) {

    return (

      <div className="shorts-page">

        <Navbar

          activeItem={activeItem}

          onItemChange={setActiveItem}

          isSidebarCollapsed={isSidebarCollapsed}

          setIsSidebarCollapsed={setIsSidebarCollapsed}

        />

        <div className="loading-container">

          <div className="loading-spinner">Loading shorts...</div>

        </div>

      </div>

    );

  }



  if (displayedShorts.length === 0) {

    return (

      <div className="shorts-page">

        <Navbar

          activeItem={activeItem}

          onItemChange={setActiveItem}

          isSidebarCollapsed={isSidebarCollapsed}

          setIsSidebarCollapsed={setIsSidebarCollapsed}

        />

        <div className="empty-state">

          <h3>No shorts found</h3>

          <p>{isSearching ? `No results for "${searchQuery}"` : 'Be the first to create a short!'}</p>

          {!isSearching && (

            <button className="create-first-short-btn" onClick={() => navigate('/upload-short')}>

              Create First Short

            </button>

          )}

        </div>

      </div>

    );

  }



  return (

    <div className="shorts-page">

      <Navbar

        activeItem={activeItem}

        onItemChange={setActiveItem}

        isSidebarCollapsed={isSidebarCollapsed}

        setIsSidebarCollapsed={setIsSidebarCollapsed}

      />



      <div

        className="shorts-main"

        onWheel={handleWheel}

        onTouchStart={handleTouchStart}

        onTouchMove={handleTouchMove}

        onTouchEnd={handleTouchEnd}

      >

        {/* ── LEFT: creator info + title (below video, left-aligned) ── */}

        <div className="shorts-left-info">

          <div className="sl-creator-row">

            <div className="sl-avatar">

              {currentShort.authorProfile?.photoURL ? (

                <img 

                  src={currentShort.authorProfile.photoURL} 

                  alt={currentShort.authorName || 'User'} 

                  className="sl-avatar-img"

                />

              ) : (

                <div className="sl-avatar-letter">

                  {currentShort.authorName?.charAt(0)?.toUpperCase() || 

                   currentShort.authorProfile?.displayName?.charAt(0)?.toUpperCase() || 

                   currentShort.authorEmail?.charAt(0)?.toUpperCase() || 'U'}

                </div>

              )}

            </div>

            <span className="sl-handle">

              @{currentShort.authorProfile?.displayName?.toLowerCase().replace(/\s+/g, '') || 

                currentShort.authorName?.toLowerCase().replace(/\s+/g, '') || 

                'user'}

              <button className="sl-subscribe-btn" onClick={() => toggleSubscribe(currentShort.id)}>

                {subscribedItems[currentShort.id] ? 'Subscribed' : 'Subscribe'}

              </button>

            </span>

          </div>

          <h3 className="sl-title">{currentShort.title}</h3>

          <p className="sl-description">{currentShort.description}</p>

          <div className="sl-stats">

            <span>{currentShort.views || 0} views</span>

            <span style={{marginLeft:15}}>{formatTimestamp(currentShort.createdAt)}</span>

          </div>

        </div>



        {/* ── CENTER: video player ── */}

        <div className="shorts-player-wrap">





          {/* Video carousel */}

          <div className="shorts-viewport">

            <div

              className="shorts-carousel"

              style={{ transform: `translateY(-${currentShortIndex * 100}%)` }}

            >

              {displayedShorts.map((short, index) => (

                <div key={short.id} className="short-slide">

                  <video

                    ref={el => videoRefs.current[index] = el}

                    className="short-video"

                    src={short.videoUrl || short.videoFileUrl}

                    loop

                    muted={isMuted}

                    playsInline

                    onClick={handlePlayPause}

                    preload="metadata"

                    poster={short.thumbnailUrl || short.imageUrl}

                  />

                  {/* Three dots button - only show when video is paused */}

                  {(!isPlaying || index !== currentShortIndex) && (

                    <div className="short-video-actions">

                      <button 

                        className="short-video-more-btn" 

                        title="More options"

                        onClick={() => toggleDropdown(short.id)}

                      >

                        <FaEllipsisV />

                      </button>

                      

                      {/* Dropdown Menu */}

                      {activeDropdown === short.id && (

                        <div className="short-video-dropdown">

                          <button 

                            className="dropdown-item"

                            onClick={() => handleWatchLater(short)}

                          >

                            <FaClock />

                            <span>Watch later</span>

                          </button>

                          <button 

                            className="dropdown-item"

                            onClick={() => handleAddToPlaylist(short)}

                          >

                            <FaList />

                            <span>Playlists</span>

                          </button>

                          <button 

                            className="dropdown-item"

                            onClick={() => handleDownload(short)}

                          >

                            <FaDownload />

                            <span>Downloads</span>

                          </button>

                        </div>

                      )}

                    </div>

                  )}

                  {!isPlaying && index === currentShortIndex && (

                    <div className="play-indicator" onClick={handlePlayPause}>

                      <FaPlay />

                    </div>

                  )}

                  {/* Add video preview overlay */}

                  {index !== currentShortIndex && (

                    <div className="video-preview-overlay">

                      <video

                        className="preview-video"

                        src={short.videoUrl || short.videoFileUrl}

                        muted

                        loop

                        autoPlay

                        playsInline

                        preload="metadata"

                      />

                    </div>

                  )}

                </div>

              ))}

            </div>

          </div>



        </div>



        {/* ── RIGHT: action buttons ── */}

        <div className="shorts-actions">

          



          {/* Like */}

          <button

            className={`sa-btn ${likedItems[currentShort.id] ? 'sa-btn--active' : ''}`}

            onClick={(e) => toggleLike(currentShort.id, e)}

          >

            <div className="sa-icon-circle">

              <FaThumbsUp />

            </div>

            <span>Like</span>

          </button>



          {/* Dislike */}

          <button 

            className={`sa-btn dislike ${dislikedItems[currentShort.id] ? 'sa-btn--active' : ''}`}

            onClick={(e) => toggleDislike(currentShort.id, e)}

          >

            <div className="sa-icon-circle">

              <FaThumbsDown />

            </div>

            <span>Dislike</span>

          </button>



          {/* Comment */}

          <button 

            className={`sa-btn comment ${commentedItems[currentShort.id] ? 'sa-btn--active' : ''}`}

            onClick={(e) => { e.stopPropagation(); toggleComment(currentShort.id); }}
          >

            <div className="sa-icon-circle">

              <FaComment />

            </div>

            <span>{currentShort.comments || 0}</span>

          </button>



          {/* Share */}

          <button 

            className={`sa-btn share ${sharedItems[currentShort.id] ? 'sa-btn--active' : ''}`}

            onClick={(e) => { e.stopPropagation(); toggleShare(currentShort.id); }}
          >

            <div className="sa-icon-circle">

              <FaShare />

            </div>

            <span>Share</span>

          </button>



          {/* Save */}

          <button 

            className={`sa-btn save ${savedItems[currentShort.id] ? 'sa-btn--active' : ''}`}

            onClick={(e) => { e.stopPropagation(); toggleSave(currentShort.id); }}
          >

            <div className="sa-icon-circle">

              <FaBookmark />

            </div>

            <span>{currentShort.saves}</span>

          </button>



        </div>



        {/* Navigation Arrows - Separate Right Side */}

        <div className="navigation-arrows-container">

          <button 

            className="nav-arrow nav-arrow-up" 

            onClick={handlePrevious}

            disabled={currentShortIndex === 0}

          >

            <FaChevronUp />

          </button>

          <button 

            className="nav-arrow nav-arrow-down" 

            onClick={handleNext}

            disabled={currentShortIndex === displayedShorts.length - 1}

          >

            <FaChevronDown />

          </button>

        </div>

      </div>



      {/* ── Comments panel ── */}

      {showComments && (

        <div className="comments-modal">

          <div className="comments-header">

            <h3>Comments · {currentShort.comments}</h3>

            <button className="close-comments" onClick={() => setShowComments(false)}>✕</button>

          </div>

          <div className="comments-list">

            {[1, 2, 3, 4, 5].map(n => (

              <div key={n} className="comment-item">

                <img src={`https://i.pravatar.cc/32?img=${n + 10}`} alt="User" className="comment-avatar" />

                <div className="comment-content">

                  <span className="comment-user">@user_{n}</span>

                  <p className="comment-text">Great content! Keep it up! 🔥</p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

};



export default ShortsPage;