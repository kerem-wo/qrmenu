// Secret key oluşturucu
// Node.js ile çalıştırın: node generate-secret.js

const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log('\n✅ Secret Key oluşturuldu:\n');
console.log(secret);
console.log('\nBu key\'i .env dosyasındaki NEXTAUTH_SECRET değişkenine yapıştırın.\n');
