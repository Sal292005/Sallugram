import React, { useState, useEffect } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebase';
import './SubscribeButton.css';

const SubscribeButton = ({ channelId, channelName, channelAvatar, onSubscriptionChange }) => {
  const [user] = useAuthState(auth);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is subscribed to this channel
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !channelId) return;
      
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const subscriptions = userData.subscriptions || [];
          const subscribed = subscriptions.some(sub => sub.channelId === channelId);
          setIsSubscribed(subscribed);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [user, channelId]);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please login to subscribe to channels');
      return;
    }

    console.log('Subscribe button clicked:', { channelId, channelName, isSubscribed });
    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      
      if (isSubscribed) {
        // Unsubscribe
        console.log('Unsubscribing from channel:', channelName);
        await updateDoc(userDocRef, {
          subscriptions: arrayRemove({
            channelId,
            channelName,
            channelAvatar,
            subscribedAt: new Date()
          })
        });
        setIsSubscribed(false);
        console.log('Unsubscribed from:', channelName);
      } else {
        // Subscribe
        console.log('Subscribing to channel:', channelName);
        await updateDoc(userDocRef, {
          subscriptions: arrayUnion({
            channelId,
            channelName,
            channelAvatar,
            subscribedAt: new Date()
          })
        });
        setIsSubscribed(true);
        console.log('Subscribed to:', channelName);
      }

      // Notify parent component
      if (onSubscriptionChange) {
        onSubscriptionChange(!isSubscribed);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Error updating subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
      onClick={handleSubscribe}
      disabled={isLoading || !user}
    >
      {isLoading ? (
        <span className="loading-text">Loading...</span>
      ) : (
        <>
          {isSubscribed ? (
            <>
              <FaBellSlash />
              <span>Subscribed</span>
            </>
          ) : (
            <>
              <FaBell />
              <span>Subscribe</span>
            </>
          )}
        </>
      )}
    </button>
  );
};

export default SubscribeButton;
