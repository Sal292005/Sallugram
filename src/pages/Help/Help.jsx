import React, { useState } from 'react';
import './Help.css';
import { Image } from '@chakra-ui/react';
import { FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const HelpPage = () => {
  const [expandedItems, setExpandedItems] = useState({});
  
  const handleBackClick = () => {
    window.history.back();
  };

  const toggleFAQ = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <button className="back-button" onClick={handleBackClick}>
          <FaArrowLeft />
        </button>
        <div className="help-logo">
          <Image src='/Minisallu.png' alt='Sallugram' width={'54'} height={'18'} />
        </div>
      </div>

      <div className="help-main">
        <div className="help-card">
          <h1 className="help-title">Help & Support</h1>
          <p className="help-subtitle">We are here to help and keep you connected</p>
          
          <p className="help-intro">
            Welcome to Sallugram Help & Support! Find answers to common questions and get the assistance you need.
          </p>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="faq-title">Frequently Asked Questions</h2>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(0)}>
                <h3>Is Sallugram free to use?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[0] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[0] ? 'expanded' : ''}`}>
                <p>Yes, Sallugram is free to use. Some advanced features may be introduced in the future.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(1)}>
                <h3>How do I create an account?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[1] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[1] ? 'expanded' : ''}`}>
                <p>Click on the Sign Up button and register using your email and password or continue with Google.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(2)}>
                <h3>How do I upload content?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[2] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[2] ? 'expanded' : ''}`}>
                <p>Click the upload button, select your file, add a description, and post it to your profile.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(3)}>
                <h3>Can I delete my account?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[3] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[3] ? 'expanded' : ''}`}>
                <p>Yes, go to Settings {'>'} Account {'>'} Delete Account. Note that this action is irreversible.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(4)}>
                <h3>How do I report inappropriate content?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[4] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[4] ? 'expanded' : ''}`}>
                <p>Click the three dots on any post and select "Report". Choose a reason and submit.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(5)}>
                <h3>Is my data secure?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[5] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[5] ? 'expanded' : ''}`}>
                <p>Yes, we use industry-standard encryption and security measures to protect your data.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(6)}>
                <h3>How do I change my password?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[6] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[6] ? 'expanded' : ''}`}>
                <p>Go to Settings {'>'} Security {'>'} Change Password. Enter your current password and set a new one.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(7)}>
                <h3>Can I use Sallugram on mobile?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[7] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[7] ? 'expanded' : ''}`}>
                <p>Yes, Sallugram is fully responsive and works great on all mobile devices and tablets.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(8)}>
                <h3>How do I block someone?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[8] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[8] ? 'expanded' : ''}`}>
                <p>Visit the user's profile, click the three dots, and select "Block User". They won't be able to contact you.</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(9)}>
                <h3>How can I contact support?</h3>
                <FaChevronDown className={`faq-arrow ${expandedItems[9] ? 'expanded' : ''}`} />
              </div>
              <div className={`faq-answer ${expandedItems[9] ? 'expanded' : ''}`}>
                <p>Visit Help & Support or email us at support@sallugram.com</p>
              </div>
            </div>

          </div>

          <div className="terms-footer">
            <h3>Contact Us</h3>
            <p>
              If you have any questions about our Help & Support services, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: support@sallugram.com</p>
              <p>Address: 123 Ayanavaram, Tamil Nadu, India 600023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
