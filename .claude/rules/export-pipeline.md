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
  à 40% de sa taille réelle (`STYLE_DIAGRAMMES`), à l'exclusion des mini-diagrammes groupés
  (`.diag-multi`). Pagination A4 via CSS Paged Media (`@page`, numérotation `n / total`).
- `downloadBlob.ts` — téléchargement natif du navigateur (`URL.createObjectURL` + `<a download>`).
- `buildHtmlBlob` est chargé à la demande (`import()` dynamique dans `runExport.ts`), pas au
  chargement de la page.
