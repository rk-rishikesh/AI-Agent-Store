import React from "react";
import { Toaster } from "react-hot-toast";
import { Layout } from "../components";
import "../styles/globals.css";
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Layout>
        <Toaster />
        <Component {...pageProps} />
      </Layout>
  );
}

export default MyApp; 