import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './common/Icon';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'plaintext' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-secondary rounded-lg my-2 relative group border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-xs text-text-secondary font-sans uppercase tracking-wider">{language}</span>
          <button
              onClick={handleCopy}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded"
              aria-label="Copy code"
          >
              {copied ? (
                  <span className="flex items-center text-xs text-green-500">
                      <CheckIcon className="w-4 h-4 mr-1" /> Copied!
                  </span>
              ) : (
                <span className="flex items-center text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                  <CopyIcon className="w-4 h-4 mr-1" /> Copy
                </span>
              )}
          </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-text-primary">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;