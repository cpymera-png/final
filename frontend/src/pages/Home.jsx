import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import HeroCarousel from "../components/HeroCarousel";
import { Leaf, Sprout, ShieldCheck } from "lucide-react";

const COLLECTION_IMG = "https://images.unsplash.com/photo-1772987714654-2df39af2c658?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBwcm9kdWN0cyUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjQ2OTI4NHww&ixlib=rb-4.1.0&q=85";
const B2B_IMG = "https://images.unsplash.com/photo-1759157403273-2423c0f5718b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBwcm9kdWN0cyUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjQ2OTI4NHww&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: feat }, { data: cats }] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 8 } }),
          api.get("/products/categories"),
        ]);
        setFeatured(feat);
        setCategories(cats);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div data-testid="home-page" className="bg-bone-100">
      <HeroCarousel />

      {/* Values strip */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 grid grid-cols-1 md:grid-cols-3 gap-10" data-testid="values-strip">
        {[
          { icon: Leaf, title: t("home.value1Title"), desc: t("home.value1Desc") },
          { icon: Sprout, title: t("home.value2Title"), desc: t("home.value2Desc") },
          { icon: ShieldCheck, title: t("home.value3Title"), desc: t("home.value3Desc") },
        ].map((v) => (
          <div key={v.title} className="flex gap-4 items-start border-t border-bone-200 pt-8">
            <v.icon className="text-sage-600 shrink-0 mt-1" size={22} />
            <div>
              <h3 className="font-heading text-lg font-normal mb-2">{v.title}</h3>
              <p className="text-sm text-ink-soft font-light leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20" data-testid="featured-section">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="overline mb-3">{t("home.featuredOverline")}</div>
            <h2 className="font-heading text-3xl md:text-4xl font-light text-ink">{t("home.featuredTitle")}</h2>
          </div>
          <Link to="/tienda" className="text-sm uppercase tracking-[0.22em] text-sage-600 hover:text-sage-700" data-testid="see-all-products">
            {t("common.seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Collections / categories */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20" data-testid="collections-section">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <Link
            to="/tienda"
            className="md:col-span-7 relative group overflow-hidden min-h-[360px]"
            data-testid="collection-main"
          >
            <img src={COLLECTION_IMG} alt={t("home.collectionImgAlt")} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-sage-900/55 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-10 text-white">
              <div className="overline text-bone-100 mb-3">{t("home.collectionMainOverline")}</div>
              <h3 className="font-heading text-2xl md:text-3xl font-light">{t("home.collectionMainTitle")}</h3>
            </div>
          </Link>
          <div className="md:col-span-5 grid grid-cols-2 gap-6 lg:gap-8">
            {categories.slice(0, 4).map((cat, i) => (
              <Link
                key={cat}
                to={`/tienda?cat=${encodeURIComponent(cat)}`}
                data-testid={`collection-chip-${i}`}
                className="bg-bone-200/50 p-6 hover:bg-sage-100 transition-colors min-h-[170px] flex flex-col justify-between"
              >
                <div className="overline text-sage-600">{t("home.category")}</div>
                <h4 className="font-heading text-xl font-light text-ink">{cat}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Banner */}
      <section className="relative mt-20" data-testid="b2b-banner">
        <div className="absolute inset-0">
          <img src={B2B_IMG} alt="Profesional" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-sage-800/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 text-bone-100">
          <div className="max-w-xl">
            <div className="overline text-sage-200 mb-5">{t("home.b2bOverline")}</div>
            <h2 className="font-heading text-3xl md:text-4xl font-light leading-tight">{t("home.b2bTitle")}</h2>
            <p className="mt-5 text-sage-100/90 font-light leading-relaxed max-w-lg">
              {t("home.b2bDesc")}
            </p>
            <Link to="/profesional" className="btn-primary bg-bone-100 text-sage-800 hover:bg-white mt-8 inline-block" data-testid="b2b-cta">
              {t("home.b2bCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
