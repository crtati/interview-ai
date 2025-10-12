declare class OpenAIService {
    private client;
    private apiKey;
    constructor();
    /**
     * Generar pregunta de entrevista contextual
     */
    generateInterviewQuestion(jobRole: string, experienceLevel: string, previousQuestions?: string[]): Promise<string>;
    /**
     * Evaluar respuesta de entrevista con feedback detallado
     */
    evaluateInterviewResponse(question: string, answer: string, jobRole: string, experienceLevel: string): Promise<{
        overallScore: number;
        categories: {
            clarity: number;
            technical: number;
            communication: number;
            relevance: number;
        };
        strengths: string[];
        improvements: string[];
        feedback: string;
        recommendation: string;
    }>;
    /**
     * Generar feedback general de la entrevista
     */
    generateOverallFeedback(responses: Array<{
        question: string;
        answer: string;
        evaluation: any;
    }>, jobRole: string): Promise<{
        overallPerformance: string;
        keyStrengths: string[];
        priorityImprovements: string[];
        nextSteps: string[];
        encouragement: string;
    }>;
}
export declare const openAIService: OpenAIService;
export {};
//# sourceMappingURL=openai.d.ts.map