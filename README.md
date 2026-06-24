# Tribal Wars Bunker Planner

Tool statico per GitHub Pages pensato per pianificare bunker difensivi su Tribal Wars.

## Funzioni

- Impostazioni mondo compatte, con velocità e modificatore unità default a 1.
- Lista bunker editabile dopo l'inserimento delle coordinate.
- Riduzione velocità supporti configurabile per ogni bunker.
- Attivazione o disattivazione di ogni bunker.
- Quantità e arrivo modificabili per ogni bunker.
- Nemici statici in `app.js`.
- Parsing export truppe con colonne `Coords`, `Player`, `spear`, `sword`, `heavy`.
- Esclusione automatica dei villaggi amici con meno di 50 lance, meno di 50 spade e meno di 50 heavy.
- Peso difesa: `spear + sword + heavy * 4`.
- Peso minimo comando con arrotondamento operativo interno.
- Tabella truppe amiche con attivazione o disattivazione dei villaggi mittenti.
- Reset generale nella parte alta del planner.
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
- percentuale di riduzione velocità supporti

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
- Consenti arrotondamento dei pesi: usa pesi arrotondati nel piano quando un comando è vicino alla cifra piena.
- Limite villaggi mittenti per bunker: caps how many source villages can be used for each bunker. Empty or 0 means no limit.


## Truppe amiche

1. Incolla l'export truppe nel campo `Tabella truppe`.
2. Premi `Carica truppe`.
3. Usa la tabella per attivare o disattivare i villaggi mittenti.
4. Il piano usa solo i villaggi con `Attivo` selezionato.

## Criterio scelta mittenti

Per ogni bunker il planner ordina i villaggi mittenti così:

1. distanza dal nemico statico più vicino, decrescente
2. peso difesa disponibile, decrescente
3. distanza dal bunker, crescente

Quindi la distanza dal bunker viene usata solo come terzo criterio, dopo sicurezza e peso disponibile.

## Reset

Il pulsante `Reset tutto` cancella bunker, truppe, output e impostazioni del planner. Non modifica `STATIC_ENEMY_VILLAGES` in `app.js`.

## Formato output Tribal Wars

Il piano usa BBCode pronto per Tribal Wars:

```text
[b]BUNKER[/b] 498|471

Target: 20000
Arrivo: 2026-06-25 08:01:28

[b]Player:[/b] [player]Blinker[/player]

527|583 -> 498|471
3894 lance [unit]spear[/unit] | partenza: 2026-06-23 21:18:59
831 oni [unit]heavy[/unit] | partenza: 2026-06-24 10:48:50
Peso: 8000
Distanza nemico: 87.28
```

Etichette unità usate nel piano:

- `lance [unit]spear[/unit]`
- `spade [unit]sword[/unit]`
- `oni [unit]heavy[/unit]`

## Partenze già passate

Il planner non propone righe con partenza già passata rispetto all'orario italiano corrente. Se una parte del comando è ancora valida, resta nel piano. Se tutte le unità di quel comando hanno partenza già passata, il comando viene escluso.

## Riduzione velocità supporti

Ogni bunker può avere una percentuale di riduzione velocità supporti. Esempio: `30` significa supporti più lenti del 30%, quindi il tempo viaggio aumenta. Lascia vuoto oppure `0` per non applicare modifiche.

## Filtro truppe amiche

Quando carichi il CSV, un villaggio amico non viene caricato se ha contemporaneamente meno di 50 spear, meno di 50 sword e meno di 50 heavy.
