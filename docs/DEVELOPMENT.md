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

### 3. Estructura del Projecte Creada

```
opendata-water-visualization/
│
├── frontend/                    # 🎨 Aplicació React
│   ├── src/
│   │   ├── components/         # Components React reutilitzables
│   │   ├── pages/              # Pàgines principals (Dashboard, Reservoirs, Weather, About)
│   │   ├── services/           # Serveis API (waterDataService)
│   │   ├── styles/             # SCSS modularitzat
│   │   ├── utils/              # Funcions utilitàries
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── etl/                         # 🔄 Pipeline ETL (Node.js)
│   ├── src/
│   │   ├── extractors/         # Extracció de dades d'APIs
│   │   ├── transformers/       # Transformació de dades
│   │   ├── loaders/            # Càrrega de dades en JSON
│   │   ├── utils/              # Utilitats
│   │   ├── index.js
│   │   └── pipeline.js         # Orquestrador del ETL
│   ├── data/                   # 📊 Dades JSON processades (versionades)
│   ├── logs/                   # 📝 Logs del ETL
│   ├── package.json
│   └── .env.example
│
├── .github/workflows/
│   └── etl-pipeline.yml         # 🤖 Automatització GitHub Actions
│
├── docs/
│   ├── ARCHITECTURE.md          # 📐 Arquitectura del projecte
│   └── (més documentació per afegir)
│
├── .gitignore
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

## Pròxims Passos Suggerits

### 1. Implementar Serveis API

Afegir a `frontend/src/services/api.js`:
```javascript
// Funcions per carregar dades JSON del repositori
export async function fetchXEMAData() { }
export async function fetchReservoirData() { }
```

### 2. Crear Components de Visualització

- `ReservoirChart.jsx`: Gràfic d'evolució de capacitat
- `PrecipitationMap.jsx`: Mapa de precipitacions
- `DataTable.jsx`: Taula de dades

### 3. Integrar APIs Reals

Actualitzar `etl/src/extractors/`:
- Substituir els placeholders amb crides reals a les APIs de la Generalitat
- Afegir validació de dades

### 4. Afegir Tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 5. Configurar Desplegament

- Vercel/Netlify per al frontend
- GitHub Pages per als JSON de dades

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

# ETL
npm run etl           # Executa ETL manualment
npm run full-pipeline # ETL complet (extract + transform + load)

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
**Última actualització**: 13 de Maig de 2026
