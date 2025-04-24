'use client';

import React from "react";
import Link from "next/link";
import Image from 'next/image';

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
          <div className="relative w-full h-64 mb-4">
            <Image
              src={posterImage}
              alt={name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <p className="font-medium flex justify-center mt-2">{name}</p>
        </div>
      </Link>
    </div>
  );
};

export default Product; 
