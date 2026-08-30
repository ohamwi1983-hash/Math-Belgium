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

### Schéma `ChapterContent`

Un chapitre a un en-tête (niveau, numéro, titre, lede), une intro optionnelle ("mise en
contexte"), puis une liste de `ChapterSection` numérotées. Chaque section est une liste ordonnée
de `Block` — le même bloc peut apparaître dans n'importe quel ordre selon le besoin pédagogique :

| `Block.kind`    | Rendu                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `para`           | Paragraphe de prose (texte riche, voir ci-dessous)                     |
| `subheading`     | Sous-titre de sous-section (`h3`)                                      |
| `list`           | Liste à puces simple, hors callout (`ul.plain`)                       |
| `rappel`         | Callout neutre "Rappel"                                                |
| `methode`        | Callout "Méthode", liste d'étapes numérotées                          |
| `attention`      | Callout "⚠ Attention"                                                  |
| `astuce`         | Callout "💡 Astuce" (+ liste optionnelle)                              |
| `piege`          | Callout "Piège classique"                                              |
| `exemple`        | "Exemple résolu" : badge, formule, étapes tagguées, résultat encadré  |
| `wrongRight`     | Comparaison côte-à-côte ✗ incorrect / ✓ correct                       |
| `illustration`   | Figure SVG autonome (voir plus bas)                                    |
| `illustrationGroup` | Plusieurs illustrations compactes côte à côte (grille `diag-multi`) |
| `signTable`      | Tableau de signes / de variation (lignes alignées colonne par colonne) |
| `video`          | Placeholder "vidéo à venir" (exclu de l'export)                        |
| `entrainement`   | Carte "S'entraîner" en fin de section, avec lien vers le générateur   |

Le texte de tous les champs `text`/`items`/`formula` supporte une mini-syntaxe : `$latex$` pour
une formule KaTeX inline, `**gras**` pour l'emphase — voir `RichText` dans
`src/components/Math.tsx`. Ne jamais écrire de JSX dans les fichiers de contenu : tout passe par
ces deux conventions.

## Composants réutilisables

- `ChapterPage` (`components/chapter/ChapterPage.tsx`) — le gabarit lui-même : en-tête, table des
  matières, intro, sections numérotées, récapitulatif final.
- `BlockRenderer` / `BlockList` (`components/chapter/BlockRenderer.tsx`) — bascule sur
  `Block.kind` pour rendre chaque bloc de contenu.
- `Rappel`, `Methode`, `Attention`, `Astuce`, `PiegeClassique` (`components/chapter/Callouts.tsx`)
  — callouts stylés distinctement (couleur + icône propres à chacun, cohérentes sur tout le site).
- `ExempleResolu`, `WrongRight`, `CarteEntrainement`, `RecapFinal`, `ChecklistRelecture` (dossier
  `components/chapter/`) — `ChecklistRelecture` est un composant à part entière (fichier propre),
  distinct de `RecapFinal` : l'un résume la théorie ("Ce qu'il faut retenir"), l'autre est la
  liste de vérifications de méthode à se poser avant de rendre sa copie. `RecapFinal` l'utilise en
  composition quand `recap.checklist` est fourni.
- `MathInline`, `RichText`, `RichParagraph` (`components/Math.tsx`) — rendu KaTeX + mini-syntaxe.
  **Piège vérifié en pratique** : `$latex$` imbriqué à l'intérieur de `**gras**` (ex.
  `'**$a > 0$**'`) n'est PAS reparsé — le tokenizer capture tout le texte entre `**...**` comme
  gras littéral, dollars compris, et KaTeX ne s'exécute jamais dessus. Toujours écrire le gras et
  le math comme deux segments adjacents, jamais l'un dans l'autre.
- `SignTable` (`components/chapter/SignTable.tsx`) — tableau de signes/variation, lignes alignées
  colonne par colonne (`tone: 'zero' | 'pos' | 'neg' | 'plain'` par cellule).
- `Illustration` (`components/illustrations/Illustration.tsx`) — enveloppe commune
  figure/diagram-frame/figcaption pour toute illustration ; bascule sur `IllustrationSpec.kind` :
  - `machine` — schéma "x entre, f(x) sort".
  - `domainLine` — droite graduée d'un domaine de définition (segments acceptés, points exclus,
    bornes numériques). Paramétrée par valeurs réelles, pas par pixels câblés en dur.
  - `compositionIntro` — schéma x→g→g(x)→f→f(g(x)) avec l'accolade "f∘g".
  - `chain` — chaîne à N étages (décomposition d'une fonction composée), étage le plus extérieur
    mis en évidence.
  - `compositionSchematic` — méthode de lecture graphique de (g∘f)(a) sur deux graphes abstraits.
  - `compositionNumeric` — même méthode, avec des graphes gradués et des valeurs concrètes.
  - `functionGraph` — trace la courbe réelle d'une fonction JS fournie (échantillonnage, pas une
    courbe approximative dessinée à la main) ; réutilisable pour de futurs chapitres (limites,
    asymptotes, dérivées) qui auront aussi besoin de tracer une fonction sur un intervalle.
  - `curvePlot` — généralise `functionGraph` : plusieurs courbes superposées (tons `accent` /
    `faint` / `good` / `bad`), axe de symétrie, points marqués, racines sur l'axe des x, bande
    d'image ombrée. Couvre la quasi-totalité des besoins graphiques d'un chapitre sur les
    paraboles (allures, sommet, image, racines, translations) sans dupliquer le moteur de tracé
    par cas d'usage. L'axe vertical se plante à x=0 réel (pas au bord gauche du cadre) : attention
    si on le retouche, l'échelle est calée sur `xMin`, pas sur un `xAxisMin` séparé comme dans
    `functionGraph`.
  - `fencedEnclosure` — schéma géométrique (mur + enclos rectangulaire + clôture), pas une courbe ;
    reste un kind séparé plutôt que d'être forcé dans `curvePlot`, qui ne modélise que des fonctions.

Toutes les illustrations utilisent les classes CSS `svg-ink` / `svg-line` / `svg-accent` /
`svg-good` / `svg-bad` / `svg-faint` définies dans `src/index.css`, qui pointent vers les variables
de thème — elles s'adaptent donc automatiquement au thème sombre.

## Convention de lien vers un générateur

Le routing n'est **pas uniforme entre chantiers** — vérifié sur le déploiement réel, pas supposé :

- `4e` : générateurs à la racine → `https://plateforme-maths.vercel.app/{idGenerateur}`
- `5e-4h`, `6e-6h` : générateurs dans un dossier → `https://plateforme-maths.vercel.app/{chantier}/{idGenerateur}`

Voir `src/lib/generatorLink.ts`, qui encapsule ce cas spécial : l'authoring d'un chapitre pose
toujours `chantier` = `levelSlug` (ex. `'4e'`, `'5e-4h'`), la fonction se charge de générer la
bonne forme d'URL selon le chantier.

## Structure de navigation

- `/` — page d'accueil (`routes/HomePage.tsx`), une section par niveau (`LEVELS` dans
  `content/chaptersIndex.ts`) listant ses chapitres.
- `/{levelSlug}/{chapterSlug}` — page d'un chapitre (`routes/ChapterRoute.tsx`), résolue via
  `findChapter()`.

## Export Word / PDF / PowerPoint

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

## État actuel du contenu

- **5e (4h), Chapitre 1 — Fonctions : rappels et compléments** (`fonctions-composees`) : migré en
  intégralité, texte et illustrations. Les illustrations graphiques (droites graduées du domaine,
  diagrammes $C_f$/$C_g$, graphe de $h(r)$) ont été reconstituées à partir de l'artifact original
  (et non redessinées à l'aveugle depuis une extraction de texte).
- **4e, Chapitre 1 — La fonction du second degré** (`fonction-second-degre`) : migré en intégralité
  depuis l'artifact d'origine. A nécessité, découverts en cours de migration (absents du schéma
  initial) : les kinds `list`, `signTable`, `illustrationGroup`, `video`, et les deux kinds
  d'illustration `curvePlot`/`fencedEnclosure`. Une simplification assumée : le tableau "Image
  selon le signe de a" (3 colonnes, 2 lignes) a été converti en liste à puces plutôt que de créer
  un troisième type de tableau pour ce seul cas. Vérifié par rendu SSR réel (pas seulement `tsc`) :
  aucun `$...$` non résolu, aucun lien générateur cassé, les deux callouts "piège classique" sur le
  bon composant malgré une classe CSS source ambiguë (`callout-attention` réutilisée pour les deux
  labels dans l'artifact).

## Vérification avant de pousser

- `npm run build` (= `tsc -b && vite build`) doit passer sans erreur.
