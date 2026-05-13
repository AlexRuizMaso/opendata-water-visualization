# Opendata Water Visualization

Aplicació web per a la visualització de dades obertes sobre recursos hídrics de Catalunya.

## 📋 Descripció del Projecte

Aquest Treball de Fi de Grau combina desenvolupament web, gestió de dades i visualització d'informació per oferir una eina pràctica que faciliti l'accés, la comprensió i l'explotació de dades públiques sobre recursos hídrics.

L'aplicació consumeix dades automàticament de les APIs públiques de la Generalitat de Catalunya, les processa mitjançant un pipeline ETL (Extract, Transform, Load) i ofereix una interfície web interactiva amb gràfics, mapes i panells de control.

### Fonts de Dades

- **XEMA**: Xarxa d'Estacions Meteorològiques Automàtiques de Catalunya
- **Embassaments**: Dades de capacitat i nivells dels embassaments de les conques internes
- **Portal de Dades Obertes**: https://analisi.transparenciacatalunya.cat/

## 🏗️ Estructura del Projecte

```
opendata-water-visualization/
├── frontend/                    # Aplicació React (SPA)
│   ├── src/
│   │   ├── components/         # Components reutilitzables
│   │   ├── pages/              # Pàgines principals
│   │   ├── services/           # Serveis per a API calls
│   │   ├── store/              # State management (Zustand)
│   │   ├── styles/             # Styles SCSS
│   │   ├── utils/              # Funcions utilitàries
│   │   ├── hooks/              # Custom React hooks
│   │   └── App.jsx
│   ├── public/
│   └── vite.config.js
├── etl/                         # Pipeline ETL (Node.js)
│   ├── src/
│   │   ├── extractors/         # Lògica d'extracció de dades
│   │   ├── transformers/       # Transformació de dades
│   │   ├── loaders/            # Càrrega de dades
│   │   ├── utils/              # Funcions utilitàries
│   │   └── pipeline.js         # Orquestrador del ETL
│   ├── data/                   # Dades JSON processades
│   └── logs/                   # Logs de l'ETL
├── backend/                     # API Backend (Express, opcional)
│   └── src/
├── .github/workflows/           # Automatització amb GitHub Actions
├── docs/                        # Documentació del projecte
└── config/                      # Fitxers de configuració

```

## 🚀 Tecnologies

### Frontend
- **React 18**: Biblioteca principal
- **Vite**: Build tool i dev server
- **Recharts**: Visualització de gràfics
- **Leaflet + React Leaflet**: Mapes interactius
- **Zustand**: State management
- **SCSS**: Styles modularitzats
- **React Router**: Enrutament

### ETL
- **Node.js**: Runtime JavaScript
- **Axios**: HTTP client
- **node-schedule**: Planificació de tasques

### DevOps
- **GitHub Actions**: Automatització del pipeline ETL
- **Vite**: Build optimization

## 📦 Instal·lació

### Prerequisits
- Node.js >= 18
- npm >= 9

### Setup Local

```bash
# Clonar repositori
git clone <repo-url>
cd opendata-water-visualization

# Instal·lar dependències (mode workspaces)
npm install

# Executar frontend en mode desenvolvimento
npm run dev

# Executar ETL
npm run etl

# Build del frontend
npm run build
```

## 🔄 Pipeline ETL

El pipeline ETL s'executa automàticament diàriament gràcies a GitHub Actions:

1. **Extract**: Obté dades de les APIs públiques
2. **Transform**: Processa i estructura les dades
3. **Load**: Guarda les dades en format JSON a la carpeta `etl/data/`

Els resultats es guarden en fitxers JSON que es versionan a Git per garantir l'historial de dades.

## 🎨 Funcionalitats

- 📊 **Panell de Control**: Visió general de l'estat dels recursos hídrics
- 📈 **Gràfics Interactius**: Evolució temporal dels nivells d'embassaments
- 🌧️ **Dades Meteorològiques**: Precipitacions i condicions climàtiques
- 🗺️ **Mapa Interactiu**: Localització de embassaments i estacions meteorològiques
- 📱 **Responsive Design**: Compatible amb dispositius mòbils

## 📚 Documentació

Podeu trobar documentació més detallada a la carpeta `docs/`:

- [Arquitectura del Projecte](docs/ARCHITECTURE.md)
- [Guia de Desenvolupament](docs/DEVELOPMENT.md)
- [API Reference](docs/API_REFERENCE.md)

## 🤝 Contribucions

Aquest és un projecte educatiu (TFG). Les contribucions i suggeriments són benvinguts!

## 📄 Llicència

MIT License - veure fitxer LICENSE per a més detalls.

## 👤 Autor

Àlex - Universitat Autònoma de Barcelona

---

**Última actualització**: 13 de Maig de 2026
