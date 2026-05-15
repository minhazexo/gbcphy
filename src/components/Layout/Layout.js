// Layout.js
import React from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
