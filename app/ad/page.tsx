'use client';

import React, { useState } from 'react';

export default function Home() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        if (
          !base64.startsWith('data:image/png') &&
          !base64.startsWith('data:image/jpeg') &&
          !base64.startsWith('data:image/webp') &&
          !base64.startsWith('data:image/gif')
        ) {
          return reject(
            new Error('Unsupported image format. Use PNG, JPEG, WEBP, or GIF.')
          );
        }
        resolve(base64);
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const generateSocialMediaImage = async (prompt: string) => {
    const response = await fetch('/api/generateImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!response.ok) {
      alert(`Image generation error: ${data.error}`);
      return;
    }

    setGeneratedImage(data.imageUrl);
  };

  const handleGenerate = async () => {
    if (!productImage || !referenceImage) {
      alert('Please upload both images.');
      return;
    }

    setLoading(true);
    try {
      const productBase64 = await convertToBase64(productImage);
      const referenceBase64 = await convertToBase64(referenceImage);

      const res = await fetch('/api/generatePrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage: productBase64,
          referenceImage: referenceBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Prompt error: ${data.error}`);
        return;
      }

      setGeneratedPrompt(data.prompt);
      await generateSocialMediaImage(data.prompt);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Product Ad Image Generator</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Product Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={(e) => setProductImage(e.target.files?.[0] || null)}
            className="mt-2"
          />
        </div>

        <div>
          <label className="block font-semibold">Reference Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={(e) => setReferenceImage(e.target.files?.[0] || null)}
            className="mt-2"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generating...' : 'Generate Ad Image'}
        </button>
      </div>

      {generatedPrompt && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Prompt:</h2>
          <p className="whitespace-pre-line">{generatedPrompt}</p>
        </div>
      )}

      {generatedImage && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Generated Image:</h2>
          <img src={generatedImage} alt="Generated Ad" className="rounded shadow" />
        </div>
      )}
    </main>
  );
}
