import { auth, googleProvider, firestore } from './firebase';
import { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('User signed in:', user);
    
    // Store user profile in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      };
      
      console.log('Creating new user document:', userData);
      await setDoc(userRef, userData);
      console.log('User document created successfully');
    } else {
      // Update last login
      console.log('User exists, updating last login');
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
      console.log('Last login updated successfully');
    }
    
    // Verify the document was created/updated
    const verifyDoc = await getDoc(userRef);
    if (verifyDoc.exists()) {
      console.log('User data in Firestore:', verifyDoc.data());
    } else {
      console.error('Failed to create/update user document');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, updates) => {
  try {
    const userRef = doc(firestore, 'users', uid);
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Utility function to check if user data exists in Firestore
export const checkUserDataExists = async (uid) => {
  try {
    const userRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('User data found in Firestore:', userDoc.data());
      return userDoc.data();
    } else {
      console.log('No user data found in Firestore for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error checking user data:', error);
    throw error;
  }
};

// Function to manually create/update user data
export const ensureUserDataExists = async (user) => {
  try {
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp(),
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    };
    
    if (!userDoc.exists()) {
      userData.createdAt = serverTimestamp();
      console.log('Creating user data manually:', userData);
    } else {
      console.log('Updating user data manually:', userData);
    }
    
    await setDoc(userRef, userData, { merge: true });
    
    // Verify
    const verifyDoc = await getDoc(userRef);
    console.log('Verified user data:', verifyDoc.data());
    
    return verifyDoc.data();
  } catch (error) {
    console.error('Error ensuring user data exists:', error);
    throw error;
  }
};

// Email/Password Sign Up
export const signUpWithEmailPassword = async (email, password, fullName, username) => {
  try {
    console.log('Starting email/password signup...');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Full name:', fullName);
    console.log('Username:', username);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address format.');
    }
    
    // Validate password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    // Validate other fields
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long.');
    }
    
    if (!username || username.trim().length < 2) {
      throw new Error('Username must be at least 2 characters long.');
    }
    
    // Try to create user first - Firebase will handle duplicate email check
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;
    
    console.log('User created successfully:', user);
    
    // Update the user's profile with display name
    await updateProfile(user, {
      displayName: fullName.trim()
    });
    
    console.log('User profile updated with display name:', fullName.trim());
    
    // Store user profile in Firestore
    const userData = {
      uid: user.uid,
      displayName: fullName.trim(),
      email: user.email,
      username: username.trim(),
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'en'
      }
    };
    
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, userData);
    
    console.log('User data stored in Firestore:', userData);
    
    // Verify the document was created
    const verifyDoc = await getDoc(userRef);
    if (verifyDoc.exists()) {
      console.log('✅ User data successfully stored in Firestore');
    } else {
      console.error('❌ Failed to create user document');
    }
    
    return user;
  } catch (error) {
    console.error('Error signing up with email/password:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.message.includes('Invalid email address format.')) {
      throw error; // Re-throw our custom validation error
    } else {
      throw error;
    }
  }
};

// Email/Password Sign In
export const signInWithEmailPassword = async (email, password) => {
  try {
    console.log('Starting email/password sign in...');
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('User signed in successfully:', user);
    
    // Update last login
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true });
    
    console.log('Last login updated successfully');
    
    // Verify user data exists
    const verifyDoc = await getDoc(userRef);
    if (verifyDoc.exists()) {
      console.log('✅ User data found in Firestore:', verifyDoc.data());
    } else {
      console.log('❌ User data not found, creating it...');
      await ensureUserDataExists(user);
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with email/password:', error);
    throw error;
  }
};
