// Main application entry point.
// Wires up routing, providers, and layouts.

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppRoutes />} />
      </Routes>
    </Router>
  );
}
