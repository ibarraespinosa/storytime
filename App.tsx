import React, { useState, useCallback, useRef } from 'react';
import type { Scene, ChatMessage } from './types';
import { ScriptUploader } from './components/ScriptUploader';
import { StoryboardPanel } from './components/StoryboardPanel';
import { Chatbot } from './components/Chatbot';
import { parseScriptIntoScenes, generateImageForScene, sendMessageToChat } from './services/geminiService';
import { LogoIcon } from './components/icons';
import type { Chat } from '@google/genai';

const sampleScript = `SCENE START

INT. SPACESHIP COCKPIT - NIGHT

A lone ASTRONAUT, ELARA, sips coffee from a thermal mug. The cockpit is dark, illuminated only by the soft glow of distant nebulae on the main viewscreen.

CLOSE UP - ELARA'S EYES
They reflect the starfield, wide with a mix of wonder and weariness.

EXT. SPACESHIP - CONTINUOUS
The small ship, the "Stardust Drifter," floats silently through the cosmic void. A vibrant, swirling galaxy looms in the background.

INT. SPACESHIP COCKPIT - CONTINUOUS
Suddenly, a red alert flashes across the control panel. Elara spills her coffee, eyes snapping to the warning display. A large, unknown object is approaching fast.

SCENE END`;

export default function App() {
  const [script, setScript] = useState<string>(sampleScript);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);

  const chatRef = useRef<Chat | null>(null);

  const handleScriptUpload = (scriptText: string) => {
    setScript(scriptText);
    setScenes([]);
    setError(null);
  };

  const handleGenerateStoryboard = useCallback(async () => {
    if (!script) {
      setError('Please upload a script first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setScenes([]);

    try {
      const parsedSceneDescriptions = await parseScriptIntoScenes(script);
      const initialScenes: Scene[] = parsedSceneDescriptions.map((scene, index) => ({
        id: `scene-${index}-${Date.now()}`,
        description: scene.description,
        imageUrl: null,
        status: 'generating',
      }));
      setScenes(initialScenes);

      await Promise.all(
        initialScenes.map(async (scene) => {
          try {
            const imageUrl = await generateImageForScene(scene.description);
            setScenes((prevScenes) =>
              prevScenes.map((s) =>
                s.id === scene.id ? { ...s, imageUrl, status: 'completed' } : s
              )
            );
          } catch (e) {
            console.error(`Failed to generate image for scene: ${scene.description}`, e);
            setScenes((prevScenes) =>
              prevScenes.map((s) =>
                s.id === scene.id ? { ...s, status: 'error' } : s
              )
            );
          }
        })
      );
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while parsing the script.';
      setError(`Failed to process script. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [script]);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsChatProcessing(true);
    const userMessage: ChatMessage = { id: `chat-${Date.now()}`, role: 'user', text: message };
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
        const { response, updatedChat } = await sendMessageToChat(chatRef.current, message);
        chatRef.current = updatedChat;
        const modelMessage: ChatMessage = { id: `chat-${Date.now()+1}`, role: 'model', text: response };
        setChatMessages(prev => [...prev, modelMessage]);
    } catch (e) {
        console.error("Chat error:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        const errorResponseMessage: ChatMessage = { id: `chat-error-${Date.now()}`, role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` };
        setChatMessages(prev => [...prev, errorResponseMessage]);
    } finally {
        setIsChatProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Storyboard Generator
            </h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <ScriptUploader
              onScriptUpload={handleScriptUpload}
              onGenerate={handleGenerateStoryboard}
              isLoading={isLoading}
              script={script}
            />
            <Chatbot 
              messages={chatMessages} 
              onSendMessage={handleSendMessage} 
              isProcessing={isChatProcessing} 
            />
          </div>

          <div className="lg:col-span-2">
            <StoryboardPanel scenes={scenes} isLoading={isLoading} error={error} hasScript={!!script} />
          </div>
        </div>
      </main>
    </div>
  );
}