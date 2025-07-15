import { GoogleGenAI, Type, Chat } from "@google/genai";
import { StudyPlanItem, QuizQuestion, Flashcard, ResourceItem, MindMapNode, PersonalizedReview } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateStudyPlan = async (topic: string, duration: string): Promise<StudyPlanItem[]> => {
  const studyPlanSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.INTEGER, description: "The day number in the study plan (e.g., 1, 2, 3)." },
        topic: { type: Type.STRING, description: "The specific sub-topic to be studied on this day." },
        tasks: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "A list of concrete tasks or activities for the day."
        },
        objective: { type: Type.STRING, description: "The main learning objective for the day." }
      },
      required: ["day", "topic", "tasks", "objective"]
    }
  };

  const prompt = `Create a detailed, day-by-day study plan for the topic "${topic}" to be completed in ${duration}. The plan should be structured for a beginner and cover the fundamental concepts progressively. For each day, provide a main objective, a specific sub-topic, and a list of actionable tasks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: studyPlanSchema,
    },
  });
  
  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText) as StudyPlanItem[];
  } catch (e) {
    console.error("Failed to parse study plan JSON:", e);
    throw new Error("Received an invalid format for the study plan from the API.");
  }
};

export const generateTopicContent = async (topic: string): Promise<string> => {
  const prompt = `Provide a detailed explanation of the topic: "${topic}". The explanation should be clear, comprehensive, and suitable for a beginner. Structure the content with clear headings, subheadings, and use bullet points for lists. Explain the core concepts and provide simple examples if possible. Format the entire output as Markdown. For runnable JavaScript code snippets, you MUST format them as a JSON object on a new line, like this:
{"codeBlock": {"language": "javascript", "code": "console.log('hello world')"}}
Do not wrap this JSON in markdown backticks.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

export const startChatSession = (topic: string): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a friendly and knowledgeable study coach. The user is currently studying "${topic}". Your role is to help them understand concepts, answer their questions, and provide encouragement. Keep your answers concise, clear, and tailored to a learner. You can and should use Markdown for formatting (headings, lists, bold, code blocks, etc.) to improve readability.
For runnable JavaScript code snippets, you MUST format them as a JSON object on a new line, like this:
{"codeBlock": {"language": "javascript", "code": "console.log('hello world')"}}
Do not wrap this JSON in markdown backticks.`,
    }
  });
  return chat;
};

export const startInterviewSession = (topic: string): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a professional, friendly technical interviewer. The user wants to practice for an interview about "${topic}". Your role is to ask them common but insightful interview questions about this topic, one at a time. Start with a broad opening question. Then, based on their answers, either dig deeper into that specific area or move to a new related concept. Do not provide the answers unless the user explicitly asks for a hint or the solution. Keep your questions clear and professional. You can use Markdown for formatting.`,
        }
    });
    return chat;
};

export const generateSummary = async (text: string): Promise<string> => {
    const prompt = `Please summarize the following text. The summary should be concise and capture the main ideas of the text provided. Format the output as Markdown, using headings and bullet points for clarity.\n\nText to summarize:\n"""\n${text}\n"""`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
}


export const generateQuiz = async (topic: string, numQuestions: number): Promise<QuizQuestion[]> => {
    const quizSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is right."}
            },
            required: ["question", "options", "correctAnswer", "explanation"]
        }
    };

    const prompt = `Generate a multiple-choice quiz on the topic "${topic}". The quiz should have ${numQuestions} questions. For each question, provide 4 options and identify the correct answer. Also include a brief explanation for the correct answer.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: quizSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as QuizQuestion[];
    } catch(e) {
        console.error("Failed to parse quiz JSON:", e);
        throw new Error("Received an invalid format for the quiz from the API.");
    }
};

export const generateFlashcards = async (topic: string): Promise<Omit<Flashcard, 'id' | 'nextReview' | 'interval' | 'easeFactor'>[]> => {
    const flashcardSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                term: { type: Type.STRING, description: "The key term or concept." },
                definition: { type: Type.STRING, description: "A clear and concise definition of the term." }
            },
            required: ["term", "definition"]
        }
    };

    const prompt = `Generate a set of 10-15 flashcards for the topic "${topic}". Each flashcard should have a key term and a concise definition suitable for a beginner.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: flashcardSchema,
        },
    });
    
    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText);
    } catch(e) {
        console.error("Failed to parse flashcard JSON:", e);
        throw new Error("Received an invalid format for the flashcards from the API.");
    }
};

export const findLearningResources = async (topic: string): Promise<ResourceItem[]> => {
    const prompt = `Find some helpful online learning resources (articles, tutorials, documentation) for the topic "${topic}".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
        const resources: ResourceItem[] = groundingMetadata.groundingChunks
            .map(chunk => chunk.web)
            .filter((web): web is { uri: string, title: string } => !!web && !!web.uri && !!web.title)
            .reduce((acc: ResourceItem[], current) => {
                // Deduplicate based on URI
                if (!acc.some(item => item.uri === current.uri)) {
                    acc.push(current);
                }
                return acc;
            }, []);
        return resources;
    }
    
    return [];
};

export const analyzeQuizResults = async (topic: string, questions: QuizQuestion[], userAnswers: string[]): Promise<string> => {
    const results = questions.map((q, i) => ({
        question: q.question,
        userAnswer: userAnswers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: userAnswers[i] === q.correctAnswer,
    }));

    const prompt = `You are a helpful study coach. A user has just completed a quiz on the topic "${topic}".
Here are their results:
${JSON.stringify(results, null, 2)}

Please provide a brief, encouraging analysis of their performance.
1. Start with an overall positive comment.
2. Identify their areas of strength (topics they seem to understand based on correct answers).
3. Identify the specific topics or concepts they should review based on their incorrect answers. Be specific.
4. Conclude with an encouraging sentence to motivate them to continue studying.

Format the output as Markdown with clear headings (e.g., "### Strengths") for each section.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const generateTargetedReview = async (topic: string, questions: QuizQuestion[], userAnswers: string[]): Promise<PersonalizedReview> => {
    const incorrectQuestions = questions.filter((q, i) => userAnswers[i] !== q.correctAnswer);
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of topics the user seems to understand well based on the questions they got right."
            },
            areasForImprovement: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of concepts the user struggled with, based on their incorrect answers."
            },
            recommendedTopics: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING, description: "Specific topic to review." },
                        reason: { type: Type.STRING, description: "Why this topic should be reviewed, related to the incorrect question." },
                    }
                },
                 description: "A list of specific topics to review based on incorrect answers, with a brief reason for each."
            },
            redemptionQuiz: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is right."}
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                },
                description: "A new, short quiz composed only of the questions the user got wrong."
            }
        },
        required: ["strengths", "areasForImprovement", "recommendedTopics", "redemptionQuiz"]
    };

    const prompt = `You are an expert study coach. A user just took a quiz on "${topic}". Their incorrect answers are for these questions:
${JSON.stringify(incorrectQuestions, null, 2)}

Please generate a personalized review plan.
1. Identify strengths based on the fact they got other questions right (you don't see the right ones, just infer).
2. List the specific areas for improvement based on the provided incorrect questions.
3. Recommend specific topics to review.
4. Create a "Redemption Quiz" containing only the questions they got wrong.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as PersonalizedReview;
    } catch(e) {
        console.error("Failed to parse personalized review JSON:", e, "Raw Text:", jsonText);
        throw new Error("Received an invalid format for the personalized review from the API.");
    }
};

export const rephraseExplanation = async (textToRephrase: string): Promise<string> => {
    const prompt = `Please rephrase the following text. The goal is to explain the same concept but from a different perspective, using a different analogy, or with a simpler structure. Make the new explanation clear and easy for a beginner to understand. Format the entire output as Markdown.

Original text:
"""
${textToRephrase}
"""

New, rephrased explanation:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};

export const generateMindMapData = async (topic: string): Promise<MindMapNode> => {
    const prompt = `Create a hierarchical mind map for the topic "${topic}". The mind map should start with the main topic and branch out into key sub-topics and concepts. The structure should be nested. Keep the hierarchy to a maximum of 3-4 levels deep.

You must respond with only a valid JSON object that follows this structure, with no other text or markdown formatting.

Example structure:
{
  "topic": "Main Topic",
  "children": [
    {
      "topic": "Sub-Topic 1",
      "children": [
        { "topic": "Detail 1.1", "children": [] },
        { "topic": "Detail 1.2", "children": [] }
      ]
    },
    {
      "topic": "Sub-Topic 2",
      "children": []
    }
  ]
}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const jsonText = response.text.trim().replace(/```json|```/g, ''); // Clean up potential markdown code blocks
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse mind map JSON:", e, "Raw response:", jsonText);
        throw new Error("Received an invalid format for the mind map from the API.");
    }
};

export const generateAnalogyForConcept = async (concept: string): Promise<string> => {
    const prompt = `Please provide a simple, relatable analogy to explain the concept of "${concept}". The analogy should be easy for a complete beginner to understand. Keep it concise. Format the output as Markdown.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    return response.text;
};