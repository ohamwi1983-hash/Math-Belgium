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
| `definition`     | Callout "Définitions" — paragraphes de définition formelle, pas une liste à puces |
| `exemple`        | "Exemple résolu" : badge, formule, étapes tagguées, résultat encadré  |
| `exempleLibre`   | "Exemple résolu" en forme libre : blocs imbriqués quelconques (prose, chaîne...), quand le raisonnement ne se découpe pas en étapes/résultat rigides |
| `wrongRight`     | Comparaison côte-à-côte ✗ incorrect / ✓ correct                       |
| `illustration`   | Figure SVG autonome (voir plus bas)                                    |
| `illustrationGroup` | Plusieurs illustrations compactes côte à côte (grille `diag-multi`) |
| `signTable`      | Tableau de signes / de variation (lignes alignées colonne par colonne) |
| `featureTable`   | Tableau à en-tête fixe (colonnes nommées, lignes de données) — forme différente de `signTable` |
| `operationChain` | Chaîne de valeurs reliées par des opérations nommées sur les flèches (HTML/flexbox, pas SVG — les nœuds contiennent du texte riche/KaTeX) |
| `video`          | Placeholder "vidéo à venir" (exclu de l'export)                        |
| `entrainement`   | Carte "S'entraîner" en fin de section, avec lien vers le générateur   |

Le texte de tous les champs `text`/`items`/`formula` supporte une mini-syntaxe : `$latex$` pour
une formule KaTeX inline, `**gras**` pour l'emphase — voir `RichText` dans
`src/components/Math.tsx`. Ne jamais écrire de JSX dans les fichiers de contenu : tout passe par
ces deux conventions.

`ChapterContent.recap.items` est optionnel : une synthèse peut être purement tabulaire
(`recap.table`, même forme que `featureTable`) sans liste à puces — cas rencontré dès qu'un
chapitre récapitule plusieurs fonctions/objets comparables plutôt qu'une liste de principes.

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
- `FeatureTable` (`components/chapter/FeatureTable.tsx`) — tableau à en-tête fixe (colonnes
  nommées, ex. "Fonction | Domaine | Image"), réutilisé tel quel pour `recap.table`.
- `OperationChain` (`components/chapter/OperationChain.tsx`) — chaîne HTML/flexbox (pas SVG) de
  valeurs KaTeX reliées par des opérations nommées sur les flèches, `direction: 'forward' |
  'backward'` pour une chaîne qui se lit à l'envers (ex. "défaire" une composition).
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
    d'image ombrée, asymptotes horizontales, ligne de test horizontale (avec points
    d'intersection). Chaque courbe peut avoir son propre sous-intervalle d'échantillonnage
    (`xMin`/`xMax` par courbe) — utile pour une portion restreinte en accent sur fond de courbe
    complète en fané (ex. sin restreint à [−π/2 ; π/2] sur fond de sinusoïde complète). `xTickLabels`
    permet des étiquettes symboliques (ex. "π/2") plutôt que la valeur décimale brute. Couvre la
    quasi-totalité des besoins graphiques d'un chapitre sur les paraboles ou les fonctions
    trigonométriques sans dupliquer le moteur de tracé par cas d'usage. L'axe vertical se plante à
    x=0 réel (pas au bord gauche du cadre) : attention si on le retouche, l'échelle est calée sur
    `xMin`, pas sur un `xAxisMin` séparé comme dans `functionGraph`.
  - `fencedEnclosure` — schéma géométrique (mur + enclos rectangulaire + clôture), pas une courbe ;
    reste un kind séparé plutôt que d'être forcé dans `curvePlot`, qui ne modélise que des fonctions.
  - `setMapping` — diagramme d'application entre deux ensembles A et B (points + flèches), pour
    injectivité/surjectivité/bijectivité. Positions verticales en fraction relative (0–1) par
    point, flèches par indices. **Utilise `useId()` pour l'id du marqueur de flèche** (pas un id
    fixe) car ce kind apparaît typiquement plusieurs fois sur une même page (3 diagrammes
    comparés) — un id fixe collisionnerait. Les autres composants à flèche du dossier (`cp-arrow`,
    `chain-arrow`, `fg-arrow`, `domain-arrow`) utilisent encore un id fixe ; ça reste sans
    symptôme visible tant que tous les marqueurs partageant l'id ont un rendu identique, mais
    `useId()` est la bonne pratique à suivre pour tout nouveau composant à marqueur.
  - `unitCircleArc` — cercle trigonométrique + rayon + arc + projection, pour arcsin/arccos/arctan.
    `mode` distingue une géométrie de projection réellement différente (horizontale sur l'axe y
    pour sin, verticale sur l'axe x pour cos, sur la tangente géométrique verticale pour tan) —
    pas juste une couleur qui change.
  - `polygonDiagonals` — polygone régulier avec TOUTES ses diagonales tracées (les diagonales sont
    énumérées par le composant, jamais saisies). Distinct de `circleDiagram.inscribedPolygon`, qui
    ne dessine que les côtés.
  - `circularPermutation` — `n` objets en cercle + la symétrie qui les identifie : `mode:
    'rotation'` (arc, cas de la table) ou `'reflection'` (axe, cas du collier) — deux géométries
    réellement différentes, pas une couleur qui change.
  - `groupPartition` — pool de jetons réparti dans des boîtes nommées de tailles fixées (largeur de
    boîte proportionnelle à la taille) : répartition multinomiale, personnes en groupes ou objets
    en boîtes numérotées.
  - `letterTiles` — rangée de tuiles-lettres colorées par identité + légende des effectifs
    (permutation avec répétitions / anagrammes).
  - `pascalTriangle` — triangle de Pascal, coefficients CALCULÉS par le composant ; `pascalRelation`
    met en évidence un coefficient et ses deux parents, reliés par les traits de la relation.
  - `categoricalBarChart` — barres à catégories NOMMÉES (étiquettes textuelles), verticales ou
    horizontales, échelle linéaire ou logarithmique, une teinte par barre et la valeur affichée au
    bout. Distinct de `histogram`, dont les barres sont positionnées par `from`/`width` sur un axe
    numérique et qui ne sait ni mettre une barre en évidence ni étiqueter les valeurs — un seul kind
    couvre ainsi la comparaison à 2 catégories, les distributions indexées par k, et la comparaison
    log sur 3 ordres de grandeur.
  - `sequenceOutcomes` — plusieurs séquences d'issues DÉPLIÉES (une ligne = un chemin complet, avec
    la probabilité de chaque tirage et celle du chemin), plus l'accolade regroupant les lignes
    équiprobables. Ce qu'un `weightedTree` (2 niveaux) ne peut pas représenter pour 3 tirages.

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
- **6e (6h), Chapitre 1 — Fonctions réciproques & cyclométriques** (`fonctions-reciproques-cyclometriques`) :
  migré en intégralité. A nécessité plusieurs kinds/extensions supplémentaires par rapport au
  schéma d'alors : callout `definition`, `exempleLibre` (exemple en forme libre, blocs imbriqués),
  `featureTable` (tableau à en-tête, y compris pour `recap.table` — la synthèse de ce chapitre est
  purement tabulaire, sans liste à puces), `operationChain` (chaîne HTML de valeurs/opérations
  nommées), et sur `curvePlot` : échantillonnage par courbe, asymptotes horizontales, ligne de
  test horizontale, `xTickLabels` symboliques. Deux nouveaux kinds d'illustration : `setMapping`
  (diagrammes ensemblistes injectif/surjectif/bijectif) et `unitCircleArc` (cercle trigonométrique
  pour arcsin/arccos/arctan). Cartes génératrices enrichies (titre/description rédigés) bien que
  la source n'ait que des liens minimalistes, et la petite illustration décorative d'en-tête de
  l'artifact a été omise — deux décisions éditoriales confirmées avant rédaction, pas des
  raccourcis pris silencieusement.

- **6e (6h), Chapitre 7 — Analyse combinatoire** (`analyse-combinatoire`) : migré en intégralité
  depuis l'artifact d'origine (6 sections, 12 diagrammes, toutes les démonstrations, tous les
  tableaux). A nécessité **7 nouveaux kinds d'illustration** (aucun kind existant ne convenait) :
  `polygonDiagonals`, `circularPermutation`, `groupPartition`, `letterTiles`, `pascalTriangle`,
  `categoricalBarChart` (un seul kind pour 5 des 12 diagrammes : Chevalier de Méré, somme des
  lignes de Pascal, mains de poker en échelle log, distributions hypergéométrique et binomiale) et
  `sequenceOutcomes`. `histogram` a été écarté pour les deux distributions : ses barres sont
  positionnées sur un axe numérique et il ne sait ni mettre une barre en évidence ni afficher la
  valeur au bout — or la mise en évidence porte ici du sens (« la région au moins 4 »), elle n'est
  pas décorative. Extension additive de `categoricalBarChart` : `colorValueLabels`, pour ne colorer
  la valeur que là où la source le fait. Écarts assumés : la palette suit les jetons de thème du
  site (accent orange / good vert) au lieu du bleu+orange de l'artifact ; les justifications des
  démonstrations, colonne monospace alignée à droite dans la source, deviennent une clause en gras
  en fin de phrase (`exempleLibre` + `para`) ; les kickers de section et la petite figure
  décorative d'en-tête sont, comme pour les chapitres précédents, respectivement ajoutés et omis ;
  le chapitre est numéroté 7 (rang réel dans `chaptersIndex`) alors que l'artifact s'annonce
  « Chapitre 9 ». Vérifié par rendu navigateur réel (Playwright sur le build de production) :
  chaque diagramme capturé et comparé un à un à la figure correspondante de l'artifact, les 17
  autres chapitres re-rendus sans régression (aucun `$...$` non résolu, aucun `NaN`/`undefined`,
  aucune erreur KaTeX ni JS).
  **Piège confirmé en pratique** : seuls `text`/`items`/`formula`/`caption` passent par `RichText`.
  Les `label` de callout, `badge` et `tag` d'exemple, `kicker` de section et en-têtes de
  `featureTable` sont rendus en texte BRUT — y écrire `$...$` affiche les dollars littéralement (66
  occurrences dans le premier jet de ce chapitre, détectées seulement au rendu navigateur, pas par
  `tsc`). Y mettre des caractères Unicode (2ⁿ, x², ×, −), jamais du LaTeX.

## Vérification avant de pousser

- `npm run build` (= `tsc -b && vite build`) doit passer sans erreur.
