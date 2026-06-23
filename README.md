# Tribal Wars Bunker Planner

Tool statico per GitHub Pages pensato per pianificare bunker difensivi su Tribal Wars.

## Funzioni

- Impostazioni mondo compatte, con velocità e modificatore unità default a 1.
- Lista bunker editabile dopo l'inserimento delle coordinate.
- Attivazione o disattivazione di ogni bunker.
- Quantità e arrivo modificabili per ogni bunker.
- Nemici statici in `app.js`.
- Parsing export truppe con colonne `Coords`, `Player`, `spear`, `sword`, `heavy`.
- Peso difesa: `spear + sword + heavy * 4`.
- Peso minimo comando con arrotondamento operativo interno.
- Limite villaggi mittenti per bunker, opzionale.
- Output ordinabile per player o per unità.
- Setup copiabile e ricaricabile.

## Formato bunker

Nel campo coordinate inserisci una o più coordinate:

```text
483|550
484|551
485|552
```

Premi `Aggiungi bunker`.

Dopo l'aggiunta comparirà una tabella dove puoi modificare:

- attivo
- villaggio
- quantità richiesta
- data e ora arrivo

La quantità è peso difesa:

```text
spear = 1
sword = 1
heavy = 4
```

## Nemici statici

Modifica questo blocco in `app.js`:

```js
const STATIC_ENEMY_VILLAGES = [
  "500|500",
  "505|497"
];
```

## GitHub Pages

1. Carica `index.html`, `styles.css`, `app.js`, `README.md` e `.nojekyll` nella root del repository.
2. Vai in Settings, Pages.
3. Seleziona Deploy from branch.
4. Seleziona branch `main` e cartella `/ (root)`.


## Bunker workflow

1. Paste only bunker coordinates in the bunker input box.
2. Set quantity and arrival in the small fields before adding, or edit them later in the table.
3. Use the table to activate, disable, edit, or remove each bunker.

Each bunker has its own quantity and arrival time. Quantity means defensive weight: spear + sword + heavy * 4.

## Rules

- Peso minimo comando: skips commands below the configured weight.
- Consenti arrotondamento del peso minimo: treats values close to the minimum as valid. For example, with 1000 as minimum, values from 900 are accepted.
- Limite villaggi mittenti per bunker: caps how many source villages can be used for each bunker. Empty or 0 means no limit.
