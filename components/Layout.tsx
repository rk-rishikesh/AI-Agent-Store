import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { Metadata } from 'next'
 
interface LayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'AI Agent Store'
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header>
        <Navbar />
      </header>
      <main className="main-container">{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout; 