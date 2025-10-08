import { Router } from 'express'

const router: Router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Questions endpoint - TODO' })
})

export { router as questionRoutes }