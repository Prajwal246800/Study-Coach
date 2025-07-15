
import React from 'react';
import { MindMapNode } from '../types';

interface MindMapNodeProps {
    node: MindMapNode;
    level?: number;
}

const MindMapNodeComponent: React.FC<MindMapNodeProps> = ({ node, level = 0 }) => {
    const levelColors = [
        'bg-teal-600 text-white',      // Level 0 (Root)
        'bg-sky-600 text-white',       // Level 1
        'bg-indigo-600 text-white',    // Level 2
        'bg-purple-600 text-white',    // Level 3
        'bg-pink-600 text-white',      // Level 4
    ];

    const nodeColor = levelColors[level] || levelColors[levelColors.length - 1];

    return (
        <li className="relative">
             <style>{`
                .mindmap-tree, .mindmap-tree ul {
                    position: relative;
                    padding-left: 3rem; 
                    list-style: none;
                }
                .mindmap-tree ul {
                    padding-top: 1rem;
                }
                .mindmap-tree li {
                    position: relative;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                }
                /* Connector lines */
                .mindmap-tree li::before, .mindmap-tree li::after {
                    content: '';
                    position: absolute;
                    left: -1.5rem;
                    background-color: #d4d4d8; /* zinc-300 */
                }
                .dark .mindmap-tree li::before, .dark .mindmap-tree li::after {
                    background-color: #52525b; /* zinc-600 */
                }
                /* Horizontal line from parent to child */
                .mindmap-tree li::before {
                    top: 2rem;
                    width: 1.5rem;
                    height: 2px;
                }
                /* Vertical line connecting siblings */
                .mindmap-tree li::after {
                    top: 0;
                    width: 2px;
                    height: 100%;
                }
                /* Remove vertical line from last child */
                .mindmap-tree li:last-child::after {
                    height: 2rem;
                }
                .mindmap-tree > li:first-child::after {
                    display: none;
                }
            `}</style>
            
            <div className={`inline-block px-4 py-2 rounded-lg shadow-lg ${nodeColor}`}>
                <p className="font-semibold text-center text-sm sm:text-base">{node.topic}</p>
            </div>

            {node.children && node.children.length > 0 && (
                <ul>
                    {node.children.map((child, index) => (
                        <MindMapNodeComponent key={index} node={child} level={level + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default MindMapNodeComponent;
