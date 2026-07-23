export function formatWhatsAppUrl(phone?: string | null, message?: string): string {
  if (!phone) return 'https://wa.me/';
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleanNumber}${query}`;
}

