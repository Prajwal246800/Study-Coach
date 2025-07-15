import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { Card } from './common/Card';
import { XIcon } from './common/Icons';
import { Button } from './common/Button';


const CodeSandboxModal: React.FC = () => {
    const { activeCodeBlock, closeCodeSandbox } = useStudy();
    const [code, setCode] = useState(activeCodeBlock?.code || '');
    const [output, setOutput] = useState<any[]>([]);
    
    useEffect(() => {
        setCode(activeCodeBlock?.code || '');
        setOutput([]);
    }, [activeCodeBlock]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeCodeSandbox();
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [closeCodeSandbox]);
    
    const executeCode = () => {
        setOutput([]);
        const newOutput: any[] = [];
        
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            newOutput.push({ type: 'log', data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg) });
        };

        try {
            // eslint-disable-next-line no-eval
            eval(code);
        } catch (error: any) {
            newOutput.push({ type: 'error', data: [error.message] });
        } finally {
            console.log = originalConsoleLog;
            setOutput(newOutput);
        }
    }

    if (!activeCodeBlock) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={closeCodeSandbox}
            aria-modal="true"
            role="dialog"
        >
            <Card 
                className="w-full max-w-lg lg:max-w-4xl h-[80vh] flex flex-col transition-transform duration-300 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">Code Sandbox</h2>
                    <button 
                        onClick={closeCodeSandbox}
                        className="p-1 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-600/60 transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-4">
                    <div className="flex flex-col h-full overflow-hidden">
                        <h3 className="text-lg font-semibold mb-2 flex-shrink-0">Editor</h3>
                        <div className="flex-1 overflow-auto border border-zinc-200 dark:border-zinc-700 rounded-lg">
                           <CodeMirror
                                value={code}
                                height="100%"
                                extensions={[javascript({ jsx: true })]}
                                onChange={(value) => setCode(value)}
                                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                className="h-full"
                           />
                        </div>
                    </div>
                     <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                             <h3 className="text-lg font-semibold">Console</h3>
                             <Button onClick={executeCode} size="sm">Run Code</Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 font-mono text-xs">
                            {output.length === 0 && <p className="text-zinc-400">Click "Run Code" to see output...</p>}
                            {output.map((line, index) => (
                                <div key={index} className={`py-1 border-b border-zinc-200 dark:border-zinc-700 ${line.type === 'error' ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                    <pre> {line.data.join(' ')}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
             <style>{`
                .cm-editor { height: 100%; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CodeSandboxModal;