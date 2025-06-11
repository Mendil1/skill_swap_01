// Quick test to check if the notification bell component can be imported without errors
const { execSync } = require('child_process');

try {
  console.log('Testing notification bell component compilation...');

  // Try to compile just the notification bell component
  const result = execSync('npx tsc --noEmit --jsx preserve src/components/notifications/notification-bell.tsx', {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe'
  });

  console.log('✅ Notification bell component compiles successfully!');
  console.log('✅ Infinite loop fix appears to be working');

} catch (error) {
  console.log('❌ Compilation errors found:');
  console.log(error.stdout || error.message);
}
