import React from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Mail, Phone, MessageCircle, Store, Clock } from "lucide-react";
import { STORE, STORE_HOURS, STORE_MAPS_URL } from "../data/storeInfo";

const PHONE_DISPLAY = "918 30 72 66";
const PHONE_TEL = "+34918307266";
const WHATSAPP_DISPLAY = "+34 696 17 30 94";
const WHATSAPP_LINK = "https://wa.me/34696173094?text=" + encodeURIComponent("Hola, tengo una consulta sobre los productos Ecoandes.");

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-20" data-testid="contact-page">
      <div className="overline mb-3">{t("contact.overline")}</div>
      <h1 className="font-heading text-4xl md:text-5xl font-light max-w-3xl leading-[1.08]">
        {t("contact.title")}
      </h1>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a
          href="https://www.google.com/maps/search/?api=1&query=C.%20Ferrocarril%2016%2C%20Edificio%2012%20Nave%204%2C%2028880%20Meco%2C%20Madrid"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-bone-200 p-6 bg-white hover:border-sage-500 transition"
          data-testid="contact-address"
        >
          <MapPin size={18} className="text-sage-600 mb-3" />
          <div className="overline mb-2">Dirección</div>
          <div className="text-ink text-sm leading-relaxed">
            C. Ferrocarril, 16<br />
            Edificio 12 Nave 4<br />
            28880 Meco, Madrid
          </div>
        </a>
        <a href="mailto:info@productosecoandes.com" className="border border-bone-200 p-6 bg-white hover:border-sage-500 transition" data-testid="contact-email">
          <Mail size={18} className="text-sage-600 mb-3" />
          <div className="overline mb-2">Email</div>
          <div className="text-ink text-sm break-all">info@productosecoandes.com</div>
        </a>
        <a href={`tel:${PHONE_TEL}`} className="border border-bone-200 p-6 bg-white hover:border-sage-500 transition" data-testid="contact-phone">
          <Phone size={18} className="text-sage-600 mb-3" />
          <div className="overline mb-2">Teléfono</div>
          <div className="text-ink text-sm">{PHONE_DISPLAY}</div>
        </a>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="border border-bone-200 p-6 bg-white hover:border-sage-500 transition" data-testid="contact-whatsapp">
          <MessageCircle size={18} className="text-sage-600 mb-3" />
          <div className="overline mb-2">WhatsApp</div>
          <div className="text-ink text-sm">{WHATSAPP_DISPLAY}</div>
        </a>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="contact-store-section">
        <a
          href={STORE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-bone-200 bg-white p-7 hover:border-sage-500 transition group"
          data-testid="contact-store-address"
        >
          <div className="flex items-center gap-2 overline mb-4">
            <Store size={16} className="text-sage-600" /> {t("store.visit")}
          </div>
          <div className="font-heading text-2xl font-light text-ink mb-3">{STORE.name}</div>
          <div className="flex items-start gap-2 text-ink-soft text-sm leading-relaxed">
            <MapPin size={16} className="text-sage-600 mt-0.5 shrink-0" />
            <span>
              {STORE.market}<br />
              {STORE.addressLine1}<br />
              {STORE.addressLine2}<br />
              {STORE.addressLine3}
            </span>
          </div>
          <div className="mt-5 text-xs uppercase tracking-[0.18em] text-sage-600 group-hover:text-sage-700">
            {t("store.viewMaps")} →
          </div>
        </a>

        <div className="border border-bone-200 bg-white p-7" data-testid="contact-store-hours">
          <div className="flex items-center gap-2 overline mb-4">
            <Clock size={16} className="text-sage-600" /> {t("store.hoursTitle")}
          </div>
          <ul className="divide-y divide-bone-200">
            {STORE_HOURS.map((h) => (
              <li key={h.dayKey} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink">{t(`hours.days.${h.dayKey}`)}</span>
                <span className={h.closed ? "text-ink-muted" : "text-ink-soft"}>{h.closed ? t("hours.closed") : h.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
