import React, { useState } from 'react';
import { Upload, FileImage, Sparkles, Loader2, X } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(''); // Clear previous result
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsAnalyzing(true);
    setResult('');
    try {
        const analysis = await analyzeImage(previewUrl, selectedFile.type, prompt || "Identify the main subjects and explain the educational value of this image.");
        setResult(analysis || "No analysis returned.");
    } catch (error) {
        setResult("Failed to analyze image. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
            <FileImage className="w-6 h-6 text-indigo-600 mr-2" />
            Image Analysis
         </h2>
         <p className="text-gray-600 mb-6">Upload an educational image, diagram, or chart, and our AI will analyze it for you.</p>

         {!previewUrl ? (
            <div className="flex items-center justify-center w-full">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                    </div>
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
         ) : (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center">
                <button 
                  onClick={handleClear}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-600"
                >
                    <X className="w-5 h-5"/>
                </button>
                <img src={previewUrl} alt="Preview" className="max-h-80 object-contain w-full" />
            </div>
         )}
      </div>

      {previewUrl && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <label className="block text-sm font-medium text-gray-700 mb-2">Optional Prompt</label>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., What mathematical formula is shown here?"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                 />
                 <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                 >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                 </button>
             </div>
          </div>
      )}

      {result && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Result</h3>
            <div className="prose prose-indigo max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="whitespace-pre-wrap">{result}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;