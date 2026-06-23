# Tribal Wars Bunker Planner

Tool statico per GitHub Pages per pianificare bunker difensivi in Tribal Wars.

## Funzioni

- Inserimento dei bunker con quantità e data/ora di arrivo.
- Default globale per quantità e arrivo.
- Lista nemici statica in `app.js`, sezione `STATIC_ENEMY_VILLAGES`.
- Incolla export truppe Tribal Wars con colonne `Coords`, `Player`, `spear`, `sword`, `heavy`.
- Priorità sender per ogni bunker:
  1. più lontano dal nemico più vicino
  2. più peso difensivo disponibile
  3. più vicino al bunker
- Peso difensivo: `spear + sword + heavy * 4`.
- Flag per comando minimo, default 1000 peso difesa.
- Il comando finale sotto soglia viene ammesso quando serve a chiudere il bunker.
- Limite variabile di sender per bunker, default 20, usa 0 per nessun limite.
- Output ordinabile per player o per unità.
- Partenza separata per spear, sword e heavy.
- Tempi arrotondati al secondo, senza millisecondi.
- Warnings per truppe insufficienti, sender sotto soglia, limite sender e configurazioni non valide.
- Copia e carica setup condiviso. I nemici statici non vengono sovrascritti.

## Velocità base

```text
spear = 18 min/campo
sword = 22 min/campo
heavy = 11 min/campo
```

Formula:

```text
tempo_viaggio = distanza * velocità_base / velocità_mondo / modificatore_unità
```

## Formato bunker

```text
462|559 10000 2026-06-25 22:00:00
482|548 15000 2026-06-25 22:15:00
485|551
```

Se quantità o data/ora mancano, il tool usa i valori default.

## Nemici statici

Modifica in `app.js`:

```js
const STATIC_ENEMY_VILLAGES = [
  "500|500",
  "505|497"
];
```

## GitHub Pages

1. Carica `index.html`, `styles.css`, `app.js` e `.nojekyll` nella root del repository.
2. Vai in Settings, Pages.
3. Seleziona Deploy from a branch.
4. Seleziona branch `main`.
5. Seleziona folder `/ (root)`.

URL atteso:

```text
https://amicodimega.github.io/bunker-tool/
```
