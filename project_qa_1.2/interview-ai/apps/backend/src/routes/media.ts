import { Router } from 'express'

const router: Router = Router()

router.post('/avatar', (req, res) => {
  res.json({ message: 'Media avatar endpoint - TODO' })
})

export { router as mediaRoutes }