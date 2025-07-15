import React from 'react';
import { PersonalizedReview } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useStudy } from '../context/StudyContext';
import { CheckSquareIcon, TargetIcon } from './common/Icons';

interface PersonalizedReviewDisplayProps {
    review: PersonalizedReview;
}

const PersonalizedReviewDisplay: React.FC<PersonalizedReviewDisplayProps> = ({ review }) => {
    const { startRedemptionQuiz, clearPersonalizedReview } = useStudy();

    const handleStartRedemption = () => {
        startRedemptionQuiz(review.redemptionQuiz);
    }
    
    return (
        <div>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Your Personalized Review</h2>
                        <p className="text-zinc-600 dark:text-zinc-400">Here's a targeted plan to help you improve.</p>
                    </div>
                    <Button onClick={clearPersonalizedReview} variant="secondary" size="sm">
                        Back to Score
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckSquareIcon className="h-5 w-5"/>
                            Strengths
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                           {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <TargetIcon className="h-5 w-5"/>
                            Areas for Improvement
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                           {review.areasForImprovement.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                     <h3 className="text-lg font-bold mb-3">Recommended Topics to Review</h3>
                     <div className="space-y-2">
                        {review.recommendedTopics.map((item, i) => (
                            <div key={i} className="p-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg">
                                <p className="font-semibold">{item.topic}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.reason}</p>
                            </div>
                        ))}
                     </div>
                </div>
                
                 {review.redemptionQuiz.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700 text-center">
                        <h3 className="text-lg font-bold mb-2">Ready for a Rematch?</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">Take a short quiz with only the questions you got wrong.</p>
                        <Button onClick={handleStartRedemption}>
                            Start Redemption Quiz ({review.redemptionQuiz.length} questions)
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PersonalizedReviewDisplay;
