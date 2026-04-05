import { useEffect, useRef, useState } from 'react';
import {
  FaSearch, FaTrash, FaPlay, FaFilter, FaFilm
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './HistoryPage.css';
import Navbar from '../../components/Navbar/Navbar';

const HistoryPage = () => {
  const [activeItem, setActiveItem] = useState('History');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [watchHistory, setWatchHistory] = useState([]);
  const [resolvedThumbnails, setResolvedThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, authLoading] = useAuthState(auth);
  const hasReceivedServerHistorySnapshotRef = useRef(false);
  const navigate = useNavigate();

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isLikelyVideoFileUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return /\.mp4(\?|$)/i.test(url);
  };

  const getNavigationRoute = (item) => {
    const type = item.type || (item.thumbnailUrl?.includes('shorts') ? 'short' : 'video');
    switch (type) {
      case 'short': return `/short/${item.videoId}`;
      case 'post':  return `/post/${item.videoId}`;
      default:      return `/video/${item.videoId}`;
    }
  };

  const getThumbnailUrl = (item) => {
    if (item.videoId && resolvedThumbnails[item.videoId]) {
      return resolvedThumbnails[item.videoId];
    }
    if (item.thumbnailUrl) {
      if (isLikelyVideoFileUrl(item.thumbnailUrl)) {
        return item.thumbnail || `https://picsum.photos/400/225?random=${item.videoId || item.id}`;
      }
      return item.thumbnailUrl;
    }
    if (item.thumbnail) return item.thumbnail;
    if (item.videoUrl)  return item.videoUrl;
    return `https://picsum.photos/400/225?random=${item.videoId || item.id}`;
  };

  const parseTimestamp = (ts) => {
    if (typeof ts === 'string')                        return new Date(ts);
    if (ts && typeof ts.toDate === 'function')         return ts.toDate();
    if (ts instanceof Date)                            return ts;
    return new Date(ts);
  };

  const formatDate = (timestamp) => {
    const date = parseTimestamp(timestamp);
    if (isNaN(date.getTime())) return 'Unknown time';
    const diffMs    = Date.now() - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays  = Math.floor(diffHours / 24);
    if (diffHours < 1)  return 'Today';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays  < 7)  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (duration) => duration || '0:00';

  // ── Resolve legacy .mp4 thumbnails ───────────────────────────────────────

  useEffect(() => {
    const resolveMissingThumbnails = async () => {
      const needsResolution = watchHistory.filter(
        (item) => item?.videoId && isLikelyVideoFileUrl(item?.thumbnailUrl) && !resolvedThumbnails[item.videoId]
      );
      if (needsResolution.length === 0) return;

      const uniqueIds = [...new Set(needsResolution.map((i) => i.videoId))];
      try {
        const entries = await Promise.all(
          uniqueIds.map(async (id) => {
            const snap = await getDoc(doc(firestore, 'videos', id));
            return [id, snap.exists() ? snap.data()?.thumbnailUrl : null];
          })
        );
        const map = entries.reduce((acc, [id, url]) => {
          if (url && !isLikelyVideoFileUrl(url)) acc[id] = url;
          return acc;
        }, {});
        if (Object.keys(map).length > 0) {
          setResolvedThumbnails((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('[History] Error resolving legacy thumbnails:', err);
      }
    };
    resolveMissingThumbnails();
  }, [watchHistory]); // removed resolvedThumbnails dep to prevent infinite loop

  // ── Firestore listener ───────────────────────────────────────────────────

  useEffect(() => {
    if (authLoading || !user) {
      hasReceivedServerHistorySnapshotRef.current = false;
      setWatchHistory([]);
      setLoading(false);
      return;
    }

    hasReceivedServerHistorySnapshotRef.current = false;
    setLoading(true);

    const userDocRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata?.fromCache && !hasReceivedServerHistorySnapshotRef.current) return;
        if (!snap.metadata?.fromCache) hasReceivedServerHistorySnapshotRef.current = true;

        if (snap.exists()) {
          const history = Array.isArray(snap.data().watchHistory) ? snap.data().watchHistory : [];
          const sorted = [...history].sort((a, b) => parseTimestamp(b.watchedAt) - parseTimestamp(a.watchedAt));
          setWatchHistory(sorted);
        } else {
          setWatchHistory([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[History] Snapshot error:', err);
        setWatchHistory([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authLoading, user]);

  // ── Filter logic ─────────────────────────────────────────────────────────

  const applyDateFilter = (items) => {
    if (selectedFilter === 'all') return items;
    const now = Date.now();
    const thresholds = {
      today: 24 * 60 * 60 * 1000,
      week:  7  * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year:  365 * 24 * 60 * 60 * 1000,
    };
    const limit = thresholds[selectedFilter];
    if (!limit) return items;
    return items.filter((item) => {
      const date = parseTimestamp(item.watchedAt);
      return !isNaN(date.getTime()) && now - date.getTime() <= limit;
    });
  };

  const filteredHistory = applyDateFilter(
    watchHistory.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const shortsItems = filteredHistory.filter(
    (item) => item.type === 'short' || item.thumbnailUrl?.includes('shorts')
  );
  const videoItems = filteredHistory.filter(
    (item) => (!item.type || item.type === 'video') && !item.thumbnailUrl?.includes('shorts')
  );

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleItemClick = (item) => {
    setActiveItem(item);
    const routes = {
      Home: '/home', Videos: '/videos', Shorts: '/shorts',
      Posts: '/posts', Explore: '/explore', Settings: '/settings',
      'Send Feedback': '/feedback', Help: '/help',
    };
    if (routes[item]) navigate(routes[item]);
  };

  // FIX: arrayRemove needs the actual objects, not just IDs
  const handleDeleteSelected = async () => {
    if (!user) return;
    try {
      const toDelete = watchHistory.filter((item) => selectedItems.has(item.videoId));
      if (toDelete.length === 0) return;
      await updateDoc(doc(firestore, 'users', user.uid), {
        watchHistory: arrayRemove(...toDelete),
      });
      setSelectedItems(new Set());
    } catch (err) {
      console.error('Error deleting history items:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(firestore, 'users', user.uid), { watchHistory: [] });
      setSelectedItems(new Set());
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="history-page">
      <Navbar
        activeItem={activeItem}
        onItemChange={handleItemClick}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <div className="history-header">
        <div className="header-left"><h1>History</h1></div>
        <div className="header-right">
          <button className="clear-history-btn" onClick={handleClearHistory}>
            <FaTrash /> Clear All History
          </button>
        </div>
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-section">
          <FaFilter className="filter-icon" />
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
            <option value="all">All History</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">Loading watch history...</div>
        </div>
      )}

      {!loading && watchHistory.length === 0 && (
        <div className="empty-history-container">
          <p>No watch history yet. Start watching to see it here!</p>
        </div>
      )}

      {!loading && watchHistory.length > 0 && (
        <>
          {selectedItems.size > 0 && (
            <div className="selection-indicator" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected</span>
              <button className="delete-selected-btn" onClick={handleDeleteSelected}>
                <FaTrash /> Delete Selected
              </button>
            </div>
          )}

          <div className="history-content">

            {/* Shorts Section */}
            {shortsItems.length > 0 && (
              <div className="content-type-section">
                <div className="type-header">
                  <FaFilm className="type-icon short" />
                  <h2 className="type-title">Shorts</h2>
                  <span className="type-count">({shortsItems.length} shorts)</span>
                </div>
                <div className="shorts-horizontal-scroll">
                  {shortsItems.map((item) => (
                    <div
                      key={item.videoId}
                      className={`short-card ${selectedItems.has(item.videoId) ? 'selected' : ''}`}
                      onClick={() => navigate(getNavigationRoute(item))}
                    >
                      <div className="short-thumbnail">
                        <img
                          src={getThumbnailUrl(item)}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/400/225?random=${item.videoId || item.id}`;
                          }}
                        />
                        <div className="thumbnail-footer">
                          <span className="overlay-title">{item.title}</span>
                          <div className="footer-right">
                            <span className="duration">{formatDuration(item.duration)}</span>
                            <button className="delete-icon" onClick={(e) => { e.stopPropagation(); handleSelectItem(item.videoId); }}>
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videoItems.length > 0 && (
              <div className="content-type-section">
                <div className="type-header">
                  <FaPlay className="type-icon video" />
                  <h2 className="type-title">Videos</h2>
                  <span className="type-count">({videoItems.length} videos)</span>
                </div>
                <div className="videos-grid">
                  {videoItems.map((item) => (
                    <div
                      key={item.videoId}
                      className={`video-card ${selectedItems.has(item.videoId) ? 'selected' : ''}`}
                      onClick={() => navigate(getNavigationRoute(item))}
                    >
                      <div className="video-thumbnail">
                        <img
                          src={getThumbnailUrl(item)}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/400/225?random=${item.videoId || item.id}`;
                          }}
                        />
                        <div className="thumbnail-footer">
                          <span className="overlay-title">{item.title}</span>
                          <div className="footer-right">
                            <span className="duration">{formatDuration(item.duration)}</span>
                            <button className="delete-icon" onClick={(e) => { e.stopPropagation(); handleSelectItem(item.videoId); }}>
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="watched-progress" style={{ width: item.watchProgress || '0%' }} />
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {!loading && watchHistory.length > 0 && (
        <div className="load-more-section">
          <button className="load-more-btn">Load More</button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;