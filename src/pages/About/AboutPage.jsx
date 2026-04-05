import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import './AboutPage.css';
import Navbar from '../../components/Navbar/Navbar';

const AboutPage = () => {
  const [activeItem, setActiveItem] = useState('About');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);
  const [usersSuffix, setUsersSuffix] = useState('H');
  const [videosSuffix, setVideosSuffix] = useState('H');

  // Counting animation effect
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    // Users counter (10M+)
    const usersTarget = 10;
    let usersCurrent = 0;
    const usersTimer = setInterval(() => {
      usersCurrent += usersTarget / steps;
      if (usersCurrent >= usersTarget) {
        usersCurrent = usersTarget;
        clearInterval(usersTimer);
      }
      setUsersCount(Math.floor(usersCurrent));
    }, interval);

    // Videos counter (50M+)
    const videosTarget = 50;
    let videosCurrent = 0;
    const videosTimer = setInterval(() => {
      videosCurrent += videosTarget / steps;
      if (videosCurrent >= videosTarget) {
        videosCurrent = videosTarget;
        clearInterval(videosTimer);
      }
      setVideosCount(Math.floor(videosCurrent));
    }, interval);

    // Countries counter (100+)
    const countriesTarget = 100;
    let countriesCurrent = 0;
    const countriesTimer = setInterval(() => {
      countriesCurrent += countriesTarget / steps;
      if (countriesCurrent >= countriesTarget) {
        countriesCurrent = countriesTarget;
        clearInterval(countriesTimer);
      }
      setCountriesCount(Math.floor(countriesCurrent));
    }, interval);

    // Text cycling for suffixes
    const suffixes = ['H', 'Th', 'Tt', 'M'];
    let suffixIndex = 0;
    const suffixTimer = setInterval(() => {
      if (suffixIndex < suffixes.length - 1) {
        suffixIndex++;
        setUsersSuffix(suffixes[suffixIndex]);
        setVideosSuffix(suffixes[suffixIndex]);
      } else {
        // Stop cycling when reaching M
        clearInterval(suffixTimer);
      }
    }, 500); // Change every 500ms

    return () => {
      clearInterval(usersTimer);
      clearInterval(videosTimer);
      clearInterval(countriesTimer);
      clearInterval(suffixTimer);
    };
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Founder & CEO',
      image: 'https://i.pravatar.cc/400?img=1',
      description: 'Visionary leader with 10+ years of experience in digital media.'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'CTO',
      image: 'https://i.pravatar.cc/400?img=5',
      description: 'Tech expert specializing in scalable web applications.'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Head of Design',
      image: 'https://i.pravatar.cc/400?img=3',
      description: 'Creative mind behind our user experience and interface.'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'Marketing Director',
      image: 'https://i.pravatar.cc/400?img=9',
      description: 'Growth hacker and brand strategist.'
    },
    {
      id: 5,
      name: 'Alex Chen',
      role: 'Lead Developer',
      image: 'https://i.pravatar.cc/400?img=8',
      description: 'Full-stack developer passionate about clean code.'
    },
    {
      id: 6,
      name: 'Emily Davis',
      role: 'Product Manager',
      image: 'https://i.pravatar.cc/400?img=4',
      description: 'User-focused product strategist and team leader.'
    }
  ];

  return (
    <div className="about-page">
      <Navbar 
        activeItem={activeItem} 
        onItemChange={setActiveItem} 
        isSidebarCollapsed={isSidebarCollapsed} 
        setIsSidebarCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Header Section */}
      <div className="about-header">
        <div className="header-left">
          <h1><FaInfoCircle className="header-icon" /> About Sallugram</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h2>Welcome to Sallugram</h2>
          <p>Your ultimate destination for video content, social networking, and digital entertainment.</p>
          <div className="hero-stats">
            <div className="stat-item">
              <h3>{usersCount}{usersSuffix}+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>{videosCount}{videosSuffix}+</h3>
              <p>Videos</p>
            </div>
            <div className="stat-item">
              <h3>{countriesCount}+</h3>
              <p>Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="about-content">
        <div className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2026, Sallugram has grown from a small startup to one of the leading video platforms in the world. 
            Our mission is to connect people through engaging video content and provide creators with the tools they need 
            to share their stories with the world.
          </p>
          <p>
            We believe in the power of video to educate, entertain, and inspire. Whether you're a content creator, 
            a viewer, or a brand, Sallugram offers something for everyone.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            To democratize video content creation and consumption, making it accessible to everyone, everywhere. 
            We strive to build a community where creativity thrives and meaningful connections are made.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Pushing boundaries and embracing new technologies</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>Building a supportive and inclusive environment</p>
            </div>
            <div className="value-card">
              <h3>Quality</h3>
              <p>Delivering exceptional experiences to our users</p>
            </div>
            <div className="value-card">
              <h3>Transparency</h3>
              <p>Being open and honest in everything we do</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="team-section">
          <h2>Meet Our Team</h2>
          
          {/* Project Details Box */}
          <div className="project-details-box">
            <h3>About Sallugram Project</h3>
            <div className="project-info-grid">
              <div className="project-info-item">
                <h4>Project Type</h4>
                <p>Social Media Platform</p>
              </div>
              <div className="project-info-item">
                <h4>Founded</h4>
                <p>2024</p>
              </div>
              <div className="project-info-item">
                <h4>Location</h4>
                <p>Chennai, India</p>
              </div>
              <div className="project-info-item">
                <h4>Team Size</h4>
                <p>4+ Members</p>
              </div>
              <div className="project-info-item">
                <h4>Technology</h4>
                <p>React, Node.js, MongoDB</p>
              </div>
              <div className="project-info-item">
                <h4>Mission</h4>
                <p>Connect & Share</p>
              </div>
              <div className="project-info-item">
                <h4>Users</h4>
                <p>10M+ Active</p>
              </div>
              <div className="project-info-item">
                <h4>Growth</h4>
                <p>500% Yearly</p>
              </div>
            </div>
            <div className="project-description">
              <p>
                Sallugram is a comprehensive social media platform designed to bring people together through 
                engaging content, meaningful connections, and seamless sharing experiences. Our platform combines 
                the best features of social networking, video sharing, and community building.
              </p>
              <p>
                Based in Chennai, India, our passionate team works tirelessly to create an intuitive and 
                feature-rich platform that serves users worldwide. We believe in the power of technology to 
                connect people and foster genuine relationships.
              </p>
            </div>
          </div>
          
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2>Get In Touch</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <FaEnvelope className="contact-icon" />
              <h3>Email</h3>
              <p>contact@sallugram.com</p>
              <p>support@sallugram.com</p>
            </div>
            <div className="contact-card">
              <FaPhone className="contact-icon" style={{ transform: 'scaleX(-1)' }} />
              <h3>Phone</h3>
              <p>+91 94990 03220</p>
              <p>+91 94990 03221</p>
            </div>
            <div className="contact-card">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>Address</h3>
              <p>123 Ayanavaram</p>
              <p>Tamil Nadu, India 600023</p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="social-section">
          <h2>Follow Us</h2>
          <div className="social-links">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaFacebook />
              <span>Facebook</span>
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaTwitter />
              <span>Twitter</span>
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaInstagram />
              <span>Instagram</span>
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaYoutube />
              <span>YouTube</span>
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
