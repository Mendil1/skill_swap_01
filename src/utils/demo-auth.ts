// DEMO HACK: Simple demo authentication for presentation
export function createDemoUser() {
  const demoUser = {
    id: 'demo-user-12345',
    email: 'demo@skillswap.com',
    full_name: 'Demo User',
    bio: 'This is a demo user for presentation',
    availability: 'Available for demo',
    profile_image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStorage.setItem('demo-user', JSON.stringify(demoUser));
  return demoUser;
}

export function isDemoMode() {
  return localStorage.getItem('demo-mode') === 'true';
}

export function enableDemoMode() {
  localStorage.setItem('demo-mode', 'true');
  createDemoUser();
}

export function disableDemoMode() {
  localStorage.removeItem('demo-mode');
  localStorage.removeItem('demo-user');
}
