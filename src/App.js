import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Academic from "./pages/Academic/Academic";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/EditProfile/EditProfile";
import NotFound from "./pages/NotFound/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProfileImageUpload from "./pages/ProfileImageUpload/ProfileImageUpload";
import ClassRoutine from "./pages/ClassRoutine";

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  return isAuthenticated ? element : <Navigate to="/profile" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/academic"
              element={<ProtectedRoute element={<Academic />} />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/editprofile"
              element={<ProtectedRoute element={<EditProfile />} />}
            />
            <Route
              path="/upload"
              element={<ProtectedRoute element={<ProfileImageUpload />} />}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute element={<Profile />} />}
            />
            <Route path="/class-routine" element={<ClassRoutine />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
