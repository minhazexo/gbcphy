// NotFound page — 404 page for the public website.

import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: "#4f46e5", textDecoration: "none" }}>
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
