import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Card } from './common/Card';
import { CheckSquareIcon, FireIcon } from './common/Icons';

const ProgressView: React.FC = () => {
    const { studyPlan, progress, topic, streak } = useStudy();

    if (!studyPlan || !progress) {
        return <div className="text-center text-zinc-500">No study plan active.</div>;
    }

    const totalTasks = studyPlan.reduce((acc, day) => acc + day.tasks.length, 0);
    const completedTasksCount = Object.values(progress)
        .flat()
        .filter(Boolean).length;
    
    const overallProgress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    const recentlyCompleted = studyPlan.flatMap(day => 
        day.tasks
            .map((task, index) => ({ day: day.day, task, completed: progress[day.day][index] }))
            .filter(t => t.completed)
    ).slice(-5).reverse();

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Your Progress</h2>
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-6">Topic: <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="md:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Overall Progress</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className="text-zinc-200 dark:text-zinc-700"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-green-500"
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${overallProgress}, 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-zinc-800 dark:text-white">{overallProgress}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Great work!</p>
                            <p className="text-zinc-500 dark:text-zinc-400">{completedTasksCount} of {totalTasks} tasks completed.</p>
                        </div>
                    </div>
                </Card>
                <Card className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-bold mb-2">Study Streak</h3>
                    <div className="flex items-center gap-2">
                        <FireIcon className={`h-10 w-10 ${streak > 0 ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-600'}`} />
                        <span className={`text-4xl font-bold ${streak > 0 ? 'text-zinc-800 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}`}>{streak}</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{streak > 0 ? 'Day Streak!' : 'Complete a task!'}</p>
                </Card>
            </div>


            <Card className="mb-6">
                 <h3 className="text-xl font-bold mb-4">Daily Progress</h3>
                 <div className="space-y-4">
                    {studyPlan.map(day => {
                        const dayTasks = progress[day.day];
                        const completedCount = dayTasks.filter(Boolean).length;
                        const totalDayTasks = dayTasks.length;
                        const dayProgress = totalDayTasks > 0 ? (completedCount / totalDayTasks) * 100 : 0;
                        return (
                             <div key={day.day}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">Day {day.day}: {day.topic}</p>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{completedCount}/{totalDayTasks}</p>
                                </div>
                                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                                    <div className="bg-teal-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${dayProgress}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </Card>
            
            <Card>
                 <h3 className="text-xl font-bold mb-4">Recently Completed Tasks</h3>
                 {recentlyCompleted.length > 0 ? (
                    <ul className="space-y-3">
                        {recentlyCompleted.map(({day, task}, index) => (
                           <li key={index} className="flex items-center gap-3">
                             <CheckSquareIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                             <span className="text-zinc-600 dark:text-zinc-300">{task.content} <span className="text-xs text-zinc-400 dark:text-zinc-500">(Day {day})</span></span>
                           </li>
                        ))}
                    </ul>
                 ) : (
                    <p className="text-zinc-500 dark:text-zinc-400">No tasks completed yet. Check some off in the Study Plan!</p>
                 )}
            </Card>
        </div>
    );
};

export default ProgressView;