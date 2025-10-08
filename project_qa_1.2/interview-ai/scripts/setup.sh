#!/bin/bash

echo "🚀 Inicializando proyecto InterviewAI..."

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versión 18+ requerida. Versión actual: $(node -v)"
    exit 1
fi

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

# Verificar Docker (opcional)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no encontrado. Instala Docker si quieres usar contenedores."
fi

echo "✅ Prerrequisitos verificados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Archivo .env creado. Por favor, configura las variables necesarias:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - JWT_REFRESH_SECRET"
    echo "   - APIs de IA (OPENAI_API_KEY, etc.)"
fi

# Iniciar servicios de desarrollo (si Docker está disponible)
if command -v docker-compose &> /dev/null; then
    echo "🐳 Iniciando servicios de desarrollo con Docker..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Esperar a que PostgreSQL esté listo
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 10
else
    echo "⚠️  Docker Compose no disponible. Configura PostgreSQL manualmente."
    echo "   Cadena de conexión esperada: postgresql://postgres:password@localhost:5432/interview_ai_dev"
fi

# Configurar base de datos
echo "🗄️  Configurando base de datos..."
pnpm --filter=backend prisma generate
pnpm --filter=backend prisma migrate dev --name init

# Seed de datos iniciales (opcional)
echo "🌱 ¿Quieres cargar datos de ejemplo? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    pnpm --filter=backend db:seed
fi

# Verificar instalación
echo "🔍 Verificando instalación..."

# Build de prueba
echo "   Building frontend..."
pnpm --filter=frontend build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend build exitoso"
else
    echo "   ❌ Error en frontend build"
fi

echo "   Building backend..."
pnpm --filter=backend build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Backend build exitoso"
else
    echo "   ❌ Error en backend build"
fi

# Instrucciones finales
echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Configura las variables de entorno en .env"
echo "   2. Ejecuta 'pnpm dev' para iniciar el desarrollo"
echo "   3. Visita http://localhost:5173 (frontend)"
echo "   4. API disponible en http://localhost:3001/api"
echo ""
echo "📚 Comandos útiles:"
echo "   pnpm dev              # Iniciar desarrollo"
echo "   pnpm build            # Build de producción"
echo "   pnpm test             # Ejecutar tests"
echo "   pnpm lint             # Verificar código"
echo "   pnpm db:studio        # Prisma Studio (GUI BD)"
echo ""
echo "🆘 Soporte:"
echo "   - Documentación: README.md"
echo "   - Issues: GitHub Issues"
echo ""
echo "¡Happy coding! 🚀"