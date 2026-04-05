import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaTimes, FaEye, FaClock, FaCalendar, FaHashtag, FaGlobe } from 'react-icons/fa';
import { storage, firestore } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './CreateVideo.css';

const CreateVideo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [duration, setDuration] = useState('0:00');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
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
      
      // Validate file size (max 500MB for videos)
      if (file.size > 500 * 1024 * 1024) {
        setError('Video size should be less than 500MB');
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

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for thumbnail');
        return;
      }
      
      // Validate file size (max 10MB for thumbnails)
      if (file.size > 10 * 1024 * 1024) {
        setError('Thumbnail size should be less than 10MB');
        return;
      }
      
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setError('');
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

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    setError('');
  };

  const uploadVideoToStorage = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
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
      setError('You must be logged in to create a video');
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
      
      // Create video document
      const videoData = {
        title: title.trim(),
        description: description.trim(),
        videoUrl: videoUrl,
        thumbnailUrl: thumbnailUrl,
        duration: duration,
        category: category.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        visibility: visibility,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0,
        views: 0,
        type: 'video'
      };
      
      console.log('Creating video with data:', videoData);
      
      const docRef = await addDoc(collection(firestore, 'videos'), videoData);
      console.log('Video created with ID:', docRef.id);
      
      // Navigate to videos page
      navigate('/videos');
    } catch (error) {
      console.error('Error creating video:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.message.includes('storage/unauthorized')) {
        setError('Permission denied for video upload. Check Storage rules.');
      } else if (error.message.includes('permission-denied')) {
        setError('Permission denied for creating video. Check Firestore rules.');
      } else if (error.message.includes('Missing or insufficient permissions')) {
        setError('Permission denied. Please check both Storage and Firestore rules.');
      } else {
        setError('Failed to create video. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-video-container">
      <div className="create-video-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h1>Create Video</h1>
      </div>

      <div className="create-video-content">
        <form onSubmit={handleSubmit}>
          <div className="upload-section">
            <div className="video-upload-area">
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
                    <p>Upload your video</p>
                    <p className="upload-hint">MP4, WebM, or OGG</p>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="video"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-button"
                onClick={() => document.getElementById('video').click()}
              >
                {videoPreview ? 'Change Video' : 'Upload Video'}
              </button>
            </div>

            <div className="thumbnail-upload-area">
              <div className="thumbnail-preview-container">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="thumbnail-preview" />
                ) : (
                  <div className="thumbnail-upload-placeholder">
                    <div className="thumbnail-icon">
                      <FaVideo />
                    </div>
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
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="upload-button"
                onClick={() => document.getElementById('thumbnail').click()}
              >
                {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="news">News</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                  <option value="comedy">Comedy</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>
                <FaHashtag />
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags to help viewers find your video..."
              />
            </div>

            <div className="form-group">
              <label>
                <FaGlobe />
                Visibility
              </label>
              <div className="visibility-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <span>Public</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="unlisted"
                    checked={visibility === 'unlisted'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <span>Unlisted</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                  />
                  <span>Private</span>
                </label>
              </div>
            </div>

            {videoPreview && (
              <div className="video-info">
                <div className="info-item">
                  <FaClock />
                  <span>Duration: {duration}</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleBack}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVideo;
