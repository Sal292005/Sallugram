import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SendFeedback = () => {
  return (
    <Link to="/feedback" className="sidebar-item">
      <FaEnvelope />
      <span>Send Feedback</span>
    </Link>
  );
};

export default SendFeedback;
