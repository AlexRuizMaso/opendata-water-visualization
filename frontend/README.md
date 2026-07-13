# Frontend - Dades Obertes Aigua

Aplicació web React per a la visualització de dades obertes sobre recursos hídrics de Catalunya.

## Inici Ràpid

```bash
# Instal·lar dependències
npm install

# Executar en mode desenvolupament
npm run dev

# Accedir a http://localhost:3000
```

## Scripts Disponibles

| Comanda | Descripció |
|---------|------------|
| `npm run dev` | Servidor de desenvolupament (Vite, port 3000) |
| `npm run build` | Build per producció (directori `dist/`) |
| `npm run preview` | Previsualització del build de producció |
| `npm run lint` | Verificació ESLint (JS, JSX, TS, TSX) |
| `npm run format` | Formatació amb Prettier |
| `npm run type-check` | Verificació de tipus TypeScript |

## Tecnologies

- **React 18** — Biblioteca principal d'interfícies
- **Vite 5** — Build tool i servidor de desenvolupament
- **React Router 6** — Enrutament del client (HashRouter)
- **Recharts 2** — Biblioteca de gràfics
- **Leaflet 1.9 / React Leaflet 4** — Mapes interactius
- **Axios** — Client HTTP per a càrrega de dades
- **SCSS (Sass)** — Estils modulars
- **TypeScript** — Verificació de tipus (configurat, fitxers en JSX)

## Estructura de Directoris

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx        # Navegació principal
│   │   └── dashboards/
│   │       ├── Dashboard1.jsx    # Mapa d'embassaments i KPIs
│   │       ├── Dashboard2.jsx    # Evolució temporal
│   │       ├── Dashboard3.jsx    # Correlació precipitació-nivells
│   │       └── Dashboard4.jsx    # Alertes de sequera
│   ├── pages/
│   │   ├── Dashboard.jsx         # Panell de control principal
│   │   ├── Reservoirs.jsx        # Informació d'embassaments
│   │   ├── Weather.jsx           # Informació climàtica
│   │   └── About.jsx             # Sobre el projecte
│   ├── services/
│   │   └── waterDataService.js   # Servei de càrrega de dades
│   ├── hooks/
│   │   └── useWaterData.js       # Hook per a gestió de dades
│   ├── utils/
│   │   ├── chartFormatters.js    # Formatació de gràfics
│   │   ├── stationNameMap.js     # Normalització de noms
│   │   └── timeRangeFilter.js    # Filtratge temporal
│   ├── styles/
│   │   ├── _variables.scss       # Variables SCSS
│   │   ├── index.scss            # Estils globals
│   │   └── Navigation.scss       # Estils de navegació
│   ├── App.jsx                   # Component arrel (rutes)
│   └── main.jsx                  # Punt d'entrada
├── public/
│   └── data/                     # Fitxers JSON de l'ETL
├── vite.config.js
├── tsconfig.json
└── package.json
```

## Variables d'Entorn

Copiar `.env.example` a `.env` i editar:

```bash
cp .env.example .env
```

| Variable | Descripció | Valor per defecte |
|----------|------------|-------------------|
| `VITE_API_URL` | URL del servidor | `http://localhost:3000` |
| `VITE_MAP_CENTER_LAT` | Latitud central del mapa | `41.9` |
| `VITE_MAP_CENTER_LON` | Longitud central del mapa | `1.9` |
| `VITE_MAP_ZOOM` | Zoom del mapa | `8` |

## Desplegament

El frontend es desplaga automàticament a **GitHub Pages** mitjançant GitHub Actions quan es fa push a `main`.

Per fer un build manual:

```bash
npm run build
```

El output queda al directori `dist/`.
