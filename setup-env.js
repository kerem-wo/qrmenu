const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

try {
  // Generate secret key
  const secret = crypto.randomBytes(32).toString('base64');

  // .env file content
  const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"
`;

  // Write .env file
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env dosyası zaten mevcut. Mevcut secret key korunuyor.');
    process.exit(0);
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✅ .env dosyası oluşturuldu!');
  console.log('✅ Secret key otomatik olarak oluşturuldu ve eklendi.');
  console.log('');
} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
}
