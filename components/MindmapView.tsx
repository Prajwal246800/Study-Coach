
import React, { useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { ShareIcon } from './common/Icons';
import MindMapNodeComponent from './MindMapNodeComponent';
import { Card } from './common/Card';

const MindmapView: React.FC = () => {
    const { topic, mindMapData, generateMindMap, isLoading, error } = useStudy();

    useEffect(() => {
        if (!mindMapData) {
            generateMindMap();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <Spinner />
                    <p className="mt-4 text-lg">Generating your mind map...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-500">
                    <p>{error}</p>
                    <Button onClick={generateMindMap} className="mt-4">Try Again</Button>
                </div>
            );
        }
        
        if (mindMapData) {
            return (
                <Card>
                    <div className="overflow-x-auto p-4">
                       <ul className="mindmap-tree">
                         <MindMapNodeComponent node={mindMapData} />
                       </ul>
                    </div>
                </Card>
            )
        }

        return (
            <div className="text-center mt-12">
                <ShareIcon className="h-16 w-16 mx-auto text-teal-400 mb-4" />
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">Visualize your topic as an interactive mind map.</p>
                <Button onClick={generateMindMap} size="lg" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Mind Map'}
                </Button>
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Mind Map</h2>
            <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                Explore the connections within <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span>.
            </p>
            {renderContent()}
        </div>
    );
};

export default MindmapView;
