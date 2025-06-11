// Quick test to verify all session functions are properly exported
const fs = require('fs');
const path = require('path');

const sessionsFile = path.join(__dirname, 'src/lib/actions/sessions.ts');
const content = fs.readFileSync(sessionsFile, 'utf8');

const exports = [
  'createOneOnOneSession',
  'createGroupSession',
  'joinGroupSession',
  'cancelSession',
  'rescheduleSession',
  'cancelGroupSession',
  'getUserConnections',
  'getUserSessions'
];

console.log('Checking exports in sessions.ts:');
exports.forEach(exportName => {
  const exportPattern = new RegExp(`export\\s+async\\s+function\\s+${exportName}|export\\s+function\\s+${exportName}`);
  if (exportPattern.test(content)) {
    console.log(`✅ ${exportName} - EXPORTED`);
  } else {
    console.log(`❌ ${exportName} - NOT FOUND`);
  }
});

console.log('\nSessions module exports verification complete!');
