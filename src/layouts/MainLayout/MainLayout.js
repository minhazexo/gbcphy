// MainLayout — the public website layout.
// Contains Header, main content area, and Footer.

import { Outlet } from "react-router-dom";
import Header from "./Header.js";
import Footer from "./Footer.js";
import "./MainLayout.scss";

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-layout__content">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
