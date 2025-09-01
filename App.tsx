import React, { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ChatView from './components/ChatView';
import BuildView from './components/BuildView';
import DebugView from './components/DebugView';
import ImageView from './components/ImageView';
import HistorySidebar from './components/HistorySidebar';
import AuthView from './components/AuthView';
import SettingsModal from './components/SettingsModal';
import { AppView, ChatMessage, ChatSession, MessageSender, User } from './types';
import { CodeIcon, MessageSquareIcon, BugIcon, ImageIcon } from './components/common/Icon';
import { getChatResponseStream, generateChatTitle, getApiKeyStatus } from './services/geminiService';


const App: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState({ isConfigured: true, error: null as string | null });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.Chat);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  // Check for API Key and logged-in user on initial load
  useEffect(() => {
    setApiKeyStatus(getApiKeyStatus());
    try {
      const savedUser = localStorage.getItem('codePilotCurrentUser');
      if (savedUser) {
        const user: User = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse current user from localStorage", error);
    }
  }, []);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load user-specific sessions from localStorage on user change
  useEffect(() => {
    if (currentUser) {
      try {
        const savedSessions = localStorage.getItem(`chatSessions_${currentUser.id}`);
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        } else {
          setSessions([]);
        }
        setActiveSessionId(null);
      } catch (error) {
          console.error("Failed to parse chat sessions from localStorage", error);
          setSessions([]);
      }
    }
  }, [currentUser]);

  // Save sessions to localStorage whenever they change for the current user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`chatSessions_${currentUser.id}`, JSON.stringify(sessions));
    }
  }, [sessions, currentUser]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setSidebarOpen(false);
  };
  
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('codePilotCurrentUser', JSON.stringify(updatedUser));

    // Also update the user in the main user list
    const users = JSON.parse(localStorage.getItem('codePilotUsers') || '[]');
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex > -1) {
        // Keep the stored password hash
        const existingPasswordHash = users[userIndex].passwordHash;
        users[userIndex] = {...updatedUser, passwordHash: existingPasswordHash };
        localStorage.setItem('codePilotUsers', JSON.stringify(users));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem('codePilotCurrentUser');
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { sender: MessageSender.User, text: input };
    let currentSessionId = activeSessionId;
    let isNewSession = false;

    // Create a new session if there isn't one
    if (!currentSessionId) {
      isNewSession = true;
      const newSession: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [userMessage],
        createdAt: Date.now(),
      };
      currentSessionId = newSession.id;
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(currentSessionId);
    } else {
      setSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId ? { ...s, messages: [...s.messages, userMessage] } : s
        )
      );
    }
    
    // Add empty AI message placeholder
    const aiMessagePlaceholder: ChatMessage = { sender: MessageSender.AI, text: '' };
     setSessions(prev =>
        prev.map(s =>
          s.id === currentSessionId ? { ...s, messages: [...s.messages, aiMessagePlaceholder] } : s
        )
      );

    try {
      const currentHistory = sessions.find(s => s.id === currentSessionId)?.messages.slice(0, -1) || [];
      const stream = await getChatResponseStream(currentHistory, input);
      let aiResponseText = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        aiResponseText += chunkText;
        setSessions(prev => {
          return prev.map(s => {
            if (s.id === currentSessionId) {
              const newMessages = [...s.messages];
              newMessages[newMessages.length - 1] = { sender: MessageSender.AI, text: aiResponseText };
              return { ...s, messages: newMessages };
            }
            return s;
          });
        });
      }
      
      // Generate title for new chats
      if (isNewSession && aiResponseText) {
          const title = await generateChatTitle(input);
          setSessions(prev => prev.map(s => s.id === currentSessionId ? {...s, title} : s))
      }

    } catch (error) {
      console.error("Error in chat stream:", error);
      const errorMessageText = error instanceof Error ? error.message : "Sorry, I couldn't get a response. Please try again.";
      const errorMessage: ChatMessage = { sender: MessageSender.AI, text: errorMessageText };
      setSessions(prev =>
        prev.map(s => {
          if (s.id === currentSessionId) {
              const newMessages = [...s.messages];
              newMessages[newMessages.length - 1] = errorMessage;
              return { ...s, messages: newMessages };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };


  const renderView = () => {
    switch (activeView) {
      case AppView.Build:
        return <BuildView />;
      case AppView.Debug:
        return <DebugView />;
      case AppView.Image:
        return <ImageView />;
      case AppView.Chat:
      default:
        return <ChatView
          user={currentUser}
          messages={activeSession?.messages || []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />;
    }
  };
  
  const navItems = useMemo(() => [
    { id: AppView.Chat, label: 'Chat', icon: <MessageSquareIcon className="w-5 h-5 mr-2" /> },
    { id: AppView.Build, label: 'Build', icon: <CodeIcon className="w-5 h-5 mr-2" /> },
    { id: AppView.Debug, label: 'Debug', icon: <BugIcon className="w-5 h-5 mr-2" /> },
    { id: AppView.Image, label: 'Image', icon: <ImageIcon className="w-5 h-5 mr-2" /> },
  ], []);

  if (!apiKeyStatus.isConfigured) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 font-sans">
            <div className="w-full max-w-lg text-center bg-surface p-8 rounded-2xl border border-border shadow-2xl">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Configuration Error</h1>
                <p className="text-text-primary text-lg mb-2">
                    Could not connect to the AI service.
                </p>
                <div className="bg-secondary p-4 rounded-lg mt-6">
                    <p className="text-text-secondary font-mono text-sm break-words text-left">
                        <strong>Reason:</strong> {apiKeyStatus.error || "An unknown error occurred."}
                    </p>
                </div>
                <p className="text-text-secondary mt-6 text-sm">
                    For a local development environment, please ensure the <code>API_KEY</code> environment variable is accessible to your application.
                </p>
            </div>
        </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AuthView onLogin={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('codePilotCurrentUser', JSON.stringify(user));
    }} />;
  }

  return (
    <>
      <div className="flex h-screen w-full bg-transparent text-text-primary overflow-hidden">
        <HistorySidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          <Header 
            user={currentUser}
            activeView={activeView} 
            setActiveView={setActiveView} 
            navItems={navItems}
            theme={theme}
            toggleTheme={toggleTheme}
            onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
          <main className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
            {renderView()}
          </main>
          <footer className="text-center p-4 text-text-secondary/80 text-xs">
                Devlop by Sanket team
          </footer>
        </div>
      </div>
      {isSettingsModalOpen && currentUser && (
        <SettingsModal 
          user={currentUser}
          onClose={() => setSettingsModalOpen(false)}
          onUpdate={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;