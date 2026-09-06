---
paths:
  - "src/lib/export/**"
  - "src/components/chapter/ExportSection.tsx"
---

# Export Word / PDF / PowerPoint

`ExportSection` (`components/chapter/ExportSection.tsx`), affiché en bas de chaque page de
chapitre, télécharge le chapitre en `.docx`, `.pdf` et `.pptx` via `src/lib/export/` :

- `collectBlocks` — un bloc exporté = un enfant direct de l'en-tête de chapitre, de chaque
  `<section>`, ou du bloc `.synthese` ; tout élément `.no-export` (ou `iframe`) est ignoré dès la
  collecte. Marquer `no-export` sur tout nouveau bloc qui ne doit jamais apparaître dans les
  documents (boutons de générateur, sommaire, futures vidéos).
- `captureBlocks` — capture chaque bloc en JPEG via `html2canvas` (thème forcé en clair, largeur de
  capture fixe indépendante de la fenêtre réelle), à sa taille naturelle.
- `buildPdf` / `buildDocx` / `buildPptx` — empilement glouton par format (un bloc suivant tient
  tant qu'il reste de la place, sinon nouvelle page/diapositive) ; un bloc n'est donc jamais coupé,
  par construction. `fitNaturalSize` réduit une image si elle dépasse la page, ne l'agrandit
  jamais.
- Les bibliothèques (`html2canvas`, `jspdf`, `docx`, `pptxgenjs`) sont chargées à la demande
  (`import()` dynamique dans `runExport.ts`), pas au chargement de la page.
- `buildHtml.ts` (4e format, HTML A4) ne passe jamais par `captureBlocks`/html2canvas : reste du
  vrai DOM/CSS (clone de `.page`, tout le CSS du site copié + inliné). Réduit chaque
  `.diagram-frame` autonome à 40% de sa taille réelle, centré (`STYLE_DIAGRAMMES`), à l'exclusion
  des mini-diagrammes groupés (`.diag-multi`, déjà réduits par leur colonne de grille) — propre à
  ce format, sans effet sur le site ni sur les 3 autres formats.
