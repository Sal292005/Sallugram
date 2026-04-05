import React, { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebase';
import './WatchLaterButton.css';

const WatchLaterButton = ({ videoId, videoTitle, videoThumbnail, videoDuration, videoViews, channelName, videoType }) => {
  const [user] = useAuthState(auth);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if video is in watch later
  useEffect(() => {
    const checkWatchLater = async () => {
      if (!user || !videoId) return;
      
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const watchLater = userData.watchLater || [];
          const videoExists = watchLater.some(video => (video.id || video.videoId) === videoId);
          setIsInWatchLater(videoExists);
        }
      } catch (error) {
        console.error('Error checking watch later:', error);
      }
    };

    checkWatchLater();
  }, [user, videoId]);

  const handleWatchLater = async () => {
    if (!user) {
      alert('Please login to add videos to watch later');
      return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const latestUserDoc = await getDoc(userDocRef);
      const currentWatchLater = latestUserDoc.exists() ? (latestUserDoc.data()?.watchLater || []) : [];

      if (isInWatchLater) {
        // Remove from watch later
        const updatedWatchLater = currentWatchLater.filter((video) => (video.id || video.videoId) !== videoId);
        await setDoc(userDocRef, { watchLater: updatedWatchLater }, { merge: true });
        setIsInWatchLater(false);
        console.log('Removed from watch later:', videoTitle);
      } else {
        // Add to watch later
        const updatedWatchLater = [
          {
            id: videoId,
            videoId: videoId,
            title: videoTitle,
            thumbnailUrl: videoThumbnail,
            duration: videoDuration,
            views: videoViews,
            channelName: channelName,
            authorName: channelName,
            type: videoType || 'video',
            addedAt: new Date()
          },
          ...currentWatchLater.filter((video) => (video.id || video.videoId) !== videoId)
        ];

        await setDoc(userDocRef, { watchLater: updatedWatchLater }, { merge: true });
        setIsInWatchLater(true);
        console.log('Added to watch later:', videoTitle);
      }
    } catch (error) {
      console.error('Error updating watch later:', error);
      alert('Error updating watch later. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`watch-later-btn ${isInWatchLater ? 'in-watch-later' : ''}`}
      onClick={handleWatchLater}
      disabled={isLoading || !user}
      title={isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
    >
      {isLoading ? (
        <span className="loading-text">Loading...</span>
      ) : (
        <>
          <FaClock />
          <span>{isInWatchLater ? 'Remove from Watch Later' : 'Watch Later'}</span>
        </>
      )}
    </button>
  );
};

export default WatchLaterButton;
