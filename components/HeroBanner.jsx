import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-b text-gray-900">
      {/* Hero Section */}
      <section>
        <div className="px-10 py-24 bg-softPurple rounded-2xl relative h-[500px] leading-[0.9] w-full">
          <div>
            <img
              src="/assets/images/logo.png"
              alt="welcome"
              className=" top-0 ml-[-5px] h-[150px]"
            />
            <img
              src="/assets/images/ipixel.png"
              alt="welcome"
              className="absolute top-0 right-[5%] h-full"
            />

            <div>
              <h2 className="text-[2.5rem] font-semibold mt-6 font-funnel ">
                Generate stunning AI ads with IP Licensed assets.
              </h2>
              <div className="py-4 w-450 leading-[1.3] flex flex-col text-textDark">
                <p className="text-textMuted font-light text-left font-funnel">
                  Create banners, product shoots, and mockups with designs and
                  faces cleared for commercial use - powered by AI & secured
                  onchain.
                </p>
              </div>
            </div>
          </div>
          <Link href="/product">
            <button
              type="button"
              className="font-funnel bottom-[5%] mt-4 px-4 py-2 bg-primary text-white rounded-xl text-lg font-medium cursor-pointer z-[10000]"
            >
              Enter Playground
            </button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      {/* <section className="bg-white py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="text-center">
            <Image
              src="/register_ip.png"
              alt="Register IP"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Step 1: Register IP</h3>
            <p>
              Upload textures, icons, style packs or your likeness. Mint as NFTs
              via Story Protocol.
            </p>
          </div>
          <div className="text-center">
            <Image
              src="/approve_license.png"
              alt="Approve License"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">
              Step 2: Approve or License
            </h3>
            <p>
              Designers set pricing. Influencers approve brand usage requests.
            </p>
          </div>
          <div className="text-center">
            <Image
              src="/generate_ad.png"
              alt="Generate Ad"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Step 3: Generate Ad</h3>
            <p>
              Input prompt → AI generates ad → metadata + royalties
              auto-attached onchain.
            </p>
          </div>
        </div>
      </section> */}

      {/* Why IP Matters */}
      {/* <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Why IP Matters</h2>
        <p className="text-xl max-w-2xl mx-auto mb-10">
          AI is fast — but IP theft is faster. Stay compliant and creative by
          generating only with cleared, onchain assets.
        </p>
        <div className="flex justify-center">
          <Image
            src="/comparison_ad.png"
            alt="IP vs Non-IP Ad"
            width={500}
            height={300}
            className="rounded-lg shadow-xl"
          />
        </div>
      </section> */}
    </div>
  );
}
