import { Router } from 'express'
import { snailPayController } from '../controllers/snail-pay.controller'

const router = Router()

router.post('/charges', (req, res, next) => snailPayController.charge(req, res, next))

export default router