import React from "react";
import { useTranslation } from "react-i18next";

const WA_NUMBER = "34696173094";

export default function WhatsappFab() {
  const { t } = useTranslation();
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t("whatsapp.message"))}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-fab"
      aria-label={t("whatsapp.aria")}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 bg-sage-700 hover:bg-sage-800 text-bone-100 shadow-[0_10px_30px_rgba(44,64,46,0.35)] rounded-full pl-4 pr-5 py-3 sm:pl-5 sm:pr-6 sm:py-4 transition-all duration-300 hover:scale-[1.03] group"
    >
      <svg
        viewBox="0 0 32 32"
        width="22"
        height="22"
        className="shrink-0 drop-shadow"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.803 2.72.803.688 0 2.64-.374 2.64-1.347 0-.156-.043-.31-.073-.452-.255-.57-1.635-1.193-2.1-1.29-.128-.028-.27-.042-.4-.042"
        />
        <path
          fill="currentColor"
          d="M16 0C7.163 0 0 7.163 0 16c0 2.837.747 5.5 2.055 7.81L.39 31.45a.506.506 0 0 0 .618.618l7.81-1.666A15.922 15.922 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0m0 29c-2.55 0-4.95-.69-7-1.895l-.5-.3-4.9 1.05 1.05-4.9-.3-.5A12.94 12.94 0 0 1 3 16C3 8.83 8.83 3 16 3s13 5.83 13 13-5.83 13-13 13"
        />
      </svg>
      <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] font-medium">
        {t("whatsapp.label")}
      </span>
    </a>
  );
}
