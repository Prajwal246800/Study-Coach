import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { StudyContextType, StudyPlanItem, QuizQuestion, ChatMessage, Flashcard, ResourceItem, MindMapNode, PersonalizedReview, CodeBlock, StudyPlanTask } from '../types';
import * as geminiService from '../services/geminiService';
import { Chat } from '@google/genai';


const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[] | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [progress, setProgress] = useState<{ [day: number]: boolean[] } | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [resources, setResources] = useState<ResourceItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topicContent, setTopicContent] = useState<string | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // New state for advanced features
  const [interviewHistory, setInterviewHistory] = useState<ChatMessage[]>([]);
  const [interviewSession, setInterviewSession] = useState<Chat | null>(null);
  const [summarizedText, setSummarizedText] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [quizAnalysis, setQuizAnalysis] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [analogy, setAnalogy] = useState<string | null>(null);
  const [personalizedReview, setPersonalizedReview] = useState<PersonalizedReview | null>(null);
  const [activeCodeBlock, setActiveCodeBlock] = useState<CodeBlock | null>(null);

  // Load state from localStorage on initial load
  useEffect(() => {
    // Streak
    try {
        const savedStreakData = localStorage.getItem('studyStreak');
        if (savedStreakData) {
            const { count, lastCompletedDate } = JSON.parse(savedStreakData);
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (lastCompletedDate === today || lastCompletedDate === yesterday) {
                setStreak(count);
            } else {
                localStorage.removeItem('studyStreak');
            }
        }
    } catch (e) {
        console.error("Failed to parse streak data from localStorage", e);
        localStorage.removeItem('studyStreak');
    }
  }, []);

  const getFlashcardStorageKey = useCallback(() => {
    if (!topic) return null;
    return `flashcardDeck_${topic.replace(/\s+/g, '_')}`;
  }, [topic]);

  useEffect(() => {
    // Flashcards with SRS data
    if (topic) {
        try {
            const key = getFlashcardStorageKey();
            if(key){
                const savedFlashcards = localStorage.getItem(key);
                if (savedFlashcards) {
                    setFlashcards(JSON.parse(savedFlashcards));
                } else {
                    setFlashcards(null); // Clear flashcards if topic changes and no saved deck exists
                }
            }
        } catch (e) {
            console.error("Failed to parse flashcard data from localStorage", e);
        }
    }
  }, [topic, getFlashcardStorageKey]);


  const createStudyPlan = async (newTopic: string, newDuration: string) => {
    setIsLoading(true);
    setError(null);
    setStudyPlan(null);
    setTopic(newTopic); // Set topic early to allow flashcard loading
    setDuration(null);
    setProgress(null);
    setResources(null);
    setInterviewHistory([]);
    setInterviewSession(null);
    setSummarizedText(null);
    setQuizAnalysis(null);
    setMindMapData(null);
    setAnalogy(null);
    setChatHistory([]);
    setChatSession(null);
    setPersonalizedReview(null);

    try {
      const plan = await geminiService.generateStudyPlan(newTopic, newDuration);
      
      const planWithTaskIds = plan.map(dayItem => ({
          ...dayItem,
          tasks: dayItem.tasks.map((taskContent, index) => ({
              id: `task-${dayItem.day}-${index}`,
              content: (taskContent as unknown as string) // handle if API returns string instead of object
          })) as StudyPlanTask[]
      }));

      setStudyPlan(planWithTaskIds);
      setDuration(newDuration);

      const initialProgress = planWithTaskIds.reduce((acc, item) => {
        acc[item.day] = item.tasks.map(() => false);
        return acc;
      }, {} as { [day: number]: boolean[] });
      setProgress(initialProgress);

    } catch (err) {
      console.error(err);
      setError('Failed to create study plan. Please check your API key and try again.');
      setTopic(null); // Reset topic on failure
    } finally {
      setIsLoading(false);
    }
  };

  const reorderTasks = (day: number, oldIndex: number, newIndex: number) => {
    setStudyPlan(prevPlan => {
        if (!prevPlan) return null;
        const newPlan = [...prevPlan];
        const dayIndex = newPlan.findIndex(d => d.day === day);
        if (dayIndex === -1) return prevPlan;

        const dayTasks = [...newPlan[dayIndex].tasks];
        const [movedTask] = dayTasks.splice(oldIndex, 1);
        dayTasks.splice(newIndex, 0, movedTask);

        newPlan[dayIndex] = { ...newPlan[dayIndex], tasks: dayTasks };
        return newPlan;
    });

    setProgress(prevProgress => {
        if (!prevProgress) return null;
        const newProgress = { ...prevProgress };
        const dayProgress = [...newProgress[day]];
        const [movedProgress] = dayProgress.splice(oldIndex, 1);
        dayProgress.splice(newIndex, 0, movedProgress);
        newProgress[day] = dayProgress;
        return newProgress;
    });
  };

  const startChat = useCallback((initialMessage?: string) => {
    if (topic && !chatSession) {
        const newChat = geminiService.startChatSession(topic);
        setChatSession(newChat);
        const history: ChatMessage[] = initialMessage ? [{ role: 'user', content: initialMessage }] : [];
        setChatHistory(history);
    }
  }, [topic, chatSession]);

  const sendMessage = async (message: string) => {
    if (!chatSession) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    
    try {
        let fullResponse = '';
        const stream = await chatSession.sendMessageStream({ message });
        
        setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            fullResponse += chunk.text;
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = fullResponse;
                return newHistory;
            });
        }
    } catch (err) {
      console.error(err);
      setError('Failed to get response. Please try again.');
       setChatHistory(prev => prev.slice(0, -2)); // Remove user message and empty model message
    } finally {
      setIsLoading(false);
    }
  };
  
  const createQuiz = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setQuizAnalysis(null);
    setPersonalizedReview(null);
    try {
      const newQuiz = await geminiService.generateQuiz(topic, 5);
      setQuiz(newQuiz);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearQuiz = () => {
    setQuiz(null);
    setQuizAnalysis(null);
    setPersonalizedReview(null);
  };

  const getTopicContent = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setTopicContent(null);
    setAnalogy(null);
    setSelectedTopic(topic);
    setIsContentModalOpen(true);
    try {
      const content = await geminiService.generateTopicContent(topic);
      setTopicContent(content);
    } catch (err) {
      console.error(err);
      setError(`Failed to load content for "${topic}". Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTopicContent = () => {
    setIsContentModalOpen(false);
    setTimeout(() => {
        setTopicContent(null);
        setSelectedTopic(null);
        setError(null);
        setAnalogy(null);
    }, 300);
  };

  const updateTaskCompletion = (day: number, taskIndex: number, isCompleted: boolean) => {
    setProgress(prev => {
        if (!prev) return null;
        const newProgress = { ...prev };
        newProgress[day][taskIndex] = isCompleted;
        return newProgress;
    });

    if (isCompleted) {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const savedStreakData = localStorage.getItem('studyStreak');
            let currentStreak = 0;
            let lastDate = '';

            if (savedStreakData) {
                const { count, lastCompletedDate } = JSON.parse(savedStreakData);
                currentStreak = count;
                lastDate = lastCompletedDate;
            }

            if (lastDate !== todayStr) {
                 const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                 const newStreakCount = lastDate === yesterdayStr ? currentStreak + 1 : 1;
                 setStreak(newStreakCount);
                 localStorage.setItem('studyStreak', JSON.stringify({ count: newStreakCount, lastCompletedDate: todayStr }));
            }
        } catch (e) {
             console.error("Failed to update streak in localStorage", e);
        }
    }
  };

  const generateFlashcards = async (subTopic?: string) => {
    const targetTopic = subTopic || topic;
    if (!targetTopic) return;
    setIsLoading(true);
    setError(null);
    try {
        const newCardsData = await geminiService.generateFlashcards(targetTopic);
        const now = new Date().toISOString();
        const newFlashcards: Flashcard[] = newCardsData.map((card, index) => ({
            ...card,
            id: `${Date.now()}-${index}`,
            nextReview: now,
            interval: 1,
            easeFactor: 2.5
        }));

        setFlashcards(prev => {
            const existingCards = prev || [];
            // Filter out duplicates by term
            const combined = [...existingCards, ...newFlashcards].reduce((acc, current) => {
                if (!acc.find(item => item.term === current.term)) {
                    acc.push(current);
                }
                return acc;
            }, [] as Flashcard[]);

            const key = getFlashcardStorageKey();
            if(key) localStorage.setItem(key, JSON.stringify(combined));
            return combined;
        });
    } catch (err) {
        console.error(err);
        setError(`Failed to generate flashcards for "${targetTopic}". Please try again.`);
    } finally {
        setIsLoading(false);
    }
  };

  const updateFlashcardReview = (cardId: string, performance: 'Hard' | 'Good' | 'Easy') => {
      setFlashcards(prev => {
          if (!prev) return null;
          
          const cardIndex = prev.findIndex(c => c.id === cardId);
          if (cardIndex === -1) return prev;

          const card = { ...prev[cardIndex] };
          
          switch(performance) {
              case 'Hard':
                  card.interval = 1; // Reset interval
                  break;
              case 'Good':
                  card.interval = Math.ceil(card.interval * card.easeFactor * 0.8);
                  break;
              case 'Easy':
                  card.interval = Math.ceil(card.interval * card.easeFactor);
                  card.easeFactor += 0.15; // Become even easier next time
                  break;
          }
          
          const nextReviewDate = new Date();
          nextReviewDate.setDate(nextReviewDate.getDate() + card.interval);
          card.nextReview = nextReviewDate.toISOString();

          const newFlashcards = [...prev];
          newFlashcards[cardIndex] = card;
          
          const key = getFlashcardStorageKey();
          if(key) localStorage.setItem(key, JSON.stringify(newFlashcards));

          return newFlashcards;
      });
  };

  const clearFlashcards = () => {
      setError(null);
  };
  
  const findResources = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setResources(null);
    try {
        const newResources = await geminiService.findLearningResources(topic);
        setResources(newResources);
    } catch (err) {
        console.error(err);
        setError(`Failed to find resources for "${topic}". Please try again.`);
    } finally {
        setIsLoading(false);
    }
  };

  const clearResources = () => {
      setResources(null);
  };

  const startInterview = useCallback(() => {
    if (topic && !interviewSession) {
        const newChat = geminiService.startInterviewSession(topic);
        setInterviewSession(newChat);
        setInterviewHistory([{ role: 'model', content: `Hello! I'll be your interviewer today. Let's discuss ${topic}. To start, tell me a bit about your understanding of the core concepts.` }]);
    }
  }, [topic, interviewSession]);

  const sendInterviewMessage = async (message: string) => {
    if (!interviewSession) return;

    setInterviewHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);

    try {
        let fullResponse = '';
        const stream = await interviewSession.sendMessageStream({ message });
        
        setInterviewHistory(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            fullResponse += chunk.text;
            setInterviewHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].content = fullResponse;
                return newHistory;
            });
        }
    } catch (err) {
        console.error(err);
        setError('Failed to get response from interviewer. Please try again.');
        setInterviewHistory(prev => prev.slice(0, -2));
    } finally {
        setIsLoading(false);
    }
  };

  const summarizeText = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setSummarizedText(null);
    try {
        const summary = await geminiService.generateSummary(text);
        setSummarizedText(summary);
    } catch (err) {
        console.error(err);
        setError('Failed to generate summary. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const clearSummarizer = () => {
      setSummarizedText(null);
      setError(null);
  };

  const analyzeQuizPerformance = async (questions: QuizQuestion[], userAnswers: string[]) => {
      if (!topic) return;
      setIsLoading(true);
      setError(null);
      setQuizAnalysis(null);
      try {
          const analysis = await geminiService.analyzeQuizResults(topic, questions, userAnswers);
          setQuizAnalysis(analysis);
      } catch (err) {
          console.error(err);
          setError('Failed to analyze quiz results.');
      } finally {
          setIsLoading(false);
      }
  };

  const rephraseTopicContent = async () => {
      if (!topicContent) return;
      setIsLoading(true);
      setError(null);
      try {
          const rephrasedContent = await geminiService.rephraseExplanation(topicContent);
          setTopicContent(rephrasedContent);
      } catch (err) {
          console.error(err);
          setError('Failed to rephrase content. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  const rephraseChatMessage = async (messageIndex: number) => {
      const originalMessage = chatHistory[messageIndex];
      if (!originalMessage || originalMessage.role !== 'model') return;

      setChatHistory(prev => prev.map((msg, i) => i === messageIndex ? { ...msg, isRephrasing: true } : msg));

      try {
          const rephrasedContent = await geminiService.rephraseExplanation(originalMessage.content);
          setChatHistory(prev => prev.map((msg, i) => i === messageIndex ? { ...msg, content: rephrasedContent, isRephrasing: false } : msg));
      } catch (err) {
          console.error(err);
          setChatHistory(prev => prev.map((msg, i) => i === messageIndex ? { ...msg, isRephrasing: false } : msg));
          setError('Failed to rephrase message. Please try again.');
      }
  };

  const generateMindMap = async () => {
      if(!topic) return;
      setIsLoading(true);
      setError(null);
      setMindMapData(null);
      try {
          const data = await geminiService.generateMindMapData(topic);
          setMindMapData(data);
      } catch (err) {
          console.error(err);
          setError('Failed to generate mind map. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };
  
  const getAnalogy = async (concept: string) => {
    setIsLoading(true);
    setError(null);
    setAnalogy(null);
    try {
        const analogyText = await geminiService.generateAnalogyForConcept(concept);
        setAnalogy(analogyText);
    } catch(err) {
        console.error(err);
        setError('Failed to generate analogy. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const clearAnalogy = () => {
      setAnalogy(null);
  };

  const getPersonalizedReview = async (questions: QuizQuestion[], userAnswers: string[]) => {
      if (!topic) return;
      setIsLoading(true);
      setError(null);
      setPersonalizedReview(null);
      try {
          const review = await geminiService.generateTargetedReview(topic, questions, userAnswers);
          setPersonalizedReview(review);
      } catch (err) {
          console.error(err);
          setError('Failed to generate personalized review.');
      } finally {
          setIsLoading(false);
      }
  };
  
  const clearPersonalizedReview = () => {
      setPersonalizedReview(null);
  };
  
  const startRedemptionQuiz = (questions: QuizQuestion[]) => {
      setQuiz(questions);
      setPersonalizedReview(null);
      setQuizAnalysis(null);
  };

  const openCodeSandbox = (codeBlock: CodeBlock) => setActiveCodeBlock(codeBlock);
  const closeCodeSandbox = () => setActiveCodeBlock(null);

  return (
    <StudyContext.Provider value={{ 
      studyPlan, 
      topic, 
      duration, 
      quiz, 
      chatHistory,
      interviewHistory,
      progress,
      flashcards,
      resources,
      summarizedText,
      streak,
      isLoading, 
      error,
      topicContent,
      isContentModalOpen,
      selectedTopic,
      quizAnalysis,
      mindMapData,
      analogy,
      personalizedReview,
      activeCodeBlock,
      createStudyPlan, 
      reorderTasks,
      startChat,
      sendMessage, 
      sendInterviewMessage,
      createQuiz,
      clearQuiz,
      getTopicContent,
      clearTopicContent,
      updateTaskCompletion,
      generateFlashcards,
      updateFlashcardReview,
      findResources,
      clearFlashcards,
      clearResources,
      startInterview,
      summarizeText,
      clearSummarizer,
      analyzeQuizPerformance,
      rephraseTopicContent,
      rephraseChatMessage,
      generateMindMap,
      getAnalogy,
      clearAnalogy,
      getPersonalizedReview,
      clearPersonalizedReview,
      startRedemptionQuiz,
      openCodeSandbox,
      closeCodeSandbox,
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = (): StudyContextType => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};