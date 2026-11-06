// MainLayout — the public website layout.
// Contains Header, main content area, and Footer.

import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import "./MainLayout.scss";

export default function MainLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-layout__content">{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
