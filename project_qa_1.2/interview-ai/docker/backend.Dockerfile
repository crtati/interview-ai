# Backend Dockerfile
FROM node:18-alpine as base

# Instalar pnpm y dependencias del sistema
RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de configuración
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build stage
FROM base as build
WORKDIR /app/apps/backend

# Generar Prisma client
RUN pnpm prisma generate

# Build de la aplicación TypeScript
RUN pnpm build

# Production stage
FROM node:18-alpine as production

# Instalar pnpm
RUN npm install -g pnpm

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copiar archivos de configuración
COPY --chown=nodejs:nodejs pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY --chown=nodejs:nodejs packages/shared/package.json ./packages/shared/
COPY --chown=nodejs:nodejs apps/backend/package.json ./apps/backend/

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar código compilado y archivos necesarios
COPY --from=build --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=build --chown=nodejs:nodejs /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build --chown=nodejs:nodejs /app/packages/shared ./packages/shared

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown nodejs:nodejs /app/uploads

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "apps/backend/dist/index.js"]