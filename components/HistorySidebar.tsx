import React, { Fragment } from 'react';
import { ChatSession } from '../types';
import { PlusIcon, TrashIcon, XIcon, LogoIcon } from './common/Icon';

interface HistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  setIsOpen,
}) => {
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-text-primary border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border h-20">
        <div className="flex items-center">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold ml-3">History</h2>
        </div>
        <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-secondary"
            aria-label="Close history sidebar"
        >
            <XIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="p-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary bg-primary text-white hover:bg-primary/90"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>
      <nav className="flex-grow overflow-y-auto p-2 space-y-1">
        {sortedSessions.map((session) => (
          <a
            key={session.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectSession(session.id);
            }}
            className={`group flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors duration-150 ${
              activeSessionId === session.id
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
            }`}
          >
            <span className="truncate flex-1">{session.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className={`ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                activeSessionId === session.id 
                ? 'text-primary/70 hover:text-primary hover:bg-primary/20'
                : 'text-text-secondary/70 hover:text-text-primary hover:bg-surface'
              }`}
              aria-label={`Delete chat: ${session.title}`}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </a>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
       {isOpen && (
            <div
                className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                onClick={() => setIsOpen(false)}
            ></div>
       )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-80 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default HistorySidebar;