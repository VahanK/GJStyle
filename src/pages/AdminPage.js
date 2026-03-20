import { useState, useEffect, useCallback, useRef } from 'react';
import { useProducts } from '../App';
import {
  fetchClients, createClient, updateClient, deleteClient,
  fetchOrdersWithItemsFull, updateOrderAdmin,
  updateOrderItem, deleteOrderItem, addOrderItem,
  fetchAllPendingChangeRequests, fetchChangeRequests, updateChangeRequest,
  fetchOrderHistory, addOrderHistory,
  updateProduct, deleteProduct, createProduct, uploadProductImage,
  fetchClientPricing, setClientPrice, deleteClientPrice,
  logMessage,
  fetchWorkflowSteps, upsertWorkflowStep, fetchAllWorkflowSteps,
  fetchOrderFiles, uploadOrderFile, deleteOrderFile,
} from '../lib/supabase';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon,
  ShoppingBagIcon, UsersIcon, ChevronDownIcon, ChevronRightIcon,
  CubeIcon, MagnifyingGlassIcon, PhotoIcon, BellIcon,
  HomeIcon, ExclamationTriangleIcon, BanknotesIcon,
  ClipboardDocumentListIcon, ChartBarIcon,
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

// ── ANALYTICS TAB ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [allWorkflow, setAllWorkflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, clientsData, wfData] = await Promise.all([
        fetchOrdersWithItemsFull(),
        fetchClients(),
        fetchAllWorkflowSteps(),
      ]);
      setOrders(ordersData);
      setClients(clientsData);
      setAllWorkflow(wfData || []);
    } catch (e) {
      console.error('Analytics load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;
  }

  // Filter orders by time range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
  const filteredOrders = orders.filter((o) => new Date(o.created_at) >= cutoffDate);

  // CLIENT ANALYTICS
  const clientOrders = {};
  filteredOrders.forEach((o) => {
    const cid = o.clients?.id;
    if (!cid) return;
    if (!clientOrders[cid]) {
      clientOrders[cid] = { name: o.clients.name, orders: [], totalRevenue: 0, totalItems: 0 };
    }
    clientOrders[cid].orders.push(o);
    clientOrders[cid].totalRevenue += o.total_amount || 0;
    clientOrders[cid].totalItems += (o.order_items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
  });

  const topClients = Object.values(clientOrders)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const inactiveClients = clients.filter((c) => {
    const lastOrder = orders
      .filter((o) => o.clients?.id === c.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (!lastOrder) return true;
    const daysSince = (new Date() - new Date(lastOrder.created_at)) / (1000 * 60 * 60 * 24);
    return daysSince > parseInt(timeRange);
  });

  // PRODUCT ANALYTICS
  const productSales = {};
  filteredOrders.forEach((o) => {
    (o.order_items || []).forEach((item) => {
      const pid = item.products?.id;
      if (!pid) return;
      if (!productSales[pid]) {
        productSales[pid] = {
          name: item.products.name,
          category: item.products.category,
          image_url: item.products.image_url,
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }
      productSales[pid].quantity += item.quantity || 0;
      productSales[pid].revenue += (item.products.price || 0) * (item.quantity || 0);
      productSales[pid].orders += 1;
    });
  });

  const bestsellers = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity);

  // REVENUE ANALYTICS
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalPaid = filteredOrders.reduce((sum, o) => sum + (o.amount_paid || 0), 0);
  const totalOutstanding = totalRevenue - totalPaid;
  const paymentCollectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">Collected</p>
          <p className="mt-2 text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">Outstanding</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">${totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-5">
          <p className="text-sm font-medium text-gray-500">Collection Rate</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{paymentCollectionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Client & Product Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top clients */}
        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3">
            <h3 className="font-semibold text-gray-900">Top Clients by Revenue</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {topClients.map((c, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.orders.length} orders · {c.totalItems} items</p>
                </div>
                <p className="text-sm font-bold text-gray-900">${c.totalRevenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bestsellers */}
        <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Bestsellers</h3>
            <span className="text-xs text-gray-400">{bestsellers.length} products</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
            {bestsellers.map((p, i) => (
              <div key={i} className="px-5 py-2.5 flex items-center gap-3 hover:bg-gray-50">
                <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">#{i + 1}</span>
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    : <div className="h-full flex items-center justify-center text-sm opacity-20">💍</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category} · {p.orders} orders</p>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p className="text-sm font-bold text-gray-900">{p.quantity} sold</p>
                  <p className="text-xs text-gray-500">${p.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive clients */}
        {inactiveClients.length > 0 && (
          <div className="rounded-xl bg-white border border-amber-200 overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
              <h3 className="font-semibold text-amber-900">Inactive Clients ({inactiveClients.length})</h3>
              <p className="text-xs text-amber-700">No orders in {timeRange} days</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {inactiveClients.slice(0, 10).map((c) => (
                <div key={c.id} className="px-5 py-2 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Workflow Analytics */}
      {(() => {
        const WF_KEYS = ['order_confirmed','factory_file_ready','sent_to_production','in_production','qc_passed','packed'];
        const WF_LABELS = { order_confirmed: 'Confirmed', factory_file_ready: 'File Ready', sent_to_production: 'To Production', in_production: 'In Production', qc_passed: 'QC Passed', packed: 'Packed' };
        // Group workflow steps by order
        const byOrder = {};
        allWorkflow.forEach((s) => {
          if (!byOrder[s.order_id]) byOrder[s.order_id] = {};
          byOrder[s.order_id][s.step_key] = s;
        });
        // Calculate avg time between consecutive steps
        const pairTimes = {};
        for (let i = 1; i < WF_KEYS.length; i++) {
          const key = `${WF_KEYS[i - 1]}→${WF_KEYS[i]}`;
          pairTimes[key] = { label: `${WF_LABELS[WF_KEYS[i - 1]]} → ${WF_LABELS[WF_KEYS[i]]}`, times: [] };
        }
        Object.values(byOrder).forEach((steps) => {
          for (let i = 1; i < WF_KEYS.length; i++) {
            const prev = steps[WF_KEYS[i - 1]];
            const curr = steps[WF_KEYS[i]];
            if (prev?.completed_at && curr?.completed_at) {
              const diff = (new Date(curr.completed_at) - new Date(prev.completed_at)) / 3600000;
              if (diff > 0) pairTimes[`${WF_KEYS[i - 1]}→${WF_KEYS[i]}`].times.push(diff);
            }
          }
        });
        // Also total order → packed time
        const totalTimes = [];
        Object.values(byOrder).forEach((steps) => {
          const first = steps[WF_KEYS[0]];
          const last = steps[WF_KEYS[WF_KEYS.length - 1]];
          if (first?.completed_at && last?.completed_at) {
            totalTimes.push((new Date(last.completed_at) - new Date(first.completed_at)) / 3600000);
          }
        });
        const pairs = Object.values(pairTimes).filter((p) => p.times.length > 0);
        if (pairs.length === 0 && totalTimes.length === 0) return null;
        const fmtH = (h) => h < 24 ? `${Math.round(h)}h` : `${(h / 24).toFixed(1)}d`;
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        return (
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-3">
              <h3 className="font-semibold text-gray-900">Production Speed</h3>
              <p className="text-xs text-gray-400">Average time between workflow steps across all orders</p>
            </div>
            <div className="p-5 space-y-3">
              {totalTimes.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Total: Confirmed → Packed</span>
                  <span className="text-sm font-bold text-blue-700">{fmtH(avg(totalTimes))} avg ({totalTimes.length} orders)</span>
                </div>
              )}
              {pairs.map((p) => {
                const a = avg(p.times);
                const maxBar = Math.max(...pairs.map((pp) => avg(pp.times)));
                const pct = maxBar > 0 ? (a / maxBar) * 100 : 0;
                return (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{p.label}</span>
                      <span className={`text-xs font-medium ${a > 48 ? 'text-amber-600' : 'text-gray-600'}`}>{fmtH(a)} avg ({p.times.length})</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${a > 48 ? 'bg-amber-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// ── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ onGoToOrder }) {
  const [orders, setOrders] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [allWorkflow, setAllWorkflow] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, crData, wfData] = await Promise.all([
        fetchOrdersWithItemsFull(),
        fetchAllPendingChangeRequests(),
        fetchAllWorkflowSteps(),
      ]);
      setOrders(ordersData);
      setChangeRequests(crData);
      setAllWorkflow(wfData || []);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading dashboard...</div>;
  }

  const today = new Date();
  const notCancelled = orders.filter((o) => o.status !== 'cancelled');

  // ── Workflow map ──
  const wfByOrder = {};
  allWorkflow.forEach((s) => {
    if (!wfByOrder[s.order_id]) wfByOrder[s.order_id] = {};
    wfByOrder[s.order_id][s.step_key] = s;
  });

  const active = notCancelled.filter((o) => !(o.status === 'delivered' && o.payment_status === 'paid'));

  // ── NEEDS ACTION (things you must do) ──
  const needsConfirmation = notCancelled.filter((o) => o.status === 'pending');
  const overdueOrders = notCancelled.filter((o) => {
    if (!o.due_date) return false;
    return new Date(o.due_date) < today && o.status !== 'delivered' && o.status !== 'shipped';
  });
  const needsFactoryFile = notCancelled.filter((o) => {
    if (o.status === 'pending' || o.status === 'delivered' || o.status === 'shipped') return false;
    const steps = wfByOrder[o.id] || {};
    return !steps.factory_file_ready?.completed;
  });
  const needsSendToProduction = notCancelled.filter((o) => {
    if (o.status === 'pending' || o.status === 'delivered' || o.status === 'shipped') return false;
    const steps = wfByOrder[o.id] || {};
    return steps.factory_file_ready?.completed && !steps.sent_to_production?.completed;
  });
  const needsShipping = notCancelled.filter((o) => {
    const steps = wfByOrder[o.id] || {};
    return steps.packed?.completed && o.status !== 'shipped' && o.status !== 'delivered';
  });
  const actionCount = needsConfirmation.length + overdueOrders.length + changeRequests.length + needsFactoryFile.length + needsSendToProduction.length + needsShipping.length;

  // ── PRODUCTION & FULFILLMENT (where things are) ──
  const inFactory = notCancelled.filter((o) => {
    if (o.status === 'pending' || o.status === 'delivered' || o.status === 'shipped') return false;
    const steps = wfByOrder[o.id] || {};
    return steps.sent_to_production?.completed && !steps.production_complete?.completed;
  });
  const inFinishing = notCancelled.filter((o) => {
    if (o.status === 'pending' || o.status === 'delivered' || o.status === 'shipped') return false;
    const steps = wfByOrder[o.id] || {};
    return steps.production_complete?.completed && !steps.packed?.completed;
  });
  const shipped = notCancelled.filter((o) => o.status === 'shipped' && o.status !== 'delivered');

  // ── PAYMENT ──
  const unpaidOrders = notCancelled.filter((o) => o.payment_status === 'unpaid' && o.status !== 'cancelled');
  const partialOrders = notCancelled.filter((o) => o.payment_status === 'partial');
  const allUnpaid = notCancelled.filter((o) => o.payment_status !== 'paid');
  const totalOutstanding = allUnpaid.reduce((sum, o) => {
    const total = (o.order_items || []).reduce((s, item) => s + (item.products?.price || 0) * (item.quantity || 1), 0);
    const paid = o.amount_paid || 0;
    return sum + Math.max(0, total - paid);
  }, 0);

  // Reusable order row
  const OrderRow = ({ order, extra, rightLabel }) => {
    const itemCount = order.order_items?.length || 0;
    const total = (order.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 1), 0);
    return (
      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3" onClick={() => onGoToOrder(order.id)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{order.clients?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500">{itemCount} items · ${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {extra ? `· ${extra}` : ''}</p>
        </div>
        {rightLabel && <span className="text-xs font-medium shrink-0">{rightLabel}</span>}
        <ChevronRightIcon className="h-4 w-4 text-gray-300 shrink-0" />
      </div>
    );
  };

  // Section component
  const Section = ({ title, icon: Icon, count, color, border, bg, orders: sectionOrders, renderRow }) => {
    if (!sectionOrders || sectionOrders.length === 0) return null;
    return (
      <div className={`rounded-xl bg-white border ${border} overflow-hidden`}>
        <div className={`${bg} border-b ${border} px-4 py-3 flex items-center gap-2`}>
          <Icon className={`h-5 w-5 ${color}`} />
          <h3 className={`font-semibold text-sm ${color}`}>{title}</h3>
          <span className={`ml-auto text-xs font-bold ${color} bg-white/60 rounded-full px-2 py-0.5`}>{count}</span>
        </div>
        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
          {sectionOrders.map((o, i) => renderRow ? renderRow(o, i) : <OrderRow key={o.id} order={o} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className={`rounded-xl border p-4 ${actionCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Needs Action</p>
          <p className={`mt-1 text-2xl font-bold ${actionCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{actionCount}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{active.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${allUnpaid.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unpaid</p>
          <p className={`mt-1 text-2xl font-bold ${allUnpaid.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{allUnpaid.length}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* ═══════ NEEDS ACTION ═══════ */}
      {actionCount > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Needs Action</h2>
            <span className="text-xs text-gray-400">— things you need to do</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Overdue" icon={ExclamationTriangleIcon} count={overdueOrders.length}
              color="text-red-700" border="border-red-200" bg="bg-red-50" orders={overdueOrders}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra={`Due ${new Date(o.due_date).toLocaleDateString()}`} rightLabel={<span className="text-red-600">{Math.ceil((today - new Date(o.due_date)) / 86400000)}d late</span>} />} />

            <Section title="Needs Confirmation" icon={ClipboardDocumentListIcon} count={needsConfirmation.length}
              color="text-blue-700" border="border-blue-200" bg="bg-blue-50" orders={needsConfirmation}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra={new Date(o.created_at).toLocaleDateString()} />} />

            {changeRequests.length > 0 && (
              <div className="rounded-xl bg-white border border-amber-200 overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-amber-700" />
                  <h3 className="font-semibold text-sm text-amber-700">Change Requests</h3>
                  <span className="ml-auto text-xs font-bold text-amber-700 bg-white/60 rounded-full px-2 py-0.5">{changeRequests.length}</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {changeRequests.map((cr) => (
                    <div key={cr.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3" onClick={() => onGoToOrder(cr.order_id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cr.orders?.clients?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 truncate">{cr.message || cr.type || 'Change request'}</p>
                      </div>
                      <span className="text-xs text-amber-600 font-medium shrink-0">{new Date(cr.created_at).toLocaleDateString()}</span>
                      <ChevronRightIcon className="h-4 w-4 text-gray-300 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Section title="Needs Factory File" icon={ClipboardDocumentListIcon} count={needsFactoryFile.length}
              color="text-orange-700" border="border-orange-200" bg="bg-orange-50" orders={needsFactoryFile}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra="No production file" />} />

            <Section title="Send to Production" icon={CubeIcon} count={needsSendToProduction.length}
              color="text-cyan-700" border="border-cyan-200" bg="bg-cyan-50" orders={needsSendToProduction}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra="File ready, needs sending" />} />

            <Section title="Ready to Ship" icon={CubeIcon} count={needsShipping.length}
              color="text-purple-700" border="border-purple-200" bg="bg-purple-50" orders={needsShipping} />
          </div>
        </>
      )}

      {/* All clear */}
      {actionCount === 0 && (
        <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
          <CheckCircleIcon className="h-10 w-10 text-green-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-700">All caught up! No action items.</p>
        </div>
      )}

      {/* ═══════ ACTIVE ORDERS ═══════ */}
      {(inFactory.length > 0 || inFinishing.length > 0 || shipped.length > 0) && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Active Orders</h2>
            <span className="text-xs text-gray-400">— where things are right now</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Section title="In Factory" icon={CubeIcon} count={inFactory.length}
              color="text-indigo-700" border="border-indigo-200" bg="bg-indigo-50" orders={inFactory}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra={o.due_date ? `Due ${new Date(o.due_date).toLocaleDateString()}` : ''} />} />

            <Section title="Finishing" icon={CubeIcon} count={inFinishing.length}
              color="text-violet-700" border="border-violet-200" bg="bg-violet-50" orders={inFinishing}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra="QC / Stone gluing / Packing" />} />

            <Section title="Shipped" icon={CubeIcon} count={shipped.length}
              color="text-sky-700" border="border-sky-200" bg="bg-sky-50" orders={shipped}
              renderRow={(o) => <OrderRow key={o.id} order={o} extra={o.tracking_number ? `#${o.tracking_number}` : 'No tracking'} />} />
          </div>
        </>
      )}

      {/* ═══════ PAYMENT ═══════ */}
      {allUnpaid.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payment</h2>
            <span className="text-xs text-gray-400">— ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} outstanding</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Unpaid" icon={BanknotesIcon} count={unpaidOrders.length}
              color="text-red-700" border="border-red-200" bg="bg-red-50" orders={unpaidOrders}
              renderRow={(o) => {
                const total = (o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 1), 0);
                return <OrderRow key={o.id} order={o} extra="Not paid" rightLabel={<span className="text-red-600 font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>} />;
              }} />

            <Section title="Partial Payment" icon={BanknotesIcon} count={partialOrders.length}
              color="text-amber-700" border="border-amber-200" bg="bg-amber-50" orders={partialOrders}
              renderRow={(o) => {
                const total = (o.order_items || []).reduce((s, i) => s + (i.products?.price || 0) * (i.quantity || 1), 0);
                const paid = o.amount_paid || 0;
                const due = Math.max(0, total - paid);
                return <OrderRow key={o.id} order={o} extra={`$${paid.toLocaleString()} paid`} rightLabel={<span className="text-amber-700 font-bold">${due.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} due</span>} />;
              }} />
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [focusOrderId, setFocusOrderId] = useState(null);

  function goToOrder(orderId) {
    setFocusOrderId(orderId);
    setTab('orders');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products, clients, and orders.</p>
        </div>
        <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            ['dashboard', <HomeIcon className="h-4 w-4" key="d" />, 'Dashboard'],
            ['analytics', <ChartBarIcon className="h-4 w-4" key="a" />, 'Analytics'],
            ['clients', <UsersIcon className="h-4 w-4" key="u" />, 'Clients'],
            ['products', <CubeIcon className="h-4 w-4" key="p" />, 'Products'],
            ['orders', <ShoppingBagIcon className="h-4 w-4" key="s" />, 'Orders'],
          ].map(([key, icon, label]) => (
            <button key={key} onClick={() => { setTab(key); setFocusOrderId(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {icon}{label}
            </button>
          ))}
        </div>
        {tab === 'dashboard' && <DashboardTab onGoToOrder={goToOrder} />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'clients' && <ClientsTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'orders' && <OrdersTab focusOrderId={focusOrderId} onFocusHandled={() => setFocusOrderId(null)} />}
      </div>
    </div>
  );
}

// Custom pricing per client — inline in client edit modal
function ClientPricingSection({ clientId, products }) {
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [pendingPrices, setPendingPrices] = useState({}); // { productId: inputValue }
  const debounceRefs = useRef({});

  useEffect(() => {
    fetchClientPricing(clientId).then((data) => {
      setPricing(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  function debouncedSetPrice(productId, value) {
    const numVal = parseFloat(value);
    if (debounceRefs.current[productId]) clearTimeout(debounceRefs.current[productId]);
    debounceRefs.current[productId] = setTimeout(async () => {
      if (!isNaN(numVal) && numVal > 0) {
        await setClientPrice(clientId, productId, numVal);
        setPricing((prev) => {
          const exists = prev.find((p) => p.product_id === productId);
          if (exists) return prev.map((p) => p.product_id === productId ? { ...p, custom_price: numVal } : p);
          return [...prev, { client_id: clientId, product_id: productId, custom_price: numVal }];
        });
      }
    }, 800);
  }

  async function handleRemovePrice(productId) {
    await deleteClientPrice(clientId, productId);
    setPricing((prev) => prev.filter((p) => p.product_id !== productId));
    setPendingPrices((prev) => { const n = { ...prev }; delete n[productId]; return n; });
  }

  async function addProductToPrice(product) {
    const defaultPrice = Math.round(product.price || 0);
    setPendingPrices((prev) => ({ ...prev, [product.id]: String(defaultPrice) }));
    await setClientPrice(clientId, product.id, defaultPrice);
    setPricing((prev) => [...prev, { client_id: clientId, product_id: product.id, custom_price: defaultPrice }]);
    setSearch('');
  }

  const pricedProducts = pricing.map((p) => {
    const product = products.find((pr) => pr.id === p.product_id);
    return { ...p, product };
  }).filter((p) => p.product);

  const pricedIds = new Set(pricing.map((p) => p.product_id));
  const searchResults = search.length >= 2
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && !pricedIds.has(p.id)).slice(0, 8)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Custom Pricing</h3>
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="text-xs text-gray-500 underline hover:text-gray-800">
          {open ? 'Hide' : `Manage${pricedProducts.length ? ` (${pricedProducts.length})` : ''}`}
        </button>
      </div>

      {loading && <p className="text-xs text-gray-400">Loading pricing...</p>}

      {open && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Search to add */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product to add custom price..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:border-gray-400 focus:outline-none" />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => addProductToPrice(p)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-blue-50 transition-colors">
                    {p.image_url && <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category} · Base: ${Math.round(p.price || 0)}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-medium flex-shrink-0">+ Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Existing custom prices */}
          {pricedProducts.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {pricedProducts.map((p) => {
                const inputVal = pendingPrices[p.product_id] !== undefined
                  ? pendingPrices[p.product_id]
                  : String(Math.round(p.custom_price));
                return (
                  <div key={p.product_id} className="flex items-center gap-3 px-3 py-2">
                    {p.product?.image_url && <img src={p.product.image_url} alt="" className="h-8 w-8 rounded object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.product?.name}</p>
                      <p className="text-xs text-gray-400">Base: ${Math.round(p.product?.price || 0)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400">$</span>
                      <input type="text" inputMode="numeric" value={inputVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (/^\d*$/.test(v)) {
                            setPendingPrices((prev) => ({ ...prev, [p.product_id]: v }));
                            debouncedSetPrice(p.product_id, v);
                          }
                        }}
                        className="w-14 text-right rounded-lg border border-gray-200 px-2 py-1 text-xs font-bold text-gray-900 focus:border-gray-400 focus:outline-none" />
                      <button type="button" onClick={() => handleRemovePrice(p.product_id)}
                        className="ml-1 text-gray-300 hover:text-red-500 transition-colors text-sm leading-none">×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-4 text-xs text-gray-400 text-center">No custom prices set. Search above to add.</p>
          )}
        </div>
      )}
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

              {/* Custom Pricing — only show for existing clients */}
              {editing && <ClientPricingSection clientId={editing.id} products={products} />}

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
  const [productTab, setProductTab] = useState('all'); // 'all' | 'deleted' | 'variants'
  const [editing, setEditing] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [localProducts, setLocalProducts] = useState(null);
  const fileInputRef = useRef(null);
  const extraImageInputRef = useRef(null);

  const products = localProducts || source;

  // Dynamic suggestions: merge defaults with all values already saved across products
  const allPlatingSuggestions = [...new Set([...DEFAULT_PLATINGS, ...products.flatMap((p) => p.plating || [])])].sort();
  const allStoneSuggestions = [...new Set([...DEFAULT_STONES, ...products.flatMap((p) => p.stones || [])])].sort();

  // A product "needs stones" if any of its subcategories mention "stone"
  function needsStones(p) {
    return (p.sub_categories || []).some((s) => /stone/i.test(s));
  }

  function isMissing(p) {
    return !p.price || !(p.plating?.length) || (needsStones(p) && !(p.stones?.length));
  }

  const filtered = (() => {
    if (productTab === 'deleted') return products.filter((p) => !!p.deleted_at && !p.parent_id);
    if (productTab === 'variants') return products.filter((p) => !!p.parent_id);
    // 'all' tab
    return products.filter((p) => {
      if (p.deleted_at) return false;
      if (p.parent_id) return false;
      const matchCat = catFilter === 'All' || p.category === catFilter;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchMissing = !missingOnly || isMissing(p);
      return matchCat && matchSearch && matchMissing;
    }).sort((a, b) => {
      // More missing data = higher priority (shown first)
      const score = (p) => {
        let s = 0;
        if (needsStones(p) && !(p.stones?.length)) s += 2;
        if (!p.price) s += 1;
        if (!(p.plating?.length)) s += 1;
        return s;
      };
      return score(b) - score(a);
    });
  })();

  const missingCount = products.filter((p) => !p.deleted_at && !p.parent_id && isMissing(p)).length;
  const deletedCount = products.filter((p) => !!p.deleted_at && !p.parent_id).length;
  const variantsCount = products.filter((p) => !!p.parent_id).length;
  const categories = ['All', ...Array.from(new Set(products.filter(p => !p.deleted_at).map((p) => p.category))).sort()];

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
        price: editing.price ? Math.round(Number(editing.price)) : null,
        plating: editing.plating,
        stones: editing.stones,
        sub_categories: editing.sub_categories,
        category: editing.category,
        notes: editing.notes,
        image_url: editing.image_url,
        extra_images: editing.extra_images || [],
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

  async function handleExtraImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !editing) return;
    setSaving(true);
    try {
      const url = await uploadProductImage(file, `${editing.id}-extra-${Date.now()}`);
      const newExtras = [...(editing.extra_images || []), url];
      setEditing((ed) => ({ ...ed, extra_images: newExtras }));
    } catch (err) { alert('Image upload failed: ' + err.message); }
    finally { setSaving(false); e.target.value = ''; }
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
      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Products', count: products.filter(p => !p.deleted_at && !p.parent_id).length },
          { key: 'deleted', label: '🗑 Deleted', count: deletedCount },
          { key: 'variants', label: '🔗 Variants', count: variantsCount },
        ].map((t) => (
          <button key={t.key} onClick={() => { setProductTab(t.key); setMissingOnly(false); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${productTab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label} <span className="ml-1 text-xs text-gray-400">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Toolbar — only show for 'all' tab */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        {productTab === 'all' && (
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
              ⚠ Missing data ({missingCount})
            </button>
            <span className="text-sm text-gray-400">{filtered.length} products</span>
          </div>
        )}
        {productTab !== 'all' && <span className="text-sm text-gray-400">{filtered.length} products</span>}
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
                {p.price ? `$${Math.round(Number(p.price))}` : <span className="text-xs text-amber-500 font-normal italic">No price</span>}
              </p>
              {missingStones && (
                <p className="text-xs text-amber-500 italic mb-1">No stone colors</p>
              )}
              {(p.deleted_at || p.parent_id) ? (
                <>
                  {p.parent_id && (() => {
                    const parent = products.find(x => x.id === p.parent_id);
                    return (
                      <div className="flex items-center gap-2 mb-2">
                        {parent?.image_url && (
                          <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={parent.image_url} alt={parent.name} className="h-full w-full object-contain" />
                          </div>
                        )}
                        <p className="text-xs text-blue-400 italic truncate">
                          Variant of: {parent?.name || `#${p.parent_id}`}
                        </p>
                      </div>
                    );
                  })()}
                  <button onClick={() => {
                    if (window.confirm(`Restore "${p.name}"? This will remove it from its parent and show it in the catalog again.`)) {
                      updateProduct(p.id, { deleted_at: null, parent_id: null });
                      setLocalProducts((prev) => (prev || source).map((x) => x.id === p.id ? { ...x, deleted_at: null, parent_id: null } : x));
                    }
                  }} className="w-full rounded-lg border border-green-300 py-1.5 text-xs text-green-700 hover:bg-green-50">
                    ↩ Restore
                  </button>
                </>

              ) : (
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
              )}
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

              {/* Extra Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extra Images <span className="text-xs text-gray-400 font-normal">(stone chart, detail shots, etc.)</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editing.extra_images || []).map((url, i) => (
                    <div key={i} className="relative group">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={url} alt={`extra-${i}`} className="h-full w-full object-contain" />
                      </div>
                      <button type="button"
                        onClick={() => setEditing((ed) => ({ ...ed, extra_images: (ed.extra_images || []).filter((_, idx) => idx !== i) }))}
                        className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none shadow">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => extraImageInputRef.current?.click()}
                    className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-xs gap-1">
                    <PhotoIcon className="h-5 w-5" />
                    {saving ? '…' : 'Add'}
                  </button>
                  <input ref={extraImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleExtraImageUpload} />
                </div>
              </div>

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 select-none">
                    {editing.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input type="text" inputMode="numeric" value={editing.price || ''}
                    onChange={(e) => { if (/^\d*$/.test(e.target.value)) setEditing((ed) => ({ ...ed, price: e.target.value })); }}
                    placeholder="0"
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

              {/* Variants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variant Images</label>
                {/* Current variants linked to this product */}
                {(() => {
                  const linkedVariants = products.filter((p) => p.parent_id === editing.id);
                  return linkedVariants.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {linkedVariants.map((v) => (
                        <div key={v.id} className="relative group">
                          <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            {v.image_url
                              ? <img src={v.image_url} alt={v.name} className="h-full w-full object-contain" />
                              : <div className="h-full flex items-center justify-center text-xs text-gray-300">No img</div>}
                          </div>
                          <p className="text-xs text-gray-400 text-center mt-0.5 w-16 truncate">{v.name}</p>
                          <button
                            type="button"
                            onClick={async () => {
                              await updateProduct(v.id, { parent_id: null, deleted_at: null });
                              setLocalProducts((prev) => (prev || source).map((x) => x.id === v.id ? { ...x, parent_id: null, deleted_at: null } : x));
                            }}
                            className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs leading-none">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null;
                })()}
                {/* Link a variant — show all eligible products as image grid */}
                {(() => {
                  const eligible = products.filter((p) =>
                    p.id !== editing.id &&
                    !p.parent_id &&
                    p.category === editing.category &&
                    (p.sub_categories || []).some((s) => (editing.sub_categories || []).includes(s))
                  );
                  const linkedIds = new Set(products.filter((p) => p.parent_id === editing.id).map((p) => p.id));
                  const available = eligible.filter((p) => !linkedIds.has(p.id));
                  return available.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                      {available.map((p) => (
                        <button key={p.id} type="button"
                          onClick={async () => {
                            const now = new Date().toISOString();
                            await updateProduct(p.id, { parent_id: editing.id, deleted_at: now });
                            setLocalProducts((prev) => (prev || source).map((x) => x.id === p.id ? { ...x, parent_id: editing.id, deleted_at: now } : x));
                          }}
                          title={p.name}
                          className="relative group h-28 w-28 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-gray-900 transition-colors flex-shrink-0">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className="h-full w-full object-contain" />
                            : <div className="h-full flex items-center justify-center text-xs text-gray-300">?</div>}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-1">
                            <span className="hidden group-hover:block text-white text-xs font-medium bg-black/60 px-1 rounded truncate max-w-full">{p.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No other products in same category/subcategory to link</p>
                  );
                })()}
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
        price: form.price ? Math.round(Number(form.price)) : null,
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
            <input type="text" inputMode="numeric" value={form.price}
              onChange={(e) => { if (/^\d*$/.test(e.target.value)) setForm((f) => ({ ...f, price: e.target.value })); }}
              placeholder="0"
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
          <button onClick={handleCreate} disabled={saving}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QUICK MESSAGES (copy to clipboard + show preview) ─────────────────────────
function QuickMessages({ selectedOrder, orderDetail, orderTotal }) {
  const [expanded, setExpanded] = useState(null); // label of expanded msg
  const [copied, setCopied] = useState(null);

  const templates = [
    { label: 'Confirmed', msg: () => `Hi ${selectedOrder.clients?.name}! Your order #${selectedOrder.id} has been confirmed and is being processed. We'll keep you updated!` },
    { label: 'In Production', msg: () => `Hi ${selectedOrder.clients?.name}! Your order #${selectedOrder.id} is now in production. We'll notify you once it's ready.` },
    { label: 'Ready to Ship', msg: () => `Hi ${selectedOrder.clients?.name}! Great news — your order #${selectedOrder.id} is ready and will be shipped soon!` },
    { label: 'Shipped', msg: () => `Hi ${selectedOrder.clients?.name}! Your order #${selectedOrder.id} has been shipped${orderDetail.tracking_number ? `. Tracking: ${orderDetail.tracking_number}` : ''}. Let us know when it arrives!` },
    { label: 'Payment', msg: () => { const bal = orderTotal(selectedOrder) - (orderDetail.amount_paid || 0); return `Hi ${selectedOrder.clients?.name}! Friendly reminder about the balance on order #${selectedOrder.id}${bal > 0 ? ` ($${Math.round(bal)} remaining)` : ''}. Please let us know if you have any questions.`; } },
  ];

  async function handleClick(t) {
    const text = t.msg();
    if (expanded === t.label) {
      setExpanded(null);
      return;
    }
    setExpanded(t.label);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(t.label);
      setTimeout(() => setCopied(null), 2000);
      await logMessage(selectedOrder.clients.id, selectedOrder.id, 'whatsapp', t.label, text, 'Admin');
    } catch (_) {}
  }

  const phone = selectedOrder.clients.whatsapp.replace(/\D/g, '');

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">Quick Messages</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {templates.map((t) => (
          <button key={t.label} onClick={() => handleClick(t)}
            className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
              expanded === t.label
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
            }`}>
            {copied === t.label ? '✓ Copied' : t.label}
          </button>
        ))}
      </div>
      {expanded && (() => {
        const t = templates.find((x) => x.label === expanded);
        if (!t) return null;
        const text = t.msg();
        return (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-2.5 space-y-2">
            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
            <div className="flex gap-2">
              <a href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
                className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors">
                Open WhatsApp
              </a>
              <button onClick={async () => {
                try { await navigator.clipboard.writeText(text); setCopied(expanded); setTimeout(() => setCopied(null), 2000); } catch (_) {}
              }}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                {copied === expanded ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── ORDER CARD (shared between active + completed lists) ──────────────────────
function OrderCard({ order, pendingRequests, isOverdue, orderTotal, openOrderDetail }) {
  const hasPending = pendingRequests.some((r) => r.order_id === order.id);
  const overdue = isOverdue(order);
  const total = orderTotal(order);
  const orderDate = new Date(order.created_at);
  const isToday = orderDate.toDateString() === new Date().toDateString();
  const dateStr = isToday
    ? `Today · ${orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const paid = order.amount_paid || 0;
  const balance = total - paid;

  return (
    <div onClick={() => openOrderDetail(order)}
      className={`bg-white rounded-xl border px-5 py-4 cursor-pointer hover:shadow-sm transition-all flex items-center gap-4 ${overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-gray-900">{order.clients?.name || 'Unknown'}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status}
          </span>
          {order.payment_status && order.payment_status !== 'paid' && total > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600">
              {order.payment_status === 'partial' ? `$${balance.toLocaleString()} due` : 'unpaid'}
            </span>
          )}
          {order.payment_status === 'paid' && (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">paid</span>
          )}
          {overdue && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600">overdue</span>
          )}
          {hasPending && (
            <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">change request</span>
          )}
        </div>
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
}

// ── ORDERS TAB ────────────────────────────────────────────────────────────────
function OrdersTab({ focusOrderId, onFocusHandled }) {
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
  const [addingItem, setAddingItem] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [orderFiles, setOrderFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
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

  // Auto-open a specific order when navigating from dashboard
  useEffect(() => {
    if (focusOrderId && orders.length > 0) {
      const target = orders.find((o) => o.id === focusOrderId);
      if (target) {
        openOrderDetail(target);
      }
      if (onFocusHandled) onFocusHandled();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusOrderId, orders]);

  async function openOrderDetail(order) {
    setSelectedOrder(order);
    setDetailTab('items');
    setAddingItem(false);
    setItemSearch('');
    // Auto-calculate total from items
    const computedTotal = (order.order_items || []).reduce((sum, item) => {
      return sum + (item.products?.price || 0) * (item.quantity || 1);
    }, 0);
    // Sync total_amount in DB if it's stale
    if (computedTotal > 0 && computedTotal !== (order.total_amount || 0)) {
      updateOrderAdmin(order.id, { total_amount: computedTotal }).catch(() => {});
    }
    setOrderDetail({
      status: order.status,
      due_date: order.due_date || '',
      contacted: order.contacted || false,
      payment_received: order.payment_received || false,
      admin_notes: order.admin_notes || '',
      production_status: order.production_status || 'pending',
      payment_status: order.payment_status || 'unpaid',
      amount_paid: order.amount_paid || 0,
      total_amount: computedTotal,
      tracking_number: order.tracking_number || '',
      carrier: order.carrier || '',
      shipped_date: order.shipped_date || '',
      has_issues: order.has_issues || false,
      issue_description: order.issue_description || '',
      resolution_status: order.resolution_status || 'pending',
      items: (order.order_items || []).map((i) => ({ ...i, _editing: false })),
    });
    const [hist, reqs, wfSteps, files] = await Promise.all([
      fetchOrderHistory(order.id),
      fetchChangeRequests(order.id),
      fetchWorkflowSteps(order.id),
      fetchOrderFiles(order.id),
    ]);
    setHistory(hist || []);
    setChangeRequests(reqs || []);
    setWorkflowSteps(wfSteps || []);
    setOrderFiles(files || []);

    // Auto-sync auto-checkable workflow steps to DB
    const stepsMap = {};
    (wfSteps || []).forEach((s) => { stepsMap[s.step_key] = s; });
    const isConfirmed = order.status !== 'pending' && order.status !== 'cancelled';
    const hasFile = (files || []).some((f) => f.file_type === 'factory_sheet');
    const isShipped = order.status === 'shipped' || order.status === 'delivered';
    const autoChecks = [
      { key: 'order_confirmed', done: isConfirmed },
      { key: 'factory_file_ready', done: hasFile },
      { key: 'packed', done: isShipped },
    ];
    for (const ac of autoChecks) {
      const existing = stepsMap[ac.key];
      if (ac.done && !existing?.completed) {
        upsertWorkflowStep(order.id, ac.key, { completed: true, completed_at: new Date().toISOString(), completed_by: 'system' }).catch(() => {});
      } else if (!ac.done && existing?.completed) {
        upsertWorkflowStep(order.id, ac.key, { completed: false, completed_at: null, completed_by: null }).catch(() => {});
      }
    }
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
      setSelectedOrder((prev) => prev ? { ...prev, order_items: (prev.order_items || []).map((i) => i.id === item.id ? { ...i, quantity: item.quantity, plating: item.plating, stone_color: item.stone_color } : i) } : prev);
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
      setSelectedOrder((prev) => prev ? { ...prev, order_items: (prev.order_items || []).filter((i) => i.id !== itemId) } : prev);
      setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, order_items: (o.order_items || []).filter((i) => i.id !== itemId) } : o));
      const hist = await fetchOrderHistory(selectedOrder.id);
      setHistory(hist || []);
    } catch (e) { alert('Remove failed: ' + e.message); }
    finally { setSavingOrder(false); }
  }

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
        setSelectedOrder(updated);
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

  // Compute from orderDetail.items (live) if available, otherwise from order.order_items
  function orderTotal(order) {
    const items = (orderDetail && selectedOrder && order.id === selectedOrder.id)
      ? orderDetail.items
      : (order.order_items || []);
    return items.reduce((sum, item) => {
      const price = item.products?.price || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }

  function isOverdue(order) {
    if (!order.due_date) return false;
    if (['delivered', 'cancelled'].includes(order.status)) return false;
    return new Date(order.due_date + 'T00:00:00') < new Date();
  }

  // An order is "active" if it still needs action: not delivered, not cancelled, or unpaid
  function isActiveOrder(o) {
    if (o.status === 'cancelled') return false;
    if (o.status === 'delivered' && o.payment_status === 'paid') return false;
    return true;
  }

  const filteredOrders = orders
    .filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchSearch = !searchQ || (o.clients?.name || '').toLowerCase().includes(searchQ.toLowerCase());
      return matchStatus && matchSearch;
    });

  const activeOrders = filteredOrders
    .filter(isActiveOrder)
    .sort((a, b) => {
      const aOverdue = isOverdue(a), bOverdue = isOverdue(b);
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const completedOrders = filteredOrders
    .filter((o) => !isActiveOrder(o))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Active Orders</h3>
            <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-bold">{activeOrders.length}</span>
          </div>
          <div className="space-y-2 mb-8">
            {activeOrders.map((order) => <OrderCard key={order.id} order={order} pendingRequests={pendingRequests} isOverdue={isOverdue} orderTotal={orderTotal} openOrderDetail={openOrderDetail} />)}
          </div>
        </>
      )}

      {/* Completed / Cancelled Orders */}
      {completedOrders.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3 mt-2">
            <h3 className="text-sm font-semibold text-gray-400">Completed</h3>
            <span className="rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-xs font-medium">{completedOrders.length}</span>
          </div>
          <div className="space-y-2 opacity-70">
            {completedOrders.map((order) => <OrderCard key={order.id} order={order} pendingRequests={pendingRequests} isOverdue={isOverdue} orderTotal={orderTotal} openOrderDetail={openOrderDetail} />)}
          </div>
        </>
      )}

      {/* Order Detail Panel — full-width overlay */}
      {selectedOrder && orderDetail && (
        <div className="fixed inset-0 z-50 flex bg-black/30" onClick={closeDetail}>
          <div className="relative flex h-full w-full max-w-5xl ml-auto bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            {/* ═══ LEFT COLUMN: Items + sub-tabs (60%) ═══ */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">

              {/* Header */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900 text-lg truncate">{selectedOrder.clients?.name}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[orderDetail.status] || 'bg-gray-100 text-gray-600'}`}>
                      {orderDetail.status}
                    </span>
                    {isOverdue(selectedOrder) && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5">Overdue</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{selectedOrder.id} · {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                {saveIndicator === 'saving' && <span className="text-xs text-gray-400">Saving…</span>}
                {saveIndicator === 'saved' && <span className="text-xs text-green-500">✓ Saved</span>}
                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-700 text-xl leading-none ml-1">✕</button>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 border-b border-gray-100 px-5 bg-gray-50/50">
                {[
                  ['items', `Items (${orderDetail.items.length})`],
                  ['requests', `Requests${changeRequests.filter((r) => r.status === 'pending').length ? ` (${changeRequests.filter((r) => r.status === 'pending').length})` : ''}`],
                  ['history', 'History'],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setDetailTab(key)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${detailTab === key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content — scrollable */}
              <div className="flex-1 overflow-y-auto">

                {/* Items tab */}
                {detailTab === 'items' && (
                  <div className="p-5 space-y-3">
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
                          {!item._editing && item.products?.price > 0 && (
                            <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                              ${((item.products.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          )}
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
                                {savingOrder ? 'Saving…' : 'Save'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {orderDetail.items.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">No items in this order.</p>
                    )}

                    {/* Add item */}
                    {!addingItem ? (
                      <button onClick={() => setAddingItem(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                        <PlusIcon className="h-4 w-4" /> Add Item
                      </button>
                    ) : (
                      <div className="rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <input autoFocus value={itemSearch} onChange={(e) => setItemSearch(e.target.value)}
                            placeholder="Search product to add…" className="flex-1 bg-transparent text-sm focus:outline-none" />
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
                            <p className="text-xs text-gray-400 text-center py-4">Start typing to search</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Change Requests tab */}
                {detailTab === 'requests' && (
                  <div className="p-5 space-y-3">
                    {changeRequests.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">No change requests.</p>
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
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">Approve</button>
                              <button onClick={() => resolveRequest(req, 'rejected')} disabled={savingOrder}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* History tab */}
                {detailTab === 'history' && (
                  <div className="p-5">
                    {history.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">No changes recorded yet.</p>
                    )}
                    <div className="relative">
                      {history.length > 0 && <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-100" />}
                      <div className="space-y-0">
                        {history.map((h) => {
                          const isToday = new Date(h.created_at).toDateString() === new Date().toDateString();
                          const timeStr = isToday
                            ? new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                          const isClient = h.changed_by !== 'Admin';
                          return (
                            <div key={h.id} className="flex gap-4 pb-4 relative">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white ${isClient ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <span className={`text-xs font-bold ${isClient ? 'text-blue-600' : 'text-gray-500'}`}>{isClient ? 'C' : 'A'}</span>
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

            {/* ═══ RIGHT COLUMN: Order management (40%) ═══ */}
            <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col overflow-y-auto bg-gray-50/50">

              {/* Payment summary card */}
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</span>
                  <select value={orderDetail.payment_status}
                    onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, payment_status: v } : d); saveField('payment_status', v); }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 focus:outline-none cursor-pointer ${
                      orderDetail.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                      orderDetail.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'}`}>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">${orderTotal(selectedOrder).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Paid</span>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input type="number" step="0.01" value={orderDetail.amount_paid}
                        onChange={(e) => { const v = parseFloat(e.target.value) || 0; setOrderDetail((d) => d ? { ...d, amount_paid: v } : d); saveFieldDebounced('amount_paid', v); }}
                        className="w-full rounded-lg border border-gray-200 pl-5 pr-2 py-1 text-sm text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                  </div>
                  {(() => {
                    const total = orderTotal(selectedOrder);
                    const paid = orderDetail.amount_paid || 0;
                    const balance = total - paid;
                    if (total <= 0) return null;
                    return (
                      <div className={`flex justify-between text-sm pt-2 border-t border-gray-200 font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        <span>{balance > 0 ? 'Balance' : 'Paid in Full'}</span>
                        <span>${Math.abs(balance).toLocaleString()}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Status & Production */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Order</label>
                    <select value={orderDetail.status} onChange={(e) => changeStatus(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none">
                      {['pending','confirmed','shipped','delivered','cancelled'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Production</label>
                    <select value={orderDetail.production_status}
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, production_status: v } : d); saveField('production_status', v); }}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none">
                      {[['pending','Pending'],['confirmed','Confirmed'],['in_production','In Production'],['ready','Ready'],['shipped','Shipped'],['delivered','Delivered']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                  <input type="date" value={orderDetail.due_date}
                    onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, due_date: v } : d); saveFieldDebounced('due_date', v); }}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none" />
                </div>
              </div>

              {/* ── Production Workflow ── */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Production Workflow</span>
                {(() => {
                  const clientName = selectedOrder.clients?.name || 'Client';
                  const hasFactoryFile = orderFiles.some((f) => f.file_type === 'factory_sheet');
                  const isConfirmed = orderDetail.status !== 'pending' && orderDetail.status !== 'cancelled';
                  const isShipped = orderDetail.status === 'shipped' || orderDetail.status === 'delivered';

                  // Steps: auto = derived from data, manual = toggled by user
                  const WORKFLOW_STEPS = [
                    { key: 'order_confirmed', label: 'Order Confirmed', desc: 'Order status set to confirmed', auto: true, check: () => isConfirmed,
                      msg: `Hi ${clientName}! Your order #${selectedOrder.id} has been confirmed and we're getting started!` },
                    { key: 'factory_file_ready', label: 'Factory File Ready', desc: 'Production file uploaded', auto: true, check: () => hasFactoryFile, msg: null },
                    { key: 'sent_to_production', label: 'Sent to Production', desc: 'Basket handed off to factory',
                      msg: `Hi ${clientName}! Your order #${selectedOrder.id} has been sent to production!` },
                    { key: 'production_complete', label: 'Production Complete', desc: 'Basket back from factory',
                      msg: `Hi ${clientName}! Production on your order #${selectedOrder.id} is complete! Moving to finishing.` },
                    { key: 'finishing', label: 'Finishing', desc: 'Stone gluing, cleaning, final touches',
                      msg: `Hi ${clientName}! Your order #${selectedOrder.id} is in final finishing stage!` },
                    { key: 'qc_passed', label: 'QC Passed', desc: 'Quality check completed',
                      msg: `Hi ${clientName}! Your order #${selectedOrder.id} passed quality control!` },
                    { key: 'packed', label: 'Packed & Ready', desc: 'Ready to ship', auto: true, check: () => isShipped,
                      msg: `Hi ${clientName}! Your order #${selectedOrder.id} is packed and ready to ship!` },
                  ];

                  const stepsMap = {};
                  workflowSteps.forEach((s) => { stepsMap[s.step_key] = s; });

                  // Determine completion for each step
                  const stepStatuses = WORKFLOW_STEPS.map((step) => {
                    if (step.auto) return { ...step, done: step.check() };
                    return { ...step, done: stepsMap[step.key]?.completed || false };
                  });
                  const completedCount = stepStatuses.filter((s) => s.done).length;
                  const progress = Math.round((completedCount / WORKFLOW_STEPS.length) * 100);
                  const firstIncomplete = stepStatuses.findIndex((s) => !s.done);

                  async function toggleManualStep(stepKey, currentlyCompleted) {
                    const newVal = !currentlyCompleted;
                    try {
                      await upsertWorkflowStep(selectedOrder.id, stepKey, {
                        completed: newVal,
                        completed_at: newVal ? new Date().toISOString() : null,
                        completed_by: newVal ? 'admin' : null,
                      });
                      setWorkflowSteps((prev) => {
                        const existing = prev.find((s) => s.step_key === stepKey);
                        if (existing) return prev.map((s) => s.step_key === stepKey ? { ...s, completed: newVal, completed_at: newVal ? new Date().toISOString() : null } : s);
                        return [...prev, { step_key: stepKey, completed: newVal, completed_at: new Date().toISOString(), order_id: selectedOrder.id }];
                      });
                    } catch (e) { console.error('Workflow step error:', e); }
                  }

                  async function saveStepNote(stepKey, note) {
                    try {
                      await upsertWorkflowStep(selectedOrder.id, stepKey, { notes: note });
                      setWorkflowSteps((prev) => {
                        const existing = prev.find((s) => s.step_key === stepKey);
                        if (existing) return prev.map((s) => s.step_key === stepKey ? { ...s, notes: note } : s);
                        return [...prev, { step_key: stepKey, completed: false, notes: note, order_id: selectedOrder.id }];
                      });
                    } catch (e) { console.error('Note save error:', e); }
                  }

                  function copyMsg(text) {
                    navigator.clipboard.writeText(text).catch(() => {});
                  }

                  async function handleFileUpload(e) {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingFile(true);
                    try {
                      const result = await uploadOrderFile(file, selectedOrder.id, 'factory_sheet', null);
                      setOrderFiles((prev) => [].concat(result).concat(prev));
                    } catch (err) { alert('Upload failed: ' + err.message); }
                    finally { setUploadingFile(false); e.target.value = ''; }
                  }

                  async function handleDeleteFile(fileId) {
                    if (!window.confirm('Delete this file?')) return;
                    try {
                      await deleteOrderFile(fileId);
                      setOrderFiles((prev) => prev.filter((f) => f.id !== fileId));
                    } catch (e) { alert('Delete failed'); }
                  }

                  function generateFactorySheet() {
                    const items = orderDetail?.items || selectedOrder.order_items || [];
                    const grouped = {};
                    items.forEach((item) => {
                      const key = item.products?.name || 'Unknown';
                      if (!grouped[key]) grouped[key] = { name: key, image: item.products?.image_url, items: [] };
                      grouped[key].items.push(item);
                    });
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.write(`<!DOCTYPE html><html><head><title>Factory Sheet - Order #${selectedOrder.id}</title>
                      <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 8.5in; margin: 0 auto; }
                        .header { border-bottom: 3px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
                        .header h1 { font-size: 24px; margin-bottom: 8px; }
                        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 13px; }
                        .product { border: 2px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
                        .product h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
                        .product h2 img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
                        table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f5f5f5; }
                        .check { width: 28px; height: 28px; border: 2px solid #999; border-radius: 4px; margin: 0 auto; display: block; }
                        .subtotal { text-align: right; font-weight: bold; margin-top: 8px; font-size: 13px; }
                        .notes-row td { height: 40px; }
                        .footer { margin-top: 24px; border-top: 2px solid #111; padding-top: 12px; font-size: 12px; }
                        .editable { border: 1px dashed #aaa; min-height: 24px; padding: 4px 6px; font-size: 12px; }
                        @media print { .no-print { display: none !important; } }
                      </style></head><body>
                      <div class="header">
                        <h1>PRODUCTION ORDER #${selectedOrder.id}</h1>
                        <div class="meta">
                          <div><strong>Client:</strong> ${clientName}</div>
                          <div><strong>Due:</strong> ${selectedOrder.due_date ? new Date(selectedOrder.due_date).toLocaleDateString() : 'Not set'}</div>
                          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                          <div><strong>Total Items:</strong> ${items.reduce((s, i) => s + (i.quantity || 0), 0)} pcs</div>
                        </div>
                        <div style="margin-top:8px"><strong>Special Instructions:</strong> <span class="editable" contenteditable="true">${selectedOrder.admin_notes || 'Click to add...'}</span></div>
                      </div>
                      ${Object.values(grouped).map((g) => `
                        <div class="product">
                          <h2>${g.image ? `<img src="${g.image}" />` : ''}${g.name}</h2>
                          <table>
                            <thead><tr><th>Qty</th><th>Plating</th><th>Stone</th><th>Notes</th><th style="width:50px;text-align:center">Done</th></tr></thead>
                            <tbody>
                              ${g.items.map((i) => `<tr>
                                <td style="font-weight:bold;font-size:16px">${i.quantity || 1}</td>
                                <td>${i.plating || '—'}</td>
                                <td>${i.stone_color || '—'}</td>
                                <td><span class="editable" contenteditable="true">${i.notes || ''}</span></td>
                                <td><div class="check"></div></td>
                              </tr>`).join('')}
                              <tr class="notes-row"><td colspan="5"><strong>Product Notes:</strong> <span class="editable" contenteditable="true">Click to add notes...</span></td></tr>
                            </tbody>
                          </table>
                          <div class="subtotal">Subtotal: ${g.items.reduce((s, i) => s + (i.quantity || 0), 0)} pcs</div>
                        </div>
                      `).join('')}
                      ${selectedOrder.notes ? `<div class="footer"><strong>Client Notes:</strong> ${selectedOrder.notes}</div>` : ''}
                      <div class="no-print" style="margin-top:24px;display:flex;gap:12px">
                        <button onclick="window.print()" style="background:#111;color:#fff;padding:10px 24px;border:none;border-radius:8px;font-size:14px;cursor:pointer">Print / Save PDF</button>
                        <button onclick="window.close()" style="padding:10px 24px;border:1px solid #ccc;border-radius:8px;font-size:14px;cursor:pointer">Close</button>
                      </div>
                    </body></html>`);
                    w.document.close();
                  }

                  // Time between completed manual steps
                  const stepTimes = [];
                  const allKeys = WORKFLOW_STEPS.map((s) => s.key);
                  for (let i = 1; i < allKeys.length; i++) {
                    const prevData = stepsMap[allKeys[i - 1]];
                    const currData = stepsMap[allKeys[i]];
                    if (prevData?.completed_at && currData?.completed_at) {
                      const diff = new Date(currData.completed_at) - new Date(prevData.completed_at);
                      const hours = Math.round(diff / 3600000);
                      if (hours > 0) stepTimes.push({ from: WORKFLOW_STEPS[i - 1].label, to: WORKFLOW_STEPS[i].label, hours });
                    }
                  }

                  return (
                    <>
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{completedCount}/{WORKFLOW_STEPS.length}</span>
                      </div>

                      {/* Steps */}
                      <div className="space-y-1">
                        {stepStatuses.map((step, idx) => {
                          const data = stepsMap[step.key];
                          const done = step.done;
                          const isAuto = step.auto;
                          const isCurrent = idx === firstIncomplete;
                          return (
                            <div key={step.key} className={`rounded-lg transition-colors ${
                              done ? 'bg-green-50' : isCurrent ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                            }`}>
                              <div className={`flex items-start gap-2.5 p-2 ${!isAuto ? 'cursor-pointer' : ''} ${done ? 'hover:bg-green-100' : isCurrent && !isAuto ? 'hover:bg-blue-100' : !isAuto ? 'hover:bg-gray-50' : ''}`}
                                onClick={() => { if (!isAuto) toggleManualStep(step.key, done); }}
                              >
                                <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  done ? 'bg-green-500 border-green-500' :
                                  isCurrent ? 'border-blue-400' : 'border-gray-300'
                                }`}>
                                  {done && <CheckCircleIcon className="h-4 w-4 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className={`text-sm font-medium ${done ? 'text-green-700 line-through' : isCurrent ? 'text-blue-700' : 'text-gray-600'}`}>
                                      {step.label}
                                    </p>
                                    {isAuto && <span className="text-xs text-gray-300 italic">auto</span>}
                                  </div>
                                  <p className="text-xs text-gray-400">{step.desc}</p>
                                  {done && data?.completed_at && (
                                    <p className="text-xs text-green-600 mt-0.5">{new Date(data.completed_at).toLocaleDateString()} {new Date(data.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  )}
                                  {data?.notes && <p className="text-xs text-gray-500 mt-0.5 italic">Note: {data.notes}</p>}
                                </div>
                              </div>
                              {/* Note input + message — show for done or current manual steps */}
                              {(done || isCurrent) && !isAuto && (
                                <div className="px-2 pb-2 pl-9 space-y-1.5">
                                  <input type="text" placeholder="Add a note..." defaultValue={data?.notes || ''}
                                    onBlur={(e) => { if (e.target.value !== (data?.notes || '')) saveStepNote(step.key, e.target.value); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-300 bg-white/80" />
                                </div>
                              )}
                              {/* Message suggestion for completed steps */}
                              {done && step.msg && (
                                <div className="px-2 pb-2 pl-9">
                                  <button onClick={(e) => { e.stopPropagation(); copyMsg(step.msg); }}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-1">
                                    <ClipboardDocumentListIcon className="h-3.5 w-3.5" /> Copy update message
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Time tracking between steps */}
                      {stepTimes.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-400 mb-1">Step timing</p>
                          <div className="space-y-0.5">
                            {stepTimes.map((t, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{t.from} → {t.to}</span>
                                <span className={`font-medium ${t.hours > 48 ? 'text-amber-600' : 'text-gray-600'}`}>{t.hours < 24 ? `${t.hours}h` : `${Math.round(t.hours / 24)}d`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Factory Files */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500">Factory Files</span>
                          <div className="flex items-center gap-1.5">
                            <button onClick={generateFactorySheet}
                              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                              Generate
                            </button>
                            <label className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg cursor-pointer transition-colors ${uploadingFile ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                              <PlusIcon className="h-3.5 w-3.5" />
                              {uploadingFile ? 'Uploading...' : 'Upload'}
                              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx" />
                            </label>
                          </div>
                        </div>
                        {orderFiles.filter((f) => f.file_type === 'factory_sheet').length === 0 && (
                          <p className="text-xs text-amber-500 italic">No factory file uploaded yet</p>
                        )}
                        <div className="space-y-1.5">
                          {orderFiles.map((f) => (
                            <div key={f.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
                              <a href={f.file_url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 text-xs font-medium text-blue-600 hover:underline truncate">
                                {f.file_name}
                              </a>
                              <span className="text-xs text-gray-400 shrink-0">{new Date(f.created_at).toLocaleDateString()}</span>
                              <button onClick={() => handleDeleteFile(f.id)} className="text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Shipping */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shipping</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Tracking #</label>
                    <input type="text" value={orderDetail.tracking_number} placeholder="e.g., 1Z999AA…"
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, tracking_number: v } : d); saveFieldDebounced('tracking_number', v); }}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Carrier</label>
                    <input type="text" value={orderDetail.carrier} placeholder="DHL, FedEx…"
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, carrier: v } : d); saveFieldDebounced('carrier', v); }}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ship Date</label>
                    <input type="date" value={orderDetail.shipped_date ? orderDetail.shipped_date.split('T')[0] : ''}
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, shipped_date: v } : d); saveFieldDebounced('shipped_date', v ? new Date(v).toISOString() : null); }}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Issues */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issues</span>
                  <button onClick={() => {
                    const newVal = !orderDetail.has_issues;
                    setOrderDetail((d) => d ? { ...d, has_issues: newVal, issue_description: newVal ? d.issue_description : '' } : d);
                    saveField('has_issues', newVal);
                    if (!newVal) saveField('issue_description', '');
                  }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${orderDetail.has_issues ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {orderDetail.has_issues ? 'Has Issues' : 'No Issues'}
                  </button>
                </div>
                {orderDetail.has_issues && (
                  <>
                    <select value={orderDetail.resolution_status}
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, resolution_status: v } : d); saveField('resolution_status', v); }}
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none">
                      <option value="pending">Pending Resolution</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <textarea value={orderDetail.issue_description}
                      onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, issue_description: v } : d); saveFieldDebounced('issue_description', v, 1000); }}
                      rows={2} placeholder="Describe the issue…"
                      className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none resize-none" />
                  </>
                )}
              </div>

              {/* Communication */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Communication</span>
                  <button onClick={() => toggleBoolean('contacted')}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${orderDetail.contacted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {orderDetail.contacted ? '✓ Contacted' : 'Not Contacted'}
                  </button>
                </div>
                {selectedOrder.clients?.whatsapp && (
                  <>
                    <a href={`https://wa.me/${selectedOrder.clients.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
                      📱 Open WhatsApp Chat
                    </a>
                    <QuickMessages selectedOrder={selectedOrder} orderDetail={orderDetail} orderTotal={orderTotal} />
                  </>
                )}
              </div>

              {/* Print / Export */}
              <div className="p-4 border-b border-gray-100 bg-white space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Print / Export</span>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`/invoice/${selectedOrder.id}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <BanknotesIcon className="h-4 w-4" /> Invoice
                  </a>
                  <a href={`/factory-print/${selectedOrder.id}`} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <ClipboardDocumentListIcon className="h-4 w-4" /> Factory Sheet
                  </a>
                </div>
              </div>

              {/* Admin notes */}
              <div className="p-4 bg-white flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                <textarea value={orderDetail.admin_notes}
                  onChange={(e) => { const v = e.target.value; setOrderDetail((d) => d ? { ...d, admin_notes: v } : d); saveFieldDebounced('admin_notes', v, 1000); }}
                  rows={3} placeholder="Internal notes…"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
