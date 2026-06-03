import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatEUR } from "../../lib/api";
import { toast } from "sonner";
import { StatusPill } from "./AdminDashboard";

const STATUSES = ["Pendiente", "Pagado", "Enviado", "Completado", "Cancelado"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    const { data } = await api.get(`/orders/admin/${id}`);
    setOrder(data);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/orders/admin/${id}/status`, { status });
      setOrder(data);
      toast.success("Estado actualizado");
    } catch (e) {
      toast.error("Error", { description: e?.response?.data?.detail });
    } finally { setUpdating(false); }
  };

  if (!order) return <div className="text-ink-soft">Cargando pedido…</div>;
  const addr = order.shipping_address || {};
  return (
    <div data-testid="admin-order-detail">
      <Link to="/admin/pedidos" className="text-sm text-sage-700" data-testid="back-to-orders">← Volver a pedidos</Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div>
          <div className="overline mb-1">Pedido</div>
          <h1 className="font-heading text-3xl font-light">{order.order_number}</h1>
          <div className="text-sm text-ink-soft mt-1">{new Date(order.created_at).toLocaleString("es-ES")}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-bone-200 p-6">
          <h2 className="font-heading text-xl font-normal mb-4">Productos</h2>
          <ul className="divide-y divide-bone-100">
            {order.items.map((it, i) => (
              <li key={i} className="py-4 flex gap-4 items-start" data-testid={`order-item-${it.sku}`}>
                <div className="w-16 h-16 bg-bone-100 overflow-hidden shrink-0">
                  {it.image_url && <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-ink">{it.name}</div>
                  {it.variation_name && <div className="text-xs text-ink-soft">{it.variation_name}</div>}
                  <div className="text-xs text-ink-soft">SKU: {it.sku}</div>
                </div>
                <div className="text-sm">{it.quantity} × {formatEUR(it.unit_price)}</div>
                <div className="text-sm font-medium">{formatEUR(it.unit_price * it.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-bone-200 pt-4 text-sm space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span>{formatEUR(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Envío</span><span>{formatEUR(order.shipping_cost)}</span></div>
            <div className="flex justify-between text-base font-medium pt-2 border-t border-bone-200"><span>Total</span><span>{formatEUR(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-bone-200 p-6">
            <h3 className="overline mb-3">Cliente</h3>
            <div className="text-sm text-ink">{addr.full_name}</div>
            <div className="text-sm text-ink-soft">{order.email}</div>
            {addr.phone && <div className="text-sm text-ink-soft">{addr.phone}</div>}
            <div className="text-xs uppercase tracking-[0.18em] text-sage-700 mt-2">{order.customer_type}</div>
          </div>
          <div className="bg-white border border-bone-200 p-6">
            <h3 className="overline mb-3">Envío</h3>
            <div className="text-sm text-ink-soft leading-relaxed">
              {addr.street}<br />
              {addr.postal_code} {addr.city}<br />
              {addr.province}, {addr.country}
            </div>
            {addr.notes && <div className="text-xs text-ink-muted mt-3">Notas: {addr.notes}</div>}
          </div>
          <div className="bg-white border border-bone-200 p-6">
            <h3 className="overline mb-3">Pago</h3>
            <div className="text-sm capitalize">{order.payment_method}</div>
            <div className="text-xs text-ink-soft">Estado: {order.payment_status}</div>
          </div>
          <div className="bg-white border border-bone-200 p-6">
            <h3 className="overline mb-3">Cambiar estado</h3>
            <select
              className="input-eco"
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              data-testid="order-status-select"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
