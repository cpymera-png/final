import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Truck, Store } from "lucide-react";
import { api, formatEUR } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { STORE } from "../data/storeInfo";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState(null);
  const [method, setMethod] = useState("stripe");
  const [delivery, setDelivery] = useState("shipping");
  const [form, setForm] = useState({
    email: user?.email || "",
    full_name: user ? `${user.first_name} ${user.last_name}` : "",
    phone: user?.phone || "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "España",
    notes: "",
  });

  const customerType = user?.role === "professional" ? "professional" : "retail";
  const isPickup = delivery === "pickup";

  useEffect(() => {
    if (items.length === 0) return;
    if (isPickup) {
      // Recogida en tienda: sin gastos de envío
      setShipping({ shipping_cost: 0, total: subtotal, free_shipping: true });
      return;
    }
    (async () => {
      const { data } = await api.post("/orders/shipping-quote", {
        subtotal,
        customer_type: customerType,
      });
      setShipping(data);
    })();
  }, [subtotal, customerType, items.length, isPickup]);

  // Si el cliente elige recogida, la transferencia (solo B2B) no aplica
  useEffect(() => {
    if (isPickup && method === "transfer") setMethod("stripe");
  }, [isPickup, method]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const shipping_address = isPickup
        ? {
            full_name: form.full_name,
            phone: form.phone,
            street: `${STORE.market} · ${STORE.addressLine1}`,
            city: "Madrid",
            province: "Madrid",
            postal_code: "28004",
            country: "España",
            notes: form.notes ? `Recogida en tienda · ${form.notes}` : "Recogida en tienda",
          }
        : {
            full_name: form.full_name,
            phone: form.phone,
            street: form.street,
            city: form.city,
            province: form.province,
            postal_code: form.postal_code,
            country: form.country,
            notes: form.notes,
          };
      const payload = {
        email: form.email,
        items: items.map((i) => ({
          product_id: i.product_id,
          sku: i.sku,
          name: i.name,
          variation_name: i.variation_name,
          unit_price: i.unit_price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
        shipping_address,
        customer_type: customerType,
        payment_method: method,
        delivery_method: delivery,
      };
      const { data: order } = await api.post("/orders", payload);

      if (method === "stripe") {
        const { data: sess } = await api.post("/payments/stripe/checkout", {
          order_id: order.id,
          origin_url: window.location.origin,
        });
        clearCart();
        window.location.href = sess.url;
        return;
      }
      if (method === "paypal") {
        const { data: pp } = await api.post("/payments/paypal/create", {
          order_id: order.id,
          origin_url: window.location.origin,
        });
        clearCart();
        window.location.href = pp.approve_url;
        return;
      }
      // transfer
      clearCart();
      toast.success("Pedido registrado", { description: "Te hemos enviado la confirmación por email." });
      nav(`/pago/success?order_number=${order.order_number}&transfer=1`);
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message;
      toast.error("No se pudo crear el pedido", { description: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center" data-testid="checkout-empty">
        <div className="overline mb-3">Checkout</div>
        <h1 className="font-heading text-3xl font-light">Tu cesta está vacía</h1>
        <p className="mt-3 text-ink-soft">Descubre el catálogo y vuelve al checkout cuando tengas productos.</p>
        <button className="btn-primary mt-8" onClick={() => nav("/tienda")} data-testid="checkout-empty-shop-btn">Ir a la tienda</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14" data-testid="checkout-page">
      <div className="overline mb-3">Finalizar compra</div>
      <h1 className="font-heading text-4xl font-light text-ink">Checkout</h1>
      {customerType === "professional" && (
        <div className="mt-4 inline-block px-4 py-1.5 text-xs uppercase tracking-[0.2em] bg-sage-100 text-sage-700 rounded-sm" data-testid="pro-badge">
          Cuenta profesional B2B
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <h2 className="font-heading text-xl font-normal mb-5">Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-eco md:col-span-2" type="email" placeholder="Email" required value={form.email} onChange={onChange("email")} data-testid="checkout-email" />
              <input className="input-eco" placeholder="Nombre y apellidos" required value={form.full_name} onChange={onChange("full_name")} data-testid="checkout-name" />
              <input className="input-eco" placeholder="Teléfono" value={form.phone} onChange={onChange("phone")} data-testid="checkout-phone" />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-normal mb-5">Método de entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="delivery-methods">
              {[
                { v: "shipping", label: "Envío a domicilio", desc: "Recíbelo en tu dirección.", Icon: Truck },
                { v: "pickup", label: "Recoger en tienda", desc: "Paga ahora y recoge en la tienda. Sin gastos de envío.", Icon: Store },
              ].map((d) => (
                <label
                  key={d.v}
                  className={`flex items-start gap-3 p-4 border cursor-pointer rounded-sm transition ${
                    delivery === d.v ? "border-sage-500 bg-sage-50" : "border-bone-200 hover:border-sage-300"
                  }`}
                  data-testid={`dm-${d.v}`}
                >
                  <input type="radio" name="delivery" checked={delivery === d.v} onChange={() => setDelivery(d.v)} className="mt-1 accent-sage-500" />
                  <div>
                    <div className="text-sm text-ink font-medium flex items-center gap-2"><d.Icon size={15} className="text-sage-600" /> {d.label}</div>
                    <div className="text-xs text-ink-soft mt-1">{d.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {!isPickup ? (
            <section>
              <h2 className="font-heading text-xl font-normal mb-5">Dirección de envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-eco md:col-span-2" placeholder="Calle y número" required value={form.street} onChange={onChange("street")} data-testid="checkout-street" />
                <input className="input-eco" placeholder="Código postal" required value={form.postal_code} onChange={onChange("postal_code")} data-testid="checkout-postal" />
                <input className="input-eco" placeholder="Ciudad" required value={form.city} onChange={onChange("city")} data-testid="checkout-city" />
                <input className="input-eco" placeholder="Provincia" required value={form.province} onChange={onChange("province")} data-testid="checkout-province" />
                <input className="input-eco" placeholder="País" value={form.country} onChange={onChange("country")} data-testid="checkout-country" />
                <textarea className="input-eco md:col-span-2" placeholder="Notas para el envío (opcional)" value={form.notes} onChange={onChange("notes")} data-testid="checkout-notes" />
              </div>
            </section>
          ) : (
            <section>
              <h2 className="font-heading text-xl font-normal mb-5">Punto de recogida</h2>
              <div className="border border-sage-200 bg-sage-50 p-5 rounded-sm flex items-start gap-3" data-testid="pickup-store-card">
                <Store size={20} className="text-sage-600 shrink-0 mt-0.5" />
                <div className="text-sm text-ink leading-relaxed">
                  <div className="font-medium">{STORE.name} · {STORE.market}</div>
                  {STORE.addressLine1}<br />
                  {STORE.addressLine2}<br />
                  {STORE.addressLine3}
                  <div className="text-xs text-ink-soft mt-2">Te avisaremos cuando tu pedido esté listo para recoger.</div>
                </div>
              </div>
              <textarea className="input-eco mt-4" placeholder="Notas para la recogida (opcional)" value={form.notes} onChange={onChange("notes")} data-testid="checkout-pickup-notes" />
            </section>
          )}

          <section>
            <h2 className="font-heading text-xl font-normal mb-5">Método de pago</h2>
            <div className="space-y-3" data-testid="payment-methods">
              {[
                { v: "stripe", label: "Tarjeta (Stripe)", desc: "Pago seguro con tarjeta vía Stripe Checkout." },
                { v: "paypal", label: "PayPal", desc: "Finaliza con tu cuenta PayPal." },
                !isPickup && customerType === "professional" && { v: "transfer", label: "Transferencia bancaria", desc: "Recibirás nuestras instrucciones por email." },
              ].filter(Boolean).map((m) => (
                <label
                  key={m.v}
                  className={`flex items-start gap-4 p-4 border cursor-pointer rounded-sm transition ${
                    method === m.v ? "border-sage-500 bg-sage-50" : "border-bone-200 hover:border-sage-300"
                  }`}
                  data-testid={`pm-${m.v}`}
                >
                  <input type="radio" name="method" checked={method === m.v} onChange={() => setMethod(m.v)} className="mt-1 accent-sage-500" />
                  <div>
                    <div className="text-sm text-ink font-medium">{m.label}</div>
                    <div className="text-xs text-ink-soft mt-1">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-2 h-fit bg-white border border-bone-200 p-6 lg:sticky lg:top-24" data-testid="checkout-summary">
          <h3 className="font-heading text-xl font-normal mb-5">Resumen del pedido</h3>
          <ul className="space-y-3 mb-5 max-h-72 overflow-y-auto eco-scroll pr-2">
            {items.map((it, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-12 h-12 bg-bone-100 overflow-hidden shrink-0">
                  {it.image_url && <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-xs">
                  <div className="text-ink">{it.name}</div>
                  {it.variation_name && <div className="text-ink-soft">{it.variation_name}</div>}
                  <div className="text-ink-soft">{it.quantity} × {formatEUR(it.unit_price)}</div>
                </div>
                <div className="text-xs text-ink">{formatEUR(it.unit_price * it.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="border-t border-bone-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span data-testid="summary-subtotal">{formatEUR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">{isPickup ? "Recogida en tienda" : "Envío"}</span><span data-testid="summary-shipping">{shipping ? (shipping.free_shipping ? "Gratis" : formatEUR(shipping.shipping_cost)) : "…"}</span></div>
            <div className="flex justify-between font-medium text-base pt-3 border-t border-bone-200">
              <span>Total</span>
              <span data-testid="summary-total">{shipping ? formatEUR(shipping.total) : formatEUR(subtotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6" data-testid="checkout-submit">
            {submitting ? "Procesando..." : "Pagar y confirmar pedido"}
          </button>
        </aside>
      </form>
    </div>
  );
}
