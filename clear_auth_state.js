/**
 * Clear Authentication State - Run this in browser console
 */

console.log('🧹 CLEARING AUTHENTICATION STATE');
console.log('================================');

// Clear localStorage
console.log('1. Clearing localStorage...');
const authKeys = Object.keys(localStorage).filter(key =>
  key.includes('supabase') || key.includes('auth') || key.includes('sb-')
);
console.log('Found auth keys:', authKeys);
authKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`   Removed: ${key}`);
});

// Clear sessionStorage
console.log('2. Clearing sessionStorage...');
const sessionAuthKeys = Object.keys(sessionStorage).filter(key =>
  key.includes('supabase') || key.includes('auth') || key.includes('sb-')
);
sessionAuthKeys.forEach(key => {
  sessionStorage.removeItem(key);
  console.log(`   Removed: ${key}`);
});

// Clear cookies (attempt - limited by same-origin policy)
console.log('3. Attempting to clear auth cookies...');
const cookies = document.cookie.split(';');
const authCookies = cookies.filter(cookie =>
  cookie.includes('sb-') || cookie.includes('supabase') || cookie.includes('auth')
);

authCookies.forEach(cookie => {
  const [name] = cookie.trim().split('=');
  // Attempt to clear cookie
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
  console.log(`   Attempted to clear: ${name}`);
});

console.log('4. Reloading page...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('✅ Auth state clearing complete. Page will reload in 1 second.');
