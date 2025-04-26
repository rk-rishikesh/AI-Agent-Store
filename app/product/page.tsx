'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ErrorMessage } from '@/components';
import type { ErrorState, ErrorType } from '@/components/ErrorMessage';

// Keep only the product generation type and modify it
type ProductGeneration = {
  productImage: File | null;
  selectedTemplate: string;
  generatedPrompt: string;
  generatedImages: string[];
  numOutputs: number;
};

export default function ProductStudio() {
  // Keep only the product generation state with modified fields
  const [productGeneration, setProductGeneration] = useState<ProductGeneration>({
    productImage: null,
    selectedTemplate: '',
    generatedPrompt: '',
    generatedImages: [],
    numOutputs: 1,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [step, setStep] = useState(0);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    {
      id: "template1",
      path: "/templates/template 1.jpg",
      name: "Natural Beauty",
      prompt: "Create a professional studio photograph of this product on a clean white background with soft natural lighting. Emphasize the product's texture and details with subtle shadows. Use a bright, airy aesthetic with slightly warm tones."
    },
    {
      id: "template2",
      path: "/templates/template 2.jpg",
      name: "Day Light",
      prompt: "Capture this product in bright daylight setting with natural shadows. Place it on a light wooden surface with some soft environmental elements in the background. Create a lifestyle context that highlights the product's everyday use."
    },
    {
      id: "template3",
      path: "/templates/template 3.jpg",
      name: "Gold Style",
      prompt: "Present this product in a luxury setting with golden accents and dramatic lighting. Use a dark background with rich, warm tones. Create elegant highlights that accentuate the premium quality of the product with a sophisticated atmosphere."
    },
    {
      id: "template4",
      path: "/templates/template 4.jpg",
      name: "Nature's Table",
      prompt: "Photograph this product in a natural setting with organic elements like wood, plants, or stone. Use a rustic aesthetic with earthy tones and natural textures. Create a harmonious composition that connects the product with nature."
    },
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
    if (!productGeneration.productImage) {
      setError({
        message: 'Please upload a product image to continue.',
        type: 'upload',
        suggestions: ['Select an image from your device.'],
        retry: false
      });
      return;
    }

    if (!productGeneration.selectedTemplate) {
      setError({
        message: 'Please select a template style before generating.',
        type: 'template',
        suggestions: ['Choose one of the available template styles.'],
        retry: false
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const productBase64 = await convertToBase64(productGeneration.productImage).catch(err => {
        throw {
          message: 'Failed to process the product image.',
          type: 'upload',
          suggestions: ['Try a different image format.', 'Make sure the image is not corrupted.'],
          retry: true
        };
      });

      // Get the template path and prompt for the selected template
      const selectedTemplate = templates.find(t => t.id === productGeneration.selectedTemplate);

      if (!selectedTemplate) {
        throw {
          message: 'Invalid template selected.',
          type: 'template',
          suggestions: ['Try selecting a different template.', 'Refresh the page and try again.'],
          retry: false
        };
      }

      try {
        // Fetch the template image and convert to base64
        const templateResponse = await fetch(selectedTemplate.path);

        if (!templateResponse.ok) {
          throw {
            message: 'Failed to load the template image.',
            type: 'network',
            suggestions: ['Check your internet connection.', 'Try a different template.'],
            retry: true
          };
        }

        const templateBlob = await templateResponse.blob();
        const templateFile = new File([templateBlob], 'template.jpg', { type: 'image/jpeg' });
        const templateBase64 = await convertToBase64(templateFile).catch(err => {
          throw {
            message: 'Failed to process the template image.',
            type: 'network',
            suggestions: ['Try a different template.', 'Refresh the page and try again.'],
            retry: true
          };
        });

        // Use the predefined prompt from the template
        const prompt = selectedTemplate.prompt;

        setProductGeneration(prev => ({
          ...prev,
          generatedPrompt: prompt
        }));

        console.log("ProductStudio::Prompt: ", prompt);
        console.log("ProductStudio:: Number of Outputs: ", productGeneration.numOutputs);

        // Generate the studio photos
        try {
          const response = await fetch('/api/generate-studio-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productImage: productBase64,
              templateImage: templateBase64,
              prompt,
              numOutputs: productGeneration.numOutputs
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || 'Failed to generate studio photos.';

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
          setProductGeneration(prev => ({
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
        console.error('Error in template processing:', err);
        throw err;
      }
    } catch (err: any) {
      console.error('Error in generation process:', err);

      // If it's already our error structure, use it
      if (err && typeof err === 'object' && 'type' in err) {
        setError(err as ErrorState);
      } else {
        // Otherwise create a generic error
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
    setProductGeneration({
      productImage: null,
      selectedTemplate: '',
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
      setProductGeneration(prev => ({
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

  // Generate the steps list for the progress indicator
  const steps = [
    { name: 'Upload Image', status: step >= 0 ? 'current' : 'upcoming' },
    { name: 'Select Template', status: step >= 1 ? 'current' : 'upcoming' },
    { name: 'Output Count', status: step >= 2 ? 'current' : 'upcoming' },
    { name: 'Review & Generate', status: step >= 3 ? 'current' : 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">Product Studio</h1>

          {/* Progress Indicator */}
          {step < 4 && (
            <div className="w-full mb-8">
              <div className="flex items-center justify-between">
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                        } transition-colors duration-200`}
                    >
                      {i + 1}
                    </div>
                    <span className={`mt-2 text-xs ${step >= i ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}>
                      {s.name}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`hidden sm:block h-0.5 w-16 ${step > i ? 'bg-blue-600' : 'bg-gray-200'
                        } mx-2`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex w-full mt-2 justify-between">
                {steps.map((s, i) => (
                  <div key={`line-${i}`} className={`h-0.5 flex-1 ${i < steps.length - 1 ? (step > i ? 'bg-blue-600' : 'bg-gray-200') : 'bg-transparent'
                    }`}></div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              {/* Show global error at the top if any */}
              {error && (
                <div className="mb-6 flex justify-center">
                  <ErrorMessage
                    error={error}
                    onRetry={error.retry ? handleRetry : undefined}
                    onDismiss={() => setError(null)}
                  />
                </div>
              )}

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
                    <div className="relative w-full max-w-md">
                      <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <Image
                          src={productImagePreview}
                          alt="Product preview"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <div className="mt-4 flex justify-center space-x-4">
                        <button
                          onClick={() => {
                            setProductImagePreview(null);
                            setProductGeneration(prev => ({
                              ...prev,
                              productImage: null
                            }));
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Select a Style Template</h2>
                  <p className="text-gray-600 text-center max-w-md">
                    Choose a visual style for your product photos. Each template offers a different aesthetic.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => {
                          setProductGeneration(prev => ({ ...prev, selectedTemplate: template.id }));
                        }}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${productGeneration.selectedTemplate === template.id
                          ? 'border-blue-500 shadow-md ring-2 ring-blue-300'
                          : 'border-gray-200 hover:border-blue-300'
                          }`}
                      >
                        <div className="relative h-32 w-full">
                          <Image
                            src={template.path}
                            alt={template.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-sm font-medium">{template.name}</p>
                        </div>
                        {productGeneration.selectedTemplate === template.id && (
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
                      disabled={!productGeneration.selectedTemplate}
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${!productGeneration.selectedTemplate
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
                  <h2 className="text-2xl font-semibold">How Many Images Do You Want?</h2>
                  <p className="text-gray-600 text-center max-w-md">
                    Select the number of variations you'd like us to generate.
                    More images give you more options to choose from.
                  </p>
                  <div className="flex flex-col items-center space-y-6 w-full max-w-md">
                    <div className="flex items-center justify-around w-full">
                      {[1, 2, 3, 4].map((num) => (
                        <div
                          key={num}
                          onClick={() => {
                            setProductGeneration(prev => ({ ...prev, numOutputs: num }));
                          }}
                          className={`flex flex-col items-center space-y-2 cursor-pointer`}
                        >
                          <div className={`flex items-center justify-center h-16 w-16 rounded-lg transition-all ${productGeneration.numOutputs === num
                            ? 'bg-blue-500 text-white scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}>
                            <span className="font-medium text-xl">{num}</span>
                          </div>
                          <span className={`text-sm ${productGeneration.numOutputs === num ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {num === 1 ? 'One Image' : `${num} Images`}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 italic mt-4">
                      {productGeneration.numOutputs > 1
                        ? `You'll get ${productGeneration.numOutputs} different variations of your product.`
                        : `You'll get a single refined image of your product.`}
                    </p>
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Review & Generate</h2>
                  <p className="text-gray-600 text-center max-w-md">
                    Check your selections and click Generate when you're ready.
                  </p>

                  <div className="w-full max-w-md bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex space-x-4 items-center">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
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
                        <h3 className="font-medium">Your Product</h3>
                        <p className="text-sm text-gray-500">
                          {productGeneration.productImage?.name || "Product image"}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4 items-center">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        {productGeneration.selectedTemplate && (
                          <Image
                            src={templates.find(t => t.id === productGeneration.selectedTemplate)?.path || ''}
                            alt="Template"
                            layout="fill"
                            objectFit="cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Template Style</h3>
                        <p className="text-sm text-gray-500">
                          {templates.find(t => t.id === productGeneration.selectedTemplate)?.name || "Selected template"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-100 text-blue-700 shrink-0">
                        <span className="font-medium text-xl">{productGeneration.numOutputs}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Number of Images</h3>
                        <p className="text-sm text-gray-500">
                          {productGeneration.numOutputs === 1
                            ? '1 image will be generated'
                            : `${productGeneration.numOutputs} images will be generated`}
                        </p>
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
                      disabled={isGenerating || !productGeneration.productImage || !productGeneration.selectedTemplate}
                      className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${isGenerating || !productGeneration.productImage || !productGeneration.selectedTemplate
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </div>
                      ) : `Generate ${productGeneration.numOutputs} Product Image${productGeneration.numOutputs > 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && productGeneration.generatedImages.length > 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <div className="flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-center">Your Product Images Are Ready!</h2>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    Here are your professionally generated product images. You can download them individually.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {productGeneration.generatedImages.map((imageUrl, index) => (
                      <div key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-64 w-full rounded overflow-hidden bg-gray-50">
                          <Image
                            src={imageUrl}
                            alt={`Generated Product ${index + 1}`}
                            layout="fill"
                            objectFit="contain"
                            className="rounded"
                          />
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="font-medium">Image {index + 1}</span>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = imageUrl;
                              link.download = `product-image-${index + 1}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center space-x-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 w-full">
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create More Images
                    </button>
                    <Link href="/" className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-center">
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
