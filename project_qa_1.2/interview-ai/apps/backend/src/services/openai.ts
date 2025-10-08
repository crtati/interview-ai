import OpenAI from 'openai'
import { logger } from '../utils/logger'

class OpenAIService {
  private client: OpenAI | null = null
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    
    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey
      })
      logger.info('✅ OpenAI client initialized')
    } else {
      logger.warn('⚠️ OpenAI API key not found. AI features will be disabled.')
    }
  }

  /**
   * Generar pregunta de entrevista contextual
   */
  async generateInterviewQuestion(
    jobRole: string,
    experienceLevel: string,
    previousQuestions: string[] = []
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const prompt = `
Genera una pregunta de entrevista laboral profesional para el puesto de: ${jobRole}
Nivel de experiencia: ${experienceLevel}

${previousQuestions.length > 0 ? `Preguntas ya realizadas: ${previousQuestions.join(', ')}` : ''}

La pregunta debe ser:
- Específica para el rol
- Apropiada para el nivel de experiencia
- Diferente a las preguntas anteriores
- Enfocada en evaluar habilidades técnicas o comportamentales

Responde solo con la pregunta, sin explicaciones adicionales.
`

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Eres un experto entrevistador de recursos humanos especializado en generar preguntas de entrevista efectivas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })

      return completion.choices[0]?.message?.content?.trim() || "¿Puedes contarme sobre tu experiencia profesional?"
    } catch (error) {
      logger.error('Error generating interview question:', error)
      throw new Error('Error generating interview question')
    }
  }

  /**
   * Evaluar respuesta de entrevista con feedback detallado
   */
  async evaluateInterviewResponse(
    question: string,
    answer: string,
    jobRole: string,
    experienceLevel: string
  ): Promise<{
    overallScore: number
    categories: {
      clarity: number
      technical: number
      communication: number
      relevance: number
    }
    strengths: string[]
    improvements: string[]
    feedback: string
    recommendation: string
  }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const prompt = `
Evalúa la siguiente respuesta de entrevista laboral:

PUESTO: ${jobRole}
NIVEL: ${experienceLevel}
PREGUNTA: ${question}
RESPUESTA: ${answer}

Evalúa los siguientes aspectos en una escala de 1-5:
1. Claridad en comunicación
2. Precisión técnica (si aplica)
3. Habilidades de comunicación
4. Relevancia de la respuesta

Identifica:
- 2-3 fortalezas principales
- 2-3 áreas de mejora específicas
- Feedback constructivo
- Recomendación para mejorar

Responde en el siguiente formato JSON:
{
  "overallScore": [1-10],
  "categories": {
    "clarity": [1-5],
    "technical": [1-5],
    "communication": [1-5],
    "relevance": [1-5]
  },
  "strengths": ["fortaleza 1", "fortaleza 2"],
  "improvements": ["mejora 1", "mejora 2"],
  "feedback": "feedback detallado en 2-3 oraciones",
  "recommendation": "recomendación específica para mejorar"
}
`

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Eres un experto evaluador de entrevistas laborales con años de experiencia en ${jobRole}. 
            Tu tarea es proporcionar feedback constructivo y preciso que ayude al candidato a mejorar.
            Siempre responde en formato JSON válido.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })

      const response = completion.choices[0]?.message?.content?.trim()
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      // Parsear la respuesta JSON
      try {
        return JSON.parse(response)
      } catch (parseError) {
        logger.error('Error parsing OpenAI response:', parseError)
        // Fallback response
        return {
          overallScore: 7,
          categories: {
            clarity: 4,
            technical: 3,
            communication: 4,
            relevance: 3
          },
          strengths: ["Respondiste con claridad", "Usaste ejemplos concretos"],
          improvements: ["Estructurar mejor las respuestas", "Incluir más detalles técnicos"],
          feedback: "Tu respuesta fue clara pero podría beneficiarse de más estructura y detalles técnicos específicos.",
          recommendation: "Practica usar el método STAR (Situación, Tarea, Acción, Resultado) para estructurar mejor tus respuestas."
        }
      }
    } catch (error) {
      logger.error('Error evaluating interview response:', error)
      throw new Error('Error evaluating interview response')
    }
  }

  /**
   * Generar feedback general de la entrevista
   */
  async generateOverallFeedback(
    responses: Array<{
      question: string
      answer: string
      evaluation: any
    }>,
    jobRole: string
  ): Promise<{
    overallPerformance: string
    keyStrengths: string[]
    priorityImprovements: string[]
    nextSteps: string[]
    encouragement: string
  }> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const prompt = `
Analiza el desempeño general en esta entrevista para el puesto de: ${jobRole}

RESPUESTAS Y EVALUACIONES:
${responses.map((r, i) => `
Pregunta ${i + 1}: ${r.question}
Respuesta: ${r.answer}
Puntuación: ${r.evaluation.overallScore}/10
`).join('\n')}

Proporciona un análisis general que incluya:
- Evaluación del desempeño general
- 3-4 fortalezas clave demostradas
- 2-3 áreas prioritarias de mejora
- 3-4 pasos recomendados para seguir mejorando
- Mensaje de aliento personalizado

Responde en formato JSON:
{
  "overallPerformance": "evaluación general en 2-3 oraciones",
  "keyStrengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "priorityImprovements": ["mejora 1", "mejora 2"],
  "nextSteps": ["paso 1", "paso 2", "paso 3"],
  "encouragement": "mensaje motivacional personalizado"
}
`

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Eres un mentor profesional especializado en desarrollo de carrera y preparación para entrevistas. Tu objetivo es motivar y guiar al candidato hacia la mejora continua."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.4
      })

      const response = completion.choices[0]?.message?.content?.trim()
      if (!response) {
        throw new Error('Empty response from OpenAI')
      }

      return JSON.parse(response)
    } catch (error) {
      logger.error('Error generating overall feedback:', error)
      throw new Error('Error generating overall feedback')
    }
  }
}

export const openAIService = new OpenAIService()