# 🎤 InterviewAI

**Aplicación web para simulación de entrevistas con inteligencia artificial, feedback automático y avatar interactivo.**

## 🚀 Características Principales

- **Simulación de Entrevistas**: Entrevistas técnicas, comportamentales y mixtas
- **Feedback Automático**: Análisis detallado con IA (OpenAI/Gemini)
- **Avatar con Voz**: Entrevistador virtual con Text-to-Speech
- **Speech-to-Text**: Transcripción automática de respuestas
- **Dashboard de Progreso**: Métricas y evolución del usuario
- **Autenticación Segura**: JWT con refresh tokens
- **Responsive Design**: Optimizado para todos los dispositivos

## 🏗️ Arquitectura

**Monorepo** con workspaces usando **pnpm**:

```
interview-ai/
├── apps/
│   ├── frontend/          # React + TypeScript + Vite
│   └── backend/           # Node.js + Express + TypeScript
├── packages/
│   └── shared/            # Tipos y utilidades compartidas
└── docker/                # Configuraciones Docker
```

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Radix UI
- Zustand (estado global)
- Axios (HTTP client)

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- Redis (cache/sesiones)
- Winston (logging)

**Integraciones AI:**
- OpenAI GPT-4 (feedback)
- Google Speech-to-Text
- Azure Text-to-Speech
- D-ID (avatar)

**DevOps:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- ESLint + Prettier + Husky

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (opcional, se puede usar Docker)

### 1. Clonar y configurar

```bash
git clone <repository-url>
cd interview-ai

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves API
```

### 2. Base de datos (opción Docker)

```bash
# Levantar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# O usar PostgreSQL local y actualizar DATABASE_URL en .env
```

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
pnpm db:generate

# Ejecutar migraciones
pnpm db:migrate

# (Opcional) Seed de datos iniciales
pnpm --filter=backend db:seed
```

### 4. Iniciar desarrollo

```bash
# Iniciar frontend y backend en paralelo
pnpm dev

# O individualmente:
pnpm --filter=frontend dev  # http://localhost:5173
pnpm --filter=backend dev   # http://localhost:3001
```

### 5. Verificar instalación

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health
- Adminer (BD): http://localhost:8080

## 🐳 Docker (Producción)

```bash
# Build y ejecutar todo el stack
docker-compose up --build

# Solo servicios de desarrollo
docker-compose -f docker-compose.dev.yml up
```

## 📚 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                    # Iniciar frontend + backend
pnpm build                  # Build de producción
pnpm test                   # Ejecutar tests
pnpm lint                   # Linting
pnpm lint:fix              # Fix automático de linting

# Base de datos
pnpm db:migrate            # Ejecutar migraciones
pnpm db:generate           # Generar cliente Prisma
pnpm db:studio             # Prisma Studio (GUI)

# Docker
pnpm docker:dev            # Docker desarrollo
pnpm docker:prod           # Docker producción
```

## 🔑 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Base de datos
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="tu-clave-secreta"
JWT_REFRESH_SECRET="tu-clave-refresh"

# APIs IA
OPENAI_API_KEY="sk-..."
GOOGLE_STT_API_KEY="..."
AZURE_TTS_API_KEY="..."
DID_API_KEY="..."

# Otros
REDIS_URL="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests con cobertura
pnpm test:coverage

# Tests en modo watch
pnpm test:watch
```

## 📖 API Documentation

La API REST está disponible en `/api` con los siguientes endpoints principales:

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro
- `GET /api/interviews` - Listar entrevistas
- `POST /api/interviews` - Crear entrevista
- `POST /api/ai/feedback/:id` - Generar feedback
- `POST /api/ai/transcribe` - Transcribir audio

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/frontend
vercel --prod
```

### Railway/Render (Backend)

1. Conectar repositorio
2. Configurar variables de entorno
3. Comando build: `pnpm --filter=backend build`
4. Comando start: `pnpm --filter=backend start`

### Docker (Completo)

```bash
# Production build
docker-compose up --build -d

# Con dominio personalizado
# Configurar nginx/traefik como reverse proxy
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Convenciones

- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Código**: ESLint + Prettier configurados
- **Branches**: `feature/`, `fix/`, `hotfix/`

## 📝 Roadmap

### Sprint 1-2 (Fundación)
- ✅ Configuración monorepo
- ✅ Autenticación JWT
- ✅ Base de datos Prisma
- 🔄 UI básico con TailwindCSS

### Sprint 3-4 (Core)
- 🔄 Sistema de entrevistas
- 🔄 Integración OpenAI
- 🔄 Speech-to-Text
- 🔄 Text-to-Speech

### Sprint 5-6 (Avanzado)
- ⏳ Avatar D-ID
- ⏳ Dashboard métricas
- ⏳ Feedback detallado
- ⏳ Testing completo

### Futuro
- ⏳ Mobile app (React Native)
- ⏳ Análisis de vídeo
- ⏳ Integración calendar
- ⏳ Multi-idioma

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 📞 Soporte

- **Issues**: GitHub Issues
- **Email**: soporte@interviewai.com
- **Docs**: [docs.interviewai.com](https://docs.interviewai.com)

---

**Desarrollado con ❤️ usando TypeScript, React y Node.js**