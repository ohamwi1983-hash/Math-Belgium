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
  - `frequencyStabilization` — ligne brisée des fréquences relevées au fil des répétitions, avec la
    valeur limite en pointillés (probabilité expérimentale). Distinct de `sequencePlot`, qui
    étiquette CHAQUE point et affiche son rang sous l'axe — illisible pour plusieurs dizaines de
    relevés, alors que le grand nombre de répétitions EST le sujet ici.
  - `universePartition` — rectangle Ω découpé en bandes verticales (la partition) traversé par un
    événement dessiné en ellipse ombrée : la figure de la loi des probabilités totales. Distinct de
    `vennDiagram` (2 cercles, univers non découpé) et de `groupPartition` (jetons en boîtes, sans
    événement transversal).
  - `naturalFrequencies` — colonnes de MÊME hauteur, chacune redécoupée à sa propre échelle (chaque
    colonne est son propre 100 %), effectifs en regard : oppose visuellement deux conditionnements
    inverses (P(T⁺|malade) contre P(malade|T⁺)). Distinct de `categoricalBarChart`, dont chaque
    barre porte UNE valeur sur une échelle commune.
  - `complementBar` — une seule barre de longueur 1 partagée en deux parts complémentaires, avec un
    contre-exemple barré optionnel. Distinct de `categoricalBarChart`, qui dessinerait deux barres
    séparées : ici c'est le partage d'UNE MÊME barre qui porte le sens.

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
  **Complété à son tour** quand l'artifact source a grandi (même schéma que pour le chapitre
  « Probabilités » ci-dessous) : deux nouvelles sous-sections en tête d'`intro` — un rappel de la
  fonction du premier degré ($m$/$p$, zéro, exemple résolu) et la fonction de référence $f(x)=x^2$
  (courbe + `featureTable` de ses caractéristiques) — puis une nouvelle sous-section "Reconnaître
  une fonction à partir d'un tableau de valeurs" dans la section "Étudier une parabole", entre le
  rôle du coefficient a et le sommet (`exempleLibre` portant un `featureTable` x/f(x) + le
  raisonnement par accroissements successifs). Correctif de cohérence de notation, demandé
  explicitement : la source utilisait $p$/$q$ pour les coordonnées du sommet dans deux endroits
  (l'intro de la sous-section "Sommet et axe de symétrie" et le rappel "Forme canonique") alors que
  la dérivation complète juste en dessous ("D'où vient la formule $x_S=-b/(2a)$ ?") utilise déjà
  $x_S$/$y_S$ — uniformisé sur $x_S$/$y_S$ partout où il s'agit du sommet (sommet, domaine/image,
  forme canonique, et les 3 puces `recap` correspondantes), en laissant `Les translations` inchangée
  ($p$/$q$ y désignent des amplitudes de décalage, pas les coordonnées du sommet — sens différent,
  jamais interchangé). Vérifié par rendu navigateur réel (`vite preview`, Playwright) : les deux
  nouvelles sous-sections et les 4 occurrences corrigées capturées à l'écran, aucun `$...$` non
  résolu, `npm run build` et `npm run lint` propres.
- **4e, Chapitre 2 — Équations et inéquations du second degré** (`equations-inequations-second-degre`) :
  chapitre déjà en place (5 techniques de résolution, tableau de signes, signe d'un produit,
  fractions rationnelles, inconnue au dénominateur, inéquations rationnelles — souvent plus complet
  que la source d'un manuel de référence sur ces points). Comparé point par point à la page
  « Synthèse » d'un manuel (10 points), deux manques réels identifiés et comblés (choix validé
  explicitement : les deux manques seulement, pas un alignement forcé sur les 8 autres points déjà
  couverts, parfois différemment) : les relations de Viète ($x_1+x_2=-b/a$, $x_1 \cdot x_2=c/a$)
  avec leur démonstration à partir de la formule du discriminant, et l'écriture d'une équation à
  partir de ses solutions ($a(x-x_1)(x-x_2)=0$, puis $x^2-Sx+P=0$) — insérées en fin de la section
  « Résoudre une équation du second degré », après le cas de mise en évidence généralisée. La puce
  `recap` correspondante a été étendue en conséquence. Vérifié par rendu navigateur réel (`vite
  preview`, Playwright) : les deux nouvelles sous-sections capturées à l'écran, aucun `$...$` non
  résolu, `npm run build` et `npm run lint` propres.
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
- **4e, Chapitre 7 — Géométrie analytique plane** (`geometrie-analytique-plane`) : migré en
  intégralité (10 sections, ~19 illustrations) depuis l'artifact d'origine, suite directe du
  chapitre 6 (Calcul vectoriel) — le vecteur directeur d'une droite y revient au centre. Aucun
  nouveau kind d'illustration : `vectorPlane` (déjà bâti pour le calcul vectoriel) a été étendu
  plutôt que dupliqué, dans le même esprit que la généralisation de `curvePlot`/`circleDiagram` —
  tous les nouveaux champs sont optionnels avec un comportement par défaut identique à l'existant
  (vérifié par rendu SSR des 18 chapitres du dépôt, y compris tous les usages `vectorPlane` du
  chapitre calcul vectoriel, aucune régression) :
  - `showAxes?` (def. `true`) — masque les axes pour un schéma abstrait (droite + vecteur
    directeur sans repère, mini-diagrammes "cas" côte à côte).
  - `grid?` (def. `false`) — quadrillage entier, pour les diagrammes où l'élève doit lire des
    coordonnées entières directement sur les cases (équivalent du `svg-grid` de l'artifact).
  - `circle?` — cercle simple (centre/rayon/teinte), même conception que `complexPlane.circle`.
  - `curves?`/`curvesOfY?` — courbe échantillonnée $y=fn(x)$ ou $x=fn(y)$ (même mécanique que
    `curvePlot.curves`) ; `curvesOfY` est nécessaire pour la parabole d'axe horizontal, qui n'est
    pas le graphe d'une fonction de x.
  - vecteur `arrow?` (def. `true`) — segment plein sans pointe de flèche, pour une droite entière
    tracée jusqu'aux bords du cadre (plus un vecteur borné).
  - `angleArcs.tone` élargi à `'attn' | 'tip'` (déjà supportés par le rendu, seul le type les
    excluait) — nécessaire pour l'arc orange de l'angle avec Ox (section pente/angle).

  Deux corrections trouvées en inspectant les captures Playwright (pas visibles en relisant le
  code seul) : dans la figure de construction de la parabole au compas, les labels verbeux "point
  de la parabole"/"idem" débordaient du cadre 320×300 — raccourcis en `P₁`/`P₂`, la légende sous la
  figure porte la description complète ; le label "directrice d" chevauchait la ligne pointillée de
  la directrice dans la figure de définition — repositionné (`labelPos: 'below'`, cadre élargi).
  Notation vectorielle traduite en KaTeX natif (`\vec{u}`, `\begin{pmatrix}…\end{pmatrix}`,
  `\begin{cases}…\end{cases}` pour le système paramétrique) plutôt que les classes CSS maison de
  l'artifact (`.vecnot`/`.vecmat`/`.eqsys`) — Math-Belgium n'a pas de notation maison, tout passe
  par KaTeX. Une figure (distance point-droite, section 6) a été rendue à l'échelle réelle avec les
  coordonnées exactes de l'exemple qui la suit (C(−7;7), H(1;1)) plutôt que des coordonnées
  schématiques comme dans l'artifact — la figure est directement vérifiable, pas une approximation.

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

- **6e (6h), Chapitre 6 — Les probabilités** (`probabilites`) : migré une première fois, puis
  **complété/enrichi à son tour** quand l'artifact source a grandi (nouvelles sections, nouveaux
  exemples résolus, et des diagrammes de plus, portant l'artifact à 11 diagrammes). La mise à jour a
  demandé **4 nouveaux kinds d'illustration** — `frequencyStabilization`, `universePartition`,
  `naturalFrequencies`, `complementBar` : aucun kind existant ne convenait, et
  `sequencePlot`/`categoricalBarChart`/`groupPartition`/`weightedTree` ont chacun été écartés pour
  une raison structurelle documentée dans `types.ts` (étiquette par point, valeur unique par barre,
  absence d'événement transversal, branches pondérées sans objet). Le diagramme de la loi binomiale
  est passé de `histogram` à `categoricalBarChart` : `histogram` positionne ses barres sur un axe
  numérique et n'affiche ni la valeur au bout de chaque barre ni l'étiquette de k, deux éléments
  bien présents dans la source — même arbitrage que pour le chapitre 7. Le diagramme de
  stabilisation des fréquences, jusque-là un `sequencePlot` à 8 points inventés, a été refait sur
  les 26 relevés réels de la source. Ajouts de contenu par rapport à la version migrée : le placeholder `video` en tête de
  section 1 (convention du site, absent), la mise en évidence des 5 cases DÉDUITES dans les deux
  tableaux à double entrée, le libellé de l'astuce « Les deux méthodes doivent converger », la
  mention « (plusieurs chemins) » réintroduite dans la ligne « Arbre pondéré » de la synthèse, et le
  tableau de synthèse entier passé en KaTeX. Écarts assumés : palette du site (accent orange / good
  vert) au lieu du bleu+orange de l'artifact ; la ligne de contre-exemple de `complementBar` est en
  teinte `bad` (rouge) plutôt qu'orange, la sémantique « impossible » l'emportant ; les probabilités
  de chemin de l'arbre de l'urne restent en 20/56 et 6/56 (formes non réduites, cohérentes avec
  l'astuce « la somme des chemins vaut 1 » juste en dessous) là où la source affiche 5/14 et 3/28 —
  la source est elle-même incohérente sur ce point ; graduations ajoutées sous l'axe du diagramme de
  fréquences (la source n'en a aucune) ; la figure décorative d'en-tête de l'artifact est omise,
  comme pour tous les chapitres précédents. Vérifié par rendu navigateur réel sur le build de
  production : les figures capturées une à une et comparées à la figure correspondante de
  l'artifact, les 18 autres chapitres re-rendus sans régression (aucun `$...$` non résolu, aucun
  `NaN`/`undefined`, aucune erreur KaTeX ni JS).
  **Correction de référence en avant (section 4)** : la section 4 « Probabilités : problèmes »
  enseignait les épreuves répétées avec `C(n,k)`/`A(n,k)`, notation qui n'est formellement
  introduite QUE dans le chapitre suivant (« Analyse combinatoire ») — un élève lisant les
  chapitres dans l'ordre ne l'a pas encore vue. La source a été réécrite, et la migration suit :
  tout est désormais justifié par le COMPTAGE DES CHEMINS de l'arbre (la technique déjà employée
  en section 2), jamais par un coefficient binomial. Concrètement : un exemple résolu entièrement
  nouveau (arbre complet à 3 tirs, $p$=0,3) où les 8 chemins sont listés et regroupés par nombre
  de succès dans un `featureTable` à 5 colonnes (nombre de succès / chemins / nombre de chemins /
  probabilité de CHAQUE chemin / P(X=k) — 0,027 + 0,189 + 0,441 + 0,343 = 1) porté par un
  `exempleLibre` (`para` + `featureTable` + `para`, pour que le tableau reste DANS le cadre de
  l'exemple comme dans la source) ; l'exemple du tireur ($n$=5) qui ÉNUMÈRE les 10 positions
  possibles des 2 succès au lieu d'invoquer $C_5^2$ ; l'exemple de l'action boursière ($n$=3,
  $p$=0,6) où les `3 \times` viennent du nombre de chemins, plus $C_3^k$. La sous-section
  « Dénombrement ordonné vs non ordonné » (exemple des 5 livres, $C_5^3$/$A_5^3$) a été SUPPRIMÉE
  — elle n'a pas sa place ici, ce contenu appartient au chapitre « Analyse combinatoire », qui le
  traite déjà. Conséquences en cascade, toutes voulues : le diagramme `orderedExpansion` disparaît
  avec elle (le chapitre passe de 12 à **11 diagrammes** — ce n'est PAS un bug), et le kind
  `orderedExpansion` lui-même, devenu orphelin (vérifié par grep : plus aucune référence dans le
  dépôt), est retiré proprement de `types.ts`, de `Illustration.tsx` et de son fichier de
  composant ; la ligne « Dénombrement » du tableau de synthèse est retirée, la ligne « Épreuves
  répétées » devient « compter les chemins à $k$ succès dans l'arbre, $\times p^k(1-p)^{n-k}$ », et
  le kicker de section suit. Même correction, plus petite, en section 2 : dans l'exemple
  « 4 lettres, 4 enveloppes », le `$C_4^2$=6 façons` est remplacé par l'énumération explicite des
  6 paires ({1;2}, {1;3}, {1;4}, {2;3}, {2;4}, {3;4}).
  **Bug corrigé dans le composant PARTAGÉ `ExempleResolu`** (signalé par l'utilisateur sur ce
  chapitre, mais site-wide) : un bloc `exemple` sans résultat final à encadrer dessinait quand
  même le cadre, produisant un rectangle VIDE à bordure rouge en bas de l'exemple. Le cadre n'est
  désormais rendu que s'il a réellement du contenu (`result.tag` ou `result.text` non vide).
  **Attention à ne pas confondre** : `result.isEmpty` ne veut PAS dire « pas de résultat » — c'est
  la teinte d'alerte d'un résultat qui vaut l'ENSEMBLE VIDE (`dom(f∘g) = ∅`, chapitre 5e
  « Fonctions composées »), qui a bien un contenu et doit continuer à s'afficher. Supprimer le
  cadre sur ce drapeau aurait donc effacé un vrai résultat ; c'est l'ABSENCE DE CONTENU, et non le
  drapeau, qui supprime le cadre. Les 3 blocs de ce chapitre qui détournaient `isEmpty: true` avec
  `tag`/`text` vides ont été remis à `{ tag: '', text: '' }`. Contrôle sur les 19 chapitres :
  156 blocs `exemple`, 153 cadres rendus, **0 cadre vide**, les 3 seuls exemples désormais sans
  cadre étant exactement les 3 blocs concernés de ce chapitre — et le cadre `is-empty` de
  « Fonctions composées » toujours rendu avec son contenu.

- **6e (6h), Chapitre 9 — Lieux géométriques** (`lieux-geometriques`) : migré en intégralité depuis
  un artifact `plateforme-maths` (6e/6h, chapitre 9 dans ce dépôt-là — conservé tel quel ici,
  contrairement au chapitre « Analyse combinatoire » qui avait suivi son rang réel dans
  `chaptersIndex.ts`, sur demande explicite pour ce chapitre-ci), 4 sections (droites/points
  remarquables du triangle, cercles, lieux sans paramètre, méthode des génératrices) + synthèse
  tabulaire (18 lignes) + quiz vrai/faux (`6gen72`), 20 diagrammes, tous en `vectorPlane` (aucun
  autre kind nécessaire — ce chapitre est presque un prolongement direct de « Géométrie analytique
  plane »). Deux extensions additives de `vectorPlane`, dans le même esprit que celles déjà faites
  pour ce chapitre 4e (optionnelles, sans effet sur le rendu existant) :
  - `circles?: {cx,cy,r,tone}[]` — plusieurs cercles simultanés sur un même plan (le singulier
    `circle?` existant est inchangé, toujours utilisé partout ailleurs) ; nécessaire pour le
    diagramme « cercle passant par 2 points, rayon donné », qui affiche réellement 2 cercles
    solutions à la fois, pas un cercle répété. Rendu par un simple `.map` juste après `circle`,
    même formule de rayon moyenné que l'existant.
  - Aucun nouveau kind pour la « bande pleine » (2 droites parallèles + région pleine entre elles) :
    `vectorPlane` n'a pas de primitive de remplissage, alors composée avec seulement les 2 droites
    frontières (`vectors`, `arrow:false`) + une étiquette texte (`points`, `node:false`) — la
    légende de la figure explicite que la bande entière, bords compris, vérifie l'équation.
    Simplification assumée, disclosée ici plutôt que masquée.
  - L'astroïde ($x=\cos^3\lambda$, $y=\sin^3\lambda$) est une courbe fermée, pas le graphe d'une
    fonction : rendue par 2 entrées `curves` sur le même `vectorPlane` (moitié haute
    `(1-|x|^{2/3})^{1.5}`, moitié basse son opposée), toutes deux `xMin:-1, xMax:1` — les 4 pointes
    (dérivée verticale) restent nettes avec l'échantillonnage existant (60 points), aucune
    dégradation constatée au rendu.

  **Bug sitewide découvert et corrigé en cours de route** (pas seulement dans ce chapitre) :
  `VectorPlane`'s `LINE_TONE_CLASS` faisait pointer la teinte `'ink'` vers la classe CSS
  `.svg-ink`, qui ne définit QUE `fill` (jamais `stroke`) — réservée à l'origine aux `<text>` et aux
  points pleins. Un `vector`/`curve` en teinte `'ink'` (ligne/courbe = un trait, jamais un
  remplissage) se retrouvait donc sans AUCUN trait, silencieusement invisible : confirmé, en
  reproduisant le bug d'abord sur ce nouveau chapitre (triangle entier, losange, astroïde
  entièrement absents à l'écran malgré un DOM correct), puis retrouvé déjà latent dans 2 chapitres
  DÉJÀ EN PRODUCTION — `calcul-vectoriel.ts` (le vecteur $\vec{AB}$ de la figure « k·AB », teinte
  `'ink'`, sans `arrow:false`) et `geometrie-analytique-plane.ts` (les 2 droites parallèles a/b de
  la figure d'introduction aux lieux géométriques, teinte `'ink'`, `arrow:false`) — jamais
  remarqué faute de contrôle visuel systématique sur ces figures précises. Correction ciblée et non
  régressive : nouvelle classe `.svg-ink-stroke { stroke: var(--ink); fill: var(--ink); }` dans
  `index.css` (jamais réutilisée ailleurs, donc aucun risque pour les ~100 usages de `.svg-ink` sur
  du texte) et `LINE_TONE_CLASS.ink` de `VectorPlane.tsx` repointé dessus. Vérifié par capture
  Playwright avant/après sur les 3 figures concernées (ce chapitre + les 2 déjà en production) :
  triangle/losange/astroïde/parallèles désormais bien visibles, aucune autre figure du site (tons
  `accent`/`good`/`bad`/`attn`/`tip`/`faint`, déjà correctement stroke+fill ou stroke seul) non
  affectée par ce changement puisque `.svg-ink` lui-même reste strictement inchangé.

  Vérifié par `tsc -b` + `npm run build` propres, `npm run lint` sans nouvel avertissement, et rendu
  Playwright réel sur le build de production : aucun `$...$` non résolu (piège rencontré : `kicker`
  de section et `description` de bloc `entrainement` ne passent PAS par `RichText`, contrairement à
  `caption`/`items`/`text` — corrigé en écrivant ces deux champs en Unicode simple, jamais en
  LaTeX ; piège rencontré une seconde fois : un `$...$` imbriqué À L'INTÉRIEUR d'un `**gras**` dans
  un item de `methode` n'est jamais reparsé — séparé en segments gras/math adjacents), les 20
  diagrammes du chapitre capturés un à un (astroïde à 4 pointes nettes, 2 cercles solutions bien
  distincts, tous les triangles/losanges/parallélogrammes correctement tracés), les 5 liens
  générateur (`6gen54`, `6gen55`, `6gen56`, `6gen57`, `6gen72`) pointant vers
  `https://plateforme-maths.vercel.app/6e-6h/6genNN`, et re-rendu sans régression de
  `geometrie-analytique-plane` et `calcul-vectoriel` (seul changement observé : les 3 figures
  ci-dessus, auparavant silencieusement cassées, s'affichent enfin correctement).

- **5e (4h), Chapitre 5 — Dérivées et applications** (`derivees-applications`) : réenrichi et
  réordonné depuis une version plus ancienne du même artifact `plateforme-maths` (5e/4h). L'ordre
  des sections a changé pour suivre le manuel FWB source : « Calculer f'(a) par la définition »
  passe en section 1, « Tangentes » en section 2, « Fonction dérivée » en section 3, « Association
  graphique/mots ↔ signe de f'/f'' » en section 4 (contre section 1 dans la version précédente) —
  toutes les références internes « section N » (11 au total) et les kickers ont été réécrits pour
  suivre. Contenu ajouté dans « Fonction dérivée » : un rappel domaine de dérivabilité + définition
  formelle de la fonction dérivée avec un exemple résolu ($f(x)=2x^2-3x \Rightarrow f'(x)=4x-3$ par
  la définition), et un `featureTable` comparant taux de variation (moyen) et nombre dérivé
  (instantané) sur trois colonnes (Définition/Interprétation graphique/Interprétation physique) —
  suit le même motif « `rappel` à un seul item + `featureTable` immédiatement après » déjà utilisé
  pour le tableau des dérivées de référence de cette section. Un nouveau diagramme `chain` (déjà
  existant, réutilisé tel quel) illustre la décomposition $f(x)=(2x-1)^3$ dans l'exemple de la règle
  de la chaîne. Trois nouvelles illustrations `curvePlot` : la tangente horizontale en x=1 est
  désormais dessinée sur le même graphe que la tangente oblique en x=3 (section « Tangentes »,
  au lieu d'une seule tangente comme avant) ; un second exemple résolu en « Lecture graphique » (un
  point à tangente horizontale qui n'est PAS un extremum, $f(x)=x^3$, lu uniquement sur le
  graphique) ; les courbes recette/coût R(x)=50x−x² et C(x)=x²+10x+20 en « Contexte économique »
  (l'écart vertical au point x=10 visualise le bénéfice maximal) ; et le graphe de
  $f(t)=t^3-6t^2+9t+2$ sur [0;5] en « Extrema en contexte borné » (les 4 valeurs comparées —
  bornes et extremums locaux — marquées sur la courbe). Deux nouvelles illustrations de la source
  ont été délibérément omises, disclosed ici plutôt que silencieuses : une ligne de signes dessinée
  en SVG dans « Étude locale » (strictement redondante avec le `signTable` juste au-dessus, même
  contenu) et un schéma de rectangle annoté dans « Optimisation géométrique » (redondant avec
  l'énoncé de la contrainte, qui donne déjà x/y/périmètre en toutes lettres). **Piège rencontré en
  vérifiant au rendu** : une étiquette de point (`f(5)=22 (MAXIMUM ABSOLU)`) positionnée `labelPos:
  'above'` au point le plus à droite d'un `curvePlot` débordait du cadre SVG (le texte est centré
  sur le point en mode `above`) — corrigé en `labelPos: 'left'` (texte ancré à droite du point,
  grandit vers l'intérieur du cadre) ; à surveiller pour tout futur point proche du bord droit d'un
  graphe. Vérifié par `npm run build` propre, `npm run lint` sans nouvel avertissement, et rendu
  Playwright réel sur le build de production : les 11 sections dans le nouvel ordre, le récapitulatif
  final réordonné à l'identique, aucun `$...$` non résolu, chaque nouvelle illustration capturée et
  relue individuellement (dont la correction du débordement ci-dessus).

## Vérification avant de pousser

- `npm run build` (= `tsc -b && vite build`) doit passer sans erreur.
