
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    children: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-zinc dark:prose-invert prose-sm sm:prose-base max-w-none 
                       prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                       prose-a:text-teal-600 dark:prose-a:text-teal-400 hover:prose-a:text-teal-500
                       prose-code:bg-zinc-200/50 prose-code:dark:bg-zinc-700/50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono
                       prose-pre:bg-zinc-100 prose-pre:dark:bg-zinc-800 prose-pre:p-4 prose-pre:rounded-lg
                       prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic"
        >
            {children}
        </ReactMarkdown>
    );
};
