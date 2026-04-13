/**
 * Central school branding and contact copy.
 * Override via VITE_SCHOOL_* env vars (see .env.example). No secrets here.
 */

function env(key: string, fallback: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

export const schoolConfig = {
  displayNameMr: env("VITE_SCHOOL_DISPLAY_NAME_MR", "वैनतेय प्राथमिक विद्या मंदिर"),
  heroTitleBaseMr: env("VITE_SCHOOL_HERO_TITLE_BASE_MR", "वैनतेय प्राथमिक"),
  heroTitleAccentMr: env("VITE_SCHOOL_HERO_TITLE_ACCENT_MR", "विद्या मंदिर"),
  shortNameMr: env("VITE_SCHOOL_SHORT_NAME_MR", "वैनतेय"),
  taglineMr: env("VITE_SCHOOL_TAGLINE_MR", "निफाड, नाशिक"),
  locationLineMr: env("VITE_SCHOOL_LOCATION_MR", "निफाड, ता. निफाड, जि. नाशिक"),
  /** Multiline allowed (e.g. card + footer) */
  fullAddressMr: env(
    "VITE_SCHOOL_ADDRESS_MR",
    "वैनतेय प्राथमिक विद्या मंदिर\nनिफाड, ता. निफाड, जि. नाशिक — 422303"
  ),
  postalCode: env("VITE_SCHOOL_POSTAL_CODE", "422303"),

  phoneDisplay: env("VITE_SCHOOL_PHONE_DISPLAY", "+९१ २२ २३५६ ६८९०"),
  /** Use E.164 for tel: hrefs, e.g. +919876543210 */
  phoneTel: env("VITE_SCHOOL_PHONE_TEL", "+912223566890"),

  emailGeneral: env("VITE_SCHOOL_EMAIL_GENERAL", "info@vainateya.edu"),
  emailAdmissions: env("VITE_SCHOOL_EMAIL_ADMISSIONS", "admissions@vainateya.edu"),

  websiteUrl: env("VITE_SCHOOL_WEBSITE_URL", ""),

  trusteeLineMr: env("VITE_SCHOOL_TRUSTEE_MR", "न्या. रानडे विद्याप्रसारक मंडळ संचालित"),
  heroBadgeMr: env(
    "VITE_SCHOOL_HERO_BADGE_MR",
    "इयत्ता १ ली ते ४ थी • न्या. रानडे विद्याप्रसारक मंडळ संचालित, निफाड"
  ),
  heroSubtitleMr: env(
    "VITE_SCHOOL_HERO_SUBTITLE_MR",
    "मुलांच्या सर्वांगीण विकासासाठी पोषक वातावरण आणि उच्च दर्जाचे प्राथमिक शिक्षण."
  ),
  footerBlurbMr: env(
    "VITE_SCHOOL_FOOTER_BLURB_MR",
    "इयत्ता १ ली ते ४ थी — मुलांच्या उज्ज्वल भविष्यासाठी आणि सर्वांगीण विकासासाठी समर्पित संस्था."
  ),

  mapEmbedUrl: env(
    "VITE_SCHOOL_MAP_EMBED_URL",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.7!2d74.1000!3d20.0800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcff6b9c59cf03%3A0x3e2f2f68d5c1c3d1!2sNiphad%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1712573200000!5m2!1sen!2sin"
  ),
  mapExternalUrl: env(
    "VITE_SCHOOL_MAP_EXTERNAL_URL",
    "https://maps.google.com/?q=Niphad+Nashik+Maharashtra"
  ),
  mapCaptionMr: env("VITE_SCHOOL_MAP_CAPTION_MR", "वैनतेय प्राथमिक विद्या मंदिर, निफाड"),

  /** Marathi numerals or string for footer bar */
  copyrightYearMr: env("VITE_SCHOOL_COPYRIGHT_YEAR_MR", "२०२६"),
} as const;

export type SchoolConfig = typeof schoolConfig;
