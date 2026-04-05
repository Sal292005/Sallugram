import React, { useState } from 'react';
import { FaSearch, FaPaperPlane, FaEllipsisH, FaPhone, FaVideo, FaInfoCircle, FaUserCircle, FaSmile, FaPaperclip, FaMicrophone, FaPlus } from 'react-icons/fa';
import './ChatsPage.css';
import Navbar from '../../components/Navbar/Navbar';

const ChatsPage = () => {
  const [activeItem, setActiveItem] = useState('Chats');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);

  const chats = [
    {
      id: 1,
      name: 'Tech Explorer',
      avatar: '/Minisallu.png',
      lastMessage: 'Hey! Check out this new React tutorial I found...',
      time: '2 min ago',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'other', text: 'Hey! How are you doing?', time: '10:30 AM' },
        { id: 2, sender: 'me', text: 'I\'m doing great! Just working on a new project.', time: '10:32 AM' },
        { id: 3, sender: 'other', text: 'That sounds awesome! What kind of project?', time: '10:33 AM' },
        { id: 4, sender: 'me', text: 'It\'s a React app with modern UI design.', time: '10:34 AM' }
      ]
    },
    {
      id: 2,
      name: 'Design Guru',
      avatar: '/Minisallu.png',
      lastMessage: 'The new design looks amazing! Great work...',
      time: '15 min ago',
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: 'other', text: 'Love the new color scheme!', time: '9:15 AM' },
        { id: 2, sender: 'me', text: 'Thanks! I spent a lot of time on it.', time: '9:16 AM' }
      ]
    },
    {
      id: 3,
      name: 'Code Master',
      avatar: '/Minisallu.png',
      lastMessage: 'Can you review my code when you have time?',
      time: '1 hour ago',
      unread: 5,
      online: false,
      messages: [
        { id: 1, sender: 'other', text: 'I need help with this bug in my app', time: '8:00 AM' },
        { id: 2, sender: 'me', text: 'Sure, send it over and I\'ll take a look.', time: '8:05 AM' }
      ]
    },
    {
      id: 4,
      name: 'UI Designer',
      avatar: '/Minisallu.png',
      lastMessage: 'Meeting at 3 PM today - don\'t forget!',
      time: '2 hours ago',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'other', text: 'Don\'t forget about our meeting', time: '7:00 AM' },
        { id: 2, sender: 'me', text: 'I\'ll be there! Thanks for the reminder.', time: '7:02 AM' }
      ]
    },
    {
      id: 5,
      name: 'Backend Expert',
      avatar: '/Minisallu.png',
      lastMessage: 'The API integration is complete!',
      time: '3 hours ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'other', text: 'API is working perfectly now', time: '6:30 AM' },
        { id: 2, sender: 'me', text: 'Excellent! Let\'s deploy to production.', time: '6:32 AM' }
      ]
    }
  ];

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      // Add message to selected chat
      const newMessage = {
        id: selectedChat.messages.length + 1,
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      selectedChat.messages.push(newMessage);
      setMessage('');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    // Mark messages as read
    chat.unread = 0;
  };

  const currentChat = chats.find(chat => chat.id === selectedChat?.id);

  return (
    <div className="chats-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className="chats-container">
        {/* Chats Sidebar */}
        <div className="chats-sidebar">
          <div className="chats-header">
            <h2>Messages</h2>
            <button className="new-chat-btn">
              <FaPlus />
              New Chat
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="chats-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chat List */}
          <div className="chat-list">
            {filteredChats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="chat-avatar">
                  <img src={chat.avatar} alt={chat.name} />
                  {chat.online && <div className="online-indicator"></div>}
                </div>
                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <div className="chat-preview">
                    <span className="last-message">{chat.lastMessage}</span>
                    {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <img src={selectedChat.avatar} alt={selectedChat.name} />
                  <div className="user-details">
                    <span className="user-name">{selectedChat.name}</span>
                    <span className="user-status">
                      {selectedChat.online ? 'Active now' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn" title="Voice Call">
                    <FaPhone style={{ transform: 'scaleX(-1)' }} />
                  </button>
                  <button className="action-btn" title="Video Call">
                    <FaVideo />
                  </button>
                  <button className="action-btn" title="Chat Info" onClick={() => setShowChatInfo(!showChatInfo)}>
                    <FaInfoCircle />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                <div className="messages-container">
                  {selectedChat.messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                      <div className="message-content">
                        {msg.sender === 'other' && (
                          <img src={selectedChat.avatar} alt="User" className="message-avatar" />
                        )}
                        <div className="message-bubble">
                          <p>{msg.text}</p>
                          <span className="message-time">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                <div className="input-wrapper">
                  <div className="input-container">
                    <button className="attachment-btn" title="Attach File">
                      <FaPaperclip />
                    </button>
                    <button className="emoji-btn" title="Add Emoji">
                      <FaSmile />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="voice-btn" title="Voice Message">
                      <FaMicrophone />
                    </button>
                  </div>
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <FaUserCircle className="no-chat-icon" />
                <h3>Select a conversation</h3>
                <p>Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Info Modal */}
      {showChatInfo && selectedChat && (
        <div className="chat-info-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Chat Information</h3>
              <button className="close-btn" onClick={() => setShowChatInfo(false)}>
                <FaEllipsisH />
              </button>
            </div>
            <div className="chat-details">
              <div className="detail-item">
                <img src={selectedChat.avatar} alt={selectedChat.name} />
                <div className="user-info">
                  <h4>{selectedChat.name}</h4>
                  <span className="status">{selectedChat.online ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="label">Shared Media</span>
                <span className="value">12 files</span>
              </div>
              <div className="detail-item">
                <span className="label">Messages</span>
                <span className="value">{selectedChat.messages.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
