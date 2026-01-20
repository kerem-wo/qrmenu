// Database migration script for Vercel
// Run this locally with: node scripts/migrate-db.js
// Make sure DATABASE_URL is set in your .env.local file

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migration...\n');

try {
  // Run prisma db push to sync schema with database
  console.log('📦 Pushing schema changes to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
  
  console.log('\n✅ Database migration completed successfully!');
  console.log('📝 The resetToken and resetTokenExpiry fields have been added to the Admin table.');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. DATABASE_URL is set in your .env.local file');
  console.log('   2. You have access to the database');
  console.log('   3. The database connection is working');
  process.exit(1);
}
