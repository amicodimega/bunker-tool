# Tribal Wars Bunker Planner

Static GitHub Pages tool for planning defensive support in Tribal Wars.

## Features

- Insert bunker target villages.
- Set a default target defense quantity and default arrival time.
- Override quantity and arrival time per bunker line, for example `462|559 10000 22:00:00`.
- Keep enemy villages in a static section inside `app.js` with `STATIC_ENEMY_VILLAGES`.
- Paste a Tribal Wars troop export with `Coords, Player, spear, sword, heavy` columns.
- Sort friendly villages by distance from the nearest enemy, farthest first.
- Allocate spear, sword, and heavy cavalry. Heavy cavalry counts as 4.
- Optional minimum command weight, default 1000.
- Optional one-player mode.
- Calculate departure time from the wanted arrival time.
- Set world speed and unit speed modifier.
- Copy and load settings for sharing with another player. Static enemies are not overwritten by imports.
- Copy the final plan.

## GitHub Pages

1. Create a repository.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Go to Settings, Pages.
4. Select Deploy from branch.
5. Select `main` and `/root`.

## Static enemies

Edit this block in `app.js`:

```js
const STATIC_ENEMY_VILLAGES = [
  "500|500",
  "505|497"
];
```

## Bunker input examples

```text
462|559 10000 22:00:00
482|548 15000 22:15:00
485|551
```

If quantity or arrival time is missing, the default values are used.

## Troop input example

```csv
Coords,Player,spear,sword,axe,spy,light,heavy,ram,catapult,knight,snob,militia,
462|559,zambo700,2366,67,0,465,0,0,0,50,0,0,0,
```
