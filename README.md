# Tribal Wars Bunker Planner

Tool statico per GitHub Pages per pianificare bunker difensivi in Tribal Wars.

## File da caricare

Carica nella root del repository:

- `index.html`
- `styles.css`
- `app.js`
- `.nojekyll`

## GitHub Pages

1. Vai su `Settings`.
2. Vai su `Pages`.
3. Source: `Deploy from a branch`.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Salva.

## Formato bunker

Nel campo bunker inserisci una riga per ogni villaggio:

```text
COORD QUANTITÀ DATA ORA
```

La quantità può essere diversa per ogni bunker.

Esempio di struttura, senza usare questi valori come default:

```text
xxx|yyy quantità aaaa-mm-gg hh:mm:ss
xxx|yyy quantità aaaa-mm-gg hh:mm:ss
```

Se una riga contiene solo la coordinata, il tool usa i campi di fallback sotto la lista bunker.

## Peso difesa

Il target bunker usa questo peso:

```text
spear = 1
sword = 1
heavy = 4
```

Quindi:

```text
peso = spear + sword + heavy * 4
```

## Peso minimo comando

Quando il flag è attivo, il tool evita comandi troppo piccoli. Il motore accetta anche comandi vicini al peso minimo, così un invio da circa 900 viene trattato come valido per un minimo 1000.

## Max sender per bunker

Il campo limita quanti villaggi sender vengono usati per ogni bunker dopo l’ordinamento multicriterio.

Usa `0` per non avere limite.

## Ordinamento sender

Per ogni bunker, i villaggi sender vengono ordinati così:

1. più lontani dal nemico più vicino
2. più difesa disponibile
3. più vicini al bunker

## Output

L'output può essere ordinato:

- per player
- per unità

Il piano mostra solo informazioni operative: player, villaggio, bunker, truppe, partenza e distanze.

## Nemici statici

Modifica la lista in `app.js`:

```js
const STATIC_ENEMY_VILLAGES = [
  "xxx|yyy"
];
```

Il setup condiviso non modifica la lista nemici.
