import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signUpWithEmailPassword } from '../../firebase/authService';
import { auth } from '../../firebase/firebase';
import './Signup.css';
import { Image } from '@chakra-ui/react';

// Signup Page Component
const SignupPage = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      console.log('User already logged in, redirecting to home');
      navigate('/home');
    }
  }, [user, loading, navigate]);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Reset error
    setError('');
    
    // Full name validation
    if (!formData.fullName || !formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return false;
    }
    
    // Username validation
    if (!formData.username || !formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.trim().length < 2) {
      setError('Username must be at least 2 characters long');
      return false;
    }
    
    // Email validation
    if (!formData.email || !formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUpWithEmailPassword(
        formData.email,
        formData.password,
        formData.fullName,
        formData.username
      );
      
      console.log('Signup successful, navigating to home');
      onNavigate('/home');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.');
      } else if (error.message.includes('weak-password')) {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (error.message.includes('invalid-email')) {
        setError('Invalid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-form-section">
          <div className="signup-card">
            <div className="signup-logo">
              <Image src='/Minisallu.png' alt='Mini Sallu' width={'180px'} height={'60px'} />
            </div>
            <p className="signup-subtitle">Share moments. Build connections.</p>
            
            <div className="form-container">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="form-group">
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setShowPasswordHint(true)}
                    onBlur={() => setShowPasswordHint(false)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {showPasswordHint && <small>Min 8 characters with letters & numbers</small>}
              </div>
              
              <div className="form-group">
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <i className={`far ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <button 
                className="btn-signup" 
                onClick={handleSubmit}
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
            
            <p className="login-link">
              Already have an account? <span onClick={() => onNavigate('/login')}>Log in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SignupPage;
