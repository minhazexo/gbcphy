import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChessLogin from "./pages/Chess/ChessLogin";
import ChessDashboard from "./pages/Chess/ChessDashboard";
import ChessRoutes from "./pages/Chess/ChessRoutes";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";

import Home from "./pages/Home/Home";
import Games from "./pages/Games/Games";
import FlappyBird from "./pages/Games/FlappyBird";
import Scientific from "./pages/Scientific/Scientific";
import About from "./pages/About/About";
import Academic from "./pages/Academic/Academic";
import Login from "./pages/Login/Login";
import Teachers from "./pages/Teachers/Teachers";
import SnakeGame from "./pages/Games/SnakeGame";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/EditProfile/EditProfile";
import NotFound from "./pages/NotFound/NotFound";
import ProfileImageUpload from "./pages/ProfileImageUpload/ProfileImageUpload";
import ClassRoutine from "./pages/ClassRoutine";


// ❗ Correct chess.js import


// ❗ Correct chessboard import


function App() {
  return (
    <Router>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/games" element={<Games />} />
          <Route path="/snakegame" element={<SnakeGame />} />
          <Route path="/flappybird" element={<FlappyBird />} />
          <Route path="/scientific" element={<Scientific />} />
           <Route path="/chess" element={<ChessLogin />} />
  <Route element={<ChessRoutes />}>
    <Route path="/chess/dashboard" element={<ChessDashboard />} />
  </Route>

          
          

          <Route path="/academic" element={<Academic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/upload" element={<ProfileImageUpload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/class-routine" element={<ClassRoutine />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
