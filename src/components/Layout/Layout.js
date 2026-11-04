// Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.js";
import Footer from "./Footer.js";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
};

export default Layout;
