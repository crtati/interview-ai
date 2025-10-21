import { Router } from 'express'

const router: Router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Notifications endpoint - TODO' })
})

export { router as notificationRoutes }