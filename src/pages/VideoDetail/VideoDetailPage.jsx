import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaHeart, FaComment, FaShare, FaBookmark, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaEllipsisH, FaUser, FaExpand, FaCompress, FaClock, FaList, FaDownload } from 'react-icons/fa';
import { firestore } from '../../firebase/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './VideoDetailPage.css';

const VideoDetailPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, authLoading] = useAuthState(auth);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track dropdown visibility
  const videoRef = useRef(null);

  // Save watch history for videos
  const saveWatchHistory = async (video) => {
    if (!user || !video) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : { watchHistory: [] };
      const watchHistory = userData.watchHistory || [];
      
      const historyEntry = {
        videoId: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        authorName: video.authorName,
        watchedAt: new Date().toISOString(),
        type: 'video' // Add type to distinguish videos from shorts
      };

      // Remove existing entry for this video if it exists
      const filteredHistory = watchHistory.filter(item => item.videoId !== video.id);
      
      // Add the new entry at the beginning
      const updatedHistory = [historyEntry, ...filteredHistory];

      // Update the entire watchHistory array
      await updateDoc(userDocRef, {
        watchHistory: updatedHistory
      });

      // Update watched videos set
      setWatchedVideos(prev => new Set([...prev, video.id]));

    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  };
  const progressBarRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Save watch history when video starts playing
  useEffect(() => {
    if (video && isPlaying && !watchedVideos.has(video.id)) {
      saveWatchHistory(video);
    }
  }, [video, isPlaying, watchedVideos]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch video data
  useEffect(() => {
    if (!videoId || authLoading) return;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoDoc = await getDoc(doc(firestore, 'videos', videoId));
        
        if (!videoDoc.exists()) {
          setError('Video not found');
          setLoading(false);
          return;
        }

        const videoData = {
          id: videoDoc.id,
          ...videoDoc.data(),
          createdAt: videoDoc.data().createdAt?.toDate() || new Date()
        };

        setVideo(videoData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Failed to load video');
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, authLoading]);

  // Handle video autoplay when video is loaded
  useEffect(() => {
    if (video && videoRef.current && video.videoUrl) {
      const videoElement = videoRef.current;
      
      // Attempt to play the video
      const attemptPlay = async () => {
        try {
          await videoElement.play();
          console.log('Video autoplay successful');
          setIsPlaying(true);
        } catch (error) {
          console.log('Video autoplay failed, trying muted:', error);
          // Try with muted if autoplay fails
          videoElement.muted = true;
          try {
            await videoElement.play();
            console.log('Video autoplay successful with muted');
            setIsPlaying(true);
          } catch (mutedError) {
            console.log('Video autoplay failed even with muted:', mutedError);
            setIsPlaying(false);
          }
        }
      };

      // Small delay to ensure video is ready
      setTimeout(attemptPlay, 100);
    }
  }, [video]);

  // Check if video is already liked
  useEffect(() => {
    if (!video || !user || authLoading) return;

    const checkIfLiked = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const youLiked = userData.youLiked || [];
          const isVideoLiked = youLiked.some(item => item.videoId === video.id);
          setLiked(isVideoLiked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkIfLiked();
  }, [video, user, authLoading]);

  // Track watch history when user watches video
  useEffect(() => {
    if (!video || !user || authLoading) return;

    const trackWatchHistory = async () => {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Get current user document
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? userDoc.data() : { watchHistory: [] };
        const currentHistory = userData.watchHistory || [];
        
        // Check if video already exists in history
        const existingIndex = currentHistory.findIndex(item => item.videoId === video.id);
        
        const historyEntry = {
          videoId: video.id,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          views: video.views,
          authorName: video.authorName,
          watchedAt: new Date().toISOString(), // Store as ISO string
          watchProgress: '0%'
        };

        let updatedHistory;
        if (existingIndex >= 0) {
          // Update existing entry
          updatedHistory = [...currentHistory];
          updatedHistory[existingIndex] = historyEntry;
        } else {
          // Add new entry
          updatedHistory = [historyEntry, ...currentHistory];
        }

        // Update the entire watch history array
        await updateDoc(userDocRef, {
          watchHistory: updatedHistory
        });

      } catch (error) {
        console.error('Error tracking watch history:', error);
      }
    };

    // Track after 5 seconds of watching
    const timer = setTimeout(() => {
      trackWatchHistory();
    }, 5000);

    return () => clearTimeout(timer);
  }, [video, user, authLoading]);

  // Update watch progress
  const updateWatchProgress = async () => {
    if (!videoRef.current || !video || !user) return;
    
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    const watchProgress = `${Math.round(progress)}%`;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Find and update the specific history entry
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const watchHistory = userData.watchHistory || [];
        
        const updatedHistory = watchHistory.map(item => {
          if (item.videoId === video.id) {
            return { ...item, watchProgress };
          }
          return item;
        });

        await updateDoc(userDocRef, { watchHistory: updatedHistory });
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  // Fetch comments
  useEffect(() => {
    if (!videoId || authLoading) return;

    const q = query(
      collection(firestore, 'videos', videoId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setComments(commentsData);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    return () => unsubscribe();
  }, [videoId, authLoading]);

  // Autoplay video when it loads
  useEffect(() => {
    if (video && videoRef.current && !loading) {
      const attemptAutoplay = async () => {
        try {
          // Start muted for browser compatibility
          videoRef.current.muted = true;
          await videoRef.current.play();
          console.log('Autoplay started successfully (muted)');
          setIsPlaying(true);
          
          // Unmute after a short delay
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setIsMuted(false);
              console.log('Video unmuted after autoplay');
            }
          }, 500);
        } catch (error) {
          console.log('Autoplay failed:', error);
          setIsPlaying(false);
          // Keep muted if autoplay fails
        }
      };

      // Small delay to ensure video is ready
      const timer = setTimeout(attemptAutoplay, 1000);
      return () => clearTimeout(timer);
    }
  }, [video, loading]);

  // Video controls
  const handlePlayPause = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('Play/pause error:', error);
        // If play fails, try with muted
        if (!isPlaying) {
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            setIsPlaying(true);
            setIsMuted(true);
          } catch (mutedError) {
            console.log('Muted play also failed:', mutedError);
          }
        }
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
      
      // Update watch progress every 10 seconds
      if (Math.floor(videoRef.current.currentTime) % 10 === 0) {
        updateWatchProgress();
      }
    }
  };

  const handleSeek = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const commentTime = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const diffInMs = now - commentTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return commentTime.toLocaleDateString();
  };

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) return;

    try {
      const commentData = {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email,
        authorPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
        likes: 0,
        replies: []
      };

      await addDoc(collection(firestore, 'videos', videoId, 'comments'), commentData);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !video) return;

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Get current user document
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : { youLiked: [] };
      const youLiked = userData.youLiked || [];
      
      const likedEntry = {
        videoId: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        authorName: video.authorName,
        likedAt: new Date().toISOString(),
        type: 'video' // Add type to distinguish videos from shorts
      };

      let updatedYouLiked;
      if (liked) {
        // Remove from liked videos
        updatedYouLiked = youLiked.filter(item => item.videoId !== video.id);
        setLiked(false);
      } else {
        // Add to liked videos
        updatedYouLiked = [likedEntry, ...youLiked];
        setLiked(true);
      }

      // Update the entire youLiked array
      await updateDoc(userDocRef, {
        youLiked: updatedYouLiked
      });

      // Also update video likes count in videos collection
      const videoDocRef = doc(firestore, 'videos', video.id);
      await updateDoc(videoDocRef, {
        likes: liked ? (video.likes || 0) - 1 : (video.likes || 0) + 1
      });

      // Handle dislike state
      if (disliked) setDisliked(false);

    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleSubscribe = () => {
    setSubscribed(!subscribed);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  // Dropdown menu functions
  const toggleDropdown = () => {
    setActiveDropdown(!activeDropdown);
  };

  const handleWatchLater = async () => {
    if (!user || !video) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : { watchLater: [] };
      const watchLater = userData.watchLater || [];
      
      const watchLaterEntry = {
        id: video.id,
        videoId: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl || video.videoUrl,
        duration: video.duration,
        views: video.views,
        authorName: video.authorName,
        channelName: video.authorName,
        addedAt: new Date().toISOString(),
        type: 'video'
      };

      // Check if already in watch later
      const exists = watchLater.some(item => item.videoId === video.id);
      if (!exists) {
        // Add to watch later
        const updatedWatchLater = [watchLaterEntry, ...watchLater];
        await setDoc(userDocRef, { watchLater: updatedWatchLater }, { merge: true });
        console.log('Added to Watch Later:', video.title);
      } else {
        // Remove from watch later
        const updatedWatchLater = watchLater.filter(item => item.videoId !== video.id);
        await setDoc(userDocRef, { watchLater: updatedWatchLater }, { merge: true });
        console.log('Removed from Watch Later:', video.title);
      }
      
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error updating watch later:', error);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!user) return;
    console.log('Added to Playlist:', video?.title);
    setActiveDropdown(null);
    // TODO: Implement playlist functionality
  };

  const handleDownload = async () => {
    console.log('Download:', video?.title);
    setActiveDropdown(null);
    // TODO: Implement download functionality
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        videoContainerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="video-detail-page">
        <div className="loading-container">
          <div className="loading-spinner">Loading video...</div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="video-detail-page">
        <div className="error-container">
          <h3>{error || 'Video not found'}</h3>
          <button onClick={() => navigate('/home')} className="back-to-home-btn">
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      {/* Header */}
      <div className="video-detail-header">
        <button onClick={() => navigate('/home')} className="back-btn">
          <FaArrowLeft />
        </button>
      </div>

      <div className="video-detail-content">
        {/* Video Player Section */}
        <div className="video-player-section">
          <div className="video-container" ref={videoContainerRef}>
            <video
              ref={videoRef}
              className={`video-player ${isFullscreen ? 'fullscreen' : ''}`}
              src={video.videoUrl}
              muted={isMuted}
              playsInline
              onClick={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onLoadedData={() => {
                console.log('Video loaded, autoplay will be triggered by useEffect');
              }}
              onError={(e) => {
                console.log('Video error:', e);
              }}
            />
            
            {/* Video Controls Overlay */}
            <div className="video-controls-overlay">
              <div className="video-controls">
                <button onClick={handlePlayPause} className="play-pause-btn">
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={handleMute} className="mute-btn">
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <div className="progress-bar" ref={progressBarRef} onClick={handleSeek}>
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button onClick={handleFullscreen} className="fullscreen-btn">
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button onClick={toggleDropdown} className="more-options-btn">
                  <FaEllipsisH />
                </button>
                
                {/* Dropdown Menu */}
                {activeDropdown && (
                  <div className="video-dropdown">
                    <button 
                      className="dropdown-item"
                      onClick={handleWatchLater}
                    >
                      <FaClock />
                      <span>Watch later</span>
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleAddToPlaylist}
                    >
                      <FaList />
                      <span>Playlists</span>
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleDownload}
                    >
                      <FaDownload />
                      <span>Downloads</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Info Section */}
        <div className="video-info-section">
          <h1 className="video-title">{video.title}</h1>
          <p className="video-description">{video.description}</p>
          
          {/* Video Stats */}
          <div className="video-stats">
            <span>{formatViews(video.views)}</span>
            <span>{formatTimestamp(video.createdAt)}</span>
            {video.category && <span className="video-category">{video.category}</span>}
          </div>

          {/* Author Info */}
          <div className="author-section">
            <div className="author-info">
              <div className="author-avatar">
                {authorProfile?.photoURL ? (
                  <img src={authorProfile.photoURL} alt={authorProfile.displayName} />
                ) : (
                  <div className="author-avatar-letter">
                    {authorProfile?.displayName?.charAt(0)?.toUpperCase() || 
                     video.authorName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="author-details">
                <h3>{authorProfile?.displayName || video.authorName || 'Anonymous'}</h3>
                <p className="subscriber-count">1.2K subscribers</p>
              </div>
            </div>
            <button 
              className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="video-actions">
            <button 
              className={`action-btn like-btn ${liked ? 'active' : ''}`}
              onClick={handleLike}
            >
              <FaThumbsUp />
              <span>{video.likes || 0}</span>
            </button>
            <button 
              className={`action-btn dislike-btn ${disliked ? 'active' : ''}`}
              onClick={handleDislike}
            >
              <FaThumbsDown />
            </button>
            <button className="action-btn" onClick={handleShare}>
              <FaShare />
              <span>Share</span>
            </button>
            <button className="action-btn">
              <FaBookmark />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h2 className="comments-title">Comments ({comments.length})</h2>
          
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="add-comment-form">
              <div className="comment-input-wrapper">
                <div className="user-avatar">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} />
                  ) : (
                    <div className="user-avatar-letter">
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
                  Comment
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.authorPhotoURL ? (
                    <img src={comment.authorPhotoURL} alt={comment.authorName} />
                  ) : (
                    <div className="comment-avatar-letter">
                      {comment.authorName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.authorName}</span>
                    <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button className="comment-action-btn">
                      <FaThumbsUp />
                      <span>{comment.likes || 0}</span>
                    </button>
                    <button className="comment-action-btn">Reply</button>
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
