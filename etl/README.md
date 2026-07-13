# ETL Pipeline - Dades Obertes Aigua

Pipeline ETL (Extract, Transform, Load) per a l'obtenció i processament de dades obertes sobre recursos hídrics de Catalunya.

## Inici Ràpid

```bash
# Instal·lar dependències
npm install

# Configurar variables d'entorn
cp .env.example .env

# Executar el pipeline
npm run dev
```

## Scripts Disponibles

| Comanda | Descripció |
|---------|------------|
| `npm run dev` | Executa el pipeline ETL (mode incremental diari) |
| `npm run full-pipeline` | Idem a `dev` |
| `npm run lint` | Verificació ESLint |
| `npm run format` | Formatació amb Prettier |

### Opcions de línia de comandes

```bash
# Execució incremental (per defecte): només obté les dades més recents
npm run dev

# Sincronització completa de l'historial (amb paginació Socrata)
node src/index.js --full-sync
```

## Flux del Pipeline

```
┌──────────────┐    ┌────────────────┐    ┌─────────────┐
│   EXTRACT    │ →  │   TRANSFORM    │ →  │    LOAD     │
│              │    │                │    │             │
│ • Embassaments│   │ • Normalització│    │ • Merge     │
│ • Precipitació│  │ • Validació    │    │ • JSON      │
│              │    │ • Enriqueixment│    │ • Backups   │
└──────────────┘    └────────────────┘    └─────────────┘
```

1. **Health Check**: Verifica la disponibilitat de les APIs abans d'executar
2. **Extract Embassaments**: Obté dades de nivells i capacitat dels embassaments
3. **Extract Precipitació**: Obté dades meteorològiques de la XEMA
4. **Transform Embassaments**: Normalitza noms, calcula estats, afegeix coordenades
5. **Transform Precipitació**: Normalitza noms, estructura variables
6. **Load Embassaments**: Merge incremental amb historial existent, guardat en JSON
7. **Load Precipitació**: Merge + finestra mòbil de 2 anys + divisó per anys
8. **Metadata**: Guarda metadades de l'execució
9. **Cleanup**: Elimina backupsantics (manté 30 dies)

## Estructura de Directoris

```
etl/
├── src/
│   ├── extractors/
│   │   ├── embassaments.js     # Extracció d'embassaments (amb paginació)
│   │   └── precipitation.js    # Extracció de precipitació
│   ├── transformers/
│   │   ├── embassaments.js     # Transformació d'embassaments
│   │   └── precipitation.js    # Transformació de precipitació
│   ├── loaders/
│   │   └── fileLoader.js       # Guardat en JSON, backups, splits per any
│   ├── utils/
│   │   ├── healthCheck.js      # Verificació de salut de les APIs
│   │   └── stationNameMap.js   # Normalització de noms d'estacions
│   ├── config.js               # Configuració central
│   ├── index.js                # Punt d'entrada
│   └── pipeline.js             # Orquestrador del pipeline
├── data/                       # Dades JSON generades (versionades)
├── logs/                       # Logs d'execució
├── .env.example                # Template de variables d'entorn
└── package.json
```

## Variables d'Entorn

Copiar `.env.example` a `.env` i editar:

```bash
cp .env.example .env
```

Les variables més importants:

| Variable | Descripció | Valor per defecte |
|----------|------------|-------------------|
| `SOCRATA_BASE_URL` | URL base del portal de dades obertes | `https://analisi.transparenciacatalunya.cat` |
| `EMBASSAMENTS_API_URL` | URL API d'embassaments | `(construïda desde l'ID del dataset)` |
| `PRECIPITATION_API_URL` | URL API de precipitació | `(construïda desde l'ID del dataset)` |
| `API_MAX_RECORDS` | Registres màxims per petició | `50000` |
| `ENABLE_HEALTH_CHECK` | Activar verificació de APIs | `true` |

## Fitxers de Sortida

| Fitxer | Contingut |
|--------|-----------|
| `embassaments.json` | Historial complet d'embassaments |
| `precipitation.json` | Precipitació dels últims 2 anys (finestra mòbil) |
| `precipitation_YYYY.json` | Arxiu de precipitació per any |
| `metadata.json` | Metadades de l'execució |
| `*.backup.YYYY-MM-DD.json` | Backups diaris |

## Afegir un Nou Extractor

1. Crear el fitxer a `src/extractors/`:
```javascript
export default class NouExtractor {
  async extract() {
    // Lògica d'extracció
  }
}
```

2. Importar i utilitzar a `src/pipeline.js`

## Afegir un Nou Transformer

1. Crear el fitxer a `src/transformers/`:
```javascript
export default class NouTransformer {
  transform(rawData) {
    // Lògica de transformació
    return { records: [...], statistics: {...} };
  }
}
```

## Automatització

El pipeline s'executa automàticament cada dia a les 2:00 AM UTC mitjançant GitHub Actions. També es pot executar manualment des de la pestanya "Actions" del repositori.
