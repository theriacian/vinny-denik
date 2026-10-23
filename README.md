# Vinný deník

Zápisník z ochutnávek po moravských vinných sklípcích. Statický web bez serveru a bez databáze: každý má svůj deník uložený ve vlastním telefonu, aplikace jde přidat na plochu a funguje i bez signálu.

## Struktura
- `index.html` – celá aplikace (HTML, CSS a JavaScript v jednom souboru)
- `sw.js` – offline režim (service worker)
- `manifest.webmanifest`, `icon-*.png`, `apple-touch-icon.png` – instalace na plochu
- `vercel.json` – hlavičky, aby se novinky dostaly k uživatelům hned
- `api/backup.js` – serverová funkce pro zálohy na server (Vercel Blob)

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

## Záloha na server
- V nastavení víkendu (klepnutí na název) se člověk přihlásí jménem a kódem a tlačítkem „Uložit na server“ uloží celý deník včetně fotek. Každé uložení je nová verze, nic se nepřepisuje.
- Soubory leží v soukromém úložišti Vercel Blob ve složce `zalohy/<jmeno>/`, např. `zalohy/jana/2026-10-24_18-30-05_vikend-v-mikulove.json`. Majitel projektu je vidí ve Vercelu v části Storage.
- Jména a kódy jsou v proměnné prostředí `VD_USERS` ve formátu `Jana:kod1,Petr:kod2` (kód bez čárky a dvojtečky). Po změně proměnné je potřeba nové nasazení (Redeploy).
- Úložiště musí být soukromé (Private) a připojené k projektu, přihlašovací údaje k němu doplní Vercel sám.
- Limit: jedna záloha může mít nejvýš zhruba 4,5 MB (limit serverových funkcí Vercelu), to odpovídá desítkám vín s fotkami.
