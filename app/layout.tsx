import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: 'KKP Store',
  description: 'Your one-stop shop for design assets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <header>
            <Navbar />
          </header>
          <main className="main-container">
            <Providers>
              {children}
            </Providers>
          </main>
          <footer>
            <Footer />
          </footer>
        </div>
      </body>
    </html>
  );
} 