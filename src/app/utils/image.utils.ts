import { environment } from '../../environments/environment';

export function resolveImageUrl(url: string | undefined, fallback: string = 'images/product_fallback.jpg'): string {
  if (!url || url.trim() === '') {
    return fallback;
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('assets/') || url.startsWith('images/')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${environment.apiUrl}${cleanPath}`;
}
