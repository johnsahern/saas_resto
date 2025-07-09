export async function apiFetch(url: string, options?: any) {
  // Simple wrapper autour de fetch
  return fetch(url, options);
} 