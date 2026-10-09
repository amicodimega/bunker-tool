# Bunker planner

Aggiorna index.html, app.js, styles.css e map.js nella cartella pubblicata. Conserva villages.js se presente.

## Mittenti

Truppe proprie e Difese presenti aprono due finestre per incollare gli export CSV con colonne Coords, Player, spear, sword, heavy. Premi Carica in ciascuna finestra. Annulla non modifica i dati caricati.

I due export vengono incrociati per coordinate. Per ogni unità la disponibilità stimata è il minimo tra truppe proprie e difese presenti. Viene quindi sottratta la riserva globale per ogni mittente, senza valori negativi. La tabella mantiene le colonne originali e mostra solo le quantità utilizzabili dopo la riserva. I villaggi con meno di 50 unità in tutte e tre le categorie vengono filtrati sulla stima iniziale.

La riserva nelle Regole è espressa in numero di lance, spade e cavalleria pesante, non in peso. La sezione Truppe amiche si apre e si chiude dal titolo senza disattivare i mittenti. Attivo permette la selezione manuale. Copia setup e Carica setup comprendono gli export, le disponibilità stimate e la riserva.

## Destinazioni

Il peso richiesto al bunker è sempre una quantità aggiuntiva da inviare. Le difese presenti nella destinazione non vengono sottratte. Il piano impiega solo le quantità utilizzabili dei mittenti.

## Mappa

La lista nemica include le 1.306 coordinate fornite. Rosso: nemici. Grigio: amici. Blu: mittenti utilizzati, con intensità crescente rispetto al peso effettivo inviato. Giallo: bunker. Rotella: zoom. Trascinamento: spostamento. Passaggio del mouse o tocco: dettagli. Frecce con mappa selezionata: spostamento. Home: inquadratura completa.

Dopo Calcola vengono mostrati i collegamenti e i nuovi supporti assegnati. Una modifica ai dati o alla riserva cancella le assegnazioni della mappa fino al nuovo calcolo.

## Link supporti

I link richiedono VILLAGE_ID_BY_COORD in villages.js, con gli ID del mittente e della destinazione.

## Bunker esistenti

La sezione richiudibile sotto la mappa del planner usa gli stessi due export. Segnala i villaggi con surplus positivo per almeno una unità: max(0, difese - truppe proprie), calcolato separatamente per lance, spade e cavalleria pesante. Peso surplus = surplus lance + surplus spade + 4 × surplus cavalleria pesante.

Il surplus è un limite inferiore dei supporti ricevuti, poiché eventuali truppe proprie fuori possono compensare parte dei supporti. La tabella mostra anche il peso delle difese totali. La sezione non modifica i mittenti, le riserve o i pesi richiesti nel planner.

La seconda mappa mostra amici grigi e bunker esistenti in blu: più scuro indica maggiore peso del surplus. I dettagli sono visibili al passaggio del mouse o al tocco. Tabella e mappa si aggiornano quando vengono caricati gli export.

Il setup condiviso usa compressione gzip con prefisso TWZ1. Il tool continua a leggere i setup precedenti in Base64 o JSON.

La casella Mappa nella tabella dei bunker esistenti mostra o nasconde il villaggio nella seconda mappa. La selezione viene inclusa nel setup e non modifica il planner.

Il setup compatto conserva solo le colonne necessarie degli export e ricostruisce le disponibilità senza duplicarle. Scarica setup salva un file .twsetup da condividere. Carica setup permette anche di aprire questo file.

Convalida tutto registra gli invii del piano corrente come partiti e sottrae le unità effettive dalle disponibilità nei piani successivi. Riduce le quantità ancora da inviare ai bunker e disattiva quelli completati. Il piano viene svuotato dopo la convalida per evitare duplicazioni. Le convalide sono incluse nel setup. Non è previsto Annulla convalida. Reset tutto azzera anche le convalide.

Arcieri: importazione dalla colonna archer, peso 1, riserva, invii, convalida, supporti e tooltip. I setup precedenti restano caricabili. Coordinate nemiche aggiornate a 1.823 villaggi.

Tabelle: menu nelle intestazioni per ordinare, selezionare player, filtrare coordinate e applicare confronti numerici combinati. I filtri riguardano le righe mostrate nelle tabelle. Le caselle Attivo e Mappa conservano le loro funzioni. Regole predefinite: peso minimo disattivato, soglia 1000, arrotondamento disattivato, riserve 0, output per player.


Priorità: distanza dal nemico considerato più vicino. Le 19 coordinate indicate manualmente sono escluse dal calcolo e visibili in rosso chiaro nelle mappe.

Seleziona visibili e Deseleziona visibili agiscono solo sui mittenti mostrati dai filtri. Il piano usa solo i mittenti attivi. Le modifiche alla selezione cancellano il piano precedente.
