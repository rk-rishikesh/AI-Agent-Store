'use client';

import React from "react";
import Link from "next/link";

interface ProductProps {
  product: {
    _id: number;
    name: string;
    posterImage: string;
    path?: string;
  };
}

const Product: React.FC<ProductProps> = ({ product: { _id, name, posterImage, path } }) => {
  return (
    <div>
      <Link href={path || `/product/${_id}`}>
        <div className="cursor-pointer text-[#324d67] transition-transform duration-500 transform hover:scale-110">
          <img
            src={posterImage}
            width={250}
            height={250}
            className="rounded-xl bg-[#ebebeb] transition-transform duration-500 transform hover:scale-105"
            alt={name}
          />
          <p className="font-medium flex justify-center mt-2">{name}</p>
        </div>
      </Link>
    </div>
  );
};

export default Product; 