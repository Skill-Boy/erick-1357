import './config/environment'
import app from './app'

const PORT = Number(process.env.BACKEND_PORT) || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`)
  console.log(`📋 SnailPay: POST http://localhost:${PORT}/api/docs`)
})