'use client';

import React from "react";
import Image from "next/image";

const FooterBanner: React.FC = () => {
  return (
    <div className="relative bg-[#f02d34] text-white rounded-xl w-full mt-32 px-10 py-24 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start relative z-10">
        {/* Text Content */}
        <div className="max-w-2xl space-y-4">
          <p className="text-white text-base md:text-xl font-funnel">IP-Licensed AI Creatives</p>
          <h3 className="text-4xl md:text-6xl font-extrabold leading-tight font-funnel">
            For Brands, Designers & Influencers
          </h3>
          <p className="text-white text-2xl md:text-3xl font-funnel">The Future of Ethical Ad Generation</p>
        </div>

        {/* Image on Right */}
        <div className="hidden md:block absolute -top-20 right-10 h-[120%]">
          <Image
            src="/assets/images/footer.png"
            alt="IPixel Footer Banner"
            width={350}
            height={350}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default FooterBanner; 