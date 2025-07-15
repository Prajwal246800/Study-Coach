
import React from 'react';
import { useStudy } from '../context/StudyContext';
import { AppView } from '../types';
import { BookIcon, ChatBubbleIcon, CheckSquareIcon, LogoIcon, XIcon, ChartBarIcon, CollectionIcon, SparklesIcon, MicrophoneIcon, DocumentTextIcon, ShareIcon } from './common/Icons';
import ThemeToggle from './common/ThemeToggle';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: AppView;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  disabled: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, currentView, setCurrentView, disabled, onClick }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => {
        if(!disabled) {
            setCurrentView(view);
            onClick();
        }
      }}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-150 rounded-lg
        ${isActive
          ? 'bg-teal-600 text-white'
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icon}
      <span className="ml-4">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isSidebarOpen, setSidebarOpen }) => {
  const { studyPlan } = useStudy();
  const isPlanActive = !!studyPlan;

  const handleNavItemClick = () => {
    // Close sidebar on item click in mobile view
    if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-800 border-r border-zinc-200/80 dark:border-zinc-700 flex flex-col p-4 z-30
        transform transition-transform duration-300 ease-in-out md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <LogoIcon className="h-8 w-8 text-teal-600" />
                <h1 className="ml-3 text-xl font-bold text-zinc-800 dark:text-white">Study Coach</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1" aria-label="Close sidebar">
                <XIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            </button>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<BookIcon className="h-5 w-5" />}
            label="Study Plan"
            view={AppView.PLAN}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={false}
            onClick={handleNavItemClick}
          />
           <NavItem
            icon={<ChartBarIcon className="h-5 w-5" />}
            label="Progress Tracker"
            view={AppView.PROGRESS}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
          <NavItem
            icon={<ChatBubbleIcon className="h-5 w-5" />}
            label="AI Chat"
            view={AppView.CHAT}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
           <NavItem
            icon={<ShareIcon className="h-5 w-5" />}
            label="Mind Map"
            view={AppView.MIND_MAP}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
          <NavItem
            icon={<CheckSquareIcon className="h-5 w-5" />}
            label="Quiz"
            view={AppView.QUIZ}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
           <NavItem
            icon={<CollectionIcon className="h-5 w-5" />}
            label="Flashcards (SRS)"
            view={AppView.FLASHCARDS}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
           <NavItem
            icon={<SparklesIcon className="h-5 w-5" />}
            label="Resource Finder"
            view={AppView.RESOURCES}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
          <NavItem
            icon={<MicrophoneIcon className="h-5 w-5" />}
            label="Mock Interview"
            view={AppView.INTERVIEW}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
          <NavItem
            icon={<DocumentTextIcon className="h-5 w-5" />}
            label="Text Summarizer"
            view={AppView.SUMMARIZER}
            currentView={currentView}
            setCurrentView={setCurrentView}
            disabled={!isPlanActive}
            onClick={handleNavItemClick}
          />
        </nav>
        <div className="mt-auto space-y-4">
          <ThemeToggle />
          {/* <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">Powered by Gemini</p> */}
          <p></p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;