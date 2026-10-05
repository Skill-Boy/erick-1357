import express, { Application, Request, Response } from 'express'
import { join } from 'path'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import snailPayRoutes from './routes/snail-pay.routes'
import { errorHandler } from './middlewares/errorHandler'
import { swaggerDocument } from './swagger'

const app: Application = express()
const frontendDirectory = join(__dirname, 'public')

app.use(cors())
app.use(express.json())
app.get('/alive', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.json(swaggerDocument)
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'SnailPay API' }))
app.use('/api/snailpay', snailPayRoutes)
app.use(errorHandler)
app.use(express.static(frontendDirectory))
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(join(frontendDirectory, 'index.html'))
})

export default app