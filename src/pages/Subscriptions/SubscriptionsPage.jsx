import React, { useMemo, useState } from 'react';
import { FaBell, FaFilter, FaSearch, FaThLarge, FaList, FaUsers, FaPlay, FaClock, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import './SubscriptionsPage.css';

const mockSubscriptions = [
  {
    id: 1,
    channelName: 'Tech Explorer',
    avatar: '/Minisallu.png',
    verified: true,
    category: 'tech',
    subscribers: '1.2M subscribers',
    notifications: 'All',
    latestVideo: {
      title: 'Master React in 20 Minutes',
      thumbnail: 'https://picsum.photos/600/340?random=11',
      views: '312K views',
      posted: '2 hours ago'
    }
  },
  {
    id: 2,
    channelName: 'Travel Frames',
    avatar: '/Minisallu.png',
    verified: false,
    category: 'travel',
    subscribers: '98K subscribers',
    notifications: 'Personalized',
    latestVideo: {
      title: 'Hidden Places in Kerala',
      thumbnail: 'https://picsum.photos/600/340?random=21',
      views: '54K views',
      posted: '1 day ago'
    }
  },
  {
    id: 3,
    channelName: 'Design Pulse',
    avatar: '/Minisallu.png',
    verified: true,
    category: 'design',
    subscribers: '420K subscribers',
    notifications: 'All',
    latestVideo: {
      title: 'Color Systems That Scale',
      thumbnail: 'https://picsum.photos/600/340?random=31',
      views: '189K views',
      posted: '4 days ago'
    }
  },
  {
    id: 4,
    channelName: 'Daily Coding',
    avatar: '/Minisallu.png',
    verified: true,
    category: 'tech',
    subscribers: '860K subscribers',
    notifications: 'None',
    latestVideo: {
      title: 'Build a Vite App from Scratch',
      thumbnail: 'https://picsum.photos/600/340?random=41',
      views: '77K views',
      posted: '6 hours ago'
    }
  }
];

const SubscriptionsPage = () => {
  const [activeItem, setActiveItem] = useState('Subscriptions');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mockSubscriptions.filter((channel) => {
      const matchesQuery =
        !query ||
        channel.channelName.toLowerCase().includes(query) ||
        channel.latestVideo.title.toLowerCase().includes(query);

      const matchesFilter = selectedFilter === 'all' || channel.category === selectedFilter;

      return matchesQuery && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="subscriptions-page" style={{ marginLeft: isSidebarCollapsed ? '72px' : '240px' }}>
      <Navbar
        activeItem={activeItem}
        onItemChange={setActiveItem}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <div className="subscriptions-header">
        <div className="header-left">
          <h1>Subscriptions</h1>
          <p>Keep up with your favorite creators</p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <FaThLarge />
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <FaList />
          </button>
        </div>
      </div>

      <div className="subscriptions-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels or videos..."
          />
        </div>

        <div className="filter-section">
          <FaFilter className="filter-icon" />
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="tech">Tech</option>
            <option value="travel">Travel</option>
            <option value="design">Design</option>
          </select>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{mockSubscriptions.length} Channels</h3>
            <p>Total subscriptions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaPlay />
          </div>
          <div className="stat-info">
            <h3>{filteredSubscriptions.length} Active</h3>
            <p>Matching your filters</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBell />
          </div>
          <div className="stat-info">
            <h3>2 Notifications On</h3>
            <p>Never miss an upload</p>
          </div>
        </div>
      </div>

      <div className={`subscriptions-container ${viewMode}`}>
        {filteredSubscriptions.map((channel) => (
          <article className="subscription-card" key={channel.id}>
            <div className="channel-header">
              <div className="channel-info">
                <img src={channel.avatar} alt={channel.channelName} className="channel-avatar" />
                <div className="channel-details">
                  <h3 className="channel-name">
                    {channel.channelName}
                    {channel.verified && <FaCheckCircle className="verified-badge" />}
                  </h3>
                  <p>{channel.subscribers}</p>
                </div>
              </div>
              <div className="notification-status">
                <FaBell /> {channel.notifications}
              </div>
            </div>

            <div className="latest-video">
              <img src={channel.latestVideo.thumbnail} alt={channel.latestVideo.title} className="video-thumbnail" />
              <div className="video-meta">
                <h4>{channel.latestVideo.title}</h4>
                <p>{channel.latestVideo.views}</p>
                <p>
                  <FaClock /> {channel.latestVideo.posted}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
