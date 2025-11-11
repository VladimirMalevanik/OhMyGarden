// Безопасный доступ к Telegram WebApp
export function getTelegramUser() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      const wa = window.Telegram.WebApp;
      wa.ready && wa.ready();
      return wa.initDataUnsafe?.user || null;
    }
  } catch (_) {}
  return null;
}
