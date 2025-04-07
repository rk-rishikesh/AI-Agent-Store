import React from "react";
import { Product, FooterBanner, HeroBanner } from "../components";

const products = [
  {
    _id: 1,
    name: "Product Studio",
    posterImage: "/assets/categories/product.png",
  },
  {
    _id: 2,
    name: "Visual Textures",
    posterImage: "/assets/categories/design.png",
  },
  {
    _id: 3,
    name: "Smart Ads",
    posterImage: "/assets/categories/ad.png",
  },
  {
    _id: 4,
    name: "IP Approved Face",
    posterImage: "/assets/categories/face.png",
  },
  {
    _id: 5,
    name: "Design Template",
    posterImage: "/assets/categories/template.png",
  },
];

const Home = () => (
  <div>
    <HeroBanner />
    <div className="products-heading -mt-4">
      <h2>Explore IP Templates</h2>
      <p>Discover the best IP cleared Design Assets</p>
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
