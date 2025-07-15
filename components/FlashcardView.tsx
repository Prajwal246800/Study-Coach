
import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';
import { Flashcard as FlashcardType } from '../types';

const Flashcard: React.FC<{ term: string; definition: string; isFlipped: boolean; onClick: () => void }> = ({ term, definition, isFlipped, onClick }) => {
    return (
        <div className="w-full h-64 [perspective:1000px] cursor-pointer" onClick={onClick}>
            <div 
                className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
            >
                {/* Front of card */}
                <div className="absolute w-full h-full bg-white dark:bg-zinc-700 rounded-xl shadow-lg flex items-center justify-center p-6 [backface-visibility:hidden]">
                    <h3 className="text-2xl font-bold text-center text-zinc-800 dark:text-white">{term}</h3>
                </div>
                {/* Back of card */}
                <div className="absolute w-full h-full bg-teal-600 rounded-xl shadow-lg flex items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-lg text-white text-center">{definition}</p>
                </div>
            </div>
        </div>
    );
};

const FlashcardView: React.FC = () => {
    const { topic, studyPlan, flashcards, generateFlashcards, updateFlashcardReview, isLoading, error } = useStudy();
    const [mode, setMode] = useState<'menu' | 'review' | 'generate'>('menu');
    
    // State for review session
    const [dueCards, setDueCards] = useState<FlashcardType[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // State for generation
    const [selectedSubTopic, setSelectedSubTopic] = useState<string>('main');

    const subTopics = useMemo(() => studyPlan?.map(item => item.topic) || [], [studyPlan]);
    const totalDueCount = useMemo(() => {
        if (!flashcards) return 0;
        const now = new Date();
        return flashcards.filter(card => new Date(card.nextReview) <= now).length;
    }, [flashcards]);

    const startReviewSession = () => {
        if (!flashcards) return;
        const now = new Date();
        const cardsToReview = flashcards
            .filter(card => new Date(card.nextReview) <= now)
            .sort(() => Math.random() - 0.5); // Shuffle
        setDueCards(cardsToReview);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setMode('review');
    };

    const handleReviewChoice = (performance: 'Hard' | 'Good' | 'Easy') => {
        const cardId = dueCards[currentCardIndex].id;
        updateFlashcardReview(cardId, performance);
        
        if (currentCardIndex < dueCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // End of session
            setMode('menu');
        }
    };
    
    const handleGenerate = async () => {
        const topicToGenerate = selectedSubTopic === 'main' ? topic! : selectedSubTopic;
        await generateFlashcards(topicToGenerate);
        setMode('menu'); // Go back to menu after generating
    };

    const renderMenu = () => (
        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Flashcards (SRS)</h2>
            <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8">
                Using a Spaced Repetition System to maximize your memory retention.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Card className="flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-2">Review Due Cards</h3>
                    <p className="text-5xl font-bold text-teal-500 mb-4">{totalDueCount}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-4">cards are ready for review.</p>
                    <Button onClick={startReviewSession} disabled={totalDueCount === 0}>
                        Start Review
                    </Button>
                </Card>
                <Card className="flex flex-col items-center justify-center">
                     <h3 className="text-xl font-bold mb-4">Manage Deck</h3>
                     <p className="text-zinc-500 dark:text-zinc-400 mb-4">You have <span className="font-bold text-zinc-700 dark:text-zinc-200">{flashcards?.length || 0}</span> cards in your deck for <span className="font-bold text-teal-600">{topic}</span>.</p>
                     <Button onClick={() => setMode('generate')} variant="secondary">
                        Add New Cards
                     </Button>
                </Card>
            </div>
             {error && <p className="text-red-500 mt-6">{error}</p>}
        </div>
    );

    const renderGenerate = () => (
         <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Add New Flashcards</h2>
             <Card>
                <div className="mb-4">
                    <label htmlFor="flashcard-topic" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Topic</label>
                    <select
                        id="flashcard-topic"
                        value={selectedSubTopic}
                        onChange={(e) => setSelectedSubTopic(e.target.value)}
                        className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="main">Main Topic: {topic}</option>
                        {subTopics.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
                    </select>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => setMode('menu')} variant="secondary" className="w-full">Cancel</Button>
                    <Button onClick={handleGenerate} size="lg" disabled={isLoading} className="w-full">
                        {isLoading ? <Spinner /> : 'Generate & Add'}
                    </Button>
                </div>
            </Card>
        </div>
    );
    
    const renderReview = () => {
        if (dueCards.length === 0) {
            return (
                 <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">All done for now!</h2>
                    <p className="text-lg text-zinc-500 mb-6">You've reviewed all due cards. Great work!</p>
                    <Button onClick={() => setMode('menu')}>Back to Menu</Button>
                </div>
            )
        }
        
        const currentCard = dueCards[currentCardIndex];

        return (
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                     <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">Review Session</h2>
                        <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400">Card {currentCardIndex + 1} of {dueCards.length}</p>
                    </div>
                    <Button onClick={() => setMode('menu')} variant="secondary">End Session</Button>
                </div>

                <Flashcard 
                    term={currentCard.term}
                    definition={currentCard.definition}
                    isFlipped={isFlipped}
                    onClick={() => setIsFlipped(!isFlipped)}
                />

                {isFlipped && (
                    <div className="mt-6 text-center">
                         <p className="text-lg font-semibold mb-4">How well did you know this?</p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => handleReviewChoice('Hard')} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 w-28">Hard</Button>
                            <Button onClick={() => handleReviewChoice('Good')} className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 w-28">Good</Button>
                            <Button onClick={() => handleReviewChoice('Easy')} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-28">Easy</Button>
                        </div>
                    </div>
                )}
            </div>
        )
    };
    
    if (isLoading && mode === 'generate') {
        return <div className="flex flex-col items-center justify-center h-full"><Spinner /><p className="mt-4 text-lg">Generating your flashcards...</p></div>;
    }


    switch(mode) {
        case 'review':
            return renderReview();
        case 'generate':
            return renderGenerate();
        case 'menu':
        default:
            return renderMenu();
    }
};

export default FlashcardView;