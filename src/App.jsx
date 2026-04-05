import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import FirstPage from "./pages/Intro/Intro";
import HelpPage from "./pages/Help/Help";
import SettingsPage from "./pages/Settings/Settings";
import FeedbackPage from "./pages/Feedback/Feedback";
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import PostsPage from "./pages/Posts/PostsPage";
import ShortsPage from "./pages/Shorts/ShortsPage";
import ChatsPage from "./pages/Chats/ChatsPage";
import SubscriptionsPage from "./pages/Subscriptions/SubscriptionsPage";
import HistoryPage from "./pages/History/HistoryPage";
import YouLikedPage from "./pages/YouLiked/YouLikedPage";
import PlaylistsPage from "./pages/Playlists/PlaylistsPage";
import DownloadsPage from "./pages/Downloads/DownloadsPage";
import AboutPage from "./pages/About/AboutPage";
import VideosPage from "./pages/Videos/VideosPage";
import WatchLaterPage from "./pages/WatchLater/WatchLaterPage";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import CreatePost from "./pages/CreatePost/CreatePost";
import CreateShort from "./pages/CreateShort/CreateShort";
import CreateVideo from "./pages/CreateVideo/CreateVideo";
import VideoDetailPage from "./pages/VideoDetail/VideoDetailPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [authUser] = useAuthState(auth);
  const navigate = useNavigate();

  return (
      <Routes>
        <Route
          path="/"
          element={<FirstPage navigate={navigate} />}
        />
        <Route
          path="/login"
          element={<LoginPage onNavigate={navigate} />}
        />
        <Route
          path="/signup"
          element={<SignupPage onNavigate={navigate} />}
        />
        
        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-short"
          element={
            <ProtectedRoute>
              <CreateShort />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-video"
          element={
            <ProtectedRoute>
              <CreateVideo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:videoId"
          element={
            <ProtectedRoute>
              <VideoDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shorts"
          element={
            <ProtectedRoute>
              <ShortsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/short/:shortId"
          element={
            <ProtectedRoute>
              <ShortsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <VideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <ProtectedRoute>
              <PlaylistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/downloads"
          element={
            <ProtectedRoute>
              <DownloadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/youliked"
          element={<Navigate to="/you-liked" replace />}
        />
        <Route
          path="/you-liked"
          element={
            <ProtectedRoute>
              <YouLikedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch-later"
          element={
            <ProtectedRoute>
              <WatchLaterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <TermsOfService />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
