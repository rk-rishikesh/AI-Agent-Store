'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ErrorMessage } from '@/components';
import type { ErrorState, ErrorType } from '@/components/ErrorMessage';

// Ad generation type
type AdGeneration = {
  productImage: File | null;
  selectedWireframe: string;
  adCopy: string;
  generatedPrompt: string;
  generatedImages: string[];
  numOutputs: number;
};

export default function AdStudio() {
  const [adGeneration, setAdGeneration] = useState<AdGeneration>({
    productImage: null,
    selectedWireframe: '',
    adCopy: '',
    generatedPrompt: '',
    generatedImages: [],
    numOutputs: 1,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [step, setStep] = useState(0);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ad-specific wireframes
  const wireframes = [
    {
      id: "wireframe1",
      path: "/wireframes/wireframe1.png", // Placeholder - will be replaced later
      name: "Single Product",
      description: "Single product placed in center with balanced negative space for text overlay",
      prompt: "Position the product exactly as shown in the wireframe with clear space around it for text. Maintain the exact proportions and positioning from the wireframe while using the actual product from the reference image."
    },
    // {
    //   id: "wireframe2",
    //   path: "/wireframes/ad-wireframe-2.jpg", // Placeholder - will be replaced later
    //   name: "Left Aligned",
    //   description: "Product positioned on the left with text space on the right",
    //   prompt: "Place the product on the left side of the frame exactly as indicated in the wireframe, leaving the right portion clear for text. Match the exact positioning and scale shown in the wireframe while using the actual product from the reference image."
    // },
    // {
    //   id: "wireframe3",
    //   path: "/wireframes/ad-wireframe-3.jpg", // Placeholder - will be replaced later
    //   name: "Lifestyle Context",
    //   description: "Product integrated into a lifestyle scene with designated text areas",
    //   prompt: "Integrate the product into a lifestyle setting following the exact placement and scale shown in the wireframe. Maintain all spacing and composition guidelines while using the actual product from the reference image."
    // },
    // {
    //   id: "wireframe4",
    //   path: "/wireframes/ad-wireframe-4.jpg", // Placeholder - will be replaced later
    //   name: "Grid Layout",
    //   description: "Multiple product views in a grid format with text sections",
    //   prompt: "Arrange multiple views of the product in a grid layout exactly matching the wireframe composition. Preserve the specific positioning and proportions shown while using the actual product from the reference image."
    // },
  ];

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
          return reject({
            message: 'Unsupported image format.',
            type: 'upload',
            suggestions: ['Please use PNG, JPEG, WEBP, or GIF formats.', 'Try converting your image to one of these formats.'],
            retry: true
          });
        }
        resolve(base64);
      };

      reader.onerror = () => reject({
        message: 'Failed to read the image file.',
        type: 'upload',
        suggestions: ['Check if the file is corrupted.', 'Try a different image.'],
        retry: true
      });
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!adGeneration.productImage) {
      setError({
        message: 'Please upload a product image to continue.',
        type: 'upload',
        suggestions: ['Select an image from your device.'],
        retry: false
      });
      return;
    }

    if (!adGeneration.selectedWireframe) {
      setError({
        message: 'Please select a wireframe layout before generating.',
        type: 'template',
        suggestions: ['Choose one of the available wireframe layouts.'],
        retry: false
      });
      return;
    }

    if (!adGeneration.adCopy.trim()) {
      setError({
        message: 'Please enter your ad copy text.',
        type: 'template',
        suggestions: ['Add compelling text for your advertisement.'],
        retry: false
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const productBase64 = await convertToBase64(adGeneration.productImage).catch(err => {
        throw {
          message: 'Failed to process the product image.',
          type: 'upload',
          suggestions: ['Try a different image format.', 'Make sure the image is not corrupted.'],
          retry: true
        };
      });

      // Get the wireframe and prompt
      const selectedWireframe = wireframes.find(w => w.id === adGeneration.selectedWireframe);

      if (!selectedWireframe) {
        throw {
          message: 'Invalid wireframe selected.',
          type: 'template',
          suggestions: ['Try selecting a different wireframe.', 'Refresh the page and try again.'],
          retry: false
        };
      }

      try {
        // Fetch the wireframe image and convert to base64
        const wireframeResponse = await fetch(selectedWireframe.path);

        if (!wireframeResponse.ok) {
          throw {
            message: 'Failed to load the wireframe image.',
            type: 'network',
            suggestions: ['Check your internet connection.', 'Try a different wireframe.'],
            retry: true
          };
        }

        const wireframeBlob = await wireframeResponse.blob();
        const wireframeFile = new File([wireframeBlob], 'wireframe.jpg', { type: 'image/jpeg' });
        const wireframeBase64 = await convertToBase64(wireframeFile).catch(err => {
          throw {
            message: 'Failed to process the wireframe image.',
            type: 'network',
            suggestions: ['Try a different wireframe.', 'Refresh the page and try again.'],
            retry: true
          };
        });

        // Combine wireframe prompt with ad copy
        const enhancedPrompt = `${selectedWireframe.prompt}

Ad Copy to incorporate:
${adGeneration.adCopy}

Important:
- Position the product exactly as shown in the wireframe
- Maintain all spacing and composition from the wireframe
- Integrate the ad copy naturally into the designated text areas
- Preserve the product's details, colors, and branding exactly as shown in the reference image`;

        setAdGeneration(prev => ({
          ...prev,
          generatedPrompt: enhancedPrompt
        }));

        console.log("AdStudio::Prompt: ", enhancedPrompt);
        console.log("AdStudio:: Number of Outputs: ", adGeneration.numOutputs);

        // Generate the ad images
        try {
          const response = await fetch('/api/generate-ad', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productImage: productBase64,
              wireframeImage: wireframeBase64,
              adCopy: adGeneration.adCopy,
              prompt: enhancedPrompt,
              numOutputs: adGeneration.numOutputs
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Failed to generate ad images.';

            throw {
              message: errorMessage,
              type: response.status === 503 ? 'network' : 'generation',
              suggestions: [
                'Our image generation service might be experiencing high demand.',
                'Try again in a few moments.'
              ],
              retry: true
            };
          }

          const data = await response.json();
          setAdGeneration(prev => ({
            ...prev,
            generatedImages: [...prev.generatedImages, data.imageUrl]
          }));

          // Successfully generated, move to the results step
          setStep(4);
        } catch (err) {
          console.error('Error in API call:', err);
          throw err;
        }
      } catch (err) {
        console.error('Error in wireframe processing:', err);
        throw err;
      }
    } catch (err: any) {
      console.error('Error in generation process:', err);

      if (err && typeof err === 'object' && 'type' in err) {
        setError(err as ErrorState);
      } else {
        setError({
          message: err instanceof Error ? err.message : 'Something went wrong during image generation.',
          type: 'generic',
          suggestions: ['Try again in a few moments.', 'If the problem persists, please contact support.'],
          retry: true
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Add utility function to retry after error
  const handleRetry = () => {
    if (error?.type === 'upload') {
      fileInputRef.current?.click();
    } else if (error?.type === 'generation' || error?.type === 'network') {
      handleGenerate();
    }
    setError(null);
  };

  const resetForm = () => {
    setAdGeneration({
      productImage: null,
      selectedWireframe: '',
      adCopy: '',
      generatedPrompt: '',
      generatedImages: [],
      numOutputs: 1,
    });
    setProductImagePreview(null);
    setError(null);
    setStep(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAdGeneration(prev => ({
        ...prev,
        productImage: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProductImagePreview(null);
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ad Generation Studio</h1>
          <p className="text-gray-600 mt-1">Create professional advertising images for your products</p>
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Upload', 'Wireframe', 'Settings', 'Generate', 'Results'].map((label, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col items-center ${idx <= step ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${idx < step
                  ? 'bg-blue-600 text-white'
                  : idx === step
                    ? 'border-2 border-blue-600 text-blue-600'
                    : 'border-2 border-gray-300 text-gray-400'
                  }`}
              >
                {idx < step ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className="text-sm mt-1">{label}</span>
            </div>
          ))}
        </div>
        <div className="relative flex h-0.5 mt-4">
          <div
            className="absolute bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (step / 4) * 100)}%` }}
          />
          <div className="absolute bg-gray-300 h-full w-full" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            error={error}
            onRetry={error.retry ? handleRetry : undefined}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Content changes based on the current step */}
        <div className="p-8">
          {step === 0 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-semibold">Upload Your Product Image</h2>
              <p className="text-gray-600 text-center max-w-md">
                Select a high-quality photo of your product. For best results, use an image with a clear view of the product.
              </p>

              {!productImagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 w-full max-w-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={productImagePreview}
                      alt="Product preview"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setProductImagePreview(null);
                        setAdGeneration(prev => ({ ...prev, productImage: null }));
                        fileInputRef.current!.value = '';
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Replace
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full max-w-md mt-6">
                <button
                  onClick={() => setStep(1)}
                  disabled={!adGeneration.productImage}
                  className={`w-full py-2 rounded-lg text-white transition-colors ${!adGeneration.productImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-semibold">Select a Wireframe Layout</h2>
              <p className="text-gray-600 text-center max-w-md">
                Choose a wireframe that shows how your product will be positioned in the final ad. The wireframe indicates the layout and composition of your ad.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
                {wireframes.map((wireframe) => (
                  <div
                    key={wireframe.id}
                    onClick={() => {
                      setAdGeneration(prev => ({ ...prev, selectedWireframe: wireframe.id }));
                    }}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${adGeneration.selectedWireframe === wireframe.id
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={wireframe.path}
                        alt={wireframe.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{wireframe.name}</h3>
                      <p className="text-sm text-gray-600">{wireframe.description}</p>
                    </div>
                    {adGeneration.selectedWireframe === wireframe.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between w-full max-w-md mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!adGeneration.selectedWireframe}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${!adGeneration.selectedWireframe
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-semibold">Add Your Ad Copy</h2>
              <p className="text-gray-600 text-center max-w-md">
                Write the text that will appear in your ad. This could include headlines, product descriptions, calls-to-action, or any other text elements.
              </p>

              <div className="w-full max-w-2xl p-6 bg-gray-50 rounded-lg">
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Ad Copy</label>
                  <textarea
                    value={adGeneration.adCopy}
                    onChange={(e) => setAdGeneration(prev => ({ ...prev, adCopy: e.target.value }))}
                    placeholder="Enter your ad copy here... (e.g., 'Discover the perfect blend of style and comfort. Limited time offer - Shop now!')"
                    className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Your text will be integrated into the ad layout based on the selected wireframe.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Number of Variations</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setAdGeneration(prev => ({ ...prev, numOutputs: Math.max(1, prev.numOutputs - 1) }))}
                      className="h-10 w-10 rounded-l-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      disabled={adGeneration.numOutputs <= 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="h-10 w-12 bg-white flex items-center justify-center border-t border-b border-gray-300 text-lg font-medium">
                      {adGeneration.numOutputs}
                    </div>
                    <button
                      onClick={() => setAdGeneration(prev => ({ ...prev, numOutputs: Math.min(3, prev.numOutputs + 1) }))}
                      className="h-10 w-10 rounded-r-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      disabled={adGeneration.numOutputs >= 3}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {adGeneration.numOutputs === 1
                      ? 'Generate 1 ad variation'
                      : `Generate ${adGeneration.numOutputs} ad variations`}
                  </p>
                </div>
              </div>

              <div className="flex justify-between w-full max-w-md mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!adGeneration.adCopy.trim()}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${!adGeneration.adCopy.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
              <h2 className="text-2xl font-semibold">Review Your Ad Settings</h2>
              <p className="text-gray-600 text-center max-w-md">
                Review your selections and generate your professional ad images.
              </p>

              <div className="w-full max-w-2xl p-6 bg-gray-50 rounded-lg space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Your Selections</h3>
                <div className="space-y-6">
                  <div className="flex space-x-4 items-start">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {productImagePreview && (
                        <Image
                          src={productImagePreview}
                          alt="Product"
                          layout="fill"
                          objectFit="cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Product Image</h3>
                      <p className="text-sm text-gray-500">Your uploaded product</p>
                    </div>
                  </div>

                  <div className="flex space-x-4 items-start">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {adGeneration.selectedWireframe && (
                        <Image
                          src={wireframes.find(w => w.id === adGeneration.selectedWireframe)?.path || ''}
                          alt="Wireframe"
                          layout="fill"
                          objectFit="contain"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Selected Wireframe</h3>
                      <p className="text-sm text-gray-500">
                        {wireframes.find(w => w.id === adGeneration.selectedWireframe)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Ad Copy</h3>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{adGeneration.adCopy}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                      <span className="font-medium text-xl">{adGeneration.numOutputs}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Number of Variations</h3>
                      <p className="text-sm text-gray-500">
                        {adGeneration.numOutputs === 1
                          ? '1 image will be generated'
                          : `${adGeneration.numOutputs} images will be generated`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between w-full max-w-md mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Ad'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Your Ad Images</h2>
                <p className="text-gray-600 mt-2">
                  Here are your professionally generated ad images. You can download them individually or all at once.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {adGeneration.generatedImages.map((imageUrl, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="relative h-64 w-full">
                      <Image
                        src={imageUrl}
                        alt={`Generated ad ${index + 1}`}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Ad Version {index + 1}</span>
                      <a
                        href={imageUrl}
                        download={`ad-image-${index + 1}.png`}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex w-full max-w-md justify-center mt-6 space-x-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Start New Ad
                </button>
                {adGeneration.generatedImages.length > 1 && (
                  <a
                    href="#"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download All
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
