# Arquitectura del Projecte

## Visió General

L'aplicació segueix una arquitectura descentralitzada on el frontend i l'ETL són components independents:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│          - Components reutilitzables                        │
│          - Visualització de dades (Recharts, Leaflet)       │
│          - State management (Zustand)                       │
│          - Responsive design                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├── Consume dades JSON
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     ETL Pipeline                            │
│          - Extrae de APIs públiques                         │
│          - Transforma dades                                 │
│          - Guarda en JSON (versionat a Git)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
       ▼                               ▼
  XEMA API                      Reservoir API
  (Meteorology)                 (Water Levels)
```

## Components Principals

### 1. Frontend (React)

**Ubicació**: `frontend/`

**Estructura de carpetes**:
- `components/`: Components reutilitzables
  - `Navigation.jsx`: Navegació principal
  - `ChartComponent.jsx`: Gràfics (futur)
  - `MapComponent.jsx`: Mapa interactiu (futur)
  - Altres components

- `pages/`: Pàgines principals
  - `Dashboard.jsx`: Panell de control
  - `Reservoirs.jsx`: Visualització d'embassaments
  - `Weather.jsx`: Dades meteorològiques
  - `About.jsx`: Informació del projecte

- `services/`: Servei d'API
  - `api.js`: Funcions per fer peticions HTTP

- `store/`: State management
  - `dataStore.js`: Zustand store per a dades globals

- `styles/`: Estilos SCSS
  - `_variables.scss`: Variables de color, tipografia, etc.
  - `index.scss`: Estilos globals
  - `Navigation.scss`: Estilos del component Navigation

- `utils/`: Funcions utilitàries
  - `formatters.js`: Format de dades
  - `parsers.js`: Parsing de dades

- `hooks/`: Custom React hooks
  - `useData.js`: Hook per cargar i gestionar dades
  - `useMap.js`: Hook per al mapa interactiu

**Configuració**:
- `vite.config.js`: Configuració de Vite
- `tsconfig.json`: Configuració de TypeScript
- `package.json`: Dependencies del frontend

### 2. ETL Pipeline

**Ubicació**: `etl/`

**Flux d'execució**:

```
┌──────────────┐    ┌────────────────┐    ┌─────────────┐
│   EXTRACT    │ → │   TRANSFORM    │ → │    LOAD     │
│              │    │                │    │             │
│ • XEMA data  │    │ • Parse JSON   │    │ • Save JSON │
│ • Reservoir  │    │ • Structure    │    │ • Latest    │
│   data       │    │ • Validate     │    │   index     │
└──────────────┘    └────────────────┘    └─────────────┘
```

**Estructura de carpetes**:
- `src/extractors/`: Funcions d'extracció
  - `index.js`: Lògica principal
  - `xema.js`: Extracció de dades XEMA (futur)
  - `reservoirs.js`: Extracció de dades d'embassaments (futur)

- `src/transformers/`: Funcions de transformació
  - `index.js`: Transformació de dades

- `src/loaders/`: Funcions de càrrega
  - `index.js`: Guardat de dades en JSON

- `src/utils/`: Funcions utilitàries
  - `logger.js`: Sistema de logging (futur)
  - `validators.js`: Validació de dades (futur)

- `data/`: Dades processades (versionades a Git)
  - `xema_YYYY-MM-DD.json`: Dades XEMA diàries
  - `reservoirs_YYYY-MM-DD.json`: Dades d'embassaments diàries
  - `latest.json`: Índex de les dades més recents

- `pipeline.js`: Orquestrador del ETL

**Configuració**:
- `.env.example`: Template de variables d'entorn
- `package.json`: Dependencies del ETL

### 3. Backend (Opcional)

**Ubicació**: `backend/`

*Actualment no és necessari, però es preveu per a futures millores com:*
- Autenticació d'usuaris
- API cache
- Endpoints personalitzats
- WebSockets per a actualizacions en temps real

### 4. GitHub Actions Automation

**Ubicació**: `.github/workflows/`

**Workflow principal**: `etl-pipeline.yml`
- Executa el ETL diàriament a les 6:00 AM UTC
- Permet execució manual des de GitHub
- Automàticament fa commit i push de les dades actualitzades

## Flux de Dades

1. **Extracció** (ETL):
   - GitHub Actions desencadena el workflow
   - Els extractors fan peticions a les APIs públiques

2. **Transformació** (ETL):
   - Les dades brutes es procesan i estructuren
   - S'afegeixen timestamps i metadades

3. **Càrrega** (ETL):
   - Les dades es guarden en fitxers JSON
   - Es fa commit i push automàticament a Git

4. **Servei** (Frontend):
   - El frontend descàrrega els JSON del repositori
   - Es mostren les dades en gràfics i mapes

## Consideracions de Disseny

### Robustesa
- **Independència de components**: Frontend i ETL funcionen independentment
- **Versionament de dades**: Tots els canvis es guarden a Git
- **Error handling**: Cada fase del ETL té gestió d'errors

### Escalabilitat
- **Estructura modular**: Fàcil d'afegir nous extractors i transformadors
- **Workspace NPM**: Multi-repositori lògic dins d'un únic projecte
- **Reutilitzabilitat**: Components React reutilitzables

### Mantenibilitat
- **Separació de responsabilitats**: ETL separate del frontend
- **Documentació inline**: Comentaris en el codi
- **Configuració externalitzada**: Variables d'entorn per a secrets

## Desplegament

### Development Local
```bash
npm install
npm run dev              # Frontend en http://localhost:3000
npm run etl             # Executa ETL manualment
```

### Build per Producció
```bash
npm run build           # Build del frontend
npm run etl            # ETL final
```

### Automatització en Producció
- GitHub Actions executa el ETL automàticament
- Frontend es despliega a plataforma de hosting (vercel, netlify, etc.)

## Futures Millores

- [ ] Backend API amb Express
- [ ] WebSockets per a actualizacions en temps real
- [ ] Base de dades per a historial complet
- [ ] Autenticació d'usuaris
- [ ] Exportació de dades (CSV, PDF)
- [ ] Notificacions d'alertes
- [ ] Gràfics més avançats
- [ ] Tests automatitzats
- [ ] CI/CD pipeline complet
