import React, { useState } from 'react';
import { FaArrowLeft, FaFileAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Image } from '@chakra-ui/react';
import './TermsOfService.css';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const goBack = () => {
    navigate('/feedback');
  };

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const termsSections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Sallugram, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      title: "Use License",
      content: "Permission is granted to temporarily download one copy of the materials on Sallugram for personal, non-commercial transitory viewing only."
    },
    {
      title: "Disclaimer",
      content: "The materials on Sallugram are provided on an 'as is' basis. Sallugram makes no warranties, expressed or implied."
    },
    {
      title: "Limitations",
      content: "In no event shall Sallugram or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit)."
    },
    {
      title: "Revisions and Errata",
      content: "The materials appearing on Sallugram could include technical, typographical, or photographic errors."
    },
    {
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of Tamil Nadu, India."
    }
  ];

  return (
    <div className="terms-page">
      <div className="terms-header">
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft />
        </button>
        <div className="terms-logo">
          <Image src='/Minisallu.png' alt='Sallugram' width={'54'} height={'18'} />
        </div>
      </div>

      <div className="terms-main">
        <div className="terms-card">
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-subtitle">Last updated: February 2026</p>
          
          <p className="terms-intro">
            Welcome to Sallugram! These Terms of Service govern your use of our platform and services. 
            By using Sallugram, you agree to these terms and conditions.
          </p>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="terms-sections">
              {termsSections.map((section, index) => (
                <div key={index} className="terms-section">
                  <div 
                    className="section-header"
                    onClick={() => toggleSection(index)}
                  >
                    <h3>{section.title}</h3>
                    <FaChevronDown className={`section-arrow ${expandedSections[index] ? 'expanded' : ''}`} />
                  </div>
                  <div className={`section-content ${expandedSections[index] ? 'expanded' : ''}`}>
                    <p>{section.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="terms-footer">
            <h3>Contact Us</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: legal@sallugram.com</p>
              <p>Address: 123 Ayanavaram, Tamil Nadu, India 600023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
