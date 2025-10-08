import { logger } from '../utils/logger'

/**
 * Servicio de Google Gemini AI (Alternativa GRATUITA a OpenAI)
 * 
 * Para obtener una API key gratuita:
 * 1. Ve a https://makersuite.google.com/app/apikey
 * 2. Crea un nuevo proyecto
 * 3. Genera una API key gratuita
 * 4. Límites: 15 requests por minuto, gratis para siempre
 * 
 * Actualizado con preguntas contextuales inteligentes
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

class GeminiService {
  private apiKey: string
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    
    if (!this.apiKey) {
      logger.warn('⚠️  GEMINI_API_KEY no configurada. Usando modo simulación.')
    } else {
      logger.info('✅ Gemini AI client initialized with API key: ' + this.apiKey.substring(0, 20) + '...')
    }
  }

  /**
   * Genera una pregunta de entrevista inteligente
   */
  async generateInterviewQuestion(
    role: string = 'desarrollador',
    difficulty: 'junior' | 'mid' | 'senior' = 'mid',
    category: 'technical' | 'behavioral' | 'situational' = 'technical'
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getMockQuestion(category, difficulty)
    }

    try {
      const prompt = this.buildQuestionPrompt(role, difficulty, category)
      const response = await this.makeRequest(prompt)
      
      return this.extractTextFromResponse(response)
    } catch (error) {
      logger.error('Error generating question with Gemini:', error)
      return this.getMockQuestion(category, difficulty)
    }
  }

  /**
   * Evalúa la respuesta del usuario a una pregunta de entrevista
   */
  async evaluateInterviewResponse(
    question: string,
    userResponse: string,
    role: string = 'desarrollador'
  ): Promise<{
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
    technical_accuracy: number
    communication_clarity: number
    completeness: number
  }> {
    if (!this.apiKey) {
      return this.getMockEvaluation(userResponse)
    }

    try {
      const prompt = this.buildEvaluationPrompt(question, userResponse, role)
      const response = await this.makeRequest(prompt)
      
      return this.parseEvaluationResponse(this.extractTextFromResponse(response))
    } catch (error) {
      logger.error('Error evaluating response with Gemini:', error)
      return this.getMockEvaluation(userResponse)
    }
  }

  /**
   * Realiza la petición HTTP a Gemini API
   */
  private async makeRequest(prompt: string): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`
    
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
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    return await response.json() as GeminiResponse
  }

  /**
   * Extrae el texto de la respuesta de Gemini
   */
  private extractTextFromResponse(response: GeminiResponse): string {
    try {
      return response.candidates[0]?.content?.parts[0]?.text || 'Error al procesar respuesta'
    } catch (error) {
      logger.error('Error extracting text from Gemini response:', error)
      return 'Error al procesar respuesta'
    }
  }

  /**
   * Construye el prompt para generar preguntas
   */
  private buildQuestionPrompt(role: string, difficulty: string, category: string): string {
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

Genera la pregunta:`
  }

  /**
   * Construye el prompt para evaluar respuestas
   */
  private buildEvaluationPrompt(question: string, response: string, role: string): string {
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
}`
  }

  /**
   * Parsea la respuesta de evaluación JSON
   */
  private parseEvaluationResponse(response: string): any {
    try {
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      logger.error('Error parsing evaluation response:', error)
      return this.getMockEvaluation('')
    }
  }

  /**
   * Pregunta simulada para modo sin API
   */
  private getMockQuestion(category: string, difficulty: string): string {
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
    }

    return questions[category as keyof typeof questions][difficulty as keyof typeof questions.technical] || 
           'Háblame sobre tu experiencia en desarrollo de software'
  }

  /**
   * Analiza la respuesta del usuario y determina si generar una pregunta de seguimiento
   */
  async analyzeResponseForFollowUp(
    originalQuestion: string,
    userResponse: string,
    interviewContext: {
      role: string
      currentQuestionIndex: number
      totalQuestions: number
      previousResponses: string[]
    }
  ): Promise<{
    shouldAskFollowUp: boolean
    followUpQuestion?: string
    reasoning: string
    interestingPoints: string[]
  }> {
    if (!this.apiKey) {
      return this.getMockFollowUpAnalysis(userResponse)
    }

    try {
      const prompt = this.buildFollowUpAnalysisPrompt(
        originalQuestion, 
        userResponse, 
        interviewContext
      )
      const response = await this.makeRequest(prompt)
      
      return this.parseFollowUpResponse(this.extractTextFromResponse(response))
    } catch (error) {
      logger.error('Error analyzing response for follow-up:', error)
      return this.getMockFollowUpAnalysis(userResponse)
    }
  }

  /**
   * Construye el prompt para analizar si hacer pregunta de seguimiento
   */
  private buildFollowUpAnalysisPrompt(
    originalQuestion: string,
    userResponse: string,
    context: any
  ): string {
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
}`
  }

  /**
   * Parsea la respuesta de análisis de seguimiento
   */
  private parseFollowUpResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      logger.error('Error parsing follow-up response:', error)
      return this.getMockFollowUpAnalysis('')
    }
  }

  /**
   * Análisis simulado para modo sin API - SIMPLE para no interferir con Gemini
   */
  private getMockFollowUpAnalysis(response: string): any {
    // Modo mock ultra-simple: NUNCA hacer seguimiento
    // Gemini real debe manejar toda la lógica inteligente
    return {
      shouldAskFollowUp: false,
      followUpQuestion: null,
      reasoning: "Modo simulación - Gemini real debe manejar el análisis",
      interestingPoints: ["Respuesta recibida"]
    }
  }

  /**
   * Genera un comentario natural y empático sobre la respuesta del usuario
   */
  async generateNaturalComment(
    userResponse: string,
    questionContext: string,
    commentType: 'transition' | 'follow-up-intro' = 'transition'
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getMockNaturalComment(userResponse, commentType)
    }

    try {
      const prompt = this.buildNaturalCommentPrompt(userResponse, questionContext, commentType)
      const response = await this.makeRequest(prompt)
      
      return this.extractTextFromResponse(response).trim()
    } catch (error) {
      logger.error('Error generating natural comment:', error)
      return this.getMockNaturalComment(userResponse, commentType)
    }
  }

  /**
   * Construye el prompt para generar comentarios naturales
   */
  private buildNaturalCommentPrompt(
    userResponse: string,
    questionContext: string,
    commentType: string
  ): string {
    const typeInstruction = commentType === 'follow-up-intro' 
      ? 'Genera una introducción natural antes de hacer una pregunta de seguimiento'
      : 'Genera un comentario de transición empático antes de pasar a la siguiente pregunta'

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

Genera SOLO el comentario, sin explicaciones adicionales:`
  }

  /**
   * Genera comentarios naturales simulados para modo sin API
   */
  private getMockNaturalComment(response: string, commentType: string): string {
    const lowerResponse = response.toLowerCase()
    const isJuniorProfile = /\b(recién|egresado|graduado|sin experiencia|junior|estudiante|institución|universidad|pequeños)\b/i.test(lowerResponse)
    
    if (commentType === 'follow-up-intro') {
      if (isJuniorProfile) {
        if (lowerResponse.includes('machine learning')) {
          return "Qué interesante tu experiencia con machine learning"
        } else if (lowerResponse.includes('paginas web') || lowerResponse.includes('web')) {
          return "Valioso tu trabajo en desarrollo web"
        } else if (lowerResponse.includes('qa')) {
          return "Excelente que hayas explorado el área de QA"
        } else {
          return "Me parecen valiosos esos proyectos académicos"
        }
      } else if (lowerResponse.includes('python') && lowerResponse.includes('django')) {
        return "Interesante combinación de Python y Django"
      } else if (lowerResponse.includes('datos') || lowerResponse.includes('análisis')) {
        return "Me llama la atención tu trabajo con datos"
      } else if (lowerResponse.includes('automatización') || lowerResponse.includes('automatizar')) {
        return "Qué valioso tu enfoque en automatización"
      } else {
        return "Me parece interesante lo que comentas"
      }
    } else {
      // Comentarios de transición más específicos y empáticos
      if (isJuniorProfile) {
        if (lowerResponse.includes('machine learning')) {
          return "Impresionante tu experiencia con ML como estudiante"
        } else if (lowerResponse.includes('paginas web') || lowerResponse.includes('web')) {
          return "Excelente base en desarrollo web"
        } else if (lowerResponse.includes('qa')) {
          return "Muy buena experiencia en testing y QA"
        } else if (lowerResponse.includes('proyecto')) {
          return "Valiosos esos proyectos para tu formación"
        } else {
          return "Perfecto, entiendo tu perfil como recién egresado"
        }
      } else if (lowerResponse.includes('python') && lowerResponse.includes('django')) {
        return "Excelente stack con Python y Django"
      } else if (lowerResponse.includes('javascript') && lowerResponse.includes('python')) {
        return "Muy buena combinación de tecnologías"
      } else if (lowerResponse.includes('datos') || lowerResponse.includes('análisis')) {
        return "Me gusta mucho tu enfoque hacia los datos"
      } else if (lowerResponse.includes('automatización') || lowerResponse.includes('automatizar')) {
        return "Valioso tu trabajo en automatización"
      } else if (lowerResponse.includes('empresa') || lowerResponse.includes('proyecto')) {
        return "Interesante tu experiencia profesional"
      } else if (lowerResponse.includes('aprender') || lowerResponse.includes('intermedio')) {
        return "Me gusta tu honestidad y ganas de crecer"
      } else {
        return "Perfecto, entiendo tu experiencia"
      }
    }
  }

  /**
   * Evaluación simulada para modo sin API
   */
  private getMockEvaluation(response: string): any {
    const wordCount = response.split(' ').length
    const baseScore = Math.min(10, Math.max(1, Math.floor(wordCount / 10)))
    
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
    }
  }
}

// Instancia singleton
export const geminiService = new GeminiService()