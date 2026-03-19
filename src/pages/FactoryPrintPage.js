import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrdersWithItemsFull } from '../lib/supabase';

export default function FactoryPrintPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const orders = await fetchOrdersWithItemsFull();
        const found = orders.find((o) => String(o.id) === String(orderId));
        setOrder(found || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  useEffect(() => {
    // Auto-print when loaded
    if (order && !loading) {
      setTimeout(() => window.print(), 500);
    }
  }, [order, loading]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center">Order not found.</div>;
  }

  // Group items by product for easier factory reading
  const grouped = {};
  (order.order_items || []).forEach((item) => {
    const key = item.products?.name || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
        }
        @media screen {
          .factory-print { max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; }
        }
      `}</style>

      <div className="factory-print">
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-900 pb-4">
          <h1 className="text-3xl font-bold">PRODUCTION ORDER</h1>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Order #:</strong> {order.id}</p>
              <p><strong>Client:</strong> {order.clients?.name || 'N/A'}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Due Date:</strong> {order.due_date ? new Date(order.due_date).toLocaleDateString() : 'Not set'}</p>
              <p><strong>Production Status:</strong> {order.production_status || 'pending'}</p>
              <p><strong>Total Items:</strong> {order.order_items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0}</p>
            </div>
          </div>
        </div>

        {/* Items by product */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([productName, items], idx) => (
            <div key={idx} className="border-2 border-gray-300 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-3 border-b border-gray-300 pb-2">{productName}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2">Quantity</th>
                    <th className="text-left py-2">Plating</th>
                    <th className="text-left py-2">Stone Color</th>
                    <th className="text-left py-2">Notes</th>
                    <th className="text-center py-2 w-16">✓</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-3 font-bold text-lg">{item.quantity}</td>
                      <td className="py-3">{item.plating || '—'}</td>
                      <td className="py-3">{item.stone_color || '—'}</td>
                      <td className="py-3 text-xs">{item.notes || ''}</td>
                      <td className="py-3 text-center">
                        <div className="w-8 h-8 border-2 border-gray-400 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right font-bold">
                Subtotal: {items.reduce((sum, i) => sum + (i.quantity || 0), 0)} pieces
              </div>
            </div>
          ))}
        </div>

        {/* Footer notes */}
        {order.notes && (
          <div className="mt-8 border-t-2 border-gray-900 pt-4">
            <p className="text-sm"><strong>Client Notes:</strong> {order.notes}</p>
          </div>
        )}
        {order.admin_notes && (
          <div className="mt-2">
            <p className="text-sm"><strong>Admin Notes:</strong> {order.admin_notes}</p>
          </div>
        )}

        {/* Print button (hidden when printing) */}
        <div className="no-print mt-8 flex gap-4">
          <button onClick={() => window.print()}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700">
            Print
          </button>
          <button onClick={() => navigate('/admin')}
            className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50">
            Back to Admin
          </button>
        </div>
      </div>
    </>
  );
}
