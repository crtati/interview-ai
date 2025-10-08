import { Router, Request, Response } from 'express'
import { geminiService } from '../services/gemini'

const router: Router = Router()

// Enum para las fases de la entrevista
enum InterviewPhase {
  WELCOME = 'WELCOME',
  EXPLANATION = 'EXPLANATION',
  QUESTIONS = 'QUESTIONS',
  FAREWELL = 'FAREWELL',
  COMPLETED = 'COMPLETED'
}

// Tipo para los mensajes de fase
type PhaseMessage = {
  message: string
  duration: number
}

// Mensajes predefinidos para cada fase (solo fases con mensajes)
const INTERVIEW_MESSAGES: Record<InterviewPhase.WELCOME | InterviewPhase.EXPLANATION | InterviewPhase.FAREWELL, PhaseMessage> = {
  [InterviewPhase.WELCOME]: {
    message: "¡Hola! Soy tu entrevistadora virtual. Me da mucho gusto conocerte y estoy muy emocionada de realizar esta entrevista contigo. Espero que te sientas cómodo y confiado durante nuestra conversación.",
    duration: 8000
  },
  [InterviewPhase.EXPLANATION]: {
    message: "Te explico cómo funcionará nuestra entrevista: Tendremos una conversación de aproximadamente 15-20 minutos donde te haré 5 preguntas cuidadosamente seleccionadas. Tómate tu tiempo para responder, no hay prisa. Al final, recibirás una evaluación detallada con retroalimentación constructiva para ayudarte a mejorar. Comenzamos en unos momentos.",
    duration: 12000
  },
  [InterviewPhase.FAREWELL]: {
    message: "¡Excelente trabajo! Has completado exitosamente la entrevista. Me impresionaron mucho tus respuestas y la forma en que te expresaste. Ahora procesaré toda la información para generar tu evaluación personalizada. En unos momentos podrás ver un análisis detallado de tu desempeño, incluyendo tus fortalezas y áreas de oportunidad. ¡Muchas gracias por tu tiempo y esfuerzo!",
    duration: 18000
  }
}

// Obtener mensaje para una fase específica
router.get('/phase/:phase', (req: Request, res: Response) => {
  const { phase } = req.params
  
  if (!Object.values(InterviewPhase).includes(phase as InterviewPhase)) {
    return res.status(400).json({ 
      error: 'Fase de entrevista no válida',
      validPhases: Object.values(InterviewPhase)
    })
  }
  
  // Verificar si la fase tiene mensaje definido
  const validPhases = [InterviewPhase.WELCOME, InterviewPhase.EXPLANATION, InterviewPhase.FAREWELL]
  const currentPhase = phase as InterviewPhase
  
  if (!validPhases.includes(currentPhase)) {
    return res.status(404).json({ error: 'Esta fase no tiene mensaje predefinido' })
  }
  
  const phaseData = INTERVIEW_MESSAGES[currentPhase as keyof typeof INTERVIEW_MESSAGES]
  
  res.json({
    phase,
    ...phaseData,
    timestamp: new Date().toISOString()
  })
})

// Iniciar una nueva entrevista
router.post('/start', (req: Request, res: Response) => {
  // Aquí en el futuro se conectará con la base de datos
  res.json({
    interviewId: `interview_${Date.now()}`,
    phase: InterviewPhase.WELCOME,
    message: INTERVIEW_MESSAGES[InterviewPhase.WELCOME],
    questions: [
      {
        id: '1',
        question: 'Cuéntame sobre ti y tu experiencia profesional más relevante.',
        category: 'PRESENTATION',
        expectedDuration: 180
      },
      {
        id: '2', 
        question: '¿Cuáles consideras que son tus principales fortalezas técnicas?',
        category: 'TECHNICAL_SKILLS',
        expectedDuration: 150
      },
      {
        id: '3',
        question: '¿Por qué te interesa trabajar en esta posición?',
        category: 'MOTIVATION',
        expectedDuration: 120
      },
      {
        id: '4',
        question: 'Describe un proyecto desafiante en el que hayas trabajado recientemente.',
        category: 'EXPERIENCE',
        expectedDuration: 200
      },
      {
        id: '5',
        question: '¿Dónde te ves profesionalmente en los próximos 5 años?',
        category: 'CAREER_GOALS',
        expectedDuration: 120
      }
    ],
    totalEstimatedDuration: 970, // segundos
    createdAt: new Date().toISOString()
  })
})

// Avanzar a la siguiente fase
router.post('/:interviewId/next-phase', (req: Request, res: Response) => {
  const { interviewId } = req.params
  const { currentPhase } = req.body
  
  const phases = Object.values(InterviewPhase)
  const currentIndex = phases.indexOf(currentPhase)
  
  if (currentIndex === -1) {
    return res.status(400).json({ error: 'Fase actual no válida' })
  }
  
  const nextIndex = currentIndex + 1
  if (nextIndex >= phases.length) {
    return res.json({
      interviewId,
      phase: InterviewPhase.COMPLETED,
      completed: true,
      message: 'Entrevista completada exitosamente'
    })
  }
  
  const nextPhase = phases[nextIndex]
  
  // Solo devolver mensaje si la fase lo tiene
  const validPhases = [InterviewPhase.WELCOME, InterviewPhase.EXPLANATION, InterviewPhase.FAREWELL]
  let phaseData = null
  
  if (validPhases.includes(nextPhase)) {
    phaseData = INTERVIEW_MESSAGES[nextPhase as keyof typeof INTERVIEW_MESSAGES]
  }
  
  res.json({
    interviewId,
    phase: nextPhase,
    ...(phaseData || {}),
    timestamp: new Date().toISOString()
  })
})

// Generar comentario natural sobre la respuesta del usuario
router.post('/:interviewId/generate-comment', async (req: Request, res: Response) => {
  const { interviewId } = req.params
  const { 
    userResponse,
    questionContext,
    commentType = 'transition'
  } = req.body

  try {
    const comment = await geminiService.generateNaturalComment(
      userResponse,
      questionContext,
      commentType
    )

    res.json({
      interviewId,
      comment,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating natural comment:', error)
    res.status(500).json({
      error: 'Error generando comentario',
      comment: 'Perfecto, entiendo tu experiencia.'
    })
  }
})

// Analizar respuesta y decidir si hacer pregunta de seguimiento
router.post('/:interviewId/analyze-response', async (req: Request, res: Response) => {
  const { interviewId } = req.params
  const { 
    originalQuestion, 
    userResponse, 
    currentQuestionIndex, 
    totalQuestions,
    previousResponses,
    role = 'desarrollador'
  } = req.body

  console.log('🧠 [ANALYZE-RESPONSE] Recibido:', {
    interviewId,
    originalQuestion: originalQuestion?.substring(0, 50) + '...',
    userResponse: `"${userResponse}"`,
    currentQuestionIndex,
    totalQuestions
  })

  try {
    const analysis = await geminiService.analyzeResponseForFollowUp(
      originalQuestion,
      userResponse,
      {
        role,
        currentQuestionIndex,
        totalQuestions,
        previousResponses: previousResponses || []
      }
    )

    console.log('✅ [ANALYZE-RESPONSE] Resultado:', {
      shouldAskFollowUp: analysis.shouldAskFollowUp,
      reasoning: analysis.reasoning,
      followUpQuestion: analysis.followUpQuestion?.substring(0, 60) + '...'
    })

    res.json({
      interviewId,
      ...analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing response:', error)
    res.status(500).json({
      error: 'Error analizando respuesta',
      shouldAskFollowUp: false,
      reasoning: 'Error en el análisis, continuando con la siguiente pregunta'
    })
  }
})

// Finalizar entrevista
router.post('/:interviewId/complete', (req: Request, res: Response) => {
  const { interviewId } = req.params
  const { responses } = req.body
  
  // Aquí se guardarían las respuestas en la base de datos
  res.json({
    interviewId,
    phase: InterviewPhase.COMPLETED,
    completed: true,
    message: 'Entrevista finalizada. Generando evaluación...',
    responsesReceived: responses?.length || 0,
    evaluationUrl: `/evaluation/${interviewId}`,
    timestamp: new Date().toISOString()
  })
})

// Placeholder para rutas adicionales
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Interview API',
    endpoints: [
      'GET /phase/:phase - Obtener mensaje de fase',
      'POST /start - Iniciar entrevista',
      'POST /:id/next-phase - Siguiente fase',
      'POST /:id/complete - Completar entrevista'
    ]
  })
})

export { router as interviewRoutes }