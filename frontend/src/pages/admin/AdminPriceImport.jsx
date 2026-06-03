import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export default function AdminPriceImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const { data } = await api.get("/admin/prices/logs", { params: { limit: 50 } });
      setLogs(data);
    } catch {}
  };
  useEffect(() => { loadLogs(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/prices/import", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      toast.success(`${data.updated} productos actualizados`);
      loadLogs();
    } catch (err) {
      toast.error("Error al importar", { description: err?.response?.data?.detail || err.message });
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="admin-prices-page">
      <div className="overline mb-2">Automatización</div>
      <h1 className="font-heading text-3xl font-light mb-3">Importar precios · Excel</h1>
      <p className="text-sm text-ink-soft max-w-xl mb-8 font-light">
        Sube un archivo <strong>.xlsx</strong> con columnas <code className="bg-bone-200 px-1">sku</code>,
        <code className="bg-bone-200 px-1 ml-1">pvp</code> y/o <code className="bg-bone-200 px-1">b2b</code>.
        Se hace match por SKU (producto base o variación) y se actualizan los precios.
      </p>

      <form onSubmit={upload} className="bg-white border border-bone-200 p-8 flex flex-wrap gap-4 items-center" data-testid="prices-form">
        <label className="flex-1 border-2 border-dashed border-bone-200 hover:border-sage-500 p-6 flex items-center gap-3 cursor-pointer transition rounded-sm">
          <UploadCloud size={18} className="text-sage-600" />
          <div className="flex-1">
            <div className="text-sm text-ink">{file ? file.name : "Selecciona un archivo Excel (.xlsx)"}</div>
            <div className="text-xs text-ink-soft mt-1">Columnas requeridas: sku, pvp, b2b</div>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            data-testid="prices-file-input"
          />
        </label>
        <button type="submit" disabled={!file || loading} className="btn-primary" data-testid="prices-submit">
          {loading ? "Procesando..." : "Importar"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white border border-bone-200 p-6" data-testid="prices-result">
          <h3 className="font-heading text-lg mb-3">Resumen</h3>
          <ul className="text-sm space-y-1.5">
            <li>Filas procesadas: <strong>{result.total_rows}</strong></li>
            <li className="text-sage-700">Actualizados: <strong>{result.updated}</strong></li>
            <li className="text-terracotta">SKUs no encontrados: <strong>{result.not_found}</strong></li>
            {result.errors.length > 0 && (
              <li>
                Errores:
                <ul className="list-disc pl-6 mt-1 text-red-600">
                  {result.errors.slice(0, 10).map((er, i) => <li key={i}>{er}</li>)}
                </ul>
              </li>
            )}
            {result.not_found_skus.length > 0 && (
              <li>
                No encontrados:
                <div className="font-mono text-xs mt-1 max-h-32 overflow-y-auto bg-bone-100 p-2 rounded-sm">
                  {result.not_found_skus.join(", ")}
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-12 bg-white border border-bone-200">
        <div className="p-6 border-b border-bone-200">
          <h3 className="font-heading text-lg">Historial de cambios</h3>
        </div>
        <div className="max-h-96 overflow-y-auto eco-scroll">
          {logs.length === 0 ? (
            <div className="p-6 text-sm text-ink-soft text-center">Sin cambios recientes.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.14em] text-ink-soft text-left border-b border-bone-200 bg-bone-100/60">
                  <th className="p-3">Fecha</th>
                  <th>SKU</th>
                  <th>PVP (antes → después)</th>
                  <th>B2B (antes → después)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={`${l.sku}-${l.created_at}-${idx}`} className="border-b border-bone-100" data-testid={`price-log-${l.sku}-${idx}`}>
                    <td className="p-3 text-xs">{new Date(l.created_at).toLocaleString("es-ES")}</td>
                    <td className="font-mono text-xs">{l.sku}</td>
                    <td>{l.old_retail ?? "—"} → <strong>{l.new_retail ?? "—"}</strong></td>
                    <td>{l.old_professional ?? "—"} → <strong>{l.new_professional ?? "—"}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
