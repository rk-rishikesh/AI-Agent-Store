import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HeroBanner, FooterBanner } from "../components";

interface BigCardProps {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  className?: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PricingCardProps {
  price: string;
  title: string;
  features: string[];
  link: string;
}

const BigCard: React.FC<BigCardProps> = ({ title, subtitle, image, link, className = "" }) => (
  <Link href={link} className={`block bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {image && (
      <div className="relative h-48 w-full mb-4 rounded-2xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
    {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
  </Link>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm">
    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const PricingCard: React.FC<PricingCardProps> = ({ price, title, features, link }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
    <div className="text-center mb-6">
      <div className="text-4xl font-bold text-indigo-600">${price}</div>
      <div className="text-gray-600 mt-1">per month</div>
    </div>
    <h3 className="text-xl font-bold text-center mb-6">{title}</h3>
    <ul className="space-y-4 mb-8">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <Link
      href={link}
      className="block w-full py-3 px-6 text-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
    >
      Get Started
    </Link>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}

      <HeroBanner />
      {/* Features Grid */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Explore IP Templates</h2>
            <p className="text-xl text-gray-600">Discover the best IP cleared Design Assets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BigCard
              title="Product Studio"
              subtitle="Create professional product shots with AI"
              image="/assets/categories/product.png"
              link="/product"
              className="bg-orange-50"
            />
            <BigCard
              title="Visual Textures"
              subtitle="Generate unique patterns and textures"
              image="/assets/categories/design.png"
              link="/product"
              className="bg-blue-50"
            />
            <BigCard
              title="Smart Ads"
              subtitle="Design AI-powered advertisements"
              image="/assets/categories/ad.png"
              link="/ads"
              className="bg-green-50"
            />
            <BigCard
              title="IP Approved Face"
              subtitle="Access licensed face models"
              image="/assets/categories/face.png"
              link="/product"
              className="bg-yellow-50"
            />
            <BigCard
              title="Design Templates"
              subtitle="Use pre-made design templates"
              image="/assets/categories/template.png"
              link="/product"
              className="bg-purple-50"
            />
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="mb-6">Join thousands of creators using IPixel today</p>
              <Link
                href="/product"
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-medium hover:bg-indigo-50 transition-colors inline-block text-center"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose IPixel</h2>
            <p className="text-xl text-gray-600">Everything you need to create professional designs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Lightning Fast"
              description="Generate multiple designs in seconds with our advanced AI"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="IP Protected"
              description="All assets are legally cleared and secured on-chain"
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
              title="Flexible Templates"
              description="Choose from hundreds of customizable templates"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              price="0"
              title="Free"
              features={[
                "5 designs per month",
                "Basic templates",
                "Standard quality exports",
                "Community support"
              ]}
              link="/product"
            />
            <PricingCard
              price="29"
              title="Pro"
              features={[
                "Unlimited designs",
                "Premium templates",
                "High quality exports",
                "Priority support"
              ]}
              link="/product"
            />
            <PricingCard
              price="99"
              title="Enterprise"
              features={[
                "Custom templates",
                "API access",
                "Team collaboration",
                "Dedicated support"
              ]}
              link="/product"
            />
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <FooterBanner />
    </div>
  );
} 
