# Backstage — IHM Examination

En spelbar examination i Teknik för digitala plattformar: rädda en musikplattform genom sex felsökningsuppdrag och ett frivilligt Encore/VG-spår. Svenska och engelska kan bytas när som helst. Resonemang kan skrivas på båda språken.

## Testa lokalt

1. Klona detta repo med GitHub Desktop och öppna projektmappen i VS Code.
2. Öppna **Terminal → New Terminal**. Node.js 20 eller senare behövs.
3. Kör `npm start` (Windows: `npm.cmd start` om PowerShell blockerar npm).
4. Öppna **http://localhost:3000**. Ingen `npm install` behövs.
5. Välj språk, skriv för- och efternamn och starta uppdraget.
6. Öppna filen som anges i uppdraget. Spara din ändring i VS Code och välj **Ladda om spelaren** före kontroll. För API-/eventuppgifter behöver du även klicka på uppgiftens knapp.
7. Spara resonemang och alla kodändringar i VS Code. Ladda ned HTML-inlämningen från rapportvyn. Den innehåller svar och sparad kod; lämna denna enda fil på lärplattformen.

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

Uppgift 1, 3, 5 och 6 har ett större resonemangsfält. Uppgift 2 och 4 har två specifika fält. Uppgift 7 har ett resonemangsfält om API-lösningen och ett separat fördjupningsfält där eleven förklarar och granskar en egen ändring i kod för identifiering eller spårning. Fördjupningen bedöms tillsammans med den inlämnade koden. Svenska och engelska följer samma struktur. Tidigare svar från den äldre versionens tre fält visas separat och bevaras i både JSON- och HTML-rapporten.

## Inlämning med svar och kod

I rapportvyn finns **Ladda ned inlämningen (HTML)**. Spara först alla kodändringar i VS Code och låt servern vara igång. Knappen hämtar uppgift 1–7:s angivna kodfiler och HTML-filer direkt från samma server, med webbläsarcachen avstängd. Den skapar en enda HTML-fil med namn, svar, kontrollpoäng och sparad kod under respektive uppgift. Koden visas som text och körs inte. Rapporten är fristående och kan öppnas utan server eller internet. Öppna filen, kontrollera innehållet och lämna den på lärplattformen.

JSON-knappen ger samma svar och kod i strukturerad form som alternativ. Om en fil inte kan hämtas finns svaren ändå med; både appen och rapporten listar exakt vilka kodfiler som saknas. Starta servern och ladda ned igen, eller lämna de saknade filerna separat. Ej sparade ändringar i VS Code följer inte med. Övningssteget, serverns datafiler och provmotorn ingår inte i kodunderlaget. Ingen automatisk central inlämning används.

## Poäng och betyg

Max 24 poäng. Uppgift 1–4 ger vardera 1 kodpoäng och 1 resonemangspoäng. Uppgift 5 ger 2+2, uppgift 6 ger 3+3 och uppgift 7 ger 2 kodpoäng, 2 resonemangspoäng och 2 fördjupningspoäng. G kräver minst 12 av 18 poäng i uppgift 1–6 och grundläggande kunskaper inom samtliga fem läranderesultat, inklusive fungerande grundläggande HTML- och identifierings-/spårningsändringar. VG kräver minst 20 av 24 poäng, uppfyllda G-krav och 2 av 2 fördjupningspoäng styrkta av koden.

Kontroller ger maximalt 10 automatiska funktionspoäng. Uppgift 7 ger bara 1 automatisk kodpoäng för hämtning/visning; den andra kräver bedömd HTTP-/nätverksfelhantering. Övriga 14 poäng bedöms av läraren. Gränssnittet visar därför inget automatiskt slutbetyg. Regler, funktionspoäng och tomma bedömningsfält följer med JSON-/HTML-rapporten. Elever kan läsa de fullständiga kriterierna på startsidan, uppdragskartan och rapporten.
