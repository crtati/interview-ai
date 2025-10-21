# 🎤 Interview AI - Sistema de Entrevistas con IA

**Aplicación web para simulación de entrevistas con inteligencia artificial, feedback automático y avatar interactivo.**

## 🏗️ Arquitectura del Proyecto

**Monorepo** con workspaces usando **pnpm**:

```
project/
└── interview-ai/
    ├── apps/
    │   ├── frontend/          # React + TypeScript + Vite
    │   └── backend/           # Node.js + Express + TypeScript
    ├── packages/
    │   └── shared/            # Tipos y utilidades compartidas
    └── docker/                # Configuraciones Docker
```

## 🛠️ Stack Tecnológico

### **Frontend:**
- **React 18** + **TypeScript**
- **Vite** (build tool y dev server)
- **TailwindCSS** + **Radix UI** (componentes)
- **Zustand** (estado global)
- **React Router** (navegación)
- **Axios** (HTTP client)
- **Three.js** + **React Three Fiber** (avatar 3D)

### **Backend:**
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **SQLite** (base de datos)
- **JWT** (autenticación)
- **Redis** (cache/sesiones - opcional)
- **Winston** (logging)
- **Bcrypt** (hash de contraseñas)

### **Inteligencia Artificial:**
- **Google Gemini API** - ✅ **GRATIS** 
  - Análisis de respuestas y feedback automático
  - 15 requests por minuto sin costo
  - API key gratuita en [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI GPT-4** - 💰 **PAGO** (alternativa)
  - Requiere tarjeta de crédito
  - ~$0.01 por entrevista

### **Avatar y Voz:**
- **Avatar 3D**: Implementado con **CSS puro** + animaciones
  - No requiere APIs externas ni costos adicionales
  - Animaciones de "listening" y "speaking"
  - Responsive y personalizable
- **Text-to-Speech**: Navegador nativo (`speechSynthesis`)
  - Sin costos adicionales
  - Soporte multiplataforma
- **Speech-to-Text**: Navegador nativo (`webkitSpeechRecognition`)
  - Sin costos adicionales
  - Funciona offline en navegadores compatibles

### **Base de Datos:**
- **SQLite** (desarrollo) - archivo local `dev.db`
- **PostgreSQL** (producción) - configurable via `DATABASE_URL`

## 📋 Prerrequisitos

- **Node.js** 18 o superior
- **pnpm** 8 o superior
- **Git** (para clonación)

## 🚀 Instalación desde Cero

### 1. Clonar el repositorio
```powershell
# Desde la carpeta project/
cd interview-ai
```

### 2. Instalar dependencias
```powershell
# Instalar todas las dependencias del monorepo
pnpm install
```

### 3. Configurar base de datos
```powershell
# Generar cliente Prisma
pnpm --filter=backend db:generate

# Ejecutar migraciones (crea las tablas)
pnpm --filter=backend db:migrate

# (Opcional) Agregar datos de prueba
pnpm --filter=backend db:seed
```

### 4. Compilar el backend
```powershell
# Compilar TypeScript a JavaScript
pnpm --filter=backend build
```

### 5. Configurar variables de entorno (Opcional)
El proyecto funciona sin configuración adicional, pero puedes personalizar:

```powershell
# El archivo .env ya existe con configuración básica
# Para IA gratis, obtén tu API key en: https://makersuite.google.com/app/apikey
# Y reemplaza en .env: GEMINI_API_KEY=tu_api_key_aqui
```

## ▶️ Comandos para Ejecutar el Servidor

### Desarrollo (Modo recomendado)

**Terminal 1 - Backend:**
```powershell
cd interview-ai
pnpm --filter=backend dev
```
✅ Backend disponible en: http://localhost:3002

**Terminal 2 - Frontend:**
```powershell
cd interview-ai
pnpm --filter=frontend dev
```
✅ Frontend disponible en: http://localhost:5173

### Producción
```powershell
# 1. Compilar todo
pnpm build

# 2. Iniciar backend
pnpm --filter=backend start
```

### Un solo comando (Desarrollo)
```powershell
# Inicia frontend y backend en paralelo
pnpm dev
```

## 🌐 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación web principal |
| **Backend API** | http://localhost:3002/api | API REST |
| **Health Check** | http://localhost:3002/health | Estado del servidor |
| **Base de datos** | `sqlite:./dev.db` | Archivo SQLite local |

## 🤖 Configuración de IA (Opcional)

### Opción 1: Google Gemini (100% GRATIS)
1. Ve a https://makersuite.google.com/app/apikey
2. Crea cuenta con Google
3. Genera API key
4. En `.env`: `GEMINI_API_KEY=AIzaSy...`
5. Reinicia el backend

### Opción 2: Sin configurar (Modo simulación)
- El sistema funciona con respuestas simuladas realistas
- Perfecto para desarrollo y testing

### Opción 3: OpenAI (PAGO)
1. Cuenta en https://platform.openai.com
2. Agregar tarjeta de crédito
3. En `.env`: `OPENAI_API_KEY=sk-...`

## 🎭 Detalles del Avatar

### Implementación Actual:
- **Tecnología**: CSS puro + animaciones keyframes
- **Archivos**: `Avatar3DCSS.tsx` (usado en producción)
- **Estados**: `isListening` (pulsación), `isSpeaking` (movimiento boca)
- **Costo**: $0 - completamente local

### Estados visuales:
- **Idle**: Avatar estático esperando
- **Listening**: Pulsación suave (grabando audio)
- **Speaking**: Animación de boca (reproduciendo audio)

### Características:
- ✅ Responsive (se adapta a cualquier tamaño)
- ✅ Personalizable via CSS
- ✅ Sin dependencias externas
- ✅ Funciona offline
- ✅ Performance optimizada

## 📁 Estructura de Archivos Principales

```
interview-ai/
├── .env                           # Variables de entorno
├── package.json                   # Configuración del monorepo
├── apps/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Avatar3DCSS.tsx        # Avatar principal
│   │   │   │   └── layout/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx          # Pantalla login
│   │   │   │   ├── DashboardPage.tsx      # Panel principal
│   │   │   │   ├── InterviewPageComplete.tsx # Entrevista completa
│   │   │   │   └── EvaluationPage.tsx     # Resultados
│   │   │   ├── contexts/
│   │   │   │   └── AuthContext.tsx        # Autenticación
│   │   │   └── services/
│   │   │       └── api.ts                 # Cliente HTTP
│   │   └── package.json
│   └── backend/
│       ├── src/
│       │   ├── routes/                    # Endpoints API
│       │   ├── services/
│       │   │   ├── gemini.ts              # IA Gemini
│       │   │   └── openai.ts              # IA OpenAI
│       │   ├── config/
│       │   │   └── database.ts            # Prisma config
│       │   └── middlewares/
│       │       └── auth.ts                # JWT middleware
│       ├── prisma/
│       │   ├── schema.prisma              # Esquema BD
│       │   └── dev.db                     # Base datos SQLite
│       └── package.json
└── packages/
    └── shared/                            # Tipos compartidos
```

## 🔧 Comandos Útiles

```powershell
# Ver la base de datos en interfaz gráfica
pnpm --filter=backend db:studio

# Limpiar y reinstalar dependencias
pnpm clean && pnpm install

# Verificar errores de TypeScript
pnpm --filter=frontend tsc --noEmit
pnpm --filter=backend tsc --noEmit

# Formatear código
pnpm format

# Linting
pnpm lint
pnpm lint:fix
```

## 🐛 Troubleshooting

### Error: "No se encuentra pnpm"
```powershell
npm install -g pnpm
```

### Error: Redis connection (Normal)
- Los errores de Redis son normales si no tienes Redis instalado
- El sistema funciona usando memoria RAM como alternativa

### Error: Puerto ocupado
```powershell
# Backend en puerto diferente
PORT=3003 pnpm --filter=backend dev

# Frontend en puerto diferente  
pnpm --filter=frontend dev --port 5174
```

### Base de datos corrupta
```powershell
rm apps/backend/prisma/dev.db
pnpm --filter=backend db:migrate
```

## 💡 Características del Sistema

### ✅ Funcionalidades Implementadas:
- Autenticación JWT con refresh tokens
- Sistema de entrevistas por categorías
- Avatar interactivo con estados visuales
- Grabación y reproducción de audio
- Análisis de respuestas con IA
- Dashboard de progreso
- Responsive design

### 🚧 En Desarrollo:
- Análisis de vídeo del candidato
- Métricas avanzadas de performance
- Integración con calendarios
- Exportar reportes PDF

## 📞 Soporte

- **Issues**: GitHub Issues del repositorio
- **Documentación**: Este README
- **Logs**: Revisa la consola del navegador y terminal del backend

---

**🎯 El sistema está optimizado para funcionar sin configuraciones complejas. ¡Solo instala las dependencias y ejecuta!**