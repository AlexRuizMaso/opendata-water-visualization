import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  // Socrata API Configuration
  socrata: {
    baseUrl: process.env.SOCRATA_BASE_URL || 'https://analisi.transparenciacatalunya.cat',
    embassaments: {
      datasetId: process.env.EMBASSAMENTS_DATASET_ID || 'gn9e-3qhr',
      apiUrl: process.env.EMBASSAMENTS_API_URL || 'https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json',
    },
    precipitation: {
      datasetId: process.env.PRECIPITATION_DATASET_ID || '7bvh-jvq2',
      apiUrl: process.env.PRECIPITATION_API_URL || 'https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json',
    },
    maxRecords: parseInt(process.env.API_MAX_RECORDS || '50000'),
    timeout: 10000, // 10 seconds
  },

  // Data Configuration
  data: {
    retentionDays: parseInt(process.env.DATA_RETENTION_DAYS || '365'),
    updateFrequency: process.env.DATA_UPDATE_FREQUENCY || 'daily',
  },

  // Health Check Configuration
  healthCheck: {
    enabled: process.env.ENABLE_HEALTH_CHECK === 'true',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS || '5000'),
  },

  // File Paths
  paths: {
    root: __dirname,
    data: path.join(__dirname, '../data'),
    logs: path.join(__dirname, '../logs'),
    extractors: path.join(__dirname, 'extractors'),
    transformers: path.join(__dirname, 'transformers'),
    loaders: path.join(__dirname, 'loaders'),
  },

  // Output Files
  output: {
    embassaments: 'embassaments.json',
    precipitation: 'precipitation.json',
    metadata: 'metadata.json',
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/etl.log',
  },

  // Backend Configuration
  backend: {
    port: parseInt(process.env.BACKEND_PORT || '5000'),
    host: process.env.BACKEND_HOST || 'localhost',
  },

  // Environment
  environment: process.env.NODE_ENV || 'development',
};

export default config;
