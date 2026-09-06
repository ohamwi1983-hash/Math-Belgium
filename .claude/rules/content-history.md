---
paths:
  - "src/content/chapters/**"
---

# État actuel du contenu

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
  **Complété une 3e fois** : les 4 widgets interactifs de l'artifact d'origine (jusque-là laissés de
  côté lors de la migration initiale) portés dans `src/interactive/` et embarqués dans le chapitre
  — voir « Widgets interactifs portés » (`.claude/rules/interactive-widgets.md`) pour le mécanisme.
  `parabole-widget` ("Manipule toi-même — fais varier a, b et c") inséré avant "Domaine et image" ;
  `transformations-widget` ("Manipule toi-même — fais varier TH, EV/CV et TV") inséré avant la
  vidéo "Transformations graphiques d'une parabole" dans "Étirement, compression et symétrie" ;
  `gen7-widget` et `gen8-widget` embarqués directement dans les cartes `entrainement` gen7/gen8
  existantes (`widgetTag`), en plus — jamais à la place — du lien vers la version hébergée sur
  plateforme-maths. Vérifié par rendu navigateur réel (`vite preview`, Playwright) : les 4 widgets
  présents dans le DOM et fonctionnels (captures à l'écran des 4 : sliders a/b/c et TH/EV/CV/TV
  réactifs, exercice gen7 "coefficients" jouable, exercice gen8 "transformations graphiques" jouable
  avec graphe Mafs cible et saisie), aucune erreur JS console, `tsc -b`/`npm run lint`/`npm run
  build` propres.
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

- **5e (4h), Chapitre 4 — Limites et asymptotes** (`limites-asymptotes`) : enrichi depuis une
  version plus ancienne du même artifact `plateforme-maths` (5e/4h) ; aucune section n'a dû être
  réordonnée (l'ordre était déjà conforme au manuel FWB source — théorie/théorie/3 volets
  d'application), l'écart portait sur des points numérotés de la synthèse absents à l'intérieur des
  sections 1 et 2. Ajouté en section 1 : un rappel « bornes du domaine » avec une illustration
  `domainLine` (domaine de $f(x)=(x-1)/(x^2-x-6)$, deux points exclus) ; un rappel « limite à
  gauche, limite à droite » — sans illustration, aucun kind existant ne représente des flèches
  d'approche convergentes, omission assumée plutôt qu'un kind ad hoc pour ce seul besoin ; un
  nouvel exemple résolu « vraie asymptote verticale — le numérateur ne s'annule PAS »
  ($f(x)=(2x-5)/(x+3)$, asymptote verticale ET horizontale simultanées, absent de l'ancienne
  version qui ne traitait que le cas point vide) ; et un nouvel exemple « quand la limite n'existe
  pas » illustré (`curves` à deux branches avec un point `style: 'filled'` et un point `style:
  'open'` au même x, pour visualiser le saut). Trois exemples déjà existants ont reçu une
  illustration `curvePlot` qu'ils n'avaient pas encore (forme 0/0 — point vide y=x−3, forme ∞−∞ —
  $\sqrt{x^2+1}-x$ approchant y=0, forme ∞/∞ déjà illustrée inchangée). Ajouté en section 2 : un
  callout `definition` « définir une asymptote (cas général) » (AV/AH/AO par limite, avant la
  méthode par comparaison de degrés qui n'est qu'un cas particulier rationnel) suivi d'un
  `illustrationGroup` de 3 `curvePlot` compacts (`showYAxis: false`, sans grille) — chacun une
  vraie fonction échantillonnée démontrant un seul type d'asymptote (AV : $1/(x-1)$ ; AH :
  $2-1/(x+2)$ ; AO : $x+1/(x+2)$), plutôt qu'un schéma dessiné à la main. Ajouté en section 3 : un
  second exemple de lecture graphique avec DEUX asymptotes verticales simultanées
  ($g(x)=1/((x+1)(x-2))$, x=−1 et x=2, plus une horizontale y=0), pour montrer qu'un graphique peut
  porter plusieurs asymptotes verticales à la fois. Ajouté en section 4 (qui n'avait auparavant
  aucune illustration) : le graphe de $C_u(x)=8+240/x$ approchant son plancher y=8. Aucun nouveau
  kind d'illustration nécessaire — `domainLine`, `curvePlot` (`points.style: 'open'`/`'filled'`,
  courbes multi-branches par `xMin`/`xMax`) et `illustrationGroup` existaient déjà et ont suffi.
  Deux bugs de chevauchement d'étiquette trouvés en inspectant les captures Playwright (pas visibles
  en relisant le code seul) : sur l'exemple de la vraie asymptote verticale, un point échantillon
  trop proche du bord gauche du cadre faisait chevaucher son étiquette avec celle de l'asymptote
  horizontale — corrigé en éloignant le point de l'abscisse concernée et en ajustant son
  `labelPos`. Vérifié par `npm run build`/`tsc -b`/`npm run lint` propres et rendu Playwright réel
  sur `vite preview` (clair et sombre) : les 15 illustrations du chapitre capturées et relues
  individuellement, aucun `$...$` non résolu, aucune régression sur les illustrations déjà en
  place.

- **4e, Chapitre 3 — Caractéristiques d'une fonction et fonctions de référence**
  (`caracteristiques-fonctions-reference`) : réordonné pour suivre l'ordre d'une page « Synthèse »
  de manuel (fonction/domaine/outils de lecture graphique → 6 fonctions de référence → comment
  moduler l'expression analytique en transformation graphique) — la section « Transformer une
  fonction de référence » (les 8 paramètres TH/TV/CH/EH/EV/CV/SOX/SOY, dernier point de la source)
  était en tête du chapitre, déplacée en dernière position (juste avant la révision) ; « Lire les
  caractéristiques sur un graphique » passe en premier. Aucun contenu ajouté/retiré, seul l'ordre
  des `sections` (et leur `number`) change — `intro` (fonctions de référence, déjà en tête) reste
  inchangé. **Erreur trouvée dans la demande elle-même** : `recap.items` était donné pour « déjà
  cohérent avec cet ordre », mais listait en réalité « Formule unifiée »/« Parité et redondance »
  (sujets de la section Transformer) AVANT « Lecture graphique »/« Étude algébrique » — un ordre qui
  suivait l'ANCIEN agencement des sections (transformer → lire → algébrique), pas le nouveau ;
  réordonné pour suivre le nouvel ordre des sections (lecture graphique → étude algébrique →
  formule unifiée → parité et redondance), `recap.checklist` (déjà sans ordre strict par section)
  laissé inchangé. Vérifié par rendu navigateur réel : table des matières et corps de page dans le
  nouvel ordre, `tsc -b`/`npm run build`/`npm run lint` propres.

- **4e, Chapitre 5 — Cercle trigonométrique & triangles quelconques**
  (`cercle-trigonometrique-triangles`) : réordonné pour suivre l'ordre d'une page « Synthèse » de
  manuel — la source traite l'identité fondamentale ($\cos^2\theta+\sin^2\theta=1$) comme faisant
  partie du même premier point que l'extension du cercle trigonométrique au-delà de 90°, avant les
  valeurs particulières ; la section « L'identité fondamentale » était en 3e position (après « Les
  valeurs remarquables »), déplacée en 2e (juste après « Le cercle trigonométrique »). **Piège
  vérifié en pratique** : plusieurs blocs de texte du chapitre référencent une autre section par son
  numéro littéral (« section 2 », « section 3 »...) plutôt que par son nom — un simple déplacement
  de section sans grep préalable sur `section [0-9]` aurait laissé ces renvois pointer vers le
  mauvais contenu. Les 3 occurrences trouvées (intro → section identité, section équations →
  section valeurs remarquables, section triangle → section identité) mises à jour en conséquence ;
  vérifié aussi qu'aucune des références restantes (« section précédente », « angles associés,
  section 4 », etc.) n'était affectée par CE déplacement précis (seul l'ordre relatif de identité et
  remarquables change, les 5 autres sections gardent leur position). **Même bug que le chapitre 3
  ci-dessus, trouvé dans ce patch aussi, sans y être mentionné cette fois** : `recap.items` listait
  « Valeurs remarquables » avant « Identité fondamentale » — l'ANCIEN ordre des sections, pas le
  nouveau ; les deux items intervertis. `recap.checklist` (déjà sans ordre strict par section)
  laissé inchangé. Aucun contenu ajouté ou retiré. Vérifié par rendu navigateur réel (table des
  matières et récapitulatif dans le nouvel ordre), re-rendu des 22 chapitres du site sans
  régression, `tsc -b`/`npm run build`/`npm run lint` propres.

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`) : **restructuré en profondeur** (pas un
  simple réordonnancement) pour suivre l'ordre exact d'une page « Synthèse » de manuel en 15 points —
  choix explicite de l'utilisateur après qu'un simple réordonnancement se soit révélé impossible : la
  source traite chaque opération vectorielle en deux passes complètes (géométrique d'abord, sans
  repère ; puis en repère, par composantes), alors que le chapitre ne traitait chaque sujet qu'une
  seule fois, directement en repère. 11 sections d'origine éclatées en 18 : l'ancienne section
  « Combinaisons linéaires de vecteurs » (qui mélangeait déjà informellement les deux approches en
  sous-titres) a fourni le matériau des nouvelles sections géométriques (`oppose`, `additionGeometrique`,
  `soustractionGeometrique`, `decompositionGeometrique`) et de deux des trois nouvelles sections
  repère (`additionReperes`, `multiplicationReperes` — capstone : l'exemple mixte `3u − AB` et
  l'entraînement gen22 s'y retrouvent, déplacés tels quels) ; l'ancienne section « Construire un
  vecteur : multiplier par un scalaire » (déjà purement géométrique) a été conservée et étendue
  avec la définition géométrique de la colinéarité/alignement (reprise de l'ancienne section
  colinéarité, dont le paragraphe d'ouverture ne mentionnait déjà aucun repère). Les sections
  `chasles`, `norme`, `relation` (translation/milieu), `colinearite` (déterminant), `orthogonalite`,
  `directeur`, `comparaison`, `applications` et `revision` sont des déplacements à l'identique (texte,
  illustrations, exemples et `entrainement` inchangés caractère pour caractère), seul leur `number`
  change. Deux nouvelles sections sans équivalent préalable : `definition` (section 1 — vocabulaire,
  notation AB/u, norme comme longueur géométrique, avant tout repère) et `composantes` (section 8 —
  formalise les composantes d'un vecteur en repère, contenu jusque-là seulement esquissé dans
  l'`intro` du chapitre, laissée inchangée par ailleurs). **Piège découvert pendant ce chantier,
  distinct de celui du chapitre 5** : les champs `kicker` (sous-titre de section) et `label` (titre
  d'un bloc `rappel`/`methode`/`piege`) ne sont **jamais** rendus par KaTeX — contrairement à `text`,
  `formula`, `badge`, etc. Écrire `$\vec{AB}$` dans un `kicker` ou un `label` affiche le code LaTeX
  brut à l'écran (en majuscules, via la CSS) au lieu d'un symbole — détecté par capture d'écran
  Playwright, jamais par `tsc`/`build`/`lint` qui ne valident que la syntaxe TypeScript. Toujours
  écrire ces deux champs en texte brut (ex. `'AB(x_B−x_A ; y_B−y_A)'`, jamais `'$\vec{AB}(...)$'`).
  Tous les renvois littéraux « (section N) » retrouvés par `grep -n "section [0-9]"` mis à jour vers
  les nouveaux numéros (ex. Chasles 8→6, applications 10→17, orthogonalité 6→14, colinéarité 4→13/3)
  — vérifié un par un contre la nouvelle numérotation, les 5 occurrences correctes.
  **Même bug que les chapitres 3 et 5 ci-dessus, en bien plus grave ici vu l'ampleur du
  remaniement (11→18 sections) — trouvé dans ce patch aussi, sans y être mentionné** : `recap.items`
  n'avait pas été touché par le patch et suivait donc encore l'ANCIEN ordre des 11 sections (ex.
  l'item « Points » — relié à la section `relation`, désormais 12e sur 18 — apparaissait en 2e
  position, avant l'item « Combiner » qui couvre pourtant les sections 2 à 10) ; réordonné pour
  suivre le nouvel enchaînement (Vecteur → Combiner → Chasles → Norme → Points → Colinéarité/
  orthogonalité → Vecteur directeur → Résultante), en conservant le principe déjà en vigueur avant
  ce patch qu'un item de synthèse peut regrouper plusieurs sections sous un même thème sans copier
  leur découpage exact. **Contrairement aux chapitres 3 et 5, `recap.checklist` a aussi dû être
  corrigé** : dans ce chapitre precis, avant le patch, ses 4 items suivaient déjà l'ordre des
  sections (contrairement aux deux autres chapitres, où ce n'était pas le cas) ; le patch l'a donc
  cassé de la même façon que `recap.items` — réordonné à son tour (Chasles → Norme → Milieu →
  Colinéarité/orthogonalité) pour rester cohérent avec le nouvel enchaînement.
  Vérifié par rendu navigateur réel : les 18 sections dans le bon ordre (table des matières et corps
  de page), récapitulatif et checklist dans l'ordre corrigé, `0` `.katex-error`, aucun `$...$` non
  résolu ; re-rendu des 22 chapitres du site sans régression. `tsc -b`/`npm run build`/`npm run lint`
  propres.

- **4e, Chapitre 7 — Géométrie analytique plane** (`geometrie-analytique-plane`, `chapterNumber: 7` —
  seule fois où le numéro annoncé par l'utilisateur correspondait déjà au `chapterNumber` réel) :
  réordonné pour suivre l'ordre d'une page « Synthèse » de manuel en 11 points. Contrairement au
  chapitre 6 (vecteurs), un simple réordonnancement a suffi — les 10 sections d'origine
  correspondaient déjà, une à une ou groupées, aux points de la source et étaient déjà dans le bon
  ordre relatif — sauf le point « Qu'est-ce qu'un lieu ? », que la source place juste avant
  cercle/parabole (préambule conceptuel dont cercle et parabole sont ensuite présentés comme des cas
  particuliers), alors que l'ancienne section `lieux` (qui *contenait* cette définition) était
  positionnée juste APRÈS parabole, comme synthèse applicative (« intersection de deux courbes »,
  dont l'exemple et l'entraînement `gen54` supposent déjà connues les équations du cercle et de la
  parabole). Seul point nécessitant un éclatement (à la différence des autres reorders, qui n'ont
  jamais touché le contenu d'une section) : la section `lieux` scindée en deux — une nouvelle
  section `notion-lieu` (n°7, avant `cercle`) reprenant tel quel le préambule générique (para,
  `definition`, illustration des 2 droites parallèles, `list` des 2 exemples classiques — rien qui
  dépende de cercle/parabole), et la section `lieux` restante (renommée en position 10, après
  `parabole`) gardant tout le reste (le `featureTable` droite/cercle/parabole, `methode`,
  illustrations, exemple, `entrainement` gen54). Sections 1 à 6 gardent exactement leur numéro —
  aucun renvoi littéral « (section N) » à corriger (vérifié : les 2 seuls renvois du fichier,
  « section 4 »/« section 5 » dans la section `distance`, pointent bien vers `relations`/
  `intersection`, tous deux inchangés).
  **Bug trouvé dans la nouvelle prose de transition ajoutée en tête de la section `lieux` restante,
  absent des trois patches de reorder précédents** : le paragraphe affirmait « Droite, cercle et
  parabole sont chacun des lieux géométriques particuliers — leurs équations viennent des deux
  sections précédentes », ce qui n'est vrai QUE pour cercle et parabole (les deux sections
  immédiatement précédentes, 8 et 9) — l'équation d'une droite a été établie bien plus tôt (section
  1 et suivantes), pas dans « les deux sections précédentes ». Corrigé en distinguant les deux cas :
  « l'équation d'une droite a été vue plus tôt dans ce chapitre, celles du cercle et de la parabole
  dans les deux sections précédentes ». **`recap.items`/`recap.checklist`, contrairement aux
  chapitres 3/5/6 ci-dessus, n'ont eu besoin d'AUCUNE correction** : l'insertion de `notion-lieu`
  (sans item de synthèse dédié, comme `lire-tracer`) tombe entre deux items déjà consécutifs
  (Distance → Cercle), donc l'ordre des 8 items de `recap.items` restait déjà parfaitement
  monotone avec la nouvelle numérotation (1,3,4,5,6,8,9,10) — vérifié un par un plutôt que supposé,
  vu que ce même contrôle avait révélé un bug dans les 3 chantiers précédents.
  Vérifié par rendu navigateur réel (11 titres de section dans le nouvel ordre, `0` `.katex-error`,
  aucun `$...$` non résolu), re-rendu des 22 chapitres du site sans régression. `tsc -b`/`npm run
  build`/`npm run lint` propres.
