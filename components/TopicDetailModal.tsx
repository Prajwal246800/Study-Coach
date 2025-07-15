
import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { XIcon, RefreshIcon, LightBulbIcon } from './common/Icons';
import { Button } from './common/Button';
import { MarkdownRenderer } from './common/MarkdownRenderer';

const TopicDetailModal: React.FC = () => {
    const { 
        isLoading, 
        error,
        topicContent, 
        selectedTopic,
        analogy,
        clearTopicContent,
        rephraseTopicContent,
        getAnalogy,
        clearAnalogy
    } = useStudy();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                clearTopicContent();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [clearTopicContent]);

    const handleGetAnalogy = () => {
        if(selectedTopic) {
            getAnalogy(selectedTopic);
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={clearTopicContent}
            aria-modal="true"
            role="dialog"
        >
            <Card 
                className="w-full max-w-lg lg:max-w-3xl max-h-[90vh] flex flex-col transition-transform duration-300 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 pr-4">{selectedTopic}</h2>
                    <div className="flex items-center gap-2">
                         <Button 
                            onClick={handleGetAnalogy} 
                            variant="secondary" 
                            size="sm"
                            disabled={isLoading || !topicContent}
                            className="!p-2"
                            title="Explain with an analogy"
                        >
                            <LightBulbIcon className="h-5 w-5" />
                        </Button>
                        <Button 
                            onClick={() => rephraseTopicContent()} 
                            variant="secondary" 
                            size="sm"
                            disabled={isLoading || !topicContent}
                            className="!p-2"
                            title="Explain differently"
                        >
                            <RefreshIcon className="h-5 w-5" />
                        </Button>
                        <button 
                            onClick={clearTopicContent}
                            className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-600/60 transition-colors flex-shrink-0"
                            aria-label="Close"
                        >
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pt-4 pr-2 -mr-2 text-sm sm:text-base">
                    {(isLoading && !topicContent) && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Spinner />
                            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Generating content...</p>
                        </div>
                    )}
                    {isLoading && topicContent && ( // Show semi-transparent overlay when rephrasing
                        <div className="absolute inset-x-0 top-16 bottom-0 bg-white/50 dark:bg-zinc-800/50 flex justify-center items-center z-10 rounded-b-xl">
                            <Spinner />
                        </div>
                    )}
                    {(error && !topicContent) && (
                        <div className="text-center text-red-500 p-4">
                            <p className="font-semibold">An Error Occurred</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {topicContent && (
                       <MarkdownRenderer>
                           {topicContent}
                       </MarkdownRenderer>
                    )}
                    {analogy && (
                        <div className="mt-6 pt-6 border-t border-dashed border-zinc-300 dark:border-zinc-600">
                             <h3 className="text-lg font-bold mb-2 text-teal-600 dark:text-teal-400">Analogy</h3>
                             <MarkdownRenderer>{analogy}</MarkdownRenderer>
                        </div>
                    )}
                </div>
            </Card>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TopicDetailModal;