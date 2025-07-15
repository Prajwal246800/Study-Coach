import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Spinner } from './common/Spinner';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { MarkdownRenderer } from './common/MarkdownRenderer';
import PersonalizedReviewDisplay from './PersonalizedReviewDisplay';
import { TargetIcon } from './common/Icons';

const QuizResults: React.FC<{
    score: number;
    total: number;
    userAnswers: string[];
    onRetake: () => void;
    onNewQuiz: () => void;
}> = ({ score, total, onRetake, onNewQuiz, userAnswers }) => {
    const { quiz, quizAnalysis, isLoading, getPersonalizedReview, personalizedReview } = useStudy();
    const percentage = Math.round((score / total) * 100);
    let feedback = { message: '', color: '' };

    if (percentage >= 80) {
        feedback = { message: 'Excellent work!', color: 'text-green-500' };
    } else if (percentage >= 60) {
        feedback = { message: 'Good job, keep reviewing!', color: 'text-yellow-500' };
    } else {
        feedback = { message: 'You can do better. Time to hit the books!', color: 'text-red-500' };
    }

    const handleGetReview = () => {
        if (quiz) {
            getPersonalizedReview(quiz, userAnswers);
        }
    };
    
    if (personalizedReview) {
        return <PersonalizedReviewDisplay review={personalizedReview} />
    }

    return (
        <div>
            <Card className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">Your Score</p>
                <div className={`text-6xl font-bold ${feedback.color} mb-4`}>
                    {score} / {total}
                </div>
                <p className={`text-xl font-semibold ${feedback.color} mb-6`}>{feedback.message}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={onRetake} variant="secondary" className="w-full sm:w-auto">Retake Quiz</Button>
                    <Button onClick={onNewQuiz} className="w-full sm:w-auto">Generate New Quiz</Button>
                </div>
            </Card>
            
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Performance Analysis</h3>
                    <Button 
                        onClick={handleGetReview} 
                        disabled={isLoading || percentage === 100}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                         <TargetIcon className="h-4 w-4"/>
                        {isLoading ? 'Analyzing...' : 'Get Personalized Review'}
                    </Button>
                 </div>
                 {(isLoading && !quizAnalysis && !personalizedReview) && (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                        <p className="ml-4 text-zinc-600 dark:text-zinc-400">Analyzing your results...</p>
                    </div>
                 )}
                 {quizAnalysis && (
                    <MarkdownRenderer>
                        {quizAnalysis}
                    </MarkdownRenderer>
                 )}
            </Card>
        </div>
    );
};


const QuizView: React.FC = () => {
    const { topic, quiz, createQuiz, clearQuiz, isLoading, error, analyzeQuizPerformance } = useStudy();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [isFinished, setIsFinished] = useState(false);

    const handleStartQuiz = () => {
        setIsFinished(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
        createQuiz();
    };

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = answer;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
            if(quiz) {
                analyzeQuizPerformance(quiz, selectedAnswers);
            }
        }
    };
    
    const handleRetake = () => {
        setIsFinished(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
    };

    if (isLoading && !quiz) {
        return <div className="flex flex-col items-center justify-center h-full"><Spinner /><p className="mt-4 text-lg">Generating your quiz...</p></div>;
    }

    if (error && !quiz) {
        return <div className="text-center text-red-500"><p>{error}</p><Button onClick={handleStartQuiz} className="mt-4">Try Again</Button></div>;
    }

    if (!quiz) {
        return (
            <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Test Your Knowledge</h2>
                <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8">Generate a quiz on <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span> to check your understanding.</p>
                <Button onClick={handleStartQuiz} size="lg">
                    Generate Quiz
                </Button>
            </div>
        );
    }

    if (isFinished) {
        const score = quiz.reduce((acc, question, index) => {
            return question.correctAnswer === selectedAnswers[index] ? acc + 1 : acc;
        }, 0);
        return <QuizResults score={score} total={quiz.length} onRetake={handleRetake} onNewQuiz={()=>{clearQuiz(); handleStartQuiz();}} userAnswers={selectedAnswers} />;
    }

    const currentQuestion = quiz[currentQuestionIndex];

    return (
        <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Quiz: {topic}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">Question {currentQuestionIndex + 1} of {quiz.length}</p>

            <Card>
                <h3 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestion.question}</h3>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                                ${selectedAnswers[currentQuestionIndex] === option 
                                    ? 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500 ring-2 ring-teal-500' 
                                    : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50'}`
                                }
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="flex justify-end mt-6">
                <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
                    {currentQuestionIndex === quiz.length - 1 ? 'Finish' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

export default QuizView;