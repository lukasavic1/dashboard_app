// Postinstall script to ensure Prisma binary is available
const fs = require('fs');
const path = require('path');

const prismaOutputPath = path.join(__dirname, '../app/generated/prisma');
const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
const binaryPath = path.join(prismaOutputPath, binaryName);

// Check if binary exists
if (fs.existsSync(binaryPath)) {
  console.log(`✅ Prisma binary found: ${binaryName}`);
  
  // Verify it's a file (not a directory)
  const stats = fs.statSync(binaryPath);
  if (stats.isFile()) {
    console.log(`✅ Binary file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // For Vercel, ensure the binary has proper permissions
    try {
      fs.chmodSync(binaryPath, 0o755);
    } catch (err) {
      // Ignore chmod errors (might not have permissions in some environments)
    }
  } else {
    console.warn(`⚠️  Binary path exists but is not a file`);
  }
} else {
  console.error(`❌ Prisma binary not found: ${binaryPath}`);
  console.error(`   This will cause issues in production.`);
  console.error(`   Make sure 'prisma generate' ran successfully.`);
  process.exit(1);
}
