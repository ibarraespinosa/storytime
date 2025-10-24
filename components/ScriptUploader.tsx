
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, SparklesIcon } from './icons';

interface ScriptUploaderProps {
  onScriptUpload: (scriptText: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  script: string;
}

export const ScriptUploader: React.FC<ScriptUploaderProps> = ({ onScriptUpload, onGenerate, isLoading, script }) => {
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onScriptUpload(text);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onScriptUpload(event.target.value);
    if(fileName) setFileName('');
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-white mb-4">1. Your Script</h2>
      <div className="flex-grow flex flex-col">
        <textarea
          value={script}
          onChange={handleTextChange}
          placeholder="Paste your script here, or upload a .txt file below."
          className="w-full flex-grow bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
          rows={10}
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleButtonClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-md transition duration-200"
          >
            <UploadIcon className="w-5 h-5" />
            <span>{fileName || 'Upload .txt File'}</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt"
            />
          </button>
          <button
            onClick={onGenerate}
            disabled={isLoading || !script}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-md transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                <span>Generate Storyboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
