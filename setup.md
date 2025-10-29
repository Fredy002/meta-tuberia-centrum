# 🚀 Guía de Instalación - Meta Tubería

## Prerrequisitos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**

### Verificar instalación:
```bash
node --version
npm --version
```

## 📦 Instalación

### 1. Instalar Node.js (si no está instalado)

#### Windows:
- Descarga desde [nodejs.org](https://nodejs.org/)
- Ejecuta el instalador
- Reinicia tu terminal

#### macOS:
```bash
# Con Homebrew
brew install node

# O descarga desde nodejs.org
```

#### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Instalar dependencias del proyecto

```bash
# Navegar al directorio del proyecto
cd meta-tuberia

# Instalar dependencias
npm install
```

### 3. Verificar instalación

```bash
# Verificar que las dependencias se instalaron correctamente
npm list --depth=0

# Verificar que el proyecto se puede construir
npm run build
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:5173`

### Modo Producción
```bash
# Construir el proyecto
npm run build

# Ejecutar en producción
npm start
```

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción

# Calidad de código
npm run lint         # Ejecutar linter
npm run lint:fix     # Corregir errores de linting automáticamente
npm run typecheck    # Verificar tipos de TypeScript
```

## 📁 Estructura del Proyecto

```
meta-tuberia/
├── app/
│   ├── domain/              # Capa de dominio (DDD)
│   │   ├── entities/        # Entidades de negocio
│   │   ├── value-objects/   # Objetos de valor
│   │   ├── services/        # Servicios de dominio
│   │   ├── repositories/    # Interfaces de repositorios
│   │   └── events/          # Eventos de dominio
│   ├── application/          # Capa de aplicación
│   │   └── services/        # Servicios de aplicación
│   ├── components/          # Componentes React
│   ├── routes/             # Rutas de Remix
│   ├── styles/             # Estilos CSS
│   └── utils/              # Utilidades
├── public/                 # Archivos estáticos
├── package.json           # Dependencias y scripts
├── remix.config.js        # Configuración de Remix
├── tailwind.config.ts     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Documentación
```

## 🔧 Configuración Adicional

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto si necesitas configuraciones específicas:

```env
# Ejemplo de variables de entorno
NODE_ENV=development
PORT=3000
```

### Configuración de Tailwind
El proyecto usa Tailwind CSS. La configuración se encuentra en `tailwind.config.ts`.

### Configuración de TypeScript
La configuración de TypeScript está en `tsconfig.json` con paths configurados para alias.

## 🐛 Solución de Problemas

### Error: "npx no se reconoce"
- Instala Node.js desde [nodejs.org](https://nodejs.org/)
- Reinicia tu terminal después de la instalación

### Error: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied"
```bash
# En Windows, ejecuta como administrador
# En macOS/Linux, usa sudo si es necesario
sudo npm install
```

### Error de memoria en build
```bash
# Aumentar memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## 📚 Recursos Adicionales

- [Documentación de Remix](https://remix.run/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## 🤝 Soporte

Si encuentras problemas durante la instalación:

1. Verifica que tienes Node.js 18+ instalado
2. Limpia el cache: `npm cache clean --force`
3. Reinstala dependencias: `rm -rf node_modules && npm install`
4. Revisa los logs de error para más detalles

## ✅ Verificación Final

Una vez instalado correctamente, deberías poder:

1. Ejecutar `npm run dev` sin errores
2. Abrir `http://localhost:5173` en tu navegador
3. Ver la interfaz de Meta Tubería funcionando
4. Subir archivos Excel/CSV y procesarlos

¡Listo! 🎉 Tu aplicación Meta Tubería está funcionando.
