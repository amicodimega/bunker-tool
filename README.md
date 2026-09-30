# Bunker planner con mappa interattiva

Per aggiornare la pagina, copia index.html, app.js, styles.css e map.js nella cartella pubblicata del repository. Conserva il tuo villages.js esistente. Il pacchetto non lo sostituisce.

La lista nemica in app.js include le 1.306 coordinate fornite. La mappa usa questa lista, i villaggi caricati con Carica truppe e i bunker inseriti. Dopo Calcola evidenzia i mittenti utilizzati e i collegamenti dei supporti.

Rotella: zoom. Trascinamento: spostamento. Inquadra tutti: vista completa. Passaggio del mouse o tocco: dettagli. Con la mappa selezionata, le frecce spostano la vista e Home inquadra tutti.

I dettagli amici mostrano le truppe dell'export e i supporti assegnati. I dettagli bunker mostrano richiesta, arrivo e supporti assegnati in entrata. Le truppe già presenti nel bunker sono mostrate soltanto se quel villaggio compare nell'export amico. Modificare la configurazione cancella le assegnazioni della mappa fino al nuovo calcolo.

La mappa usa canvas e non richiede servizi o librerie esterne.
