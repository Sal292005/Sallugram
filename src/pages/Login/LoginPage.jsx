import React, { useEffect, useState } from 'react';
import './Login.css';
import { Image } from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import useLogin from '../../hooks/useLogin';

const LoginPage = ({ onNavigate = () => {} }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, loading] = useAuthState(auth);
  const { login } = useLogin();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    if (user && !loading) {
      onNavigate('/home');
    }
  }, [user, loading, onNavigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    const result = await login({
      email: formData.emailOrUsername.trim(),
      password: formData.password,
    });

    if (result) {
      onNavigate('/home');
      return;
    }

    setError('Login failed. Check your email and password, then try again.');
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-logo">
              <Image src="/Minisallu.png" alt="Mini Sallu" width={'350px'} height={'25px'} />
            </div>

            <p className="login-subtitle">Share moments. Build connections.</p>

            <form className="form-container" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Email or username"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
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
                  />

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              <button className="btn-login" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="signup-link">
              Don't have an account? <span onClick={() => onNavigate('/signup')}>Sign Up</span>
            </p>

            <p className="forgot-password">Forgot password?</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

