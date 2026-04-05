import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, firestore } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { FaArrowLeft, FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import './CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setError('');
  };

  const uploadImageToStorage = async (file) => {
    if (!file) return null;
    
    const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }
    
    console.log('User authenticated:', user);
    console.log('User UID:', user.uid);
    console.log('User email:', user.email);
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      setError('Please enter content');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Upload image if selected
      let imageUrl = null;
      if (imageFile) {
        console.log('Uploading image to Firebase Storage...');
        imageUrl = await uploadImageToStorage(imageFile);
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // Create post document
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageUrl: imageUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: 0
      };
      
      console.log('Creating post with data:', postData);
      
      const docRef = await addDoc(collection(firestore, 'posts'), postData);
      console.log('Post created with ID:', docRef.id);
      
      // Navigate to posts page
      navigate('/posts');
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.message.includes('storage/unauthorized')) {
        setError('Permission denied for image upload. Check Storage rules.');
      } else if (error.message.includes('permission-denied')) {
        setError('Permission denied for creating post. Check Firestore rules.');
      } else if (error.message.includes('Missing or insufficient permissions')) {
        setError('Permission denied. Please check both Storage and Firestore rules.');
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h1>Create Post</h1>
      </div>

      <div className="create-post-content">
        <form onSubmit={handleSubmit}>
          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows="6"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma separated)..."
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Cover Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="image-upload-button"
                onClick={() => document.getElementById('image').click()}
                disabled={isLoading}
              >
                <FaImage />
                {selectedImage ? 'Change Image' : 'Add Image'}
              </button>
              
              {selectedImage && (
                <div className="image-preview">
                  <img src={selectedImage} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={removeImage}
                    disabled={isLoading}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
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
              {isLoading ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
