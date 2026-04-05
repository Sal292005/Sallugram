import React, { useState } from 'react';
import { FaPlay, FaPause, FaTrash, FaFolder, FaFileVideo, FaClock, FaCheckCircle, FaTimesCircle, FaEllipsisH, FaSearch, FaFilter, FaShare, FaEdit } from 'react-icons/fa';
import './DownloadsPage.css';
import Navbar from '../../components/Navbar/Navbar';

const DownloadsPage = () => {
  const [activeItem, setActiveItem] = useState('Downloads');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedItems, setSelectedItems] = useState(new Set());

  const downloads = [
    {
      id: 1,
      title: 'Amazing Tech Discovery',
      creator: 'Tech Explorer',
      size: '124 MB',
      duration: '0:15',
      thumbnail: '/Minisallu.png',
      downloadDate: '2 hours ago',
      progress: 100,
      status: 'completed',
      quality: '1080p',
      format: 'MP4'
    },
    {
      id: 2,
      title: 'Design Inspiration 2024',
      creator: 'Creative Mind',
      size: '256 MB',
      duration: '0:30',
      thumbnail: '/Minisallu.png',
      downloadDate: '4 hours ago',
      progress: 100,
      status: 'completed',
      quality: '720p',
      format: 'MP4'
    },
    {
      id: 3,
      title: 'Space Exploration Update',
      creator: 'Science Daily',
      size: '512 MB',
      duration: '0:45',
      thumbnail: '/Minisallu.png',
      downloadDate: '6 hours ago',
      progress: 75,
      status: 'downloading',
      quality: '1080p',
      format: 'MP4'
    },
    {
      id: 4,
      title: 'Cooking Masterclass',
      creator: 'Food Channel',
      size: '189 MB',
      duration: '1:00',
      thumbnail: '/Minisallu.png',
      downloadDate: '8 hours ago',
      progress: 0,
      status: 'pending',
      quality: '720p',
      format: 'MP4'
    },
    {
      id: 5,
      title: 'Music Collection',
      creator: 'Music Producer',
      size: '89 MB',
      duration: '3:45',
      thumbnail: '/Minisallu.png',
      downloadDate: '1 day ago',
      progress: 100,
      status: 'completed',
      quality: '1080p',
      format: 'MP4'
    }
  ];

  const filters = ['Downloading', 'Completed', 'Failed'];

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         download.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                          (selectedFilter === 'Downloading' && download.status === 'downloading') ||
                          (selectedFilter === 'Completed' && download.status === 'completed') ||
                          (selectedFilter === 'Failed' && download.status === 'failed');
    return matchesSearch && matchesFilter;
  });

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredDownloads.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredDownloads.map(d => d.id)));
    }
  };

  const handleDeleteSelected = () => {
    console.log('Deleting selected items:', Array.from(selectedItems));
    // Handle deletion logic here
    setSelectedItems(new Set());
  };

  const handlePlayVideo = (download) => {
    console.log('Playing video:', download.title);
    // Add play functionality here
    alert(`Playing: ${download.title}`);
  };

  const handleShareVideo = (download) => {
    console.log('Sharing video:', download.title);
    // Add share functionality here
    alert(`Sharing: ${download.title}`);
  };

  const handleEditVideo = (download) => {
    console.log('Editing video:', download.title);
    // Add edit functionality here
    alert(`Editing: ${download.title}`);
  };

  const handleDeleteVideo = (download) => {
    console.log('Deleting video:', download.title);
    // Add delete functionality here
    if (confirm(`Are you sure you want to delete "${download.title}"?`)) {
      alert(`Deleted: ${download.title}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-completed" />;
      case 'downloading':
        return <FaPause className="status-downloading" />;
      case 'failed':
        return <FaTimesCircle className="status-failed" />;
      default:
        return <FaClock className="status-pending" />;
    }
  };

  return (
    <div className="downloads-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Header Section */}
      <div className="downloads-header">
        <div className="header-left">
          <h1>Downloads</h1>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search downloads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="downloads-list">
        {filteredDownloads.map((download) => (
          <div 
            key={download.id} 
            className={`download-item ${selectedItems.has(download.id) ? 'selected' : ''}`}
          >
            {/* Selection Checkbox */}
            <div className="item-checkbox">
              <input 
                type="checkbox"
                checked={selectedItems.has(download.id)}
                onChange={() => handleSelectItem(download.id)}
              />
            </div>

            {/* Thumbnail */}
            <div className="item-thumbnail">
              <img src={download.thumbnail} alt={download.title} />
              <div className="thumbnail-overlay">
                {getStatusIcon(download.status)}
              </div>
            </div>

            {/* Download Info */}
            <div className="item-info">
              <h3 className="item-title">{download.title}</h3>
              <p className="item-creator">{download.creator}</p>
              
              {/* Download Details */}
              <div className="item-details">
                <div className="detail-item">
                  <FaClock />
                  <span>{download.duration}</span>
                </div>
                <div className="detail-item">
                  <span>{download.size}</span>
                </div>
                <div className="detail-item">
                  <span>{download.quality} • {download.format}</span>
                </div>
                <div className="detail-item">
                  <span>Downloaded {download.downloadDate}</span>
                </div>
              </div>

              {/* Progress Bar */}
              {download.status === 'downloading' && (
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${download.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{download.progress}%</span>
                </div>
              )}

              {/* Action Buttons Below Download Info */}
              <div className="info-actions">
                <button className="info-action-btn play-btn" onClick={() => handlePlayVideo(download)}>
                  <FaPlay />
                  <span>Play</span>
                </button>
                <button className="info-action-btn share-btn" onClick={() => handleShareVideo(download)}>
                  <FaShare />
                  <span>Share</span>
                </button>
                <button className="info-action-btn delete-btn" onClick={() => handleDeleteVideo(download)}>
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDownloads.length === 0 && (
        <div className="empty-state">
          <FaFileVideo className="empty-icon" />
          <h3>No downloads found</h3>
          <p>Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
