import { Router } from 'express'
import { openAIService } from '../services/openai'
import { geminiService } from '../services/gemini'
import { authenticate } from '../middlewares/auth'
import { logger } from '../utils/logger'

const router: Router = Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate)

/**
 * Selecciona el servicio de AI disponible
 * Prioridad: OpenAI -> Gemini -> Modo simulación
 */
const selectAIService = () => {
  // Si hay API key de OpenAI, usar OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      service: openAIService,
      name: 'OpenAI GPT-4'
    }
  }
  
  // Si hay API key de Gemini, usar Gemini
  if (process.env.GEMINI_API_KEY) {
    return {
      service: geminiService,
      name: 'Google Gemini'
    }
  }
  
  // Modo simulación con Gemini (sin API key)
  return {
    service: geminiService,
    name: 'Simulación (modo demo)'
  }
}

/**
 * POST /api/ai/generate-question
 * Generar pregunta de entrevista
 */
router.post('/generate-question', async (req, res) => {
  try {
    const { jobRole, experienceLevel, previousQuestions } = req.body

    if (!jobRole || !experienceLevel) {
      return res.status(400).json({
        error: 'jobRole and experienceLevel are required'
      })
    }

    const { service, name } = selectAIService()
    logger.info(`Using AI service: ${name}`)
    
    // Generar pregunta usando el servicio seleccionado
    let question: string
    if (service === geminiService) {
      question = await geminiService.generateInterviewQuestion(
        jobRole,
        experienceLevel as 'junior' | 'mid' | 'senior',
        'technical'
      )
    } else {
      question = await openAIService.generateInterviewQuestion(
        jobRole,
        experienceLevel,
        previousQuestions || []
      )
    }

    res.json({
      success: true,
      data: {
        question,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Error in generate-question:', error)
    res.status(500).json({
      error: 'Failed to generate question',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/ai/evaluate-response
 * Evaluar respuesta de entrevista
 */
router.post('/evaluate-response', async (req, res) => {
  try {
    const { question, answer, jobRole, experienceLevel } = req.body

    if (!question || !answer || !jobRole || !experienceLevel) {
      return res.status(400).json({
        error: 'question, answer, jobRole, and experienceLevel are required'
      })
    }

    const { service } = selectAIService()
    
    // Evaluar usando el servicio seleccionado
    let evaluation
    if (service === geminiService) {
      evaluation = await geminiService.evaluateInterviewResponse(
        question,
        answer,
        jobRole
      )
    } else {
      evaluation = await openAIService.evaluateInterviewResponse(
        question,
        answer,
        jobRole,
        experienceLevel
      )
    }

    res.json({
      success: true,
      data: {
        evaluation,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Error in evaluate-response:', error)
    res.status(500).json({
      error: 'Failed to evaluate response',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

/**
 * POST /api/ai/simulate-interview
 * Iniciar simulación de entrevista completa
 */
router.post('/simulate-interview', async (req, res) => {
  try {
    const { jobRole, experienceLevel, duration, questionCount } = req.body

    if (!jobRole || !experienceLevel) {
      return res.status(400).json({
        error: 'jobRole and experienceLevel are required'
      })
    }

    // Generar múltiples preguntas para la simulación
    const questions = []
    const count = questionCount || 5

    for (let i = 0; i < count; i++) {
      const { service } = selectAIService()
      
      // Generar pregunta usando el servicio seleccionado
      let question: string
      if (service === geminiService) {
        question = await geminiService.generateInterviewQuestion(
          jobRole,
          experienceLevel as 'junior' | 'mid' | 'senior',
          'technical'
        )
      } else {
        const previousQuestions: string[] = questions.map(q => q.question)
        question = await openAIService.generateInterviewQuestion(
          jobRole,
          experienceLevel,
          previousQuestions
        )
      }
      
      questions.push({
        id: `q_${i + 1}`,
        question,
        order: i + 1
      })
    }

    res.json({
      success: true,
      data: {
        interviewId: `interview_${Date.now()}`,
        jobRole,
        experienceLevel,
        duration: duration || 30, // minutos
        questions,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Error in simulate-interview:', error)
    res.status(500).json({
      error: 'Failed to create interview simulation',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Mantener endpoints existentes
router.post('/feedback/:interviewId', (req, res) => {
  res.json({ message: 'AI feedback endpoint - TODO' })
})

router.post('/transcribe', (req, res) => {
  res.json({ message: 'AI transcription endpoint - TODO' })
})

/**
 * GET /api/ai/health
 * Verificar estado del servicio de AI
 */
router.get('/health', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY
  
  res.json({
    success: true,
    data: {
      status: 'operational',
      openai_configured: hasApiKey,
      features: {
        question_generation: hasApiKey,
        response_evaluation: hasApiKey,
        overall_feedback: hasApiKey
      },
      timestamp: new Date().toISOString()
    }
  })
})

export { router as aiRoutes }