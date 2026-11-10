"""Genera villages.js dall'export dei villaggi di Tribal Wars."""
import argparse
import csv
import io
import tempfile
from pathlib import Path
from urllib.request import urlopen

URL = "https://it104.tribals.it/map/village.txt"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="File village.txt già scaricato")
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int)
    parser.add_argument("--out", type=Path, default=Path("villages.js"))
    args = parser.parse_args()
    if args.start < 1 or (args.end is not None and args.end < args.start):
        parser.error("Intervallo ID non valido.")

    tmp = None
    try:
        if args.source:
            raw = args.source.read_bytes()
        else:
            with urlopen(URL, timeout=30) as response:
                raw = response.read()
        villages = {}
        seen_ids = set()
        for row in csv.reader(io.StringIO(raw.decode("utf-8-sig"))):
            if not row:
                continue
            if len(row) != 7:
                raise ValueError("L'export non ha il formato atteso.")
            village_id, x, y = int(row[0]), int(row[2]), int(row[3])
            if village_id < 1 or not (0 <= x <= 999 and 0 <= y <= 999):
                raise ValueError("ID o coordinate non validi.")
            if village_id < args.start or (args.end is not None and village_id > args.end):
                continue
            coord = f"{x:03d}|{y:03d}"
            if coord in villages or village_id in seen_ids:
                raise ValueError("L'export contiene coordinate o ID duplicati.")
            villages[coord] = village_id
            seen_ids.add(village_id)
        if not villages:
            raise ValueError("Nessun villaggio trovato.")
        lines = ["// Dati del mondo IT104", "const VILLAGE_ID_BY_COORD = {"]
        lines.extend(f'  "{coord}": {vid},' for coord, vid in sorted(villages.items()))
        lines.extend(["};", ""])
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=args.out.parent, delete=False
        ) as f:
            tmp = Path(f.name)
            f.write("\n".join(lines))
        tmp.replace(args.out)
    except (OSError, ValueError, csv.Error) as exc:
        parser.exit(1, f"Errore: {exc}. File di destinazione non aggiornato.\n")
    finally:
        if tmp is not None:
            tmp.unlink(missing_ok=True)
    print(f"Scritti {len(villages)} villaggi in {args.out}.")


if __name__ == "__main__":
    main()
