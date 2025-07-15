import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StudyPlanView from './components/StudyPlanView';
import ChatView from './components/ChatView';
import QuizView from './components/QuizView';
import ProgressView from './components/ProgressView';
import FlashcardView from './components/FlashcardView';
import ResourceView from './components/ResourceView';
import InterviewView from './components/InterviewView';
import SummarizerView from './components/SummarizerView';
import MindmapView from './components/MindmapView';
import { useStudy } from './context/StudyContext';
import { AppView } from './types';
import TopicDetailModal from './components/TopicDetailModal';
import { MenuIcon } from './components/common/Icons';
import CodeSandboxModal from './components/CodeSandboxModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.PLAN);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { isContentModalOpen, activeCodeBlock } = useStudy();

  const renderView = () => {
    switch (currentView) {
      case AppView.PLAN:
        return <StudyPlanView />;
      case AppView.CHAT:
        return <ChatView />;
      case AppView.QUIZ:
        return <QuizView />;
      case AppView.PROGRESS:
        return <ProgressView />;
      case AppView.FLASHCARDS:
        return <FlashcardView />;
      case AppView.RESOURCES:
        return <ResourceView />;
      case AppView.INTERVIEW:
        return <InterviewView />;
      case AppView.SUMMARIZER:
        return <SummarizerView />;
      case AppView.MIND_MAP:
        return <MindmapView />;
      default:
        return <StudyPlanView />;
    }
  };

  return (
    <div className="flex h-screen bg-transparent text-zinc-800 dark:text-zinc-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto md:ml-64">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 mb-4 -ml-2 text-zinc-600 dark:text-zinc-300 rounded-md hover:bg-zinc-200/60 dark:hover:bg-white/10 self-start"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="max-w-4xl mx-auto w-full flex-1">
          {renderView()}
        </div>
      </main>
      {isContentModalOpen && <TopicDetailModal />}
      {activeCodeBlock && <CodeSandboxModal />}
    </div>
  );
};

export default App;