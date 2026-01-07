// Postinstall script to ensure Prisma binary is available
const fs = require('fs');
const path = require('path');

// Check default Prisma output location
const prismaOutputPath = path.join(__dirname, '../node_modules/.prisma/client');
const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
const binaryPath = path.join(prismaOutputPath, binaryName);

// Check if binary exists
if (fs.existsSync(binaryPath)) {
  console.log(`✅ Prisma binary found: ${binaryName}`);
  
  // Verify it's a file (not a directory)
  const stats = fs.statSync(binaryPath);
  if (stats.isFile()) {
    console.log(`✅ Binary file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.warn(`⚠️  Binary path exists but is not a file`);
  }
} else {
  console.error(`❌ Prisma binary not found: ${binaryPath}`);
  console.error(`   This will cause issues in production.`);
  console.error(`   Make sure 'prisma generate' ran successfully.`);
  process.exit(1);
}
