@echo off
echo 🚀 Inicializando proyecto InterviewAI...

REM Verificar Node.js
echo 📋 Verificando prerrequisitos...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Instala Node.js 18+ desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando pnpm...
    npm install -g pnpm
)

echo ✅ Prerrequisitos verificados

REM Instalar dependencias
echo 📦 Instalando dependencias...
pnpm install

REM Configurar variables de entorno
echo ⚙️ Configurando variables de entorno...
if not exist .env (
    copy .env.example .env
    echo 📝 Archivo .env creado. Por favor, configura las variables necesarias:
    echo    - DATABASE_URL
    echo    - JWT_SECRET
    echo    - JWT_REFRESH_SECRET
    echo    - APIs de IA ^(OPENAI_API_KEY, etc.^)
)

REM Iniciar servicios de desarrollo (si Docker está disponible)
docker-compose --version >nul 2>&1
if not errorlevel 1 (
    echo 🐳 Iniciando servicios de desarrollo con Docker...
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ⏳ Esperando a que PostgreSQL esté listo...
    timeout /t 15 /nobreak
) else (
    echo ⚠️ Docker Compose no disponible. Configura PostgreSQL manualmente.
    echo   Cadena de conexión esperada: postgresql://postgres:password@localhost:5432/interview_ai_dev
)

REM Configurar base de datos
echo 🗄️ Configurando base de datos...
pnpm --filter=backend prisma generate
pnpm --filter=backend prisma migrate dev --name init

REM Verificar instalación
echo 🔍 Verificando instalación...
echo    Building frontend...
pnpm --filter=frontend build >nul 2>&1
if not errorlevel 1 (
    echo    ✅ Frontend build exitoso
) else (
    echo    ❌ Error en frontend build
)

echo    Building backend...
pnpm --filter=backend build >nul 2>&1
if not errorlevel 1 (
    echo    ✅ Backend build exitoso
) else (
    echo    ❌ Error en backend build
)

REM Instrucciones finales
echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📝 Próximos pasos:
echo    1. Configura las variables de entorno en .env
echo    2. Ejecuta 'pnpm dev' para iniciar el desarrollo
echo    3. Visita http://localhost:5173 ^(frontend^)
echo    4. API disponible en http://localhost:3001/api
echo.
echo 📚 Comandos útiles:
echo    pnpm dev              # Iniciar desarrollo
echo    pnpm build            # Build de producción
echo    pnpm test             # Ejecutar tests
echo    pnpm lint             # Verificar código
echo    pnpm db:studio        # Prisma Studio ^(GUI BD^)
echo.
echo 🆘 Soporte:
echo    - Documentación: README.md
echo    - Issues: GitHub Issues
echo.
echo ¡Happy coding! 🚀

pause