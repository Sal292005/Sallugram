import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaTimes, FaMusic, FaHashtag } from 'react-icons/fa';
import { storage, firestore } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './CreateShort.css';

const CreateShort = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [duration, setDuration] = useState('0:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }
      
      // Validate file size (max 100MB for videos)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video size should be less than 100MB');
        return;
      }
      
      setSelectedVideo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
        setError('');
        
        // Create video element to get duration
        const video = document.createElement('video');
        video.src = reader.result;
        video.addEventListener('loadedmetadata', () => {
          const minutes = Math.floor(video.duration / 60);
          const seconds = Math.floor(video.duration % 60);
          setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setDuration('0:00');
    setError('');
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB for images)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    setError('');
  };

  const uploadVideoToStorage = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `shorts/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const uploadThumbnailToStorage = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `thumbnails/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a short');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    if (!selectedVideo) {
      setError('Please select a video');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('User authenticated:', user);
      console.log('User UID:', user.uid);
      console.log('User email:', user.email);
      
      // Upload video to Firebase Storage
      console.log('Uploading video to Firebase Storage...');
      const videoUrl = await uploadVideoToStorage(selectedVideo);
      console.log('Video uploaded successfully:', videoUrl);
      
      // Upload thumbnail to Firebase Storage if provided
      let thumbnailUrl = null;
      if (thumbnail) {
        console.log('Uploading thumbnail to Firebase Storage...');
        thumbnailUrl = await uploadThumbnailToStorage(thumbnail);
        console.log('Thumbnail uploaded successfully:', thumbnailUrl);
      }
      
      // Create short document
      const shortData = {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        duration: duration,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        views: 0,
      };
      
      console.log('Creating short with data:', shortData);
      
      const docRef = await addDoc(collection(firestore, 'shorts'), shortData);
      console.log('Short created with ID:', docRef.id);
      
      // Navigate to posts page
      navigate('/shorts');
    } catch (error) {
      console.error('Error creating short:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.message.includes('storage/unauthorized')) {
        setError('Permission denied for video upload. Check Storage rules.');
      } else if (error.message.includes('permission-denied')) {
        setError('Permission denied for creating short. Check Firestore rules.');
      } else if (error.message.includes('Missing or insufficient permissions')) {
        setError('Permission denied. Please check both Storage and Firestore rules.');
      } else {
        setError('Failed to create short. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-short-container">
      <div className="create-short-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h1>Create Short</h1>
      </div>

      <div className="create-short-content">
        <form onSubmit={handleSubmit}>
          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="upload-sections-container">
          <div className="video-upload-section">
            <div className="video-preview-container">
              {videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="video-preview"
                />
              ) : (
                <div className="video-upload-placeholder">
                  <FaVideo />
                  <p>Upload your short video</p>
                  <p className="upload-hint">Maximum 60 seconds</p>
                </div>
              )}
            </div>
            
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="video-upload-button"
              onClick={() => document.getElementById('video').click()}
              disabled={isLoading}
            >
              {videoPreview ? 'Change Short' : 'Upload Short'}
            </button>
            
            {videoPreview && (
              <div className="video-info">
                <div className="info-item">
                  <FaVideo />
                  <span>Duration: {duration}</span>
                </div>
                <button
                  type="button"
                  className="remove-video"
                  onClick={removeVideo}
                  disabled={isLoading}
                >
                  <FaTimes />
                  Remove Video
                </button>
              </div>
            )}
          </div>

          <div className="thumbnail-upload-section">
            <div className="thumbnail-preview-container">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="thumbnail-preview" />
              ) : (
                <div className="thumbnail-upload-placeholder">
                  <FaVideo />
                  <p>Upload thumbnail</p>
                  <p className="upload-hint">JPG, PNG, or GIF</p>
                </div>
              )}
            </div>
            
            <input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="thumbnail-upload-button"
              onClick={() => document.getElementById('thumbnail').click()}
              disabled={isLoading}
            >
              {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
            </button>
            
            {thumbnailPreview && (
              <div className="thumbnail-info">
                <button
                  type="button"
                  className="remove-thumbnail"
                  onClick={removeThumbnail}
                  disabled={isLoading}
                >
                  <FaTimes />
                  Remove Thumbnail
                </button>
              </div>
            )}
          </div>
        </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your short a catchy title..."
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your short..."
                rows="3"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>
                <FaHashtag />
                Tags
              </label>
              <input
                type="text"
                placeholder="Add hashtags to reach more viewers..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleBack}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Short...' : 'Create Short'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShort;
