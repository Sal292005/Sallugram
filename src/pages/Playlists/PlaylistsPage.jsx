import React, { useState, useEffect } from 'react';
import { FaPlay, FaHeart, FaClock, FaPlus, FaEdit, FaTrash, FaShare, FaDownload, FaEllipsisH, FaList, FaFilm } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './PlaylistsPage.css';
import Navbar from '../../components/Navbar/Navbar';

const PlaylistsPage = () => {
  const [activeItem, setActiveItem] = useState('Playlists');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlists, setPlaylists] = useState({});
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistPrivacy, setNewPlaylistPrivacy] = useState('public');
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();

  // Fetch user's playlists from Firestore
  useEffect(() => {
    if (authLoading || !user) return;

    const userDocRef = doc(firestore, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setPlaylists(userData.playlists || {});
      }
    });

    return () => unsubscribe();
  }, [authLoading, user]);

  const handleCreatePlaylist = () => {
    setShowCreateModal(true);
  };

  const handlePlaylistClick = (playlistName, videos) => {
    setSelectedPlaylist({ name: playlistName, videos });
  };

  // Create new playlist
  const handleCreateNewPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      await updateDoc(userDocRef, {
        [`playlists.${newPlaylistName.trim()}`]: {
          name: newPlaylistName.trim(),
          description: newPlaylistDescription,
          isPrivate: newPlaylistPrivacy === 'private',
          createdAt: new Date().toISOString(),
          videos: []
        }
      });
      
      // Reset form
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setNewPlaylistPrivacy('public');
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  // Add video to playlist
  const handleAddToPlaylist = async (video, playlistName) => {
    if (!user || !playlistName) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const videoData = {
        videoId: video.videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl || video.thumbnail,
        authorName: video.authorName,
        views: video.views,
        duration: video.duration,
        type: video.type || 'video',
        addedAt: new Date().toISOString(),
        videoUrl: video.videoUrl
      };
      
      await updateDoc(userDocRef, {
        [`playlists.${playlistName}.videos`]: arrayUnion(videoData)
      });
      
      console.log(`Video added to playlist: ${playlistName}`);
      setShowPlaylistMenu(null);
      
    } catch (error) {
      console.error('Error adding video to playlist:', error);
    }
  };

  // Remove video from playlist
  const handleRemoveFromPlaylist = async (video, playlistName) => {
    if (!user || !playlistName) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const videoData = {
        videoId: video.videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl || video.thumbnail,
        authorName: video.authorName,
        views: video.views,
        duration: video.duration,
        type: video.type || 'video',
        addedAt: video.addedAt,
        videoUrl: video.videoUrl
      };
      
      await updateDoc(userDocRef, {
        [`playlists.${playlistName}.videos`]: arrayRemove(videoData)
      });
      
      console.log(`Video removed from playlist: ${playlistName}`);
      
    } catch (error) {
      console.error('Error removing video from playlist:', error);
    }
  };

  // Get navigation route for video
  const getNavigationRoute = (video) => {
    const type = video.type || (video.thumbnailUrl?.includes('shorts') ? 'short' : 'video');
    switch (type) {
      case 'short':
        return `/short/${video.videoId}`;
      case 'post':
        return `/post/${video.videoId}`;
      case 'video':
      default:
        return `/video/${video.videoId}`;
    }
  };

  // Delete entire playlist
  const handleDeletePlaylist = async (playlistName) => {
    if (!user || !playlistName) return;
    
    if (!window.confirm(`Are you sure you want to delete the playlist "${playlistName}"?`)) {
      return;
    }
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Remove the entire playlist
      const updatedPlaylists = { ...playlists };
      delete updatedPlaylists[playlistName];
      
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists
      });
      
      console.log(`Playlist deleted: ${playlistName}`);
      
      // If the deleted playlist was selected, go back to playlist list
      if (selectedPlaylist?.name === playlistName) {
        setSelectedPlaylist(null);
      }
      
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  // Play all videos in playlist (navigate to first video)
  const handlePlayPlaylist = (playlistName, videos) => {
    if (!videos || videos.length === 0) return;
    
    // Navigate to the first video in the playlist
    const firstVideo = videos[0];
    navigate(getNavigationRoute(firstVideo));
  };

  // Format views
  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views < 1000) return `${views} views`;
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
    return `${(views / 1000000).toFixed(1)}M views`;
  };

  return (
    <div className="playlists-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Header Section */}
      <div className="playlists-header">
        <div className="header-left">
          <h1>Playlists</h1>
          <p style={{paddingLeft:'20px'}}>{Object.keys(playlists).length} playlists</p>
        </div>
        <button className="create-playlist-btn" onClick={handleCreatePlaylist}>
          <FaPlus />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="playlists-grid">
        {Object.entries(playlists).map(([playlistName, playlistData]) => (
          <div 
            key={playlistName} 
            className="playlist-card"
            onClick={() => handlePlaylistClick(playlistName, playlistData.videos || [])}
          >
            {/* Playlist Thumbnail */}
            <div className="playlist-thumbnail">
              <img src={playlistData.videos?.[0]?.thumbnailUrl || '/Minisallu.png'} alt={playlistName} />
              <div className="playlist-overlay">
                <div className="video-count">
                  <FaPlay />
                  <span>{playlistData.videos?.length || 0}</span>
                </div>
              </div>
              {playlistData.isPrivate && (
                <div className="private-badge">
                  <span>Private</span>
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="playlist-info">
              <h3 className="playlist-name">{playlistName}</h3>
              <p className="playlist-description">{playlistData.description}</p>
              
              {/* Playlist Metadata */}
              <div className="playlist-meta">
                <div className="meta-item">
                  <FaClock />
                  <span>{new Date(playlistData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span>{playlistData.videos?.length || 0} videos</span>
                </div>
              </div>

              {/* Playlist Actions */}
              <div className="playlist-actions">
                <button 
                  className="action-btn play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlistName, playlistData.videos || []);
                  }}
                >
                  <FaPlay />
                  <span>Play</span>
                </button>
                <button className="action-btn">
                  <FaShare />
                  <span>Share</span>
                </button>
                <button className="action-btn">
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlistName);
                  }}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Playlist Videos */}
      {selectedPlaylist && (
        <div className="selected-playlist-section">
          <div className="playlist-header">
            <h2>{selectedPlaylist.name}</h2>
            <button className="back-btn" onClick={() => setSelectedPlaylist(null)}>
              Back to Playlists
            </button>
          </div>
          
          <div className="videos-grid">
            {selectedPlaylist.videos?.map((video) => (
              <div key={video.videoId} className="video-card">
                <div className="video-thumbnail">
                  <img src={video.thumbnailUrl || '/Minisallu.png'} alt={video.title} />
                  
                  {/* Three Dots Menu */}
                  <div className="video-actions">
                    <button 
                      className="three-dots-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPlaylistMenu(showPlaylistMenu === video.videoId ? null : video.videoId);
                      }}
                    >
                      <FaEllipsisH />
                    </button>
                    
                    {showPlaylistMenu === video.videoId && (
                      <div className="playlist-dropdown">
                        <div className="dropdown-item" onClick={() => handleRemoveFromPlaylist(video, selectedPlaylist.name)}>
                          <FaTrash />
                          <span>Remove from Playlist</span>
                        </div>
                        <div className="dropdown-item" onClick={() => navigate(getNavigationRoute(video))}>
                          <FaPlay />
                          <span>Watch Video</span>
                        </div>
                        <div className="dropdown-item">
                          <FaShare />
                          <span>Share</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="video-info">
                  <h4 className="video-title">{video.title}</h4>
                  <p className="video-channel">{video.authorName}</p>
                  <p className="video-stats">{formatViews(video.views)} • {video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="create-playlist-modal">
            <div className="modal-header">
              <h2>Create New Playlist</h2>
              <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-content">
              <input 
                type="text" 
                placeholder="Playlist name" 
                className="playlist-name-input"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <textarea 
                placeholder="Description (optional)" 
                className="playlist-description-input"
                rows="3"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
              />
              <div className="privacy-options">
                <label className="privacy-option">
                  <input 
                    type="radio" 
                    name="privacy" 
                    value="public" 
                    checked={newPlaylistPrivacy === 'public'}
                    onChange={(e) => setNewPlaylistPrivacy(e.target.value)}
                  />
                  <span>Public</span>
                </label>
                <label className="privacy-option">
                  <input 
                    type="radio" 
                    name="privacy" 
                    value="private"
                    checked={newPlaylistPrivacy === 'private'}
                    onChange={(e) => setNewPlaylistPrivacy(e.target.value)}
                  />
                  <span>Private</span>
                </label>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button className="create-btn" onClick={handleCreateNewPlaylist}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
