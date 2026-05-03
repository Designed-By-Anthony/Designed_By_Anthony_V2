---
name: testing-marketing-i18n
description: Test the Spanish language toggle, cookie persistence, and form tagging on the marketing site. Use when verifying i18n UI changes or translation coverage.
---

# Testing: Marketing Site i18n (Spanish Toggle)

## Prerequisites

- Dev server running on port 3000: `bun run dev:web` from repo root
- No API server needed for UI translation tests (form tagging can be verified via fetch interception)

## Dev Server Setup

```bash
cd /path/to/repo
bun install
bun run dev:web
# Wait for compilation, verify with: curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/
```

The `dev:web` command uses turbo and may exit silently if turbo is already running. Check `curl localhost:3000` to confirm the server is up.

## Key Components

| Component | Location | What it does |
|-----------|----------|--------------|
| Translation dictionary | `apps/web/src/lib/i18n/translations.ts` | ~90 EN→ES key mappings |
| LanguageProvider | `apps/web/src/lib/i18n/LanguageProvider.tsx` | React context, cookie read/write |
| LanguageSwitcher | `apps/web/src/components/brand/LanguageSwitcher.tsx` | Footer EN/ES toggle buttons |
| TranslatedNavLinks | `apps/web/src/components/brand/TranslatedNavLinks.tsx` | Nav link translation wrapper |
| TranslatedText (`<T>`) | `apps/web/src/components/brand/TranslatedText.tsx` | Inline text translation component |

## Cookie

- Name: `dba_lang`
- Values: `en` or `es`
- Max-age: 1 year
- Path: `/`, SameSite: Lax

## Test Procedure

### 1. Toggle to Spanish
- Navigate to homepage
- Scroll to footer, find EN/ES toggle buttons
- Click "ES"
- **Verify**: Nav links change to Spanish ("Nuestra Ventaja", "Servicios", "Portafolio", "Precios", etc.)
- **Verify**: Left contact tab changes to "CONTACTO"
- **Verify**: ES button shows active/pill styling

### 2. Persistence across navigation
- Click any translated nav link (e.g., "Servicios")
- **Verify**: New page loads with nav still in Spanish

### 3. Persistence across refresh
- Refresh the page (F5 or Ctrl+R)
- **Verify**: Nav remains in Spanish after reload (cookie survives refresh)
- Note: There may be a brief flash from EN→ES on initial load due to hydration-safe pattern (mount-only useEffect)

### 4. Contact drawer translation
- Click "CONTACTO" tab on left side
- **Verify**: Form labels show "NOMBRE", "CORREO", "TELÉFONO", "SITIO WEB", "MENSAJE"
- **Verify**: Submit button shows "Construyamos algo grande."
- **Verify**: Call CTA shows "O LLAMA AHORA"

### 5. Reach-out modal translation
- The reach-out sticky button on the right side is controlled by `public/scripts/site.js` scroll observer
- It might not trigger naturally in dev. Force visible via CDP:
  ```python
  import json, asyncio, websockets
  async def run():
      async with websockets.connect('ws://localhost:29229/devtools/page/<PAGE_ID>') as ws:
          await ws.send(json.dumps({'id':1,'method':'Runtime.evaluate','params':{'expression':'document.getElementById("reachOutSticky").classList.add("reach-out-sticky--visible"); document.getElementById("reachOutModal").showModal(); document.getElementById("reachOutModal").textContent.trim()'}}))
          resp = json.loads(await ws.recv())
          print(resp['result']['result']['value'])
  asyncio.run(run())
  ```
- Get the page ID from: `curl -s http://localhost:29229/json`
- **Verify**: Button text is "Contáctanos", modal title is "Hola", CTA is "Auditar Mi Sitio"

### 6. Switch back to English
- Click "EN" in footer
- **Verify**: All nav links revert to English

### 7. Form submission lang tagging
- Toggle to Spanish
- Intercept fetch via CDP to capture the POST payload
- Fill and submit the contact drawer form
- **Verify**: POST body includes `"lang":"es"` alongside email/company/website
- Note: API server (`localhost:8787`) requires wrangler + Cloudflare D1 bindings — not available locally. The POST will fail with `ERR_CONNECTION_REFUSED`, but the payload structure can be verified via fetch interception.

## Tips

- The `computer` tool's `console` action may report "Chrome is not in the foreground" even when Chrome is visible. Use CDP via Python `websockets` as a reliable alternative for JavaScript execution.
- Install `websockets` if needed: `pip install websockets`
- The reach-out sticky button visibility class is `reach-out-sticky--visible` — add it via CDP if the scroll trigger doesn't fire.
- Marketing prose (page body content, blog posts) is NOT translated — only UI chrome (nav, forms, buttons, drawer, footer).
- Console errors about `manifest.webmanifest` 500 errors and Turnstile/xr-spatial-tracking are expected in dev and can be ignored.

## Devin Secrets Needed

No secrets required for UI translation testing. API endpoint testing would require Cloudflare Workers credentials (wrangler auth).
