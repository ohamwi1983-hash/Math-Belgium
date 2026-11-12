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
  disproportionnée. 55% (52 % depuis la mise en page compacte, voir plus bas) est le point où le texte du diagramme rejoint la taille du texte courant,
  vérifié par simulation d'impression A4 (viewport à la largeur de contenu A4, `emulateMedia:
  'print'`) sur un diagramme simple ET un diagramme dense à plusieurs étiquettes, puis confirmé sur
  le vrai fichier exporté (impact mesuré : page count inchangé sur un chapitre simple, +2 pages sur
  33 pour le chapitre le plus dense du site). Pagination A4 via CSS Paged Media (`@page`,
  numérotation `n / total`).
  **Mise en page compacte (demande utilisateur : trop de pages, garder juste la place de
  perforer)** : `@page` 9 mm haut / 11 mm bas / **17 mm à gauche et à droite** (trous ISO 838 à
  12 mm du bord, Ø 6 mm → bord du trou à 15 mm, 2 mm de garde) ; sous `@media print`, `.page` perd
  sa colonne d'écran (`max-width` 760 px, marges intérieures 56/24/96 px, qui s'AJOUTAIENT aux
  marges @page), espacements verticaux et marges intérieures des callouts/exemples/cadres resserrés ;
  seuls les blocs courts restent insécables (`figure`, `.diagram-frame`, tableau de signes, cartes,
  `.wrong-right`) — un exemple ou un callout long refusant de se couper laissait des demi-pages
  blanches — avec titres solidaires de la suite (`break-after: avoid`) et `orphans`/`widows` 3.
  Échelle des diagrammes ramenée de 55 à 52 % pour garder la même taille absolue (≈ 92 mm) dans la
  colonne élargie. Mesuré sur le PDF A4 réel du fichier exporté : trigonométrie 42 → 29 pages,
  second degré 20 → 16, nombres complexes 42 → 30, lieux géométriques 35 → 28.
- `downloadBlob.ts` — téléchargement natif du navigateur (`URL.createObjectURL` + `<a download>`).
- `buildHtmlBlob` est chargé à la demande (`import()` dynamique dans `runExport.ts`), pas au
  chargement de la page.
