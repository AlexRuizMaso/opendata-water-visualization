import APIHealthCheck from './src/utils/healthCheck.js';

/**
 * Health Check Script
 * Run to verify API connectivity without running full ETL
 */
async function main() {
  console.log('\n🔍 Running Health Check on Water Data APIs\n');

  const healthCheck = new APIHealthCheck();

  try {
    const result = await healthCheck.getDetailedStatus();
    
    console.log('\nResult:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

main();
