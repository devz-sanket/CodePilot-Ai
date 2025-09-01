import React, { useState } from 'react';
import { debugCode } from '../services/geminiService';
import CodeBlock from './CodeBlock';
import LoadingSpinner from './common/LoadingSpinner';

const DebugView: React.FC = () => {
    const [codeToDebug, setCodeToDebug] = useState('');
    const [problem, setProblem] = useState('');
    const [debugResult, setDebugResult] = useState({ explanation: '', correctedCode: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleDebug = async () => {
        if (!codeToDebug.trim() || !problem.trim()) return;

        setIsLoading(true);
        setError(null);
        setDebugResult({ explanation: '', correctedCode: '' });

        try {
            const result = await debugCode(codeToDebug, problem);
            const explanationMatch = result.match(/Explanation:([\s\S]*)Corrected Code:/);
            const correctedCodeMatch = result.match(/Corrected Code:([\s\S]*)/);

            setDebugResult({
                explanation: explanationMatch ? explanationMatch[1].trim() : "Could not parse explanation.",
                correctedCode: correctedCodeMatch ? correctedCodeMatch[1].trim() : "Could not parse corrected code."
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`Failed to debug code. ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto flex-grow animate-enter">
            {/* Left side: Inputs */}
            <div className="lg:w-1/2 flex flex-col gap-4">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-lg flex-grow flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-text-primary">Code Debugger</h2>
                    <div>
                        <label htmlFor="code-input" className="block text-sm font-medium text-text-secondary mb-2">Paste your code here:</label>
                        <textarea
                            id="code-input"
                            value={codeToDebug}
                            onChange={(e) => setCodeToDebug(e.target.value)}
                            placeholder="function broken() { ... }"
                            className="w-full h-64 p-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="problem-input" className="block text-sm font-medium text-text-secondary mb-2">Describe the bug or paste the error message:</label>
                        <textarea
                            id="problem-input"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="It throws 'TypeError: cannot read property of undefined'..."
                            className="w-full h-32 p-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                        />
                    </div>
                </div>
                 <button
                    onClick={handleDebug}
                    disabled={isLoading || !codeToDebug.trim() || !problem.trim()}
                    className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Debug Code'}
                </button>
            </div>

            {/* Right side: Result */}
            <div className="lg:w-1/2 flex flex-col">
                <div className="flex-grow bg-surface border border-border rounded-xl shadow-lg overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                             <LoadingSpinner isPrimary />
                             <span className="ml-2">Analyzing...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-red-400">{error}</div>
                    ) : debugResult.correctedCode ? (
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="font-semibold text-primary text-lg mb-2">Explanation</h4>
                                <p className="text-text-secondary whitespace-pre-wrap prose prose-sm max-w-none">{debugResult.explanation}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-primary text-lg mb-2">Corrected Code</h4>
                                <CodeBlock code={debugResult.correctedCode} language="auto" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary p-8 text-center">
                            The analysis and corrected code will appear here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebugView;