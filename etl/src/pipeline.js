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
   * @param {boolean} fullSync - Run full historical sync using Socrata pagination
   * @returns {Promise<Object>} Pipeline results
   */
  async run(skipHealthCheck = false, fullSync = false) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║           WATER DATA ETL PIPELINE START                ║');
    if (fullSync) {
      console.log('║   >>> MODE: FULL HISTORICAL SYNC (PAGINATED) <<<       ║');
    } else {
      console.log('║   >>> MODE: DAILY INCREMENTAL SYNC (FAST) <<<          ║');
    }
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
      let embassamentsRaw;
      if (fullSync) {
        embassamentsRaw = await this.embassamentExtractor.extractAll();
      } else {
        embassamentsRaw = await this.embassamentExtractor.extract();
      }
      this.results.embassamentsExtracted = embassamentsRaw.length;

      // Step 3: Extract Precipitation
      console.log('\n📋 STEP 3: Extract Precipitation Data\n');
      let precipitationRaw;
      if (fullSync) {
        precipitationRaw = await this.precipitationExtractor.extractAllPrecipitationOnly();
      } else {
        precipitationRaw = await this.precipitationExtractor.extractPrecipitationOnly();
      }
      this.results.precipitationExtracted = precipitationRaw.length;

      // Step 4: Transform Embassaments
      console.log('\n📋 STEP 4: Transform Embassaments Data\n');
      const embassamentsTransformed = this.embassamentTransformer.transform(embassamentsRaw);
      this.results.embassamentsTransformed = embassamentsTransformed.records.length;

      // Step 5: Transform Precipitation
      console.log('\n📋 STEP 5: Transform Precipitation Data\n');
      const precipitationTransformed = this.precipitationTransformer.transform(precipitationRaw);
      this.results.precipitationTransformed = precipitationTransformed.records.length;

      // Step 6: Load (Save) Embassaments with Incremental Merging
      console.log('\n📋 STEP 6: Merge and Load Embassaments (Full History)\n');
      
      const existingEmbassaments = this.loader.loadEmbassaments();
      let mergedEmbassamentsRecords = [];
      if (existingEmbassaments && Array.isArray(existingEmbassaments.records)) {
        mergedEmbassamentsRecords = [...existingEmbassaments.records];
      }
      
      const newEmbassamentsRecords = embassamentsTransformed.records;
      const embassamentsMap = new Map();
      
      // Load existing records first, then overwrite with new ones to keep them up to date
      mergedEmbassamentsRecords.forEach(r => embassamentsMap.set(r.id, r));
      newEmbassamentsRecords.forEach(r => embassamentsMap.set(r.id, r));
      
      let allEmbassaments = Array.from(embassamentsMap.values());
      
      // Sort by date descending (most recent first)
      allEmbassaments.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      embassamentsTransformed.records = allEmbassaments;
      embassamentsTransformed.totalRecords = allEmbassaments.length;
      embassamentsTransformed.statistics = this.embassamentTransformer.calculateStatistics(allEmbassaments);
      embassamentsTransformed.timestamp = new Date().toISOString();
      embassamentsTransformed.metadata.lastUpdated = new Date().toISOString();
      
      this.loader.saveEmbassaments(embassamentsTransformed);
      this.results.embassamentsSavedTotal = allEmbassaments.length;

      // Step 7: Load (Save) Precipitation with Incremental Merging and 2-Year Rolling Window + Yearly Splits
      console.log('\n📋 STEP 7: Merge, Archive and Load Precipitation (2-Year Rolling + Year Split)\n');
      
      const getPrecipitationKey = r => r.id || `${r.stationCode || r.stationName}-${r.variableCode}-${r.date}`;
      
      const existingPrecipitation = this.loader.loadPrecipitation();
      let mergedPrecipitationRecords = [];
      if (existingPrecipitation && Array.isArray(existingPrecipitation.records)) {
        mergedPrecipitationRecords = [...existingPrecipitation.records];
      }
      
      const newPrecipitationRecords = precipitationTransformed.records;
      const precipitationMap = new Map();
      
      // Load existing records first, then overwrite with new ones to keep them up to date
      mergedPrecipitationRecords.forEach(r => precipitationMap.set(getPrecipitationKey(r), r));
      newPrecipitationRecords.forEach(r => precipitationMap.set(getPrecipitationKey(r), r));
      
      let allPrecipitation = Array.from(precipitationMap.values());
      
      // Sort by date descending (most recent first)
      allPrecipitation.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 1. Archive full history to year-split files
      this.loader.savePrecipitationSplitByYear(allPrecipitation);
      
      // 2. Filter main file to exactly 2-year rolling window (Option 1)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      const twoYearsAgoTime = twoYearsAgo.getTime();
      
      const rollingPrecipitation = allPrecipitation.filter(r => {
        const recordTime = new Date(r.date).getTime();
        return recordTime >= twoYearsAgoTime;
      });
      
      const rollingPrecipitationOnly = rollingPrecipitation.filter(r => r.variableCode === '1300');
      
      precipitationTransformed.records = rollingPrecipitation;
      precipitationTransformed.precipitationOnly = rollingPrecipitationOnly;
      precipitationTransformed.totalRecords = rollingPrecipitation.length;
      precipitationTransformed.precipitationRecords = rollingPrecipitationOnly.length;
      precipitationTransformed.statistics = this.precipitationTransformer.calculateStatistics(rollingPrecipitationOnly);
      precipitationTransformed.timestamp = new Date().toISOString();
      precipitationTransformed.metadata.lastUpdated = new Date().toISOString();
      
      this.loader.savePrecipitation(precipitationTransformed);
      this.results.precipitationSavedTotal = rollingPrecipitation.length;
      this.results.precipitationArchivedTotal = allPrecipitation.length;

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
    console.log(`   ✅ Embassaments Saved (Full History): ${this.results.embassamentsSavedTotal}`);
    console.log(`   ✅ Precipitation Saved (2-Year Rolling): ${this.results.precipitationSavedTotal}`);
    console.log(`   🗄️  Precipitation Archived (All History): ${this.results.precipitationArchivedTotal}`);
    console.log(`   💾 Files Saved: Yearly archives + 3 main (embassaments, precipitation, metadata)\n`);
  }
}

export default ETLPipeline;
