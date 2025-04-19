'use client';

import React from 'react';
import Link from 'next/link';

export default function AdPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ad Generation Studio</h1>

      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="mb-4">This feature is currently under development.</p>
        <p className="mb-6">In the meantime, you can use the ad generation feature in our Product Studio.</p>
        <Link
          href="/product"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Go to Product Studio
        </Link>
      </div>
    </main>
  );
}
