import ETLPipeline from './pipeline.js';

/**
 * Main entry point for ETL execution
 */
async function main() {
  const fullSync = process.argv.includes('--full-sync');
  const pipeline = new ETLPipeline();

  try {
    const result = await pipeline.run(false, fullSync);

    if (result.success) {
      console.log('✅ All ETL tasks completed successfully!');
      process.exit(0);
    } else if (result.fallback) {
      console.log(`::warning::ETL completed with precipitation fallback: ${result.error}`);
      console.log('⚠️ Embassaments updated, precipitation served from cache (workflow will still push data)');
      process.exit(0);
    } else {
      console.error('❌ ETL pipeline failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error in ETL:', error);
    process.exit(1);
  }
}

main();
