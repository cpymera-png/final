import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { formatEUR } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { user } = useAuth();
  const isPro = user?.role === "professional" || user?.role === "admin";
  const hasVariations = product.variations && product.variations.length > 0;
  const price = product.display_price ?? (isPro ? product.price_professional : product.price_retail);

  return (
    <div
      data-testid={`product-card-${product.sku}`}
      className="group relative bg-bone-100 hover:bg-white transition-all duration-500 rounded-sm border border-transparent hover:border-bone-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-white">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-bone-200" />
          )}
        </div>
        <div className="p-5">
          <div className="overline text-sage-600 mb-2">{product.category}</div>
          <h3 className="font-heading font-light text-lg leading-tight text-ink line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-ink text-base font-medium" data-testid={`product-price-${product.sku}`}>
              {price > 0 ? `${t("common.from")} ${formatEUR(price)}` : t("common.consult")}
            </span>
            {isPro && (
              <span className="overline text-terracotta">{t("productCard.b2b")}</span>
            )}
          </div>
        </div>
      </Link>
      {!hasVariations && price > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product, null, 1, isPro);
          }}
          data-testid={`product-add-${product.sku}`}
          className="absolute top-4 right-4 bg-white border border-bone-200 hover:bg-sage-500 hover:text-white hover:border-sage-500 transition p-3 opacity-0 group-hover:opacity-100"
          aria-label={t("productCard.addToCart")}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}
