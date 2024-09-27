import { Router } from 'express'

const router = Router()

router.post('/api/users/signout', (req, res) => {
  req.session = null
  res.status(200).send({})
})

export { router as signoutRouter }
