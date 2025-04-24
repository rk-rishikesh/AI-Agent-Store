'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

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

  const generateStudioPhotos = async (productImageBase64: string, templateImageBase64: string, prompt: string, numOutputs: number) => {
    const imagePromises = [];

    // Instead of making multiple API calls, make a single call with numOutputs
    const response = await fetch('/api/generate-studio-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productImage: productImageBase64,
        templateImage: templateImageBase64,
        prompt,
        numOutputs
      }),
    });

    const result = await response.json();
    console.log("ProductStudio::Result: ", result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate image');
    }

    // For now, we only get one image back, but we'll put it in an array
    // for consistency with the previous implementation
    setProductGeneration(prev => ({
      ...prev,
      generatedImages: [result.imageUrl]
    }));
  };

  const handleGenerate = async () => {
    if (!productGeneration.productImage || !productGeneration.selectedTemplate) {
      setError('Please upload a product image and select a template.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const productBase64 = await convertToBase64(productGeneration.productImage);

      // Get the template path and prompt for the selected template
      const selectedTemplate = templates.find(t => t.id === productGeneration.selectedTemplate);

      if (!selectedTemplate) {
        throw new Error('Invalid template selected');
      }

      // Fetch the template image and convert to base64
      const templateResponse = await fetch(selectedTemplate.path);
      const templateBlob = await templateResponse.blob();
      const templateFile = new File([templateBlob], 'template.jpg', { type: 'image/jpeg' });
      const templateBase64 = await convertToBase64(templateFile);

      // Use the predefined prompt from the template
      const prompt = selectedTemplate.prompt;

      setProductGeneration(prev => ({
        ...prev,
        generatedPrompt: prompt
      }));

      console.log("ProductStudio::Prompt: ", prompt);
      console.log("ProductStudio:: Number of Outputs: ", productGeneration.numOutputs);

      // Use the new generateStudioPhotos function
      await generateStudioPhotos(productBase64, templateBase64, prompt, productGeneration.numOutputs);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsGenerating(false);
      setStep(4);
    }
  };

  const resetForm = () => {
    setProductGeneration({
      productImage: null,
      selectedTemplate: '',
      generatedPrompt: '',
      generatedImages: [],
      numOutputs: 1,
    });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">Product Studio</h1>

          <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              {step === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Step 1: Upload Product Image</h2>
                  <p className="text-gray-600">Upload the photo of your product</p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={(e) => {
                      setProductGeneration(prev => ({
                        ...prev,
                        productImage: e.target.files?.[0] || null
                      }));
                      setStep(1);
                    }}
                    className="w-full max-w-md text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-lg file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Step 2: Select a Template</h2>
                  <p className="text-gray-600">Choose a style template for your product</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => {
                          setProductGeneration(prev => ({ ...prev, selectedTemplate: template.id }));
                          setStep(2);
                        }}
                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          productGeneration.selectedTemplate === template.id
                            ? 'border-blue-500 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Step 3: Number of Output Images</h2>
                  <p className="text-gray-600">How many different product shots do you want?</p>
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        onClick={() => {
                          setProductGeneration(prev => ({ ...prev, numOutputs: num }));
                          setStep(3);
                        }}
                        className={`flex items-center justify-center h-12 w-12 rounded-lg cursor-pointer transition-all ${
                          productGeneration.numOutputs === num
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="font-medium">{num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Step 4: Generate Images</h2>
                  {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !productGeneration.productImage || !productGeneration.selectedTemplate}
                    className={`px-6 py-3 rounded-lg text-white font-medium ${
                      isGenerating || !productGeneration.productImage || !productGeneration.selectedTemplate
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : `Generate ${productGeneration.numOutputs} Product Image${productGeneration.numOutputs > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {step === 4 && productGeneration.generatedImages.length > 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
                  <h2 className="text-2xl font-semibold">Your Product Images Are Ready!</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {productGeneration.generatedImages.map((imageUrl, index) => (
                      <div key={index} className="border rounded-lg p-3 shadow-sm">
                        <img
                          src={imageUrl}
                          alt={`Generated Product ${index + 1}`}
                          className="rounded w-full h-auto"
                        />
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm font-medium">Shot {index + 1}</span>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = imageUrl;
                              link.download = `product-image-${index + 1}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                  >
                    Create More Images
                  </button>
                </div>
              )}

              {step > 0 && step < 4 && !productGeneration.generatedImages.length && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setStep(prev => prev + 1)}
                    disabled={!productGeneration.productImage || !productGeneration.selectedTemplate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
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
    </div>
  );
} 
