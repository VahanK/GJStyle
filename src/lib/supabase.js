const SUPABASE_URL = 'https://ntlistqtcapssgfebxvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50bGlzdHF0Y2Fwc3NnZmVieHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzY5OTMsImV4cCI6MjA4OTI1Mjk5M30.92TYInIQg--yFrsc8DL6mc9feJAT052CINwG6MEjzHw';

export const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function sbFetch(path, opts = {}) {
  const { headers: extraHeaders, ...restOpts } = opts;
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...restOpts,
    headers: { ...HEADERS, ...extraHeaders },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Products CRUD ────────────────────────────────────────────────────────────
export async function updateProduct(id, data) {
  return sbFetch(`/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

// Soft delete — sets deleted_at instead of hard delete
export async function deleteProduct(id) {
  return sbFetch(`/products?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ deleted_at: new Date().toISOString() }),
  });
}

export async function createProduct(data) {
  return sbFetch('/products', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

export async function uploadProductImage(file, productId) {
  const ext = file.name.split('.').pop();
  const filename = `product-${productId}-${Date.now()}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${filename}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
}

export async function fetchAllProducts() {
  // Fetch in pages of 1000 (Supabase max)
  let all = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const rows = await sbFetch(
      `/products?select=id,name,category,sub_categories,plating,stones,image_url,price,notes&order=name.asc`,
      { headers: { Range: `${from}-${from + PAGE - 1}`, 'Range-Unit': 'items' } }
    );
    if (!rows || rows.length === 0) break;
    all = all.concat(rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// ── Clients ──────────────────────────────────────────────────────────────────
export async function fetchClients() {
  return sbFetch('/clients?select=*&order=name.asc');
}

export async function fetchClientByPassword(password) {
  const rows = await sbFetch(
    `/clients?password=eq.${encodeURIComponent(password)}&active=eq.true&select=*&limit=1`
  );
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function createClient(data) {
  return sbFetch('/clients', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

export async function updateClient(id, data) {
  return sbFetch(`/clients?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id) {
  return sbFetch(`/clients?id=eq.${id}`, { method: 'DELETE' });
}

// ── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(clientId, items, notes = '') {
  // Insert order
  const orders = await sbFetch('/orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ client_id: clientId, notes }),
  });
  const order = orders[0];

  // Insert items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    plating: item.plating,
    stone_color: item.stone_color,
    notes: item.notes || '',
  }));
  await sbFetch('/order_items', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(orderItems),
  });
  return order;
}

export async function fetchOrdersWithItems() {
  // Get orders with client info
  const orders = await sbFetch(
    '/orders?select=id,status,notes,created_at,clients(id,name),order_items(id,quantity,plating,stone_color,notes,products(id,name,category,image_url))&order=created_at.desc'
  );
  return orders;
}

export async function fetchClientOrders(clientId) {
  return sbFetch(
    `/orders?client_id=eq.${clientId}&select=id,status,notes,created_at,order_items(id,quantity,plating,stone_color,notes,products(id,name,category,image_url))&order=created_at.desc`
  );
}

export async function updateOrderStatus(orderId, status) {
  return sbFetch(`/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderAdmin(orderId, data) {
  return sbFetch(`/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
}

// ── Order Items ───────────────────────────────────────────────────────────────
export async function updateOrderItem(itemId, data) {
  return sbFetch(`/order_items?id=eq.${itemId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
}

export async function deleteOrderItem(itemId) {
  return sbFetch(`/order_items?id=eq.${itemId}`, { method: 'DELETE' });
}

export async function addOrderItem(data) {
  return sbFetch('/order_items', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

// ── Change Requests ───────────────────────────────────────────────────────────
export async function fetchChangeRequests(orderId) {
  const path = orderId
    ? `/order_change_requests?order_id=eq.${orderId}&order=created_at.desc&select=*`
    : `/order_change_requests?status=eq.pending&order=created_at.desc&select=*,orders(id,clients(id,name))`;
  return sbFetch(path);
}

export async function fetchAllPendingChangeRequests() {
  return sbFetch(
    `/order_change_requests?status=eq.pending&order=created_at.desc&select=*,orders(id,clients(id,name))`
  );
}

export async function createChangeRequest(data) {
  return sbFetch('/order_change_requests', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });
}

export async function updateChangeRequest(id, data) {
  return sbFetch(`/order_change_requests?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  });
}

// ── Order History ─────────────────────────────────────────────────────────────
export async function fetchOrderHistory(orderId) {
  return sbFetch(
    `/order_history?order_id=eq.${orderId}&order=created_at.desc&select=*`
  );
}

export async function addOrderHistory(orderId, changedBy, description) {
  return sbFetch('/order_history', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ order_id: orderId, changed_by: changedBy, description }),
  });
}

// Full orders for admin with new columns
export async function fetchOrdersWithItemsFull() {
  return sbFetch(
    '/orders?select=id,status,notes,admin_notes,due_date,contacted,payment_received,created_at,clients(id,name,whatsapp,instagram),order_items(id,quantity,plating,stone_color,notes,products(id,name,category,image_url,price))&order=created_at.desc'
  );
}

// Client orders (includes new columns for display)
export async function fetchClientOrdersFull(clientId) {
  return sbFetch(
    `/orders?client_id=eq.${clientId}&select=id,status,notes,due_date,created_at,order_items(id,quantity,plating,stone_color,notes,products(id,name,category,image_url,price))&order=created_at.desc`
  );
}
