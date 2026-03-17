// ===================================================================
// CORE — Integración con API RALOZ (endpoints públicos) + init
// ===================================================================

export const RalozAPI = {
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://raloz-web.onrender.com/api',
  isOnline: false,

  async ping() {
    try {
      const res = await fetch(`${this.baseURL}/health`, {
        signal: AbortSignal.timeout(4000),
      });
      this.isOnline = res.ok;
    } catch {
      this.isOnline = false;
    }
    return this.isOnline;
  },

  async get(endpoint) {
    try {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch { return null; }
  },

  async post(endpoint, body, timeoutMs = 25000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  },

  // Tienda online
  async getColegiosTienda()   { return this.get('/tienda/colegios'); },
  async getCatalogoTienda(id) { return this.get(`/tienda/catalogo/${id}`); },
  async reservar(data)        { return this.post('/tienda/reservar', data, 8000); },
  async crearPedido(data)     { return this.post('/tienda/pedido', data); },
  async consultarPedido(ref)  { return this.get(`/tienda/pedido/${encodeURIComponent(ref)}`); },

  // Compatibilidad con el resto del sitio
  async getColegios()      { return this.getColegiosTienda(); },
  async getCatalogo(id)    { return this.getCatalogoTienda(id); },
  async enviarPedido(data) { return this.crearPedido(data); },
};

// ─── Inicialización del indicador de estado de la API ────────────

export async function initRalozIntegration() {
  const apiDot  = document.getElementById('apiDot');
  const apiText = document.getElementById('apiStatusText');

  if (apiDot) apiDot.className = 'api-dot connecting';
  if (apiText) apiText.textContent = 'Conectando con RALOZ...';

  const online = await RalozAPI.ping();

  if (online) {
    if (apiDot) apiDot.className = 'api-dot online';
    if (apiText) apiText.textContent = 'Conectado con RALOZ — precios en tiempo real';

    const portalDot = document.querySelector('#portalStatus .status-dot');
    const portalTxt = document.querySelector('#portalStatus span:last-child');
    if (portalDot) portalDot.className = 'status-dot online';
    if (portalTxt) portalTxt.textContent = 'Sistema online — datos en tiempo real';

    const dashboard = await RalozAPI.getDashboard?.();
    if (dashboard) updatePortalCard(dashboard);
  } else {
    if (apiDot) apiDot.className = 'api-dot offline';
    if (apiText) apiText.textContent = 'Modo estático — precios locales';
  }
}

function updatePortalCard(data) {
  const stock      = data.total_stock ?? data.stock ?? '—';
  const ventas     = data.ventas_mes ?? data.ventas ?? '—';
  const pendientes = data.pedidos_pendientes ?? data.pendientes ?? '—';

  const stockEl  = document.getElementById('stockDisplay');
  const ventasEl = document.getElementById('ventasDisplay');
  const pendEl   = document.getElementById('pendientesDisplay');

  if (stockEl)  stockEl.textContent  = typeof stock === 'number' ? stock.toLocaleString() : stock;
  if (ventasEl) ventasEl.textContent = typeof ventas === 'number' ? ventas.toLocaleString() : ventas;
  if (pendEl)   pendEl.textContent   = typeof pendientes === 'number' ? pendientes.toLocaleString() : pendientes;
}
