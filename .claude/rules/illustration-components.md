---
paths:
  - "src/components/illustrations/**"
---

# Composants d'illustration (`Illustration.tsx` + `IllustrationSpec`)

`Illustration` (`components/illustrations/Illustration.tsx`) enveloppe commune
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
- `circleAngles` — place 1 à N points sur le cercle trigonométrique par leur angle, avec
  accessoires optionnels (corde/sécante étendue via `connectPoints`, projections sur les axes,
  quadrants, arcs d'angle, étiquettes libres, construction de la tangente). `points[].tone` :
  `'accent' | 'good' | 'bad' | 'plan' | 'sky' | 'ink' | 'rose'` — 7 couleurs distinctes, réutilisables pour
  coder n'importe quel regroupement visuel (ex. par angle de référence sur un diagramme à
  plusieurs points), pas seulement une paire ou un triplet sémantique good/bad ; `'ink'` pointe
  vers `.svg-ink-stroke` (jamais `.svg-ink`, fill-only). `points[].sublabel` ajoute une 2e ligne
  d'étiquette (`<tspan>`, ex. l'équivalent en radians d'un angle en degrés). `pointLabelStyle:
  'mono'` (défaut `'italic'`, jamais retouché) bascule vers IBM Plex Mono sans italique ET projette
  chaque étiquette RADIALEMENT (le long de l'angle du point, à un rayon élargi) plutôt que par
  décalage x/y de quadrant — nécessaire dès qu'un diagramme a beaucoup de points proches en angle
  (< 20° d'écart) avec des étiquettes à 2 lignes, sous peine de chevauchement entre points voisins.
- `vectorPlane.circle`/`circles` — **ne peut jamais rendre une ellipse**, même sur un domaine
  anisotrope (`xMax-xMin ≠ yMax-yMin`) : `VectorPlane.tsx` calcule le rayon pixel en **moyennant**
  le rayon mis à l'échelle en x et celui mis à l'échelle en y, et dessine toujours un `<circle>` SVG
  vrai (rayon pixel unique). Pour illustrer visuellement un domaine affine/non orthonormé (où un
  cercle devrait paraître écrasé), utiliser `grid: true` à la place — les lignes de grille SONT
  mises à l'échelle x/y indépendamment et rendent fidèlement des cellules rectangulaires sur un
  domaine anisotrope (vérifié par capture d'écran, `lieux-geometriques`).
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
