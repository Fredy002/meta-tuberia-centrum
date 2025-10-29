# 📊 Meta Tubería - Sistema de Cruce de Leads

Sistema web desarrollado con **Remix** y **TypeScript** que permite cruzar bases de datos de leads entre agencias y CRM (Tubería), implementando **Domain-Driven Design** y patrones de software modernos.

## 🚀 Características

- **Cruce de Leads**: Compara leads de agencia vs CRM
- **Validación de Perfil**: Múltiples criterios de validación
- **Análisis de Duplicados**: Identifica leads duplicados
- **Visualizaciones**: Gráficos y estadísticas detalladas
- **Exportación**: Descarga resultados en CSV
- **Arquitectura DDD**: Separación clara de responsabilidades

## 🏗️ Arquitectura

### Domain Layer
- **Entities**: `Lead`, `CRMLead`, `ProcessedLead`
- **Value Objects**: `Email`, `PhoneNumber`, `DNI`, `Experience`, `EducationLevel`
- **Services**: `LeadMatchingService`, `ProfileValidationService`

### Application Layer
- **Services**: `LeadProcessingService`, `FileProcessingService`
- **DTOs**: Interfaces para transferencia de datos

### Presentation Layer
- **Components**: React components con TypeScript
- **Routes**: Remix file-based routing
- **Styling**: Tailwind CSS

## 🛠️ Tecnologías

- **Framework**: Remix
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **File Processing**: XLSX, PapaParse
- **Icons**: Lucide React

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🎯 Uso

1. **Subir Archivos**: Selecciona archivos Excel/CSV de agencia y CRM
2. **Configurar Mapeo**: Define las columnas de tu archivo de agencia
3. **Configurar Validación**: Establece criterios de perfil
4. **Procesar**: Ejecuta el cruce de datos
5. **Analizar**: Revisa resultados y visualizaciones
6. **Descargar**: Exporta resultados en CSV

## 🔧 Configuración

### Mapeo de Columnas
Define los nombres exactos de las columnas en tu archivo de agencia:

```typescript
const columnMapping = {
  dni: 'dni',
  email: 'email',
  phone: 'phone_number',
  fullName: 'full_name',
  experience: 'años_de_experiencia',
  educationLevel: 'indica_tu_grado_académico_alcanzado',
  createdTime: 'created_time',
  // ... más campos
};
```

### Validación de Perfil
Configura los criterios de validación:

```typescript
const validationConfig = {
  type: 'education_experience', // 'none' | 'education_experience' | 'sunedu_registration'
  minimumExperience: 1,
  invalidEducationLevels: ['egresado', 'tecnico', 'estudiante'],
};
```

## 📊 Funcionalidades

### Análisis de Leads
- **Presencia en CRM**: Identifica leads presentes/ausentes
- **Validación de Perfil**: Evalúa criterios académicos y experiencia
- **Leads Faltantes**: Encuentra leads válidos no presentes en CRM

### Estadísticas
- Total de leads procesados
- Distribución por estado
- Análisis de duplicados
- Cumplimiento de perfil

### Visualizaciones
- Gráficos de barras para distribución
- Gráficos de pie para proporciones
- Análisis temporal de leads

## 🏛️ Patrones Implementados

### Domain-Driven Design
- **Entities**: Objetos con identidad única
- **Value Objects**: Objetos inmutables sin identidad
- **Services**: Lógica de dominio
- **Repositories**: Abstracción de persistencia

### Clean Architecture
- **Separation of Concerns**: Capas bien definidas
- **Dependency Inversion**: Dependencias hacia abstracciones
- **Single Responsibility**: Cada clase tiene una responsabilidad

### SOLID Principles
- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

## 🚀 Desarrollo

### Estructura del Proyecto
```
app/
├── domain/           # Capa de dominio
│   ├── entities/     # Entidades de negocio
│   ├── value-objects/ # Objetos de valor
│   └── services/     # Servicios de dominio
├── application/      # Capa de aplicación
│   └── services/     # Servicios de aplicación
├── components/       # Componentes React
├── routes/          # Rutas de Remix
└── styles/          # Estilos CSS
```

### Comandos de Desarrollo
```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Build
npm run build
```

## 📈 Mejoras Futuras

- [ ] Persistencia de datos
- [ ] Autenticación y autorización
- [ ] API REST
- [ ] Tests unitarios e integración
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
