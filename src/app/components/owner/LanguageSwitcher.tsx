"use client";

import { useTransition } from "react";
import { useLocale } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/messages";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: Locale) => {
    startTransition(() => {
      void setLocale(value);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid rgba(200,135,58,0.18)",
        background: "rgba(200,135,58,0.04)",
      }}
    >
      <label
        htmlFor="owner-language"
        style={{
          fontSize: 12,
          color: "#1A0F00",
          whiteSpace: "nowrap",
        }}
      >
        {t.common.language}
      </label>

      <select
        id="owner-language"
        value={locale}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as Locale)}
        style={{
          border: "1px solid rgba(200,135,58,0.2)",
          background: "#fff",
          borderRadius: 8,
          padding: "6px 8px",
          fontSize: 12,
          color: "#1A0F00",
          outline: "none",
          width: "100%",
        }}
      >
        <option value="en">{t.common.english}</option>
        <option value="km">{t.common.khmer}</option>
      </select>
    </div>
  );
}