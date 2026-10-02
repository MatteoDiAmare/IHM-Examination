# Backstage — IHM Examination

En spelbar examination i Teknik för digitala plattformar: rädda en musikplattform genom sex felsökningsuppdrag och ett frivilligt Encore/VG-spår. Svenska och engelska kan bytas när som helst. Resonemang kan skrivas på båda språken.

## Testa lokalt

1. Klona detta repo med GitHub Desktop och öppna projektmappen i VS Code.
2. Öppna **Terminal → New Terminal**. Node.js 20 eller senare behövs.
3. Kör `npm start` (Windows: `npm.cmd start` om PowerShell blockerar npm).
4. Öppna **http://localhost:3000**. Ingen `npm install` behövs.
5. Välj språk, skriv för- och efternamn och starta uppdraget.
6. Öppna filen som anges i uppdraget. Spara din ändring i VS Code och välj **Ladda om spelaren** före kontroll. För API-/eventuppgifter behöver du även klicka på uppgiftens knapp.
7. Spara resonemang, gå vidare och exportera JSON eller läsbar HTML från rapportvyn. Lämna rapport och ändrade kodfiler på lärplattformen.

I Codespaces: kör `npm start`, använd `HOST=0.0.0.0 npm start` om portvidarebefordran kräver det, öppna port 3000 via **Ports**. Relativa API-adresser fungerar där också. Håll porten privat.

## Viktigt när du provkör

- Tekniska kontroller visar funktion; läraren fastställer betyget utifrån examinationsunderlaget.
- Sex oberoende uppdrag: ett olöst syntaxfel hindrar inte navigation, svar eller rapportexport.
- Ingen tidsgräns eller automatisk låsning i applikationen. Förfluten tid visas i rapporten. 120-minutersregel och kl. 13-stopp behöver bestämmas inför provet.
- Automatisk kontroll visar teknisk funktion. Resonemang och slutligt betyg bedöms av läraren. Encore-kontrollen testar hämtning/rendering, inte felhanteringens kvalitet.
- Ingen verklig musikuppspelning behövs: Play ändrar spelarstatus. Allt är lokalt; inga externa API:er, typsnitt, analytics eller automatisk central inlämning används.
- Svar sparas i webbläsarens `localStorage` och som JSON i serverns `data/`. Håll samma adress/port när du återupptar. Browserlagringen håller sessions-ID:t; serverkopian är en reservfil, inte en separat återställningsvy.
- `data/` följer inte med Git. Lägg inte elevrapporter med namn i offentliga repon. En lokal rapport är redigerbar och inte ett manipulationssäkert betygsbevis.
- När du avslutar låses svar och kontroller för den omgången. Export fungerar fortfarande. På startsidan kan du starta ett nytt test; exportera först om du vill behålla tidigare omgång.
- Dina ändrade uppgiftsfiler återställs inte av ett nytt test. Återställ dem med GitHub Desktop för att testa buggarna igen. Favoritlagringen (`backstage-favourite`) kan rensas separat i DevTools.

## Kodstruktur

`server.mjs`, `package.json`, `public/index.html`, `public/exam-shell.js`, `public/styles.css` känns igen från musikspelaren/labbarna. Uppgifterna har separata `index.html`/`app.js` under `public/missions/01`–`07`. Språktexterna bor i `app.js` och `missions.json`.

`bridge.js` observerar uppgifternas beteende och returnerar kontrollresultat till provgränssnittet. Eleven arbetar i uppgiftsfilerna, inte provmotorn. Kontrollerna är avsiktligt synliga i en lokal examination och ska inte betraktas som fuskförebyggande.

## API

- `GET /api/health` — serverstatus
- `GET /api/tracks` — två förberedda låtar
- `POST /api/events` — `{type:'play', trackId:'night-drive', visitorId:'...'}`; kräver giltiga fält, ger 202
- `GET /api/encore` — bonuslåt
- `GET/POST /api/sessions/:id` — lokal reservkopiering av provsvar

## Verifiering

`npm test` testar API, felstatus, beständig sessionssparning och isolerad uppgift med avsiktligt syntaxfel. Uppgift 01 ska ha ett syntaxfel från början; att syntaxkontrollera alla uppgiftsfiler som produktionskod vore fel.

## Övningssteg och omladdning

Nya omgångar börjar med ett obetygsatt övningssteg i `public/missions/00`. Det visar VS Code-sökvägen, hur du hittar uppgiftens fil i DevTools, hur du sparar och laddar om spelaren samt hur resonemang fungerar. Samma övning nås från uppdragskartan.

Provets huvudfil heter `exam-shell.js`; elevernas uppgifter använder `app.js` i mapparna `missions/01`–`07`. Efter F5/Ctrl+R återkommer du till samma uppdrag i samma flik. **Ladda om spelaren** laddar bara uppgiften och behåller dina svar.

## Frågor och svar

Uppgift 1, 3 och 5–7 har ett större resonemangsfält. Uppgift 2 och 4 har två specifika fält. Svenska och engelska följer samma struktur. Tidigare svar från den äldre versionens tre fält visas separat och bevaras i både JSON- och HTML-rapporten.

## Inlämningspaket

I rapportvyn finns **Ladda ned inlämningspaket (ZIP)**. Spara först alla kodändringar i VS Code. Paketet innehåller den aktuella elevens rapport som JSON/HTML och ett körbart projekt med de sparade uppgiftsfilerna. Packa upp och kör `npm start` i `projekt/`. Serverns `data/`, Git-filer, andra sessioner och `node_modules/` följer inte med. Knappen skickar inget centralt; eleven lämnar ZIP-filen på lärplattformen. Starta om servern efter uppdateringen för att aktivera export-API:t.
