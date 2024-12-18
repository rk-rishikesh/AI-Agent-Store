import React from "react";
import Link from "next/link";

const Product = ({ product: { _id } }) => {
  return (
    <div>
      <Link href={`/product/${_id}`}>
        <div className="product-card">
          <img src="" width={250} height={250} className="product-image" />
          <p className="product-name">XXX {_id}</p>
        </div>
      </Link>
    </div>
  );
};

export default Product;
