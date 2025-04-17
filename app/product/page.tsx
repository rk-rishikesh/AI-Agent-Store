'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

// Add new type for image analysis
type ImageAnalysis = {
  description: string;
  attributes?: {
    color?: string;
    material?: string;
    shape?: string;
    category?: string;
    [key: string]: string | undefined;
  };
};

export default function ProductStudio() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipAnalysis, setSkipAnalysis] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedImage(file);
    setResultImage(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageAnalysis(null);

    // When skipAnalysis is true, we need a prompt but image is optional
    if (skipAnalysis && !prompt.trim()) {
      setError('Please enter a prompt when skipping image analysis');
      return;
    }

    // When not skipping analysis, we need an image
    if (!skipAnalysis && !selectedImage) {
      setError('Please select an image or enable "Skip image analysis"');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      formData.append('prompt', prompt);
      formData.append('skipAnalysis', skipAnalysis.toString());

      const response = await axios.post('/api/generate-studio-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResultImage(response.data.imageUrl);
        if (response.data.analysis) {
          setImageAnalysis(response.data.analysis);
        }
      } else {
        throw new Error(response.data.error || 'Failed to generate studio photo');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      console.error('Error generating studio photo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'studio-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setResultImage(null);
    setPrompt('');
    setError(null);
    setImageAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Product Photo Studio</h1>

        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p><strong>Note:</strong> This product photo studio uses AI to create professional photos in two ways:</p>
              <ol className="list-decimal ml-5 mt-2">
                <li><strong>Upload an image + provide description:</strong> AI analyzes your product image and combines this with your description.</li>
                <li><strong>Text-only mode:</strong> Check "Skip image analysis" and just describe the product you want to visualize.</li>
              </ol>
            </div>

            {!resultImage ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">Upload Product Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {previewImage && (
                  <div className="flex justify-center">
                    <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Describe Your Product and Desired Look
                  </label>
                  <textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    rows={4}
                    placeholder="E.g., A sleek black coffee mug with minimal design on a white surface, professional product photography"
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipAnalysis"
                    checked={skipAnalysis}
                    onChange={(e) => setSkipAnalysis(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="skipAnalysis" className="text-sm text-gray-700">
                    {selectedImage
                      ? "Skip image analysis (saves credits, but requires detailed description)"
                      : "Text-only mode: generate without uploading an image (requires detailed description)"}
                  </label>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={(isLoading) || (!selectedImage && !skipAnalysis) || (skipAnalysis && !prompt.trim())}
                    className={`px-6 py-3 rounded-lg text-white font-medium ${(isLoading) || (!selectedImage && !skipAnalysis) || (skipAnalysis && !prompt.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isLoading ? 'Generating...' : 'Generate Studio Photo'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Your Studio Photo Is Ready!</h2>
                </div>

                <div className="flex justify-center">
                  <div className="relative w-full h-96 border rounded-lg overflow-hidden">
                    <Image
                      src={resultImage}
                      alt="Generated studio photo"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {imageAnalysis && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Product Analysis</h3>
                    <p className="mb-3">{imageAnalysis.description}</p>

                    {imageAnalysis.attributes && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(imageAnalysis.attributes).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex">
                              <span className="font-medium capitalize mr-1">{key}:</span>
                              <span>{value}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    Download Photo
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 
