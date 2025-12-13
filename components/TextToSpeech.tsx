import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Square, Loader2, Sparkles } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on mount
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
    });
    return () => {
        audioContextRef.current?.close();
    };
  }, []);

  const handleSpeak = async () => {
    if (!text.trim() || isGenerating) return;
    
    // Stop any current playback
    handleStop();

    setIsGenerating(true);
    try {
      const audioBuffer = await generateSpeech(text);
      playAudio(audioBuffer);
    } catch (error) {
      console.error("Failed to generate speech", error);
      alert("Failed to generate speech. Please check your text or connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
     if (!audioContextRef.current) return;
     
     // Resume context if suspended (browser policy)
     if (audioContextRef.current.state === 'suspended') {
         audioContextRef.current.resume();
     }

     const source = audioContextRef.current.createBufferSource();
     source.buffer = buffer;
     source.connect(audioContextRef.current.destination);
     
     source.onended = () => {
         setIsPlaying(false);
     };

     sourceNodeRef.current = source;
     source.start();
     setIsPlaying(true);
  };

  const handleStop = () => {
    if (sourceNodeRef.current) {
        try {
            sourceNodeRef.current.stop();
        } catch (e) {
            // ignore if already stopped
        }
        sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center">
                <Volume2 className="w-6 h-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">Text to Speech Engine</h2>
            </div>
            {isPlaying && (
                <div className="flex items-center text-indigo-600 text-sm animate-pulse font-medium">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-1"></span>
                    Speaking...
                </div>
            )}
        </div>

        <div className="flex-1 p-6 flex flex-col space-y-6">
            <div className="flex-1 relative">
                <textarea 
                    className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 text-lg leading-relaxed placeholder-gray-400 bg-white"
                    placeholder="Enter text here that you would like the AI to read aloud..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {text.length} characters
                </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                    Powered by Gemini 2.5 Flash TTS
                </div>
                <div className="flex gap-3">
                    {isPlaying ? (
                        <button 
                            onClick={handleStop}
                            className="flex items-center px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Square className="w-4 h-4 mr-2 fill-current" />
                            Stop
                        </button>
                    ) : (
                         <button 
                            onClick={handleSpeak}
                            disabled={isGenerating || !text}
                            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                         >
                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                            {isGenerating ? 'Generating...' : 'Speak'}
                         </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TextToSpeech;