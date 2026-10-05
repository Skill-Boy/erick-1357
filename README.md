# Snail Circuit

Aplicación de carreras de caracoles con React, Express y TypeScript. El perfil, la sesión, el saldo y la última respuesta de pago se almacenan localmente en el navegador para esta simulación.

## Ejecución

### Opción rápida

```bash
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`, el API en `http://localhost:3001` y la documentación Swagger en `http://localhost:3001/api-docs`. Para compilar: `npm run build`. Para ejecutar las pruebas: `npm test`.

Los puertos se configuran en `.env`: `FRONTEND_PORT` controla Vite y `BACKEND_PORT` controla Express y el proxy de desarrollo. Usa `.env.example` como referencia si necesitas recrearlo.

### Ejecución local paso a paso

1. Instala las dependencias desde la raíz del proyecto:

	```bash
	npm install
	```

2. Revisa `.env` y confirma los puertos deseados. Los valores predeterminados son `BACKEND_PORT=3001` y `FRONTEND_PORT=5173`.

3. En una primera terminal, inicia el backend:

	```bash
	npm run dev:backend
	```

4. Comprueba que el backend está disponible en `http://localhost:3001/health` y abre Swagger en `http://localhost:3001/api-docs`.

5. En una segunda terminal, desde la misma raíz, inicia el frontend:

	```bash
	npm run dev:frontend
	```

6. Abre `http://localhost:5173`. Vite redirige las solicitudes `/api` al puerto configurado en `BACKEND_PORT`.

## Docker

La imagen empaqueta React y Express en un único contenedor. Express sirve el frontend y mantiene disponibles el API y Swagger.

```bash
docker build -t snail-circuit .
docker run --rm -p 3001:3001 snail-circuit
```

Abre `http://localhost:3001`. Para configurar otro puerto interno: `docker run --rm -e BACKEND_PORT=8080 -p 8080:8080 snail-circuit`.

## SnailPay

Endpoint: `POST /api/snailpay/charges`.

| Escenario | Tarjeta | Datos restantes | Resultado |
| --- | --- | --- | --- |
| Cobro exitoso | `1234123412341234` | `12/26`, CVV `543`, nombre no vacío y monto mayor que cero | `201`, `approved`, saldo actualizado |
| Saldo insuficiente | `1234123412341234` | Datos de aprobación válidos y monto mayor a `$500.00` | `422`, `rejected`, `insufficient_funds`, saldo sin cambios |
| Transacción rechazada | Cualquier otra tarjeta o dato de aprobación inválido | Cualquier valor | `422`, `rejected`, saldo sin cambios |
| Error del sistema | `0000000000000000` | Cualquier valor | `503`, `error`, saldo sin cambios |

La respuesta incluye los campos definidos por SnailPay, incluido el número de tarjeta y CVV ficticios solicitados. El cliente también tiene un límite de espera de 8 segundos para fallos de red.

## Organización

- `src/backend/src/routes`, `controllers` y `services`: transporte HTTP, control de respuestas y lógica de SnailPay por separado.
- `src/frontend/src/services`: acceso a LocalStorage y API; `hooks`: estado de autenticación; `types`: contratos tipados.
- Las pruebas verifican aprobación, rechazo y error del sistema en el servicio de pagos.
