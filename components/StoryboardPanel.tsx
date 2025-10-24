import React from 'react';
import type { Scene } from '../types';
import { FilmIcon, ExclamationIcon } from './icons';

interface StoryboardPanelProps {
  scenes: Scene[];
  isLoading: boolean;
  error: string | null;
  hasScript: boolean;
}

interface SceneCardProps {
  scene: Scene;
  sceneNumber: number;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, sceneNumber }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden flex flex-col relative">
      <div className="absolute top-2 left-2 bg-gray-900/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-600 backdrop-blur-sm z-10">
        {sceneNumber}
      </div>
      <div className="aspect-video bg-gray-900/70 flex items-center justify-center">
        {scene.status === 'generating' && (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Generating image...</span>
          </div>
        )}
        {scene.status === 'completed' && scene.imageUrl && (
          <img src={scene.imageUrl} alt={scene.description} className="w-full h-full object-cover" />
        )}
        {scene.status === 'error' && (
          <div className="flex flex-col items-center gap-2 text-red-400 p-4 text-center">
            <ExclamationIcon className="w-8 h-8"/>
            <span className="text-sm font-semibold">Image Failed</span>
            <span className="text-xs text-gray-400">Could not generate image for this scene.</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-grow">
        <p className="text-sm text-gray-300">{scene.description}</p>
      </div>
    </div>
  );
};

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ scenes, isLoading, error, hasScript }) => {
  const hasScenes = scenes.length > 0;
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-8">
          <h3 className="text-lg font-bold">Generation Failed</h3>
          <p className="mt-2">{error}</p>
        </div>
      );
    }
    
    if (hasScenes) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenes.map((scene, index) => (
            <SceneCard key={scene.id} scene={scene} sceneNumber={index + 1} />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl p-12">
        <FilmIcon className="mx-auto h-12 w-12 text-gray-600"/>
        <h3 className="mt-4 text-lg font-semibold text-gray-300">Your Storyboard Awaits</h3>
        <p className="mt-1 text-sm">
          {hasScript 
            ? "Click 'Generate Storyboard' to bring your script to life."
            : "Upload or paste a script to get started."}
        </p>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 h-full">
      <h2 className="text-lg font-semibold text-white mb-4">2. Generated Storyboard</h2>
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};