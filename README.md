# Vinný deník

Zápisník z ochutnávek po moravských vinných sklípcích. Statický web bez serveru a bez databáze: každý má svůj deník uložený ve vlastním telefonu, aplikace jde přidat na plochu a funguje i bez signálu.

## Struktura
- `index.html` – celá aplikace (HTML, CSS a JavaScript v jednom souboru)
- `sw.js` – offline režim (service worker)
- `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` – instalace na plochu
- `vercel.json` – hlavičky, aby se novinky dostaly k uživatelům hned

## Nasazení
Vercel je napojený na tento repozitář. Každý push do větve `main` se automaticky nasadí do produkce, ostatní větve dostanou náhledovou adresu.
Produkční větev je ve Vercelu nastavená v Settings → Environments → Production → Branch Tracking a musí být `main`.

## Úpravy
- Změny v `index.html` se k uživatelům dostanou samy při příštím otevření s internetem.
- Při změně ikon nebo manifestu zvyšte číslo v `CACHE` v `sw.js` (např. `vinny-denik-v3`).

## AI sommeliér
Funguje jen tehdy, když aplikace běží jako artifact v Claude. Na vlastní adrese se tyto funkce skryjí.
