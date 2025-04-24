'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface WizardStep {
  title: string;
  subtitle: string;
  image: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    title: "Upload Your Product",
    subtitle: "Start by uploading your product image",
    image: "/assets/categories/product.png"
  },
  {
    title: "Choose Template",
    subtitle: "Select from our curated templates",
    image: "/assets/categories/design.png"
  },
  {
    title: "Set Output Options",
    subtitle: "Choose how many variations you want",
    image: "/assets/categories/template.png"
  },
  {
    title: "Generating Your Ad",
    subtitle: "Our AI is creating your perfect ad",
    image: "/assets/categories/ad.png"
  }
];

export default function AdWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [numOutputs, setNumOutputs] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="h-[400px] flex items-center justify-center">
            <div
              className={`w-full h-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ease-in-out
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-4 text-lg">Drop your product image here or</p>
                  <label className="inline-block px-6 py-3 bg-blue-500 text-white font-medium rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="h-[400px] p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-6 h-full">
              {['Natural', 'Modern', 'Vintage', 'Minimal'].map((template) => (
                <div
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`cursor-pointer rounded-xl p-4 transition-all duration-200 flex flex-col ${
                    selectedTemplate === template
                      ? 'bg-blue-50 ring-2 ring-blue-500'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 relative rounded-lg overflow-hidden">
                    <Image
                      src="/assets/categories/design.png"
                      alt={template}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 mt-3 text-center">{template}</h3>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-8">How many variations would you like?</h3>
              <div className="flex space-x-6">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumOutputs(num)}
                    className={`w-20 h-20 rounded-xl text-xl font-medium transition-all duration-200 ${
                      numOutputs === num
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="h-[400px] flex flex-col items-center justify-center">
            <div className="text-center space-y-8">
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xl text-gray-700">Our AI is crafting your perfect ad...</p>
              <div className="w-80 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="h-screen">
        <div className="bg-white h-full">
          <div className="grid grid-cols-2 h-full">
            {/* Left side - Action Area */}
            <div className="p-8">
              <div className="h-full flex flex-col">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">{WIZARD_STEPS[currentStep].title}</h1>
                  <p className="text-gray-600 mt-2">{WIZARD_STEPS[currentStep].subtitle}</p>
                </div>
                
                <div className="flex-1">
                  {renderStepContent()}
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t">
                  <button
                    onClick={handleBack}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      currentStep === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    disabled={currentStep === 0}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      currentStep === WIZARD_STEPS.length - 1
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {currentStep === WIZARD_STEPS.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Preview Area */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 flex items-center justify-center">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image
                  src={WIZARD_STEPS[currentStep].image}
                  alt="Step preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 