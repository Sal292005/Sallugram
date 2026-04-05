import React, { useState } from 'react';
import { FaArrowLeft, FaShieldAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Image } from '@chakra-ui/react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const goBack = () => {
    navigate('/feedback');
  };

  const privacySections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This may include your name, email address, and other information you choose to provide."
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
    },
    {
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with trusted service providers who assist us in operating our services."
    },
    {
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. Contact us if you wish to exercise these rights."
    },
    {
      title: "Children's Privacy",
      content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information."
    },
    {
      title: "Changes to This Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last updated' date at the top."
    }
  ];

  return (
    <div className="privacy-policy-page">
      <div className="privacy-header">
        <button className="back-button" onClick={goBack}>
          <FaArrowLeft />
        </button>
        <div className="privacy-logo">
          <Image src='/Minisallu.png' alt='Sallugram' width={'54'} height={'18'} />
        </div>
      </div>

      <div className="privacy-main">
        <div className="privacy-card">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">Last updated: February 2026</p>
          
          <p className="privacy-intro">
            At Sallugram, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
          </p>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="privacy-sections">
              {privacySections.map((section, index) => (
                <div key={index} className="privacy-section">
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

          <div className="privacy-footer">
            <h3>Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: privacy@sallugram.com</p>
              <p>Address: 123 Ayanavaram, Tamil Nadu, India 600023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
