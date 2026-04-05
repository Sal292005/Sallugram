import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { signInWithGoogle, checkUserDataExists, ensureUserDataExists } from '../../firebase/authService';
import './Intro.css';
import { Image } from '@chakra-ui/react';

// Intro Page Component
const IntroPage = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  // Redirect to home if user is already authenticated
  React.useEffect(() => {
    if (user && !loading) {
      console.log('User already authenticated, checking data storage...');
      checkUserDataExists(user.uid).then(userData => {
        if (userData) {
          console.log('User data exists, navigating to home');
          navigate('/home');
        } else {
          console.log('User data missing, creating it...');
          ensureUserDataExists(user).then(() => {
            console.log('User data created, navigating to home');
            navigate('/home');
          });
        }
      });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      const result = await signInWithGoogle();
      console.log('Sign-in successful:', result);
      
      // Additional verification
      setTimeout(async () => {
        const userData = await checkUserDataExists(result.uid);
        if (userData) {
          console.log('✅ User data successfully stored in Firestore');
        } else {
          console.log('❌ User data not found in Firestore, attempting manual creation...');
          await ensureUserDataExists(result);
        }
      }, 1000);
      
      navigate('/home');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (loading) {
    return (
      <div className="intro-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="intro-container">
      <div className="intro-content">
        <div className="logo-section">
            <Image src='/logo.png' alt='Logo' width={'80%'} height={'80%'} />
        </div>
        
        <div className="intro-right">
        <Image src='/Minisallu.png' alt='Logo' width={'175%'} height={'20%'} />
          <p className="intro-subheading">See. Share. Connect.</p>
          
          <button className="btn-signin" onClick={handleGoogleSignIn}>
            <Image src='/google-image.png' alt='Google' width={'24px'} height={'24px'} />
            Sign up with Google
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <button className="btn-create" onClick={() => {navigate('/signup');}}>
            Create account
          </button>
          
          <p className="signin-link">Already have an account? <span onClick={() => navigate('/login')}>Log In</span></p>
          
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
