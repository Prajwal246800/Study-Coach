
import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { MarkdownRenderer } from './common/MarkdownRenderer';

const SummarizerView: React.FC = () => {
    const { summarizedText, summarizeText, clearSummarizer, isLoading, error } = useStudy();
    const [textToSummarize, setTextToSummarize] = useState('');
    
    useEffect(() => {
        // Clear summary when component unmounts
        return () => {
            clearSummarizer();
        }
    }, [clearSummarizer]);

    const handleSummarize = () => {
        if (textToSummarize.trim()) {
            summarizeText(textToSummarize);
        }
    };

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">AI Text Summarizer</h2>
            <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                Paste any text below to get a quick, easy-to-read summary.
            </p>

            <Card className="mb-6">
                 <h3 className="text-xl font-bold mb-4">Text to Summarize</h3>
                 <textarea
                    value={textToSummarize}
                    onChange={(e) => setTextToSummarize(e.target.value)}
                    placeholder="Paste your article, notes, or any long text here..."
                    className="w-full h-48 p-4 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    disabled={isLoading}
                 />
                 <div className="mt-4 flex justify-end">
                    <Button onClick={handleSummarize} disabled={isLoading || !textToSummarize.trim()}>
                        {isLoading ? 'Summarizing...' : 'Summarize Text'}
                    </Button>
                 </div>
            </Card>

            {isLoading && !summarizedText && (
                 <div className="flex flex-col items-center justify-center h-48">
                    <Spinner />
                    <p className="mt-4 text-lg">Generating your summary...</p>
                </div>
            )}
            
            {error && !summarizedText && (
                 <div className="text-center text-red-500 p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                    <p>{error}</p>
                    <Button onClick={handleSummarize} className="mt-4">Try Again</Button>
                </div>
            )}

            {summarizedText && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Summary</h3>
                         <Button onClick={() => { setTextToSummarize(''); clearSummarizer(); }} variant="secondary">
                            Start New Summary
                        </Button>
                    </div>
                    <MarkdownRenderer>
                        {summarizedText}
                    </MarkdownRenderer>
                </Card>
            )}
        </div>
    );
};

export default SummarizerView;
