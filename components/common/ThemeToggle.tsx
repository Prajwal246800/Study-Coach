
import React, { useState } from 'react';
import { SunIcon, MoonIcon } from './Icons';

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC = () => {
    // Initialize state directly from the DOM, which is set by the blocking script in index.html
    const [theme, setTheme] = useState<Theme>(() => 
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            return newTheme;
        });
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-full flex justify-center items-center p-2 rounded-lg bg-zinc-100 dark:bg-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <>
                    <MoonIcon className="h-5 w-5 text-zinc-600" />
                    <span className="ml-2 text-sm font-medium text-zinc-600">Dark Mode</span>
                </>
            ) : (
                <>
                    <SunIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-2 text-sm font-medium text-zinc-300">Light Mode</span>
                </>

            )}
        </button>
    );
};

export default ThemeToggle;
