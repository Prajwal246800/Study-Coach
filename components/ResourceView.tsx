
import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { Card } from './common/Card';
import { SparklesIcon } from './common/Icons';

const ResourceView: React.FC = () => {
    const { topic, resources, findResources, isLoading, error } = useStudy();

    return (
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1">Resource Finder</h2>
            <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                Let the AI find helpful articles and tutorials for <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span>.
            </p>

            {!resources && !isLoading && (
                <div className="text-center mt-12">
                     <SparklesIcon className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                     <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">Click the button to search the web for resources.</p>
                     <Button onClick={findResources} size="lg" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Find Resources'}
                    </Button>
                </div>
            )}
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                    <Spinner />
                    <p className="mt-4 text-lg">Searching the web for the best resources...</p>
                </div>
            )}

            {error && (
                 <div className="text-center text-red-500">
                    <p>{error}</p>
                    <Button onClick={findResources} className="mt-4">Try Again</Button>
                </div>
            )}

            {resources && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Recommended Resources</h3>
                        <Button onClick={findResources} variant="secondary" disabled={isLoading}>
                            {isLoading ? 'Refreshing...' : 'Find New Resources'}
                        </Button>
                    </div>
                    {resources.length > 0 ? (
                        <ul className="space-y-4">
                            {resources.map((resource, index) => (
                                <li key={index}>
                                    <a
                                        href={resource.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        <p className="font-semibold text-teal-600 dark:text-teal-400">{resource.title}</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{resource.uri}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">
                            No resources were found for this topic.
                        </p>
                    )}
                </Card>
            )}

        </div>
    );
};

export default ResourceView;
