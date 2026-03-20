import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrdersWithItemsFull } from '../lib/supabase';

export default function InvoicePage() {
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
    if (order && !loading) {
      setTimeout(() => window.print(), 600);
    }
  }, [order, loading]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  const items = order.order_items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.products?.price || 0) * (i.quantity || 1), 0);
  const totalAmount = order.total_amount || subtotal;
  const amountPaid = order.amount_paid || 0;
  const balanceDue = totalAmount - amountPaid;
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = order.due_date ? new Date(order.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Upon receipt';

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        @media screen {
          .invoice-page { max-width: 8.5in; margin: 0 auto; padding: 0.75in; background: white; min-height: 11in; }
        }
        .invoice-page { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; }
        .invoice-page table { border-collapse: collapse; width: 100%; }
        .invoice-page th { text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
        .invoice-page td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .invoice-page .totals td { border-bottom: none; }
      `}</style>

      <div className="invoice-page">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>GJ Style</h1>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wholesale Jewelry</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#111' }}>INVOICE</h2>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>#{order.id}</p>
          </div>
        </div>

        {/* Bill To + Invoice Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: 8 }}>Bill To</p>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{order.clients?.name || 'N/A'}</p>
            {order.clients?.whatsapp && <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>WhatsApp: {order.clients.whatsapp}</p>}
            {order.clients?.instagram && <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>Instagram: @{order.clients.instagram}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto', gap: '6px 20px', textAlign: 'left' }}>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Invoice Date</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{invoiceDate}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Due Date</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{dueDate}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Status</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: order.payment_status === 'paid' ? '#059669' : order.payment_status === 'partial' ? '#d97706' : '#dc2626' }}>
                {(order.payment_status || 'unpaid').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Product</th>
              <th>Plating</th>
              <th>Stone</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const price = item.products?.price || 0;
              const qty = item.quantity || 1;
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{item.products?.name || 'Unknown'}</td>
                  <td style={{ color: '#6b7280' }}>{item.plating || '—'}</td>
                  <td style={{ color: '#6b7280' }}>{item.stone_color || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{qty}</td>
                  <td style={{ textAlign: 'right' }}>${Math.round(price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>${Math.round(price * qty)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ width: 280 }} className="totals">
            <tbody>
              <tr>
                <td style={{ fontSize: 12, color: '#6b7280' }}>Subtotal</td>
                <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>${Math.round(subtotal)}</td>
              </tr>
              {totalAmount !== subtotal && (
                <tr>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>Total</td>
                  <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>${Math.round(totalAmount)}</td>
                </tr>
              )}
              {amountPaid > 0 && (
                <tr>
                  <td style={{ fontSize: 12, color: '#059669' }}>Paid</td>
                  <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: '#059669' }}>-${Math.round(amountPaid)}</td>
                </tr>
              )}
              <tr>
                <td style={{ fontSize: 14, fontWeight: 700, paddingTop: 12, borderTop: '2px solid #111' }}>Balance Due</td>
                <td style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, paddingTop: 12, borderTop: '2px solid #111' }}>${Math.round(balanceDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ marginTop: 40, borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: 6 }}>Notes</p>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, textAlign: 'center', fontSize: 10, color: '#9ca3af' }}>
          <p>Thank you for your business</p>
          <p style={{ marginTop: 4 }}>GJ Style Wholesale Jewelry</p>
        </div>

        {/* Print button */}
        <div className="no-print" style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <button onClick={() => window.print()}
            style={{ background: '#111', color: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>
            Print / Save as PDF
          </button>
          <button onClick={() => navigate('/admin')}
            style={{ background: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid #d1d5db', cursor: 'pointer' }}>
            Back to Admin
          </button>
        </div>
      </div>
    </>
  );
}
