# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY src/backend/package.json src/backend/package.json
COPY src/frontend/package.json src/frontend/package.json
RUN npm ci

COPY src ./src
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV BACKEND_PORT=3000

COPY package.json package-lock.json ./
COPY src/backend/package.json src/backend/package.json
COPY src/frontend/package.json src/frontend/package.json
RUN npm ci --omit=dev --workspace=backend

COPY --from=build /app/src/backend/dist ./src/backend/dist
COPY --from=build /app/src/frontend/dist ./src/backend/dist/public

EXPOSE 3000
CMD ["node", "src/backend/dist/server.js"]