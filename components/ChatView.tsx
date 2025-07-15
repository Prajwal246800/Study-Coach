import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { UserIcon, RobotIcon, RefreshIcon, DownloadIcon, MicrophoneIcon, LightBulbIcon } from './common/Icons';
import { downloadAsMarkdown } from '../utils/export';
import { MarkdownRenderer } from './common/MarkdownRenderer';

// Browser's SpeechRecognition type, with vendor prefixes
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;


const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
    const { openCodeSandbox } = useStudy();

    try {
        const parts = content.split(/(\n{"codeBlock":.*}\n)/s);
        return (
            <>
                {parts.map((part, index) => {
                    if (part.startsWith('\n{"codeBlock"')) {
                        try {
                            const json = JSON.parse(part);
                            if (json.codeBlock) {
                                return (
                                    <div key={index} className="my-2 p-4 bg-zinc-200 dark:bg-zinc-900 rounded-lg">
                                        <p className="font-mono text-sm mb-2 text-zinc-500">Runnable JavaScript Snippet:</p>
                                        <pre className="text-xs bg-black/80 text-white p-2 rounded">
                                            <code>{json.codeBlock.code}</code>
                                        </pre>
                                        <Button onClick={() => openCodeSandbox(json.codeBlock)} size="sm" className="mt-2">
                                            Run Code
                                        </Button>
                                    </div>
                                );
                            }
                        } catch {
                            // Not valid JSON, fall through to render as text
                        }
                    }
                    return <MarkdownRenderer key={index}>{part}</MarkdownRenderer>;
                })}
            </>
        );
    } catch (e) {
        return <MarkdownRenderer>{content}</MarkdownRenderer>;
    }
};


const ChatView: React.FC = () => {
    const { topic, chatHistory, sendMessage, isLoading, startChat, rephraseChatMessage, getAnalogy, analogy, clearAnalogy, error } = useStudy();
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const analogyMessageIndexRef = useRef<number | null>(null);

    useEffect(() => {
        startChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic]); 

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);
    
    useEffect(() => {
        if(analogy && analogyMessageIndexRef.current !== null) {
            sendMessage(`Analogy for my last question:\n\n${analogy}`);
            clearAnalogy();
            analogyMessageIndexRef.current = null;
        }
    }, [analogy, clearAnalogy, sendMessage])

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleGetAnalogy = (messageContent: string) => {
        getAnalogy(messageContent);
    };

    const handleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        if (!hasSpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);
        
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInput(transcript);
            if(event.results[0].isFinal) {
                // We can auto-send here, but for better UX, let's let the user press send.
                // handleSend();
            }
        };
        
        recognition.start();
    };

    const handleExportChat = () => {
        if (!topic || chatHistory.length === 0) return;
        const markdownContent = chatHistory.map(msg => {
            const prefix = msg.role === 'user' ? '**You:**' : '**AI Coach:**';
            return `${prefix}\n\n${msg.content}\n\n---\n\n`;
        }).join('');

        downloadAsMarkdown(`${topic.replace(/\s+/g, '_')}_chat.md`, `# Chat History: ${topic}\n\n${markdownContent}`);
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Chat with your AI Coach</h2>
                    <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mt-1">Ask anything about <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span></p>
                </div>
                <Button onClick={handleExportChat} variant="secondary" size="sm" className="flex items-center gap-2 self-start" disabled={chatHistory.length === 0}>
                    <DownloadIcon className="h-4 w-4" />
                    Export Chat
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-white/50 dark:bg-zinc-800/50 rounded-t-lg shadow-inner">
                 {chatHistory.length === 0 && (
                    <div className="flex items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                        <p>No messages yet. Ask a question to get started!</p>
                    </div>
                 )}
                <div className="space-y-6">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'group'}`}>
                            {msg.role === 'model' && <RobotIcon className="h-8 w-8 text-teal-500 flex-shrink-0" />}
                            <div className="relative">
                                <div className={`px-4 py-3 rounded-xl max-w-xs sm:max-w-md lg:max-w-xl ${
                                    msg.role === 'user' 
                                    ? 'bg-teal-600 text-white rounded-br-none' 
                                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                                }`}>
                                    <ChatMessageContent content={msg.content} />
                                    {isLoading && index === chatHistory.length - 1 && msg.role === 'model' && msg.content.length === 0 && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                                </div>
                                {msg.role === 'model' && !isLoading && msg.content && (
                                     <div className="absolute -bottom-3 -right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {msg.isRephrasing ? (
                                            <div className="p-1.5 bg-zinc-200 dark:bg-zinc-600 rounded-full">
                                                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => rephraseChatMessage(index)} 
                                                className="p-1.5 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 rounded-full transition-colors"
                                                title="Rephrase this explanation"
                                            >
                                                <RefreshIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300"/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleGetAnalogy(msg.content)} 
                                            className="p-1.5 bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 rounded-full transition-colors"
                                            title="Explain with an analogy"
                                        >
                                            <LightBulbIcon className="h-4 w-4 text-zinc-600 dark:text-zinc-300"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && <UserIcon className="h-8 w-8 text-zinc-500 flex-shrink-0" />}
                        </div>
                    ))}
                    {error && <p className="text-red-500 mt-2 text-center text-sm">{error}</p>}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 rounded-b-lg shadow-inner">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={isListening ? "Listening..." : "Type your question..."}
                        className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 text-sm sm:text-base"
                        disabled={isLoading}
                    />
                    {hasSpeechRecognition && (
                        <Button onClick={handleListen} variant="secondary" size="md" className="!px-3" disabled={isLoading} aria-label="Use microphone">
                           <MicrophoneIcon className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-600 dark:text-zinc-300'}`} />
                        </Button>
                    )}
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="md">
                        {isLoading ? '...' : 'Send'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;