"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import en from "../locales/en.json";
import th from "../locales/th.json";
import { ApiClientError, ApiErrorDetails } from "../services/apiErrors";

export type Language = "en" | "th";

const LANGUAGE_STORAGE_KEY = "employee_management_language";

const translations = {
  en,
  th
} as const;

export type TranslationKey = keyof typeof en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  formatDate: (value: string | null) => string;
  formatApiError: (error: unknown, fallbackKey?: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === "en" || savedLanguage === "th") {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => {
      const translate = (key: TranslationKey) =>
        translations[language][key] ?? translations.en[key];

      return {
        language,
        setLanguage: setLanguageState,
        t: translate,
        formatDate: (valueToFormat) => {
          if (!valueToFormat) {
            return "-";
          }

          return new Date(valueToFormat).toLocaleDateString(
            language === "th" ? "th-TH" : "en-US"
          );
        },
        formatApiError: (error, fallbackKey) =>
          formatApiErrorMessage(error, translate, fallbackKey)
      };
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}

function formatApiErrorMessage(
  error: unknown,
  t: (key: TranslationKey) => string,
  fallbackKey?: TranslationKey
) {
  if (error instanceof ApiClientError) {
    if (error.kind === "network") {
      return t("apiErrorNetwork");
    }

    const detailMessage = flattenErrorDetails(error.serverErrors);
    const translatedMessage =
      translateServerMessage(detailMessage, t) ||
      translateServerMessage(error.serverMessage ?? "", t);

    return translatedMessage || t(fallbackKey ?? "apiErrorDefault");
  }

  if (error instanceof Error && !fallbackKey) {
    return error.message;
  }

  return t(fallbackKey ?? "apiErrorDefault");
}

function flattenErrorDetails(errors?: ApiErrorDetails) {
  if (!errors) {
    return "";
  }

  if (typeof errors === "string") {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.join(" ");
  }

  return Object.values(errors).flat().join(" ");
}

function translateServerMessage(
  message: string,
  t: (key: TranslationKey) => string
) {
  const normalized = message.toLowerCase();

  if (!normalized) {
    return "";
  }

  if (normalized.includes("cannot connect to the backend api")) {
    return t("apiErrorNetwork");
  }

  if (normalized.includes("validation failed")) {
    return t("apiErrorValidationFailed");
  }

  if (normalized.includes("username and password are required")) {
    return t("apiErrorUsernamePasswordRequired");
  }

  if (normalized.includes("invalid username or password")) {
    return t("apiErrorInvalidCredentials");
  }

  if (normalized.includes("department_name is required")) {
    return t("apiErrorDepartmentNameRequired");
  }

  if (normalized.includes("employee_first_name is required")) {
    return t("apiErrorEmployeeFirstNameRequired");
  }

  if (normalized.includes("employee_last_name is required")) {
    return t("apiErrorEmployeeLastNameRequired");
  }

  if (normalized.includes("department_id is required")) {
    return t("apiErrorDepartmentIdRequired");
  }

  if (normalized.includes("date_joined should not be earlier")) {
    return t("apiErrorDateJoinedBeforeBirth");
  }

  if (
    normalized.includes("department with id") &&
    normalized.includes("was not found")
  ) {
    return t("apiErrorDepartmentNotFound");
  }

  if (
    normalized.includes("department with id") &&
    normalized.includes("does not exist")
  ) {
    return t("apiErrorDepartmentMissing");
  }

  if (
    normalized.includes("employee with id") &&
    normalized.includes("was not found")
  ) {
    return t("apiErrorEmployeeNotFound");
  }

  if (normalized.includes("cannot be deleted because employees are assigned")) {
    return t("apiErrorDepartmentHasEmployees");
  }

  if (normalized.includes("please select an image file")) {
    return t("apiErrorSelectImageFile");
  }

  if (normalized.includes("invalid image type")) {
    return t("apiErrorInvalidImageType");
  }

  if (normalized.includes("invalid image content type")) {
    return t("apiErrorInvalidImageContentType");
  }

  if (normalized.includes("image size must not be larger")) {
    return t("apiErrorImageTooLarge");
  }

  if (normalized.includes("maximum length")) {
    return t("apiErrorFieldMaxLength");
  }

  if (normalized.includes("unauthorized")) {
    return t("apiErrorUnauthorized");
  }

  if (normalized.includes("forbidden")) {
    return t("apiErrorForbidden");
  }

  if (normalized.includes("bad request")) {
    return t("apiErrorBadRequest");
  }

  if (normalized.includes("not found")) {
    return t("apiErrorNotFound");
  }

  if (normalized.includes("method is not allowed")) {
    return t("apiErrorMethodNotAllowed");
  }

  if (normalized.includes("too large")) {
    return t("apiErrorPayloadTooLarge");
  }

  if (normalized.includes("unsupported media type")) {
    return t("apiErrorUnsupportedMediaType");
  }

  if (normalized.includes("server error") || normalized.includes("database error")) {
    return t("apiErrorServer");
  }

  if (normalized.includes("request failed")) {
    return t("apiErrorDefault");
  }

  return "";
}
