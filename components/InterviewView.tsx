import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from './common/Button';
import { UserIcon, RobotIcon, MicrophoneIcon, SpeakerWaveIcon } from './common/Icons';
import { MarkdownRenderer } from './common/MarkdownRenderer';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const hasSpeechRecognition = !!SpeechRecognition;

const InterviewView: React.FC = () => {
    const { topic, interviewHistory, sendInterviewMessage, isLoading, startInterview, error } = useStudy();
    
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const silenceTimeoutRef = useRef<number | null>(null);

    // Voice Conversation Mode State
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const lastSpokenMessageIndex = useRef<number | null>(null);
    const [userMessage, setUserMessage] = useState<string | null>(null);

    const inputRef = useRef(input);
    inputRef.current = input;

    // Load available TTS voices
    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = useCallback(() => {
        const messageToSend = inputRef.current.trim();
        if (messageToSend && !isLoading) {
            sendInterviewMessage(messageToSend);
            setInput('');
        }
    }, [isLoading, sendInterviewMessage]);

    const handleListen = useCallback(() => {
        if (!hasSpeechRecognition || !isVoiceMode || isListening) return;

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                setUserMessage("I didn't catch that. Could you please repeat?");
                setTimeout(() => setUserMessage(null), 3000);
            }
            setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
             setUserMessage(null);
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                finalTranscript += event.results[i][0].transcript;
            }
            setInput(finalTranscript);

            silenceTimeoutRef.current = window.setTimeout(() => {
                recognition.stop();
                handleSend();
            }, 1500); // Auto-send after 1.5 seconds of silence
        };
        
        recognition.start();
    }, [isVoiceMode, isListening, handleSend]);

    const speak = useCallback((text: string, onEnd: () => void) => {
        if (!isVoiceMode || !text.trim()) {
            onEnd();
            return;
        };
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Prioritize Indian accent, then other fallbacks
        const indianVoice = voices.find(v => v.lang === 'en-IN');
        const googleUSEnglish = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'));
        const anyEnglish = voices.find(v => v.lang.startsWith('en'));
        
        utterance.voice = indianVoice || googleUSEnglish || anyEnglish || voices[0];
        
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd();
        };
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setIsSpeaking(false);
            onEnd(); // Still try to proceed
        };
        window.speechSynthesis.speak(utterance);
    }, [isVoiceMode, voices]);

    // Main conversational flow effect
    useEffect(() => {
        const lastMessage = interviewHistory[interviewHistory.length - 1];
        if (isVoiceMode && lastMessage && lastMessage.role === 'model' && lastSpokenMessageIndex.current !== interviewHistory.length - 1) {
            if (isLoading) return; // Don't speak while the next message is loading
            lastSpokenMessageIndex.current = interviewHistory.length - 1;
            speak(lastMessage.content.replace(/[*#`]/g, ''), () => {
                handleListen();
            });
        }
    }, [interviewHistory, isVoiceMode, isLoading, speak, handleListen]);

    useEffect(() => {
        startInterview();
    }, [startInterview, topic]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [interviewHistory]);
    
    const toggleVoiceMode = () => {
        setIsVoiceMode(prev => {
            const turningOff = prev;
            if (turningOff) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    setIsListening(false);
                }
            }
            return !prev;
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-4">
                 <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Mock Interview</h2>
                    <p className="text-md sm:text-lg text-zinc-600 dark:text-zinc-400 mt-1">Practice for your interview on <span className="font-semibold text-teal-600 dark:text-teal-400">{topic}</span></p>
                </div>
                 <div className="flex items-center space-x-2 self-start sm:self-center">
                    <label htmlFor="voice-mode-toggle" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Voice Conversation</label>
                    <button
                        id="voice-mode-toggle"
                        onClick={toggleVoiceMode}
                        role="switch"
                        aria-checked={isVoiceMode}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                        isVoiceMode ? 'bg-teal-600' : 'bg-zinc-200 dark:bg-zinc-600'
                        }`}
                    >
                        <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isVoiceMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                        />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-white/50 dark:bg-zinc-800/50 rounded-t-lg shadow-inner">
                <div className="space-y-6">
                    {interviewHistory.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <RobotIcon className="h-8 w-8 text-teal-500 flex-shrink-0" />}
                             <div className="relative">
                                <div className={`px-4 py-3 rounded-xl max-w-xs sm:max-w-md lg:max-w-xl ${
                                    msg.role === 'user' 
                                    ? 'bg-teal-600 text-white rounded-br-none' 
                                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                                }`}>
                                    <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                                    {isLoading && index === interviewHistory.length - 1 && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />}
                                </div>
                                {(isSpeaking && lastSpokenMessageIndex.current === index) && (
                                     <div className="absolute top-1/2 -translate-y-1/2 -right-8 text-teal-500">
                                        <SpeakerWaveIcon className="w-5 h-5 animate-pulse" />
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && <UserIcon className="h-8 w-8 text-zinc-500 flex-shrink-0" />}
                        </div>
                    ))}
                     {error && interviewHistory.length > 0 && (
                        <div className="text-center text-red-500 text-sm">
                            <p>{error}</p>
                        </div>
                    )}
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
                        placeholder={isListening ? "Listening..." : (isVoiceMode ? "Voice mode is active..." : "Your answer...")}
                        className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 text-sm sm:text-base"
                        disabled={isLoading || isVoiceMode}
                    />
                     {!isVoiceMode && hasSpeechRecognition && (
                        <Button onClick={handleListen} variant="secondary" size="md" className="!px-3" disabled={isLoading} aria-label="Use microphone">
                           <MicrophoneIcon className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-600 dark:text-zinc-300'}`} />
                        </Button>
                    )}
                    <Button onClick={handleSend} disabled={isLoading || !input.trim() || isVoiceMode} size="md">
                        {isLoading ? '...' : 'Send'}
                    </Button>
                </div>
                 {isVoiceMode && (
                    <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2 h-5">
                        {userMessage ? (<span className="text-yellow-500">{userMessage}</span>) :
                         isListening ? 'Listening for your response...' : (isSpeaking ? 'Interviewer is speaking...' : 'Ready for the next question.')}
                    </div>
                )}
                <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-2">Note: AI voice will use an Indian accent if available in your browser.</p>
            </div>
        </div>
    );
};

export default InterviewView;