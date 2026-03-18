import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchClientOrdersFull,
  fetchChangeRequests,
  fetchOrderHistory,
  createChangeRequest,
} from '../lib/supabase';
import { ChevronDownIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const STATUS_COLORS = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped:   'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const REQUEST_TYPES = [
  'Change Plating',
  'Change Stone Color',
  'Change Quantity',
  'Remove Item',
  'Add Item',
  'Other',
];

function orderTotal(order) {
  return (order.order_items || []).reduce((sum, item) => {
    return sum + (item.products?.price || 0) * (item.quantity || 1);
  }, 0);
}

function parseAdminUpdates(history) {
  return history
    .filter((h) => h.changed_by === 'Admin')
    .filter((h) => {
      const d = h.description || '';
      return (
        d.startsWith('Edited item') ||
        d.startsWith('Added item') ||
        d.startsWith('Removed item') ||
        d.startsWith('Status changed') ||
        d.startsWith('Change request approved') ||
        d.startsWith('Change request rejected')
      );
    })
    .map((h) => {
      const d = h.description || '';
      let text = d;
      if (d.startsWith('Edited item ')) {
        const match = d.match(/Edited item (.+?):\s*(.+)/);
        if (match) {
          const name = match[1];
          const changes = match[2].split(',').map((part) => {
            const [k, v] = part.trim().split('=');
            if (k === 'qty') return `quantity → ${v}`;
            if (k === 'plating') return `plating → ${v}`;
            if (k === 'stone') return `stone → ${v}`;
            return null;
          }).filter(Boolean).join(', ');
          text = `${name}: ${changes}`;
        }
      } else if (d.startsWith('Added item ')) {
        text = `Added: ${d.replace('Added item ', '')}`;
      } else if (d.startsWith('Removed item ')) {
        text = `Removed: ${d.replace('Removed item ', '')}`;
      } else if (d.startsWith('Status changed to ')) {
        const s = d.replace('Status changed to ', '');
        text = `Order status → ${s.charAt(0).toUpperCase() + s.slice(1)}`;
      } else if (d.startsWith('Change request approved')) {
        const match = d.match(/"(.+)"/);
        text = match ? `Your request was approved: "${match[1]}"` : 'A change request was approved';
      } else if (d.startsWith('Change request rejected')) {
        const match = d.match(/"(.+)"/);
        text = match ? `Your request was declined: "${match[1]}"` : 'A change request was declined';
      }
      return { text, date: h.created_at };
    });
}

export default function OrdersPage() {
  const { client } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [orderExtras, setOrderExtras] = useState({});
  const [requestModal, setRequestModal] = useState(null);
  const [requestForm, setRequestForm] = useState({ type: REQUEST_TYPES[0], description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!client?.id) return;
    fetchClientOrdersFull(client.id)
      .then((data) => setOrders(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [client]);

  async function toggleOrder(order) {
    const isOpen = expanded === order.id;
    setExpanded(isOpen ? null : order.id);
    if (!isOpen && !orderExtras[order.id]) {
      try {
        const [reqs, hist] = await Promise.all([
          fetchChangeRequests(order.id),
          fetchOrderHistory(order.id),
        ]);
        setOrderExtras((prev) => ({
          ...prev,
          [order.id]: { reqs: reqs || [], updates: parseAdminUpdates(hist || []) },
        }));
      } catch (e) { console.error(e); }
    }
  }

  async function submitRequest() {
    if (!requestForm.description.trim()) return alert('Please describe your request.');
    setSubmitting(true);
    try {
      await createChangeRequest({
        order_id: requestModal.id,
        client_id: client.id,
        request_type: requestForm.type,
        description: requestForm.description.trim(),
        status: 'pending',
      });
      const reqs = await fetchChangeRequests(requestModal.id);
      setOrderExtras((prev) => ({
        ...prev,
        [requestModal.id]: { ...(prev[requestModal.id] || {}), reqs: reqs || [] },
      }));
      setRequestModal(null);
    } catch (e) { alert('Failed to submit: ' + e.message); }
    finally { setSubmitting(false); }
  }

  // Dashboard stats
  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const nextDue = activeOrders
    .filter((o) => o.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const totalSpend = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + orderTotal(o), 0);

  const filteredOrders = orders.filter((o) =>
    !search || `order #${o.id}`.includes(search.toLowerCase()) ||
    new Date(o.created_at).toLocaleDateString().includes(search) ||
    (o.status || '').includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {/* Dashboard summary */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeOrders.filter((o) => o.status === 'pending').length} pending
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Next Due</p>
              {nextDue ? (
                <>
                  <p className="text-base font-bold text-orange-500">
                    {new Date(nextDue.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{nextDue.id}</p>
                </>
              ) : (
                <p className="text-base font-bold text-gray-300">—</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="text-base font-bold text-gray-900">
                {totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{orders.filter(o => o.status !== 'cancelled').length} orders</p>
            </div>
          </div>
        )}

        {/* Search */}
        {orders.length > 2 && (
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, status, date…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:border-gray-400 focus:outline-none shadow-sm"
            />
          </div>
        )}

        {orders.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
            <p className="text-lg font-medium mb-1">No orders yet</p>
            <p className="text-sm">Your orders will appear here once placed.</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isOpen = expanded === order.id;
            const extras = orderExtras[order.id];
            const reqs = extras?.reqs || [];
            const updates = extras?.updates || [];
            const pendingReqs = reqs.filter((r) => r.status === 'pending');
            const canRequest = ['pending', 'confirmed'].includes(order.status);
            const total = orderTotal(order);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

                {/* Order header */}
                <div className="px-5 py-4 cursor-pointer select-none" onClick={() => toggleOrder(order)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">Order #{order.id}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                        {pendingReqs.length > 0 && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                            {pendingReqs.length} pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          {' · '}{(order.order_items || []).length} item{(order.order_items || []).length !== 1 ? 's' : ''}
                        </span>
                        {order.due_date && (
                          <span className="text-xs font-medium text-orange-500">
                            · Due {new Date(order.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {total > 0 && (
                          <span className="text-xs font-semibold text-gray-600">· ${total.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform mt-1 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-gray-100">

                    {/* Admin updates banner */}
                    {updates.length > 0 && (
                      <div className="mx-5 mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Updated by GJ Style</p>
                        <div className="space-y-1.5">
                          {updates.map((u, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-blue-800">{u.text}</span>
                                <span className="text-xs text-blue-400 ml-2">
                                  {new Date(u.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="px-5 py-4 space-y-3">
                      {order.notes && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">"{order.notes}"</p>
                      )}
                      {(order.order_items || []).map((item) => {
                        const lineTotal = (item.products?.price || 0) * (item.quantity || 1);
                        return (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                              {item.products?.image_url
                                ? <img src={item.products.image_url} alt={item.products?.name} className="h-full w-full object-cover" />
                                : <div className="h-full flex items-center justify-center text-2xl opacity-20">💍</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{item.products?.name}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                                {item.plating ? ` · ${item.plating}` : ''}
                                {item.stone_color ? ` · ${item.stone_color}` : ''}
                              </p>
                              {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                            </div>
                            {lineTotal > 0 && (
                              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">${lineTotal.toLocaleString()}</span>
                            )}
                          </div>
                        );
                      })}
                      {/* Order total line */}
                      {total > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Total</span>
                          <span className="text-base font-bold text-gray-900">${total.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Change requests */}
                    {reqs.length > 0 && (
                      <div className="border-t border-gray-100 px-5 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Your Requests</p>
                        <div className="space-y-2">
                          {reqs.map((req) => (
                            <div key={req.id} className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700">{req.request_type}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'}`}>
                                  {req.status === 'pending' ? 'Pending review' : req.status === 'approved' ? 'Approved' : 'Declined'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                              {req.admin_note && req.status !== 'pending' && (
                                <p className="text-xs text-gray-400 mt-1 italic">Note: {req.admin_note}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request change button */}
                    <div className="border-t border-gray-100 px-5 py-3">
                      {canRequest ? (
                        <button onClick={() => {
                          setRequestModal(order);
                          setRequestForm({ type: REQUEST_TYPES[0], description: '' });
                        }}
                          className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors w-full justify-center">
                          <PlusIcon className="h-4 w-4" />
                          Request a Change
                        </button>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-1">Changes can only be requested on pending or confirmed orders.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && orders.length > 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No orders match your search.</p>
          )}
        </div>
      </div>

      {/* Request Change Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
          onClick={() => setRequestModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Request a Change</h2>
            <p className="text-sm text-gray-400 mb-5">Order #{requestModal.id} — we'll review and update your order.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Change</label>
                <select value={requestForm.type}
                  onChange={(e) => setRequestForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400">
                  {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={requestForm.description}
                  onChange={(e) => setRequestForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="E.g. 'Change Ring-001 plating from Gold to Silver, qty 10 instead of 5.'"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRequestModal(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submitRequest} disabled={submitting}
                className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
