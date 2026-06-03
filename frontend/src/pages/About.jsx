import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const IMG1 = "https://images.unsplash.com/photo-1759157403273-2423c0f5718b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxvcmdhbmljJTIwc2tpbmNhcmUlMjBwcm9kdWN0cyUyMG5ldXRyYWwlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjQ2OTI4NHww&ixlib=rb-4.1.0&q=85";
const IMG2 = "https://images.unsplash.com/photo-1739949381110-81f449e5a494?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxuYXR1cmFsJTIwb3JnYW5pYyUyMHNraW4lMjBjYXJlJTIwcGFja2FnaW5nfGVufDB8fHx8MTc3NjQ2OTMxMXww&ixlib=rb-4.1.0&q=85";

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20" data-testid="about-page">
      <div className="overline mb-3">{t("about.overline")}</div>
      <h1 className="font-heading text-4xl md:text-5xl font-light max-w-3xl leading-[1.08]">
        {t("about.title")}
      </h1>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <img src={IMG1} alt="Campo de cultivo" className="w-full aspect-[4/5] object-cover" />
        <div className="space-y-6 text-ink-soft font-light leading-relaxed text-base">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <Link to="/tienda" className="btn-outline inline-block mt-4">{t("about.explore")}</Link>
        </div>
      </div>
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div className="space-y-6 text-ink-soft font-light leading-relaxed text-base order-2 md:order-1">
          <h2 className="font-heading text-3xl font-light text-ink">{t("about.certTitle")}</h2>
          <p>{t("about.certP1")}</p>
          <p>{t("about.certP2")}</p>
        </div>
        <img src={IMG2} alt="Producto natural" className="w-full aspect-[4/5] object-cover order-1 md:order-2" />
      </div>
    </div>
  );
}
