import React, { useState } from 'react';
import { FaTimes, FaInfoCircle, FaCamera, FaEnvelope, FaShieldAlt, FaFileAlt } from 'react-icons/fa';
import './Feedback.css';
import Navbar from '../../components/Navbar/Navbar';

const Feedback = () => {
    const [activeItem, setActiveItem] = useState('Send Feedback');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [allowEmail, setAllowEmail] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Feedback submitted:', { feedback, email, allowEmail, screenshot });
      setShowThankYouModal(true);
      setFeedback('');
      setEmail('');
      setAllowEmail(false);
      setScreenshot(null);
      setIsSubmitting(false);
    }, 1500);
  };

  const closeThankYouModal = () => {
    setShowThankYouModal(false);
  };

  const handleScreenshot = () => {
    // In a real app, this would open a screenshot tool
    const mockScreenshot = `screenshot_${Date.now()}.png`;
    setScreenshot(mockScreenshot);
    alert('Screenshot captured! (This is a demo - in a real app, this would capture your screen)');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshot(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="feedback-container">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      <div className="feedback-modal">
        <div className="modal-header">
          <h2>Send feedback to Sallugram</h2>
          <button className="close-btn" onClick={() => window.history.back()}>
            <FaTimes />
          </button>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="feedback">Describe your feedback</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what prompted this feedback..."
              required
            />
          </div>

          <div className="form-note">
            <FaInfoCircle className="note-icon" />
            <span>Please don't include any sensitive information</span>
          </div>

          <div className="form-group">
            <a className="camera">
                <FaCamera style={{color:"#F81804"}}/>
                A screenshot will help us better understand your feedback.
              </a>
            <div className="screenshot-section">
              <button 
                type="button" 
                className="screenshot-btn"
                onClick={handleScreenshot}
              >
                <FaCamera />
                <span>Capture screenshot</span>
              </button>
              <input
                type="file"
                id="screenshot"
                accept="image/*"
                onChange={handleFileChange}
                className="screenshot-input"
              />
              {screenshot && (
                <div className="screenshot-preview">
                  <img src={screenshot} alt="Screenshot preview" />
                  <button 
                    type="button" 
                    className="remove-screenshot"
                    onClick={() => setScreenshot(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>
          

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="allow-email"
              checked={allowEmail}
              onChange={(e) => setAllowEmail(e.target.checked)}
            />
              <span>We may email you for more information or updates</span>
          </div>

          <div className="disclaimer">
            <h4>
              <FaFileAlt className="disclaimer-icon" />
              Data & Privacy
            </h4>
            <p>
              By submitting this feedback, you acknowledge that you have read and agree to the  
               <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>  and 
              <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. 
              Your feedback will be used to improve our services.
            </p>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="thank-you-modal-overlay">
          <div className="thank-you-modal">
            <div className="thank-you-icon">
              <FaEnvelope />
            </div>
            <h2>Thank you for your feedback!</h2>
            <p>We appreciate it.</p>
            <button className="thank-you-btn" onClick={closeThankYouModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
