declare class GeminiService {
    private apiKey;
    private baseUrl;
    constructor();
    /**
     * Genera una pregunta de entrevista inteligente
     */
    generateInterviewQuestion(role?: string, difficulty?: 'junior' | 'mid' | 'senior', category?: 'technical' | 'behavioral' | 'situational'): Promise<string>;
    /**
     * Evalúa la respuesta del usuario a una pregunta de entrevista
     */
    evaluateInterviewResponse(question: string, userResponse: string, role?: string): Promise<{
        score: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
        technical_accuracy: number;
        communication_clarity: number;
        completeness: number;
    }>;
    /**
     * Realiza la petición HTTP a Gemini API
     */
    private makeRequest;
    /**
     * Extrae el texto de la respuesta de Gemini
     */
    private extractTextFromResponse;
    /**
     * Construye el prompt para generar preguntas
     */
    private buildQuestionPrompt;
    /**
     * Construye el prompt para evaluar respuestas
     */
    private buildEvaluationPrompt;
    /**
     * Parsea la respuesta de evaluación JSON
     */
    private parseEvaluationResponse;
    /**
     * Pregunta simulada para modo sin API
     */
    private getMockQuestion;
    /**
     * Analiza la respuesta del usuario y determina si generar una pregunta de seguimiento
     */
    analyzeResponseForFollowUp(originalQuestion: string, userResponse: string, interviewContext: {
        role: string;
        currentQuestionIndex: number;
        totalQuestions: number;
        previousResponses: string[];
    }): Promise<{
        shouldAskFollowUp: boolean;
        followUpQuestion?: string;
        reasoning: string;
        interestingPoints: string[];
    }>;
    /**
     * Construye el prompt para analizar si hacer pregunta de seguimiento
     */
    private buildFollowUpAnalysisPrompt;
    /**
     * Parsea la respuesta de análisis de seguimiento
     */
    private parseFollowUpResponse;
    /**
     * Análisis simulado para modo sin API - SIMPLE para no interferir con Gemini
     */
    private getMockFollowUpAnalysis;
    /**
     * Genera un comentario natural y empático sobre la respuesta del usuario
     */
    generateNaturalComment(userResponse: string, questionContext: string, commentType?: 'transition' | 'follow-up-intro'): Promise<string>;
    /**
     * Construye el prompt para generar comentarios naturales
     */
    private buildNaturalCommentPrompt;
    /**
     * Genera comentarios naturales simulados para modo sin API
     */
    private getMockNaturalComment;
    /**
     * Evaluación simulada para modo sin API
     */
    private getMockEvaluation;
}
export declare const geminiService: GeminiService;
export {};
//# sourceMappingURL=gemini.d.ts.map