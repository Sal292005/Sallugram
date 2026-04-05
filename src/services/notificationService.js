import { firestore } from '../firebase/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.onNotificationUpdate = null;
  }

  // Initialize notification service
  init(onNotificationUpdate) {
    this.onNotificationUpdate = onNotificationUpdate;
    this.startListening();
  }

  // Start listening for new content uploads
  startListening() {
    // Listen for new posts
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          this.handleNewContent('post', change.doc);
        }
      });
    });

    // Listen for new videos
    const videosQuery = query(
      collection(firestore, 'videos'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const videosUnsubscribe = onSnapshot(videosQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          this.handleNewContent('video', change.doc);
        }
      });
    });

    // Listen for new shorts
    const shortsQuery = query(
      collection(firestore, 'shorts'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const shortsUnsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          this.handleNewContent('short', change.doc);
        }
      });
    });

    // Listen for subscription updates (for real-time subscription notifications)
    this.listenForSubscriptionUpdates();

    this.listeners.push(postsUnsubscribe, videosUnsubscribe, shortsUnsubscribe);
  }

  // Listen for subscription updates
  listenForSubscriptionUpdates() {
    // This would require a more complex setup with user-specific queries
    // For now, we'll handle this when users interact with subscribe buttons
    console.log('Subscription listener initialized');
  }

  // Handle new content upload
  async handleNewContent(type, docSnapshot) {
    const data = docSnapshot.data();
    const now = new Date();
    
    // Only show notification if content was created in the last 30 seconds
    if (data.createdAt) {
      const contentTime = data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate();
      const timeDiff = now - contentTime;
      
      if (timeDiff > 30000) { // 30 seconds
        return; // Don't show notification for older content
      }
    }

    // Get author information
    let authorName = 'Unknown';
    if (data.authorName) {
      authorName = data.authorName;
    } else if (data.authorId) {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', data.authorId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          authorName = userData.displayName || userData.username || 'Unknown';
        }
      } catch (error) {
        console.error('Error fetching author info:', error);
      }
    }

    const notification = {
      id: `${type}-${docSnapshot.id}-${Date.now()}`,
      type: type,
      title: data.title || 'Untitled',
      authorName: authorName,
      authorId: data.authorId,
      timestamp: data.createdAt || now,
      read: false,
      contentId: docSnapshot.id
    };

    this.addNotification(notification);
  }

  // Add new notification
  addNotification(notification) {
    // Check if notification already exists
    const exists = this.notifications.find(n => 
      n.contentId === notification.contentId && n.type === notification.type
    );
    
    if (!exists) {
      this.notifications.unshift(notification);
      this.updateListeners();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.updateListeners();
    }
  }

  // Clear notification
  async clearNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateListeners();
  }

  // Clear all notifications
  async clearAll() {
    this.notifications = [];
    this.updateListeners();
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Update listeners
  updateListeners() {
    if (this.onNotificationUpdate) {
      this.onNotificationUpdate([...this.notifications]);
    }
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
