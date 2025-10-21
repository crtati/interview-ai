# Frontend Dockerfile
FROM node:18-alpine as base

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración de pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build stage
FROM base as build
WORKDIR /app/apps/frontend

# Build de la aplicación
RUN pnpm build

# Production stage
FROM nginx:alpine as production

# Copiar archivos build
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]