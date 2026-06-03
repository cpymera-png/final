import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HERO_SLIDES = [
  {
    image: "/slide-cacao.png",
    overline: "Cacao Nibs · Variedad Criollo",
    h1: "Nibs de Cacao Bio para tu Energía y Vitalidad",
    subtitle:
      "Potencia tu día con los Nibs de Cacao Ecológicos de Ecoandes. 100% puro, bio, vegano, sin gluten y rico en antioxidantes. ¡Descubre su sabor auténtico!",
    cta: { to: "/tienda?q=cacao", label: "Descubrir cacao" },
  },
  {
    image: "/slide-maca-negra.png",
    overline: "Maca Negra · Superalimento Andino",
    h1: "Maca Negra Bio la fuente de energía y potencia natural para tu máximo rendimiento.",
    subtitle:
      "Potencia tu energía y enfoque con Maca Negra EcoAndes. Superalimento bio, sin gluten y 100% puro. ¡Siente el poder andino!",
    cta: { to: "/tienda?q=maca", label: "Descubrir maca" },
  },
  {
    image: "/slide-quinoa.png",
    overline: "Quinoa Real Tricolor · Cultivo Ecológico",
    h1: "Super Alimento Andino — Nutrición Completa y Versátil",
    subtitle:
      "Fuente rica en proteínas completas, fibra, vitaminas y minerales. La Quinoa Real Tricolor EcoAndes apoya el sistema muscular y digestivo, proporcionando energía sostenida para tu día a día.",
    cta: { to: "/tienda?q=quinoa", label: "Descubrir quinoa" },
  },
  {
    image: "/slide-canela.png",
    overline: "Canela de Ceylán · Variedad Premium",
    h1: "Dulzura y Aroma Auténtico — Canela de Ceylan Bio",
    subtitle:
      "Descubre el verdadero sabor con nuestra Canela de Ceylan 100% ecológica. Un toque cálido, aromático y puro, perfecto para elevar tus postres, cafés y batidos diarios. Calidad premium, envasada con cuidado y cariño.",
    cta: { to: "/tienda?q=canela", label: "Descubrir canela" },
  },
  {
    image: "/slide-curcuma.png",
    overline: "Cúrcuma Bio · Cultivo Ecológico",
    h1: "El Oro de la India — Cúrcuma Bio en Polvo",
    subtitle:
      "Cúrcuma bio 100% pura, de la más alta calidad y cultivo ecológico certificado. Ideal para currys, arroces y tu leche dorada.",
    cta: { to: "/tienda?q=curcuma", label: "Descubrir cúrcuma" },
  },
];

export default function HeroCarousel({ interval = 4000 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  // Preload all images on mount so crossfade is instant (no flicker)
  useEffect(() => {
    HERO_SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  // Continuous rotation every `interval` ms — does NOT pause on hover
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [interval]);

  return (
    <section
      data-testid="hero-carousel"
      className="relative min-h-[78vh] sm:min-h-[88vh] lg:min-h-[92vh] flex items-center overflow-hidden bg-[#F4E9D5]"
    >
      {/* Stacked images, only the active one is visible via opacity transition */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.h1}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: i === index ? 1 : 0,
              willChange: "opacity",
            }}
            loading="eager"
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 sm:py-24 w-full">
        {/* Stacked text layers, only active visible — same crossfade timing */}
        <div className="relative max-w-2xl min-h-[420px] sm:min-h-[460px] lg:min-h-[520px]">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={i}
              data-testid={`hero-slide-${i}`}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: i === index ? 1 : 0,
                pointerEvents: i === index ? "auto" : "none",
              }}
            >
              <div
                className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-semibold mb-5 sm:mb-6 text-[#7a5a3a]"
                data-testid={i === index ? "hero-overline" : undefined}
              >
                {s.overline}
              </div>

              <h1
                className="font-serif font-medium text-[#2a1d10] tracking-tight leading-[1.06] text-[2.2rem] xs:text-[2.6rem] sm:text-[3rem] md:text-[3.6rem] lg:text-[4.2rem] xl:text-[4.6rem]"
                style={{ fontWeight: 600 }}
                data-testid={i === index ? "hero-title" : undefined}
              >
                {s.h1}
              </h1>

              {/* Decorative divider with leaf */}
              <div className="flex items-center gap-3 mt-6 sm:mt-7 max-w-[260px]" aria-hidden="true">
                <span className="h-px flex-1 bg-[#7a5a3a]/40" />
                <svg width="14" height="14" viewBox="0 0 24 24" className="text-[#7a5a3a]/70 -rotate-12" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
                <span className="h-px flex-1 bg-[#7a5a3a]/40" />
              </div>

              <p
                className="font-body mt-6 sm:mt-7 text-base sm:text-lg max-w-lg leading-relaxed text-[#3a2a18]/85 font-medium"
                data-testid={i === index ? "hero-subtitle" : undefined}
              >
                {s.subtitle}
              </p>

              <div className="mt-7 sm:mt-9 flex flex-wrap gap-3 sm:gap-4">
                <Link
                  to={s.cta.to}
                  className="bg-[#3a2a18] text-[#F4E9D5] hover:bg-[#2a1d10] transition-colors duration-300 px-7 sm:px-8 py-3.5 text-[11px] sm:text-xs uppercase tracking-[0.22em] rounded-sm inline-flex items-center gap-2"
                  data-testid={i === index ? "hero-shop-cta" : undefined}
                >
                  {s.cta.label} <ArrowRight size={14} />
                </Link>
                <Link
                  to="/profesional"
                  className="border border-[#3a2a18]/60 text-[#3a2a18] hover:bg-[#3a2a18] hover:text-[#F4E9D5] transition-colors duration-300 px-7 sm:px-8 py-3.5 text-[11px] sm:text-xs uppercase tracking-[0.22em] rounded-sm"
                  data-testid={i === index ? "hero-b2b-cta" : undefined}
                >
                  Soy profesional
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-10 left-6 lg:left-12 flex gap-2.5 z-10" data-testid="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              data-testid={`hero-dot-${i}`}
              aria-label={`Slide ${i + 1}`}
              className={`h-[2px] transition-all duration-500 ${
                i === index
                  ? "w-12 bg-[#3a2a18]"
                  : "w-6 bg-[#3a2a18]/30 hover:bg-[#3a2a18]/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
