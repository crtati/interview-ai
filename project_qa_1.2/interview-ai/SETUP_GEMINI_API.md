# Configuración de Gemini API

## 🔧 PROBLEMA ACTUAL
El sistema está usando respuestas hardcoded porque `GEMINI_API_KEY="your-gemini-key"` es un placeholder.

## ✅ SOLUCIÓN: Obtener API Key de Gemini (GRATIS)

### Paso 1: Obtener API Key
1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API key generada

### Paso 2: Configurar la API Key
1. Abre el archivo: `interview-ai/API_SETUP.env`
2. Reemplaza:
   ```
   GEMINI_API_KEY="your-gemini-key"
   ```
   Por:
   ```
   GEMINI_API_KEY="tu-api-key-real-aqui"
   ```

### Paso 3: Reiniciar el backend
```bash
cd interview-ai/apps/backend
pnpm dev
```

## 🧪 CÓMO PROBAR QUE FUNCIONA

1. Inicia una entrevista
2. Da una respuesta corta como: "Sí, tengo experiencia"
3. **SI FUNCIONA:** La IA hará una pregunta específica contextual
4. **SI NO FUNCIONA:** Aparecerá la pregunta genérica "¿Puedes contarme más detalles específicos sobre tu experiencia?"

## 📝 NOTAS IMPORTANTES

- **Gemini API es GRATUITA** hasta cierto límite de uso
- La API key es personal, no la compartas
- Si no quieres configurar la API, el sistema funciona en modo mock simplificado
- El modo mock ya está configurado para NO interferir con el flujo natural

## 🐛 TROUBLESHOOTING

Si después de configurar la API key real sigue apareciendo la pregunta genérica:
1. Verifica que la API key esté bien copiada (sin espacios extra)
2. Reinicia completamente el backend
3. Revisa la consola del backend por errores de API