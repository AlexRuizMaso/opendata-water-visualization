# Arquitectura del Projecte

## Visió General

L'aplicació segueix una arquitectura descentralitzada on el frontend i l'ETL són components independents:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│          - Components reutilitzables                        │
│          - Visualització de dades (Recharts, Leaflet)       │
│          - Responsive design                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├── Consume dades JSON
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     ETL Pipeline                            │
│          - Extreu de APIs públiques                         │
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
  - `dashboards/`: Dashboards interactius
    - `Dashboard1.jsx`: Mapa d'embassaments i KPIs
    - `Dashboard2.jsx`: Evolució temporal
    - `Dashboard3.jsx`: Correlació precipitació-nivells
    - `Dashboard4.jsx`: Alertes de sequera

- `pages/`: Pàgines principals
  - `Dashboard.jsx`: Panell de control principal
  - `Reservoirs.jsx`: Informació sobre embassaments
  - `Weather.jsx`: Informació climàtica
  - `About.jsx`: Informació del projecte

- `services/`: Servei de dades
  - `waterDataService.js`: Funcions per carregar dades JSON del frontend

- `styles/`: Estils SCSS
  - `_variables.scss`: Variables de color, tipografia, etc.
  - `index.scss`: Estils globals
  - `Navigation.scss`: Estils del component Navigation

- `utils/`: Funcions utilitàries
  - `chartFormatters.js`: Format de dades per a gràfics
  - `stationNameMap.js`: Normalització de noms d'estacions
  - `timeRangeFilter.js`: Filtratge per rang de temps

- `hooks/`: Custom React hooks
  - `useWaterData.js`: Hook per carregar i gestionar dades d'aigua

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
  - `embassaments.js`: Extracció de dades d'embassaments (amb paginació)
  - `precipitation.js`: Extracció de dades de precipitació

- `src/transformers/`: Funcions de transformació
  - `embassaments.js`: Transformació i neteja de dades d'embassaments
  - `precipitation.js`: Transformació i neteja de dades de precipitació

- `src/loaders/`: Funcions de càrrega
  - `fileLoader.js`: Guardat de dades en JSON, backups i división per anys

- `src/utils/`: Funcions utilitàries
  - `healthCheck.js`: Verificació de disponibilitat de les APIs
  - `stationNameMap.js`: Normalització de noms d'estacions

- `data/`: Dades processades (versionades a Git)
  - `embassaments.json`: Dades d'embassaments
  - `precipitation.json`: Dades de precipitació global
  - `precipitation_YYYY.json`: Dades de precipitació dividides per any
  - `metadata.json`: Metadades del pipeline
  - `embassaments.backup.YYYY-MM-DD.json`: Backups diaris d'embassaments
  - `precipitation.backup.YYYY-MM-DD.json`: Backups diaris de precipitació

- `src/config.js`: Configuració central (URLs d'API, paths, etc.)
- `src/pipeline.js`: Orquestrador del ETL
- `src/index.js`: Punt d'entrada

**Configuració**:
- `.env.example`: Template de variables d'entorn
- `package.json`: Dependencies del ETL

### 3. GitHub Actions Automation

**Ubicació**: `.github/workflows/`

**Workflow principal**: `etl-pipeline.yml`
- Executa el ETL diàriament a les 2:00 AM UTC
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
- **Separació de responsabilitats**: ETL separada del frontend
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
- Frontend es despliega a GitHub Pages

## Futures Millores

- [ ] WebSockets per a actualizacions en temps real
- [ ] Base de dades per a historial complet
- [ ] Autenticació d'usuaris
- [ ] Exportació de dades (CSV, PDF)
- [ ] Notificacions d'alertes
- [ ] Gràfics més avançats
- [ ] Tests automatitzats
- [ ] CI/CD pipeline complet
