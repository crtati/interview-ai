import { Router } from 'express'

const router: Router = Router()

// Placeholder para rutas de usuario
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - TODO' })
})

export { router as userRoutes }