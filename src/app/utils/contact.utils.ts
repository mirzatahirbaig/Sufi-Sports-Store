export function formatWhatsAppUrl(phone?: string | null): string {
  if (!phone) return 'https://wa.me/';
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}`;
}
