
import React from 'react';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl shadow-md shadow-zinc-200/50 dark:shadow-black/20 p-6 ${className || ''}`} {...props}>
            {children}
        </div>
    );
};
