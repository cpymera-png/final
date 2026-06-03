import React, { useEffect, useState } from "react";
import { api, formatEUR } from "../../lib/api";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await api.get("/products", { params: { search: search || undefined, limit: 200 } });
    setProducts(data);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/products/${editing.id}`, {
        name: editing.name,
        category: editing.category,
        price_retail: Number(editing.price_retail),
        price_professional: Number(editing.price_professional),
        stock: Number(editing.stock || 0),
        featured: !!editing.featured,
        active: editing.active !== false,
        image_url: editing.image_url,
        description: editing.description,
      });
      toast.success("Producto actualizado");
      setEditing(null);
      load();
    } catch (err) { toast.error("Error", { description: err?.response?.data?.detail }); }
  };

  return (
    <div data-testid="admin-products-page">
      <div className="overline mb-2">Catálogo</div>
      <h1 className="font-heading text-3xl font-light mb-6">Productos</h1>
      <div className="flex gap-3 mb-5">
        <input className="input-eco max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU" data-testid="products-search" />
        <button onClick={load} className="btn-outline">Buscar</button>
      </div>
      <div className="bg-white border border-bone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-ink-soft text-left border-b border-bone-200">
              <th className="p-4">SKU</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>PVP</th>
              <th>B2B</th>
              <th>Destacado</th>
              <th>Activo</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-bone-100" data-testid={`product-row-${p.sku}`}>
                <td className="p-4 font-mono text-xs">{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{formatEUR(p.price_retail)}</td>
                <td>{formatEUR(p.price_professional)}</td>
                <td>{p.featured ? "★" : "—"}</td>
                <td>{p.active ? "Sí" : "No"}</td>
                <td className="p-4">
                  <button onClick={() => setEditing({ ...p })} className="text-sage-700 text-xs" data-testid={`edit-product-${p.sku}`}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/30 flex items-center justify-center p-4" onClick={() => setEditing(null)} data-testid="edit-product-modal">
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white border border-bone-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto eco-scroll">
            <h2 className="font-heading text-2xl font-light">Editar producto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-eco md:col-span-2" placeholder="Nombre" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <input className="input-eco" placeholder="Categoría" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <input className="input-eco" placeholder="SKU" value={editing.sku} disabled />
              <input className="input-eco" type="number" step="0.01" placeholder="PVP retail" value={editing.price_retail} onChange={(e) => setEditing({ ...editing, price_retail: e.target.value })} />
              <input className="input-eco" type="number" step="0.01" placeholder="Precio B2B" value={editing.price_professional} onChange={(e) => setEditing({ ...editing, price_professional: e.target.value })} />
              <input className="input-eco" type="number" placeholder="Stock" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />
              <input className="input-eco md:col-span-2" placeholder="URL imagen" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              <textarea className="input-eco md:col-span-2" rows={4} placeholder="Descripción" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Destacado</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Activo</label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancelar</button>
              <button type="submit" className="btn-primary" data-testid="save-product-btn">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
