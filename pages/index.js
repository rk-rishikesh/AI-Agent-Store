import React from "react";
import { Product, FooterBanner, HeroBanner } from "../components";

const products = [
  {
    _id: 1,
    name: "",
    posterImage: "",
  },
  {
    _id: 2,
    name: "",
    posterImage: "",
  },
  {
    _id: 3,
    name: "",
    posterImage: "",
  },
  {
    _id: 3,
    name: "",
    posterImage: "",
  },
  {
    _id: 3,
    name: "",
    posterImage: "",
  },
];

const Home = () => (
  <div>
    <HeroBanner />
    <div className="products-heading">
      <h2>AI AGENTS</h2>
      <p>Discover the AI Agents</p>
    </div>

    <div className="products-container">
      {products?.map((product) => (
        <Product key={product._id} product={product} />
      ))}
    </div>

    <FooterBanner />
  </div>
);

export default Home;
