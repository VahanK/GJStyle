import { useState, useEffect, useCallback, useRef } from 'react';
import { useProducts } from '../App';
import {
  fetchClients, createClient, updateClient, deleteClient,
  fetchOrdersWithItemsFull, updateOrderAdmin,
  updateOrderItem, deleteOrderItem, addOrderItem,
  fetchAllPendingChangeRequests, fetchChangeRequests, updateChangeRequest,
  fetchOrderHistory, addOrderHistory,
  updateProduct, deleteProduct, createProduct, uploadProductImage,
} from '../lib/supabase';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon,
  ShoppingBagIcon, UsersIcon, ChevronDownIcon, ChevronRightIcon,
  CubeIcon, MagnifyingGlassIcon, PhotoIcon, BellIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const ALL_CATEGORIES = ['Earrings','Rings','Bracelets','Necklaces','Sets','Pendants','Armlets','Shambala'];

const EMPTY_FORM = {
  name: '', password: '', email: '', country: '', instagram: '', whatsapp: '',
  allowed_categories: [], allowed_subcategories: [], allowed_product_ids: [],
  notes: '', active: true,
};

const STATUS_COLORS = {
  pending:   'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped:   'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

const DEFAULT_PLATINGS = ['gold', 'silver', 'black', 'rose gold'];
const DEFAULT_STONES = ['clear', 'ruby red', 'sapphire blue', 'emerald green', 'amethyst purple', 'topaz yellow'];

// Reusable chip-based tag editor: shows existing chips with × to remove, text input to add new
const STONE_COLORS = {
  'clear': { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' },
  'ruby red': { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c' },
  'sapphire blue': { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  'emerald green': { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  'amethyst purple': { bg: '#faf5ff', border: '#d8b4fe', text: '#7e22ce' },
  'topaz yellow': { bg: '#fefce8', border: '#fde047', text: '#a16207' },
  'turquoise': { bg: '#f0fdfa', border: '#5eead4', text: '#0f766e' },
  'green jade': { bg: '#f0fdf4', border: '#4ade80', text: '#166534' },
  'black onyx': { bg: '#f1f5f9', border: '#64748b', text: '#1e293b' },
  'mother of pearl': { bg: '#fdf4ff', border: '#e879f9', text: '#86198f' },
  'lapis lazuli': { bg: '#eef2ff', border: '#818cf8', text: '#3730a3' },
  'aqua blue': { bg: '#ecfeff', border: '#67e8f9', text: '#0e7490' },
  'light purple': { bg: '#faf5ff', border: '#c4b5fd', text: '#6d28d9' },
  'light green': { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  'fresh water pearl': { bg: '#fdf4ff', border: '#f0abfc', text: '#86198f' },
  'pearl': { bg: '#fdf4ff', border: '#e879f9', text: '#86198f' },
  'orange': { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  'pink': { bg: '#fdf2f8', border: '#f9a8d4', text: '#be185d' },
  'white': { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' },
};

function stoneStyle(val, selected) {
  const c = STONE_COLORS[val.toLowerCase()];
  if (!c) return null;
  if (selected) return { backgroundColor: c.bg, borderColor: c.border, color: c.text, fontWeight: 600 };
  return { backgroundColor: c.bg, borderColor: c.border, color: c.text, opacity: 0.5 };
}

function TagEditor({ label, values, onChange, suggestions }) {
  const [input, setInput] = useState('');
  const isStones = label === 'Stone Colors';

  function toggle(val) {
    if (values.includes(val)) {
      onChange(values.filter((x) => x !== val));
    } else {
      onChange([...values, val]);
    }
  }

  function addCustom() {
    const v = input.trim();
    if (!v || values.includes(v)) { setInput(''); return; }
    onChange([...values, v]);
    setInput('');
  }

  // Custom values = ones not in suggestions
  const customValues = values.filter((v) => !suggestions.includes(v));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Suggestion pills — always visible, toggle on/off */}
      {suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {suggestions.map((s) => {
            const selected = values.includes(s);
            const colorStyle = isStones ? stoneStyle(s, selected) : null;
            return (
              <button key={s} type="button" onClick={() => toggle(s)}
                style={colorStyle || undefined}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  colorStyle ? '' : selected
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                }`}>
                {selected ? '✓ ' : '+ '}{s}
              </button>
            );
          })}
        </div>
      )}

      {/* Custom values (not in suggestions) shown as removable chips */}
      {customValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {customValues.map((v) => {
            const colorStyle = isStones ? stoneStyle(v, true) : null;
            return (
              <span key={v} style={colorStyle || undefined}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${colorStyle ? '' : 'bg-gray-900 text-white border-gray-900'}`}>
                {v}
                <button type="button" onClick={() => toggle(v)} className="ml-0.5 opacity-60 hover:opacity-100 leading-none">×</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Custom input */}
      <div className="flex gap-2 mt-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder="Custom value…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-gray-400 focus:outline-none" />
        <button type="button" onClick={addCustom}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Add</button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('clients');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products, clients, and orders.</p>
        </div>
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {[
            ['clients', <UsersIcon className="h-4 w-4" key="u" />, 'Clients'],
            ['products', <CubeIcon className="h-4 w-4" key="p" />, 'Products'],
            ['orders', <ShoppingBagIcon className="h-4 w-4" key="s" />, 'Orders'],
          ].map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>
        {tab === 'clients' && <ClientsTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab />}
      </div>
    </div>
  );
}

// Searchable individual product picker for client visibility
function IndividualProductsPicker({ allProducts, selectedIds, onChange }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [open, setOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category))).sort()];
  const filtered = allProducts.filter((p) => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  }

  const selectedProducts = allProducts.filter((p) => selectedIds.includes(p.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Individual Products</h3>
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="text-xs text-gray-500 underline hover:text-gray-800">
          {open ? 'Hide picker' : `Pick products${selectedIds.length ? ` (${selectedIds.length} selected)` : ''}`}
        </button>
      </div>

      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedProducts.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
              {p.name}
              <button type="button" onClick={() => toggle(p.id)} className="ml-0.5 hover:text-blue-600 leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-200">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gray-400 focus:outline-none" />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none bg-white">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 max-h-96 overflow-y-auto">
            {filtered.slice(0, 150).map((p) => {
              const sel = selectedIds.includes(p.id);
              return (
                <button key={p.id} type="button" onClick={() => toggle(p.id)}
                  className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${sel ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-200'}`}>
                  {/* Checkbox badge */}
                  <div className={`absolute top-2 left-2 z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center shadow ${sel ? 'border-blue-500 bg-blue-500' : 'border-white bg-white/80'}`}>
                    {sel && <span className="block h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                  {/* Image */}
                  <div className="h-28 bg-gray-100 overflow-hidden">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                      : <div className="h-full flex items-center justify-center text-2xl opacity-20">💍</div>}
                  </div>
                  {/* Name */}
                  <div className={`px-2 py-1.5 text-xs font-medium truncate ${sel ? 'bg-blue-50 text-blue-800' : 'bg-white text-gray-700'}`}>
                    {p.name}
                  </div>
                </button>
              );
            })}
            {filtered.length > 150 && (
              <p className="col-span-full px-3 py-2 text-xs text-gray-400 text-center">Showing 150 of {filtered.length} — search to narrow down</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLIENTS TAB ──────────────────────────────────────────────────────────────
function ClientsTab() {
  const { products } = useProducts();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  // Build subcategory map from products
  const subcatsByCategory = {};
  products.forEach((p) => {
    if (!subcatsByCategory[p.category]) subcatsByCategory[p.category] = new Set();
    (p.sub_categories || []).forEach((s) => subcatsByCategory[p.category].add(s));
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setClients(await fetchClients()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name || '', password: c.password || '',
      email: c.email || '', country: c.country || '',
      instagram: c.instagram || '', whatsapp: c.whatsapp || '',
      allowed_categories: c.allowed_categories || [],
      allowed_subcategories: c.allowed_subcategories || [],
      allowed_product_ids: c.allowed_product_ids || [],
      notes: c.notes || '', active: c.active !== false,
    });
    setShowForm(true);
  }

  function toggleCategory(cat) {
    setForm((f) => {
      const has = f.allowed_categories.includes(cat);
      const cats = has ? f.allowed_categories.filter((c) => c !== cat) : [...f.allowed_categories, cat];
      const subs = has
        ? f.allowed_subcategories.filter((s) => !(subcatsByCategory[cat] || new Set()).has(s))
        : f.allowed_subcategories;
      return { ...f, allowed_categories: cats, allowed_subcategories: subs };
    });
  }

  function toggleSubcat(cat, sub) {
    setForm((f) => {
      const hasSub = f.allowed_subcategories.includes(sub);
      const cats = !hasSub && !f.allowed_categories.includes(cat)
        ? [...f.allowed_categories, cat] : f.allowed_categories;
      return {
        ...f, allowed_categories: cats,
        allowed_subcategories: hasSub
          ? f.allowed_subcategories.filter((s) => s !== sub)
          : [...f.allowed_subcategories, sub],
      };
    });
  }

  function selectAll() {
    setForm((f) => ({
      ...f,
      allowed_categories: [...ALL_CATEGORIES],
      allowed_subcategories: Object.values(subcatsByCategory).flatMap((s) => [...s]),
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('Name required.');
    if (!form.password.trim()) return alert('Password required.');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), password: form.password.trim(),
        email: form.email.trim() || null, country: form.country.trim() || null,
        instagram: form.instagram.trim() || null, whatsapp: form.whatsapp.trim() || null,
        allowed_categories: form.allowed_categories,
        allowed_subcategories: form.allowed_subcategories,
        allowed_product_ids: form.allowed_product_ids,
        notes: form.notes, active: form.active,
      };
      if (editing) await updateClient(editing.id, payload);
      else await createClient(payload);
      setShowForm(false);
      await load();
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(c) {
    setSaving(true);
    try { await deleteClient(c.id); setDeleteConfirm(null); await load(); }
    catch (e) { alert('Delete failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function toggleActive(c) {
    try { await updateClient(c.id, { active: !c.active }); await load(); }
    catch (e) { alert('Update failed: ' + e.message); }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{clients.length} clients</p>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          <PlusIcon className="h-4 w-4" /> Add Client
        </button>
      </div>

      {loading && <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" /></div>}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!loading && clients.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">No clients yet.</div>}

      {!loading && clients.length > 0 && (
        <div className="space-y-2">
          {clients.map((c) => {
            // Count visible products per category for this client
            const catCounts = {};
            (c.allowed_categories || []).forEach((cat) => {
              const catProds = products.filter((p) => p.category === cat);
              const clientSubs = (c.allowed_subcategories || []);
              const catSubs = [...new Set(catProds.flatMap((p) => p.sub_categories || []))];
              const relevantSubs = clientSubs.filter((s) => catSubs.includes(s));
              const count = relevantSubs.length > 0
                ? catProds.filter((p) => (p.sub_categories || []).some((s) => clientSubs.includes(s))).length
                : catProds.length;
              catCounts[cat] = count;
            });
            const totalIndividual = (c.allowed_product_ids || []).length;
            const hasAllCats = (c.allowed_categories || []).length === ALL_CATEGORIES.length;

            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                {/* Left: name + country + notes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{c.name}</span>
                    {c.country && <span className="text-xs text-gray-400">{c.country}</span>}
                    <button onClick={() => toggleActive(c)}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${c.active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {c.active ? <><CheckCircleIcon className="h-3 w-3"/>Active</> : <><XCircleIcon className="h-3 w-3"/>Inactive</>}
                    </button>
                  </div>

                  {/* Access: category badges with product counts */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(c.allowed_categories || []).length === 0 ? (
                      <span className="text-xs text-red-400">No access</span>
                    ) : hasAllCats ? (
                      <span className="rounded-full bg-green-50 text-green-700 border border-green-100 px-2.5 py-0.5 text-xs font-medium">All categories</span>
                    ) : (
                      (c.allowed_categories || []).map((cat) => (
                        <span key={cat} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                          {cat}
                          <span className="font-semibold text-gray-500">{catCounts[cat] ?? 0}</span>
                        </span>
                      ))
                    )}
                    {totalIndividual > 0 && (
                      <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 text-xs">
                        +{totalIndividual} individual
                      </span>
                    )}
                  </div>

                  {c.notes && <p className="text-xs text-gray-400 mt-1 truncate">{c.notes}</p>}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(c)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl my-4">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? `Edit — ${editing.name}` : 'New Client'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Basic info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Basic Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Boutique Lara"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="lara2024"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      placeholder="Lebanon"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="client@example.com"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input type="text" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+961 70 000 000"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input type="text" value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                      placeholder="@boutiquelara"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product Visibility</h3>
                  <div className="flex gap-3 text-xs">
                    <button onClick={selectAll} className="text-gray-500 underline hover:text-gray-800">Select all</button>
                    <button onClick={() => setForm((f) => ({ ...f, allowed_categories: [], allowed_subcategories: [], allowed_product_ids: [] }))}
                      className="text-gray-500 underline hover:text-gray-800">Clear all</button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {ALL_CATEGORIES.map((cat) => {
                    const subcats = [...(subcatsByCategory[cat] || [])].sort();
                    const catSelected = form.allowed_categories.includes(cat);
                    const isExpanded = expandedCat === cat;
                    const selectedSubs = subcats.filter((s) => form.allowed_subcategories.includes(s));

                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white">
                          <button onClick={() => toggleCategory(cat)}
                            className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${catSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                            {catSelected && <span className="block h-2 w-2 rounded-sm bg-white" />}
                          </button>
                          <span className="flex-1 text-sm font-medium text-gray-800">{cat}</span>
                          {selectedSubs.length > 0 && (
                            <span className="text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                              {selectedSubs.length}/{subcats.length} subcats
                            </span>
                          )}
                          {subcats.length > 0 && (
                            <button onClick={() => setExpandedCat(isExpanded ? null : cat)} className="text-gray-400 hover:text-gray-700">
                              {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                        {isExpanded && subcats.length > 0 && (
                          <div className="bg-gray-50 border-t border-gray-100 px-4 py-2 grid grid-cols-2 gap-1">
                            {subcats.map((sub) => {
                              const subSel = form.allowed_subcategories.includes(sub);
                              return (
                                <button key={sub} onClick={() => toggleSubcat(cat, sub)}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-left transition-colors ${subSel ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                                  <span className={`h-3 w-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${subSel ? 'border-white bg-white' : 'border-gray-400'}`}>
                                    {subSel && <span className="block h-1.5 w-1.5 rounded-sm bg-gray-900" />}
                                  </span>
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual products */}
              <IndividualProductsPicker
                allProducts={products}
                selectedIds={form.allowed_product_ids}
                onChange={(ids) => setForm((f) => ({ ...f, allowed_product_ids: ids }))}
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Internal notes…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none" />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${form.active ? 'bg-gray-900' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">Active — client can log in</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete client?</h3>
            <p className="text-sm text-gray-500 mb-6">Permanently removes <strong>{deleteConfirm.name}</strong> and revokes access.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── PRODUCTS TAB ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const { products: ctxProducts, allProducts } = useProducts();
  // Use allProducts (unfiltered) in admin so we see everything
  const source = allProducts || ctxProducts;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [missingOnly, setMissingOnly] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localProducts, setLocalProducts] = useState(null);
  const fileInputRef = useRef(null);

  const products = localProducts || source;

  // Dynamic suggestions: merge defaults with all values already saved across products
  const allPlatingSuggestions = [...new Set([...DEFAULT_PLATINGS, ...products.flatMap((p) => p.plating || [])])].sort();
  const allStoneSuggestions = [...new Set([...DEFAULT_STONES, ...products.flatMap((p) => p.stones || [])])].sort();

  // A product "needs stones" if any of its subcategories mention "stone"
  function needsStones(p) {
    return (p.sub_categories || []).some((s) => /stone/i.test(s));
  }

  const filtered = products.filter((p) => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const missingStonesFlag = needsStones(p) && !(p.stones?.length);
    const matchMissing = !missingOnly || !p.price || !(p.plating?.length) || missingStonesFlag;
    return matchCat && matchSearch && matchMissing;
  });

  const missingCount = products.filter((p) => !p.price || !(p.plating?.length) || (needsStones(p) && !(p.stones?.length))).length;
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()];

  function openEdit(p, index) {
    const allSubcats = [...new Set(products.filter((x) => x.category === p.category).flatMap((x) => x.sub_categories || []))].sort();
    setEditing({
      ...p,
      plating: [...(p.plating || [])],
      stones: [...(p.stones || [])],
      sub_categories: [...(p.sub_categories || [])],
      _allSubcats: allSubcats,
    });
    setEditingIndex(index ?? filtered.findIndex((x) => x.id === p.id));
  }

  function goNext() {
    const next = editingIndex + 1;
    if (next < filtered.length) openEdit(filtered[next], next);
  }
  function goPrev() {
    const prev = editingIndex - 1;
    if (prev >= 0) openEdit(filtered[prev], prev);
  }

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!editing) return;
    function onKey(e) {
      if (e.key === 'Escape') setEditing(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  async function handleSave(andNext = false) {
    if (!editing) return;
    setSaving(true);
    try {
      await updateProduct(editing.id, {
        name: editing.name,
        price: editing.price || null,
        plating: editing.plating,
        stones: editing.stones,
        sub_categories: editing.sub_categories,
        category: editing.category,
        notes: editing.notes,
        image_url: editing.image_url,
      });
      setLocalProducts((prev) => (prev || source).map((p) => p.id === editing.id ? { ...p, ...editing } : p));
      if (andNext && editingIndex + 1 < filtered.length) {
        // Move to next — use updated local list
        const updatedFiltered = (localProducts || source).map((p) => p.id === editing.id ? { ...p, ...editing } : p).filter((p) => {
          const matchCat = catFilter === 'All' || p.category === catFilter;
          const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
          const matchMissing = !missingOnly || !p.price || !(p.plating?.length) || (needsStones(p) && !(p.stones?.length));
          return matchCat && matchSearch && matchMissing;
        });
        const nextP = updatedFiltered[editingIndex + 1] || updatedFiltered[editingIndex];
        if (nextP) openEdit(nextP, editingIndex + 1 < updatedFiltered.length ? editingIndex + 1 : editingIndex);
        else setEditing(null);
      } else {
        setEditing(null);
      }
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !editing) return;
    setSaving(true);
    try {
      const url = await uploadProductImage(file, editing.id);
      setEditing((ed) => ({ ...ed, image_url: url }));
    } catch (e) { alert('Image upload failed: ' + e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(p) {
    setSaving(true);
    try {
      await deleteProduct(p.id);
      setLocalProducts((prev) => (prev || source).filter((x) => x.id !== p.id));
      setDeleteConfirm(null);
    } catch (e) { alert('Delete failed: ' + e.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-gray-400 focus:outline-none w-56" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setMissingOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${missingOnly ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50'}`}>
            ⚠ Missing data {missingOnly ? `(${filtered.length})` : `(${missingCount})`}
          </button>
          <span className="text-sm text-gray-400">{filtered.length} products</span>
        </div>
        <button onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          <PlusIcon className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((p, index) => {
          const missingPrice = !p.price;
          const missingPlating = !(p.plating?.length);
          const missingStones = needsStones(p) && !(p.stones?.length);
          const hasMissing = missingPrice || missingPlating || missingStones;
          return (
          <div key={p.id} className={`group bg-white rounded-xl border shadow-sm overflow-hidden ${hasMissing ? 'border-amber-200' : 'border-gray-100'}`}>
            <div className="relative h-44 bg-gray-50 overflow-hidden">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                : <div className="h-full flex items-center justify-center text-3xl opacity-20">💍</div>}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-800 truncate mb-1">{p.name}</p>
              <p className="text-xs text-gray-400 mb-1">{p.category}</p>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {p.price ? `$${Number(p.price).toFixed(2)}` : <span className="text-xs text-amber-500 font-normal italic">No price</span>}
              </p>
              {missingStones && (
                <p className="text-xs text-amber-500 italic mb-1">No stone colors</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => openEdit(p, index)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                  <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(p)}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl my-4">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex gap-1">
                  <button onClick={goPrev} disabled={editingIndex === 0}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30">←</button>
                  <button onClick={goNext} disabled={editingIndex >= filtered.length - 1}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30">→</button>
                </div>
                <span className="text-xs text-gray-400">{editingIndex + 1} / {filtered.length}</span>
                <h2 className="text-base font-semibold text-gray-900 truncate">{editing.name}</h2>
              </div>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none ml-4">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-36 w-36 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                    {editing.image_url
                      ? <img src={editing.image_url} alt="" className="h-full w-full object-contain" />
                      : <div className="h-full flex items-center justify-center text-2xl opacity-20">💍</div>}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    <PhotoIcon className="h-4 w-4" />
                    {saving ? 'Uploading…' : 'Change Image'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={editing.name}
                    onChange={(e) => setEditing((ed) => ({ ...ed, name: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={editing.price || ''}
                    onChange={(e) => setEditing((ed) => ({ ...ed, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={editing.category}
                  onChange={(e) => setEditing((ed) => ({ ...ed, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none">
                  {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Subcategories */}
              <TagEditor
                label="Subcategories"
                values={editing.sub_categories}
                onChange={(v) => setEditing((ed) => ({ ...ed, sub_categories: v }))}
                suggestions={[...new Set((editing._allSubcats || []))]}
              />

              {/* Plating */}
              <TagEditor
                label="Plating Options"
                values={editing.plating}
                onChange={(v) => setEditing((ed) => ({ ...ed, plating: v }))}
                suggestions={allPlatingSuggestions}
              />

              {/* Stones */}
              <TagEditor
                label="Stone Colors"
                values={editing.stones}
                onChange={(v) => setEditing((ed) => ({ ...ed, stones: v }))}
                suggestions={allStoneSuggestions}
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={editing.notes || ''} rows={2}
                  onChange={(e) => setEditing((ed) => ({ ...ed, notes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <div className="flex gap-2">
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editingIndex < filtered.length - 1 && (
                  <button onClick={() => handleSave(true)} disabled={saving}
                    className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save & Next →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {showAddForm && (
        <AddProductModal
          allProducts={products}
          platingSuggestions={allPlatingSuggestions}
          stoneSuggestions={allStoneSuggestions}
          onClose={() => setShowAddForm(false)}
          onCreated={(newP) => {
            setLocalProducts((prev) => [newP, ...(prev || source)]);
            setShowAddForm(false);
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete product?</h3>
            <p className="text-sm text-gray-500 mb-6">Permanently removes <strong>{deleteConfirm.name}</strong>. Cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function generateNextName(category, allProducts) {
  // Get prefix: first word of category (e.g. "Earring", "Ring", "Bracelet")
  const prefix = category.replace(/s$/, ''); // remove trailing s: Earrings→Earring, Rings→Ring
  const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  const existing = allProducts
    .map((p) => { const m = p.name.match(pattern); return m ? parseInt(m[1], 10) : null; })
    .filter((n) => n !== null);
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  const next = String(max + 1).padStart(3, '0');
  return `${prefix}-${next}`;
}

function AddProductModal({ onClose, onCreated, allProducts, platingSuggestions, stoneSuggestions }) {
  // Dynamic categories from existing products
  const dynamicCategories = [...new Set(allProducts.map((p) => p.category))].sort();
  const initialCategory = dynamicCategories[0] || 'Earrings';

  const [form, setForm] = useState(() => ({
    name: generateNextName(initialCategory, allProducts),
    category: initialCategory, price: '', plating: [], stones: [], sub_categories: [], notes: '', image_url: '',
  }));
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  // Dynamic subcategories for the selected category
  const subcatSuggestions = [...new Set(
    allProducts.filter((p) => p.category === form.category).flatMap((p) => p.sub_categories || [])
  )].sort();

  function handleCategoryChange(cat) {
    const autoName = generateNextName(cat, allProducts);
    setForm((f) => ({ ...f, category: cat, name: autoName, sub_categories: [] }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadProductImage(file, `new-${Date.now()}`);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) { alert('Upload failed: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!form.name.trim()) return alert('Name required.');
    setSaving(true);
    try {
      const rows = await createProduct({
        name: form.name.trim(),
        category: form.category,
        price: form.price ? Number(form.price) : null,
        plating: form.plating,
        stones: form.stones,
        sub_categories: form.sub_categories,
        notes: form.notes,
        image_url: form.image_url || null,
      });
      onCreated(rows[0]);
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl my-4">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">Add Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                {form.image_url
                  ? <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                  : <div className="h-full flex items-center justify-center"><PhotoIcon className="h-8 w-8 text-gray-300" /></div>}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <PhotoIcon className="h-4 w-4" /> {saving ? 'Uploading…' : 'Upload Image'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none">
                {dynamicCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (auto)</label>
              <div className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 select-none">
                {form.name}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
          </div>

          <TagEditor
            label="Subcategories"
            values={form.sub_categories}
            onChange={(v) => setForm((f) => ({ ...f, sub_categories: v }))}
            suggestions={subcatSuggestions}
          />

          <TagEditor
            label="Plating Options"
            values={form.plating}
            onChange={(v) => setForm((f) => ({ ...f, plating: v }))}
            suggestions={platingSuggestions || DEFAULT_PLATINGS}
          />

          <TagEditor
            label="Stone Colors"
            values={form.stones}
            onChange={(v) => setForm((f) => ({ ...f, stones: v }))}
            suggestions={stoneSuggestions || DEFAULT_STONES}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} rows={2} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onClick={handleCreate} disabled={saving || !!nameError}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ORDERS TAB ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('items');
  const [history, setHistory] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(''); // '' | 'saving' | 'saved'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const debounceRef = useRef(null);
  const selectedOrderRef = useRef(null);

  // Keep ref in sync so async callbacks can access current selectedOrder
  useEffect(() => { selectedOrderRef.current = selectedOrder; }, [selectedOrder]);

  async function loadOrders() {
    try {
      const data = await fetchOrdersWithItemsFull();
      setOrders(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadPending() {
    try {
      const data = await fetchAllPendingChangeRequests();
      setPendingRequests(data || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    loadOrders();
    loadPending();
  }, []);

  async function openOrderDetail(order) {
    setSelectedOrder(order);
    setDetailTab('items');
    setAddingItem(false);
    setItemSearch('');
    setOrderDetail({
      status: order.status,
      due_date: order.due_date || '',
      contacted: order.contacted || false,
      payment_received: order.payment_received || false,
      admin_notes: order.admin_notes || '',
      items: (order.order_items || []).map((i) => ({ ...i, _editing: false })),
    });
    const [hist, reqs] = await Promise.all([
      fetchOrderHistory(order.id),
      fetchChangeRequests(order.id),
    ]);
    setHistory(hist || []);
    setChangeRequests(reqs || []);
  }

  function closeDetail() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSelectedOrder(null);
    setOrderDetail(null);
  }

  // Instant save for a specific field — optimistic UI, fire API immediately
  async function saveField(field, value) {
    const order = selectedOrderRef.current;
    if (!order) return;
    setSaveIndicator('saving');
    try {
      await updateOrderAdmin(order.id, { [field]: value });
      // Update order list card too
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, [field]: value } : o));
      setSaveIndicator('saved');
      setTimeout(() => setSaveIndicator(''), 1500);
    } catch (e) {
      setSaveIndicator('');
      alert('Save failed: ' + e.message);
    }
  }

  // Debounced save for text fields (notes, due_date)
  function saveFieldDebounced(field, value, delay = 900) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveIndicator('saving');
    debounceRef.current = setTimeout(() => saveField(field, value || null), delay);
  }

  // Toggle boolean instantly
  async function toggleBoolean(field) {
    setOrderDetail((d) => {
      if (!d) return d;
      const newVal = !d[field];
      saveField(field, newVal); // fire immediately
      return { ...d, [field]: newVal };
    });
  }

  // Status change — save immediately
  async function changeStatus(newStatus) {
    setOrderDetail((d) => d ? { ...d, status: newStatus } : d);
    await saveField('status', newStatus);
    const order = selectedOrderRef.current;
    if (order) await addOrderHistory(order.id, 'Admin', `Status changed to ${newStatus}`);
  }

  async function saveItemEdit(item) {
    setSavingOrder(true);
    try {
      await updateOrderItem(item.id, {
        quantity: item.quantity,
        plating: item.plating,
        stone_color: item.stone_color,
        notes: item.notes,
      });
      await addOrderHistory(selectedOrder.id, 'Admin', `Edited item ${item.products?.name}: qty=${item.quantity}, plating=${item.plating}, stone=${item.stone_color}`);
      setOrderDetail((d) => ({ ...d, items: d.items.map((i) => i.id === item.id ? { ...item, _editing: false } : i) }));
      const hist = await fetchOrderHistory(selectedOrder.id);
      setHistory(hist || []);
    } catch (e) { alert('Save failed: ' + e.message); }
    finally { setSavingOrder(false); }
  }

  async function removeItem(itemId, productName) {
    if (!window.confirm(`Remove ${productName} from this order?`)) return;
    setSavingOrder(true);
    try {
      await deleteOrderItem(itemId);
      await addOrderHistory(selectedOrder.id, 'Admin', `Removed item ${productName}`);
      setOrderDetail((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) }));
      const hist = await fetchOrderHistory(selectedOrder.id);
      setHistory(hist || []);
    } catch (e) { alert('Remove failed: ' + e.message); }
    finally { setSavingOrder(false); }
  }

  const [addingItem, setAddingItem] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const { allProducts: allProds, products: ctxProds } = useProducts();
  const allProductsList = allProds || ctxProds || [];

  async function handleAddItem(product) {
    setSavingOrder(true);
    try {
      await addOrderItem({
        order_id: selectedOrder.id,
        product_id: product.id,
        quantity: 1,
        plating: (product.plating || [])[0] || '',
        stone_color: (product.stones || [])[0] || '',
        notes: '',
      });
      await addOrderHistory(selectedOrder.id, 'Admin', `Added item ${product.name}`);
      // Reload order items from fresh fetch
      const fresh = await fetchOrdersWithItemsFull();
      const updated = (fresh || []).find((o) => o.id === selectedOrder.id);
      if (updated) {
        setOrderDetail((d) => ({
          ...d,
          items: (updated.order_items || []).map((i) => ({ ...i, _editing: false })),
        }));
        setOrders(fresh);
      }
      const hist = await fetchOrderHistory(selectedOrder.id);
      setHistory(hist || []);
      setAddingItem(false);
      setItemSearch('');
    } catch (e) { alert('Add failed: ' + e.message); }
    finally { setSavingOrder(false); }
  }

  async function resolveRequest(req, action) {
    // action: 'approved' | 'rejected'
    setSavingOrder(true);
    try {
      await updateChangeRequest(req.id, {
        status: action,
        resolved_at: new Date().toISOString(),
        admin_note: action === 'approved' ? 'Approved by admin' : 'Rejected by admin',
      });
      await addOrderHistory(selectedOrder.id, 'Admin', `Change request ${action}: "${req.description}"`);
      const [reqs, hist] = await Promise.all([
        fetchChangeRequests(selectedOrder.id),
        fetchOrderHistory(selectedOrder.id),
      ]);
      setChangeRequests(reqs || []);
      setHistory(hist || []);
      // Refresh pending badge
      loadPending();
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setSavingOrder(false); }
  }

  function orderTotal(order) {
    return (order.order_items || []).reduce((sum, item) => {
      const price = item.products?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }

  function isOverdue(order) {
    if (!order.due_date) return false;
    if (['delivered', 'cancelled'].includes(order.status)) return false;
    return new Date(order.due_date + 'T00:00:00') < new Date();
  }

  const filteredOrders = orders
    .filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchSearch = !searchQ || (o.clients?.name || '').toLowerCase().includes(searchQ.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      // Overdue first, then by due_date asc (soonest first), then by created_at desc
      const aOverdue = isOverdue(a), bOverdue = isOverdue(b);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" /></div>;

  return (
    <div>
      {/* Pending requests alert */}
      {pendingRequests.length > 0 && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
          <BellIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">{pendingRequests.length} pending change request{pendingRequests.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {pendingRequests.slice(0, 3).map((r) => r.orders?.clients?.name || 'Unknown').join(', ')}
              {pendingRequests.length > 3 ? ` +${pendingRequests.length - 3} more` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search client…"
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-gray-400 focus:outline-none w-48" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none">
          <option value="all">All Statuses</option>
          {['pending','confirmed','shipped','delivered','cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400">{filteredOrders.length} orders</span>
      </div>

      {!filteredOrders.length && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">No orders found.</div>
      )}

      {/* Order list */}
      <div className="space-y-2">
        {filteredOrders.map((order) => {
          const hasPending = pendingRequests.some((r) => r.order_id === order.id);
          const overdue = isOverdue(order);
          const total = orderTotal(order);
          const orderDate = new Date(order.created_at);
          const isToday = orderDate.toDateString() === new Date().toDateString();
          const dateStr = isToday
            ? `Today · ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return (
            <div key={order.id}
              onClick={() => openOrderDetail(order)}
              className={`bg-white rounded-xl border px-5 py-4 cursor-pointer hover:shadow-sm transition-all flex items-center gap-4 ${overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex-1 min-w-0">
                {/* Top row: name + badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-gray-900">{order.clients?.name || 'Unknown'}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  {overdue && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600">⚠ Overdue</span>
                  )}
                  {hasPending && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">● change request</span>
                  )}
                  {order.payment_received && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">paid</span>
                  )}
                  {order.contacted && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">contacted</span>
                  )}
                </div>
                {/* Bottom row: date · items · due · total */}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm text-gray-500 font-medium">{dateStr}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{(order.order_items || []).length} item{(order.order_items || []).length !== 1 ? 's' : ''}</span>
                  {order.due_date && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className={`text-xs font-medium ${overdue ? 'text-red-500' : 'text-orange-500'}`}>
                        Due {new Date(order.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </>
                  )}
                  {total > 0 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs font-semibold text-gray-700">${total.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-gray-300 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Order Detail Panel (slide-over / modal) */}
      {selectedOrder && orderDetail && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={closeDetail}>
          <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 text-lg truncate">{selectedOrder.clients?.name}</h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <p className="text-xs text-gray-400">Order #{selectedOrder.id} · {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  {orderTotal(selectedOrder) > 0 && (
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-0.5">
                      ${orderTotal(selectedOrder).toLocaleString()}
                    </span>
                  )}
                  {isOverdue(selectedOrder) && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5">⚠ Overdue</span>
                  )}
                </div>
              </div>
              {saveIndicator === 'saving' && <span className="text-xs text-gray-400 flex-shrink-0">Saving…</span>}
              {saveIndicator === 'saved' && <span className="text-xs text-green-500 flex-shrink-0">✓ Saved</span>}
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-700 text-2xl leading-none flex-shrink-0">×</button>
            </div>

            {/* Meta fields */}
            <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={orderDetail.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none">
                  {['pending','confirmed','shipped','delivered','cancelled'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <CalendarIcon className="h-3.5 w-3.5" /> Due Date
                </label>
                <input type="date" value={orderDetail.due_date}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOrderDetail((d) => d ? { ...d, due_date: v } : d);
                    saveFieldDebounced('due_date', v);
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none" />
              </div>

              {/* Toggles — instant save */}
              <div className="flex items-center gap-3 col-span-2 flex-wrap">
                <button onClick={() => toggleBoolean('contacted')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${orderDetail.contacted ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  <CheckCircleIcon className="h-4 w-4" />
                  Contacted
                </button>
                <button onClick={() => toggleBoolean('payment_received')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${orderDetail.payment_received ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  <CheckCircleIcon className="h-4 w-4" />
                  Payment Received
                </button>
                {selectedOrder.clients?.whatsapp && (
                  <a href={`https://wa.me/${selectedOrder.clients.whatsapp.replace(/\D/g,'')}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
                    📱 WhatsApp
                  </a>
                )}
              </div>

              {/* Admin notes — debounced save */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Admin Notes</label>
                <textarea value={orderDetail.admin_notes}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOrderDetail((d) => d ? { ...d, admin_notes: v } : d);
                    saveFieldDebounced('admin_notes', v, 1000);
                  }}
                  rows={2} placeholder="Internal notes, follow-ups…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-gray-100 px-6">
              {[
                ['items', 'Items'],
                ['requests', `Requests${changeRequests.filter((r) => r.status === 'pending').length ? ` (${changeRequests.filter((r) => r.status === 'pending').length})` : ''}`],
                ['history', 'History'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setDetailTab(key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${detailTab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Items tab */}
            {detailTab === 'items' && (
              <div className="px-6 py-4 space-y-3 flex-1">
                {selectedOrder.notes && (
                  <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">"{selectedOrder.notes}"</p>
                )}
                {orderDetail.items.map((item, idx) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {item.products?.image_url
                          ? <img src={item.products.image_url} alt={item.products?.name} className="h-full w-full object-cover" />
                          : <div className="h-full flex items-center justify-center text-xl opacity-20">💍</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.products?.name}</p>
                        {!item._editing && (
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity}
                            {item.plating ? ` · ${item.plating}` : ''}
                            {item.stone_color ? ` · ${item.stone_color}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => setOrderDetail((d) => ({ ...d, items: d.items.map((i, ii) => ii === idx ? { ...i, _editing: !i._editing } : i) }))}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeItem(item.id, item.products?.name)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {item._editing && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Qty</label>
                          <input type="number" min="1" value={item.quantity}
                            onChange={(e) => setOrderDetail((d) => ({ ...d, items: d.items.map((i, ii) => ii === idx ? { ...i, quantity: parseInt(e.target.value) || 1 } : i) }))}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Plating</label>
                          <input type="text" value={item.plating || ''}
                            onChange={(e) => setOrderDetail((d) => ({ ...d, items: d.items.map((i, ii) => ii === idx ? { ...i, plating: e.target.value } : i) }))}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Stone</label>
                          <input type="text" value={item.stone_color || ''}
                            onChange={(e) => setOrderDetail((d) => ({ ...d, items: d.items.map((i, ii) => ii === idx ? { ...i, stone_color: e.target.value } : i) }))}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none" />
                        </div>
                        <div className="col-span-3 flex justify-end gap-2">
                          <button onClick={() => setOrderDetail((d) => ({ ...d, items: d.items.map((i, ii) => ii === idx ? { ...i, _editing: false } : i) }))}
                            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">Cancel</button>
                          <button onClick={() => saveItemEdit(item)} disabled={savingOrder}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                            {savingOrder ? 'Saving…' : 'Save Item'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {orderDetail.items.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No items in this order.</p>
                )}

                {/* Order total */}
                {orderTotal(selectedOrder) > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Order Total</span>
                    <span className="text-base font-bold text-gray-900">${orderTotal(selectedOrder).toLocaleString()}</span>
                  </div>
                )}

                {/* Add item */}
                {!addingItem ? (
                  <button onClick={() => setAddingItem(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                    <PlusIcon className="h-4 w-4" /> Add Item to Order
                  </button>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <input
                        autoFocus
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Search product to add…"
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                      <button onClick={() => { setAddingItem(false); setItemSearch(''); }}
                        className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {allProductsList
                        .filter((p) => itemSearch.length > 0 && p.name.toLowerCase().includes(itemSearch.toLowerCase()))
                        .slice(0, 20)
                        .map((p) => (
                          <button key={p.id} onClick={() => handleAddItem(p)} disabled={savingOrder}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left disabled:opacity-50">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {p.image_url
                                ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                : <div className="h-full flex items-center justify-center text-sm opacity-20">💍</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.category}</p>
                            </div>
                            <PlusIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                      {itemSearch.length > 0 && allProductsList.filter((p) => p.name.toLowerCase().includes(itemSearch.toLowerCase())).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No products found</p>
                      )}
                      {itemSearch.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">Start typing to search products</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Change Requests tab */}
            {detailTab === 'requests' && (
              <div className="px-6 py-4 space-y-3 flex-1">
                {changeRequests.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No change requests for this order.</p>
                )}
                {changeRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-gray-200 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{req.request_type}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'}`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                        {req.admin_note && <p className="text-xs text-gray-500 mt-1 italic">Note: {req.admin_note}</p>}
                      </div>
                      {req.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => resolveRequest(req, 'approved')} disabled={savingOrder}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => resolveRequest(req, 'rejected')} disabled={savingOrder}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History tab */}
            {detailTab === 'history' && (
              <div className="px-6 py-4 flex-1">
                {history.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No changes recorded yet.</p>
                )}
                <div className="relative">
                  {/* Vertical line */}
                  {history.length > 0 && <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-100" />}
                  <div className="space-y-0">
                    {history.map((h, i) => {
                      const isToday = new Date(h.created_at).toDateString() === new Date().toDateString();
                      const timeStr = isToday
                        ? new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      // Color dot by actor
                      const isClient = h.changed_by !== 'Admin';
                      return (
                        <div key={h.id} className="flex gap-4 pb-4 relative">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white ${isClient ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <span className={`text-xs font-bold ${isClient ? 'text-blue-600' : 'text-gray-500'}`}>
                              {isClient ? 'C' : 'A'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm text-gray-800 leading-snug">{h.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{timeStr}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
