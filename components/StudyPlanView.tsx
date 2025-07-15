import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { Button } from './common/Button';
import { StudyPlanItem, StudyPlanTask } from '../types';
import { downloadAsMarkdown } from '../utils/export';
import { DownloadIcon, DragHandleIcon } from './common/Icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const WelcomeScreen: React.FC<{ onStart: (topic: string, duration: string) => void }> = ({ onStart }) => {
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('1 week');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onStart(topic, duration);
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white mb-2">Welcome to your AI Study Coach!</h2>
            <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-8">What would you like to learn today?</p>
            <Card className="max-w-lg mx-auto text-left">
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="mb-6">
                        <label htmlFor="topic" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Study Topic
                        </label>
                        <input
                            type="text"
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., React.js, Quantum Physics"
                            className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                         <label htmlFor="duration" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Study Duration
                        </label>
                        <select
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option>3 Days</option>
                            <option>1 Week</option>
                            <option>2 Weeks</option>
                            <option>1 Month</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full">
                        Generate Study Plan
                    </Button>
                </form>
            </Card>
        </div>
    );
};

const SortableTaskItem: React.FC<{ task: StudyPlanTask, day: number, index: number }> = ({ task, day, index }) => {
    const { progress, updateTaskCompletion } = useStudy();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const completedTasks = progress ? progress[day] || [] : [];
    const isCompleted = completedTasks[index];

    const handleToggleTask = () => {
        updateTaskCompletion(day, index, !isCompleted);
    };
    
    return (
        <li ref={setNodeRef} style={style} className="flex items-center bg-zinc-50 dark:bg-zinc-700/50 p-2 rounded-lg">
            <button {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-zinc-500 dark:text-zinc-400">
                <DragHandleIcon className="h-4 w-4" />
            </button>
            <input
                type="checkbox"
                id={`task-${day}-${index}`}
                checked={isCompleted}
                onChange={handleToggleTask}
                className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor={`task-${day}-${index}`} className={`ml-3 text-sm sm:text-base text-zinc-700 dark:text-zinc-300 transition-colors ${isCompleted ? 'line-through text-zinc-500 dark:text-zinc-400' : ''}`}>
                {task.content}
            </label>
        </li>
    )
}

const PlanItem: React.FC<{ item: StudyPlanItem }> = ({ item }) => {
    const { getTopicContent, progress, reorderTasks } = useStudy();
    
    const completedTasks = progress ? progress[item.day] || [] : item.tasks.map(() => false);
    const progressPercentage = (completedTasks.filter(Boolean).length / item.tasks.length) * 100;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: any) {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = item.tasks.findIndex(t => t.id === active.id);
            const newIndex = item.tasks.findIndex(t => t.id === over.id);
            reorderTasks(item.day, oldIndex, newIndex);
        }
    }

    return (
        <Card className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div className="flex-1">
                    <h4 
                        className="text-lg sm:text-xl font-bold text-teal-600 dark:text-teal-400 cursor-pointer hover:underline transition-all"
                        onClick={() => getTopicContent(item.topic)}
                        title={`Learn more about ${item.topic}`}
                    >
                        Day {item.day}: {item.topic}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-3"><strong>Objective:</strong> {item.objective}</p>
                </div>
                <div className="text-left sm:text-right mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Progress</span>
                    <div className="w-full sm:w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 mt-1">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={item.tasks} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2 mt-4">
                        {item.tasks.map((task, index) => (
                           <SortableTaskItem key={task.id} task={task} day={item.day} index={index} />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        </Card>
    )
}

const StudyPlanView: React.FC = () => {
    const { studyPlan, topic, duration, createStudyPlan, isLoading, error } = useStudy();

    const handleExport = () => {
        if (!studyPlan || !topic) return;
        let markdownContent = `# Study Plan: ${topic}\n\n`;
        studyPlan.forEach(item => {
            markdownContent += `## Day ${item.day}: ${item.topic}\n\n`;
            markdownContent += `**Objective:** ${item.objective}\n\n`;
            markdownContent += `### Tasks\n\n`;
            item.tasks.forEach(task => {
                markdownContent += `- [ ] ${task.content}\n`;
            });
            markdownContent += `\n`;
        });
        downloadAsMarkdown(`${topic.replace(/\s+/g, '_')}_study_plan.md`, markdownContent);
    };

    if (isLoading && !studyPlan) {
        return <div className="flex flex-col items-center justify-center h-full"><Spinner /><p className="mt-4 text-lg">Generating your personalized plan...</p></div>;
    }

    if (error && !studyPlan) {
        return <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={() => createStudyPlan('', '')} className="mt-4">Try Again</Button>
        </div>;
    }

    if (!studyPlan) {
        return <WelcomeScreen onStart={createStudyPlan} />;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-6 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-1">Your Study Plan</h2>
                    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400">Topic: <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span> | Duration: <span className="font-semibold text-teal-600 dark:text-teal-400">{duration}</span></p>
                </div>
                <Button onClick={handleExport} variant="secondary" size="sm" className="flex items-center gap-2 self-start sm:self-center">
                    <DownloadIcon className="h-4 w-4" />
                    Export to Markdown
                </Button>
            </div>
            <div>
                {studyPlan.map(item => <PlanItem key={item.day} item={item} />)}
            </div>
        </div>
    );
};

export default StudyPlanView;