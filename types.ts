import { ReactNode, HTMLAttributes } from 'react';

export interface StudyPlanTask {
  id: string;
  content: string;
}

export interface StudyPlanItem {
  day: number;
  topic: string;
  tasks: StudyPlanTask[];
  objective: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isRephrasing?: boolean;
}

export interface Flashcard {
    id: string;
    term: string;
    definition: string;
    // Spaced Repetition System (SRS) properties
    nextReview: string; // ISO Date string
    interval: number; // in days
    easeFactor: number;
}

export interface ResourceItem {
    title: string;
    uri: string;
}

export interface MindMapNode {
    topic: string;
    children: MindMapNode[];
}

export interface PersonalizedReview {
  strengths: string[];
  areasForImprovement: string[];
  recommendedTopics: { topic: string, reason: string }[];
  redemptionQuiz: QuizQuestion[];
}

export interface CodeBlock {
    language: 'javascript';
    code: string;
}


export enum AppView {
  PLAN = 'PLAN',
  CHAT = 'CHAT',
  QUIZ = 'QUIZ',
  PROGRESS = 'PROGRESS',
  FLASHCARDS = 'FLASHCARDS',
  RESOURCES = 'RESOURCES',
  INTERVIEW = 'INTERVIEW',
  SUMMARIZER = 'SUMMARIZER',
  MIND_MAP = 'MIND_MAP',
}

export interface StudyContextType {
  studyPlan: StudyPlanItem[] | null;
  topic: string | null;
  duration: string | null;
  quiz: QuizQuestion[] | null;
  chatHistory: ChatMessage[];
  interviewHistory: ChatMessage[];
  progress: { [day: number]: boolean[] } | null;
  flashcards: Flashcard[] | null;
  resources: ResourceItem[] | null;
  summarizedText: string | null;
  streak: number;
  mindMapData: MindMapNode | null;
  isLoading: boolean;
  error: string | null;
  topicContent: string | null;
  isContentModalOpen: boolean;
  selectedTopic: string | null;
  quizAnalysis: string | null;
  analogy: string | null;
  personalizedReview: PersonalizedReview | null;
  activeCodeBlock: CodeBlock | null;
  createStudyPlan: (topic: string, duration:string) => Promise<void>;
  reorderTasks: (day: number, oldIndex: number, newIndex: number) => void;
  startChat: (initialMessage?: string) => void;
  sendMessage: (message: string) => Promise<void>;
  createQuiz: () => Promise<void>;
  clearQuiz: () => void;
  getTopicContent: (topic: string) => Promise<void>;
  clearTopicContent: () => void;
  updateTaskCompletion: (day: number, taskIndex: number, isCompleted: boolean) => void;
  generateFlashcards: (subTopic?: string) => Promise<void>;
  findResources: () => Promise<void>;
  clearFlashcards: () => void;
  clearResources: () => void;
  startInterview: () => void;
  sendInterviewMessage: (message: string) => Promise<void>;
  summarizeText: (text: string) => Promise<void>;
  clearSummarizer: () => void;
  analyzeQuizPerformance: (questions: QuizQuestion[], userAnswers: string[]) => Promise<void>;
  rephraseTopicContent: () => Promise<void>;
  rephraseChatMessage: (messageIndex: number) => Promise<void>;
  generateMindMap: () => Promise<void>;
  getAnalogy: (concept: string) => Promise<void>;
  clearAnalogy: () => void;
  updateFlashcardReview: (cardId: string, performance: 'Hard' | 'Good' | 'Easy') => void;
  getPersonalizedReview: (questions: QuizQuestion[], userAnswers: string[]) => Promise<void>;
  clearPersonalizedReview: () => void;
  startRedemptionQuiz: (questions: QuizQuestion[]) => void;
  openCodeSandbox: (codeBlock: CodeBlock) => void;
  closeCodeSandbox: () => void;
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}