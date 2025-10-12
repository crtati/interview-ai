"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const logger_1 = require("../utils/logger");
class GeminiService {
    constructor() {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.apiKey = process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            logger_1.logger.warn('⚠️  GEMINI_API_KEY no configurada. Usando modo simulación.');
        }
        else {
            logger_1.logger.info('✅ Gemini AI client initialized with API key: ' + this.apiKey.substring(0, 20) + '...');
        }
    }
    /**
     * Genera una pregunta de entrevista inteligente
     */
    async generateInterviewQuestion(role = 'desarrollador', difficulty = 'mid', category = 'technical') {
        if (!this.apiKey) {
            return this.getMockQuestion(category, difficulty);
        }
        try {
            const prompt = this.buildQuestionPrompt(role, difficulty, category);
            const response = await this.makeRequest(prompt);
            return this.extractTextFromResponse(response);
        }
        catch (error) {
            logger_1.logger.error('Error generating question with Gemini:', error);
            return this.getMockQuestion(category, difficulty);
        }
    }
    /**
     * Evalúa la respuesta del usuario a una pregunta de entrevista
     */
    async evaluateInterviewResponse(question, userResponse, role = 'desarrollador') {
        if (!this.apiKey) {
            return this.getMockEvaluation(userResponse);
        }
        try {
            const prompt = this.buildEvaluationPrompt(question, userResponse, role);
            const response = await this.makeRequest(prompt);
            return this.parseEvaluationResponse(this.extractTextFromResponse(response));
        }
        catch (error) {
            logger_1.logger.error('Error evaluating response with Gemini:', error);
            return this.getMockEvaluation(userResponse);
        }
    }
    /**
     * Realiza la petición HTTP a Gemini API
     */
    async makeRequest(prompt) {
        const url = `${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        const payload = {
            contents: [{
                    parts: [{
                            text: prompt
                        }]
                }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Extrae el texto de la respuesta de Gemini
     */
    extractTextFromResponse(response) {
        try {
            return response.candidates[0]?.content?.parts[0]?.text || 'Error al procesar respuesta';
        }
        catch (error) {
            logger_1.logger.error('Error extracting text from Gemini response:', error);
            return 'Error al procesar respuesta';
        }
    }
    /**
     * Construye el prompt para generar preguntas
     */
    buildQuestionPrompt(role, difficulty, category) {
        return `Eres un experto reclutador de tecnología. Genera UNA pregunta de entrevista para un ${role} nivel ${difficulty}.

Categoría: ${category}
- Si es "technical": pregunta sobre conocimientos técnicos, código, arquitectura
- Si es "behavioral": pregunta sobre comportamiento, trabajo en equipo, liderazgo  
- Si es "situational": pregunta sobre situaciones hipotéticas, resolución de problemas

Formato de respuesta: Solo la pregunta, sin introducción ni comentarios adicionales.

Ejemplos de buenas preguntas:
- Technical: "¿Cómo implementarías un sistema de caché para una aplicación web de alto tráfico?"
- Behavioral: "Cuéntame sobre una vez que tuviste que resolver un conflicto con un compañero de equipo"
- Situational: "¿Qué harías si descubrieras un bug crítico en producción 5 minutos antes de una demo importante?"

Genera la pregunta:`;
    }
    /**
     * Construye el prompt para evaluar respuestas
     */
    buildEvaluationPrompt(question, response, role) {
        return `Eres un experto evaluador de entrevistas técnicas. Evalúa esta respuesta de candidato para ${role}.

PREGUNTA: "${question}"

RESPUESTA DEL CANDIDATO: "${response}"

Evalúa la respuesta usando estos criterios:
1. Precisión técnica (1-10)
2. Claridad de comunicación (1-10) 
3. Completitud de la respuesta (1-10)

Responde EXACTAMENTE en este formato JSON (sin comentarios adicionales):

{
  "score": [número del 1-10],
  "feedback": "[feedback general en español, máximo 100 palabras]",
  "strengths": ["[fortaleza 1]", "[fortaleza 2]"],
  "improvements": ["[mejora 1]", "[mejora 2]"],
  "technical_accuracy": [número 1-10],
  "communication_clarity": [número 1-10],
  "completeness": [número 1-10]
}`;
    }
    /**
     * Parsea la respuesta de evaluación JSON
     */
    parseEvaluationResponse(response) {
        try {
            // Extraer JSON de la respuesta
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found in response');
        }
        catch (error) {
            logger_1.logger.error('Error parsing evaluation response:', error);
            return this.getMockEvaluation('');
        }
    }
    /**
     * Pregunta simulada para modo sin API
     */
    getMockQuestion(category, difficulty) {
        const questions = {
            technical: {
                junior: '¿Cuál es la diferencia entre let, const y var en JavaScript?',
                mid: '¿Cómo implementarías un sistema de autenticación con JWT?',
                senior: '¿Cómo diseñarías la arquitectura de microservicios para una plataforma de e-commerce?'
            },
            behavioral: {
                junior: 'Describe una situación donde tuviste que aprender una tecnología nueva rápidamente',
                mid: 'Cuéntame sobre un proyecto desafiante en el que trabajaste y cómo lo resolviste',
                senior: 'Describe cómo has mentorizado a desarrolladores junior en tu experiencia'
            },
            situational: {
                junior: '¿Qué harías si encuentras un bug en el código de un compañero?',
                mid: '¿Cómo priorizarías las tareas cuando tienes múltiples deadlines urgentes?',
                senior: '¿Cómo manejarías la migración de una aplicación legacy a tecnologías modernas?'
            }
        };
        return questions[category][difficulty] ||
            'Háblame sobre tu experiencia en desarrollo de software';
    }
    /**
     * Analiza la respuesta del usuario y determina si generar una pregunta de seguimiento
     */
    async analyzeResponseForFollowUp(originalQuestion, userResponse, interviewContext) {
        if (!this.apiKey) {
            return this.getMockFollowUpAnalysis(userResponse);
        }
        try {
            const prompt = this.buildFollowUpAnalysisPrompt(originalQuestion, userResponse, interviewContext);
            const response = await this.makeRequest(prompt);
            return this.parseFollowUpResponse(this.extractTextFromResponse(response));
        }
        catch (error) {
            logger_1.logger.error('Error analyzing response for follow-up:', error);
            return this.getMockFollowUpAnalysis(userResponse);
        }
    }
    /**
     * Construye el prompt para analizar si hacer pregunta de seguimiento
     */
    buildFollowUpAnalysisPrompt(originalQuestion, userResponse, context) {
        return `Eres una IA entrevistadora experta que analiza respuestas para decidir si hacer seguimiento.

PREGUNTA: "${originalQuestion}"
RESPUESTA: "${userResponse}"

ANÁLISIS:
- Si la respuesta es muy corta o vaga → hacer seguimiento
- Si ya tiene suficiente detalle → continuar
- Si menciona algo específico interesante → explorar más

Tu pregunta de seguimiento debe ser específica al contexto de lo que mencionó el candidato, no genérica.

Responde en JSON:
{
  "shouldAskFollowUp": true/false,
  "followUpQuestion": "pregunta específica o null",
  "reasoning": "razón breve",
  "interestingPoints": ["aspectos relevantes"]
}`;
    }
    /**
     * Parsea la respuesta de análisis de seguimiento
     */
    parseFollowUpResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found in response');
        }
        catch (error) {
            logger_1.logger.error('Error parsing follow-up response:', error);
            return this.getMockFollowUpAnalysis('');
        }
    }
    /**
     * Análisis simulado para modo sin API - SIMPLE para no interferir con Gemini
     */
    getMockFollowUpAnalysis(response) {
        // Modo mock ultra-simple: NUNCA hacer seguimiento
        // Gemini real debe manejar toda la lógica inteligente
        return {
            shouldAskFollowUp: false,
            followUpQuestion: null,
            reasoning: "Modo simulación - Gemini real debe manejar el análisis",
            interestingPoints: ["Respuesta recibida"]
        };
    }
    /**
     * Genera un comentario natural y empático sobre la respuesta del usuario
     */
    async generateNaturalComment(userResponse, questionContext, commentType = 'transition') {
        if (!this.apiKey) {
            return this.getMockNaturalComment(userResponse, commentType);
        }
        try {
            const prompt = this.buildNaturalCommentPrompt(userResponse, questionContext, commentType);
            const response = await this.makeRequest(prompt);
            return this.extractTextFromResponse(response).trim();
        }
        catch (error) {
            logger_1.logger.error('Error generating natural comment:', error);
            return this.getMockNaturalComment(userResponse, commentType);
        }
    }
    /**
     * Construye el prompt para generar comentarios naturales
     */
    buildNaturalCommentPrompt(userResponse, questionContext, commentType) {
        const typeInstruction = commentType === 'follow-up-intro'
            ? 'Genera una introducción natural antes de hacer una pregunta de seguimiento'
            : 'Genera un comentario de transición empático antes de pasar a la siguiente pregunta';
        return `Eres una entrevistadora virtual empática y profesional. ${typeInstruction}.

CONTEXTO DE LA PREGUNTA: "${questionContext}"
RESPUESTA DEL USUARIO: "${userResponse}"

INSTRUCCIONES:
- Genera UN comentario corto (máximo 15 palabras)
- Debe sonar natural, empático y profesional
- Debe reflejar que realmente escuchaste y entendiste la respuesta
- Menciona algo específico que el usuario dijo
- Usa un tono conversacional, como si fueras una persona real
- Evita ser genérico o robótico

EJEMPLOS DE BUENOS COMENTARIOS:
- "Qué interesante tu experiencia con Django para desarrollo web"
- "Me gusta que combines análisis de datos con desarrollo"
- "Veo que tienes buena experiencia en automatización con Python"
- "Perfecto, dominas un stack muy sólido para desarrollo web"

Genera SOLO el comentario, sin explicaciones adicionales:`;
    }
    /**
     * Genera comentarios naturales simulados para modo sin API
     */
    getMockNaturalComment(response, commentType) {
        const lowerResponse = response.toLowerCase();
        const isJuniorProfile = /\b(recién|egresado|graduado|sin experiencia|junior|estudiante|institución|universidad|pequeños)\b/i.test(lowerResponse);
        if (commentType === 'follow-up-intro') {
            if (isJuniorProfile) {
                if (lowerResponse.includes('machine learning')) {
                    return "Qué interesante tu experiencia con machine learning";
                }
                else if (lowerResponse.includes('paginas web') || lowerResponse.includes('web')) {
                    return "Valioso tu trabajo en desarrollo web";
                }
                else if (lowerResponse.includes('qa')) {
                    return "Excelente que hayas explorado el área de QA";
                }
                else {
                    return "Me parecen valiosos esos proyectos académicos";
                }
            }
            else if (lowerResponse.includes('python') && lowerResponse.includes('django')) {
                return "Interesante combinación de Python y Django";
            }
            else if (lowerResponse.includes('datos') || lowerResponse.includes('análisis')) {
                return "Me llama la atención tu trabajo con datos";
            }
            else if (lowerResponse.includes('automatización') || lowerResponse.includes('automatizar')) {
                return "Qué valioso tu enfoque en automatización";
            }
            else {
                return "Me parece interesante lo que comentas";
            }
        }
        else {
            // Comentarios de transición más específicos y empáticos
            if (isJuniorProfile) {
                if (lowerResponse.includes('machine learning')) {
                    return "Impresionante tu experiencia con ML como estudiante";
                }
                else if (lowerResponse.includes('paginas web') || lowerResponse.includes('web')) {
                    return "Excelente base en desarrollo web";
                }
                else if (lowerResponse.includes('qa')) {
                    return "Muy buena experiencia en testing y QA";
                }
                else if (lowerResponse.includes('proyecto')) {
                    return "Valiosos esos proyectos para tu formación";
                }
                else {
                    return "Perfecto, entiendo tu perfil como recién egresado";
                }
            }
            else if (lowerResponse.includes('python') && lowerResponse.includes('django')) {
                return "Excelente stack con Python y Django";
            }
            else if (lowerResponse.includes('javascript') && lowerResponse.includes('python')) {
                return "Muy buena combinación de tecnologías";
            }
            else if (lowerResponse.includes('datos') || lowerResponse.includes('análisis')) {
                return "Me gusta mucho tu enfoque hacia los datos";
            }
            else if (lowerResponse.includes('automatización') || lowerResponse.includes('automatizar')) {
                return "Valioso tu trabajo en automatización";
            }
            else if (lowerResponse.includes('empresa') || lowerResponse.includes('proyecto')) {
                return "Interesante tu experiencia profesional";
            }
            else if (lowerResponse.includes('aprender') || lowerResponse.includes('intermedio')) {
                return "Me gusta tu honestidad y ganas de crecer";
            }
            else {
                return "Perfecto, entiendo tu experiencia";
            }
        }
    }
    /**
     * Evaluación simulada para modo sin API
     */
    getMockEvaluation(response) {
        const wordCount = response.split(' ').length;
        const baseScore = Math.min(10, Math.max(1, Math.floor(wordCount / 10)));
        return {
            score: baseScore,
            feedback: 'Respuesta clara y bien estructurada. Se nota conocimiento del tema.',
            strengths: [
                'Comunicación clara y directa',
                'Demuestra conocimiento técnico'
            ],
            improvements: [
                'Podría agregar más ejemplos específicos',
                'Considerar aspectos de escalabilidad'
            ],
            technical_accuracy: baseScore,
            communication_clarity: Math.min(10, baseScore + 1),
            completeness: Math.max(1, baseScore - 1)
        };
    }
}
// Instancia singleton
exports.geminiService = new GeminiService();
//# sourceMappingURL=gemini.js.map