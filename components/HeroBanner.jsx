import React from "react";
import Link from "next/link";

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className="hero-banner-container">
      <div>
        <h1>AI AGENT STORE</h1>
        <img
          src="https://i.pinimg.com/originals/4b/cb/1f/4bcb1fb72d1d08efa44efa5ceb712ec7.gif"
          alt="headphones"
          className="hero-banner-image"
        />

        <div>
          <Link
            href="/product"
            // href={`/product/${heroBanner.product}`}
          >
            <button type="button">Explore AI Agents</button>
          </Link>
          <div className="desc">
            <h5>Curated AI Agents</h5>
            <p>Find agents tailored to your needs, built by top developers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
