import React, { useState } from 'react';
import { buildCode } from '../services/geminiService';
import CodeBlock from './CodeBlock';
import LoadingSpinner from './common/LoadingSpinner';

const BuildView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBuild = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedCode('');
        
        try {
            const code = await buildCode(prompt);
            setGeneratedCode(code);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Failed to build code. ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-grow animate-enter">
            {/* Left side: Prompt */}
            <div className="lg:w-1/3 flex flex-col gap-4">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-lg flex-grow flex flex-col">
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Code Builder</h2>
                    <p className="text-text-secondary mb-4">Describe the code you want to build. Be as specific as possible for the best results.</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'A React component for a responsive pricing table with three tiers...'"
                        className="w-full flex-grow p-4 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
                        rows={10}
                    />
                </div>
                <button
                    onClick={handleBuild}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Build Code'}
                </button>
            </div>

            {/* Right side: Generated Code */}
            <div className="lg:w-2/3 flex flex-col">
                <div className="flex-grow bg-surface border border-border rounded-xl p-1 overflow-hidden shadow-lg h-full flex flex-col">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-full text-text-secondary">
                            <LoadingSpinner isPrimary/>
                            <span className="ml-2">Generating...</span>
                         </div>
                    ) : error ? (
                        <div className="p-4 text-red-400">{error}</div>
                    ) : generatedCode ? (
                        <CodeBlock code={generatedCode} language="auto" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary p-8 text-center">
                           Your generated code will appear here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuildView;