import EmbassamentExtractor from './extractors/embassaments.js';
import PrecipitationExtractor from './extractors/precipitation.js';
import EmbassamentTransformer from './transformers/embassaments.js';
import PrecipitationTransformer from './transformers/precipitation.js';
import DataLoader from './loaders/fileLoader.js';
import APIHealthCheck from './utils/healthCheck.js';

/**
 * Main ETL Pipeline Orchestrator
 * Coordinates extraction, transformation, and loading of water data
 */
class ETLPipeline {
  constructor() {
    this.healthCheck = new APIHealthCheck();
    this.embassamentExtractor = new EmbassamentExtractor();
    this.precipitationExtractor = new PrecipitationExtractor();
    this.embassamentTransformer = new EmbassamentTransformer();
    this.precipitationTransformer = new PrecipitationTransformer();
    this.loader = new DataLoader();

    this.startTime = null;
    this.endTime = null;
    this.results = {};
  }

  /**
   * Run full ETL pipeline
   * @param {boolean} skipHealthCheck - Skip API health check
   * @returns {Promise<Object>} Pipeline results
   */
  async run(skipHealthCheck = false) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           WATER DATA ETL PIPELINE START                ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    this.startTime = Date.now();

    try {
      // Step 1: Health Check
      if (!skipHealthCheck) {
        console.log('📋 STEP 1: API Health Check\n');
        const health = await this.healthCheck.runFullHealthCheck();
        
        if (!health.allApisHealthy) {
          throw new Error('One or more APIs are unhealthy. Aborting ETL pipeline.');
        }
      }

      // Step 2: Extract Embassaments
      console.log('\n📋 STEP 2: Extract Embassaments Data\n');
      const embassamentsRaw = await this.embassamentExtractor.extract();
      this.results.embassamentsExtracted = embassamentsRaw.length;

      // Step 3: Extract Precipitation
      console.log('\n📋 STEP 3: Extract Precipitation Data\n');
      const precipitationRaw = await this.precipitationExtractor.extractPrecipitationOnly();
      this.results.precipitationExtracted = precipitationRaw.length;

      // Step 4: Transform Embassaments
      console.log('\n📋 STEP 4: Transform Embassaments Data\n');
      const embassamentsTransformed = this.embassamentTransformer.transform(embassamentsRaw);
      this.results.embassamentsTransformed = embassamentsTransformed.records.length;

      // Step 5: Transform Precipitation
      console.log('\n📋 STEP 5: Transform Precipitation Data\n');
      const precipitationTransformed = this.precipitationTransformer.transform(precipitationRaw);
      this.results.precipitationTransformed = precipitationTransformed.records.length;

      // Step 6: Load (Save) Embassaments
      console.log('\n📋 STEP 6: Load Embassaments to File\n');
      this.loader.saveEmbassaments(embassamentsTransformed);

      // Step 7: Load (Save) Precipitation
      console.log('\n📋 STEP 7: Load Precipitation to File\n');
      this.loader.savePrecipitation(precipitationTransformed);

      // Step 8: Save Metadata
      console.log('\n📋 STEP 8: Save Pipeline Metadata\n');
      const metadata = this.generateMetadata(embassamentsTransformed, precipitationTransformed);
      this.loader.saveMetadata(metadata);

      // Step 9: Cleanup
      console.log('\n📋 STEP 9: Cleanup\n');
      this.loader.cleanOldBackups(30); // Keep 30 days of backups
      const stats = this.loader.getStatistics();
      console.log(`📊 Data Directory Stats: ${stats.mainFiles} files, ${stats.backupFiles} backups, ${stats.totalSizeMB} MB\n`);

      this.endTime = Date.now();
      this.printSummary();

      return {
        success: true,
        timestamp: new Date().toISOString(),
        duration: `${((this.endTime - this.startTime) / 1000).toFixed(2)}s`,
        results: this.results,
      };
    } catch (error) {
      this.endTime = Date.now();
      console.error('\n❌ ETL Pipeline Failed:', error.message);

      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: error.message,
        duration: `${((this.endTime - this.startTime) / 1000).toFixed(2)}s`,
      };
    }
  }

  /**
   * Run only embassaments ETL
   */
  async runEmbassaments() {
    console.log('\n🏊 Running Embassaments-Only ETL Pipeline\n');

    try {
      const raw = await this.embassamentExtractor.extract();
      const transformed = this.embassamentTransformer.transform(raw);
      this.loader.saveEmbassaments(transformed);

      console.log('✅ Embassaments ETL completed successfully');
      return transformed;
    } catch (error) {
      console.error('❌ Embassaments ETL failed:', error.message);
      throw error;
    }
  }

  /**
   * Run only precipitation ETL
   */
  async runPrecipitation() {
    console.log('\n🌧️  Running Precipitation-Only ETL Pipeline\n');

    try {
      const raw = await this.precipitationExtractor.extractPrecipitationOnly();
      const transformed = this.precipitationTransformer.transform(raw);
      this.loader.savePrecipitation(transformed);

      console.log('✅ Precipitation ETL completed successfully');
      return transformed;
    } catch (error) {
      console.error('❌ Precipitation ETL failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate metadata about the ETL run
   */
  generateMetadata(embassaments, precipitation) {
    return {
      timestamp: new Date().toISOString(),
      pipelineVersion: '1.0',
      duration: `${((this.endTime - this.startTime) / 1000).toFixed(2)}s`,
      statistics: {
        embassaments: embassaments.statistics,
        precipitation: precipitation.statistics,
      },
      dataFiles: {
        embassaments: `${process.env.EMBASSAMENTS_DATASET_ID}.json`,
        precipitation: `${process.env.PRECIPITATION_DATASET_ID}.json`,
      },
      sources: {
        embassaments: 'https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json',
        precipitation: 'https://analisi.transparenciacatalunya.cat/resource/7bvh-jvq2.json',
      },
    };
  }

  /**
   * Print summary of ETL run
   */
  printSummary() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           ETL PIPELINE COMPLETED SUCCESSFULLY          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📊 SUMMARY:');
    console.log(`   ⏱️  Duration: ${((this.endTime - this.startTime) / 1000).toFixed(2)}s`);
    console.log(`   📥 Embassaments Extracted: ${this.results.embassamentsExtracted}`);
    console.log(`   📥 Precipitation Extracted: ${this.results.precipitationExtracted}`);
    console.log(`   ✅ Embassaments Transformed: ${this.results.embassamentsTransformed}`);
    console.log(`   ✅ Precipitation Transformed: ${this.results.precipitationTransformed}`);
    console.log(`   💾 Files Saved: 3 (embassaments, precipitation, metadata)\n`);
  }
}

export default ETLPipeline;
