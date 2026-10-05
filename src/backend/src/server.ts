import dotenv from 'dotenv';
import { resolve } from 'path';
import app from './app';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const PORT = Number(process.env.BACKEND_PORT) || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
  console.log(`📋 SnailPay: POST http://localhost:${PORT}/api/snailpay/charges`);
});
