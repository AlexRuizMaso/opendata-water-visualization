import ETLPipeline from './pipeline.js';

/**
 * Main entry point for ETL execution
 */
async function main() {
  const pipeline = new ETLPipeline();

  try {
    const result = await pipeline.run();

    if (result.success) {
      console.log('✅ All ETL tasks completed successfully!');
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
