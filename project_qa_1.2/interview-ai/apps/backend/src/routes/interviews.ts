import { Router, Request, Response } from 'express'
import { geminiService } from '../services/gemini'

const router: Router = Router()

// Enum para las fases de la entrevista
enum InterviewPhase {
  WELCOME = 'WELCOME',
  EXPLANATION = 'EXPLANATION',
  QUESTIONS = 'QUESTIONS',
  CANDIDATE_QUESTIONS = 'CANDIDATE_QUESTIONS',
  FAREWELL = 'FAREWELL',
  COMPLETED = 'COMPLETED'
}

// Store de conversaciones en memoria (en producción usar DB)
const conversationStore = new Map<string, Array<{ role: 'assistant' | 'user', content: string }>>()
const interviewStateStore = new Map<string, {
  questionCount: number
  phase: InterviewPhase
  candidateQuestionCount: number
}>()

// Iniciar una nueva entrevista - ZAVI SE PRESENTA
router.post('/start', async (req: Request, res: Response) => {
  try {
    const interviewId = `interview_${Date.now()}`

    // Zavi genera bienvenida
    const welcomeMessage = await geminiService.generateWelcomeMessage()

    // Inicializar conversación
    conversationStore.set(interviewId, [{
      role: 'assistant',
      content: welcomeMessage
    }])

    // Inicializar estado
    interviewStateStore.set(interviewId, {
      questionCount: 0,
      phase: InterviewPhase.WELCOME,
      candidateQuestionCount: 0
    })

    res.json({
      interviewId,
      phase: InterviewPhase.WELCOME,
      message: welcomeMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error starting interview:', error)
    res.status(500).json({ error: 'Error iniciando entrevista' })
  }
})

// ZAVI EXPLICA LA ENTREVISTA
router.post('/:interviewId/explanation', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const conversation = conversationStore.get(interviewId) || []

    const explanationMessage = await geminiService.generateInterviewExplanation()

    conversation.push({
      role: 'assistant',
      content: explanationMessage
    })

    conversationStore.set(interviewId, conversation)

    const state = interviewStateStore.get(interviewId)
    if (state) {
      state.phase = InterviewPhase.EXPLANATION
      interviewStateStore.set(interviewId, state)
    }

    res.json({
      interviewId,
      phase: InterviewPhase.EXPLANATION,
      message: explanationMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating explanation:', error)
    res.status(500).json({ error: 'Error generando explicación' })
  }
})

// ZAVI HACE LA PRIMERA PREGUNTA
router.post('/:interviewId/first-question', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const conversation = conversationStore.get(interviewId) || []

    const firstQuestion = await geminiService.generateFirstQuestion()

    conversation.push({
      role: 'assistant',
      content: firstQuestion
    })

    conversationStore.set(interviewId, conversation)

    const state = interviewStateStore.get(interviewId)
    if (state) {
      state.phase = InterviewPhase.QUESTIONS
      state.questionCount = 1
      interviewStateStore.set(interviewId, state)
    }

    res.json({
      interviewId,
      phase: InterviewPhase.QUESTIONS,
      question: firstQuestion,
      questionNumber: 1,
      totalQuestions: 5,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating first question:', error)
    res.status(500).json({ error: 'Error generando primera pregunta' })
  }
})

// ZAVI ANALIZA RESPUESTA Y RESPONDE (comentario + siguiente acción)
router.post('/:interviewId/analyze-and-respond', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const { userResponse } = req.body

    const conversation = conversationStore.get(interviewId) || []
    const state = interviewStateStore.get(interviewId)

    if (!state) {
      return res.status(404).json({ error: 'Entrevista no encontrada' })
    }

    // Agregar respuesta del usuario
    conversation.push({
      role: 'user',
      content: userResponse
    })

    // Obtener la última pregunta que hizo Zavi
    const lastAssistantMessage = [...conversation].reverse().find(msg => msg.role === 'assistant')
    const currentQuestion = lastAssistantMessage?.content || ''

    // 🚨 CALCULAR EL NÚMERO REAL DE PREGUNTA **ANTES** DE LLAMAR A GEMINI
    // Contar cuántas PREGUNTAS (no comentarios) ha hecho Zavi hasta ahora
    let questionCount = 0
    let isPreviousMessageUser = true // La primera pregunta no tiene mensaje previo del usuario

    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i]
      if (msg.role === 'assistant') {
        // Es una pregunta si:
        // 1. Es el primer mensaje (pregunta inicial)
        // 2. El mensaje anterior es del usuario (nueva pregunta después de respuesta)
        if (i === 0 || isPreviousMessageUser) {
          questionCount++
        }
        isPreviousMessageUser = false
      } else {
        isPreviousMessageUser = true
      }
    }

    console.log(`📊 Usuario respondiendo pregunta ${questionCount}/5`)

    // 🚨 VALIDACIÓN CRÍTICA: Si ya respondió 5 preguntas, NO llamar a Gemini para generar más
    const isLastQuestion = questionCount === 5

    if (isLastQuestion) {
      console.log('🚨 USUARIO RESPONDIENDO PREGUNTA 5 (última) - Gemini NO debe generar más preguntas')
    }

    // Zavi analiza y responde - pasamos el número correcto
    const response = await geminiService.analyzeAndRespond({
      userResponse,
      currentQuestion,
      questionNumber: questionCount, // ✅ Número CORRECTO (1-5)
      totalQuestions: 5,
      conversationHistory: conversation
    })

    // Agregar comentario de Zavi
    conversation.push({
      role: 'assistant',
      content: response.comment
    })

    // 🚨 BLOQUEO FORZADO: Si ya completamos 5 preguntas, ELIMINAR nextQuestion
    let nextQuestion = response.shouldAskFollowUp
      ? response.followUpQuestion
      : response.nextQuestion

    if (questionCount === 5 && nextQuestion) {
      console.log('🚨 BLOQUEANDO pregunta 6 - Usuario ya completó las 5 preguntas')
      console.log('❌ Pregunta bloqueada:', nextQuestion.substring(0, 100))
      nextQuestion = undefined
      response.nextQuestion = undefined
      response.shouldContinueToNext = true
    }

    // Actualizar estado con el conteo correcto
    state.questionCount = questionCount

    // Agregar la pregunta (seguimiento o siguiente) SOLO si no fue bloqueada
    if (nextQuestion) {
      conversation.push({
        role: 'assistant',
        content: nextQuestion
      })
    }

    conversationStore.set(interviewId, conversation)
    interviewStateStore.set(interviewId, state)

    // ⚠️ CRÍTICO: Transicionar cuando:
    // 1. Ya estamos en pregunta 5
    // 2. NO hay nextQuestion (fue bloqueada)
    // 3. shouldContinueToNext es true
    const shouldTransitionToCandidateQuestions =
      questionCount === 5 &&
      !nextQuestion &&
      response.shouldContinueToNext

    console.log('📊 Estado actual:', {
      questionCount: questionCount,
      shouldTransition: shouldTransitionToCandidateQuestions,
      hasNextQuestion: !!nextQuestion,
      shouldContinueToNext: response.shouldContinueToNext,
      nextQuestion: nextQuestion?.substring(0, 50) + '...'
    })

    res.json({
      interviewId,
      comment: response.comment,
      shouldAskFollowUp: response.shouldAskFollowUp,
      followUpQuestion: response.followUpQuestion,
      shouldContinueToNext: response.shouldContinueToNext,
      nextQuestion: nextQuestion, // ✅ Usar variable local (undefined si fue bloqueada)
      reasoning: response.reasoning,
      questionNumber: questionCount, // ✅ Número correcto de pregunta (1-5)
      totalQuestions: 5,
      shouldTransitionToCandidateQuestions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing and responding:', error)
    res.status(500).json({ error: 'Error analizando respuesta' })
  }
})

// TRANSICIÓN A FASE DE PREGUNTAS DEL CANDIDATO
router.post('/:interviewId/transition-to-candidate-questions', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const conversation = conversationStore.get(interviewId) || []
    const state = interviewStateStore.get(interviewId)

    if (!state) {
      return res.status(404).json({ error: 'Entrevista no encontrada' })
    }

    const transitionMessage = await geminiService.generateTransitionToQuestionsPhase({
      conversationHistory: conversation
    })

    conversation.push({
      role: 'assistant',
      content: transitionMessage
    })

    state.phase = InterviewPhase.CANDIDATE_QUESTIONS

    conversationStore.set(interviewId, conversation)
    interviewStateStore.set(interviewId, state)

    res.json({
      interviewId,
      phase: InterviewPhase.CANDIDATE_QUESTIONS,
      message: transitionMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating transition:', error)
    res.status(500).json({ error: 'Error generando transición' })
  }
})

// ZAVI RESPONDE PREGUNTAS DEL CANDIDATO
router.post('/:interviewId/answer-candidate-question', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const { question } = req.body

    const conversation = conversationStore.get(interviewId) || []
    const state = interviewStateStore.get(interviewId)

    if (!state) {
      return res.status(404).json({ error: 'Entrevista no encontrada' })
    }

    // Agregar pregunta del candidato
    conversation.push({
      role: 'user',
      content: question
    })

    // Zavi responde
    const answer = await geminiService.answerCandidateQuestion(question, {
      conversationHistory: conversation
    })

    conversation.push({
      role: 'assistant',
      content: answer
    })

    state.candidateQuestionCount++

    conversationStore.set(interviewId, conversation)
    interviewStateStore.set(interviewId, state)

    res.json({
      interviewId,
      answer,
      questionCount: state.candidateQuestionCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error answering candidate question:', error)
    res.status(500).json({ error: 'Error respondiendo pregunta' })
  }
})

// ZAVI SE DESPIDE
router.post('/:interviewId/farewell', async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params
    const conversation = conversationStore.get(interviewId) || []
    const state = interviewStateStore.get(interviewId)

    if (!state) {
      return res.status(404).json({ error: 'Entrevista no encontrada' })
    }

    const farewellMessage = await geminiService.generateFarewellMessage({
      conversationHistory: conversation
    })

    conversation.push({
      role: 'assistant',
      content: farewellMessage
    })

    state.phase = InterviewPhase.FAREWELL

    conversationStore.set(interviewId, conversation)
    interviewStateStore.set(interviewId, state)

    res.json({
      interviewId,
      phase: InterviewPhase.FAREWELL,
      message: farewellMessage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating farewell:', error)
    res.status(500).json({ error: 'Error generando despedida' })
  }
})

// FINALIZAR ENTREVISTA
router.post('/:interviewId/complete', (req: Request, res: Response) => {
  const { interviewId } = req.params
  const conversation = conversationStore.get(interviewId)
  const state = interviewStateStore.get(interviewId)

  if (!state) {
    return res.status(404).json({ error: 'Entrevista no encontrada' })
  }

  state.phase = InterviewPhase.COMPLETED
  interviewStateStore.set(interviewId, state)

  res.json({
    interviewId,
    phase: InterviewPhase.COMPLETED,
    completed: true,
    message: 'Entrevista finalizada. Generando evaluación...',
    conversationLength: conversation?.length || 0,
    evaluationUrl: `/evaluation/${interviewId}`,
    timestamp: new Date().toISOString()
  })
})

// OBTENER HISTORIAL DE CONVERSACIÓN
router.get('/:interviewId/conversation', (req: Request, res: Response) => {
  const { interviewId } = req.params
  const conversation = conversationStore.get(interviewId)
  const state = interviewStateStore.get(interviewId)

  if (!conversation || !state) {
    return res.status(404).json({ error: 'Entrevista no encontrada' })
  }

  res.json({
    interviewId,
    conversation,
    state,
    timestamp: new Date().toISOString()
  })
})

// API Info
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Interview API - Zavi AI Interviewer',
    description: 'Entrevistas completamente manejadas por IA (Gemini)',
    endpoints: [
      'POST /start - Iniciar entrevista (Zavi se presenta)',
      'POST /:id/explanation - Zavi explica la entrevista',
      'POST /:id/first-question - Zavi hace primera pregunta',
      'POST /:id/analyze-and-respond - Zavi analiza respuesta y continúa',
      'POST /:id/transition-to-candidate-questions - Cambio a preguntas del candidato',
      'POST /:id/answer-candidate-question - Zavi responde pregunta',
      'POST /:id/farewell - Zavi se despide',
      'POST /:id/complete - Completar entrevista',
      'GET /:id/conversation - Obtener historial'
    ]
  })
})

export { router as interviewRoutes }