import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.js";
import "./App.css";
import "./styles/classRoutine.scss";
import Layout from "./components/Layout/Layout.js";

import Home from "./pages/Home/Home.js";
import Games from "./pages/Games/Games.js";
import FlappyBird from "./pages/Games/FlappyBird.js";
import Scientific from "./pages/Scientific/Scientific.js";
import About from "./pages/About/About.js";
import Academic from "./pages/Academic/Academic.js";
import Teachers from "./pages/Teachers/Teachers.js";
import SnakeGame from "./pages/Games/SnakeGame.js";
import NotFound from "./pages/NotFound/NotFound.js";
import ClassRoutine from "./pages/ClassRoutine.js";


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/games" element={<Games />} />
          <Route path="/snakegame" element={<SnakeGame />} />
          <Route path="/flappybird" element={<FlappyBird />} />
          <Route path="/scientific" element={<Scientific />} />
          
          

          <Route path="/academic" element={<Academic />} />
          <Route path="/class-routine" element={<ClassRoutine />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  </ThemeProvider>
  );
}

export default App;
