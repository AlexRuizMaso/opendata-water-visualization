# Guia de Desenvolupament

## Inici Ràpid

### 1. Setup Inicial

```bash
# Clonar el repositori
git clone <repo-url>
cd opendata-water-visualization

# Instal·lar totes les dependències
npm install
```

### 2. Executar en Mode Desenvolvimento

```bash
# Frontend (React + Vite)
npm run dev

# En una altra terminal, ETL (opcional)
npm run etl
```

Accedeix a: http://localhost:3000

### 3. Estructura del Projecte

```
opendata-water-visualization/
│
├── frontend/                    # Aplicació React
│   ├── src/
│   │   ├── components/         # Components React reutilitzables
│   │   │   ├── Navigation.jsx
│   │   │   └── dashboards/     # Dashboards interactius (1-4)
│   │   ├── pages/              # Pàgines principals (Dashboard, Reservoirs, Weather, About)
│   │   ├── services/           # Servei de dades (waterDataService)
│   │   ├── styles/             # SCSS modularitzat
│   │   ├── utils/              # Utilitats (chartFormatters, stationNameMap, timeRangeFilter)
│   │   ├── hooks/              # Custom React hooks (useWaterData)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── etl/                         # Pipeline ETL (Node.js)
│   ├── src/
│   │   ├── extractors/         # Extracció de dades (embassaments, precipitation)
│   │   ├── transformers/       # Transformació de dades (embassaments, precipitation)
│   │   ├── loaders/            # Càrrega de dades en JSON (fileLoader)
│   │   ├── utils/              # Utilitats (healthCheck, stationNameMap)
│   │   ├── config.js           # Configuració central
│   │   ├── index.js            # Punt d'entrada
│   │   └── pipeline.js         # Orquestrador del ETL
│   ├── data/                   # Dades JSON processades (versionades)
│   ├── logs/                   # Logs del ETL
│   ├── package.json
│   └── .env.example
│
├── .github/workflows/
│   ├── etl-pipeline.yml        # Automatització ETL (diària a les 2:00 AM UTC)
│   └── deploy-frontend-pages.yml # Desplegament a GitHub Pages
│
├── docs/
│   ├── ARCHITECTURE.md         # Arquitectura del projecte
│   ├── DEVELOPMENT.md          # Aquesta guia
│   └── API_REFERENCE.md        # Referència de l'API de dades
│
├── .gitignore
├── LICENSE
├── README.md
├── package.json                 # Root package.json amb workspaces

```

## Arquitectura Bàsica

### Frontend (React)

**Tecnologies**:
- React 18
- Vite (build tool)
- React Router (navegació)
- Recharts (gràfics)
- Leaflet (mapes)
- SCSS (estilos)

**Estructura de componentes**:
```
Navigation (principal)
├── Dashboard (page)
├── Reservoirs (page)
├── Weather (page)
└── About (page)
```

### ETL Pipeline

**Flux**:
```
EXTRACT (APIs públiques)
    ↓
TRANSFORM (Procesament de dades)
    ↓
LOAD (Guardat en JSON)
    ↓
GitHub Actions (Automatització diària)
```

## Estat Actual del Projecte

El projecte té les següents funcionalitats implementades:

### Frontend
- **Servei de dades**: `waterDataService.js` amb funcions per carregar dades JSON (`getEmbassaments`, `getPrecipitation`, `getMetadata`)
- **Hook de dades**: `useWaterData.js` per gestionar l'estat de càrrega de dades
- **4 dashboards interactius**: Mapa d'embassaments, evolució temporal, correlació precipitació-nivells, alertes de sequera
- **Navegació responsiva**: amb menú hamburguesa per a mòbil
- **Estils SCSS modularitzats**: amb variables i mixins

### ETL Pipeline
- **Extractors**: `embassaments.js` i `precipitation.js` amb paginació i maneig d'errors
- **Transformadors**: neteja i estructuració de dades
- **Loader**: guardat en JSON amb backups diaris i división per anys
- **Health check**: verificació de disponibilitat de les APIs abans d'executar
- **Automatització**: GitHub Actions executa l'ETL diàriament a les 2:00 AM UTC

### Desplegament
- Frontend desplegat a GitHub Pages
- ETL automatitzat amb GitHub Actions

## Configuració per a Desenvolupar

### Variables d'Entorn Frontend

Copiar `.env.example` a `.env` i editar:
```bash
cp frontend/.env.example frontend/.env
```

### Variables d'Entorn ETL

Copiar `.env.example` a `.env` i editar:
```bash
cp etl/.env.example etl/.env
```

## Comandes Útils

```bash
# Frontend
npm run dev           # Desenvolupament
npm run build         # Build per producció
npm run preview       # Preview del build
npm run type-check    # Verificació TypeScript

# ETL
npm run etl           # Executa ETL manualment

# Linting i format
npm run lint          # Lint de tots els projectes
npm run format        # Formatejar codi
```

## Estructura de Branques (Git Workflow)

```
main (producció)
├── develop (desarrollo)
│   ├── feature/ui-components
│   ├── feature/api-integration
│   ├── feature/etl-improvement
│   └── ...
```

## Recursos Útils

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Portal de Dades Obertes de Catalunya](https://analisi.transparenciacatalunya.cat)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Problemes Comuns

### Port 3000 ja en ús
```bash
# Vite usa port 3000 per defecte. Per canviar:
npm run dev -- --port 3001
```

### Problemes amb node_modules
```bash
# Eliminar i reinstal·lar
rm -r node_modules package-lock.json
npm install
```

## Suport i Preguntes

- Revisar documentació a `docs/`
- Consultar `README.md` per a més informació

---

**Data de creació**: 13 de Maig de 2026
**Última actualització**: 8 de Juliol de 2026
