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
- Jako artifact v Claude běží sommeliér na Claudovi uživatele.
- Na vlastní adrese (Vercel) běží na Gemini přes klíč, který si uživatel vytvoří zdarma v Google AI Studiu (aistudio.google.com/apikey) a vloží v záložce Sommeliér. Klíč se ukládá jen v jeho prohlížeči (`localStorage`, klíč `vinny-denik-gemini-v1`) a není součástí zálohy.
- Aplikace volá Gemini API přímo z prohlížeče. Model vybere podle seznamu dostupných modelů (přednost má řada Flash) a při vyčerpání limitu zkusí další.
- Bez klíče se funkce sommeliéra skryjí, statistiky fungují dál.
