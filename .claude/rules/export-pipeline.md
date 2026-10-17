---
paths:
  - "src/lib/export/**"
  - "src/components/chapter/ExportSection.tsx"
---

# Export HTML (A4)

`ExportSection` (`components/chapter/ExportSection.tsx`), affiché en bas de chaque page de
chapitre, télécharge le chapitre en `.html` — seul format d'export du site (Word/PDF/PowerPoint
retirés, voir `.claude/rules/content-history.md`) — via `src/lib/export/` :

- `buildHtml.ts` (`buildHtmlBlob`) reste du vrai DOM/CSS, jamais rasterisé : clone `.page`, retire
  `.no-export`/`iframe`, copie l'intégralité du CSS du site (+ `katex.min.css`) et inline chaque
  police en `data:` URI (fichier autonome, ouvrable hors ligne). Réduit chaque diagramme autonome
  à 55% de sa taille réelle (`ECHELLE_DIAGRAMMES_HTML`/`STYLE_DIAGRAMMES`), à l'exclusion des
  mini-diagrammes groupés (`.diag-multi`, déjà réduits par leur colonne de grille). Ce 55% est une
  **règle générale indépendante** du reste du CSS mobile/écran du site (`.diagram-frame--compact`,
  le bump de police `fontSize` des composants d'illustration, `vector-effect: non-scaling-stroke`
  — tout ça reste écran uniquement) : calibrée empiriquement pour l'impression A4 seule, à ne
  jamais mélanger avec les règles de lisibilité mobile qui répondaient à un besoin différent
  (texte/traits trop petits sur petit écran, pas trop de place prise sur une feuille imprimée).
  40% rendait les graduations/étiquettes d'un diagramme nettement plus petites que le corps de
  texte environnant à l'impression ; 70% faisait prendre à un diagramme simple une hauteur de page
  disproportionnée. 55% est le point où le texte du diagramme rejoint la taille du texte courant,
  vérifié par simulation d'impression A4 (viewport à la largeur de contenu A4, `emulateMedia:
  'print'`) sur un diagramme simple ET un diagramme dense à plusieurs étiquettes, puis confirmé sur
  le vrai fichier exporté (impact mesuré : page count inchangé sur un chapitre simple, +2 pages sur
  33 pour le chapitre le plus dense du site). Pagination A4 via CSS Paged Media (`@page`,
  numérotation `n / total`).
- `downloadBlob.ts` — téléchargement natif du navigateur (`URL.createObjectURL` + `<a download>`).
- `buildHtmlBlob` est chargé à la demande (`import()` dynamique dans `runExport.ts`), pas au
  chargement de la page.
