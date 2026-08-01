const crypto = require('crypto');
const sss = require('shamirs-secret-sharing');

function generateShares() {
  console.log('====================================');
  console.log(' PHOENIX BANK KEY CEREMONY SETUP');
  console.log('====================================\n');

  // Generate a cryptographically random 32-byte master key
  const masterKey = crypto.randomBytes(32);
  
  console.log('--- CRITICAL: DO NOT SAVE THIS OUTPUT ---');
  console.log('Master Key (Hex):', masterKey.toString('hex'));
  console.log('-----------------------------------------\n');

  // Split into 5 shares, requiring 3 to reconstruct
  const shares = sss.split(masterKey, { shares: 5, threshold: 3 });

  console.log('Distribute these 5 shares to 5 different key custodians:');
  shares.forEach((share, index) => {
    console.log(`Share ${index + 1}: ${share.toString('hex')}`);
  });
  
  console.log('\n====================================');
  console.log('Instructions:');
  console.log('1. Print or securely transmit one share to each of the 5 custodians.');
  console.log('2. Require at least 3 custodians to be present to run the Key Ceremony.');
  console.log('3. Close this terminal to clear the master key from memory.');
}

generateShares();
