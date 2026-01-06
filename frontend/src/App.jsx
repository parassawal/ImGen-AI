import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import ModelSelector from './components/ModelSelector';
import { MessageSquare, Image as ImageIcon, Zap, Video as VideoIcon } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [activeTab, setActiveTab] = useState('image'); // 'chat', 'image', 'video'

  return (
    <div className="flex h-screen bg-background text-white overflow-hidden font-sans selection:bg-accent selection:text-white">
      {/* Sidebar */}
      <aside className="w-80 bg-surface border-r border-white/5 flex flex-col p-4 gap-6 shrink-0 z-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Zap size={24} fill="white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ImGen <span className="text-primary font-light">AI</span></h1>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('image')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'image'
                ? "bg-gradient-to-r from-accent/20 to-transparent text-accent border-l-2 border-accent"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <ImageIcon size={20} />
            Image Generation
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'video'
                ? "bg-gradient-to-r from-pink-500/20 to-transparent text-pink-500 border-l-2 border-pink-500"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <VideoIcon size={20} />
            Video Generation
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              activeTab === 'chat'
                ? "bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-2 border-primary"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <MessageSquare size={20} />
            Chat Assistant
          </button>
        </div>

        <div className="mt-auto">
          <ModelSelector onModelLoaded={(name) => console.log(`Loaded ${name}`)} />
          <div className="mt-4 text-xs text-gray-500 text-center">
            Supports .safetensors (SD & SVD)
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="h-full p-8 relative z-0">
          {activeTab === 'image' && <ImageGenerator />}
          {activeTab === 'video' && <VideoGenerator />}
          {activeTab === 'chat' && <ChatInterface />}
        </div>
      </main>
    </div>
  );
}

export default App;
