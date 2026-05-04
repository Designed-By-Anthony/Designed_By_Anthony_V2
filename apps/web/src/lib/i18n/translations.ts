/**
 * UI string translations for the DBA marketing site.
 *
 * Keys are English originals; values are Spanish equivalents.
 * Content-heavy marketing prose is NOT translated here — only
 * chrome, forms, nav, and CTA text that the language toggle controls.
 */

export type SupportedLang = "en" | "es";

const es: Record<string, string> = {
  /* ── Navigation ────────────────────────────────────────── */
  "Our Edge": "Nuestra Ventaja",
  Services: "Servicios",
  Portfolio: "Portafolio",
  Pricing: "Precios",
  "Service Areas": "Áreas de Servicio",
  FAQ: "Preguntas Frecuentes",
  Blog: "Blog",
  Tools: "Herramientas",
  About: "Acerca de",
  Contact: "Contacto",
  "Audit My Site": "Auditar Mi Sitio",

  /* ── Banner ────────────────────────────────────────────── */
  "The 315 Pilot: 10 Founding Partner Spots Remaining":
    "El Piloto 315: 10 Espacios de Socio Fundador Disponibles",
  "start with a free SEO + performance audit":
    "comienza con una auditoría SEO + rendimiento gratuita",
  "You're already on the free audit ↓": "Ya estás en la auditoría gratuita ↓",

  /* ── Contact drawer / reach-out ────────────────────────── */
  "Get in touch": "Contáctanos",
  "Send a quick message \u2014 we reply within one business day.":
    "Envía un mensaje rápido \u2014 respondemos en un día hábil.",
  "Or call now": "O llama ahora",
  "Say hello": "Hola",
  Close: "Cerrar",
  "Contact form": "Formulario de contacto",
  "Close contact drawer": "Cerrar formulario de contacto",
  "Contact \u2014 toggle contact form": "Contacto \u2014 alternar formulario de contacto",
  "Call us at": "Llámanos al",
  "Start with a free site audit — or just call / email.":
    "Comienza con una auditoría gratuita — o llama / envía un correo.",
  Call: "Llamar",
  "Form / message": "Formulario / mensaje",

  /* ── Form labels ───────────────────────────────────────── */
  "First Name": "Nombre",
  Email: "Correo",
  "Email address": "Correo electrónico",
  Phone: "Teléfono",
  "Phone number": "Número de teléfono",
  Website: "Sitio Web",
  "Website URL": "URL del sitio web",
  Message: "Mensaje",
  "How can we help?": "¿Cómo podemos ayudarte?",
  "Tell us what you're looking for...": "Cuéntanos qué estás buscando...",

  /* ── Form actions / status ─────────────────────────────── */
  "Let's build something great.": "Construyamos algo grande.",
  "Sending...": "Enviando...",
  "Failed to submit form. Please try again.":
    "Error al enviar el formulario. Por favor, inténtalo de nuevo.",
  "We reply within one business day.": "Respondemos en un día hábil.",

  /* ── Form success ──────────────────────────────────────── */
  "Thank you for your interest!": "¡Gracias por tu interés!",
  "We'll be in touch within one business day.": "Nos comunicaremos contigo en un día hábil.",

  /* ── Footer ────────────────────────────────────────────── */
  Privacy: "Privacidad",
  Terms: "Términos",
  Cookies: "Cookies",
  "Custom websites for Central NY service businesses.":
    "Sitios web personalizados para negocios de servicio en el centro de NY.",

  /* ── Language toggle ───────────────────────────────────── */
  "Switch to Spanish": "Cambiar a español",
  "Switch to English": "Cambiar a inglés",
  "EN \u2014 Switch to English": "EN \u2014 Cambiar a inglés",
  "ES \u2014 Switch to Spanish": "ES \u2014 Cambiar a español",
  Language: "Idioma",

  /* ── Contact page ──────────────────────────────────────── */
  "Contact the studio": "Contacta al estudio",
  "Contact us for your free audit": "Contáctanos para tu auditoría gratuita",
};

/**
 * Returns the translated string for the current language.
 * Falls back to the original key if no translation exists.
 */
export function translate(key: string, lang: SupportedLang): string {
  if (lang === "en") return key;
  return es[key] ?? key;
}
