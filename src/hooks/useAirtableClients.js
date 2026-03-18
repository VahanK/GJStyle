const TOKEN = process.env.REACT_APP_AIRTABLE_TOKEN;
const BASE_ID = 'app41GZIvyEc1Jnek';

// Fetch all clients
export async function fetchClients(tableId) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  const data = await res.json();
  return data.records.map((r) => ({
    id: r.id,
    name: r.fields['Client Name'] || '',
    password: r.fields['Password'] || '',
    allowedCategories: r.fields['Allowed Categories'] || [],
    notes: r.fields['Notes'] || '',
    active: r.fields['Active'] || false,
  }));
}

// Create a new client
export async function createClient(tableId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields }],
    }),
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  return res.json();
}

// Update an existing client
export async function updateClient(tableId, recordId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  return res.json();
}

// Delete a client
export async function deleteClient(tableId, recordId) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
  return res.json();
}
