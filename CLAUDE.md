# Math-Belgium — site des chapitres de cours FWB

Site de chapitres de cours narratifs (4e/5e/6e), séparé de `plateforme-maths` (dépôt indépendant).
Chaque chapitre renvoie vers les générateurs d'exercices interactifs de `plateforme-maths` via des
liens directs.

## Stack

- React + TypeScript, Vite.
- React Router (`react-router-dom`) pour la navigation.
- KaTeX pour toutes les formules mathématiques (rendu via `src/components/Math.tsx`, pas de
  notation maison en CSS).
- Déploiement : GitHub → Vercel (même schéma que `plateforme-maths`).

## Principe d'architecture : gabarit unique + contenu en données

Contrairement à `plateforme-maths` (3 chantiers indépendants sans contrat partagé, parce que la
logique de vérification de chaque générateur diffère trop pour être mutualisée), un chapitre de
cours suit **toujours la même structure**. Il n'y a donc **pas** de composant par chapitre : un
seul gabarit partagé, `ChapterPage` (`src/components/chapter/ChapterPage.tsx`), et chaque
chapitre est un objet de **données** (`ChapterContent`, voir `src/content/types.ts`), jamais du
code React réécrit à chaque fois.

Ajouter un chapitre = :

1. Créer `src/content/chapters/{niveau}/{slug}.ts` exportant un `ChapterContent`.
2. L'ajouter au tableau `chapters` du bon niveau dans `src/content/chaptersIndex.ts`.

Aucune route ni page à coder à la main — `ChapterRoute` résout `/{levelSlug}/{chapterSlug}` en
cherchant le chapitre correspondant dans `chaptersIndex.ts`.

## Structure de navigation

- `/` — page d'accueil (`routes/HomePage.tsx`), une section par niveau (`LEVELS` dans
  `content/chaptersIndex.ts`) listant ses chapitres.
- `/{levelSlug}/{chapterSlug}` — page d'un chapitre (`routes/ChapterRoute.tsx`), résolue via
  `findChapter()`.

## Règles détaillées (chargées seulement quand pertinentes)

Le détail par thème vit dans `.claude/rules/` — chaque fichier n'est chargé que lorsqu'un fichier
correspondant à son champ `paths` est lu ou modifié, pour ne pas payer son coût sur toutes les
tâches :

| Fichier | Portée (`paths`) | Contenu |
| --- | --- | --- |
| `.claude/rules/content-authoring.md` | `src/content/**`, `src/lib/generatorLink.ts`, `src/components/Math.tsx` | Schéma `ChapterContent`/`Block` complet, mini-syntaxe `RichText` (KaTeX + gras) et ses pièges, convention de lien vers un générateur, déclaration des kinds `atelier`/`entrainement.widgetTag` côté contenu. |
| `.claude/rules/illustration-components.md` | `src/components/illustrations/**` | Catalogue complet des kinds d'`IllustrationSpec` (machine, curvePlot, vectorPlane, setMapping, pascalTriangle, etc.) et la convention des classes CSS `svg-*` du thème. |
| `.claude/rules/chapter-components.md` | `src/components/chapter/**` | Composants du gabarit de chapitre (`ChapterPage`, `BlockRenderer`, Callouts, `ExempleResolu`, `SignTable`, `FeatureTable`, `OperationChain`...). |
| `.claude/rules/interactive-widgets.md` | `src/interactive/**`, `src/components/chapter/InteractiveWidget.tsx`, `tsconfig.app.json` | Mécanisme de portage des Web Components vanilla (Shadow DOM) depuis un artifact, montage impératif, ordre d'import, et le piège UMD `module.exports`/Vite-Rollup. |
| `.claude/rules/export-pipeline.md` | `src/lib/export/**`, `src/components/chapter/ExportSection.tsx` | Pipeline d'export Word/PDF/PowerPoint (`collectBlocks`, `captureBlocks`, `buildPdf`/`buildDocx`/`buildPptx`). |
| `.claude/rules/content-history.md` | `src/content/chapters/**` | Historique détaillé, chapitre par chapitre, des migrations/enrichissements déjà réalisés (choix éditoriaux, bugs trouvés et corrigés, kinds ajoutés). |

## Vérification avant de pousser

- `npm run build` (= `tsc -b && vite build`) doit passer sans erreur.
