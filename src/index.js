import React from "react";
import ReactDOM from "react-dom/client"; // For React 18
import App from "./App.js"; // Add the .js extension

const root = ReactDOM.createRoot(document.getElementById("root")); // Create a root for React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
