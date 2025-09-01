import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, MessageSender, User } from '../types';
import { SendIcon, BotIcon, LogoIcon } from './common/Icon';
import CodeBlock from './CodeBlock';

interface ChatViewProps {
    user: User | null;
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (input: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ user, messages, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasSentMessage = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        hasSentMessage.current = true;
        onSendMessage(input);
        setInput('');
    };

    const AITypingIndicator = () => (
         <div className="flex items-start gap-4 animate-enter">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm">
                <BotIcon className="w-6 h-6 text-primary" />
            </div>
             <div className="max-w-xl p-4 rounded-xl bg-surface border border-border text-text-primary shadow-sm">
                <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                </div>
             </div>
         </div>
    );

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto flex-grow">
            <div className="flex-grow overflow-y-auto p-4 space-y-8 scroll-smooth">
                {messages.length === 0 && !hasSentMessage.current && (
                    <div className="text-center text-text-secondary flex flex-col items-center justify-center h-full">
                        <LogoIcon className="w-20 h-20 text-primary/50 mb-4" />
                        <h2 className="text-4xl font-bold text-text-primary mb-2">
                          CodePilot
                        </h2>
                        <p>Hi {user?.name}, ask me anything about coding!</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 animate-enter ${msg.sender === MessageSender.User ? 'justify-end' : ''}`}>
                         {msg.sender === MessageSender.AI && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shadow-sm">
                                <BotIcon className="w-6 h-6 text-primary" />
                            </div>
                        )}
                        <div className={`prose prose-sm md:prose-base max-w-2xl p-4 rounded-xl shadow-sm ${msg.sender === MessageSender.User ? 'bg-primary text-white prose-invert' : 'bg-surface text-text-primary border border-border'}`}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p({ children }) {
                                        return <p className="mb-2 last:mb-0">{children}</p>;
                                    },
                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return match ? (
                                            <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
                                        ) : (
                                            <code className="bg-black/10 dark:bg-white/10 px-1.5 py-1 rounded text-sm font-mono" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                        {msg.sender === MessageSender.User && (
                             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm text-white font-bold text-lg">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (messages.length === 0 || messages[messages.length - 1]?.sender === MessageSender.User) && (
                     <AITypingIndicator />
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="p-4 bg-transparent mt-auto sticky bottom-0">
                <div className="relative bg-surface rounded-full border border-border shadow-lg focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a coding question..."
                        disabled={isLoading}
                        className="w-full pl-6 pr-16 py-4 bg-transparent border-none rounded-full focus:outline-none focus:ring-0 text-lg"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-primary text-white disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95 transition-colors shadow-md">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatView;
