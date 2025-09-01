import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './common/LoadingSpinner';

const ImageView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        
        try {
            const images = await generateImage(prompt);
            setGeneratedImages(images);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto flex-grow animate-enter gap-6">
            <div className="bg-surface p-6 rounded-xl border border-border shadow-lg flex flex-col">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Image Generation</h2>
                <p className="text-text-secondary mb-4">Describe the image you want to create. Be creative and descriptive!</p>
                <div className="flex gap-2">
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'A photorealistic portrait of an astronaut riding a unicorn on Mars'"
                        className="w-full p-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Generate'}
                    </button>
                </div>
            </div>

            <div className="flex-grow bg-surface border border-border rounded-xl p-4 overflow-y-auto shadow-lg h-full flex flex-col">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <LoadingSpinner isPrimary/>
                        <span className="ml-2 mt-2">Conjuring up some images...</span>
                     </div>
                ) : error ? (
                    <div className="p-4 text-red-400 text-center">{error}</div>
                ) : generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {generatedImages.map((base64Image, index) => (
                           <img 
                                key={index}
                                src={`data:image/png;base64,${base64Image}`}
                                alt={`Generated image ${index + 1} for prompt: ${prompt}`}
                                className="w-full h-full object-cover rounded-lg shadow-md animate-enter"
                           />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary p-8 text-center">
                       Your generated images will appear here.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageView;