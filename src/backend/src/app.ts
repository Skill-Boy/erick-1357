import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { join } from 'path';
import swaggerUi from 'swagger-ui-express';
import snailPayRoutes from './routes/snail-pay.routes';
import { errorHandler } from './middlewares/errorHandler';
import { swaggerDocument } from './swagger';

const app: Application = express();
const frontendDirectory = join(__dirname, 'public');

// Middlewares globales
app.use(cors());
app.use(express.json());

// Verificación de estado del servidor
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customSiteTitle: 'SnailPay API' }));

// Rutas de la API
app.use('/api/snailpay', snailPayRoutes);

// La imagen de producción copia el build de Vite en este directorio.
app.use(express.static(frontendDirectory));
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(join(frontendDirectory, 'index.html'));
});

// Manejador global de errores
app.use(errorHandler);

export default app;
