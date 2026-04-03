"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { isLocale, Locale, messages, Messages } from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  t: Messages;
  ready: boolean;
  setLocale: (locale: Locale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const cached =
          typeof window !== "undefined"
            ? window.localStorage.getItem("owner-locale")
            : null;

        if (cached && isLocale(cached)) {
          setLocaleState(cached);
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setReady(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("language")
          .eq("id", user.id)
          .single();

        if (profile?.language && isLocale(profile.language)) {
          setLocaleState(profile.language);
          window.localStorage.setItem("owner-locale", profile.language);
        }
      } catch (error) {
        console.error("Failed to load locale:", error);
      } finally {
        setReady(true);
      }
    };

    void loadLocale();
  }, []);

  const setLocale = useCallback(async (nextLocale: Locale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("owner-locale", nextLocale);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ language: nextLocale })
        .eq("id", user.id);

      if (error) {
        console.error("Failed to save locale:", error);
      }
    } catch (error) {
      console.error("Failed to save locale:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t: messages[locale],
      ready,
      setLocale,
    }),
    [locale, ready, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}