import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaHeart, FaComment, FaShare, FaBookmark, FaEllipsisH, FaSearch, FaFilter, FaPlus, FaFire } from 'react-icons/fa';
import { firestore, storage } from '../../firebase/firebase';
import { arrayRemove, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import './PostsPage.css';
import Navbar from '../../components/Navbar/Navbar';

const PostsPage = () => {
  const [activeItem, setActiveItem] = useState('Posts');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [user, authLoading] = useAuthState(auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const menuRef = useRef(null);

  // Handle URL search parameters (Navbar search)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Fetch posts from Firestore
  useEffect(() => {
    if (authLoading) return;
    
    setLoading(true);
    const q = query(
      collection(firestore, 'posts'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(snapshot.docs.map(async documentSnapshot => {
        const postData = {
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
          createdAt: documentSnapshot.data().createdAt?.toDate() || new Date()
        };
        
        return postData;
      }));
      
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Check if posts are already liked
  useEffect(() => {
    if (!user || authLoading || posts.length === 0) return;

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
            if (item.type === 'post') {
              likedMap[item.videoId] = true;
            }
          });
          
          setLikedPosts(likedMap);
        }
      } catch (error) {
        console.error('Error checking liked status:', error);
      }
    };

    checkLikedStatus();
  }, [user, authLoading, posts]);

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  const toggleLike = async (postId) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;
      
      // Get current user document
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : { youLiked: [] };
      const youLiked = userData.youLiked || [];
      
      const likedEntry = {
        videoId: post.id,
        title: post.title,
        thumbnailUrl: post.imageUrl || post.thumbnailUrl || 'https://picsum.photos/400/225?random=' + post.id,
        duration: '0:00', // Posts don't have duration
        views: post.views || 0,
        authorName: post.authorName || post.authorProfile?.displayName || 'Unknown',
        likedAt: new Date().toISOString(),
        type: 'post' // Add type to distinguish posts
      };

      let updatedYouLiked;
      if (likedPosts[postId]) {
        // Remove from liked posts
        updatedYouLiked = youLiked.filter(item => item.videoId !== postId);
        setLikedPosts(prev => ({ ...prev, [postId]: false }));
      } else {
        // Add to liked posts
        updatedYouLiked = [likedEntry, ...youLiked];
        setLikedPosts(prev => ({ ...prev, [postId]: true }));
      }

      // Update the entire youLiked array
      await updateDoc(userDocRef, {
        youLiked: updatedYouLiked
      });

      // Also update post likes count in posts collection
      const postDocRef = doc(firestore, 'posts', postId);
      await updateDoc(postDocRef, {
        likes: likedPosts[postId] ? (post.likes || 0) - 1 : (post.likes || 0) + 1
      });

    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  useEffect(() => {
    if (!openMenuPostId) return;

    const handleDocMouseDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpenMenuPostId(null);
      }
    };

    document.addEventListener('mousedown', handleDocMouseDown);
    return () => document.removeEventListener('mousedown', handleDocMouseDown);
  }, [openMenuPostId]);

  const handleDeletePost = async (post) => {
    console.log('Delete post clicked:', post);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found');
      return;
    }
    if (post.authorId !== user.uid) {
      console.log('Not post author:', post.authorId, 'vs', user.uid);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) {
      console.log('Delete cancelled by user');
      return;
    }
    if (deletingPostId) {
      console.log('Already deleting:', deletingPostId);
      return;
    }

    console.log('Starting delete process for post:', post.id);
    setDeletingPostId(post.id);
    try {
      try {
        console.log('Deleting image from storage...');
        const imageRef = ref(storage, `posts/${post.id}`);
        await deleteObject(imageRef);
        console.log('Image deleted successfully');
      } catch (error) {
        console.warn('Post image delete skipped/failed:', error);
      }

      console.log('Deleting post document...');
      await deleteDoc(doc(firestore, 'posts', post.id));
      console.log('Post document deleted successfully');

      console.log('Updating user posts array...');
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        posts: arrayRemove(post.id),
      });
      console.log('User posts array updated');

      console.log('Updating local state...');
      setPosts((prev) => {
        const newPosts = prev.filter((p) => p.id !== post.id);
        console.log('Posts filtered:', newPosts);
        return newPosts;
      });
      setOpenMenuPostId(null);
      console.log('Delete process completed successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post: ' + error.message);
    } finally {
      setDeletingPostId(null);
      console.log('Delete process ended');
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const matchesSearch = 
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.authorName && post.authorName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const postTime = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const diffInMs = now - postTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return postTime.toLocaleDateString();
  };



  return (
    <div className="posts-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />

      <div className="main-content" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
        {/* Header Section */}
        <div className="posts-header">
          <div className="header-left">
            <h1>Posts</h1>
          </div>
          <div className="header-right">
            <button className="create-post-btn" onClick={handleCreatePost}>
              <FaPlus />
              Create Post
            </button>
          </div>
        </div>

        <div className='post-header'>
          <h1>Latest</h1>
          <FaFire />
          <div className="filter-section">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search posts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner">Loading posts...</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="empty-state">
            <h3>No posts found</h3>
            <p>Be the first to create a post!</p>
            <button className="create-first-post-btn" onClick={handleCreatePost}>
              <FaPlus />
              Create First Post
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && filteredPosts.length > 0 && (
          <div className="posts-grid">
          {filteredPosts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="author-info">
                  <div className="author-avatar">
                    {post.authorProfile?.photoURL ? (
                      <img 
                        src={post.authorProfile.photoURL} 
                        alt={post.authorName || 'User'} 
                        className="author-avatar-img"
                      />
                    ) : (
                      <div className="author-avatar-letter">
                        {post.authorName?.charAt(0)?.toUpperCase() || 
                         post.authorProfile?.displayName?.charAt(0)?.toUpperCase() || 
                         post.authorEmail?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="author-details">
                    <h3>
                      {post.authorProfile?.displayName || 
                       post.authorName || 
                       'Anonymous'}
                    </h3>
                    <p className="post-timestamp">{formatTimestamp(post.createdAt)}</p>
                  </div>
                </div>
                <div className="post-menu-wrap" ref={openMenuPostId === post.id ? menuRef : null}>
                  <button
                    className="post-menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Menu clicked for post:', post.id);
                      console.log('Current user:', user);
                      console.log('Post author:', post.authorId);
                      console.log('Is author:', user && post.authorId === user.uid);
                      setOpenMenuPostId((prev) => (prev === post.id ? null : post.id));
                    }}
                    aria-label="Post options"
                  >
                    <FaEllipsisH />
                  </button>

                  {openMenuPostId === post.id && (
                    <div className="post-menu-dropdown">
                      {user ? (
                        post.authorId === user.uid ? (
                          <button
                            className="post-menu-item post-menu-item-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post);
                            }}
                            disabled={deletingPostId === post.id}
                          >
                            {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                          </button>
                        ) : (
                          <div className="post-menu-item" style={{ color: '#888', cursor: 'default', fontSize: '13px' }}>
                            Not your post
                          </div>
                        )
                      ) : (
                        <div className="post-menu-item" style={{ color: '#888', cursor: 'default', fontSize: '13px' }}>
                          Please login
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="post-content">
                <h2 className="post-title">{post.title}</h2>
                <p className="post-description">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="post-category">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="category-tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="post-image" />
                )}
              </div>

              <div className="post-actions">
                <button className={`action-btn like-btn ${likedPosts[post.id] ? 'active' : ''}`} onClick={() => toggleLike(post.id)}>
                  <FaHeart />
                  <span>{post.likes || 0}</span>
                </button>
                <button className="action-btn comment-btn">
                  <FaComment />
                  <span>{post.comments || 0}</span>
                </button>
                <button className="action-btn share-btn">
                  <FaShare />
                  <span>Share</span>
                </button>
                <button className="action-btn bookmark-btn">
                  <FaBookmark />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

            </div>
    </div>
  );
};

export default PostsPage;
