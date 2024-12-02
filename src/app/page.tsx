"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the ModelViewer component with SSR disabled
const ModelViewer = dynamic(() => import('@/components/MagicPotionModel'), { ssr: false });

const colors = [
  { name: 'Pink', value: '#FF69B4' },
  { name: 'Yellow', value: '#FFD700' },
  { name: 'Blue', value: '#1E90FF' },
  { name: 'Green', value: '#32CD32' }
];

const models = [
  { name: 'Magic Potion', path: '/models/magic_potion.glb' },
  { name: 'Tiger', path: '/models/tiger_model.glb' },
  { name: 'Octopus', path: '/models/octopus.glb' },
  { name: 'Arch', path: '/models/arch.glb' },
];

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="w-32 h-32 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <h2 className="mt-8 text-2xl font-bold text-gray-800">Loading amazing 3D models...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-gray-100 to-gray-200">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">
        3D Model <span className="font-serif italic" style={{ fontFamily: "'Playfair Display', serif" }}>Viewer</span>
      </h1>
      <div className="w-full max-w-3xl mb-8 bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <div className="flex border-b border-gray-200">
          {models.map((model) => (
            <button
              key={model.name}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors duration-200 ${
                selectedModel.name === model.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedModel(model)}
            >
              {model.name}
            </button>
          ))}
        </div>
        <div className="h-[400px] rounded-b-xl overflow-hidden">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
            <ModelViewer color={selectedColor} modelPath={selectedModel.path} />
          </Suspense>
        </div>
      </div>
      <div className="flex space-x-6 mb-8">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`w-12 h-12 rounded-full focus:outline-none transition-all duration-200 ${
              selectedColor === color.value 
                ? 'ring-4 ring-offset-4 ring-blue-500 transform scale-110' 
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => setSelectedColor(color.value)}
            aria-label={`Select ${color.name} color`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600 text-center max-w-2xl leading-relaxed">
        Select a model using the tabs above. Interact with the model: Click and drag to rotate, scroll to zoom. 
        Click on a color to change the model's appearance.
      </p>
    </div>
  );
}
