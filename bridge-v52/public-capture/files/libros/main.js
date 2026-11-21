(() => {
  const value = window.BOOK_SALES?.mercadoPagoUrl;
  if (!value) return;
  let url;
  try { url = new URL(value); } catch { return; }
  const host = url.hostname;
  if (url.protocol !== 'https:' || url.username || url.password ||
      !(host === 'mpago.la' || host === 'mercadopago.com.ar' || host.endsWith('.mercadopago.com.ar'))) return;
  const link = document.createElement('a');
  link.className = 'button';
  link.href = url.href;
  link.textContent = 'Comprar con Mercado Pago ↗';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const slot = document.getElementById('payment-slot');
  slot.append(link);
  slot.hidden = false;
  document.getElementById('marketplace').className = 'text-link';
})();
