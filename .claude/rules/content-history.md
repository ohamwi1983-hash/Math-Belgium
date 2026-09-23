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

- **4e, Chapitre 8 — Géométrie dans l'espace** (`geometrie-dans-espace`, `chapterNumber: 8` —
  correspond au numéro annoncé) : d'abord vérifié contre une page « Synthèse » de manuel en 12
  points — contrairement aux chapitres précédents, **aucun réordonnancement n'était nécessaire** :
  les 9 premières sections suivaient déjà, une à une ou groupées, exactement l'ordre de la source.
  Seul écart réel : les points 11 et 12 de la source (perspective centrale — dispositif de Dürer,
  puis point de fuite) n'étaient couverts nulle part, à l'exception d'un court paragraphe de
  contraste dans la section 1 (« pourquoi la cavalière plutôt que la centrale »). Un manque de
  contenu n'est pas un problème d'ordre — signalé tel quel sans y toucher, avant qu'une demande
  explicite de l'utilisateur (« ajoute les ») ne déclenche l'ajout. Deux nouvelles sections créées,
  insérées entre `section` (9) et `ombre` (qui devient 12, avec `revision` en 13) : `fenetre-durer`
  (10 — dispositif, vision monoculaire, illustration originale d'un cône de vision avec un objet
  proche/petit et un objet éloigné/grand traversant la vitre au même endroit) et `point-de-fuite`
  (11 — principe, ligne d'horizon, méthode de construction du toit d'une maison). La section 1
  (`cavaliere`) reste inchangée dans le fond, avec juste un renvoi ajouté (« sections 10 et 11 ») ;
  son illustration rails/point de fuite déjà existante a été **déplacée** (pas dupliquée) vers la
  nouvelle section 11, qui en est le traitement approfondi. Recap étendu d'une puce pour couvrir
  les 2 nouvelles sections — insertion tombant juste avant l'item « Ombre au soleil », déjà en
  dernière position : l'ordre des 9 items restait donc déjà monotone avec la nouvelle numérotation,
  vérifié plutôt que supposé (`recap.checklist`, sans référence numérique littérale et déjà sans
  ordre strict par section avant ce patch, laissé inchangé).
  **Piège découvert en écrivant ce contenu, distinct de celui du chapitre 6** : l'emphase markdown
  à un seul astérisque (`*mot*`) n'est **jamais** interprétée par le renderer (`RichText`,
  `src/components/Math.tsx` — `TOKEN_RE` ne reconnaît que `$latex$` et `**gras**`) ; elle s'affiche
  verbatim avec ses astérisques — règle ajoutée à `.claude/rules/content-authoring.md`. Confirmé
  par grep qu'il s'agit d'un bug latent PRÉEXISTANT sur plusieurs chapitres déjà en production
  (`*transformant*` dans `caracteristiques-fonctions-reference.ts`, `*exactement*` ×2 dans
  `statistique-descriptive.ts`) — signalé à l'utilisateur, laissé en l'état car hors du champ de ce
  patch (aucun de ces 2 fichiers n'y est touché).
  Vérifié par rendu navigateur réel (13 titres de section dans l'ordre attendu, `0` `.katex-error`,
  aucun `$...$` ni astérisque isolé non résolu, illustration du cône de vision capturée à l'écran) ;
  re-rendu des 22 chapitres du site sans régression. `tsc -b`/`npm run build`/`npm run lint` propres.

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : section « Arcs et secteurs » enrichie
  d'un grand diagramme du cercle trigonométrique à 16 angles (les 4 quadrants, en radians ET en
  degrés), ajouté juste après l'astuce « les angles remarquables par cœur ». Demande reçue au
  départ comme une patch au format HTML/SVG brut d'un artifact `plateforme-maths` distinct (fichier
  `trigonometrie.html`, inexistant dans ce dépôt) — **d'abord mal placée par erreur** dans
  `4e/cercle-trigonometrique-triangles.ts` (chapitre voisin, même sujet en apparence), avant que
  l'utilisateur ne corrige explicitement : la patch concernait en réalité le chapitre 2 de la filière
  5e (4h), pas le chapitre 4e — le diagramme ajouté par erreur là-bas a été entièrement retiré. Le
  reste de l'investigation initiale reste valable : 4 des 5 diagrammes touchés par la patch d'origine
  corrigeaient des erreurs d'arrondi de coordonnées propres à du SVG écrit à la main — les diagrammes
  réels de `trigonometrie.ts` (`circleDiagram`) calculent ces coordonnées programmatiquement, cette
  classe de bug n'existe donc pas ici ; seul le 5e diagramme (le grand cercle) valait la peine d'être
  porté, comme nouvelle illustration.
  **Rendu fidèle à une capture d'écran fournie par l'utilisateur** (le rendu attendu, pas la patch
  HTML source) : chaque point porte une étiquette à deux lignes (degrés, puis radians en `<tspan>`),
  les axes sont nommés « sin »/« cos » (`freeLabels`), et chaque point projette un pointillé vers
  chaque axe (`projectToXAxis`/`projectToYAxis`) — la projection verticale donne cos, l'horizontale
  donne sin.
  **Extensions de type nécessaires sur `circleAngles`** : `points[].sublabel` (2e ligne d'étiquette,
  jamais concaténée dans `label`), `pointLabelStyle?: 'italic' | 'mono'` (bascule d'apparence pour un
  diagramme dense, n'affecte JAMAIS le rendu par défaut `'italic'` des diagrammes déjà en place —
  vérifié par capture d'écran que `4e/cercle-trigonometrique-triangles.ts` reste pixel identique),
  et `points[].tone` élargi de 3 à 6 couleurs (`'plan'`, `'sky'`, `'ink'` en plus de
  `accent`/`good`/`bad`) pour distinguer 7 groupes (angle sur un axe pour 0°/90°/180°/270°, chacun sa
  propre couleur ; référence 30°/45°/60° pour le reste) sans jamais utiliser un hex brut hors palette
  de thème (contrairement à la patch d'origine, non adaptative au thème sombre) — `--sky` est un tout
  nouveau token (aucune teinte bleue n'existait déjà) ajouté en light/dark sur le modèle de `--plan`;
  `'ink'` réutilise `.svg-ink-stroke` (jamais `.svg-ink`, fill-only — voir le bug historique du même
  nom dans ce fichier) pour un point neutre avec un vrai contour. `CircleAngles.tsx` mis à jour en
  conséquence (`TONE_CLASS`, rendu du `sublabel`, positionnement radial des étiquettes en mode
  `'mono'` — jamais utilisé par le mode `'italic'` par défaut).
  **Piège rencontré en construisant ce diagramme, résolu par itérations visuelles** : à 15°
  d'écart angulaire entre deux points adjacents, le positionnement d'étiquette existant (décalage
  fixe par quadrant, pensé pour 1-2 points) faisait chevaucher les étiquettes à deux lignes de
  points voisins — corrigé en projetant chaque étiquette RADIALEMENT (le long de l'angle du point,
  à un rayon élargi) plutôt que par un simple décalage x/y de quadrant, ce qui écarte
  proportionnellement deux points d'angles proches ; plusieurs allers-retours captures d'écran
  réelles (taille de police, rayon d'étiquette, position des `freeLabels` sin/cos) ont été
  nécessaires avant d'obtenir un rendu sans chevauchement, y compris pour "90°" qui chevauchait
  initialement "sin", et "0°" qui chevauchait initialement "cos".
  Vérifié par rendu navigateur réel (clair et sombre) : les 16 étiquettes à deux lignes lisibles sans
  chevauchement, aucun chevauchement avec "sin"/"cos", `0` `.katex-error`, aucun `$...$` non résolu ;
  diagramme original à 5 points de `4e/cercle-trigonometrique-triangles.ts` confirmé pixel identique
  à avant ; re-rendu des 22 chapitres du site sans régression. `npm run build`/`npm run lint` propres.

- **6e (6h), Chapitre 10 — Les coniques** (`coniques`, nouveau fichier) : chapitre entièrement
  nouveau (pas un patch), migré depuis un artifact HTML autonome fourni par l'utilisateur (fichier
  `lesconiquessource.html`, ~1730 lignes, mise en page/CSS/diagrammes JS from scratch — même type de
  source que les chapitres 1-9 à l'origine du site). 6 sections (identifier/caractériser, excentricité
  + foyers/directrices + réduction d'équation + théorème de Dandelin-Quételet, aire/rayons focaux,
  intersection droite-conique, tangentes, propriétés optiques) + une synthèse purement tabulaire
  (`recap.table`, 26 lignes Notion/Point clé, sur le modèle de `lieux-geometriques`) ; 6 liens
  générateur par section (`6gen58`-`6gen63`) + un quiz de synthèse (`6gen73`).
  **Aucune extension de schéma nécessaire** : les ~17 diagrammes du chapitre (parabole avec
  foyer/directrice, 4 orientations, ellipse et hyperbole avec foyers/sommets/asymptotes, comparaison
  cercle/ellipse, hyperbole équilatère et sa forme `xy=k`, 3 coniques de même foyer superposées, coupe
  d'un cône avec 2 sphères de Dandelin, translation d'axes, triangle focal avec aire, angle droit au
  sommet non focal, intersection droite-conique, tangente, 3 miroirs optiques avec rayons réfléchis)
  tiennent tous dans le `vectorPlane` générique existant — une ellipse/hyperbole se trace en deux
  `curves`/`curvesOfY` (moitiés `y=±b√(1-x²/a²)` etc., même procédé que l'astroïde de
  `lieux-geometriques`), directrices/asymptotes/tangentes/rayons sont de simples `vectors` (segments
  calculés aux bords du cadre, `dashed`/`arrow:false` selon le cas), la coupe de cône n'est qu'un
  schéma statique de segments + `circles`. Conforme à la convention déjà établie : étendre
  `vectorPlane`/`curvePlot`/`circleAngles` plutôt que créer un nouveau `kind` tant que les champs
  génériques existants suffisent — ici, ils suffisaient intégralement. Garde `r(x) = Math.sqrt(Math.max(0,x))`
  ajoutée en tête de fichier : l'échantillonnage à 60 points de `VectorPlane` peut tomber juste sous 0
  par erreur d'arrondi flottant en bord de domaine d'une expression sous racine (ellipse/hyperbole/
  parabole/caractérisation focale), ce qui casserait le path SVG en `NaN` sans ce garde-fou.
  **Trois pièges de rendu texte trouvés et corrigés au premier passage navigateur réel** (39 signes
  `$` isolés détectés par `regress_all.mjs`, tous corrigés) : (1) usage systématique erroné de
  `$$latex$$` (display math) pour toutes les équations "mises en avant" — syntaxe inexistante sur ce
  site (voir piège ajouté à `.claude/rules/content-authoring.md`), corrigé par un remplacement global
  `$$`→`$` puisque la seule paire `$...$` restante suffit et rend déjà l'équation sur sa propre ligne
  dans un `para`/`exemple` isolé ; (2) deux `tag` de `steps` d'un bloc `exemple` contenant du
  `$latex$` (`tag` est rendu en texte BRUT, jamais passé par `RichText`) — corrigés en unicode simple
  (`b²=a²−c²`, sans délimiteurs) ; (3) un `$R_2$` imbriqué à l'intérieur d'un span `**gras**`
  (piège déjà documenté : le tokenizer capture tout le `**...**` comme gras littéral et ne réanalyse
  jamais son contenu) — corrigé en sortant le `$R_2$` du span gras. Une quatrième chaîne (le contrôle
  par la formule de Héron) avait une accolade `$` d'ouverture jamais refermée (faute de frappe lors de
  la rédaction, pas un piège du renderer) — corrigée en fermant le mode math avant le "— résultat
  identique." final.
  **Bug géométrique trouvé et corrigé par inspection visuelle réelle, pas par simple absence
  d'erreur console** : le diagramme du théorème de Dandelin-Quételet (coupe du cône, 2 sphères
  inscrites) avait un domaine `xMin/xMax/yMin/yMax` dont le rapport ne respectait pas le ratio
  320/300 du viewBox de `VectorPlane` (seul cas où ce ratio compte vraiment : un cercle non conforme
  au ratio s'affiche ellipsé) — corrigé en imposant exactement ce ratio. Plus grave : les points F/F′
  (foyers) et M/M′ (tangence à la génératrice) avaient été placés à l'œil plutôt que calculés, si bien
  que F/F′ ne tombaient pas réellement sur une droite sécante tangente aux deux cercles — recalculé
  analytiquement (rayons des 2 cercles inscrits proportionnels à la distance à l'apex du cône,
  tangente commune "interne" aux deux cercles par produit scalaire avec la normale, point de
  génératrice-cercle par projection orthogonale, `P` par intersection droite-droite) puis vérifié
  numériquement (chaque point de tangence recalculé est bien à distance exactement `r` du centre de
  son cercle) avant d'écrire les coordonnées dans le contenu — capture d'écran de confirmation après
  coup montrant la sécante réellement tangente aux deux cercles cette fois.
  **Une couleur de légende incohérente avec le thème réel** : une figcaption annonçait la parabole
  "bleu" dans le diagramme à 3 coniques superposées, alors que le ton `'accent'` de ce site rend en
  orange/rouille (`--accent: #b65c1f`, jamais bleu — vérifié dans `src/index.css`, pas supposé) ;
  texte corrigé en "orange".
  Vérifié par rendu navigateur réel (clair ET sombre) des ~20 figures une par une (captures
  individuelles par élément `<figure>`), page d'accueil (lien vers le chapitre présent), en-tête et
  table des matières, et le tableau de synthèse ; sitewide `regress_all.mjs` sur les 23 chapitres :
  `0` erreur console, `0` `NaN`/`undefined`, `0` signe `$` isolé restant, partout. `npm run
  build`/`npm run lint` propres (aucun avertissement nouveau au-delà des préexistants).

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : remplacement intégral du contenu à
  partir d'un nouvel artifact fourni par l'utilisateur (pas un patch — la demande était "remplace
  par les chapitres actuels"). Changements réels par rapport à la version précédente : (1)
  réordonnancement des sections — « Problèmes de géométrie du cercle » remonte de la position 7 à
  la position 3 (juste après « Polygones »), « Équations trigonométriques » descend de la position
  5 à la dernière position 8 ; (2) le bloc `intro` séparé ("Comment encadrer π ?") est supprimé et
  son contenu migré à l'intérieur de la section 1 elle-même (`subheading` + illustration + table),
  enrichi d'une dérivation explicite $AB=2r\sin\alpha$/$DE=2r\tan\alpha$ absente de la version
  précédente ; (3) ajout d'un rappel "cercle trigonométrique" (point image, enroulement) et d'une
  table des valeurs exactes (0°→360°, radians/cos/sin/tan) avant le diagramme à 16 angles déjà
  existant ; (4) la table des fonctions de référence (section « Paramètres ») gagne une colonne
  "parité" + un paragraphe paire/impaire.
  **Nouveau diagramme construit avec `vectorPlane` générique** (aucune extension de schéma) pour la
  preuve géométrique d'Archimède (hexagone inscrit/circonscrit, triangle CHB rectangle en H donnant
  $AB=2r\sin\alpha$, triangle CFD rectangle en F donnant $DE=2r\tan\alpha$) : points, segments,
  `angleArcs`, `rightAngleMarkers` — même esprit que le diagramme de Dandelin du chapitre précédent.
  **Bug de couleur trouvé et corrigé sur le diagramme à 16 angles déjà existant** : l'artifact veut
  7 couleurs VRAIMENT distinctes (4 axes 0°/90°/180°/270° chacun sa propre teinte + 3 familles de
  référence 30°/45°/60°), mais `circleAngles` n'avait que 6 tons (`accent/good/bad/plan/sky/ink`) —
  la version précédente de ce diagramme (écrite plus tôt dans la session) faisait donc
  involontairement partager le ton `'bad'` (rouge) entre l'axe 180° ET la famille de référence 60°,
  deux groupes que l'artifact veut visuellement distincts. Corrigé en ajoutant un **7e ton
  `'rose'`** à `circleAngles.points[].tone` (nouveau token `--rose` dans `index.css`, sur le modèle
  exact de `--sky`/`--plan` — même commentaire justifiant pourquoi un nouveau token est nécessaire
  plutôt que de réutiliser une teinte existante) et en réassignant la famille 60° à `'rose'`,
  libérant `'bad'` pour l'axe 180° seul.
  Vérifié par rendu navigateur réel (clair et sombre) des 17 figures ; sitewide `regress_all.mjs` :
  `0` erreur, `0` `NaN`, `0` signe `$` isolé, sur les 23 chapitres (y compris
  `4e/cercle-trigonometrique-triangles`, seul autre chapitre utilisant `circleAngles`, confirmé
  sans régression). `npm run build`/`npm run lint` propres.

- **5e (4h), Chapitre 3 — Suites** (`suites`, titre renommé de « Les suites » à « Suites ») :
  remplacement intégral du contenu à partir d'un nouvel artifact, même consigne "remplace par les
  chapitres actuels". Contrairement au chapitre 2 (surtout un réordonnancement), ce chapitre est une
  réécriture substantiellement plus riche section par section, à structure globale inchangée (6
  sections, même ordre, mêmes 6 liens générateur `5gen14`-`5gen19` + quiz `5gen41`) : nouvelles
  sous-sections ("Qu'est-ce qu'une suite numérique ?", "Représentation graphique — discrète et
  linéaire/exponentielle discrète", "Moyenne arithmétique/géométrique et somme des termes"),
  démonstrations de $S_n$ nettement plus détaillées et généralisées (preuve par $u_k+u_{n+1-k}$
  quelconque, pas seulement illustrée sur un exemple), un nouveau tableau de croissance par signe de
  $q$/$u_1$, un nouveau piège sur la racine d'exposant pair ($q^k=a$, 0/1/2 solutions), deux
  nouvelles tables de convergence (arithmétique, géométrique) séparées au lieu d'un seul bloc
  `methode`, une nouvelle liste de "grands classiques" (papyrus de Rhind, Fibonacci, triangles en
  zigzag, carrés emboîtés, suites combinées, position/vitesse), et des données numériques différentes
  dans plusieurs exemples résolus (ex. la comparaison de 2 villes est passée de 2000→5000 habitants
  à 50 000→30 000 habitants, avec des rangs de bascule différents — vérifié par calcul direct des
  formules, pas recopié depuis le SVG source, et les deux valeurs de contrôle du tableau (B₁₂≈69 949,
  B₁₃≈75 545) recoupées avec succès).
  **5 nouveaux diagrammes de comparaison à deux séries discrètes**, construits avec `curvePlot` en
  passant `curves: []` (aucune courbe continue) et seulement `points[]` avec deux tons distincts —
  seule façon de représenter deux suites juxtaposées (pas de champ dédié "deuxième série" sur
  `sequencePlot`, qui reste mono-série) ; conforme à la convention d'étendre un kind générique
  existant plutôt que d'en créer un nouveau, `points[].tone` de `curvePlot` couvrant déjà ce besoin.
  **Piège de positionnement d'étiquette trouvé et corrigé par capture d'écran réelle, à 3 reprises** :
  une étiquette de fin de série placée en bord de cadre (`labelPos:'right'` sur le dernier point,
  domaine `xMax` trop proche) est coupée par le viewBox — corrigé à chaque fois soit en élargissant
  `xMax`/`fixedYRange`, soit (plus robuste) en rattachant l'étiquette à un point interne avec
  `labelPos:'above'` plutôt qu'au dernier point avec `'right'`.
  Vérifié par rendu navigateur réel (clair et sombre) des 6 illustrations et des 4 tableaux ; sitewide
  `regress_all.mjs` : `0` erreur, `0` `NaN`, `0` signe `$` isolé, sur les 23 chapitres. `npm run
  build`/`npm run lint` propres.

- **6e (6h), Chapitre 9 — Lieux géométriques** (`lieux-geometriques`) : à la différence des
  chapitres 2/3 de 5e ci-dessus (réécritures complètes), le contenu existant (prose, exemples,
  valeurs numériques) collait déjà presque mot pour mot au nouvel artifact — le remplacement s'est
  donc fait en **patch additif ciblé** plutôt qu'en réécriture : une seule correction de formulation
  dans le chapeau (« à partir des milieux de ses côtés » → « à partir de ses milieux », pour coller
  exactement à l'artifact) et **9 nouvelles illustrations** insérées aux emplacements correspondants,
  structure des 6 sections numérotées et `recap.table` (18 lignes) inchangées.
  L'artifact source présente 2 sujets sous forme d'« interludes » hors sommaire (non numérotés) ;
  `ChapterSection` n'a aucune notion de section non numérotée (`id, number, title, kicker, blocks`
  tous obligatoires, section toujours dans la TOC auto-générée) — décision : conserver la structure à
  6 sections numérotées déjà en place (déjà une adaptation fidèle réalisée lors d'une session
  antérieure) plutôt que de forcer une restructuration artificielle pour imiter un choix de mise en
  forme propre à un fichier source particulier.
  **9 nouveaux diagrammes `vectorPlane`** (tous en extension additive du kind générique existant,
  aucun nouveau kind créé) : repère orthonormé vs affine (`illustrationGroup` 2 panneaux), forme
  implicite (deux équations proportionnelles d'une même droite), vecteur directeur + vecteur normal
  (avec `rightAngleMarkers`), droites parallèles/perpendiculaires (`illustrationGroup` 2 panneaux),
  pente/angle entre deux sécantes (`angleArcs` + étiquettes $m_1$/$m_2$), droite verticale $x=k$,
  incentre $I$ vs centre de gravité $G$ d'un même triangle (les deux clairement distincts), les 3
  régimes d'un lieu paramétré par seuil (`illustrationGroup` 3 panneaux : cercle si $k>$ seuil, point
  unique si $k=$ seuil, lieu vide si $k<$ seuil), et les 4 distances perpendiculaires d'un point aux
  côtés d'un carré. Trois diagrammes purement taxonomiques de l'artifact (repère orthonormé sous
  forme de rappel isolé, les 4 étapes de la méthode analytique en organigramme, les 7 natures de
  lieux en grille d'icônes) ont été délibérément **omis** : ce sont des reformulations visuelles du
  texte sans configuration géométrique propre à représenter, contrairement aux 9 retenus.
  **Limitation de `VectorPlane` découverte et documentée** : le champ `circle` ne peut jamais rendre
  une ellipse — `VectorPlane.tsx` calcule `r` en **moyennant** le rayon mis à l'échelle en x et celui
  mis à l'échelle en y (`r = ((circle.r/(xMax-xMin))*L + (circle.r/(yMax-yMin))*H) / 2`) et dessine
  toujours un `<circle>` SVG vrai, quel que soit le rapport d'aspect du domaine — vérifié par capture
  d'écran (un cercle donné sur un domaine anisotrope reste parfaitement rond). Le panneau « repère
  affine » (qui doit montrer qu'un cercle y paraît écrasé) a donc été refait sans le champ `circle` :
  domaine anisotrope (`xMin:-3,xMax:3,yMin:-1,yMax:1`) avec seulement `grid: true`, les lignes de
  grille étant mises à l'échelle x/y indépendamment et rendant fidèlement des cellules rectangulaires
  — légende ajustée pour parler du quadrillage non carré plutôt que d'un cercle écrasé.
  **Piège de positionnement d'étiquette retrouvé une fois de plus** (diagramme pente/angle) :
  l'étiquette « $m_1$ » posée sur le point terminal de la sécante avec `labelPos:'right'` était
  coupée au bord du domaine (`xMax` trop proche) — corrigé en déplaçant le point d'ancrage à
  l'intérieur du domaine sur la même droite, avec `labelPos:'above'`.
  Vérifié par rendu navigateur réel (clair et sombre) des 9 nouvelles illustrations (33 figures au
  total sur la page) ; sitewide `regress_all.mjs` : `0` erreur, `0` `NaN`, `0` signe `$` isolé, sur
  les 23 chapitres. `npm run build`/`npm run lint` propres.

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : nouveau widget interactif porté
  (`archimede-widget`, voir `.claude/rules/interactive-widgets.md` pour le mécanisme général),
  inséré en section 1 juste après le paragraphe sur l'encadrement historique d'Archimède, avant le
  premier callout `intuition` sur les radians. Cercle de rayon $r=1/2$ (choisi pour que le périmètre
  du cercle vaille exactement $\pi$, sans facteur à traîner) avec polygone régulier inscrit et
  circonscrit à $n$ côtés superposés, $n$ réglable de 3 à 30 par un curseur ; trois valeurs
  affichées en direct — périmètre du polygone inscrit ($n\sin\alpha$), du cercle ($\pi$, fixe), du
  circonscrit ($n\tan\alpha$), $\alpha=\pi/n$ — reprenant exactement la formule déjà donnée dans le
  `rappel` juste au-dessus.
  **Choix d'échelle du dessin** : le rayon pixel du polygone **circonscrit** reste fixe (toujours le
  même cercle-cadre), et le rayon du cercle/polygone inscrit est calculé comme une fraction de
  celui-ci ($r_{px} = R_{px}\cos\alpha$) — plutôt que l'inverse (cercle à taille fixe, circonscrit
  débordant du cadre). Ce choix rend la convergence visuellement immédiate : le polygone inscrit
  part petit et se resserre contre le cadre extérieur à mesure que $n$ grandit, au lieu d'un cercle
  fixe autour duquel le circonscrit grossirait sans limite visible (son rayon vaut le double de
  celui du cercle pour $n=3$).
  Vérifié par rendu navigateur réel (clair et sombre) et interaction réelle du curseur (Playwright,
  navigation clavier sur le `range` à travers la frontière du Shadow DOM) : valeurs recalculées à
  chaque pas et recoupées à la main pour $n=3$ (2,59808 ≤ π ≤ 5,19615), $n=6$ (3,00000 ≤ π ≤
  3,46410) et $n=30$ (3,13585 ≤ π ≤ 3,15313) — exactement les valeurs attendues ; `0` erreur
  console, `0` `$` isolé. `tsc -b`/`npm run build`/`npm run lint` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.
  **Choix d'échelle corrigé deux fois après coup, sur signalement direct de l'utilisateur avec
  capture d'écran** (le cercle "ne remplissait pas son cadre", puis "n'avait pas vraiment
  grandi") : le premier correctif (ci-dessus) gardait implicitement TOUT le viewBox proportionnel
  au rayon du cercle — la marge de sécurité pour n=3 (pire cas, facteur 1/cos60°=2) grandissait
  donc dans la même proportion que le cercle, annulant presque tout le gain visuel (mesuré :
  208px→216px, +4%, imperceptible). Root cause démontrée par calcul : garantir 0 rognage à n=3 sur
  le MÊME viewBox qui fixe l'échelle d'affichage plafonne mathématiquement le cercle à ~50% de la
  largeur affichée, quelle que soit la valeur absolue choisie pour son rayon. Correctif final : ne
  protéger du rognage que jusqu'à n=5 (au lieu du pire cas n=3) — à n=3 et un peu n=4, le polygone
  circonscrit dépasse désormais le bord réel du SVG et y est rogné net (comportement standard du
  viewport SVG, pas un bug) ; le cercle, lui, ne bouge jamais. Diamètre RÉEL du cercle mesuré à
  l'écran (`getBoundingClientRect`, pas un attribut interne du viewBox — la mesure utilisée pour
  les deux premiers correctifs, insuffisante) : 333px, contre 208px avant, +60%, constant pour
  n=3/4/6/30. **Leçon retenue** : pour un widget dont une grandeur doit rester visuellement fixe
  quel que soit un paramètre variable, mesurer la taille RENDUE À L'ÉCRAN de cette grandeur
  précise (pas un attribut interne ni la taille du conteneur global) avant de conclure qu'un
  correctif a fonctionné — un rayon interne plus grand ne veut rien dire si le facteur d'échelle
  global a diminué d'autant.
  **Bug distinct, repéré par l'utilisateur au même moment** : les 3 graphes `curvePlot` (sin, cos,
  tan) juste avant ce widget portaient `compact: true` (`.diagram-frame--compact`, limite à 50% de
  large) sans raison — retiré. En vérifiant plus largement (grep sur tout `src/content/chapters/`),
  42 autres illustrations dans 6 autres fichiers portaient le même flag inutile (voir commit
  correspondant) — corrigées dans la foulée, sur demande explicite de l'utilisateur ("remets
  toutes les images... à leur taille normale").

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : second widget interactif porté
  (`sinusoide-widget`), inséré en section "Paramètres d'une fonction sinusoïdale" juste après les 3
  graphes de référence (sin, cos, tan), avant le callout `intuition` "Pour visualiser" (l'analogie
  de la balançoire) et le `rappel` du rôle de chaque paramètre — emplacement demandé explicitement
  par l'utilisateur. $f(x) = A\sin(\omega x + \varphi) + b$ avec 4 curseurs (A, ω, φ, b), formule
  affichée en direct, courbe recalculée en temps réel, et 3 encadrés (Période T, Maximum, Minimum)
  sur le modèle visuel déjà établi par `archimede-widget`. Un bouton "Réinitialiser" (comme
  `parabole-widget`) ramène aux valeurs par défaut ($A=2, \omega=1, \varphi=0, b=0$).
  **Fenêtre de tracé entièrement dynamique**, contrairement à `archimede-widget` (qui doit composer
  avec une grandeur RÉELLE fixe, le rayon du cercle) : ce widget n'a aucune grandeur à garder fixe
  entre deux réglages, donc la fenêtre X est recalculée à chaque rendu pour toujours montrer
  exactement 5 périodes ($x \in [-2{,}5T ; 2{,}5T]$, $T=2\pi/\omega$) et la fenêtre Y est cadrée sur
  le maximum/minimum réels ($b\pm A$, plus une marge, tout en gardant $y=0$ toujours visible) — la
  courbe remplit donc TOUJOURS bien le cadre, quel que soit le réglage, sans le compromis subi par
  `archimede-widget`. Repères verticaux ajoutés à chaque période ($k \cdot T$, étiquetés "T", "2T",
  "−T"...) plutôt que des graduations génériques en π, pour rendre la période directement lisible
  sur le graphe et pas seulement dans l'encadré numérique.
  Vérifié par rendu navigateur réel (clair et sombre) et interaction réelle des 4 curseurs
  (Playwright, navigation clavier à travers la frontière du Shadow DOM) : formule, période, maximum
  et minimum recalculés à chaque pas et recoupés à la main ($T=2\pi/\omega$, $max=b+A$, $min=b-A$
  vérifiés après chaque curseur bougé isolément) ; bouton de réinitialisation confirmé ramener
  exactement aux valeurs par défaut ; `0` erreur console, `0` `$` isolé. `tsc -b`/`npm run
  build`/`npm run lint` propres ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur,
  `0` `NaN`, `0` `$` isolé.
  **Repositionné et corrigé sur demande explicite de l'utilisateur**, après avoir vu le widget :
  déplacé de juste après le graphe de tan x vers la section 5 ("Paramètres d'une fonction
  sinusoïdale — lecture graphique"), juste après son paragraphe d'introduction, avant le `methode`
  "lire un graphique de sinusoïde" — pas où je l'avais placé sans consulter l'utilisateur au
  préalable.
  **Vrai bug corrigé, confirmé par l'utilisateur** ("le curseur pulsation n'influence pas la
  courbe ?") : la fenêtre X se recalculait pour TOUJOURS montrer exactement 5 périodes quel que
  soit ω — le zoom compensait donc exactement tout changement de fréquence, rendant le tracé
  pixel-par-pixel identique quel que soit ω (le paramètre changeait bien en interne, mais son effet
  visuel était intégralement annulé par le cadrage automatique). Même piège que celui déjà rencontré
  et documenté sur `archimede-widget` (un cadrage qui se recale automatiquement sur la grandeur
  qu'il doit montrer efface son effet), mais appliqué ici à une fenêtre de tracé, pas un rayon fixe.
  Corrigé en passant à une fenêtre X **fixe** ($x \in [-4\pi ; 4\pi]$) et une fenêtre Y **fixe**
  ($y \in [-8 ; 8]$, pire cas $b \pm A$ couvert) — A et b, qui souffraient du même défaut sans que
  l'utilisateur l'ait remarqué (le cadrage Y se recalait aussi automatiquement sur max/min), sont
  corrigés par la même occasion.
  **Curseur T (période) ajouté avant ω**, lié bidirectionnellement ($T=2\pi/\omega$) : bouger l'un
  recalcule et repositionne l'autre. Vérifié que la synchronisation est exacte en LISANT L'ÉTAT
  INTERNE (`el._omega`, la valeur brute du curseur T), pas les valeurs arrondies affichées à
  l'écran (qui, multipliées entre elles, donnaient un produit visiblement différent de $2\pi$ à
  cause du double arrondi d'affichage — pas un bug réel, juste une fausse alerte de la méthode de
  vérification) : `T × ω = 6,283185307179585` contre `2π = 6,283185307179586` attendu, à l'erreur
  flottante près. L'encadré "Période T" (devenu redondant avec le nouveau curseur) retiré des
  statistiques, qui ne montrent plus que Maximum/Minimum.
  Vérifié par rendu navigateur réel et interaction Playwright : `path.courbe` (l'attribut `d` du
  tracé SVG) confirmé DIFFÉRENT avant/après un déplacement du seul curseur ω (`true`) — preuve
  directe que le paramètre affecte enfin le rendu, pas seulement l'état interne ; même confirmation
  pour A. Emplacement du widget vérifié par `compareDocumentPosition` (après le graphe de tan x,
  avant le callout `methode`). `0` erreur console, `0` `$` isolé ; sitewide `regress_all.mjs` sur
  les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : troisième widget interactif
  (`cercle-trigo-widget`), inséré juste après le graphe de $y=\tan x$ (section "Paramètres d'une
  fonction sinusoïdale"), à l'emplacement exact qu'occupait `sinusoide-widget` avant d'être déplacé
  — demandé explicitement par l'utilisateur dans le même message que le curseur T/correctif ω
  ci-dessus. Cercle trigonométrique (rayon fixe) à gauche, graphe $x\in[0;3\pi]$ à droite, tous deux
  dans des panneaux SVG séparés (pas de recadrage partagé). Un `<select>` choisit sin(x)/cos(x)/
  tan(x) ; un curseur $x$ de $0$ à $3\pi$ (pas $0{,}01$) pilote les deux dessins en même temps.
  L'angle balayé de $0$ à $x$ est tracé en violet (`--plan`) à la fois comme arc sur le cercle ET
  comme segment en sur-épaisseur sur l'axe des x du graphe — même couleur pour les relier
  visuellement, comme demandé. Le point courant sur le cercle reste EXACTEMENT sur le cercle de
  référence (rayon fixe) tant que $x\le 2\pi$ ; au-delà, seul le TRACÉ de l'angle balayé (pas le
  cercle de référence, qui ne bouge jamais) voit son rayon croître progressivement avec l'excédent
  au-delà d'un tour complet, produisant l'effet "ressort circulaire" demandé sans jamais faire
  varier la taille du cercle trigonométrique lui-même (application directe de la leçon déjà tirée
  deux fois cette session sur `archimede-widget`/`sinusoide-widget` : ne jamais laisser un
  paramètre déformer l'élément censé rester une référence fixe). Segment rouge (`--bad`, réutilisé
  ici pour sa teinte, pas sa sémantique "erreur") : projection verticale sur l'axe des x pour
  sin(x), projection horizontale sur l'axe des y pour cos(x), segment sur la droite tangente au
  point $(1,0)$ du cercle (longueur bornée à $\pm 2{,}3\times R$ près des asymptotes) pour tan(x) ;
  masqué proprement quand $\cos x\approx 0$ (tangente non définie). La courbe du graphe se trace
  progressivement de $0$ à $x$ seulement (jamais pré-tracée sur tout l'intervalle), avec un point
  rouge à la pointe courante $(x, f(x))$ relié par un pointillé rouge à l'axe des y — pour montrer
  explicitement que ce point correspond à l'ordonnée du graphe, sans repeindre toute la courbe en
  rouge. Fenêtres de tracé du graphe **fixes** dès la conception (X: $[0;3\pi]$, Y: $\pm1{,}4$ pour
  sin/cos, $\pm4$ pour tan avec asymptotes pointillées à $\pi/2$, $3\pi/2$, $5\pi/2$ et tracé coupé
  net près de chacune, sur le modèle déjà utilisé pour le graphe statique de tan x du même
  chapitre) — jamais de recadrage automatique sur la valeur courante.
  Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright réelle : placement
  confirmé par `compareDocumentPosition` (après le graphe de tan x, avant le callout `intuition`
  "Pour visualiser") ; distance du point mobile au centre du cercle mesurée à l'écran (pas un
  attribut interne) = exactement le rayon de référence pour $x\le 2\pi$, strictement supérieure au-
  delà (ressort confirmé, ex. $x=3\pi$) ; longueur du tracé SVG confirmée croissante à mesure que le
  curseur avance (tracé progressif, pas pré-calculé) ; les 3 choix de fonction testés un par un
  (valeurs numériques recoupées à la main, segment rouge présent sur le cercle pour sin/cos, absent
  et "non défini" affiché pour tan près d'une asymptote comme attendu) ; bouton de réinitialisation
  vérifié. `0` erreur console, `0` `$` isolé, `0` `NaN`. `tsc -p tsconfig.app.json --noEmit`/
  `oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur,
  `0` `NaN`, `0` `$` isolé.
  **Corrigé et complété sur retour utilisateur direct** (le widget avait été mal compris sur un
  point précis) :
  - **Élément confondu, corrigé** : ce n'est PAS l'arc balayé sur la circonférence qui doit devenir
    un "ressort circulaire" au-delà de 2π — c'est l'**angle orienté** (un indicateur distinct, que
    la première version n'avait pas du tout dessiné) qui doit prendre cette forme. Ajouté un
    second élément violet (`.angle-oriente`), un petit arc près du sommet dont le rayon reste fixe
    (~20px) tant que $x\le 2\pi$ puis grandit avec l'excédent au-delà d'un tour — l'arc balayé sur
    la circonférence (`.arc-cercle-violet`), lui, reste maintenant à rayon **strictement constant**
    ($=C_R=90$, y compris au-delà de 2π, où il se retrace simplement sur lui-même) ; de même pour
    le rayon et le point mobile, qui ne s'étaient jamais censés bouger de rayon mais dont le code
    de la première version les faisait par erreur suivre le même rayon variable que l'arc.
  - **Indications ajoutées** (« toutes les indications » demandées) : la valeur de l'angle en π rad
    s'affiche maintenant à trois endroits distincts — sous le cercle (`x = 0,75π`), à côté du
    curseur (`0,79 rad (0,25π)`, les deux valeurs ensemble), et sur le graphe, juste sous
    l'abscisse du segment violet qui avance avec le curseur.
  - **Vecteur vert ajouté** (nouvel élément, absent avant) : sur le graphe, un vecteur vertical vert
    (ligne + tête de flèche) du point d'abscisse $x$ vers le point de la courbe $(x, f(x))$. Le
    même principe est repris sur le cercle : un vecteur vert du centre vers l'ordonnée du point
    intercepté par l'angle (vertical, cas sin/tan) ou vers son abscisse (horizontal, cas cos) — ce
    dernier coïncide géométriquement avec le segment rouge déjà existant pour cos ; le vecteur vert
    est dessiné APRÈS les segments rouges pour rester visible par-dessus dans ce cas de
    recouvrement exact (vérifié par capture d'écran : invisible tant que l'ordre de dessin n'était
    pas inversé, visible ensuite).
  Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright : distance au
  centre de l'arc balayé sur la circonférence et du point mobile mesurée sur toute la trajectoire
  du chemin SVG (pas seulement au point courant) — confirmée **strictement constante** (~90,00 ±
  0,01) même à $x=3\pi$ ; rayon de l'indicateur d'angle orienté confirmé variable sur son propre
  tracé (de ~20 à ~37 à $x=3\pi$), la preuve directe que c'est bien lui, et lui seul, qui
  "s'enroule". `0` erreur console, `0` `$` isolé, `0` `NaN` ; `tsc`/`oxlint`/`build` propres ;
  sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.
  **Troisième série de corrections/ajouts, sur retour utilisateur direct** :
  - **Flèche sur l'angle orienté** : l'indicateur d'angle (`.angle-oriente`) se termine maintenant
    par une tête de flèche triangulaire — un angle "orienté" doit se voir comme orienté, pas comme
    un simple arc. Piège rencontré et corrigé en cours de route : la direction de la flèche,
    calculée d'abord à partir des deux DERNIERS points échantillonnés du tracé, disparaissait pour
    les petits $x$ (les points consécutifs d'un arc de rayon ~20px espacés de quelques centièmes de
    radian sont à moins de 0,5px l'un de l'autre, sous le seuil de dessin de la flèche) —
    corrigé en calculant la direction analytiquement, à partir de deux points séparés d'un
    epsilon angulaire fixe (0,08 rad, borné par $x$ lui-même), indépendant de la densité
    d'échantillonnage.
  - **sin(x) et tan(x) : segment rouge retiré, remplacé par le vecteur vert** (le vecteur vert
    séparé, parti du centre, est lui aussi retiré pour ces deux fonctions) : pour sin(x), le
    vecteur vert va maintenant de l'axe des x jusqu'au point du cercle qui correspond à sin(x) (la
    flèche pointe vers ce point) ; pour tan(x), il va du point $(1,0)$ sur la droite tangente
    jusqu'au point qui correspond à tan(x) — géométrie inchangée par rapport à l'ancien segment
    rouge, seule la couleur et la flèche changent. **cos(x) n'est pas concerné** : garde son
    segment rouge ET son vecteur vert par-dessus (les deux coïncident géométriquement), comme
    avant.
  - **Prolongement pointillé du segment de l'angle, pour tan(x) uniquement** (nouveau) : une ligne
    violette pointillée prolonge le rayon au-delà du point sur le cercle, jusqu'à son intersection
    avec la droite verticale $x=1$ (la tangente) quand cette intersection tombe dans la fenêtre
    visible ; sinon (angle dans le mauvais sens pour atteindre $x=1$ en avançant — $\cos x\le 0$ —
    ou intersection hors cadre), la ligne pointillée se prolonge à la place jusqu'à la bordure de
    la fenêtre SVG (intersection rayon/rectangle calculée directement, pas approximée). Ce
    prolongement reste visible même quand tan(x) est indéfini (proche d'une asymptote), montrant
    visuellement le rayon filer vers le bord au lieu de croiser $x=1$.
  Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright : comptage direct
  des éléments SVG par classe pour sin/cos/tan à plusieurs valeurs de $x$ (aucun `.segment-rouge`/
  `.point-rouge` pour sin/tan, présents pour cos ; `.angle-oriente-tete` toujours présent, y
  compris à $x$ très petit après le correctif ; `.prolongement-tan` toujours présent en mode tan,
  y compris près d'une asymptote et en $\cos x<0$) ; capture d'écran pour chaque cas confirmant
  visuellement le sens du prolongement pointillé (vers $x=1$ quand $\cos x>0$, vers le bord opposé
  sinon). `0` erreur console, `0` `$` isolé, `0` `NaN` ; `tsc`/`oxlint`/`build` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **6e (6h), Chapitre 2 — Fonctions exponentielles** (`fonctions-exponentielles`) : un widget
  interactif et une illustration statique, sur demande explicite de l'utilisateur (capture d'écran
  fournie des deux graphes statiques a=2/a=0,5 déjà en place).
  - **Widget `exponentielle-widget`** — $f(x)=a^x$, un seul curseur $a$ de 0 à 4 par pas de 0,1
    (défaut $a=2$), inséré juste après les deux graphes statiques existants (a=2, a=0,5) et avant
    le callout astuce "Le cas de e", à l'emplacement exact demandé par l'utilisateur. Fenêtre de
    tracé **fixe** ($x\in[-3;3]$, $y\in[-0{,}5;9]$), reprenant exactement celle des deux graphes
    statiques juste au-dessus pour ne pas créer de saut d'échelle visuel à la suite immédiate —
    toujours la même leçon (jamais de cadrage qui se recale sur le paramètre variable). Point
    $(0;1)$ toujours affiché (fixe, quel que soit $a$) ; point $(1;a)$ mobile, avec pointillés vers
    les deux axes et la valeur numérique affichée à chaque intersection (« préciser les valeurs des
    coordonnées sur les axes X et Y », demandé explicitement). Cas limite $a=0$ (borne basse du
    curseur) géré explicitement : $a^x$ vaut $0$ pour $x>0$, $1$ en $x=0$ (convention JS
    `Math.pow(0,0)=1`, cohérente avec le point fixe), et $+\infty$ pour $x<0$ — le tracé est
    découpé par segments et exclut toute portion hors fenêtre (même technique que pour les
    asymptotes de tan(x) dans `cercle-trigo-widget`), pour ne jamais laisser fuiter un texte
    `Infinity` dans le DOM.
    Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright : placement
    confirmé par `compareDocumentPosition` (juste après le second graphe statique, avant le
    callout "Le cas de e") ; formule/type croissante-décroissante/point affiché recoupés à la main
    pour $a=0$ (borne min), $a=1$ (cas limite constante), $a=4$ (borne max), et après
    réinitialisation ; tracé confirmé différent à chaque changement de $a$. `0` erreur console,
    `0` `$` isolé, `0` `NaN`, `0` occurrence de `Infinity` dans le texte affiché. `tsc -p
    tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur
    les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.
  - **Illustration statique `curvePlot`** pour $(1+1/x)^x$, $x>0$, asymptote horizontale $y=e$ —
    insérée à l'endroit exact où le nombre d'Euler est défini par cette limite (dans l'
    `exempleLibre` "Démonstration — pourquoi exp est sa propre dérivée"), juste après le paragraphe
    qui pose la définition et avant celui sur $\ln(e)=1$, comme demandé. Fenêtre
    $x\in[0\,;25]$ (échantillonnage à partir de $x=0{,}05$ pour éviter la division par une valeur
    proche de 0), $y\in[0\,;3{,}2]$, asymptote $y=e\approx 2{,}718$, deux points repères
    $(1;2)$ et $(10;2{,}594)$ pour ancrer visuellement la convergence. Pas de nouveau kind
    d'illustration : réutilise `curvePlot` tel quel (déjà utilisé partout ailleurs dans ce
    chapitre), la seule fonction étant nouvelle.
    Vérifié par rendu navigateur réel : figure retrouvée au bon endroit du DOM (juste après le
    paragraphe de définition de $e$), caption rendue avec KaTeX (le champ `caption` d'une
    illustration passe par `RichText`, contrairement au `caption` d'un bloc `atelier` qui reste en
    texte brut — distinction déjà documentée dans `.claude/rules/content-authoring.md`). `0` erreur
    console, `0` `$` isolé ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0`
    `NaN`, `0` `$` isolé (nombre de `<svg>` de ce chapitre passé de 29 à 30, confirmant l'ajout).

- **4e, Chapitre 2 — Équations et inéquations du second degré** (`equations-inequations-second-degre`) :
  les deux `Démonstration` du chapitre (formule du discriminant, relations de Viète) largement
  détaillées, sur demande explicite de l'utilisateur ("détaille beaucoup plus les démonstrations").
  Les deux étaient des blocs `methode` compressés (3-4 puces sans le détail de chaque manipulation
  algébrique) — converties en `exempleLibre` (une séquence de `para`, une manipulation par bloc,
  le format déjà utilisé ailleurs sur le site pour une démonstration détaillée, ex. $\exp'=\exp$
  dans `6e-6h/fonctions-exponentielles.ts`).
  - **Formule du discriminant** : 4 puces → 6 étapes explicites, chacune justifiée. Ajouts
    concrets : l'identité $(x+k)^2=x^2+2kx+k^2$ utilisée pour identifier $k=b/(2a)$ (au lieu de
    l'affirmer directement) ; le détail de la distribution du $a$ sur les crochets
    ($a\cdot\frac{b^2}{4a^2}=\frac{b^2}{4a}$) ; la mise au même dénominateur des deux termes
    constants, étape par étape, jusqu'à $-\Delta/(4a)$ ; la division explicite par $a$ pour isoler
    le carré (étape absente avant, le passage de $a(...)^2=\Delta/(4a)$ à $x=...$ se faisait en un
    seul saut) ; et la justification de la condition $\Delta\geq0$ pour pouvoir prendre la racine
    carrée (avec la conclusion "aucune solution réelle" si $\Delta<0$, qui n'était pas explicite
    dans la version précédente).
  - **Relations de Viète** : 3 puces → 4 blocs, avec le calcul du produit désormais détaillé via
    l'identité $(u+v)(u-v)=u^2-v^2$ explicitée ($u=-b$, $v=\sqrt\Delta$) plutôt qu'un résultat
    donné directement.
  Aucun changement de fond (mêmes résultats, mêmes formules finales) — uniquement plus de détail
  intermédiaire, sans toucher au reste du chapitre.
  Vérifié par rendu navigateur réel : les deux blocs retrouvés au bon endroit du DOM, tout le
  KaTeX rendu correctement (aucune formule affichée en texte brut). `tsc -p tsconfig.app.json
  --noEmit`/`oxlint`/`npm run build` propres ; `0` erreur console, `0` `$` isolé ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé (aucune
  illustration ajoutée, uniquement du texte).

- **4e, Chapitre 2 — Équations et inéquations du second degré** (suite) : nouvelle démonstration
  ajoutée — factorisation $ax^2+bx+c=a(x-x_1)(x-x_2)$ pour $\Delta\geq0$ — demandée explicitement,
  avec placement précis ("après les formules de Viète") et détail comparable aux deux
  démonstrations déjà présentes. Insérée entre la démonstration de Viète et le sous-titre "Écrire
  une équation à partir de ses solutions" : un `subheading` ("Factoriser un trinôme grâce à ses
  racines"), un `para` de transition qui justifie l'intérêt de cette factorisation (elle rend la
  section suivante — étudier le signe d'un trinôme — bien plus simple, puisque le signe d'un
  produit de facteurs du premier degré se lit facilement), un `rappel` énonçant le résultat, puis
  l'`exempleLibre` "Démonstration" détaillée en 4 étapes.
  **Démonstration construite pour réutiliser les résultats déjà établis**, plutôt que repartir de
  zéro : part directement de la forme $a(x+b/2a)^2-\Delta/(4a)$ obtenue à l'étape 4 de la
  démonstration du discriminant (juste au-dessus dans le chapitre), réécrit le terme constant
  comme un carré ($\Delta/(4a)=a(\sqrt\Delta/(2a))^2$), factorise la différence de deux carrés via
  $u^2-v^2=(u-v)(u+v)$, puis identifie chaque facteur à $x-x_1$/$x-x_2$ en reprenant les mêmes
  $x_1$, $x_2$ que la démonstration de Viète juste avant. Conclut par le cas particulier
  $\Delta=0$ (racine double, factorisation $a(x+b/2a)^2$), qui referme la boucle avec le "carré
  parfait" déjà rencontré comme raccourci en tout début de section.
  **Piège vérifié en pratique, rencontré et corrigé pendant la rédaction** : deux libellés
  d'étape écrits d'abord comme `'**Étape 3 — ... $u^2-v^2=...$**'` (le `$...$` À L'INTÉRIEUR du
  `**gras**`) — exactement le piège documenté plus haut dans ce fichier de règles : le tokenizer
  capture tout le texte entre `**...**` comme gras littéral, dollars compris, jamais reparsé par
  KaTeX. Détecté par un scan Playwright des nœuds texte de la page contenant `$` (pas seulement un
  comptage brut du nombre de `$`, qui restait pair et donc invisible en grep) : 2 occurrences
  trouvées ("Étape 3 — appliquer l'identité $u^2-v^2=(u-v)(u+v)$", "Étape 4 — reconnaître $x_1$ et
  $x_2$"). Corrigées en refermant le gras AVANT le premier `$` (ex. `'**Étape 3 — appliquer
  l'identité**'` puis `' $u^2-v^2=(u-v)(u+v)$, avec '` en segments adjacents, jamais imbriqués).
  Vérifié par rendu navigateur réel : placement confirmé par `compareDocumentPosition` (après la
  démonstration de Viète, avant "Écrire une équation à partir de ses solutions") ; tout le KaTeX
  rendu correctement après le correctif (`0` `$` isolé, contre `6` avant). `tsc -p
  tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur
  les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.
  **Démonstration réécrite dans l'autre sens, sur retour utilisateur** ("trop compliquée") :
  l'aller-retour complétion-du-carré → différence de deux carrés → identification de $x_1$/$x_2$
  était correct mais indirect pour un résultat aussi simple. Remplacée par le sens naturel —
  partir de la forme factorisée $a(x-x_1)(x-x_2)$, la **distribuer** ($x^2-(x_1+x_2)x+x_1x_2$),
  puis substituer directement les relations de Viète ($x_1+x_2=-b/a$, $x_1\cdot x_2=c/a$,
  démontrées juste au-dessus) pour retomber sur $ax^2+bx+c$ — 4 étapes courtes au lieu de 6, sans
  repasser par $\sqrt\Delta$ ni par une identité remarquable de type $u^2-v^2$. Retire au passage
  le renvoi au cas particulier $\Delta=0$ (n'apporte plus rien dans ce sens de la preuve, la
  substitution de Viète fonctionne identiquement que les racines soient distinctes ou confondues).
  Vérifié par rendu navigateur réel et scan Playwright des nœuds texte contenant un `$` isolé (`0`
  cette fois, aucun piège de gras imbriqué réintroduit) ; `0` erreur console. `tsc -p
  tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur
  les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **6e (6h), Chapitre 2 — Fonctions exponentielles** (`fonctions-exponentielles`) : nouveau widget
  `tangente-exponentielle-widget` — $f(x)=a^x$, curseur $a$ de 1 à 3 par pas de $0{,}0001$ (très
  fin, demandé explicitement pour permettre de "trouver" $e$ à la main), avec deux cases à cocher
  indépendantes : « Tangente en x=0 » et « f'(x) » (la fonction dérivée tracée en entier, pas
  seulement au point 0). Inséré juste après l'illustration statique qui compare déjà les pentes de
  $2^x$ et $e^x$ en $(0\,;1)$ (section 2, « Domaine et dérivée »), avant la démonstration
  « pourquoi exp est sa propre dérivée » — emplacement choisi car ce widget en est la version
  interactive : l'élève peut faire varier $a$ en continu et voir la tangente pivoter, plutôt que
  comparer seulement deux valeurs fixes.
  **Couleurs distinctes par élément**, demandé explicitement : $f(x)=a^x$ en `--accent` (orange,
  toujours visible), tangente en `--plan` (violet, pointillée, uniquement si cochée), $f'(x)$ en
  `--good` (vert, uniquement si cochée) — une légende colorée apparaît dans le coin du graphe pour
  chaque élément affiché. La valeur $f'(0)=\ln(a)$ est affichée en permanence dans un encadré
  statistique (pas seulement quand la case tangente est cochée), avec 4 décimales pour que l'effet
  du pas très fin du curseur reste visible sur ce nombre précis — c'est en réglant $a$ pour que
  cet affichage tombe exactement sur $1{,}0000$ que l'élève retrouve $e$ par lui-même, juste avant
  que la section ne l'introduise formellement par la limite $(1+1/x)^x$.
  **Fenêtre de tracé fixe** ($x\in[-2{,}2\,;2{,}2]$, $y\in[-2\,;9]$), même principe que tous les
  widgets précédents de la session — testé mathématiquement pour rester valide sur tout
  $a\in[1;3]$ (pente maximale $\ln(3)\approx1{,}0986$, aux bords de la fenêtre X la tangente reste
  dans la fenêtre Y grâce à la marge basse à $-2$, plus généreuse que $-1$ pour cette raison
  précise). Cas limite $a=1$ (borne basse du curseur) vérifié explicitement : $f(x)=1^x=1$
  (constante), $f'(0)=\ln(1)=0$ — aucun NaN, aucune valeur infinie, la tangente devient
  simplement horizontale et $f'(x)$ une droite plate à $y=0$.
  Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright : placement
  confirmé par `compareDocumentPosition` ; comptage direct des éléments SVG par classe pour
  confirmer que chaque case à cocher fait bien apparaître/disparaître son propre tracé
  indépendamment de l'autre ; valeurs de $f'(0)$ recoupées à la main pour $a=1$ ($0$), $a=2$
  ($\ln 2\approx0{,}6931$), $a=3$ ($\ln 3\approx1{,}0986$) et $a=2{,}71828$ (**exactement**
  $1{,}0000$ affiché, confirmant que le widget permet bien de retrouver $e$) ; capture d'écran à
  $a\approx e$ montrant visuellement $f(x)$ et $f'(x)$ presque confondues, cohérent avec
  $\ln(e)=1$. `0` erreur console, `0` `$` isolé, `0` `NaN`, `0` occurrence de `Infinity`. `tsc -p
  tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur
  les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.
  **Deux corrections sur retour utilisateur direct** :
  - **Tangente en trait plein** (était pointillée) — c'est une droite à part entière, pas une
    construction auxiliaire, contrairement au prolongement pointillé de `cercle-trigo-widget`. Les
    guides projetant un point de cette tangente vers les axes restent, eux, en pointillé (rôle
    différent : lecture de coordonnées, pas tracé de la droite elle-même).
  - **Point de la tangente en x=1, projeté sur les deux axes** (nouveau) : guides pointillés +
    valeurs affichées à chaque intersection, même principe que le point (1;a) d'`exponentielle-
    widget`. **Vérification mathématique faite avant d'implémenter** : la tangente passe par
    $(0;1)$ avec une pente $\ln(a)$, donc son équation est $y=1+\ln(a)\cdot x$ — en $x=1$,
    l'ordonnée vaut $1+\ln(a)$, **pas** $\ln(a)$ comme l'énonçait la demande au premier abord (le
    point $(1;\ln(a))$ n'est pas sur cette droite, sauf à passer par l'origine, ce qu'elle ne fait
    pas). Implémenté avec la valeur réelle $1+\ln(a)$, étiquette du point volontairement
    symbolique (`(1;1+ln(a))`) plutôt que numérique, pour ne jamais donner l'impression que le
    point vaut littéralement $\ln(a)$ — la valeur $f'(0)=\ln(a)$ elle-même reste lisible séparément
    dans l'encadré statistique déjà présent, inchangé.
  - **Fix identique appliqué à `exponentielle-widget`** (chapitre 2, widget précédent) et à
    `tangente-exponentielle-widget` : leur propre affichage de la formule ("f(x) = 2,0000^x")
    utilisait encore un `^` littéral dans un `<p>` en texte brut (pas du KaTeX) — invisible au
    premier scan Playwright de cette session car un `document.createTreeWalker` sur `document.body`
    ne traverse PAS les Shadow DOM par défaut ; découvert seulement en inspectant la capture
    d'écran du widget rendu. Corrigé en remplaçant `"^x"` par `"ˣ"` (caractère unicode) dans les
    deux fichiers `.js`.
  Vérifié par rendu navigateur réel et interaction Playwright : `stroke-dasharray` de la tangente
  confirmé `none` (trait plein) ; guides et étiquettes de coordonnées comptés et lus après avoir
  coché la case ; valeur $1+\ln(2)\approx1{,}6931$ recoupée à la main pour $a=2$. `0` erreur
  console, `0` `$` isolé ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`,
  `0` `$` isolé.

- **6e (6h), Chapitre 2 — Fonctions exponentielles** (suite) : tous les `^` du chapitre remplacés
  par l'indice en exposant unicode correspondant (ex. `a^6` → `a⁶`), sur demande explicite de
  l'utilisateur ("beaucoup d'exponentielles étaient écrites avec des ^ dans les légendes des
  graphes"). **Distinction cruciale faite avant toute modification** : les `^` À L'INTÉRIEUR d'une
  paire `$...$` (LaTeX, déjà rendu par KaTeX comme un vrai exposant) ne devaient PAS être touchés —
  seuls les `^` en texte BRUT (jamais passés par KaTeX) posaient réellement le problème visuel
  décrit : `textLabels` de `curvePlot` (légendes directement sur le graphe), `caption` d'illustration/
  `signTable` (passe par `RichText`, mais `RichText` ne traite QUE `$...$`/`**...**` — un `^` hors
  de ces paires reste littéral), lignes de `featureTable` (les cellules passent par `RichText`,
  donc pareil). Environ 25 occurrences corrigées sur 4 illustrations, 2 lignes de `featureTable`,
  et un `signTable`, réparties sur tout le chapitre (dont une zone entière, lignes ~860-1150,
  ratée au premier passage de grep et retrouvée par un second passage plus systématique).
  **Cas particuliers de correspondance caractère-par-caractère** (aucun superscript unicode natif
  pour "f(x)" ou "sin x" en un seul glyphe) : `a^f(x)` → `aᶠ⁽ˣ⁾` (chaque caractère de l'exposant
  composé, y compris les parenthèses, a son propre équivalent unicode `⁽`/`ᶠ`/`ˣ`/`⁾`) ; `e^sin x`
  → `eˢⁱⁿ ˣ` ; `3^(x⁴−x)` → `3⁽ˣ⁴⁻ˣ⁾` (le `⁴` déjà présent dans l'exposant reste tel quel — Unicode
  n'a pas de "super-exposant", c'est la meilleure approximation possible hors KaTeX) ;
  `e^(−x²)` → `e⁽⁻ˣ²⁾`.
  **Vérification robuste, pas seulement un grep ligne par ligne** (qui donnait de faux positifs
  sur les chaînes JS concaténées où une paire `$...$` LaTeX s'étend sur plusieurs lignes/fragments
  de template) : script Node qui charge tout le fichier, retire globalement chaque portion
  `$...$` (regex non gourmande sur le contenu complet, pas ligne par ligne), puis cherche les `^`
  restants — `0` trouvé après correction. Complété par un scan Playwright en profondeur de la page
  rendue ET des deux Shadow DOM des widgets du chapitre (`exponentielle-widget`,
  `tangente-exponentielle-widget`) à la recherche d'un `^` dans un nœud texte — `0` partout,
  page et widgets compris.
  Vérifié par rendu navigateur réel ; `0` erreur console, `0` `$` isolé. `tsc -p tsconfig.app.json
  --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur les 23 chapitres :
  `0` erreur, `0` `NaN`, `0` `$` isolé.

- **Bug sitewide — `text-transform: uppercase` mettait en majuscule des variables/paramètres
  censés rester en minuscule** (`kicker` de section, `label` de callout, `label` d'`atelier`,
  `.stat-label` des widgets interactifs) : sur signalement direct de l'utilisateur avec un
  exemple précis (`fonctions-exponentielles.ts`, kicker "(aˣ)' = ln(a)·aˣ — et le cas particulier
  de e" rendu "(AˣY = LN(A)·Aˣ — ET LE CAS PARTICULIER DE E"). Ces champs sont du texte BRUT (pas
  de RichText/KaTeX, voir `.claude/rules/content-authoring.md`), donc une variable comme `a` ou
  `e` tapée en minuscule dans le contenu — cohérente avec le rendu KaTeX partout ailleurs sur la
  page — se retrouvait visuellement transformée en `A`/`E` par la seule feuille de style, sans
  aucun moyen de le distinguer d'une vraie majuscule.
  **Audit complet effectué avant toute correction** (agent dédié, tous les `text-transform:
  uppercase` de `src/index.css` et de tous les widgets `src/interactive/*.js`), pour ne corriger
  que les règles réellement concernées et ne pas casser les usages sûrs :
  - **Confirmées bugguées, corrigées** (retrait de `text-transform: uppercase`, le reste de la
    règle CSS conservé — famille de police mono, espacement des lettres, couleur — pour garder le
    même rôle visuel de "petite étiquette") : `.section-kicker`, `.callout-label`,
    `.atelier-label`, `.wrong-right .tag` (`src/index.css`) ; `.stat-label` dans
    `archimede-widget.js`, `cercle-trigo-widget.js`, `exponentielle-widget.js`,
    `sinusoide-widget.js`, `tangente-exponentielle-widget.js` (widgets interactifs — même
    correctif appliqué aux 2 widgets nouvellement créés dans cette session, ex. le stat-label "a"
    de `tangente-exponentielle-widget` s'affichait "A").
  - **Confirmées non-bugguées, volontairement inchangées** : `.exemple-head .badge` (une règle
    `text-transform: none` existait déjà en override sur ce sous-élément précisément pour cette
    raison — piège déjà anticipé ailleurs dans le CSS) ; `.level-kicker`/`.chapter-card-eyebrow`/
    `.eyebrow`/`.toc-label`/`.generator-head .eyebrow2` (texte d'interface fixe ou généré, jamais
    de variable mathématique authored) ; `.entete` de `gen7-widget.js`/`gen8-widget.js` (noms
    d'étapes multi-mots type "Coefficients"/"Allure", jamais de variable seule).
  Un exemple a révélé que la casse peut être **sémantiquement significative** et non un simple
  artefact de police : le kicker de `cercle-trigonometrique-triangles.ts` ("a/sinA = b/sinB =
  c/sinC...") mélange délibérément minuscules (côtés a, b, c) et majuscules (sommets/angles A, B,
  C), une convention explicitée juste en dessous dans le contenu ("le côté minuscule est toujours
  opposé au sommet de même lettre majuscule") — avec `text-transform: uppercase` actif, cette
  distinction était purement et simplement effacée visuellement ; sans lui, elle redevient
  lisible telle qu'écrite.
  Vérifié par rendu navigateur réel (clair et sombre, sur deux chapitres différents) et lecture du
  `text-transform` calculé (`getComputedStyle`) sur `.section-kicker`/`.callout-label`/
  `.atelier-label`/`.stat-label` des widgets — confirmé `none` partout après correctif. `0` erreur
  console, `0` `$` isolé. `tsc -p tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ;
  sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **6e (6h), Chapitre 1 — Fonctions réciproques & cyclométriques**
  (`fonctions-reciproques-cyclometriques`) : 3 nouveaux widgets interactifs, sur demande explicite
  de l'utilisateur après une suggestion (jamais implémentée sans validation préalable) faite en
  réponse à sa question « y a-t-il d'autres widgets intéressants à mettre ? ». Premier chapitre du
  site à recevoir des widgets qui n'illustrent pas un paramètre numérique (a, b, c...) mais une
  **relation géométrique** — la symétrie par rapport à $y=x$ — d'où un mécanisme commun aux deux
  premiers, factorisé en deux fichiers distincts plutôt qu'un seul paramétrable, pour rester
  fidèle à la convention "un widget = un fichier = un Web Component".
  - **`reciproque-miroir-widget`** — section 1, inséré juste après l'illustration statique
    $f(x)=2x+1$/$f^{-1}(x)=(x-1)/2$, avant "Propriétés de la réciproque". Sélecteur entre une
    fonction linéaire ($2x+1$) et une cubique ($x^3$), curseur $x$ déplaçant un point sur $f$
    (orange) ; son symétrique sur $f^{-1}$ (vert) suit automatiquement, relié par un pointillé
    violet perpendiculaire à la diagonale $y=x$ (grise). Fenêtre **carrée** ($x,y \in [-7;7]$),
    condition nécessaire pour que $y=x$ apparaisse bien à 45° et que le symétrique se lise
    vraiment comme un reflet — un domaine non carré aurait cassé cette lecture géométrique.
  - **`cyclometrique-miroir-widget`** — section 2, inséré juste après l'illustration qui montre
    déjà sin/arcsin en miroir (points $(\pi/2;1)$ et $(1;\pi/2)$ marqués), avant "D'où vient le
    mot « arc » ?". Instancie exactement le même mécanisme que le widget précédent, mais
    restreint à sin/cos/tan (sélecteur), avec une fenêtre carrée **propre à chaque fonction**
    (span identique en x et y, mais pas nécessairement centrée en 0 — ex. cos : $x,y \in
    [-1,3;3,6]$, pour contenir à la fois le domaine $[0;\pi]$ de la restriction et l'image
    $[0;\pi]$ de arccos). tan/arctan tronqués à $x \in [-1,3;1,3]$ (bien en-deçà des asymptotes
    $\pm\pi/2\approx1,5708$) pour rester dans une fenêtre finie sans jamais s'approcher d'une
    division par 0.
  - **`cyclometrique-tangente-widget`** — section 4, inséré juste après le `piege` sur le signe
    moins de arccos, avant "Pour aller plus loin — d'où viennent ces trois formules ?".
    Sélecteur arcsin/arccos/arctan, curseur $x$ déplaçant un point sur la courbe avec sa
    tangente (trait plein, sur le modèle de `tangente-exponentielle-widget`) et sa pente
    affichée en direct, calculée par la formule exacte du tableau juste au-dessus (jamais une
    dérivée numérique approchée). Bornes de curseur **volontairement ouvertes** pour
    arcsin/arccos ($x \in [-0,99;0,99]$, jamais $\pm1$ pile) : la pente y explose (dérivée non
    définie en $\pm1$, démontrée juste après dans la même section) — en s'approchant du bord,
    l'élève voit la tangente devenir presque verticale, lien direct et volontaire avec la
    démonstration par l'absurde qui suit. Tangente **clippée proprement au cadre** par
    intersection droite/rectangle paramétrique (jamais coupée net ni laissée déborder) — piège
    anticipé dès la conception, contrairement aux autres widgets de la session où un dépassement
    avait été découvert après coup.
  **Bug de rognage trouvé et corrigé sur les deux widgets "miroir"**, avant tout commit (capture
  d'écran prise pendant la vérification, pas après un signalement utilisateur) : l'étiquette
  d'un point mobile, toujours ancrée à droite du point (`x+8`), se faisait couper par le bord du
  cadre SVG dès que le point s'approchait de la limite droite de la fenêtre (ex. $(5,83;1,80)$
  sur la fonction cubique) — un `<svg>` racine a un `overflow:hidden` implicite, contrairement à
  une simple sortie de viewBox qui resterait visible. Corrigé par une méthode `_etiquettePoint`
  commune aux deux widgets, qui choisit l'ancrage (gauche/droite, haut/bas) selon la proximité
  réelle du point aux bords du cadre plutôt qu'un décalage fixe — vérifié par capture d'écran
  avant/après sur le cas qui avait révélé le bug.
  Vérifié par rendu navigateur réel (clair et sombre) et interaction Playwright réelle
  (changement de sélecteur + curseur au maximum, pour chaque widget) : valeurs recoupées à la
  main ($f(1{,}80)=1{,}80^3=5{,}832$ pour le widget 1 ; $\tan(1{,}3)\approx3{,}602$ pour le
  widget 2 ; $\text{arcsin}'(0{,}98)=1/\sqrt{1-0{,}98^2}\approx5{,}025$ et
  $\text{arctan}'(6)=1/37\approx0{,}027$ pour le widget 3) ; scan `document.createTreeWalker` du
  `shadowRoot` de chaque widget à la recherche de `^`/`$`/`NaN`/`Infinity`/`undefined` — `0`
  partout. `tsc -p tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé (SVG du chapitre
  passés de 58 à 61, confirmant les 3 ajouts).

- **4e, Chapitre 2 — Équations et inéquations du second degré**
  (`equations-inequations-second-degre`) : 3 nouveaux widgets interactifs, même processus que le
  chapitre précédent (suggestion faite d'abord, jamais implémentée sans validation explicite).
  Les 3 widgets partagent un même principe — courbe **coupée exactement aux racines** (jamais
  interpolée : les bornes de chaque segment tracé sont les racines elles-mêmes, le signe de
  chaque segment évalué en son milieu, jamais déduit) et colorée directement en vert/rouge
  (`--good`/`--bad`) plutôt qu'une seule couleur — pour que la couleur de la courbe et celle du
  tableau de signes se répondent visuellement sans effort de lecture.
  - **`discriminant-racines-widget`** — section 1, inséré juste après le piège "Erreur de signe
    classique" qui clôt le cas général, avant "Le cas caché". Curseurs a, b, c (a ne peut jamais
    valoir 0 : un passage par 0 est repoussé au pas suivant dans le sens du déplacement, jamais
    laissé à 0 pile), Δ et le nombre de solutions recalculés en direct, racines marquées sur
    l'axe. Valeurs par défaut $a=1,b=-1,c=-6$ : reprend tel quel l'exemple $x^2-x-6\ge0$ déjà
    résolu section 2, pour que le widget démarre sur un cas déjà familier.
  - **`signe-trinome-widget`** — section 2, inséré juste après l'astuce sur la notation à
    crochets inversés, avant la carte `entrainement` gen2. Mêmes curseurs a/b/c, plus un
    sélecteur ◇ ∈ {>,≥,<,≤} : une grille de signes HTML (pas SVG, construite en chaîne de
    caractères à chaque rendu) apparaît sous la courbe, et $S$ est calculé et affiché avec la
    notation exacte du site (`]−∞ ; −2] ∪ [3 ; +∞[`).
  - **`signe-produit-widget`** — section 3, inséré juste après l'attention "Facteur quadratique
    irréductible", avant la carte `entrainement` gen5. 2 ou 3 facteurs du premier degré à racine
    réglable (case à cocher pour activer/désactiver le 3e), une ligne de grille par facteur PLUS
    une ligne "produit", et $S$ pour ◇ ∈ {>,<} seulement (les cas ≥/≤ avec point isolé auraient
    demandé un algorithme de fusion de bornes nettement plus complexe pour un gain pédagogique
    marginal — simplification assumée, disclosed ici plutôt que silencieuse). Valeurs par défaut
    $r_1=0,r_2=1,r_3=3$ : reprend exactement l'exemple $(x-1)\cdot x\cdot(x-3)>0$ déjà résolu
    juste au-dessus, vérifié en confrontant la grille et le $S$ du widget à ceux de l'exemple
    statique — identiques caractère pour caractère.
  **Grille de signes générique** (les deux derniers widgets) : chaque cellule, borne OU écart,
  est obtenue en évaluant **directement** la fonction de sa ligne à cet endroit précis (jamais un
  signe "déduit" par grille de règles) — ce qui donne automatiquement 0 dans la colonne du propre
  facteur, et le vrai signe (jamais un blanc) dans la colonne d'un autre facteur, exactement comme
  la grille de référence déjà présente dans le contenu de la section 3. Les deux infinis sont
  toujours évalués à ±3 au-delà de la dernière racine finie, jamais une vraie évaluation infinie.
  **Bug réel trouvé et corrigé avant tout commit**, découvert par une vérification systématique
  des valeurs affichées (pas seulement une capture d'écran) : `signe-trinome-widget._calculerSolution`
  utilisait le MÊME sens de crochet (`large ? "[" : "]"`) pour les racines finies ET pour ±∞,
  alors que ±∞ doit **toujours** porter un crochet ouvert vers l'extérieur, quel que soit le
  symbole — règle explicitement énoncée dans le contenu de cette section même
  ("$-\infty$ et $+\infty$ ont toujours un crochet ouvert vers l'extérieur : on ne les atteint
  jamais !"). Avec ◇=≥, le widget affichait `S = [−∞ ; −2] ∪ [3 ; +∞]` (crochets fermés,
  mathématiquement absurdes) au lieu de `]−∞ ; −2] ∪ [3 ; +∞[`. Corrigé en distinguant
  explicitement le crochet d'une borne infinie (toujours ouvert) de celui d'une borne finie
  (dépend de `large`), via deux fonctions `ouvrant(v)`/`fermant(v)` plutôt qu'une seule paire
  `o1`/`o2` réutilisée partout.
  Vérifié par interaction Playwright réelle (pas seulement une lecture de code) : valeurs de Δ et
  des racines recoupées à la main sur 3 cas ($\Delta>0$, $\Delta<0$, $\Delta=0$ — ce dernier avec
  $a=1,b=-4,c=4\to$ racine double $x=2$, après avoir d'abord découvert que $c=9$ dépassait la
  borne max du curseur $c$ et se faisait clamper à 6 par le navigateur, fausse alerte de la
  méthode de test plutôt qu'un bug du widget) ; les deux grilles de signes (widget 2 et widget 3)
  et les 3 textes $S$ produits confrontés cellule par cellule et caractère par caractère aux
  exemples déjà résolus statiquement dans le contenu — identiques. `0` erreur console, `0` `^`/`$`
  isolé/`NaN`/`Infinity`/`undefined` (scan `document.createTreeWalker` des 3 `shadowRoot`).
  `tsc -p tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé ; les 3 widgets
  confirmés présents dans le DOM du chapitre (un `document.querySelector` par tag, réussi pour
  les trois).

- **5e (4h), Chapitre 1 — Fonctions : rappels et compléments** (`fonctions-composees`) : 2
  nouveaux widgets interactifs, même processus que les deux chapitres précédents (suggestion
  faite d'abord, jamais implémentée sans validation explicite).
  - **`composition-machine-widget`** — section 2, inséré juste après le piège
    "$f\circ g \ne g\circ f$" ($f(x)=x+1$, $g(x)=x^2$), avant "Décomposer : remonter...". Reprend
    le **même langage visuel** que l'illustration statique déjà présente plus loin dans le
    chapitre (`compositionNumeric` — deux graphes empilés, guides pointillés, le "rebond"
    couleur accent puis couleur good), mais rendu interactif : 3 préréglages de paires
    $(f,g)$ + un sélecteur d'ordre $(f\circ g)$/$(g\circ f)$ + un curseur $a$. Le premier
    préréglage ($f(x)=x+1$, $g(x)=x^2$, $a=2$ par défaut) reproduit **exactement** les deux
    valeurs du piège juste au-dessus (5 pour $f\circ g$, 9 pour $g\circ f$) — vérifié en
    changeant seulement le sélecteur d'ordre, sans toucher au curseur. Un 2e préréglage
    ($f(x)=\sqrt{x}$, $g(x)=x-3$) illustre le cas "n'existe pas" (valeur intermédiaire hors
    domaine) sur un exemple concret plutôt qu'en abstrait.
    **Fenêtres calculées par échantillonnage, jamais par formule dérivée à la main** : pour
    chaque préréglage/ordre, la fenêtre Y du graphe du haut est l'étendue réellement atteinte
    par la première fonction sur son domaine (avec marge), et la fenêtre X du graphe du bas est
    cette même étendue (elle devient le domaine d'entrée de la seconde fonction) — seule façon
    robuste de garder un cadrage cohérent alors que les fonctions sont interchangeables via les
    préréglages, sans recalculer une formule de portée à la main pour chaque cas.
  - **`domaine-composee-widget`** — section 3, inséré juste après le second exemple résolu
    (domaine vide) et son paragraphe d'explication, avant la carte `entrainement` 5gen3. Visualise
    la **triple droite graduée** de la méthode "double condition" déjà enseignée juste au-dessus
    (dom de la fonction intérieure ; la condition qui la relie à l'extérieure ; leur
    intersection), avec un curseur $x$ dont le marqueur passe du vert (condition vérifiée) au
    gris (non vérifiée) sur les 3 lignes simultanément. 2 préréglages, qui reprennent **mot pour
    mot** les 2 exemples déjà résolus algébriquement dans le contenu — $f(x)=\sqrt{-3x+6}$,
    $g(x)=\sqrt{-2x+4}$ (dom(g∘f)=[2/3;2]) et $f(x)=\sqrt{x-10}$, $g(x)=-x^2$ (dom(f∘g)=∅).
    **Prédicats fournis par préréglage sous forme algébrique directe** (ex. `x => -3*x+6 <= 4`,
    traduction littérale de la condition déjà posée dans le contenu), jamais dérivés en évaluant
    la fonction elle-même (qui vaudrait `NaN` hors domaine et empêcherait de tester la condition
    2 sur tout le reste de la droite) — les segments où chaque prédicat est vrai sont ensuite
    trouvés par échantillonnage + bissection (frontière affinée numériquement, jamais une borne
    câblée en dur), un mécanisme générique qui n'a pas besoin de connaître la nature algébrique
    de la condition. Le texte du résultat final (`dom(g∘f) = [2/3 ; 2]` / `dom(f∘g) = ∅`) reste
    néanmoins écrit par préréglage plutôt que déduit des segments trouvés — simplification
    assumée : les deux exemples n'utilisant que des inégalités larges, les crochets sont toujours
    fermés aux bornes finies, un cas trop particulier pour justifier une détection générique du
    sens du crochet (contrairement au chapitre précédent, où cette détection servait à un
    sélecteur `>`/`≥`/`<`/`≤` vraiment interactif).
  Vérifié par interaction Playwright réelle : pour le premier widget, les 4 valeurs affichées
  recoupées à la main sur 2 préréglages × 2 ordres/points (dont le cas "n'existe pas" ET le cas
  qui existe, sur le même préréglage, pour confirmer que ce n'est pas systématique) ; pour le
  second, le texte résultat et l'état vert/gris du marqueur confirmés à 3 points de test
  différents (dans l'intersection, hors intersection, et le préréglage à intersection vide).
  `0` erreur console, `0` `^`/`$`/`NaN`/`Infinity`/`undefined` isolé (scan
  `document.createTreeWalker` des 2 `shadowRoot`). `tsc -p tsconfig.app.json
  --noEmit`/`oxlint`/`npm run build` propres ; sitewide `regress_all.mjs` sur les 23 chapitres :
  `0` erreur, `0` `NaN`, `0` `$` isolé.

- **6e (6h), Chapitre 2 — Fonctions exponentielles** (`fonctions-exponentielles`) : 3 widgets
  interactifs supplémentaires, correspondant aux 3 suggestions faites plus tôt dans la même
  session (jamais implémentées sans validation explicite) — demandées ensuite mot pour mot par
  l'utilisateur (« fais les widgets que tu voulais rajouter »).
  - **`parite-derivee-widget`** — section 3 (« Graphique de la dérivée »), inséré juste après
    l'illustration statique de l'exemple résolu ($f(x)=\cosh(x)$, $f'(x)=\sinh(x)$), avant le
    piège sur le signe oublié dans $e^{-kx}$. 2 préréglages (cosh/sinh par défaut, puis
    $e^{-x^2}$), curseur $x \ge 0$ déplaçant simultanément un point sur $f$ ET son symétrique en
    $-x$, avec leurs deux tangentes (clippées au cadre, même technique que
    `cyclometrique-tangente-widget`) et les deux pentes affichées côte à côte — rend visible que
    $f'(-x)=-f'(x)$ sans jamais l'énoncer autrement que par les deux nombres opposés à l'écran.
  - **`inequation-exponentielle-widget`** — section 5 (« Résoudre une inéquation
    exponentielle »), inséré juste après l'illustration statique déjà présente ($2^x$ contre
    $0{,}5^x$, comparées à la constante 4) qui montre déjà le piège central du chapitre sur DEUX
    valeurs de base fixes. Le widget généralise cette même figure à une base $a$ continûment
    réglable ($a \in [0{,}3\,;2{,}6]$) plus un curseur $k$ et un sélecteur ◇ ∈ {>,≥,<,≤} :
    $S$ recalculé par la règle $a^x \diamond k \iff x \diamond x_0$ (sens conservé si $a>1$,
    inversé sinon) — exactement le principe (a)-(h) déjà posé juste au-dessus dans le contenu.
    Valeurs par défaut $a=2,k=4$ : reproduisent le premier côté de l'illustration statique
    ($S=[2\,;+\infty[$) ; faire glisser $a$ vers $0{,}5$ (sans toucher au symbole ni à $k$)
    reproduit l'AUTRE côté de la même illustration ($S=]-\infty\,;-2]$), rendant le piège visible
    comme un continuum plutôt que deux cas isolés.
  - **`croissance-saturation-widget`** — section 7 (« Exponentielles : problèmes »), inséré juste
    après l'illustration statique du modèle de saturation, avant l'astuce « trouver un instant
    précis ». Un sélecteur bascule entre les deux modèles de la section, chacun avec ses propres
    curseurs reconstruits dynamiquement (`_construireControles`, qui détache proprement les
    écouteurs du mode précédent avant d'en attacher de nouveaux — jamais de fuite d'écouteur
    orphelin sur un curseur retiré du DOM) : croissance libre $Q(t)=Q_0\cdot r^t$
    ($Q_0=100,r=1{,}5$ par défaut, reprend l'exemple résolu $Q(t)=100\cdot1{,}5^t$) et saturation
    $p(t)=L\cdot(1-e^{-kt})$ ($L=100,k=0{,}15$ par défaut, reprend les paramètres de
    l'illustration statique juste au-dessus). Un curseur $t$ commun affiche la valeur atteinte et,
    en saturation, le pourcentage du plafond $L$ déjà atteint.
  **Bug réel trouvé et corrigé avant tout commit** (scan `document.createTreeWalker` du
  `shadowRoot`, pas une simple relecture) : la formule affichée en mode saturation utilisait un
  `^` littéral (`"p(t) = 100·(1−e^(−0,15t))"`) — piège déjà documenté plusieurs fois dans ce même
  fichier d'historique (aucune `.formule` de widget ne passe par KaTeX, un `^` y reste affiché
  tel quel). Corrigé par une fonction `versExposant` dédiée qui convertit un exposant composé
  (chiffres, signe moins, la lettre t) caractère par caractère en unicode superscript et
  l'encadre par `⁽`/`⁾` — même convention que celle déjà établie pour les exposants composés du
  chapitre (ex. `3^(x⁴−x)` → `3⁽ˣ⁴⁻ˣ⁾`) ; aucune virgule superscript n'existe en Unicode, laissée
  telle quelle (meilleure approximation possible), tout comme les précédents de ce fichier.
  Vérifié par interaction Playwright réelle : pour le 1er widget, $f'(1{,}2)=\sinh(1{,}2)\approx
  1{,}51$ et $f'(-1{,}2)\approx-1{,}51$ recoupés à la main ; pour le 2e, les 3 textes $S$ produits
  (par $a=2$/$a=0{,}5$/symbole `<`) confrontés à un calcul indépendant de $x_0=\ln(k)/\ln(a)$ ;
  pour le 3e, $Q(3)=100\cdot1{,}5^3=337{,}5$ et $p(10)=100\cdot(1-e^{-1,5})\approx77{,}69$
  recoupés à la main. `0` erreur console, `0` `^`/`$`/`NaN`/`Infinity`/`undefined` isolé (scan des
  3 `shadowRoot`, après correctif). `tsc -p tsconfig.app.json --noEmit`/`oxlint`/`npm run build`
  propres ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : 3 widgets
  interactifs, correspondant aux 3 suggestions faites plus tôt dans la même session (suggérées
  puis validées explicitement, comme pour les deux chapitres précédents). Ce chapitre étant le
  miroir conceptuel du chapitre 2 (log = réciproque de exp), deux des trois widgets reprennent
  délibérément le mécanisme déjà éprouvé sur les exponentielles, appliqué cette fois au logarithme.
  - **`log-exp-miroir-widget`** — section 1, inséré juste après les deux illustrations statiques
    qui montrent déjà expₐ/logₐ en miroir (cas $a>1$ et $0<a<1$), avant l'intuition sur la règle
    à calcul. Généralise `reciproque-miroir-widget` (chapitre 1) avec une base $a$ **continûment
    réglable** (curseur, pas un sélecteur fermé de 2-3 fonctions) : point $(r;a^r)$ sur expₐ, son
    symétrique $(a^r;r)$ sur logₐ. Réglages par défaut $a=2,r=0{,}8$ : reproduisent
    **exactement** le point $(r;s)$ marqué dans la première illustration statique.
    **Fenêtre carrée calculée dynamiquement** (jamais une formule dérivée à la main) : combine le
    domaine fixe de $r$ ($[-1{,}5;1{,}5]$) avec l'étendue réellement atteinte par $a^r$ sur ce
    domaine (échantillonnage), pour que $y=x$ reste à 45° quelle que soit la base — sans ce
    calcul, une base éloignée de 1 aurait fait sortir une bonne partie de l'une des deux courbes
    du cadre. Base $a=1$ exclue par curseur repoussé (même technique que le curseur $a$ du
    chapitre 2 pour $a=0$) : $\log_1$ n'existe pas du tout, pas seulement un cas dégénéré.
  - **`inequation-logarithmique-widget`** — section 3, inséré juste après l'illustration
    statique qui compare déjà $\ln(x)\le2$ et $\log_{0,5}(x)\le2$, avant le premier exemple
    résolu. Réplique exactement `inequation-exponentielle-widget` (chapitre 2) mais pour
    $\log_a(x) \diamond k \iff x \diamond a^k$ (au lieu de $a^x \diamond k \iff x \diamond
    \ln(k)/\ln(a)$) — sens conservé si $a>1$, inversé sinon, la condition de domaine $x>0$ étant
    automatiquement satisfaite puisque $a^k>0$ pour tout $a>0$, sans intersection supplémentaire
    à coder. Réglages par défaut $a\approx e$ ($2{,}72$), $k=2$ : $x_0=a^k\approx7{,}40$,
    quasiment identique au $e^2\approx7{,}39$ de l'illustration statique ; faire glisser $a$ vers
    $0{,}5$ (sans toucher à $k$ ni au symbole) reproduit l'AUTRE côté de la même illustration
    ($x=0{,}25$ exactement).
  - **`parametres-graphiques-widget`** — section 6, inséré juste après l'illustration statique de
    l'exemple résolu ($f(x)=1+2\ln(x)$, point $(1;1)$, tangente de pente 2), avant l'exemple
    suivant. Curseurs $a,b$ pour $f(x)=a+b\cdot\ln(x)$, point $(1;a)$ toujours affiché, tangente
    en $x=1$ de pente $b$ tracée (clippée au cadre), et une case à cocher qui révèle le point en
    $x=e$ avec $f(e)=a+b$ affiché **symboliquement** — démontre en direct le piège juste en
    dessous dans le contenu (confondre le point en $x=1$, où $b$ s'annule, avec celui en $x=e$,
    où $a$ **et** $b$ interviennent). Réglages par défaut $a=1,b=2$ : reproduisent exactement
    l'illustration statique juste au-dessus.
  Vérifié par interaction Playwright réelle : pour le 1er widget, le point $(0{,}8;2^{0,8})$
  recoupé à la main pour $a=2$ ET pour $a=0{,}5$ (les deux illustrations statiques de la
  section) ; pour le 2e, les deux textes $S$ produits ($a\approx e$ et $a=0{,}5$, mêmes $k$ et
  symbole) confrontés indépendamment à $x_0=a^k$ — l'un très proche de $e^2$, l'autre égal à
  $0{,}25$ exactement, comme l'illustration statique ; pour le 3e, $f(1)=a$ et $f'(1)=b$
  recoupés pour les réglages par défaut ET pour $a=4,b=3$ (l'exemple résolu qui suit dans le
  contenu). `0` erreur console, `0` `^`/`$`/`NaN`/`Infinity`/`undefined` isolé (scan des 3
  `shadowRoot`). `tsc -p tsconfig.app.json --noEmit`/`oxlint`/`npm run build` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **Retour utilisateur sur les 14 widgets auto-conçus (5 chapitres) : flèches d'axes manquantes,
  axe vertical parfois absent, axes qui bougent avec la courbe, demi-droite solution non
  surlignée** — lot de correctifs transversal sur `reciproque-miroir-widget`,
  `cyclometrique-miroir-widget`, `cyclometrique-tangente-widget`, `discriminant-racines-widget`,
  `signe-trinome-widget`, `signe-produit-widget`, `composition-machine-widget`,
  `parite-derivee-widget`, `inequation-exponentielle-widget`, `croissance-saturation-widget`,
  `log-exp-miroir-widget`, `inequation-logarithmique-widget`, `parametres-graphiques-widget`,
  `domaine-composee-widget` (chapitres 6e-6h/fonctions-reciproques-cyclometriques, 4e/equations-
  inequations-second-degre, 5e-4h/fonctions-composees, 6e-6h/fonctions-exponentielles, 6e-6h/
  fonctions-logarithmes) — délibérément **hors scope** les widgets pour lesquels l'utilisateur
  avait donné une spécification détaillée (`tangente-exponentielle-widget`, `exponentielle-widget`,
  `archimede-widget`, `sinusoide-widget`, `cercle-trigo-widget`), le retour portant explicitement
  sur « ceux où je ne t'avais donné aucune explication ».
  - **Flèches en bout d'axe** (les 14 fichiers) : convention reprise telle quelle du composant React
    du site, `DomainNumberLine.tsx` (`<marker id="..." markerWidth="8" markerHeight="8" refX="6"
    refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z".../></marker>` + `marker-end`). Un bloc
    `<defs><marker>` est reconstruit à chaque rendu juste après `svg.innerHTML = ""` (qui efface
    aussi les defs précédents) ; id `"fleche"` réutilisé tel quel dans tous les fichiers (aucun
    risque de collision, chaque instance de Web Component a son propre Shadow Root). Piège
    d'orientation : une ligne verticale dessinée classiquement de haut en bas (`y1=MARGE,
    y2=HAUTEUR-MARGE`) place son "bout" (`marker-end`) côté origine, donc une flèche pointant vers
    le bas — toutes les verticales ont donc été inversées (`y1=HAUTEUR-MARGE, y2=MARGE`) pour que
    `marker-end` pointe naturellement vers le haut, plutôt que de risquer `marker-start` (sémantique
    moins portable d'un navigateur à l'autre). Étendu par cohérence à `domaine-composee-widget`
    (droites graduées horizontales, même motif que `DomainNumberLine.tsx`) bien qu'il n'ait pas
    d'axes cartésiens à proprement parler.
  - **Axe vertical effectivement absent** : deux bugs distincts trouvés, chacun propre à un seul
    fichier (pas un défaut générique des 14).
    - `parametres-graphiques-widget` : la verticale $x=0$ était dessinée deux fois au même endroit
      — une fois en `.axe` (solide), puis immédiatement recouverte par une seconde ligne en
      `.asymptote` (pointillée), ce qui la faisait apparaître pointillée sans flèche à l'écran.
      Cette seconde ligne redondante a été supprimée ; la classe `.asymptote` (devenue inutilisée
      dans ce fichier) retirée du CSS.
    - `inequation-logarithmique-widget` : même symptôme, cause différente — la verticale $x=0$ **est
      elle-même**, mathématiquement, l'asymptote verticale du logarithme (domaine $x>0$), donc le
      widget redessinait délibérément une seconde ligne pointillée exactement à l'emplacement de
      l'axe déjà tracé. Là aussi supprimée (une seule ligne solide avec flèche suffit, un
      commentaire explique pourquoi dans le code).
  - **Axes qui bougent avec la courbe/le curseur** : fenêtres de tracé recalculées dynamiquement à
    chaque rendu depuis les valeurs courantes des curseurs, sur 3 fichiers — corrigées en fenêtres
    **fixes** (constantes, jamais recalculées), quitte à couper les combinaisons de curseurs les
    plus extrêmes (`_traceCourbe`/`_traceFonction`/`_traceIntervalle` clippent déjà les points hors
    fenêtre, ce n'était donc qu'un changement de bornes, pas de logique de tracé) :
    - `croissance-saturation-widget` : `Y_MAX_CROISSANCE=8000` (couvre le réglage par défaut,
      $Q(10)=100\cdot1{,}5^{10}\approx5767$, avec marge) et `Y_MAX_SATURATION=220` (borne
      mathématiquement valable pour tout réglage puisque $p(t)<L\le200$ toujours, $L_{max}$ des
      curseurs). La fonction `etendueY` devenue totalement inutilisée a été supprimée.
    - `log-exp-miroir-widget` : `DOMAINE_MIN=-2,2 ; DOMAINE_MAX=6,8`, calculées à la main comme pire
      cas de $a^r$ sur $a\in[0{,}3;2{,}6]$ (bornes du curseur) $\times$ $r\in[-1{,}5;1{,}5]$ (domaine
      fixe déjà en place) : maximum $\approx6{,}086$ en $(a=0{,}3;r=-1{,}5)$, minimum $\approx0{,}164$
      en $(a=0{,}3;r=1{,}5)$, toujours dans $[-1{,}5;1{,}5]$ côté bas — vérifié par calcul, pas
      deviné.
    - `parametres-graphiques-widget` : `Y_MIN_FIXE=-20 ; Y_MAX_FIXE=22`, pire cas de
      $f(x)=a+b\ln(x)$ sur $a\in[-3;5]$, $b\in[-4;4]$, $x\in[0{,}02;8]$ : maximum $\approx20{,}65$
      en $(a=5,b=-4,x=0{,}02)$, minimum $\approx-18{,}65$ en $(a=-3,b=4,x=0{,}02)$ — la constante
      $b\cdot\ln(x)$ est maximale soit à $x=8$ (si $b>0$) soit à $x=0{,}02$ (si $b<0$), et
      $|\ln(0{,}02)|>|\ln(8)|$ donc le pire cas de chaque signe de $b$ est toujours du côté
      $x=0{,}02$.
    `composition-machine-widget` a été audité mais **exclu** de ce correctif : sa fenêtre dépend
    uniquement du preset/de l'ordre choisi (`preset.aMin/aMax`), jamais du curseur de position `a`
    lui-même — vérifié en lisant le code (pas supposé), donc pas de bug ici.
  - **Demi-droite solution surlignée** (`inequation-exponentielle-widget`,
    `inequation-logarithmique-widget`) : nouveau segment épais (classe `.segment-solution`, couleur
    `--good`) tracé sur l'axe des x lui-même, de l'extrémité $x_0$ (déjà calculée par le widget pour
    le texte $S=...$) jusqu'au bord de la fenêtre dans la direction de la solution (`direction`,
    déjà calculée) — puis un point à $x_0$, vert (`.point-inclus`) si la borne est incluse (symbole
    large, `large===true`) ou rouge (`.point-exclus`) si elle est exclue (strict). Bornes clampées à
    la fenêtre visible : si $x_0$ tombe hors cadre, tout ou rien du segment se dessine sans point
    (borne non visible), au lieu de déborder ou de planter. Cas particuliers gérés séparément :
    - `inequation-exponentielle-widget`, base $a=1$ ($\ln a=0$, pas de $x_0$) : $S=\mathbb{R}$
      (toute la fenêtre surlignée, aucun point) ou $S=\varnothing$ (rien tracé).
    - `inequation-logarithmique-widget`, domaine $x>0$ : le côté $]0;x_0[$/$]0;x_0]$ s'arrête à la
      frontière du domaine ($x=0$, l'asymptote) plutôt que de continuer vers le $X_{MIN}$ négatif de
      la fenêtre, et aucun point n'y est dessiné (ce n'est pas une borne de solution, juste la limite
      du domaine).
  Vérifié par script Playwright dédié (headless Chromium, `vite preview`) sur les 5 chapitres
  concernés, thèmes clair ET sombre : présence d'au moins 1 `<marker>` et 1 référence `marker-end`
  par widget, présence d'une ligne `.axe` solide (sauf `domaine-composee-widget`, qui n'a pas cette
  classe par conception), positions des lignes `.axe` identiques avant/après un glissement de
  curseur à 85% de sa course (comparaison JSON stricte), présence d'au moins un `.segment-solution`
  ou point `.point-inclus`/`.point-exclus` après glissement pour les 2 widgets d'inéquation — `0`
  échec sur `14` widgets × `2` thèmes, `0` erreur console/page. Confirmé aussi par captures d'écran
  réelles (`inequation-exponentielle-widget` : flèches visibles, segment vert de $x=2{,}00$ à $+\infty$
  avec point vert car symbole $\ge$ ; `parametres-graphiques-widget` : axe vertical redevenu solide
  avec flèche ; `domaine-composee-widget` : flèches en bout des 3 droites graduées). `tsc -p
  tsconfig.app.json --noEmit`/`oxlint` (les 14 fichiers)/`npm run build` propres ; sitewide
  `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **Retour utilisateur immédiat sur le lot ci-dessus, avec 3 captures d'écran à l'appui** : « les
  couleurs des courbes sont fausses par rapport aux inégalités » et « les tableaux sont tronqués
  dans les petits écrans (smartphone) ». Deux bugs distincts, tous deux dans les widgets à
  sélecteur ◇ ajouté juste avant.
  - **Couleurs de courbe incohérentes avec le symbole sélectionné**
    (`inequation-exponentielle-widget`, `inequation-logarithmique-widget`,
    `signe-trinome-widget`, `signe-produit-widget`) : `_traceCourbeSignee` colorait chaque segment
    selon un critère FIXE (`f(x)≥k` ou `f(x)≥0`, vert/rouge), indépendant du symbole ◇
    effectivement choisi dans le sélecteur. Résultat visible dans la capture jointe : pour
    `inequation-exponentielle-widget` avec le symbole `< k`, le segment de gauche (qui EST la
    solution $S=]-\infty;x_0[$, déjà surligné en vert sur l'axe par le correctif précédent) était
    tracé en ROUGE sur la courbe elle-même — une contradiction directe entre les deux couleurs
    visibles à l'écran en même temps. Corrigé en recalculant la classe depuis le symbole courant :
    `(f(mid) > k) === veutSup` (widgets `k`) ou `(f(mid) > 0) === veutPositif` (widgets `0`), où
    `veutSup`/`veutPositif` sont déjà calculés ailleurs dans `_rendre` pour construire le texte
    $S=...$ — jamais une nouvelle logique parallèle. `_traceCourbeSignee` prend maintenant ce
    booléen en paramètre explicite plutôt que de lire une constante fixe.
    **`discriminant-racines-widget` délibérément exclu** : ce widget n'a AUCUN sélecteur ◇ (il ne
    montre que Δ et le nombre de racines), donc son codage par signe brut (vert=positif,
    rouge=négatif) n'a rien à quoi se comparer et reste correct tel quel — vérifié en relisant le
    fichier (pas de `<select>` dans son template).
    **Le tableau de signes n'a PAS été touché** (`signe-trinome-widget`, `signe-produit-widget`) :
    sa ligne "signe de f(x)" / "produit" montre délibérément le signe BRUT (+/−), c'est tout le
    sens d'un tableau de signes — seule la courbe SVG, qui n'a pas cette fonction de référence,
    devait suivre la solution plutôt que le signe.
  - **Tableaux de signes tronqués sur petit écran** (`signe-trinome-widget`,
    `signe-produit-widget`) : `.table-zone{display:flex;justify-content:center;overflow-x:auto}`
    centrait la table dans son conteneur scrollable — quand la table est plus large que l'écran,
    la centrer revient à faire déborder autant à gauche qu'à droite, donc au chargement l'écran
    montre le MILIEU de la table (ni l'étiquette de ligne à gauche, ni la dernière colonne à
    droite), sans indice visuel qu'il faut faire défiler dans les deux sens pour tout voir — sur
    mobile, où les barres de défilement sont souvent invisibles, ça se lit comme un tableau
    simplement cassé. Corrigé en reprenant le motif déjà utilisé par le vrai `SignTable`
    React du site (`.table-scroll{overflow-x:auto}` + table sans centrage forcé, `src/index.css`
    ligne 484) : `.table-zone` perd `display:flex;justify-content:center` (simple
    `overflow-x:auto` de bloc), et `table.grille` gagne `margin:0 auto` — centrée quand elle tient
    dans l'écran, mais démarre à gauche (étiquette de ligne visible en premier, défilement
    seulement vers la droite) dès qu'elle déborde, comme n'importe quel tableau qu'on lit de
    gauche à droite.
  Vérifié : script Playwright dédié changeant le symbole en direct sur
  `inequation-exponentielle-widget` (`< k`) — capture d'écran confirmant le segment gauche
  maintenant vert, cohérent avec le surlignage d'axe ; inspection programmatique des 4 segments de
  `signe-produit-widget` en `> 0` (`]-\infty;0[` rouge, `]0;1[` vert, `]1;3[` rouge, `]3;+\infty[`
  vert — recoupé à la main avec $S=]0;1[\cup]3;+\infty[$) ; capture d'écran mobile (390px,
  `signe-trinome-widget` en `< 0`) confirmant le tableau entier visible sans défilement, étiquette
  "signe de f(x)" et les 3 colonnes de bornes toutes à l'écran. `tsc -p tsconfig.app.json
  --noEmit`/`oxlint` (4 fichiers)/`npm run build` propres ; re-passage du script Playwright dédié
  du correctif précédent (14 widgets × 2 thèmes, `0` échec) et de `regress_all.mjs` sur les 23
  chapitres (`0` erreur) pour confirmer l'absence de régression.

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : 4 nouveaux widgets interactifs,
  proposés puis validés explicitement (même mécanisme que pour les chapitres précédents),
  identifiés dans les 4 sections qui n'avaient encore aucun atelier alors que le chapitre en
  comptait déjà 3 (`archimede-widget`, `cercle-trigo-widget`, `sinusoide-widget`, non retouchés).
  - **`extremums-sinusoide-widget`** — section 6 (Extremums), inséré juste après l'astuce
    « relis toujours la question », avant l'entraînement. Curseurs A, ω, φ, b pour
    $f(x)=A\sin(\omega x+\varphi)+b$, sélecteur maximums/minimums/réunis, DEUX panneaux (même
    langage visuel que `cercle-trigo-widget`) : à gauche un cercle trigonométrique montrant que
    les deux points $u=\pi/2$ (max, $\sin u=1$) et $u=-\pi/2$ (min, $\sin u=-1$) restent
    **TOUJOURS** aux deux mêmes positions sur le cercle — un diamètre (« π rad ») les relie
    quand ils sont réunis — quels que soient A/ω/φ/b réglés ; à droite le graphe de f avec les
    marqueurs d'extremums réels (couleurs `accent`/`good` reprises telles quelles de
    l'illustration statique déjà présente dans cette section) et une lecture directe de la
    période effective (mesure demandée explicitement par l'utilisateur : « en faisant le lien
    équivalent avec un cercle trigonométrique où on retrouve ces paramètres »). Fenêtre du
    graphe FIXE ($x\in[-10;10]$, $y\in[-6;6]$, borné par le pire cas $A_{max}+|b|_{max}=5$) —
    jamais recalculée depuis les curseurs, conformément à la règle déjà renforcée dans les
    correctifs précédents.
  - **`modele-sinusoidal-widget`** — section 7 (Modéliser), inséré juste après l'astuce de
    vérification par une deuxième donnée, avant l'entraînement. Reprend **exactement** la
    méthode de la section (jamais une variante) : curseurs rayon $r$, hauteur du centre $h$,
    période $T$ — $A=r$, $b=h$, $\omega=2\pi/T$ toujours calculés, jamais réglables directement.
    Un sélecteur de position de départ (bas/haut/mi-hauteur montant/descendant) — $\varphi$ n'est
    **jamais** un curseur libre : il est toujours DÉDUIT de la position choisie
    ($-\pi/2,\pi/2,0,\pi$), pour ne jamais contredire le principe pédagogique central de cette
    section (φ vient d'une condition initiale, pas d'un réglage arbitraire). Panneau cercle
    (position de départ sur la roue, même convention d'orientation que `cercle-trigo-widget` :
    point $=(cx+R\cos\varphi, cy-R\sin\varphi)$) + panneau courbe (hauteur(t), lignes min/max,
    point à $t=0$ et point de vérification à $t=T/2$, reprenant l'astuce du demi-tour). Réglages
    par défaut ($r=15,h=17,T=8$, départ bas) reproduisent **exactement** l'exemple résolu de la
    grande roue déjà dans le contenu ($\omega\approx\pi/4$, $\varphi\approx-\pi/2$, max=32,
    min=2, vérifié à $t=4$) — confirmé à l'écran. Fenêtre du graphe FIXE ($x\in[0;24]$,
    $y\in[-2;42]$, pire cas $h_{max}+r_{max}=40$ / $h_{min}-r_{max}=0$).
  - **`equation-trig-widget`** — section 8 (Équations), inséré juste après l'exemple résolu
    « deux familles de solutions », avant le piège sur la division par a. Sélecteur sin/cos/tan,
    curseurs a, b (en **multiples de π**, pour rester dans des angles usuels), k. Panneau cercle
    unique reprenant **exactement** la convention des 3 illustrations statiques déjà présentes
    dans cette section (`circleAngles` : points reliés par une corde, ligne de repère
    horizontale $y=k$ pour sin / verticale $x=k$ pour cos, rien pour tan) — le cercle ne dépend
    **jamais** de a ni b (seule sa traduction en x, affichée juste en dessous, en dépend), ce qui
    matérialise directement le principe demandé. Bornes de k volontairement élargies à
    $[-1{,}3;1{,}3]$ pour sin/cos (au lieu de rester strictement dans $[-1;1]$) : glisser k
    au-delà de 1 fait apparaître « |k| > 1 : aucune solution » directement sur le cercle et dans
    le texte, réutilisant l'Attention déjà présente dans le contenu plutôt que de la contredire
    en l'empêchant d'arriver. Résultat texte multi-lignes (α, x₁/x₂ ou x pour tan, avec la
    période $2\pi/a$ ou $\pi/a$ déjà divisée — le piège de la section, donc jamais reproduit ici).
  - **`secteur-segment-widget`** — section 3 (Problèmes de géométrie du cercle, pas la section 2
    « Polygones » malgré la proposition initiale qui visait les deux : celle-ci calcule
    spécifiquement secteur/triangle/segment/corde, exactement ce que fait ce widget), inséré
    juste après l'astuce sur le triangle isocèle, avant l'entraînement. Curseurs n (nombre de
    côtés, 3 à 12) et r (rayon). Diagramme : polygone régulier inscrit en trait fin, secteur OAB
    mis en évidence (rayons OA/OB, corde AB, petit arc θ étiqueté), segment circulaire (entre la
    corde et l'arc) rempli en couleur via un path SVG arc+ligne+Z. 4 stats (aire secteur, aire
    triangle, aire segment, corde AB) puis une ligne de **vérification en direct** de l'astuce
    déjà donnée dans le contenu ($n\times$segment = cercle − polygone), toujours cohérente quels
    que soient n et r (vérifié analytiquement, pas juste affiché). Réglages par défaut ($n=6,r=4$)
    reproduisent **exactement** l'exemple résolu de l'hexagone déjà dans le contenu (secteur
    8,38 ; triangle 6,93 ; segment 1,45 ; vérification 8,70=8,70) — confirmé à l'écran. Testé
    aussi aux bornes n=3 (triangle, grand segment) et n=12 (dodécagone, segment fin) : aucune
    erreur, tracé cohérent dans les deux cas.
  Vérifié : script Playwright dédié (chromium headless, `vite preview`, défilement complet de la
  page pour déclencher le montage paresseux des 4 nouveaux ateliers — `IntersectionObserver`,
  `BlockRenderer.tsx`) sur la page, thèmes clair ET sombre — `0` erreur console/page pour les 4 ;
  captures d'écran réelles confirmant chaque widget (recoupées à la main avec les exemples
  résolus du contenu, comme détaillé ci-dessus, pour `modele-sinusoidal-widget` et
  `secteur-segment-widget`) ; positions des lignes `.axe`/`line.axe` identiques avant/après un
  glissement simultané de TOUS les curseurs à 85% de leur course, sur les 3 widgets à fenêtre
  fixe (`extremums-sinusoide-widget` — cercle ET graphe, `modele-sinusoidal-widget` — graphe,
  `equation-trig-widget` — cercle) ; état « aucune solution » de `equation-trig-widget` testé en
  poussant k à 1,25 (capture confirmant le message sur le cercle ET dans le texte). `tsc -p
  tsconfig.app.json --noEmit`/`oxlint` (8 fichiers .js + les 3 fichiers TS/TSX modifiés)/
  `npm run build` propres ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0`
  `NaN`, `0` `$` isolé.

- **5e (4h), Chapitre 3 — Suites** (`suites`) **et 4e, Chapitre 3 — Caractéristiques d'une
  fonction et fonctions de référence** (`caracteristiques-fonctions-reference`) : 6 nouveaux
  widgets (3 par chapitre), proposés puis validés explicitement (même mécanisme que pour les
  chapitres précédents), avec la demande explicite de « respecter les détails (axes,
  annotations, etc.) » — donc appliqués dès la première passe (pas en correctif après coup) :
  flèches sur tous les axes, aucune fenêtre recalculée depuis un curseur librement déplacé
  (seulement depuis un sélecteur de famille/mode, jamais depuis le paramètre en cours de
  démonstration), couleurs cohérentes avec la solution/le piège affiché (jamais un critère fixe
  déconnecté du symbole ou du cas choisi). Aucun des deux chapitres n'avait encore d'atelier.
  - **`suite-recurrente-affine-widget`** (section « Suite récurrente affine »), inséré juste
    après l'Attention « toujours vérifier |a|<1 avant de calculer L », avant l'astuce sur le
    calcul pas à pas. Curseurs A, b, u₁ (a exclu à 1 pile, curseur repoussé, même technique que
    ailleurs) ; la ligne L=b/(1−a) est **toujours** tracée (la formule donne toujours un
    nombre) mais bascule en rouge dès que |a|≥1, avec le texte « ce nombre n'est PAS une limite »
    — visualise exactement le piège du texte. Réglages par défaut (a=0,7 ; b=3 ; u₁=1)
    reproduisent exactement l'exemple résolu de la dilution (termes et L=10 identiques,
    confirmé à l'écran). Étiquette de la ligne L décalée automatiquement vers le bas quand elle
    croiserait celle du dernier terme (même parade que `SequencePlot.tsx`).
  - **`convergence-suite-widget`** (section « Convergence »), inséré juste après l'illustration
    `sequencePlot` existante, avant le sous-titre sur le cas quelconque. Sélecteur
    arithmétique/géométrique, curseur de raison (r ou q, q allant jusqu'à ±2 pour atteindre
    q=−1 pile et au-delà), classification en direct reprenant mot pour mot les deux
    `featureTable` de la section ; points et connecteur passent en rouge sur q=−1 et q<−1 (les
    deux cas de l'Attention « ne diverge PAS vers l'infini »), verts/neutres sinon. Réglages par
    défaut (géométrique, q=0,65, u₁=6) reproduisent exactement les 9 termes de l'illustration
    statique déjà présente (confirmé à l'écran).
  - **`comparaison-suites-widget`** (section « Comparaison numérique »), inséré juste après
    l'Attention « deux pièges fréquents », avant l'entraînement. Curseurs population/croissance
    des deux villes, balayage sur 20 ans, repère lui-même le **premier** rang où B dépasse A en
    vérifiant explicitement le rang précédent (le premier piège du texte), puis traduit ce rang
    en année (le second piège). Réglages par défaut reproduisent exactement l'exemple résolu des
    deux villes (bascule n=13, année 2032, confirmé à l'écran).
  - **`transformation-8-parametres-widget`** (section « Transformer »), inséré juste après
    l'astuce « SOX et SOY se confondent parfois », avant la vidéo. Sélecteur des 6 familles,
    curseurs TH/TV/CH·EH/EV·CV (CH/EH et EV/CV chacun combinés en un seul facteur positif,
    conformément à la colonne « Effet » du featureTable qui les traite déjà comme un seul
    cadran), cases SOX/SOY séparées. Le point caractéristique (marqueur violet) reste
    **toujours** exactement en x=TH quels que soient les autres réglages — matérialise l'astuce
    du même nom ; testé en changeant CH/EH/EV/CV/SOX/SOY sans jamais voir le point bouger.
    Testé aussi le piège du signe : famille cube, TH=−3, reproduit exactement l'exemple du texte
    $(x+3)^3$ (le point d'inflexion apparaît bien à gauche de l'origine, formule affichée
    "x+3,0" cohérente). Réglages par défaut (inverse, TH=3, TV=2) reproduisent l'exemple résolu
    $1/(x-3)+2$ (asymptotes en x=3 et y=2, confirmé à l'écran).
  - **`familles-parite-widget`** (bloc intro, juste après les 6 courbes statiques et juste avant
    l'astuce sur les fonctions réciproques). Sélecteur des 6 familles, curseur t>0 qui place un
    point (t;f(t)) et calcule son symétrique en −t : miroir vertical (axe Oy, ligne pointillée)
    pour les familles **paires**, droite passant par l'origine (symétrie centrale) pour les
    **impaires** — reprend explicitement l'image du texte (« miroir sur Oy » / « rotation d'un
    demi-tour »). Pour la racine carrée, aucun point symétrique n'est tracé : un message rouge
    explique que le domaine à sens unique ne contient pas −t (testé avec −t visible et hors
    fenêtre : le message et le marqueur ne s'affichent que quand −t est réellement dans le
    cadre).
  - **`inverse-monotonie-widget`** (bloc intro, juste après le Piège « l'inverse n'est pas
    décroissante sur ℝ\{0} », dernier bloc de l'intro). Deux points x₁, x₂ déplaçables
    **librement** sur tout le domaine (curseur repoussé loin de 0, même technique que pour a=1
    ailleurs) : même branche → confirmation verte de la décroissance locale ; branches
    différentes → verdict rouge reprenant mot pour mot le contre-exemple du texte. Réglages par
    défaut (x₁=−1, x₂=1) reproduisent exactement f(−1)=−1 et f(1)=1 du piège ; testé aussi le cas
    « même branche » (x₁=0,5, x₂=3 → confirmation verte).
  Vérifié : script Playwright dédié (chromium headless, défilement complet pour déclencher le
  montage paresseux) sur les 2 pages, thèmes clair ET sombre — `0` erreur console/page pour les
  6 ; positions des lignes `.axe` identiques avant/après un glissement simultané de TOUS les
  curseurs à 85% de leur course, sur les 6 widgets ; captures d'écran réelles recoupées à la
  main avec les exemples résolus et les valeurs des illustrations statiques déjà présentes dans
  chaque section (détaillé ci-dessus) ; les 2 états-piège (`q=−1`, `a≥1`) et le cas particulier
  `√x` (racine, sans parité) testés explicitement par capture. Un chevauchement d'étiquettes
  repéré à l'écran (la ligne L proche du dernier terme) corrigé en repoussant l'étiquette de L
  vers le bas quand elle est trop proche du dernier point, sur `suite-recurrente-affine-widget`
  ET `convergence-suite-widget` (même parade que `SequencePlot.tsx`, `Y_MIN`/`Y_MAX` inchangés).
  `tsc -p tsconfig.app.json --noEmit`/`oxlint` (12 fichiers .js + les 4 fichiers TS/TSX
  modifiés, `0` avertissement après retrait d'une variable inutilisée)/`npm run build` propres ;
  sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0` `NaN`, `0` `$` isolé.

- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), **5e (4h), Chapitre 4 —
  Limites et asymptotes** (`limites-asymptotes`) **et 6e (6h), Chapitre 4 — Intégrales et
  primitives** (`primitives-integrales`) : 9 nouveaux widgets (3 par chapitre), proposés puis
  validés explicitement (même mécanisme que les lots précédents). Aucun des trois chapitres
  n'avait encore d'atelier. Conventions du lot précédent reprises dès la première passe : flèches
  sur tous les axes, fenêtres jamais recalculées depuis un curseur librement déplacé.
  - **`seuil-cumule-widget`** (4e, section « Médiane, quartiles et mode »), inséré juste après
    l'exemple résolu (n=20, xᵢ=2/6/9/12), avant la méthode d'interpolation par classes. 4
    curseurs d'effectifs, sélecteur médiane/Q1/Q3, tableau des cumulés construit en direct :
    la ligne dont le cumulé égale PILE le seuil se surligne en rouge (« pas encore ! »), la
    première qui le dépasse en vert. Réglages par défaut (5,8,4,3) reproduisent exactement
    l'exemple résolu — Q1 sélectionné reproduit même le cas-piège exact du texte (cumulé=5=seuil).
  - **`frontiere-classe-widget`** (4e, section « Histogramme »), inséré avant l'entraînement.
    Point x déplaçable sur les 4 classes de l'exemple ([0;2[…[6;8]) : dès qu'il tombe pile sur
    une frontière, verdict rouge précisant la classe qui COMMENCE ici (jamais celle qui se
    termine) — avec le cas particulier x=8 (borne supérieure de la toute dernière classe, qui
    l'inclut par exception) testé et confirmé séparément par capture.
  - **`dispersion-comparee-widget`** (4e, section « Dispersion »), inséré avant l'entraînement.
    Curseur d (demi-écart), série symétrique x̄−d/x̄+d à effectif égal — x̄=12 reste TOUJOURS fixe
    (repère violet immobile) pendant que d change variance (=d²) et écart-type (=d) en direct.
    d=8 reproduit exactement l'exemple narratif de l'intro (moitié à 4, moitié à 20), confirmé à
    l'écran ; cette section n'avait auparavant aucune illustration, seulement un texte.
  - **`point-vide-ou-asymptote-widget`** (5e, section « Limites, reconnaissance et calcul »),
    inséré juste après le piège « Diviser par (x−a) n'est valable que pour x≠a ». f(x)=(x−r1)
    (x−r2)/(x+3), 2 curseurs de racines : dès que l'une vaut −3, un rond creux vert (point vide)
    apparaît et une droite se dessine ; sinon, une ligne violette pointillée (vraie asymptote)
    avec la courbe qui diverge de part et d'autre. Réglages par défaut (r1=−3, r2=3) reproduisent
    exactement l'exemple résolu (x²−9)/(x+3), limite=−6. Testé aussi un tirage extrême (r1=1,
    r2=3) qui clippe entièrement une branche hors fenêtre — comportement attendu (fenêtre fixe),
    confirmé qu'un tirage modéré (r1=−2) montre bien les deux branches.
  - **`degre-asymptote-widget`** (5e, section « Asymptote oblique »), inséré après l'astuce
    « vérifier le degré avant de se lancer », avant l'entraînement. Dénominateur x−1 fixe,
    sélecteur du DEGRÉ du numérateur (0 à 3, 4 presets fixes) : reproduit en direct les 4 cas de
    la méthode (y=0 ; horizontale par les coefficients dominants ; oblique ; aucune asymptote de
    cette forme, testés tous les 4 par capture). Degré 2 (par défaut) reproduit exactement
    l'exemple résolu (x²−3x+5)/(x−1) → y=x−2.
  - **`plancher-plafond-widget`** (5e, section « Limites et asymptotes en contexte »), inséré
    avant l'entraînement. Curseurs F (coût fixe) et v (coût variable), point x déplaçable :
    l'écart au plancher affiché reste toujours strictement positif, quel que soit x. Réglages par
    défaut (F=240, v=8) reproduisent exactement l'exemple résolu du coût unitaire.
  - **`famille-primitives-widget`** (6e, section « Calcul de primitives »), inséré juste après
    l'illustration statique des 3 primitives (C=−2/0/2), avant la notation intégrale indéfinie.
    Curseur C pour F(x)=x²+C : un petit segment tangent en x=1 (pente 2, toujours) reste
    horizontalement immobile pendant que la courbe glisse verticalement — matérialise
    littéralement l'intuition du texte (« fais-la glisser verticalement… la pente ne change
    jamais »). Testé C=2 : reproduit exactement la 3e courbe de l'illustration statique.
  - **`condition-initiale-widget`** (6e, section « Quelle primitive ? »), inséré juste après le
    piège central (« oublier C dès le premier calcul »). Point (x₀;y₀) déplaçable (couleur rouge/
    bad, reprise de l'illustration statique existante), C=y₀−x₀² résolu en direct, courbe active
    tracée sur fond de primitives fanées de la même famille. Réglages par défaut (1;4)
    reproduisent exactement l'illustration statique (C=3), confirmé à l'écran.
  - **`sommes-riemann-widget`** (6e, section « Intégrales définies »), inséré juste après
    l'exemple résolu des trapèzes (∫₀⁴x²dx≈22 contre 64/3≈21,33), avant la sous-section valeur
    moyenne. Curseur n (1 à 20), sélecteur minorant/majorant/trapèzes : rectangles ou trapèzes
    redessinés en direct, erreur par rapport à la valeur exacte affichée. n=4 en trapèzes
    reproduit exactement l'exemple résolu (22,00 contre 21,33) ; testé aussi n=20 (erreur
    tombant de 0,667 à 0,027 — « plus n est grand, plus c'est précis », littéralement vérifié) et
    le mode minorant (14,00, sous-estimation confirmée, cohérent avec l'illustration statique).
  Vérifié : script Playwright dédié (chromium headless, défilement complet pour déclencher le
  montage paresseux des ateliers) sur les 3 pages, thèmes clair ET sombre — `0` erreur console/
  page pour les 9 ; positions des lignes `.axe` identiques avant/après un glissement simultané de
  tous les curseurs (les widgets sans SVG/axes cartésiens — tableau ou droite graduée — vérifiés
  séparément, stables par construction) ; captures d'écran réelles recoupées à la main avec les
  exemples résolus et illustrations statiques déjà présents dans chaque section, comme détaillé
  ci-dessus ; les cas-pièges et cas limites testés explicitement par capture pour chacun des 9
  (seuil pile, frontière x=4 ET x=8, d=8, point-vide/vraie-asymptote/branche clippée, les 4 degrés,
  n=20 vs n=4, mode minorant). `tsc -p tsconfig.app.json --noEmit`/`oxlint` (18 fichiers .js + les
  5 fichiers TS/TSX modifiés, `0` avertissement après retrait de 2 variables inutilisées)/
  `npm run build` propres ; sitewide `regress_all.mjs` sur les 23 chapitres : `0` erreur, `0`
  `NaN`, `0` `$` isolé.
