# OLPASA · SGC ISO 9001:2015

## Deploy en Vercel (5 minutos, gratis)

### Paso 1 — Sube el proyecto a GitHub
1. Ve a https://github.com/new
2. Crea un repositorio llamado `olpasa-sgc`
3. Sube todos estos archivos

### Paso 2 — Conecta con Vercel
1. Ve a https://vercel.com → "Add New Project"
2. Conecta tu repositorio de GitHub
3. Haz clic en "Deploy"

### Paso 3 — Configura la API Key
1. En Vercel → Settings → Environment Variables
2. Añade:
   - Name: `ANTHROPIC_API_KEY`
   - Value: tu API key de Anthropic (https://console.anthropic.com)
3. Haz clic en "Save" y luego "Redeploy"

¡Listo! Tu app estará en https://olpasa-sgc.vercel.app

## Estructura del proyecto
```
olpasa-sgc/
├── api/
│   └── claude.js      ← Backend proxy (guarda la API key segura)
├── public/
│   └── index.html     ← App completa
├── vercel.json        ← Configuración de rutas
└── README.md
```
