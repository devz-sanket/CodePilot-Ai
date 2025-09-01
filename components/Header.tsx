import React from 'react';
import { AppView, User } from '../types';
import { LogoIcon, MenuIcon, MoonIcon, SunIcon } from './common/Icon';

interface HeaderProps {
  user: User | null;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  navItems: { id: AppView; label: string; icon: React.ReactNode }[];
  theme: string;
  toggleTheme: () => void;
  onMenuClick: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeView, setActiveView, navItems, theme, toggleTheme, onMenuClick, onOpenSettings }) => {
  return (
    <header className="sticky top-0 bg-surface z-10 border-b border-border flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
             <button onClick={onMenuClick} className="mr-2 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary">
                <MenuIcon className="h-6 w-6" />
             </button>
             <div className="flex items-center">
                <LogoIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold ml-3 text-text-primary hidden sm:block">CodePilot</h1>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center space-x-1 bg-secondary p-1 rounded-full">
                {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary ${
                    activeView === item.id
                        ? 'bg-surface text-text-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    {item.icon}
                    {item.label}
                </button>
                ))}
            </nav>
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors"
                aria-label="Open user settings"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </button>
          </div>
        </div>
      </div>
      
       {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around p-2 z-20">
             {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none ${
                  activeView === item.id
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </button>
            ))}
        </nav>
    </header>
  );
};

export default Header;
