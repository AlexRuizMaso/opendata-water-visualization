# Referència de l'API de Dades

Aquest document descriu la interfície de dades del projecte: les funcions del servei del frontend, l'estructura dels fitxers JSON generats per l'ETL, i les variables d'entorn configurables.

---

## Servei del Frontend (`waterDataService.js`)

Ubicació: `frontend/src/services/waterDataService.js`

### Funcions d'obtenció de dades

| Funció | Paràmetres | Retorna | Descripció |
|--------|-----------|---------|------------|
| `getEmbassaments()` | Cap | `Array<Object>` | Obté totes les dades d'embassaments |
| `getPrecipitation()` | Cap | `Object` | Obté les dades de precipitació (últims 2 anys) |
| `getPrecipitationByYear(year)` | `year: number` | `Object` | Obté les dades de precipitació d'un any concret |
| `getPrecipitationByRange(startYear, endYear)` | `startYear: number`, `endYear: number` | `Object` | Obté precipitació d'un rang d'anys |

### Funcions de filtratge

| Funció | Paràmetres | Retorna | Descripció |
|--------|-----------|---------|------------|
| `getLatestEmbassaments(records)` | `records: Array<Object>` | `Array<Object>` | Retorna l'últim registre de cada embassament |
| `filterEmbassamentsByDateRange(records, startDate, endDate)` | `records`, `startDate: string`, `endDate: string` | `Array<Object>` | Filtra embassaments per rang de dates |
| `filterPrecipitationByDateRange(records, startDate, endDate)` | `records`, `startDate: string`, `endDate: string` | `Array<Object>` | Filtra precipitació per rang de dates |
| `getAvailableStations(precipitationData)` | `precipitationData: Object` | `Array<string>` | Retorna la llista d'estacions disponibles |

### Funcions auxiliars

| Funció | Paràmetres | Retorna | Descripció |
|--------|-----------|---------|------------|
| `getAvailableYears()` | Cap | `Array<number>` | Anys disponibles (1988 fins a l'actual) |
| `getStatusColor(percentage)` | `percentage: number` | `string` | Color HEX segons el percentatge de capacitat |

---

## Hook `useWaterData`

Ubicació: `frontend/src/hooks/useWaterData.js`

```javascript
const { embassaments, precipitation, loading, error } = useWaterData(requirePrecipitation, timeRange);
```

| Paràmetre | Tipus | Descripció |
|-----------|-------|------------|
| `requirePrecipitation` | `boolean` | Si és `true`, carrega les dades de precipitació |
| `timeRange` | `string` | Rang de temps: `'24hours'`, `'30days'`, `'1year'`, `'2years'`, `'5years'` |

| Camp retornat | Tipus | Descripció |
|---------------|-------|------------|
| `embassaments` | `Object \| null` | Dades d'embassaments (o `null` si no carregades) |
| `precipitation` | `Object \| null` | Dades de precipitació (o `null` si no sol·licitades) |
| `loading` | `boolean` | `true` mentre les dades es carreguen |
| `error` | `string \| null` | Missatge d'error (o `null` si no n'hi ha) |

---

## Estructura dels Fitxers JSON

### `embassaments.json`

Fitxer generat per l'ETL amb totes les dades d'embassaments (historial complet).

```json
{
  "records": [
    {
      "id": "Sau-2026-07-01",
      "name": "Sau",
      "fullName": "Embassament de Sau (Vilanova de Sau)",
      "date": "2026-07-01T00:00:00.000Z",
      "absoluteLevel": 623.45,
      "volumePercentage": 45.2,
      "volumeHm3": 38.5,
      "location": {
        "lat": 41.9702,
        "lng": 2.3983
      },
      "status": "normal"
    }
  ],
  "totalRecords": 5000,
  "statistics": {
    "totalEmbassaments": 9,
    "avgPercentage": 52.3,
    "minPercentage": 12.1,
    "maxPercentage": 98.7
  },
  "metadata": {
    "lastUpdated": "2026-07-01T02:00:00.000Z"
  },
  "timestamp": "2026-07-01T02:00:00.000Z"
}
```

**Camps del registre d'embassaments:**

| Camp | Tipus | Descripció |
|------|-------|------------|
| `id` | `string` | Identificador únic (nom + data) |
| `name` | `string` | Nom normalitzat de l'embassament |
| `fullName` | `string` | Nom complet original |
| `date` | `string` | Data del registre (ISO 8601) |
| `absoluteLevel` | `number \| null` | Nivell absolut en metres |
| `volumePercentage` | `number \| null` | Percentatge de volum embassat |
| `volumeHm3` | `number \| null` | Volum en hectòmetres cúbics |
| `location.lat` | `number \| null` | Latitud |
| `location.lng` | `number \| null` | Longitud |
| `status` | `string` | Estat: `'critical'`, `'warning'`, `'normal'` |

**Embassaments disponibles:** Siurana, Riudecanyes, Sant Ponç, Sau, Susqueda, Llosa del Cavall, Foix, Baells, Darnius-Boadella.

---

### `precipitation.json`

Fitxer generat per l'ETL amb les dades de precipitació dels últims 2 anys (finestra mòbil).

```json
{
  "records": [
    {
      "id": "E1-E1300-2026-07-01",
      "stationCode": "E1",
      "stationName": "Vallès Occidental",
      "date": "2026-07-01T00:00:00.000Z",
      "variableCode": "1300",
      "variableName": "precipitation_daily",
      "variableLabel": "Precipitació diària",
      "value": 5.2,
      "unit": "mm",
      "status": "V"
    }
  ],
  "totalRecords": 15000,
  "precipitationOnly": [...],
  "precipitationRecords": 8000,
  "statistics": {
    "totalStations": 45,
    "totalDaysCovered": 730
  },
  "metadata": {
    "lastUpdated": "2026-07-01T02:00:00.000Z"
  },
  "timestamp": "2026-07-01T02:00:00.000Z"
}
```

**Camps del registre de precipitació:**

| Camp | Tipus | Descripció |
|------|-------|------------|
| `id` | `string` | Identificador únic |
| `stationCode` | `string` | Codi de l'estació meteorològica |
| `stationName` | `string` | Nom normalitzat de l'estació |
| `date` | `string` | Data de la lectura (ISO 8601) |
| `variableCode` | `string` | Codi de la variable mesurada |
| `variableName` | `string` | Nom tècnic de la variable |
| `variableLabel` | `string` | Etiqueta descriptiva de la variable |
| `value` | `number \| null` | Valor mesurat |
| `unit` | `string` | Unitat de mesura |
| `status` | `string` | Estat del registre |

**Variables disponibles (codi → nom):**

| Codi | Nom | Unitat |
|------|-----|--------|
| 1000 | Temperatura mitjana | °C |
| 1001 | Temperatura màxima | °C |
| 1002 | Temperatura mínima | °C |
| 1100 | Humitat mitjana | % |
| 1300 | Precipitació diària | mm |
| 1301 | Precipitació diària (8-8h) | mm |
| 1303 | Precipitació máxima en 1h | mm |
| 1400 | Irradiància solar global | MJ/m² |
| 1505 | Velocitat del vent mitjana | m/s |
| 1700 | Evapotranspiració de referència | mm |

---

### `precipitation_YYYY.json`

Fitxers d'arxiu de precipitació dividits per any. Contenen l'historial complet d'un any concret. Estructura idèntica a `precipitation.json`.

Exemple: `precipitation_2025.json`, `precipitation_2024.json`, etc.

---

### `metadata.json`

Metadades de l'execució del pipeline ETL.

```json
{
  "timestamp": "2026-07-01T02:00:00.000Z",
  "pipelineVersion": "1.0",
  "duration": "12.34s",
  "statistics": {
    "embassaments": {
      "totalEmbassaments": 9,
      "avgPercentage": 52.3
    },
    "precipitation": {
      "totalStations": 45,
      "totalDaysCovered": 730
    }
  },
  "sources": {
    "embassaments": "https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json",
    "precipitation": "https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json"
  }
}
```

---

## Variables d'Entorn

### Frontend (`frontend/.env.example`)

| Variable | Valor per defecte | Descripció |
|----------|-------------------|------------|
| `VITE_API_URL` | `http://localhost:3000` | URL del servidor de desenvolupament |
| `VITE_BACKEND_URL` | `http://localhost:5000` | URL del backend (opcional) |
| `VITE_ENABLE_ANALYTICS` | `false` | Activar analítiques |
| `VITE_ENABLE_SHARING` | `true` | Activar botó de compartició |
| `VITE_ENABLE_EXPORTS` | `true` | Activar exportació de dades |
| `VITE_MAP_CENTER_LAT` | `41.9` | Latitud central del mapa |
| `VITE_MAP_CENTER_LON` | `1.9` | Longitud central del mapa |
| `VITE_MAP_ZOOM` | `8` | Nivell de zoom del mapa |

### ETL (`etl/.env.example`)

| Variable | Valor per defecte | Descripció |
|----------|-------------------|------------|
| `SOCRATA_BASE_URL` | `https://analisi.transparenciacatalunya.cat` | URL base del portal de dades obertes |
| `EMBASSAMENTS_DATASET_ID` | `gn9e-3qhr` | ID del dataset d'embassaments |
| `PRECIPITATION_DATASET_ID` | `7bvh-jvq2` | ID del dataset de precipitació |
| `EMBASSAMENTS_API_URL` | `https://...resource/gn9e-3qhr.json` | URL completa de l'API d'embassaments |
| `PRECIPITATION_API_URL` | `https://...resource/7bvh-jvq2.json` | URL completa de l'API de precipitació |
| `API_MAX_RECORDS` | `50000` | Registres màxims per petició (límit Socrata) |
| `DATA_RETENTION_DAYS` | `365` | Dies de retenció de backups |
| `LOG_LEVEL` | `info` | Nivell de logging |
| `ENABLE_HEALTH_CHECK` | `true` | Activar verificació de salut de les APIs |
| `HEALTH_CHECK_TIMEOUT_MS` | `5000` | Timeout del health check en ms |
| `NODE_ENV` | `development` | Entorn d'execució |

---

## Fonts de Dades

| Font | Dataset ID | URL API | Descripció |
|------|-----------|---------|------------|
| Embassaments | `gn9e-3qhr` | `https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json` | Nivells i capacitat dels embassaments de les conques internes de Catalunya |
| Precipitació | `7bvh-jvq2` | `https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json` | Dades de precipitació de la XEMA (Xarxa d'Estacions Meteorològiques Automàtiques) |
