import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatEUR } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Minus, Plus, ChevronRight } from "lucide-react";
import ProductReviews from "../components/ProductReviews";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const isPro = user?.role === "professional" || user?.role === "admin";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/slug/${slug}`);
        setProduct(data);
        if (data.variations?.length) setSelectedVariation(data.variations[0]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-ink-soft">Cargando producto...</div>;
  }
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p>Producto no encontrado.</p>
        <Link to="/tienda" className="btn-outline mt-6 inline-block">Volver a la tienda</Link>
      </div>
    );
  }

  const currentPrice = selectedVariation
    ? isPro ? selectedVariation.price_professional : selectedVariation.price_retail
    : product.display_price;

  return (
    <div className="bg-bone-100" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 text-xs text-ink-soft uppercase tracking-[0.18em] flex items-center gap-2" data-testid="breadcrumbs">
        <Link to="/" className="hover:text-sage-600">Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/tienda" className="hover:text-sage-600">Tienda</Link>
        <ChevronRight size={12} />
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="bg-white aspect-square overflow-hidden">
            {product.image_url && (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          {product.gallery?.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {product.gallery.slice(0, 4).map((g, i) => (
                <div key={i} className="aspect-square bg-white overflow-hidden">
                  <img src={g} alt={`Galería ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <div className="overline mb-3" data-testid="product-category">{product.category}</div>
          <h1 className="font-heading text-3xl md:text-4xl font-light text-ink leading-tight" data-testid="product-name">
            {product.name}
          </h1>
          {product.short_description && (
            <p className="mt-4 text-ink-soft font-light text-sm leading-relaxed">{product.short_description}</p>
          )}

          <div className="mt-6">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl font-light text-ink" data-testid="product-price">
                {currentPrice > 0 ? formatEUR(currentPrice) : "Consultar"}
              </span>
              {isPro && (
                <span className="text-xs uppercase tracking-[0.2em] text-terracotta">Precio profesional</span>
              )}
              {!isPro && product.price_professional > 0 && (
                <Link to="/login" className="text-xs uppercase tracking-[0.2em] text-sage-600 hover:text-sage-700" data-testid="pdp-login-b2b">
                  Acceder B2B →
                </Link>
              )}
            </div>
            <div className="text-xs text-ink-soft mt-1">SKU: {product.sku}</div>
          </div>

          {product.variations?.length > 0 && (
            <div className="mt-8" data-testid="variation-selector">
              <div className="overline mb-3">Formato</div>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => {
                  const active = selectedVariation?.sku === v.sku;
                  return (
                    <button
                      key={v.sku}
                      onClick={() => setSelectedVariation(v)}
                      data-testid={`variation-${v.sku}`}
                      className={`text-sm px-4 py-2 border rounded-sm transition ${
                        active ? "bg-sage-500 text-white border-sage-500" : "bg-transparent text-ink border-bone-200 hover:border-sage-500"
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4 items-stretch">
            <div className="flex items-center border border-bone-200 rounded-sm bg-white">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-ink-soft" data-testid="pdp-qty-dec" aria-label="Disminuir"><Minus size={14} /></button>
              <span className="px-4 text-sm" data-testid="pdp-qty">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-ink-soft" data-testid="pdp-qty-inc" aria-label="Aumentar"><Plus size={14} /></button>
            </div>
            <button
              onClick={() => addItem(product, selectedVariation, quantity, isPro)}
              className="btn-primary flex-1"
              data-testid="pdp-add-to-cart"
              disabled={currentPrice <= 0}
            >
              Añadir a la cesta
            </button>
          </div>

          {product.description && (
            <div className="mt-12 border-t border-bone-200 pt-8">
              <div className="overline mb-4">Descripción</div>
              <p className="text-sm leading-relaxed text-ink-soft whitespace-pre-line font-light" data-testid="product-description">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
