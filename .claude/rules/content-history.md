---
paths:
  - "src/content/chapters/**"
---

# État actuel du contenu

- **5e (4h), Chapitre 1 — Fonctions : rappels et compléments** (`fonctions-composees`) : migré en
  intégralité, texte et illustrations. Les illustrations graphiques (droites graduées du domaine,
  diagrammes $C_f$/$C_g$, graphe de $h(r)$) ont été reconstituées à partir de l'artifact original
  (et non redessinées à l'aveugle depuis une extraction de texte).
  **Lot G (nouveaux générateurs, audit du 5e ch. 1)** : cartes 5gen59 « Lire domaine et image sur un
  graphique » en § 1 (après 5gen1), 5gen60 « Composée en un point » en § 2 (après 5gen2), 5gen58
  « Détective d'erreurs : fonctions et composées » en § 4 (après 5gen4) ; registres (`registry.ts`,
  `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus 1 / 2 / 3).
  Descriptions de carte en Unicode (f∘g, ∞), jamais de `$…$`. Détail : `.claude/rules/feuilles-evaluations.md`,
  « 5e ch. 1, lot G ».
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
  **Complété une 3e fois** : les widgets interactifs de l'artifact d'origine (jusque-là laissés de
  côté lors de la migration initiale) portés dans `src/interactive/` et embarqués dans le chapitre
  — voir « Widgets interactifs portés » (`.claude/rules/interactive-widgets.md`) pour le mécanisme.
  `parabole-widget` ("Manipule toi-même — fais varier a, b et c") inséré avant "Domaine et image" ;
  `transformations-widget` ("Manipule toi-même — fais varier TH, EV/CV et TV") inséré avant la
  vidéo "Transformations graphiques d'une parabole" dans "Étirement, compression et symétrie" ;
  **Correction (audit du 4e ch. 1)** : le portage de `gen7-widget` et `gen8-widget` dans les cartes
  gen7/gen8 (`widgetTag`, commit `0d61389`) n'a **jamais été fusionné** dans la branche principale
  — ni fichiers dans `src/interactive/`, ni `widgetTag` sur les cartes. L'utilisateur a décidé de
  ne pas les porter (anciennes versions d'artifact, sans les règles communes) : les cartes gen7 et
  gen8 renvoient seulement au générateur. Les deux ateliers `parabole-widget` et
  `transformations-widget`, eux, sont bien en place.
  `gen7-widget` et `gen8-widget` embarqués directement dans les cartes `entrainement` gen7/gen8
  existantes (`widgetTag`), en plus — jamais à la place — du lien vers la version hébergée sur
  plateforme-maths. Vérifié par rendu navigateur réel (`vite preview`, Playwright) : les 4 widgets
  présents dans le DOM et fonctionnels (captures à l'écran des 4 : sliders a/b/c et TH/EV/CV/TV
  réactifs, exercice gen7 "coefficients" jouable, exercice gen8 "transformations graphiques" jouable
  avec graphe Mafs cible et saisie), aucune erreur JS console, `tsc -b`/`npm run lint`/`npm run
  build` propres.
  **Lot H (nouveaux générateurs, audit du 4e ch. 1)** : cartes gen126 « Trois écritures d'une
  parabole » et gen128 « Associer paraboles et équations » en § 2 (après gen9), gen127 « Détective
  d'erreurs : fonction du second degré » en § 4 (après le quiz gen60) ; registres
  (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`,
  processus 2 / 3 / 2). Notation du cours : a(x − x_S)² + y_S, S(x_S ; y_S), im f ; aucun « Δ ».
  Détail papier : `.claude/rules/feuilles-evaluations.md`, « 4e ch. 1, lot H ».
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
  **Lot G (nouveaux générateurs, audit du 6e ch. 1), 6gen156–6gen159** : cartes 6gen159 « Restreindre
  pour inverser » en § 2 (après 6gen2), 6gen156 « Problèmes avec arcfonctions » en § 4 (après 6gen4),
  6gen158 « Lire une transformée c + k·arc(mx + n) » puis 6gen157 « Étude d'une fonction
  cyclométrique » en fin de § 5 (après 6gen5 ; le § 6 « étudier une fonction cyclométrique » n'existait
  pas encore dans la branche de ce lot : la carte de 6gen157 est à déplacer quand il sera créé) ;
  registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`,
  processus 3 / 3 / 2 / 2, sections `derivees`, `graphiques`, `graphiques`, `cyclometriques`).
  Détail papier : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 1, lot G — 6gen156–6gen159 ».
  **Lots B, C, E de l'audit (6gen1–6gen5)** : règles communes (saisie illisible et valeur approchée
  sans tentative, choix fermés à 1 tentative, aides KaTeX sans la réponse, messages ciblés, π et √
  lus), 6gen5 en deux temps (graphique puis justification), constantes exactes en 6gen5 E,
  coefficients bridés en 6gen3 variante 4, verdicts équilibrés (6gen1 a/c, 6gen2, 6gen5 parité),
  libellé « C. Argument en x² » ; aucune carte du chapitre modifiée. Détail : `.claude/rules/feuilles-evaluations.md`,
  « Textes : écran vs papier », paragraphe « 6e ch. 1 (lots B, C, E) ».
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
  **Lot H, première moitié (6gen100–6gen104, nouveaux générateurs)** : cartes 6gen100 « Quelle formule ?
  Reconnaître le groupement », 6gen101 « Factorielles et équations combinatoires » et 6gen104 « Étoiles et
  barres » en FIN de § 1 (après 6gen43), 6gen103 « Anagrammes et contraintes » en fin de § 2 (après 6gen44),
  6gen102 « Triangle de Pascal et propriétés » en fin de § 3 (après 6gen45). Deux courts blocs de cours, juste
  avant leur carte (le cours ne les traitait pas) : `methode` « Méthode — résoudre une équation combinatoire »
  (réécrire en polynôme, résoudre, garder la solution naturelle ; symétrie Cₙᵖ = Cₙ^q ⇒ n = p + q) avant
  6gen101, `astuce` « Au moins un objet par case » (Γₙ^{p−n} = C₍ₚ₋₁₎ⁿ⁻¹, 10 bonbons / 4 enfants : 84) avant
  6gen104 ; aucun `exemple` ajouté (rien dans `ENONCES_DEMONSTRATION`). Le reste du cours (complément, blocs,
  2ⁿ parties, étoiles et barres) est écrit par l'agent du cours (lot F). Registres (`registry.ts`,
  `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus 2 / 2 / 1 / 2 / 2,
  sections `denombrementfondamental`, `denombrementfondamental`, `binomenewton`, `denombrementcombine`,
  `denombrementfondamental`). Descriptions de carte en Unicode (Aₙ², Γₙᵖ, x₁), jamais de `$…$`. Détail :
  `.claude/rules/feuilles-evaluations.md`, « 6e ch. 7, lot H — 6gen100–6gen104 ».
  **Audit appliqué, lots A, F, D et parcours (25/11, agent AFD)** — lot A : trois dés attribués à **Galilée** (cours,
  carte 6gen46, question de compréhension, quiz ; renvoi au ch. 6), P(0) = 0,1291 (la « somme 1,0001 » venait de
  l'erreur), Newton (découverte vers 1665, lettres à Leibniz en 1676, imprimé par Wallis en 1685), Kramp sans
  l'anecdote du « cri » (Arbogast, notation anglaise), image du triangle = **Zhu Shijie** 1303 (al-Karaji, Jia Xian,
  Apianus, Stifel, Tartaglia ; traité de Pascal écrit en 1654, publié en 1665), foudre « au cours d'une vie », mot de
  passe ≈ 1,6 milliard de fois plus grand, ADN ($4^L$ contre une composition fixée), piège du comité mixte,
  **Mississippi** (11 lettres, 34 650 permutations, 34 649 anagrammes ; tuiles et quiz), notation n / p / k / r,
  35 virgules `{,}`, champs bruts en Unicode, méthode « 3 questions » numérotée de 1 à 3, Pascal pour 1 ≤ k ≤ n − 1,
  collier n ≥ 3, $n\varepsilon$ petit (attention : $1{,}01^{100} \approx 2{,}705$), « séparer les doubles » relié à
  Γ + attention « issues non équiprobables », tableau binomial transposé, axes de la somme de ligne, légende des
  séquences raccourcie ; composants : `PascalTriangle` (le 10 « fantôme » = trait CSS `.svg-good` sur le texte,
  `style={{ stroke: 'none' }}`), `CircularPermutation` (axe du collier par les milieux de deux côtés, étiquette
  « rotation » + pointe de flèche). Séquence exacte sans remise déplacée au § 5 (décision ; § 5 « … et séquence
  exacte », § 6 « Probabilité binomiale (épreuves indépendantes) »). Lot F : 16 exemples sans énoncé réécrits (énoncé
  en contexte, titre qui dit ce qu'on fait, plus de 2e cas dans le cadre résultat), démonstrations (a)–(l), § 1
  séparation des cas, équations combinatoires, cornets et « au moins un de chaque » ; § 2 groupes non nommés, bloc,
  complément (piège « une femme imposée »), inclusion-exclusion ; § 3 chemins dans un quadrillage (`vectorPlane`
  quadrillé), terme indépendant ; § 4 partition complète du poker (full 1 344, sans répétition 57 344, total
  201 376), historique Galilée, symétrie $s \leftrightarrow 21-s$ ; § 6 « Ce que tu sais déjà » ($N_k = C_n^k$),
  Bernoulli, symétrie pour $p = 0{,}5$, renvoi au ch. 8 ; formulaire et synthèse complétés ; 57 énoncés par clé.
  Parcours : 3 parties (« Compter : les outils » § 1–2, « Le binôme et les problèmes » § 3–4, « Des comptages aux
  probabilités » § 5–6), 6 `titreCourt`, 15 phrases d'`essentiel`, 21 cartes. Formules longues coupées en plusieurs
  `$…$` (aucune ne défile plus à 390 px, tiroirs ouverts). Les cartes des générateurs 6gen100–109 et les ateliers
  sont ajoutés par d'autres agents. Détail : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 7, lots A, F, D ».
  **Lot H, seconde moitié (6gen105–6gen109, nouveaux générateurs, agent H2)** : cartes 6gen105 « Au moins un : le
  complément » en fin de § 2 (après 6gen44) ; 6gen107 « Terme indépendant » en fin de § 3, précédée d'un `methode`
  « Méthode — terme indépendant de x » (terme général, exposant de x, k entier ou « aucun », exemple
  (x² − 2/x)⁹ → 5376) ; 6gen106 « Chemins dans un quadrillage » en fin de § 4, précédée d'un `methode` « Méthode —
  chemins dans un quadrillage » (mot de m + n flèches, C₍ₘ₊ₙ₎ⁿ, passer par P = produit, éviter P = complément) ;
  6gen108 « Avec ou sans remise ? Choisir le modèle » puis 6gen109 « Détective d'erreurs : analyse combinatoire » en
  fin de § 6 (avant la vidéo de synthèse). Aucun `exemple` ajouté (donc rien dans `ENONCES_DEMONSTRATION`) ;
  registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus
  3 / 3 / 2 / 3 / 3, sections `denombrementcombine`, `denombrementproblemes`, `binomenewton`, `binomialesequence` ×2).
  Descriptions de carte en texte brut. Détail : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 7, lot H2 ».

- **6e (6h), Chapitre 8 — Variables aléatoires et lois de probabilités** (`variables-aleatoires`) :
  **audit appliqué, lots A, F, D et parcours (25/11, agent AFD)** — lot A : loi uniforme discrète réservée aux
  valeurs 1, …, n (cas général à pas h), figure « contrôle qualité » refaite avec les vraies valeurs de
  𝓑(200 ; 0,02) ($P(X\leq5)\approx0{,}787$, pont vers Poisson $0{,}785$), règle empirique 68,27 / 95,45 / 99,73 %
  (un côté 15,87 / 2,28 / 0,13 %), approximation normale avec correction de continuité, Bortkiewicz économiste
  (de Moivre 1711), cumuls de Poisson recalculés sur les valeurs non arrondies, légende de 𝓑(5 ; 0,4) (sommet à
  gauche, queue à droite), « fini ou dénombrable », cartes des générateurs alignées sur les lots B / C, Poisson
  défini par l'indépendance et le taux constant (la rareté ne sert qu'à l'approximation), normalité
  « acceptée » et non démontrée, conditions d'approximation = conventions, ponts « Ce que tu sais déjà » vers les
  ch. 6 et 7, ≈ 200 virgules `{,}`, formulaire regroupé (9 groupes) et complété, synthèse alignée ; figures :
  escalier à points pleins / vides (`stepFunction.pointsAuxSauts`, ajout optionnel), « trouver n » et
  𝒩(50 ; 10) à abscisse décalée (l'axe vertical sortait du cadre), Poisson λ = 4 au centième, Φ(1,5) dégagé,
  arbre complet S / non S, `ProductAreaSquare` (nom d'axe vertical remonté de 6 px, seul usage), espérance de
  vie réaliste. Lot F : 15 démonstrations, tous les exemples avec énoncé et titre parlant (45 énoncés par clé),
  cours écrit pour 6gen110–122 (Y = aX + b, répartition discrète et continue, densité à une constante près,
  discrète ou continue, loi uniforme : bus, intervalle qui déborde, retrouver a et b ; lecture de la table,
  effectif attendu, P(0 ≤ Z ≤ t), retrouver μ ou σ ; correction de continuité ; Poisson : λ inconnu, valeur la
  plus probable, seuil d'alerte ; choix du modèle), **table de Φ complète** (bloc `tablePhi`, voir
  `.claude/rules/feuilles-evaluations.md`), effet de σ, historiques de Moivre / Gauss / Laplace et Bayes / Price,
  applications « tolérance d'usinage » (§ 6) et « marge d'erreur d'un sondage » (§ 7), banque « Formule ».
  Parcours : 3 parties (« Lois discrètes : compter et pondérer » § 1–2, « Lois continues : des aires sous une
  courbe » § 3–6, « Combiner, approcher, choisir » § 7–8), 8 kickers et `titreCourt`, 21 phrases d'`essentiel`,
  27 cartes. Formules longues coupées en plusieurs `$…$` (aucune ne défile à 390 px). Lot D : quiz 6gen71 (voir
  `.claude/rules/feuilles-evaluations.md`, « 6e ch. 8, lots A, F, D »). Les cartes 6gen110–122 et les ateliers
  sont ajoutés par d'autres agents.

- **6e (6h), Chapitre 9 — Lieux géométriques** (`lieux-geometriques`) : **audit appliqué, lots A, F, D et parcours
  (25/11, agent AFD)** — lot A : natures d'un lieu en liste OUVERTE (demi-droites, segment, cercle privé de points,
  polygone ; astroïde et coniques aussi), aire variable ($K$, $M$ définis en produits en croix — pas de « det » —,
  deux solutions symétriques par rapport au POINT $d\cap(AB)$, $d\parallel(AB)$ : toutes ou aucune), angle aigu
  $\tan\theta=\left|\frac{m_2-m_1}{1+m_1m_2}\right|$, cercle par 2 points (2 / 1 / 0 centres selon $2r$ et $AB$),
  historiques (Euclide : bissectrice, médiatrice, cercles inscrit / circonscrit ; Archimède pour le centre de gravité ;
  Fermat avec Descartes ; « Apollonius de Perga » comme au ch. 10 ; portrait « d'après Frans Hals »), GPS (4e satellite
  = horloge), § 4 renommé « Lieux par traduction directe », `\mathrm{dist}`, $|x|^{2/3}+|y|^{2/3}=1$. **Figures** :
  TOUTES isotropes (domaine au rapport exact 320/300 = 16/15 : un cercle reste rond, un angle droit reste droit,
  marqueurs d'angle droit ajoutés), recadrées (aucune étiquette rognée, aucun cercle hors cadre ; contrôle `check.mjs` du
  dossier `afd-6e9`), radar = ARC CAPABLE (cercle par A, B et P, angle 45°), parasite avec les vraies perpendiculaires,
  points CREUX pour les extrémités exclues (`vectorPlane.points[].open`, ajout optionnel), bande et carré plein teintés
  (`regions`), demi-droites jusqu'au bord. Lot F : sous-section « Les points remarquables du triangle : G, O, H et la
  droite d'Euler » au § 1 (exemple A(0 ; 0), B(8 ; 0), C(1 ; 7) : O(4 ; 3), R = 5, H(1 ; 1), G(3 ; 7/3) ; cas rectangle et
  obtusangle ; cercle des neuf points N(2,5 ; 2), rayon R/2 ; historique Euler 1765 / Brianchon et Poncelet 1821 /
  Feuerbach 1822 / Terquem 1842) — tout le reste du § 1 GARDÉ (décision 2). 19 démonstrations (`exempleLibre`
  « Démonstration — … ») : distance point–droite, médianes, médiatrice = lieu, médiatrices, hauteurs (repère A(a ; 0),
  B(b ; 0), C(0 ; c), H(0 ; −ab/c)), droite d'Euler, neuf points, bissectrice (aires), incentre, PT, parallélogramme,
  Varignon, médiane du triangle rectangle, Thalès (sens direct, § 3), théorème de la médiane, PA² − PB² = k,
  Apollonius, bissectrices de deux droites, angle droit = cercle privé de A et B (§ 4). Cours écrit pour 6gen54–57 et
  6gen123–131 : repère qui ne perd pas la généralité (+ piège B(a ; 0), C(a ; c)), méthode « démontrer un lieu » (deux
  inclusions, équivalences, points exclus, lieu complet ou partie) aux § 4 et § 6, droites équidistantes de deux
  points, carré par rotation de 90°, rayon réfléchi, m(x² + y²) cercle / point / vide, corde, cercle tangent à un axe,
  centre sur une droite, exinscrits (J_A, aire/(p − a)), position droite–cercle, tangente en un point, tangentes par
  a(x − x_P) + b(y − y_P) = 0 (exemple P(5 ; 3) : tangente verticale x = 5), seuil 4c / carré plein / octogone, α et 2α
  (substitution, demi-cercle privé de ses extrémités), échelle qui glisse, centre de gravité mobile, arc de parabole,
  droite privée d'un point, demi-parabole. Énoncés par clé des 48 blocs, banque « Formule » (32 questions). Parcours :
  3 parties (« Le triangle et le cercle en coordonnées » § 1–2, « Démontrer et traduire » § 3–4, « Lieux en mouvement :
  un paramètre à éliminer » § 5–6), 6 `titreCourt`, 15 phrases d'`essentiel`, 21 cartes. Formules longues coupées en
  plusieurs `$…$` (aucune ne sort de son bloc à 390 px). Lot D : quiz 6gen72 (voir `.claude/rules/feuilles-evaluations.md`,
  « 6e ch. 9, lots A, F, D »). Les cartes 6gen54 (renommée par le lot C), 6gen123–131 et les ateliers sont ajoutés par
  d'autres agents.

- **6e (6h), Chapitre 10 — Les coniques** (`coniques`) : **audit appliqué, lots A, F, D et parcours (25/11, agent
  AFD)** — lot A : erreurs C1–C12 corrigées, hyperbole d'axe focal VERTICAL (équation, foyers, asymptotes), convention
  unique $y^2=2px$ avec $p=\mathrm{dist}(F\,;d)$ partout (cours, formulaire, « Formule », quiz), tangente $16x+15y=100$,
  Cassegrain et LORAN refaits, lithotritie avec $2a$, formulaire et récapitulatif complétés, typographie (`\mathrm{dist}`,
  pas de majuscules d'insistance). **Figures** : toutes isotropes (domaine 16/15), aucune courbe hors cadre (bornes
  `yMin`/`yMax`, branches d'hyperbole par `curvesOfY`), aucune étiquette sur un tracé (contrôle `check.mjs` du dossier
  `afd-6e10`), miroirs elliptique et hyperbolique en deux figures pleine largeur. Lot F : 18 démonstrations
  (`exempleLibre` « Démonstration — … », les 5 anciennes recodées) : parabole foyer–directrice, ellipse et hyperbole
  (équations réduites), ellipse = cercle « écrasé » de $\frac{b}{a}$, asymptotes, hyperbole équilatère $XY=\frac{a^2}{2}$
  (repère $X=\frac{x+y}{\sqrt2}$, $Y=\frac{x-y}{\sqrt2}$), foyer–directrice de l'ellipse et de l'hyperbole, Dandelin-Quételet
  (cas de l'ellipse), rayons focaux $a\mp ex$, aire du triangle focal $b^2\tan\frac{\theta}{2}$, sommets $(0\,;\pm b)$ à
  distance $a$ des foyers, pente et forme dédoublée des tangentes, condition de tangence $k^2=a^2m^2+b^2$, propriétés
  optiques (parabole : triangle $FPT$ isocèle ; ellipse : symétrique d'un foyer). Cours ajouté : « Ce que tu sais déjà
  (4e) », **cas dégénérés** (point, vide, deux droites ; sous-titre au § 2, réciproque fausse de l'équation générale),
  parabole décentrée $y^2-4y-8x+28=0$, méthode F / d / e (exemple F(0 ; 1), d ≡ y = 4, e = 1/2), périhélie / aphélie,
  tangentes de pente donnée et issues de P(0 ; 2) à $\frac{x^2}{8}+\frac{y^2}{2}=1$, intersection de deux coniques
  ($x^2+2y^2=41$ et $y^2-x^2=7$), miroir hyperbolique (P(15/4 ; 3), tangente $20x-9y=48$), antenne $\frac{D^2}{16h}$.
  Énoncés par clé des 35 blocs, banque « Formule » (26 questions). Parcours : 3 parties (« Trois courbes, un seul
  nombre e » § 1–2, « Distances, droites et tangentes » § 3–5, « Miroirs et applications » § 6), 6 `titreCourt`,
  18 phrases d'`essentiel`, 23 cartes ; descriptions des cartes 6gen58, 59, 61, 62, 63 alignées sur le cours. Formules
  longues coupées en plusieurs `$…$` (aucune ne défile à 390 px, tiroirs ouverts). Lot D : quiz 6gen73 (voir
  `.claude/rules/feuilles-evaluations.md`, « 6e ch. 10, lots A, F, D »). Les cartes 6gen132–143, les générateurs
  6gen58–63 et les ateliers sont ajoutés par d'autres agents.
  **Lot E (25/11)** : feuilles et évaluations définitives de 6gen58–6gen63 — corrigés « comme au tableau » partagés
  écran / papier (`generateurs6e/*/corrigeDetaille.ts`, brique `ui6e/corrigeConiques.ts`, renvois « cours, § n »,
  notations du cours réécrit), figure de la conique (tangentes, rayon réfléchi, points communs) sous le dernier
  résultat, énoncés papier sans méthode ni verdict, barèmes, niveaux, profils, regroupements ; adaptateur provisoire
  `adaptateurConiques.ts` supprimé. Détails : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 10 (lot E… ».

- **6e (6h), Chapitre 6 — corrigé « comme au tableau » et niveaux (6gen30–33, 6gen74–76)** : corrigés détaillés
  typés partagés écran / papier (`generateurs6e/*/corrigeDetaille.ts`, brique `ui6e/corrigeProbabilites.ts`),
  `criteresDifficulte` à la place des étoiles, profils `calcul` relus (aucun changement : rien n'est donné
  directement par la calculatrice). Détails : `.claude/rules/feuilles-evaluations.md`, section « Corrigé
  détaillé — comme au tableau ».
- **6e (6h), Chapitre 6 — Venn à trois ensembles (6gen30 famille C)** : § 1 gagne le sous-titre « Trois ensembles : du centre vers l'extérieur » (méthode + exemple résolu « trois langues sur 60 élèves », placé avant « Tableau à double entrée et complémentaire ») ; énoncé apparié dans `ENONCES_DEMONSTRATION`.
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
  **Lot G2 (6gen162–6gen163, nouveaux générateurs)** : bloc de cours « Probabilités géométriques : des aires au
  lieu de cas » en § 1 (après l'application météo, avant « Représenter A∪B et A∩B » — c'est le prolongement de
  « favorables / possibles » du § 1 : l'aire ou la longueur remplace le nombre de cas ; le § 4 traite les
  épreuves répétées) : `definition`, `illustrationGroup` de deux `vectorPlane` (cible et couronne, carré des
  rendez-vous et bande — extension additive `vectorPlane.regions` : polygone ou couronne ombrés), exemples
  « fléchette sur une cible » et « rendez-vous entre 12 h et 13 h » (énoncés par clé dans
  `ENONCES_DEMONSTRATION`), `piege` « rapport des rayons ». Cartes 6gen162 « Probabilités géométriques » en § 1
  (après 6gen75) et 6gen163 « Détective d'erreurs : probabilités » en § 4 (après 6gen76) ; registres
  (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus 2 / 3).
  `essentiel` / `cartes` non touchés (autre agent). Détail : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 6,
  lot G2 — 6gen162–6gen163 ».
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
  **Parcours (24/11, lot P)** : 2 parties (« Ensembles, arbres et tirages » § 1–2, « Bayes, épreuves
  répétées, problèmes » § 3–4), 4 `titreCourt`, 12 phrases d'`essentiel` reprises du cours (notation du
  cours : `P(A|B)`, `\bar{A}`, `\text{malade}` dans les formules), 16 cartes « Teste-toi » sur les
  exemples des sections (40 personnes, urne 5 R / 3 B, test médical 0,1 / 0,9 / 0,2, tireur p = 0,3,
  montage parallèle). Seuls les champs d'en-tête des sections ont changé, pas les `blocks`. Vérifié :
  carte, 4 étapes et Réviser à 390 / 1 280 px, clair / sombre — 0 `$` visible, 0 `.katex-error`.
  **Lot G (nouveaux générateurs, 6gen160–6gen161)** : cartes 6gen160 « Indépendants ou incompatibles ? » en § 3
  (après 6gen74) et 6gen161 « Quel jeu choisir ? » en § 4 (après 6gen76) ; registres (`registry.ts`,
  `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus 2 / 3, sections
  `independancebayes` / `probabilitesproblemes`). Aucun bloc de cours ajouté : « incompatibles ≠ indépendants »
  est déjà au § 1 (piège, tableau comparatif) et au § 3 (rappel + exemple résolu à trois issues) ; épreuves
  répétées, « au moins un » et arbres sans remise sont au § 2 et au § 4. Descriptions de carte en Unicode
  (P(A ∩ B)), jamais de `$…$`. Détail : `.claude/rules/feuilles-evaluations.md`, « Textes : écran vs papier »,
  paragraphe « 6e ch. 6, lot G ».

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
  **Lots B et C de l'audit (6gen54–6gen57, 25/11)** : générateurs refaits sur le socle du 6e ch. 7 (algèbre
  exacte, figures avec le lieu révélé après la réponse, verdicts équilibrés, `?code=`, corrigé consultable après
  chaque réponse) ; 6gen54 RENOMMÉ « Constructions analytiques dans le triangle » (décision 1 : titre, carte du § 1
  en une ligne, `whereLabel`, libellé pilote) ; libellés pilotes de 6gen55–57 remplis (processus 2, 2, 2, 3). Les
  autres cartes et le cours ne sont pas touchés (agent AFD). Détail : `.claude/rules/feuilles-evaluations.md`,
  « Textes : écran vs papier », paragraphe « 6e ch. 9 (lots B et C) ».

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
  **Nouveaux générateurs 5gen71–72** : bloc `methode` « Minimiser une distance ou un temps » (AM² par
  Pythagore, t = d/v, (√u)′, domaine réaliste et bornes) puis carte 5gen71 « Optimisation : distance et
  temps minimaux » en § 8 (après 5gen32) ; carte 5gen72 « Détective d'erreurs : dérivées » en § 7 (après
  5gen31) ; registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`,
  `evaluationPayload.ts`, processus 3 / 3 ; libellés pilotes de 5gen31 et 5gen32 remplis). Formule de
  la méthode coupée en deux formules en ligne (elle sortait du cadre à 390 px). Détail :
  `.claude/rules/feuilles-evaluations.md`, « 5e ch. 5, nouveaux générateurs — 5gen71–72 ».
  **Lot H (nouveaux générateurs 5gen73–75)** : cartes 5gen73 « Lire f(a) et f′(a) sur un graphique » en § 2
  (après 5gen68), 5gen74 « Du graphique de f′ aux variations de f » en § 6 (après 5gen30), 5gen75 « Dérivable ou
  non en a ? » en § 4 (après 5gen25), précédée d'un `exempleLibre` « Dérivée à gauche et à droite : point
  anguleux, tangente verticale » (|x − 2| en 2 : nombres dérivés −1 et 1 ; √x en 0 : 1/√h → +∞ ; rappel des
  morceaux et du saut), énoncé par clé dans `ENONCES_DEMONSTRATION` ; l'exemple « lire f(a) et f′(a) sur une
  tangente tracée » est laissé au lot F du cours. Registres (`registry.ts`, `evaluationAdapterRegistry.ts`
  avec `versionPapier`, `evaluationPayload.ts`, processus 1 / 2 / 2 ; libellés pilotes de 5gen25 et 5gen30
  remplis). 5gen75 en version MODESTE (morceaux, |x − a|, √(x − a)) : la version plus poussée (∛, x|x|·g)
  est réservée à la 5e 6h. Détail : `.claude/rules/feuilles-evaluations.md`, « 5e ch. 5, lot H — 5gen73–75 ».
  **Lots B, C, D des générateurs 5gen25–35 (24/11)** : règles communes (illisible refusé dans le moteur, aides
  posées, messages ciblés, choix jugés ✗ / ✓) ; 5gen25 justification en deux temps + famille avancée tirée et
  exportée ; 5gen26 √(x + c) et ax² + bx + c ; 5gen27 réponses réduites ; 5gen28 option f′, « aucune »,
  pente donnée, point extérieur ; 5gen29 option f′/f″, valeurs exactes ; 5gen31 exact, 2√2 ; 5gen32 boîte sans
  couvercle, cubique retirée ; 5gen33 centaines ; 5gen34 kW ; 5gen30 nœuds ; banque « Formule » : tangente de
  pente donnée, tangente par un point extérieur. Cours inchangé. Détail : `.claude/rules/feuilles-evaluations.md`,
  « 5e ch. 5 (lots B, C, D, 5gen25–35) ».

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
  **Lot H, première moitié (6gen132–6gen137, nouveaux générateurs, agent H1)** : cartes 6gen132 « Lire une conique sur sa
  figure ou son équation réduite », 6gen133 « Représenter une conique » et 6gen137 « Hyperbole équilatère et xy = k » en fin de
  § 1 (après 6gen58), 6gen134 « Réduire par translation et donner tous les éléments » et 6gen135 « Équation depuis foyer,
  directrice et excentricité » en fin de § 2 (après 6gen59), 6gen136 « Rayons focaux et triangle focal » en fin de § 3 (après
  6gen60). Aucun bloc de cours ajouté (lot F : rayons focaux a ∓ ex, aire b²·tan(θ/2), k = a²/2 sont écrits par l'agent AFD).
  Registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts`, processus 1 / 1 / 2 /
  2 / 2 / 2, sections `identifier`, `identifier`, `excentricite`, `excentricite`, `airefocale`, `identifier`). Descriptions de
  carte en texte brut. Détail : `.claude/rules/feuilles-evaluations.md`, « 6e ch. 10, lot H1 — 6gen132–6gen137 ».
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
  **Lots B et C de l'audit (6gen58–6gen63, 25/11)** : générateurs refaits sur le socle du 6e ch. 7 / ch. 9 (algèbre
  exacte, convention y² = 2px partout — décision 1 —, figures avec la réponse tracée après l'écran, verdicts équilibrés,
  `?code=`, corrigé consultable après chaque réponse) ; cartes de 6gen58, 6gen59 (titre « Équation d'une conique depuis
  ses caractéristiques », `whereLabel`), 6gen62 et 6gen63 réécrites en une ligne pour dire ce que fait le générateur ;
  libellés pilotes remplis (processus 2, 2, 3, 2, 2, 3). Le reste du cours n'est pas touché (agent AFD). Détail :
  `.claude/rules/feuilles-evaluations.md`, « Textes : écran vs papier », paragraphe « 6e ch. 10 (lots B et C) ».

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
    de variable mathématique authored). (Une mention de `.entete` de `gen7-widget.js` /
    `gen8-widget.js` figurait ici : ces fichiers n'ont jamais été fusionnés, voir la correction
    de l'entrée « 4e, Chapitre 1 ».)
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

- **4e, Chapitre 5 — Cercle trigonométrique et triangles quelconques**
  (`cercle-trigonometrique-triangles`), **5e (4h), Chapitre 5 — Dérivées et applications**
  (`derivees-applications`) **et 6e (6h), Chapitre 4 — Nombres complexes** (`nombres-complexes`,
  section « Forme trigonométrique, module, argument » = section 4 malgré le numéro de chapitre 5
  demandé par l'utilisateur — chapitre réellement visé confirmé par grep avant construction) : 9
  nouveaux widgets (3 par chapitre), proposés puis validés explicitement (« Fais les 9 », même
  mécanisme que les lots précédents). Aucun des trois chapitres n'avait encore d'atelier dans les
  sections visées. Conventions des lots précédents reprises dès la première passe : flèches sur
  tous les axes, fenêtres jamais recalculées depuis un curseur librement déplacé, couleurs
  `--accent`/`--good`/`--bad`/`--plan` par rôle.
  - **`identite-signe-widget`** (4e, section « L'identité fondamentale : retrouver sin ou cos »),
    inséré juste après l'exemple résolu (sin θ=3/5, θ∈]90°;180°[), avant l'entraînement.
    Matérialise littéralement le piège « Oublier le ± » : curseur sin θ, sélecteur de quadrant
    limité aux 2 quadrants compatibles avec son signe, les DEUX candidats ±√(1−sin²θ) toujours
    affichés côte à côte — un seul coché (✓ vert), l'autre barré (✗ rouge). Réglages par défaut
    (sin θ=0,60, quadrant II) reproduisent exactement l'exemple résolu : cos θ=−0,80, tan
    θ=−0,75 ; confirmé à l'écran. Testé aussi le passage sin θ<0 (bascule automatique vers
    III/IV, les boutons I/II se grisent).
  - **`equation-trig-cas-limite-widget`** (4e, section « Résoudre une équation trigonométrique »),
    inséré juste après l'exemple résolu (cos α=−1/2), avant l'entraînement. Matérialise le
    callout Attention « Cas limites » : sélecteur sin/cos/tan, curseur k — pour sin/cos, les 2
    points du cercle se rapprochent puis fusionnent en un SEUL exactement à |k|=1 (point coloré
    en vert, distinct des points normaux en orange) ; en mode tan, toujours 2 solutions
    diamétralement opposées quel que soit k (testé jusqu'à k=4). Réglages par défaut (cos
    α=−0,5) reproduisent exactement l'exemple résolu (120°, 240°) ; testé aussi k=1 en sin
    (fusion en α=90° confirmée par capture) et le mode tan (α₁=45°, α₂=225° pour k=1).
  - **`triangle-cas-ambigu-widget`** (4e, section « Le triangle quelconque »), inséré juste après
    le paragraphe introduisant le « cas ambigu » (SSA, 0/1/2 triangles) dans la présentation de
    la loi des sinus — avant même l'exemple SAS de fin de section, puisqu'aucun exemple chiffré
    du cas SSA n'existe dans le texte pour ancrer un défaut. A fixé à l'origine, [AB] sur l'axe
    horizontal, curseurs Â, b (=AC) et a (=BC, swingué depuis C) : le cercle de rayon a centré en
    C coupe la base en 0, 1 ou 2 points valides (abscisse positive) selon a comparé à h=b·sinÂ et
    à b — les 2 triangles solutions dessinés en vert (B aigu) et orange (B obtus) quand ils
    coexistent. Réglages par défaut (Â=30°, b=8, a=5) choisis pour illustrer d'emblée le cas
    ambigu (h=4<a=5<b=8 → 2 triangles) ; testés et capturés séparément les 3 autres régimes :
    a=2 (aucun triangle, a<h), a=4 (cas limite tangent, angle droit en B), a≥b (1 seul triangle,
    l'autre intersection tombe côté x<0 et n'est pas dessinée).
  - **`point-critique-signe-widget`** (5e, section « Étude locale (extremums et points
    critiques) »), inséré juste après l'astuce « Vérifie TOUJOURS les deux côtés d'un zéro de
    f' », avant l'entraînement. Famille f(x)=x³−3kx, curseur k unique : pour k>0, f'(x)=3(x²−k)
    change de signe aux deux zéros ±√k (2 vrais extremums, tangentes horizontales pointillées
    tracées à chaque point) ; pour k=0, f'(x)=3x²≥0 ne change JAMAIS de signe (même dérivée que
    l'exemple f(x)=x³+2 de la section — point critique sans extremum, testé et capturé) ; pour
    k<0, f'(x)>0 partout, aucun point critique du tout (testé et capturé). k=1 (défaut) reproduit
    exactement le tableau de signes complet de l'exemple résolu (extremums en x=±1, f=∓2, valeurs
    confirmées à l'écran).
  - **`extrema-bornes-widget`** (5e, section « Extrema en contexte borné »), inséré juste après
    l'astuce « Dresse une liste unique de candidats », avant l'entraînement. f(t)=t³−6t²+9t+2
    FIXE (exactement l'exemple résolu), seul curseur : la borne droite b. Matérialise le piège
    « S'arrêter au tableau de signes sans regarder les bornes » : le basculement entre max local
    (f(1)=6) et valeur à la borne (f(b)) a lieu exactement en b=4 (racine double de f(b)=6,
    calculée analytiquement lors de la conception) — testé et capturé b=3,6 (le local l'emporte
    encore) et b=5 par défaut (la borne l'emporte, max absolu=22, reproduit exactement l'exemple
    résolu et confirmé à l'écran).
  - **`recette-benefice-widget`** (5e, section « Contexte économique »), inséré juste après
    l'astuce « L'existence d'un extremum n'est pas garantie », avant l'entraînement. R(x)=50x−x²
    et C(x)=x²+10x+20 FIXES (exactement l'exemple résolu), seul curseur : la quantité x — lecture
    en direct de R, C, B=R−C, R' et C', verdict qui bascule de sens selon lequel des deux
    marginales dépasse l'autre. x=10 (défaut) reproduit exactement l'exemple résolu (R=400 €,
    C=220 €, B=180 €, Rm=Cm=30, confirmé à l'écran). Le piège « maximiser la recette n'est pas
    maximiser le bénéfice » est rappelé en texte fixe sous le graphe (B(25)=625−895=−270 €,
    calculé et vérifié à part, hors de la fenêtre du graphe pour ne pas casser la convention de
    fenêtre fixe alignée sur l'illustration statique de la section).
  - **`racines-niemes-widget`** (6e, section « Racines n-ièmes d'un nombre complexe »), inséré
    juste après l'astuce « La somme des racines n-ièmes de l'unité vaut 0 », avant la
    démonstration de cette même astuce. Curseurs n (2 à 8), r=|z| et θ=arg(z) : les n racines
    z_k=r^(1/n)·e^(i(θ+2kπ)/n) dessinées sur un cercle de rayon r^(1/n), reliées en polygone
    régulier, isobarycentre marqué en violet à l'origine (confirmation visuelle permanente de
    l'astuce « somme nulle »). Réglages par défaut (n=4, r=1, θ=0) reproduisent exactement
    l'exemple cité dans le texte : les 4 racines quatrièmes de l'unité sont 1, i, −1, −i,
    confirmé à l'écran (4 points cardinaux exacts). Testé aussi le cas n=2, r=2 (rayon maximal du
    curseur, √2≈1,414 — dans la fenêtre fixe, aucun clipping).
  - **`produit-modules-arguments-widget`** (6e, section « Forme trigonométrique, module,
    argument »), inséré juste après le piège « Les modules se MULTIPLIENT… jamais ne
    s'additionnent », avant l'astuce sur les angles remarquables. Curseurs r₁, θ₁, r₂, θ₂,
    sélecteur produit/quotient : les 2 vecteurs z₁ (orange), z₂ (vert) et leur produit ou
    quotient (rouge) tracés depuis l'origine, lecture textuelle « modules : ... | arguments :
    ... » recalculée en direct. Réglages par défaut (r₁=2, θ₁=60°, r₂=3, θ₂=30°, mode produit)
    reproduisent exactement l'exemple résolu de la section : z₁z₂=6e^(iπ/2), confirmé à l'écran
    (point du produit exactement sur l'axe imaginaire positif, à distance 6).
  - **`transformation-az-b-widget`** (6e, section « Transformations du plan »), inséré juste
    après l'astuce « Deux cas particuliers utiles » (qui cite z'=iz et z'=−z), avant la
    définition de la similitude directe. Curseurs |a|, arg(a), Re(b), Im(b) appliqués à un petit
    triangle asymétrique (forme fixe, pour que la rotation/réflexion reste visible sans
    ambiguïté) via z'=az+b — classification en direct (translation/rotation/homothétie/
    similitude générale, featureTable de la section) avec centre Ω=b/(1−a) marqué en violet
    quand a≠1. Réglages par défaut (|a|=1, arg(a)=90°, b=0) reproduisent exactement le cas z'=iz
    de l'astuce : rotation de centre O et d'angle π/2, confirmé à l'écran (le triangle image
    tourné de 90° exactement, centre Ω affiché à l'origine). Testé aussi le cas homothétie (a=2
    réel, b=1 → centre Ω=b/(1−a)=−1, calculé et confirmé à l'écran).
  Vérifié : script Playwright dédié (chromium headless, défilement complet pour déclencher le
  montage paresseux des ateliers) sur les 3 pages, thèmes clair ET sombre — `0` erreur console/
  page réelle pour les 9 (seules des `ERR_CERT_AUTHORITY_INVALID` sur des polices Google Fonts
  bloquées par le sandbox réseau, non liées aux widgets, filtrées comme dans `regress_all.mjs`) ;
  positions des lignes `.axe` identiques avant/après un glissement de curseur sur les 3 widgets à
  fenêtre cartésienne fixe testés (`triangle-cas-ambigu-widget`, `point-critique-signe-widget`,
  `racines-niemes-widget`) ; captures d'écran réelles recoupées à la main avec les exemples
  résolus et illustrations/astuces déjà présents dans chaque section, comme détaillé ci-dessus ;
  les cas-pièges et cas limites testés explicitement par capture pour chacun des 9 (bascule de
  quadrant, fusion à k=±1 et mode tan, les 3 régimes 0/1/2 triangles, k<0/k=0/k=1 pour le point
  critique, b=3,6 vs b=5 pour les bornes, homothétie pour la transformation). `tsc -p
  tsconfig.app.json --noEmit`/`oxlint` (18 fichiers .js + les 5 fichiers TS/TSX modifiés, `0`
  avertissement)/`npm run build` propres ; sitewide `regress_all_4321.mjs` sur les 23 chapitres :
  `0` erreur, `0` `NaN`/`undefined`, `0` `$` isolé.

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`) **et 6e (6h), Chapitre 6 — Les
  probabilités** (`probabilites`) : 6 nouveaux widgets (3 par chapitre), proposés puis validés
  explicitement (« Les 6 », même mécanisme que les lots précédents). Aucun des deux chapitres
  n'avait encore d'atelier. Conventions des lots précédents reprises dès la première passe :
  flèches sur tous les axes, fenêtres jamais recalculées depuis un curseur librement déplacé,
  couleurs `--accent`/`--good`/`--bad`/`--plan` par rôle. Deux widgets de ce lot (probabilités)
  sont purement tabulaires/HTML plutôt que SVG (`venn-double-entree-widget`,
  `bayes-test-medical-widget`), le concept concerné n'ayant pas de repère cartésien naturel —
  même principe que `seuil-cumule-widget`/`frontiere-classe-widget` d'un lot antérieur.
  - **`test-colinearite-widget`** (4e, section « Colinéarité de vecteurs et alignement de
    points »), inséré juste après le piège « Ne pas confondre avec l'orthogonalité », avant
    l'entraînement. A(0;0) et B(2;1) fixes, C déplaçable, sélecteur colinéarité/orthogonalité :
    les DEUX formules ($x_uy_v-y_ux_v$ et $x_ux_v+y_uy_v$) affichées côte à côte, une seule
    active selon le mode choisi, appliquées aux mêmes vecteurs AB/AC pour rendre tangible que ce
    sont deux tests différents. Réglage par défaut (C(6;3), mode colinéarité) reproduit
    exactement l'exemple résolu : déterminant nul, A/B/C alignés, confirmé à l'écran. Testé aussi
    le mode orthogonalité avec C(−1;2) : produit scalaire nul, orthogonaux confirmé — et C hors
    ligne (déterminant ≠0 dans les deux cas), écran recoupé.
  - **`milieu-piege-widget`** (4e, section « Vecteurs, translation et milieu »), inséré juste
    après le piège « Milieu ≠ différence de coordonnées », avant l'entraînement. A et u
    déplaçables, B=A+u calculé : le vrai milieu M (vert) et le faux « milieu » que confond le
    piège — le point (x_B−x_A;y_B−y_A), qui vaut TOUJOURS exactement (x_u;y_u) — affichés côte à
    côte. Réglage par défaut (A(1;1), u=(4;2)) reproduit exactement l'exemple résolu : B(5;3),
    M(3;2), confirmé à l'écran. Bug trouvé et corrigé en cours de vérification : au réglage par
    défaut, M et le point-piège partagent la même hauteur en pixels (yM=yFaux=2, coïncidence
    numérique du cas 3yA=yB) — leurs étiquettes se chevauchaient illisiblement ; corrigé en fixant
    l'étiquette de M toujours au-dessus du point et celle du piège toujours en dessous (au lieu du
    même décalage par défaut pour les deux), plutôt qu'une détection dynamique de collision —
    reconfirmé par capture après correctif, y compris sur un réglage éloigné (A(0;6), u=(−4;−4)).
  - **`resultante-vecteurs-widget`** (4e, section « Applications physiques : la résultante »),
    inséré juste après l'exemple résolu, avant le rappel de notation. Curseurs F₁, F₂, θ : la
    règle du parallélogramme (vecteurs + parallélogramme pointillé + résultante) redessinée en
    direct, R et la déviation recalculés par les lois des cosinus/sinus. Réglage par défaut
    (F₁=50N, F₂=30N, θ=60°) reproduit exactement l'exemple résolu : R=70N, déviation≈21,8°,
    confirmé à l'écran. Testé aussi un cas extrême (F₁=F₂=70N, θ=160°, quasi-opposées) : R chute à
    24,3N, aucun débordement de la fenêtre fixe malgré F₂ pointant vers les x négatifs.
  - **`venn-double-entree-widget`** (6e, section « Probabilités et ensembles »), inséré juste
    après le piège « La case "ni A ni B"… JAMAIS 1−P(A)−P(B) », avant le bloc intuition sur le
    conditionnement. n(A), n(B), n(A∩B) déplaçables (N=40 fixe, comme l'exemple), tableau à double
    entrée recalculé en direct, avec le calcul CORRECT et le calcul FAUTÉ affichés côte à côte
    pour les deux pièges de la section (additionner sans retirer l'intersection ; complémentaire
    sans passer par P(A∪B)). Réglage par défaut (n(A)=18, n(B)=15, n(A∩B)=6) reproduit exactement
    l'exemple résolu : P(A∪B)=27/40, tableau 12/9/13, confirmé à l'écran. Le curseur n(A∩B) voit
    sa borne max recalculée dynamiquement à min(n(A),n(B)) — testé explicitement en tentant de le
    pousser à 30 avec n(A)=n(B)=5 : bien clampé à 5, sans jamais afficher un tableau incohérent.
  - **`bayes-test-medical-widget`** (6e, section « Indépendance, conditionnement et Bayes »),
    inséré juste après le piège central de la section, avant l'illustration statique
    `naturalFrequencies` (qui reste inchangée, l'atelier vient en complément dynamique). P(malade),
    P(T⁺|malade), P(T⁺|non malade) déplaçables : colonnes de fréquences naturelles (malades/non
    malades/positifs) recalculées en direct, avec le contraste explicite P(T⁺|malade) vs
    P(malade|T⁺) — exactement le piège cité mot pour mot dans le texte. Réglage par défaut
    (P(malade)=10%, P(T⁺|malade)=90%, P(T⁺|non malade)=20%) reproduit exactement l'exemple résolu
    : P(T⁺)=27%, P(malade|T⁺)=1/3≈33%, confirmé à l'écran (mêmes effectifs que l'illustration
    statique : 100/90/900/180/270). Testé aussi une maladie très rare (P(malade)=1%) : P(malade|T⁺)
    chute à 4,3%, démontrant concrètement que même un test fiable à 90% devient peu informatif
    quand la maladie est rare.
  - **`binomiale-positions-widget`** (6e, section « Probabilités : problèmes »), inséré juste
    après le piège « additionner les p… IMPOSSIBLE », avant l'illustration statique
    `complementBar` (inchangée). Curseurs n, p, sélecteur k : la distribution complète P(X=0..n)
    redessinée en direct (barre du k courant surlignée), avec les DEUX pièges de la section
    contrastés numériquement (oublier de compter les positions C(n,k) ; additionner les p au lieu
    du complément). Réglage par défaut (n=5, p=0,3, k=2) reproduit exactement l'exemple résolu :
    C(5;2)=10, P(X=2)=0,3087, P(au moins 1)=0,83193, confirmé à l'écran — les 6 barres
    reproduisent même exactement les valeurs de l'illustration statique `categoricalBarChart`
    (0,168/0,360/0,309/0,132/0,028/0,002). Testé aussi le cas limite n=1 (une seule position
    possible, C(1;1)=1 — le widget reste cohérent sans division par zéro ni valeur aberrante).
  Vérifié : script Playwright dédié (chromium headless, routes de polices Google avorté comme
  dans `regress_all_4321.mjs`, défilement complet pour déclencher le montage paresseux des
  ateliers) sur les 2 pages, thèmes clair ET sombre — `0` erreur console/page réelle pour les 6 ;
  positions des lignes `.axe` identiques avant/après un glissement de curseur sur les 2 widgets à
  fenêtre cartésienne fixe testés (`test-colinearite-widget`, `resultante-vecteurs-widget`) ;
  captures d'écran réelles recoupées à la main avec les exemples résolus et illustrations/pièges
  déjà présents dans chaque section, comme détaillé ci-dessus ; les cas-pièges et cas limites
  testés explicitement par capture pour chacun des 6 (mode orthogonalité vérifié, C hors ligne,
  réglage A/u éloigné après le correctif d'étiquettes, F₁=F₂=70N à θ=160°, clamp de n(A∩B),
  maladie rare à 1%, n=1 pour la binomiale). `tsc -p tsconfig.app.json --noEmit`/`oxlint` (12
  fichiers .js + les 4 fichiers TS/TSX modifiés — 2 avertissements de variable inutilisée trouvés
  et corrigés avant commit, `0` restant)/`npm run build` propres ; sitewide `regress_all_4321.mjs`
  sur les 23 chapitres : `0` erreur, `0` `NaN`/`undefined`, `0` `$` isolé.

- **Nouvelle infra — formulaire de fin de chapitre** (`ChapterContent.formulaire`,
  `components/chapter/Formulaire.tsx`, voir `.claude/rules/content-authoring.md`) : 4 maquettes
  de présentation proposées à l'utilisateur dans un artifact (fiche de référence perforée / boîte
  à outils par besoin / carte mentale relationnelle / accordéon par générateur), choix explicite
  de la fiche de référence (« la A »). Prototypé sur `4e/equations-inequations-second-degre.ts`
  (5 groupes thématiques — discriminant/racines, raccourcis, forme factorisée, signe du trinôme,
  équation rationnelle — couvrant les 5 générateurs gen1-gen5 du chapitre). Rendu après `RecapFinal`
  dans `ChapterPage`, style ajouté dans `index.css` (`.formulaire-*`, perforation en
  `radial-gradient` répété, colonnes CSS `columns:2` → 1 sous 640px, sur le modèle déjà en place
  pour `.synthese`). Vérifié par rendu navigateur réel (clair/sombre/mobile 390px) : `0`
  `.katex-error`, `0` `$` isolé, aucun débordement horizontal sur mobile ; `tsc -b`/`npm run
  build`/`npm run lint` propres (aucun avertissement nouveau). Rollout aux autres chapitres en
  attente de confirmation utilisateur sur ce prototype.

- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`) : lot F des corrections de l'audit du
  chapitre (décisions de l'utilisateur : enseigner dans le cours ce que les générateurs demandent,
  plutôt que de retirer ces familles des générateurs).
  - **Ordre des sections** : « Équations trigonométriques » (id `equations`, désormais n° 7) passe
    AVANT « Modéliser » (id `modeliser`, n° 8) — 5gen13 réutilise la technique des équations. Ids
    inchangés (liens, `evaluationPayload.ts`, générateurs) ; aucun renvoi littéral « section N »
    dans le fichier. L'énoncé de démonstration positionnel de `modeliser` (grande roue) vise
    toujours le PREMIER exemple de la section : le nouvel exemple d'inéquation est placé après.
  - **Section `equations`** (titre « Équations trigonométriques », kicker élargi) : 3 techniques de
    5gen10 désormais enseignées — produit nul (réunion, mise en évidence T(T−k)=0, piège « diviser
    par cos x »), second degré en sin/cos (sin²+cos²=1, substitution t, rejet de |t|>1, exemple
    2sin²x − cos x + 1 = 0 → S={0}), égalité de deux expressions (rappel des conversions
    sin θ = cos(π/2−θ), −tan θ = tan(−θ), exemple cos(2x) = sin(x) → {π/6 ; 5π/6 ; 3π/2}, piège du
    signe de −tan) ; plus une Attention sur l'existence de la tangente (u ≠ π/2 + kπ).
  - **Section `modeliser`** : sous-section « Résoudre une inéquation f(t) ≥ k ou f(t) ≤ k »
    (méthode de 5gen13 : m = (k−b)/A, |m|>1, arc du haut [arcsin m ; π−arcsin m], arc
    complémentaire pour ≤, retour à t, fenêtre), exemple sur la grande roue (≥ 24,5 m →
    t ∈ [8/3 ; 16/3]) avec cercle (`circleAngles` + `angleArcs` vert sur l'arc solution), piège sur
    le mauvais arc.
  - **Cartes** alignées sur ce que font vraiment les générateurs : 5gen6 (2 grandeurs données parmi
    5, conversions), 5gen7 (circonférence, aire, arc, secteur en fraction du cercle — plus de
    « figure composée »), 5gen8/5gen9 (ω et φ, ajoutés aux générateurs par le lot C), 5gen10 (les
    4 familles), 5gen12 (essuie-glace, segment, lentille — plus de « corde/rayon »), 5gen13
    (contextes réels + équation/extremums/inéquation).
  - **Formulaire** : formules des 3 nouvelles techniques et un groupe « Inéquations
    sinusoïdales » ; **synthèse** : un item « Autres équations », item « Modéliser » complété,
    une ligne de checklist.
  - **Quiz 5gen40** (banque) : thème « paramètres » réécrit dans la notation du cours (ω, φ, Φ au
    lieu de B, C et d'un φ horizontal), « une seule famille de solutions » (au lieu de « solution
    unique »), longueur d'arc s = rθ (au lieu de l), « θ(rad) », « hₛₒₗ », signe moins « − »
    typographique partout (mots composés préservés).
  **Piège rencontré** : des chaînes LaTeX insérées par un script Python sans chaîne brute
  (`'\\frac'` écrit `\frac` dans le TS) donnent `\f` (saut de page) → 2 `.katex-error` détectées au
  rendu, jamais par `tsc`. Toujours vérifier `.katex-error` après une insertion scriptée.
  Vérifié : `tsc` sans erreur sur ces fichiers, `verifier-enonces-evaluation` OK, page à 390 et
  1280 px : 0 `.katex-error`, 0 `$`/`**` isolé, 0 débordement, 0 erreur console ; quiz à 390 px.

## 4e — chapitres 2 et 4 : ajustements pour les feuilles et évaluations (refonte papier)

- **Équations et inéquations du second degré** (§ resoudre) : les deux blocs `exempleLibre`
  « Démonstration » portaient le même label ; ils s'appellent désormais « Démonstration — relations
  de Viète » et « Démonstration — forme factorisée », pour que leurs énoncés imprimés
  (`ENONCES_DEMONSTRATION`, `src/lib/evaluationPayload.ts`) soient appariés par clé. Ne pas revenir
  à un label commun : le build (`verifier-enonces-evaluation`, mode strict) échouerait.
- **Statistique descriptive** : les résultats des exemples « liste brute, n = 20 » et « 4 classes,
  amplitude 2 » disaient seulement « voir (le tableau) ci-dessous ». Le corrigé imprimé d'une
  question démonstration est dérivé du TEXTE de l'exemple (le `featureTable` qui suit n'est pas
  repris) : ces résultats énoncent maintenant les valeurs (fréquences, cumuls, effectifs, hauteurs
  des barres), le tableau restant affiché en dessous à l'écran.

- **5e (4h), Chapitre 3 — Suites** (`suites`) : corrections issues de l'audit du chapitre (lot A,
  décisions de l'utilisateur : ENSEIGNER ce que les générateurs demandent). Ajouts de cours :
  « Retrouver une inconnue : x ou le rang n » en section 1 (relation $u_n = u_p + (n-p)r$,
  méthode, 3 exemples : x entre deux termes, x dans une somme, rang n) et en section 2 (relation
  $u_n = u_p\times q^{n-p}$, exemple x entre deux termes, méthode « réduire à la même base » +
  exemple rang n) ; « La somme infinie d'une suite géométrique » en section 3 ($S_\infty =
  u_1/(1-q)$ si $|q|<1$, exemple $6+2+\frac23+\ldots = 9$, Attention $q=1$) — la promesse de
  l'astuce « et si |q| < 1 ? » et de l'encadré Zénon est enfin tenue. Remarque « si $u_1 = L$, la
  suite récurrente affine est constante » dans le rappel du régime permanent, le formulaire et la
  synthèse. Les nouveaux blocs `exemple` sont placés APRÈS les 3 blocs exemple/démonstration
  existants de chaque section : l'appariement POSITIONNEL des énoncés de démonstration
  (`ENONCES_DEMONSTRATION.suites`, `lib/evaluationPayload.ts`) reste aligné (vérifié par
  `apparierEnoncesDemonstration` : 0 orphelin, démonstrations toujours à l'indice 1). Notation
  clavier retirée : kickers, titres vidéo et descriptions de cartes en Unicode (uₙ, uₙ₊₁, qⁿ⁻¹),
  légendes en `$…$` ; « l'exposant est toujours (n−1) » (arithmétique) → « le facteur de r » ;
  échiquier « plusieurs centaines de fois » → « plus d'un millier de fois (≈ 1 150) », avec les
  constantes de 5gen17 (0,05 g le grain, 800 Mt, valeur reprise de 5gen17 refondu). Cartes 5gen14/15/16/17/18/19/41 alignées sur le
  comportement final des générateurs (plus de « moyenne géométrique » ni « 0 solution » en 5gen15).
  Vérifié : 0 erreur KaTeX/console, 0 débordement, 0 texte brut `_`/`^`/`$` à 390 et 1280 px.

- **5e (4h), Chapitre 4 — Limites et asymptotes** (`limites-asymptotes`) : corrections issues de
  l'audit du chapitre (lot A, décisions A–L de l'utilisateur). Notions enseignées pour aligner le
  cours sur ce que demandent 5gen22–5gen24 : en section 3, un exemple « point isolé » (une limite
  FINIE d'un côté de l'asymptote verticale, point plein, l'autre côté diverge — un côté suffit) et
  un exemple « deux asymptotes horizontales différentes » ($1 + 2x/\sqrt{x^2+1}$, $y=-1$ en $-\infty$,
  $y=3$ en $+\infty$) ; la méthode de lecture dit désormais « lis $-\infty$ et $+\infty$
  séparément ». En section 4, la méthode « écrire $f(x)=b+\frac{a}{x+p}$ par division euclidienne »
  (jamais les coefficients indéterminés) et trois exemples courts alignés sur 5gen23 : population
  $\frac{5x+13}{x+2}=5+\frac{3}{x+2}$ (régression, $a>0$), eau salée $C(t)=\frac{150t}{100+5t}\to30$,
  club $N(x)=2x+15-\frac{8}{x+2}$ (asymptote oblique en contexte). En section 5, un Attention et un
  exemple « recoupement » ($\frac{x^2+x}{x^2+1}$ croise $y=1$ en $(1;1)$) et un exemple
  « construction inverse » ($ax+b+\frac{1}{x-r}$, comme 5gen24). « Jamais atteinte » corrigé
  partout : une asymptote horizontale/oblique PEUT être croisée ; seule l'asymptote verticale d'une
  fonction rationnelle ne l'est jamais ; « jamais atteinte » n'est affirmé que pour un modèle
  précis ($b+a/x$). Astuce plancher/plafond corrigée (descend → plancher, monte → plafond), asymptote
  oblique notée $y=ax+b$ partout (plus de $y=mx+p$). Formulaire : groupe « Contexte, recoupement,
  construction ». Cartes 5gen20–24 et 5gen42 alignées sur les générateurs (5gen24 n'est plus une
  « synthèse finale »). Notation clavier retirée (étapes « numérateur(2)=… », « x→−3⁻ », légendes) ;
  piège rencontré : la `caption` d'un `featureTable` est rendue en texte BRUT (contrairement à la
  `caption` d'une illustration) — « Quotient f ÷ g » en Unicode. Les nouveaux blocs `exemple` sont
  placés APRÈS les exemples existants de chaque section (appariement positionnel des énoncés de
  démonstration préservé). Quiz 5gen42 : banque entière en `RichText` `$…$` rendue par
  `TexteRiche5e` (comme 5gen41), 10 V / 10 F par thème, affirmations fausses ou imprécises
  corrigées (asymptote « jamais touchée », condition d'asymptote verticale « exacte » —
  contre-exemple $\frac{x-1}{(x-1)^2}$, minimum vs borne inférieure, modèle de mélange hors cours,
  sens de variation d'une population décidé par le signe de $a$, affirmations « méta » remplacées
  par des affirmations mathématiques). Vérifié : 561 formules de la banque et 313 du cours en
  KaTeX `strict: 'error'` sans erreur ; 0 erreur KaTeX/console, 0 débordement, 0 `$`/`^`/`_` brut à
  390 et 1280 px (cours et les 140 questions du quiz parcourues).

- **4e, Chapitres 1 → 2 — gen57 déplacé** (demande de l'utilisateur) : la sous-section
  « Équations et inéquations en contexte » du chapitre 1 (§ utiliser : paragraphes f(x)=k / f(x)>k,
  contexte du ballon, 2 exemples résolus, application « où retombe un projectile », carte gen57)
  devient la section 7 du chapitre 2 (`equations-inequations-second-degre` § `contexte`, la révision
  passe en 8), précédée d'un paragraphe de transition vers le chapitre 1 ; au chapitre 1, un court
  renvoi la remplace et le kicker/l'intro de § utiliser ne parlent plus de résolution. Suivis :
  `registry.ts` (gen57 → chapitre 2), `GENERATEURS_EVALUATION_PILOTE` (gen57 au ch. 2 § contexte,
  gen55 et gen57 en processus 3 « Transférer »), énoncés de démonstration et question de
  compréhension « rejet d'une solution » déplacés avec leurs exemples, synthèse et checklist du
  chapitre 2 complétées. Le quiz gen60 (chapitre 1) garde son thème « équations et inéquations en
  contexte ».

- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`) : audit puis enrichissement
  validé par l'utilisateur (toutes les recommandations). Contenu : diagramme en bâtons (§ 1), méthode
  « Choisir ses classes » (§ 2), tableau des centres, x̄ = Σxᵢfᵢ et moyenne en classes = approximation
  (§ 3), **polygone des effectifs cumulés** avec lecture graphique de la médiane présentée comme la source
  de la formule d'interpolation, classe modale, série bimodale (§ 4), boîte du **fil rouge** 2/6/6/9/12
  (même série qu'aux § 3–4), écart interquartile, lecture des quarts et de l'asymétrie, « Le sais-tu ? »
  Tukey (§ 5), variance sur la même série en premier exemple (V = 10,95, σ ≈ 3,31) et encadré
  calculatrice σx/sx (§ 6), exemple concret « 40 élèves » et « Le sais-tu ? » Bienaymé/Tchebychev (§ 7),
  deux courbes cumulées superposées et deux boîtes (§ 8) ; synthèse (boîte, comparaison), formulaire
  (centre, amplitude, Q₃ − Q₁), renvoi final « chapitre 6 de 5e ». `BoxPlot.tsx` : étiquettes fusionnées
  quand deux des cinq nombres sont égaux (rétrocompatible). Ateliers : `seuil-cumule-widget` gagne un mode
  « Classes » (polygone + triangle d'interpolation) et passe après la méthode d'interpolation ;
  `dispersion-comparee-widget` réécrit (10 points déplaçables, bande x̄ ± σ) ; 5 nouveaux —
  `choix-classes-widget` (§ 2), `valeur-aberrante-widget` (§ 4), `boite-moustaches-vivante-widget` (§ 5),
  `tchebychev-garantie-widget` (§ 7), `deux-courbes-cumulees-widget` (§ 8). Question ouverte à l'utilisateur :
  arrondi du nombre minimal d'individus (gen37 et le piège du chapitre arrondissent vers le bas ; vers le
  haut serait exact et plus fort) — l'exemple du chapitre utilise des nombres qui tombent juste.
  **Tranché ensuite par l'utilisateur** : un nombre minimal d'individus s'arrondit **vers le haut**
  (c'est un entier : « au moins 18,75 » veut dire « au moins 19 »). gen37 (`nMinAttendu`, écran, aides,
  corrigé et barème papier) et le piège « Arrondir sans perdre la garantie » suivent ; un pourcentage
  minimal reste arrondi vers le bas.

- **4e, Chapitre 3 — Caractéristiques d'une fonction et fonctions de référence**
  (`caracteristiques-fonctions-reference`) : audit puis enrichissement validé par l'utilisateur (toutes
  les recommandations). § 1 : image, antécédent, ensemble image (dans la méthode de lecture), résolution
  graphique de f(x) = k et f(x) > k, tableau de variations lu sur une courbe, comparaison f(x) > g(x) ;
  « Le sais-tu ? » Oresme déplacé de l'intro vers § 1 ; point creux ajouté en (0 ; 0,5) sur la courbe
  composite ; encadré « Trois symboles à distinguer en un point » (le point plein n'est pas une
  exclusion). § 2 : valeur absolue au niveau 1, sous-partie « Quand le membre de droite contient x »
  (niveau 2 de gen13 : condition de validité, solution étrangère), et le tableau du nombre de solutions de
  [famille](ax+b) = K complété par la colonne K = 0 — l'inverse n'y a AUCUNE solution (le tableau disait
  « toujours 1 »). § 3 : piège « f(2x) comprime », exemple complet des 8 paramètres construit pas à pas
  dans l'ordre de gen11, formes canoniques racine carrée et cube, astuce « une même courbe, deux lectures »
  (gen11 ne retient que la lecture horizontale : l'astuce le dit). Révision : 243 affirmations (le kicker
  disait 140). Ateliers : 4 nouveaux — `lire-courbe-widget` (§ 1), `combien-zeros-widget` et
  `solution-etrangere-widget` (§ 2), `pas-a-pas-transformations-widget` (§ 3) ;
  `transformation-8-parametres-widget` gagne un mode Défi (verdict sur les courbes, réglages équivalents
  acceptés) et le suivi de l'image de (1 ; 1) ; `familles-parite-widget` gagne un mode « fonction
  transformée » (TH, TV) qui teste la parité.

- **5e (4h), Chapitre 3 — Suites** (`suites`) : audit puis enrichissement validé par l'utilisateur
  (toutes les recommandations). Corrections : l'astuce du § 6 affirmait « pas de formule fermée » pour
  uₙ₊₁ = a·uₙ + b (faux : vₙ = uₙ − L est géométrique de raison a, d'où uₙ = L + (u₁ − L)·aⁿ⁻¹ — nouvelle
  démonstration qui **prouve** la convergence pour |a| < 1, plus « admise ») ; l'exemple de l'aquarium
  disait « quelle que soit la concentration de départ … sans jamais la dépasser » (faux si u₁ > L) ; la
  définition géométrique excluait q = 1 alors que le tableau des limites, l'Attention « q = 1 » et le § 6
  l'utilisent (désormais q ≠ 0, q = 1 = suite constante ; colonne q = 1 ajoutée au tableau des
  variations) ; graphique exponentiel du § 2 avec un faux plateau (n = 6, 7 posés à 3,7) → vraies valeurs ;
  vocabulaire « diverger » unifié (= ne pas converger ; q = −1 bornée sans limite, q < −1 |uₙ| → +∞ sans
  limite) dans le tableau, le formulaire, la checklist et le récap ; emprunt indexé à partir de u₁ (comme
  tout le chapitre) et tracé jusqu'au remboursement (un point tous les 6 mois). Contenu : r = 0 constante,
  contre-exemple « n'est pas arithmétique / géométrique » (uₙ = n²), somme de uₚ à uₙ (n − p + 1 termes,
  exemple u₅ + … + u₂₀ = 616), « Pourcentages : de t % à la raison q » (intérêts simples/composés,
  wrongRight +10 % puis −10 %), astuce rang n sans base commune → balayage (§ 5), exemple 0,999… = 1,
  exemple « les carrés emboîtés » (S∞ = 32 cm²) au § 4, graphique arithmétique contre géométrique déplacé
  du § 4 vers l'introduction du § 5 (rang de bascule 9), exemple « formule explicite de l'aquarium »
  (u₁₀ ≈ 9,64) et « le seuil de l'emprunt » (L = 60 000 € n'est pas une limite mais un seuil, a > 1).
  Tous les nouveaux exemples ont leur énoncé clé dans `ENONCES_DEMONSTRATION.suites`. Ateliers :
  `convergence-suite-widget` gagne une bande ε (rang N), `comparaison-suites-widget` des préréglages
  (villes, intérêts, pas de bascule), un tableau de balayage et un mode pari, `suite-recurrente-affine-widget`
  une toile d'araignée et les écarts vₙ ; 6 nouveaux — `gauss-double-echelle-widget` (§ 1),
  `arithmetique-ou-geometrique-widget` (§ 2), `somme-infinie-zenon-widget` (§ 3), `echiquier-widget`,
  `fibonacci-nombre-d-or-widget` et `angle-d-or-widget` (§ 4).

- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : audit puis enrichissement
  validé par l'utilisateur (toutes les recommandations). Corrections : l'intuition du § 10 disait qu'une
  magnitude de plus = « 10 fois plus énergétique » (faux : amplitude × 10, énergie ≈ × 32 — nouvel exemple
  « magnitude et énergie » avec log₁₀ E = 1,5M + 4,8, la relation de 6gen22) ; l'étude complète du § 9
  annonçait la concavité sans la faire (désormais domaine → limites → dérivée + tableau de signes →
  concavité, inflexion en e^(3/2)) ; (ln|u|)′ = u′/u et le domaine de ln|u| enfin énoncés (6gen21 étudie
  ln|trinôme|) ; application « bits » déplacée après ln (elle invoquait un changement de base pas encore vu) ;
  énoncé ajouté à « même inéquation, deux bases » ; chapeaux des légendes en LaTeX ; « À retenir » du § 8
  remplacé par le tableau de lecture f′ ↔ f ; renvoi final vers le chapitre 4 (primitive de 1/x). Structure :
  6 sous-titres au § 1 (aucun avant), logₐ′ remonté juste après ln′. Contenu : calcul de logarithmes,
  développer/réduire, piège ln(x²) = 2 ln|x| (§ 1) ; deux bases différentes, regrouper puis vérifier la CE
  (§ 2) ; signe de ln(u), inéquation exponentielle avec division par ln(0,8) < 0 et lien avec le balayage
  de 5e (§ 3) ; ln|x² − 4|, étude de signe x ln x − x (§ 4) ; trois limites résolues (§ 5) ; deux exemples de
  paramètres (§ 6) ; origine du nom (hyperbole), preuve de ch² − sh² = 1 et des dérivées, argsh = ln(x +
  √(x² + 1)) par la substitution du § 2, application chaînette (§ 7) ; ln x ≤ x − 1, exemple ln x − x/2
  (§ 8) ; études de x ln x et de ln|x² − 4| (§ 9) ; datation C14, temps de doublement, règle de 70, instant
  logistique (§ 10) ; checklist et formulaire complétés. Tous les nouveaux exemples ont leur énoncé clé.
  Ateliers : `log-exp-miroir-widget` (tangentes de pentes m et 1/m, bouton a = e), `inequation-logarithmique-widget`
  (argument x − c, domaine hachuré), `parametres-graphiques-widget` (mode Défi) ; 7 nouveaux —
  `regle-a-calcul-widget`, `echelle-semi-log-widget` (§ 1), `solution-parasite-log-widget` (§ 2),
  `croissance-comparee-log-widget` (§ 5), `chainette-widget` (§ 7), `f-et-fprime-widget` (§ 8),
  `datation-carbone14-widget` (§ 10).

- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : audit puis enrichissement
  validé par l'utilisateur (toutes les recommandations). Corrections : « aucune primitive si f n'est pas
  continue » remplacé par le vrai résultat (toute fonction continue sur un intervalle admet des primitives,
  admis) ; ln|x| : constante propre à chaque intervalle de ℝ₀ ; signe de l'intégrale « même si a < b » →
  « lorsque a < b » ; astuce hors sujet « racine / solution » remplacée par « vérifier deux fois » ; légendes
  d'économie (coût pour passer de 3 à 8 unités, surplus 32 € pour un prix de 12 €) ; « convexe (tournée vers
  le haut) » ; positivité et croissance de l'intégrale énoncées (la démonstration de la moyenne s'en servait).
  Le théorème fondamental est désormais **démontré** par la fonction aire A(x) = ∫ₐˣ f (encadrement
  m·h ≤ A(x+h) − A(x) ≤ M·h). Contenu : linéarité et f(ax + b), tableau complété (1/x², √x, 1/cos²), formes
  u′/u (tan) et u′uⁿ, ∫ ln x par parties, 2e IPP détaillée (§ 1) ; trois conditions initiales dont une pour
  x < 0 (§ 2) ; substitution avec changement de bornes, parité, valeur moyenne de sin (§ 3) ; sin sur
  [0 ; 2π], aire entre x³ et x, aire sous ln (§ 4) ; cône retrouvé, boule 4/3·πr³, paraboloïde, historique
  Kepler (§ 5) ; longueur de y = x² par trapèzes, historique Descartes / Neil / van Heuraet (§ 6) ;
  déplacement ≠ distance, trapèzes sur relevés, débit, bol par soustraction (§ 7) ; checklist, formulaire,
  renvoi vers le chapitre 8 (densité). Les énoncés de démonstration passent en appariement **par clé**
  (chapitre ajouté à `CHAPITRES_ENONCES_VERIFIES`). Ateliers : `famille-primitives-widget` (choix de f, deux
  constantes pour 1/x), `condition-initiale-widget` (choix de f, calcul de C pas à pas),
  `sommes-riemann-widget` (4 fonctions, point milieu, encadrement) ; 7 nouveaux — `ipp-choix-widget` (§ 1),
  `fonction-aire-widget` et `rectangle-valeur-moyenne-widget` (§ 3), `aire-signee-widget` (§ 4),
  `solide-revolution-widget` (§ 5), `longueur-polygonale-widget` (§ 6), `distance-deplacement-widget` (§ 7).

- **6e (6h), Chapitre 4 — générateurs 6gen23–29 et quiz 6gen67** : audit (3 forks, ≥ 2 000 tirages par
  variante, quadratures indépendantes) puis corrections validées par l'utilisateur. Erreurs : 6gen25
  calculait des « intégrales » sur des intervalles contenant un pôle (16 à 59 % des tirages ; bornes
  désormais contrôlées sur tout [a ; b]) ; 6gen29 E donnait « niveau moyen » pour la moyenne d'un TAUX
  (→ taux de variation moyen), G_soustraction avait un « cylindre » fictif (→ vrai trou πρ²(b − a)),
  cible arrondie écrite « = », verre non « plein à ras bord », comparaison toujours « différents ».
  Bugs communs : « + C » et « π » refusés, champs non vidés après « Générer », choix fermés à 3 essais
  (→ 1), placeholders égaux à la réponse (jusqu'à 100 %), écrans intermédiaires sans la vraie réponse,
  champs multiples qui débordaient à 390 px, historique des puces en valeurs internes. Écritures
  (formateur commun `ui6e/formatMonome.ts`), virgule décimale, valeur exacte puis approchée, précision
  annoncée et tolérance relative, aides en LaTeX, figures SVG (`ui6e/figure*.ts`) pour aires, volumes,
  longueurs, intégrales définies, trapèzes et surplus. Décision A : variantes techniques hors cours
  marquées « Pour aller plus loin — » et sous-partie correspondante ajoutée au § 1 du cours. Quiz :
  14 affirmations méta / hors programme remplacées (35 par thème conservées). Refonte papier complète des
  7 générateurs (énoncé papier, corrigé détaillé avec figures, barème, difficulté, durée, profils de
  tirage équilibré dans `generateurs6e/*/profilEvaluation.ts`, `calculatriceIndispensable` par variante
  pour 6gen24/25, `versionPapier`, QR code `?code=` dans App6gen23–29) — aucune règle REECRITURES
  nécessaire (textes papier rédigés directement).

- **4e, Chapitre 2 — Équations et inéquations du second degré** (`equations-inequations-second-degre`) :
  audit puis enrichissement validé par l'utilisateur (toutes les recommandations). Corrections : renvoi
  final (le chapitre 3 est « Fonctions de référence », pas le cercle trigonométrique), « 3 raccourcis +
  un cas caché » au lieu de « 4 », ligne b = 0 complétée (même signe → aucune solution ; −c/a non carré),
  Viète valable pour Δ ≥ 0, légende de la rentabilité (zone verte = gain). Contenu : racine évidente
  (a + b + c = 0), signe des racines par S et P, équation à paramètre m, bicarrée (pour aller plus loin),
  historique al-Khwārizmī (§ 1) ; tableau de signes, cas Δ < 0 et Δ = 0 (ℝ, ∅, ℝ \ {r}, {r}), x² < 4x à
  ramener à 0 (§ 2) ; facteur irréductible + pente négative (§ 3) ; facteurs opposés, (x² − 4)/(x + 2)
  (§ 4) ; dénominateur commun plutôt que produit en croix, S = ∅ (§ 5) ; méthode en 5 étapes, « jamais de
  produit en croix dans une inéquation », second membre non nul, dénominateur au carré (§ 6) ; enclos
  (§ 7) ; checklist et formulaire. Quiz gen61 : 4 thèmes ajoutés (fractions rationnelles, inconnue au
  dénominateur, inéquations rationnelles, en contexte — ce dernier déplacé depuis gen60, qui passe à
  6 thèmes / 206 affirmations ; gen61 : 11 thèmes / 360), rattachés aux sections dans `evaluationPayload.ts`.
  Ateliers : `discriminant-racines-widget` (S, P, forme factorisée, sommet à mi-chemin),
  `signe-trinome-widget` (cas Δ ≤ 0, mode Défi), `signe-produit-widget` (modes Quotient et « Piège :
  produit en croix », réutilisé au § 6) ; 6 nouveaux — `completer-le-carre-widget`,
  `viete-racines-widget`, `parametre-m-widget` (§ 1), `simplification-trou-widget` (§ 4),
  `racine-etrangere-rationnelle-widget` (§ 5), `seuil-ballon-widget` (§ 7).
  **Second audit, lots A, F et G** (`scratchpad/audit-4e-ch2.md`, décisions de l'utilisateur dans
  `decisions-4e-ch2.md`) :
  - **Lot A (cours corrigé).** Un seul décompte partout (kicker, ouverture, intuition, tableau,
    « cas caché ») : **3 raccourcis** (c = 0 ; b = 0 avec ac < 0 ; carré parfait), **1 cas sans
    solution visible** (b = 0, ac > 0), le **cas général**, **1 cas caché** ; les lignes du tableau
    sont préfixées en conséquence. C2 (§ 6 : « le dénominateur peut s'annuler, le quotient n'existe
    pas »), C3 (§ 3, « système sûr » : la grille montre où CHAQUE facteur a le bon signe ; le signe
    du seul produit ne suffit que parce que N − 500 et 3000 − N ne sont jamais négatifs ensemble),
    C4 (« comme dans les pays anglo-saxons »), C5 (Viète : paragraphe « Cas Δ = 0 », b² = 4ac),
    C6 (« le premier quiz qui les utilise »). Carré parfait reconnu ((a − b)², plus « b² et 4ac »),
    label « Démonstration — formule du discriminant » (clé de l'énoncé changée avec lui), § 5 aligné
    sur l'astuce (dénominateur commun d'abord), « t ∈ ]0 ; 4[ », al-Khwārizmī partout (légende de
    l'atelier et texte visible de `completer-le-carre-widget`), majuscules d'insistance retirées,
    cartes gen4/gen6/gen67 sans texte interne. Formulaire : racine double, (k√n)² et √(k²n),
    b = 0 et ac > 0, carré parfait a(x + b/(2a))², x² − Sx + P = 0, signe des racines, ensembles
    ℝ/∅/ℝ \ {r}/{r}, valeur de CE toujours exclue ; « facteur × facteur = 0 » déplacé dans les
    raccourcis (groupe « Équation rationnelle » renommé « Fractions et CE »).
  - **Lot F (cours enrichi).** Figures `curvePlot` : 3 paraboles selon Δ (§ 1, équations du cours),
    3 paraboles colorées par le signe avec les ensembles ℝ, ∅, ℝ \ {r}, {r} (§ 2), courbe de
    (x − 1)·x·(x − 3) colorée comme la ligne « produit » (§ 3, sans axe y : l'étiquette « 0 » le
    chevauchait), courbe à trou de (2x² − 6x)/(x² − x − 6) (§ 4, branches coupées avant de sortir
    de la fenêtre fixe), figure de l'exemple graphique. Exemples : coefficients irrationnels
    (décision 3 : x² + 2√2x − 6 = 0, Δ = 32, √32 = 4√2, racines √2 et −3√2 ; puis
    x² + 6√2x + 18 = 0, Δ = 0, −3√2) avec une astuce ; équation sans solution (3x² + 12 = 0 et
    x² − 2x + 5 = 0) ; « lire f(x) ≥ k sur la parabole » (−x² + 4x + 1 ≥ 4 → [1 ; 3], lu puis
    vérifié par Δ, pont avec le ch. 1, fin du § 2). Démonstrations D4 (racine évidente, par la
    factorisation (x − 1)(ax − c), sans Viète) et D5 (signe du trinôme : grille de
    (x − x₁)(x − x₂), Δ = 0 par le carré, Δ < 0 par la forme de l'étape 4 du discriminant).
    Décision 1 : astuce « Racine évidente ou discriminant ? Les deux sont justes » (le cas général
    2x² − 10x + 8 vérifie a + b + c = 0) et synthèse (`recap`) réécrite avec le décompte commun.
    Énoncés ajoutés à `ENONCES_DEMONSTRATION` (par clé ; énoncé = ce qu'il faut démontrer).
    **Piège KaTeX** : dans `]0;1[ \cup ]3;+\infty[`, le `[` est un délimiteur ouvrant, donc ∪ perd
    ses espaces (« ]0;1[∪]3 ») ; écrire `\left]0;1\right[ \cup \left]3;+\infty\right[`.
  - **Lot G (3 ateliers).** `methodes-resolution-widget` (§ 1, après l'astuce racine évidente) :
    a, b, c entiers, 6 cartes de situation (toutes celles qui s'appliquent allumées, la première
    marquée « méthode la plus rapide »), résolution en valeurs exactes (fractions, k√m, (B ± K√m)/D)
    et seconde méthode juste (discriminant quand la racine évidente s'applique). `bicarree-widget`
    (§ 1, après l'exemple bicarré) : parabole en t, zone t < 0 grisée, t rejeté barré, ±√t sur un
    second axe, S exact. `parabole-droite-widget` (§ 2, après l'exemple graphique) : parabole et
    droite réglables, symbole, partie de la parabole qui vérifie l'inéquation en vert, S sur l'axe
    (ronds pleins/vides), trinôme f − g, Δ et S à la belge (« valeurs arrondies » si besoin).
    Fenêtres fixes, flèches d'axes, `text-align:left` sur l'hôte (le cadre d'atelier centre le
    texte). Contrôle exhaustif (`scratchpad/lot-4e2-cours/verif-ateliers.cjs`) : 6 250 réglages de
    l'atelier « 6 situations » (racines exactes réévaluées, situation prioritaire), 525 de la
    bicarrée, 54 880 de parabole/droite (S comparé à un échantillonnage de f − g) : 0 faux, 0 texte
    suspect. Calculs du cours refaits par `verif-calculs.mjs` (661 contrôles).

- **4e, Chapitre 1 — La fonction du second degré** (`fonction-second-degre`) : audit puis enrichissement
  validé par l'utilisateur (toutes les recommandations). Corrections : renvoi de l'intuition du ballon
  (section 3 puis chapitre 2), « mise en évidence de x (vue en 3e) », figure des translations déplacée
  sous « translations combinées » (sommet S(3 ; 2), axe x = 3), légende provisoire de l'atelier des
  transformations. Contenu : lire les signes de a, b, c sur un graphique (méthode, exemple, piège),
  retrouver a, b, c depuis un tableau à pas 1 (différence seconde = 2a), courbe d'étirement (x², 2x²,
  0,5x², −x²), attention « lire le sommet sur la forme canonique » (§ 1–2) ; « Trois écritures, trois
  informations » (featureTable + passage canonique → développée → factorisée), « Retrouver l'équation
  d'une parabole » (sommet + point, deux zéros + point) (§ 2) ; cas du sommet hors du domaine (optimum à
  la borne), trajectoire — hauteur maximale (§ 3) ; formulaire, récapitulatif et checklist. Clés
  d'énoncés de démonstration ajoutées. Ateliers : `parabole-widget` (zéros et image en direct, mode
  « Défi des signes » à un essai), `transformations-widget` (formes canonique et développée en direct,
  mode « Pas à pas » depuis y = x²) ; 6 nouveaux — `galilee-trajectoire-widget`,
  `differences-secondes-widget` (§ 1), `completer-le-carre-widget` (réutilisé du ch. 2),
  `trois-formes-widget`, `parabole-par-points-widget` (mode Défi) (§ 2), `optimisation-enclos-widget`
  (enclos, prix, trajectoire ; domaine restreint) (§ 3).
  **Lot H (audit 4e ch. 1), gen123–gen125** — trois cartes ajoutées : gen123 « Lire une parabole sur un
  graphique » (§ 1, après le piège « le signe de b ne se lit jamais seul »), gen124 « Premier ou second
  degré ? Différences secondes » (§ 1, après l'atelier `differences-secondes-widget`), gen125
  « Retrouver l'équation d'une parabole » (§ 2, après l'atelier `parabole-par-points-widget`). Tous
  trois sur la coquille `AppTransfertSecondDegre` (4e ch. 2), étendue de deux options additives :
  `messagesOptions` (message ciblé par option fausse d'un choix fermé) et `nombrePuces` (structure fixe :
  « ni l'un ni l'autre » de gen124 a trois écrans, la 4e puce passe « sans objet »). Champs d'expression
  du socle : préfixe « f(x) = » / « y = » recopié ignoré. Figure partagée `4e/ui/figureParaboleGrille.ts`
  (grille d'une unité, échelle unique, courbe redessinée par-dessus les graduations : leur fond blanc la
  masquait à l'ordonnée à l'origine). Notation du cours (sommet a(x − x_S)² + y_S), ni « Δ » ni
  « discriminant ». Détail papier / niveaux : `.claude/rules/feuilles-evaluations.md` (« 4e ch. 1, lot H »).

- **4e, Chapitre 5 — Cercle trigonométrique & triangles quelconques** (`cercle-trigonometrique-triangles`) :
  audit puis enrichissement validé par l'utilisateur (toutes les recommandations). Corrections : ligne
  tan α = k du formulaire (fausse pour k < 0 ; α₀ désormais défini comme l'angle aigu de rapport |k| sur
  les trois lignes), rôles pont/cible inversés dans l'exemple de la hauteur inaccessible (ABS = pont,
  BFS = cible), « angle partagé » réaligné sur gen58 (un seul point O, repère M), récapitulatif de la
  triangulation (loi des sinus OU Al-Kashi), « cinq angles du premier quadrant » → « entre 0° et 90° »,
  texte de la charpente aligné sur sa figure (SAS → entrait), sextant (loi des sinus « sphérique »),
  étiquettes O/A/P de la figure de la tangente, définition de tan θ dès le § 1. § 6 réorganisé en blocs
  complets (loi des sinus + démonstration + AAS ; cas ambigu + méthode + SSA ; Al-Kashi + démonstration +
  « pourquoi le cercle était indispensable » + SAS + contrôles + SSS ; aire + Héron ; choisir la loi).
  Ajouts : angles négatifs / plusieurs tours (§ 1) ; cos²θ = (cos θ)², exemple cos θ = −1/3, partir de
  tan θ (§ 2) ; angles sur les axes, exemple tan 150° / sin 315°, badges des démonstrations (§ 3) ;
  360° − θ = −θ, pont avec la 3e, règle de 90° + θ (§ 4) ; droite verticale pour cos, exemples k < 0,
  sin α = sin 40°, calculatrice (mode degrés, sin⁻¹/cos⁻¹, exemple cos α = 0,3) (§ 5) ; exemples
  côté partagé (terrain ABCD) et angle partagé (mât) avec figures (§ 7) ; checklist et transition vers
  la 5e. Énoncés de démonstration entièrement par clé (plus aucune entrée positionnelle). Ateliers :
  `identite-signe-widget` (mode cos connu, triangle OPM, valeurs exactes),
  `equation-trig-cas-limite-widget` (α₀ et symétrie, valeurs remarquables),
  `triangle-cas-ambigu-widget` (calcul pas à pas) ; 6 nouveaux — `cercle-explorateur-widget` (§ 1,
  défi), `valeurs-remarquables-widget` (§ 3, défi), `angles-associes-widget` (§ 4),
  `triangle-deformable-widget` et `quelle-loi-widget` (§ 6, défi), `triangulation-widget` (§ 7).

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`) : audit puis enrichissement validé par
  l'utilisateur (toutes les recommandations). Corrections : kickers des § 8 à 14 en texte brut avec des
  « _ » visibles (réécrits en mots), flèches manquantes dans la méthode de Chasles et au § 15, texte de
  l'avion aligné sur sa figure (méthode du triangle), « relation générale qui contient les deux » →
  « contient le milieu », colinéarité/orthogonalité « opposées » → « très différentes »,
  « contexte-aware » → « adaptées au contexte », transition finale (ch. 7 nommé), quiz du § 18 situé.
  Intro : le rappel des composantes (prématuré) remplacé par un pont avec la translation de 3e.
  Ajouts : vecteur nul, AB = CD ⟺ ABDC parallélogramme + piège de l'ordre des lettres (§ 1) ;
  AB + BA = 0 (§ 2) ; nul colinéaire à tout (§ 3) ; figure du parallélogramme et commutativité (§ 4) ;
  piège AB − AC = CB, exemple à réordonner, milieu par Chasles (§ 6) ; méthode de construction et
  composantes du câble dessinées (§ 7) ; soustraction en repère (§ 9) ; décomposition par système
  (§ 10) ; distance avec paramètre et nature d'un triangle (§ 11) ; quatrième sommet, symétrique,
  AM = ⅔·AB (§ 12) ; non aligné et paramètre (§ 13) ; démonstration « Pythagore généralisé » (les deux
  sens, lien Al-Kashi), triangle par ses sommets, paramètre (§ 14) ; vecteur directeur (1 ; m) de
  y = mx + p (§ 15) ; ligne « même norme seulement » (§ 16) ; démonstration du « + 2F₁F₂·cos θ » et
  résultante par les composantes (§ 17) ; formulaire, récap et checklist. Nouveaux énoncés par clé
  (dont une section `directeur`). Ateliers : `milieu-piege-widget` (modes AM = k·AB et symétrique),
  `test-colinearite-widget` (k affiché, angle droit + Pythagore), `resultante-vecteurs-widget`
  (composantes, angle 180° − θ, déviation obtuse corrigée) ; 7 nouveaux — `egalite-parallelogramme-widget`
  (§ 1 et § 12), `multiplication-k-widget` (§ 3), `somme-vecteurs-widget` (§ 4), `chasles-defi-widget`
  (§ 6, défi), `decomposition-vecteur-widget` (§ 7), `distance-triangle-widget` (§ 11),
  `vecteur-directeur-widget` (§ 15). **Piège vérifié** : le caractère combinant U+20D7 (flèche de
  vecteur) s'affiche en carré vide dans Chromium — les widgets dessinent la flèche en CSS/SVG. **Piège
  vérifié** : un atelier testé à 390 px de viewport n'a que ~308 px de large dans la page (marges du
  cadre) — vérifier le débordement interne des Shadow DOM dans la vraie page (grille de réglages de
  `somme-vecteurs-widget` corrigée : minmax 150 → 200 px).

- **4e, Chapitre 7 — Géométrie analytique plane** (`geometrie-analytique-plane`) : audit puis
  enrichissement validé par l'utilisateur (toutes les recommandations). Corrections : point (1,37 ;
  0,811) de la figure « 2 points » du § 10 hors de la droite et du cercle (→ 0,611), colonne « Équation »
  du tableau des lieux sans équation pour la parabole (→ y² = 4(x+2)), notation (a ; b) employée à la fois
  pour le vecteur normal (§ 1) et pour un vecteur directeur (§ 4) → directeurs notés (α ; β) et règle
  « directeur de ax + by + c = 0 : (−b ; a) » énoncée au § 1, « point aligné avec le centre » → « sur la
  même horizontale ou verticale », développement du cercle réécrit (D, E, F), condition de m·m′ = −1
  (aucune droite verticale ni horizontale) + encadré horizontale/verticale, transition finale (ch. 1 et
  coniques de 6e), quiz du § 11 situé. Ajouts : lecture directe de m et p (§ 2) ; m = −a/b, p = −c/b,
  pente négative (135°), angle non remarquable (§ 3) ; parallèle par un point, reconnaître la relation
  (§ 4) ; parallèles ou confondues, droite paramétrique (§ 5) ; distance entre deux parallèles (§ 6) ;
  figure des deux parallèles à distance r, médiatrice comme lieu + figure (§ 7) ; second membre ≤ 0
  (pas de cercle), tangente en un point (§ 8) ; p négatif, lien y = ax² du ch. 1 (p = 1/(2a)) (§ 9) ;
  droite tangente à une parabole, problème à partir de deux phrases, deux cercles (résout le GPS) (§ 10) ;
  formulaire et checklist. Énoncés par clé (clé `cercle` du § 10 renommée `droite ∩ cercle`, sinon elle
  aurait capté tout nouveau bloc contenant « cercle » ; section `notion-lieu` ajoutée). Le chapitre
  n'avait aucun atelier ; 7 créés — `droite-formes-widget` (§ 1), `pente-angle-widget` (§ 3),
  `relations-droites-widget` (§ 4, défi), `distance-droite-widget` (§ 6), `cercle-equation-widget`
  (§ 8), `parabole-foyer-widget` (§ 9), `droite-cercle-widget` (§ 10).
  **Lot G (nouveaux générateurs, gen92–gen95)** : cartes gen95 « Droites dépendant d'un paramètre » en § 4
  (après gen45), gen94 « Droites remarquables d'un triangle » en § 6 (après gen47), gen92 « Tangente et
  position relative » et gen93 « Déterminer un cercle par des conditions » en § 8 (après gen50) ; chaque
  carte précédée d'un court bloc de cours (« Pour aller plus loin — … ») : § 4 méthode « condition,
  équation en m, contrôle » + exemple (m² − 4)x + (m − 2)y + 3 = 0 horizontale (m = 2 rejetée) ; § 6
  paragraphe, tableau des droites remarquables (passe par / vecteur / point de concours), exemple
  hauteurs et orthocentre, astuce aire = BC · AH / 2 ; § 8 méthode « comparer la distance au rayon » +
  exemple, méthode « trouver d'abord le centre Ω » + exemple trois points (médiatrices). Énoncés par clé
  ajoutés (`droite dépendant d'un paramètre`, `hauteurs et orthocentre`, `droite et cercle : distance et
  rayon`, `cercle passant par trois points`). Registres (`registry.ts`, `evaluationAdapterRegistry.ts`
  avec `versionPapier`, `evaluationPayload.ts`, processus 2 / 3 / 3 / 2 ; libellés donnés à gen45 et
  gen47 sur la page de conception). Formulaire inchangé (choix : les règles ajoutées sont des méthodes,
  pas des formules à compléter). Descriptions de carte en Unicode (dₘ). Détail papier :
  `.claude/rules/feuilles-evaluations.md`, « 4e ch. 7, lot G — gen92–gen95 ».
  **Lot G (nouveaux générateurs gen96–gen99)** : cartes gen96 « Projeté orthogonal, symétrique et
  réflexion » en § 6 (après gen47 : gen94, prévu avant elle, n'existait pas encore dans la branche du lot
  — à déplacer après gen94 à la fusion) avec une méthode « Projeté orthogonal et symétrique d'un point »
  et une astuce « Réflexion : où viser ? », gen97 « Trajectoires et rencontre » en § 5 (après gen48,
  encadré « Deux mobiles : deux instants »), gen98 « Intersection de deux cercles » en § 10 (après gen54,
  astuce « Cercle et parabole : le cas du carré commun »), gen99 « Détective d'erreurs : géométrie
  analytique » en révision (avant le quiz) ; registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec
  `versionPapier`, `evaluationPayload.ts`, processus 3 / 3 / 2 / 3), regroupement gen96 / gen98. Détail :
  `.claude/rules/feuilles-evaluations.md`, « 4e ch. 7, lot G — gen96–gen99 ».

  - Lot H (22/11/2026) : § 7 — sous-titre « Traduire les autres lieux en équation », méthode (distance r d'une
    droite par un point et le vecteur normal ramené à la norme r, parallèle médiane par c moyen après avoir
    ramené les coefficients, parabole et cercle comme lieux), exemple « à une distance donnée d'une droite »
    (d ≡ 3x + 4y − 12 = 0, r = 10 → 3x + 4y − 62 = 0 et 3x + 4y + 38 = 0 ; énoncé par clé dans
    `ENONCES_DEMONSTRATION`), piège « décaler le terme constant de r », carte gen131. § 2 : carte gen132 après gen44.
- **4e, Chapitre 8 — Géométrie dans l'espace** (`geometrie-dans-espace`) : audit puis enrichissement
  validé par l'utilisateur (toutes les recommandations). Corrections : « la perspective centrale ne
  conserve jamais le parallélisme » (4 passages : § 1, § 11, formulaire, récap) → seules les fuyantes
  convergent, les droites parallèles à la vitre restent parallèles ; trois plans : cas « droite commune »
  (livre ouvert) oublié et image fausse du 2e cas (trois murs parallèles → faces d'un prisme / Toblerone),
  figure ajoutée ; application des jeux vidéo rattachée à la perspective centrale (caméra = point) ;
  Dürer « décrit et popularise » (idée du voile d'Alberti, 1435) ; construction du toit réécrite (faîtage
  = fuyante, pignon arrière par les diagonales) avec figure ; point de fuite précisé (une direction = un
  point ; pas de point de fuite pour les parallèles à la vitre) ; jargon « combinaison des directions »
  (§ 4) → critère du § 7 ; exemple (AG)/(EFGH) justifié par le point commun G ; démonstration par
  l'absurde annoncée au § 5 enfin rédigée ; « bancale », label « Repère », quiz situé. § 1 allégé (la
  perspective centrale renvoie aux § 10–11). Ajouts (6 sections n'avaient aucun exemple) : ce qui ne
  détermine pas un plan (§ 2) ; prouver que (AB) et (CG) sont gauches (§ 3) ; droite parallèle au plan
  (§ 4) ; (ACGE) coupe deux faces parallèles (§ 5) ; (AFH) ∥ (BDG) (§ 7) ; percée de (AJ) hors du cube
  (F milieu de [EK]) et intersection (ACGE) ∩ (BDHF) (§ 8) ; section d'un tétraèdre par point
  auxiliaire + figure construite (§ 9) ; milieu d'une fuyante par les diagonales (§ 11) ; ombre d'une
  lampe = projection centrale (§ 12). Nouveaux énoncés par clé (sections deux-droites, deux-plans,
  parallelisme, percee ajoutées). Le chapitre n'avait aucun atelier ; 7 créés (rendu 3D en SVG calculé à
  la main, rotation au doigt) — `cavaliere-reglage-widget` (§ 1), `positions-cube-widget` (§ 3–4,
  défi), `trois-plans-widget` (§ 6), `section-cube-widget` (§ 9), `fenetre-durer-widget` (§ 10),
  `point-de-fuite-widget` (§ 11), `ombre-soleil-lampe-widget` (§ 12).
  **Manuel, chantier B (25/11/2026)** : description de la carte gen40 (§ 9 `section`) complétée pour annoncer
  les trois variantes inspirées du manuel (point dans une face, points sur le prolongement d'une arête, plan
  parallèle à un plan donné) et le tableau d'appartenance du corrigé ; aucun bloc de cours ajouté (la
  méthode « deux points d'une même face », le point auxiliaire et « un plan coupe deux plans parallèles
  suivant deux droites parallèles » sont déjà aux § 5 et § 9). Détail : `.claude/rules/feuilles-evaluations.md`,
  « 4e ch. 8, manuel — gen40 ».

- **Ateliers — figure épinglée pendant la manipulation (tous chapitres)** : retour utilisateur « les
  curseurs/boutons sont trop éloignés du dessin : en les manipulant, on ne voit plus le graphe ».
  Mesuré sur les 125 ateliers montés : contrôles jusqu'à ~1 000 px sous la figure (section-cube,
  fibonacci…), parfois 300 à 500 px au-dessus (differences-secondes, trois-formes…). Correctif
  générique dans `InteractiveWidget.tsx` (`epinglerFigure`, voir `.claude/rules/interactive-widgets.md`)
  plutôt que 120 widgets remaniés. Vérifié par script sur toutes les pages : 390 × 760 → 84 ateliers
  épinglés, 0 échec (chaque contrôle visible avec la figure entière, sans recouvrement) ; 1280 × 800 →
  75 épinglés, 0 échec ; les autres tiennent déjà à l'écran, ou n'ont pas de figure SVG (5 : tableaux,
  arbres HTML).

- **5e (4h), Chapitre 5 — Dérivées et applications** (`derivees-applications`) : corrections issues de
  l'audit des générateurs (72 points, décisions A–M, toutes suivies ; 6 lots). **Cours** : notions
  demandées par les générateurs désormais enseignées — tableau de f'' et concavité (∪ convexe / ∩
  concave, PI), cas rationnel avec colonnes ∄, racines irrationnelles exactes (§5) ; démarche
  complète avec f'' et coordonnées, dans l'ordre réel de 5gen31 (§7) ; « tangente ≠ sécante »
  nuancé (localement) + exemple de double tangence (§2) ; point anguleux / rebroussement / tangente
  verticale (§4) ; nature de l'extremum par le tableau de signes, exemple « marges », sin² = 1 − cos²
  (§8) ; écart en %, coût marginal minimal (C'' = 0), coût moyen + dichotomie (§9) ; s(t) partout,
  exemple s(t) = D / racine négative rejetée / × 3,6 / vitesse constante (§11). Badge de §10 qui
  donnait la réponse renommé. Quiz 5gen43 réécrit (10 V / 10 F par thème, plus de méta-affirmations
  ni d'épouvantails, mots absolus équilibrés, `TexteRiche5e`). **Générateurs** (conventions : sous-
  titre « Chapitre 5 — Dérivées et applications », compteur de génération dans la clé d'écran, une
  seule tentative sur les choix fermés, placeholders hors tirages, aides en LaTeX, virgule) :
  5gen25 énoncés justes et discriminants, doublons rejetés, extremums visibles ; 5gen26 forme
  développée/simplifiée exigée (message sans tentative), plus d'écran qui fait recopier m, plus de
  f constante ; 5gen27 décompositions équivalentes acceptées, plus de f constante ni non
  simplifiée ; 5gen28 préfixes « y = »/« t = », valeurs exactes exigées, écran de pente en q sans
  réponse annoncée ; 5gen29 valeurs rationnelles exactes exigées (irrationnelles au centième), puces
  en nombre fixe (état « sans-objet » de `ProgressionPuces`), a de signe quelconque ; 5gen30 courbe
  construite par morceaux (asymptotes réelles = annoncées), positions demandées avant les tableaux,
  paliers, ≤ 3 PI, 6 écrans fixes ; 5gen31 écran « coordonnées », courbe masquée pendant le
  placement, tolérance 11 px, asymptote horizontale non nulle (`decalage`) ; 5gen32 vraie réponse
  attendue à chaque écran, trapèze en test entier, schémas SVG, nature par F' en points test,
  variante cubique hors tirage libre ; 5gen33 tirages économiques réalistes, coût moyen / coût
  marginal minimal au lieu de l'« extremum du coût total », écran de cohérence supprimé ; 5gen34
  dérivée comparée exactement, écran « résoudre f'(t) = 0 », tableau borné [0 ; T] (props `bornes`/
  `variable` de `TableauEtudeLocaleBuilder`/`TableauEtudeLocaleRecap`), quartiques allégées ;
  5gen35 s(t), écran accélération, contextes réalistes par mobile (b = 0 si « s'élance »).
  **Piège rencontré** : `join("\\quad")` sans espace produit `\quadf…` (erreur KaTeX dans les fiches
  des puces) — corrigé en `join(" \\quad ")` dans tous les récapitulatifs 5e et le 4e
  `recapitulatifEquationRationnelle.ts`. Restes pour la refonte des feuilles : adaptateurs à l'ancien
  découpage (5gen26 affine, 5gen30, 5gen32 A''), `valeurFLocal` de 5gen31 sans `decalage`.

- **5e (4h), Chapitre 5 — Dérivées et applications** (suite) : refonte des feuilles d'exercices et
  évaluations (méthode `feuilles-evaluations.md`, 4 lots). Les 11 adaptateurs (5gen25–35) remplissent
  tout le contrat (difficulté, réponse brève, corrigé « Étape n » avec ligne « Piège », barème sur 4,
  `enoncePapier`, durée, `profilInstance`), sans place de réponse ; `versionPapier` dans le registre ;
  `?code=` lu par les 11 applis (mêmes fonctions/catalogue que l'adaptateur — 5gen25 : catalogue
  filtré `CATALOGUE_VARIANTES_EXPORT_ASSOCIATION`). Figures du corrigé : tableaux de signes (KaTeX,
  ou SVG générique `export5e/svgTableauVariations.ts`), graphe annoté de 5gen30/5gen31, schémas SVG
  de 5gen32 dans l'énoncé. Profils : `profilsEvaluationDerivees25-27/28-30/31-33/34-35.ts` ;
  calculatrice indispensable pour 5gen29 irrationnelles, 5gen31 (3 variantes), 5gen32
  cylindre-application, 5gen33 A-degré3-sans-extremum et dichotomie, 5gen34 variantes quartiques ;
  paramètre au choix « vitesse initiale non nulle » (5gen35, récits « déjà lancé » pour les 7
  contextes). 5gen32–35 en processus 3. Démonstrations : 23 énoncés appariés PAR CLÉ, chapitre ajouté à
  `CHAPITRES_ENONCES_VERIFIES` ; questions de compréhension en KaTeX. `TableauEtudeLocaleBuilder` :
  version dense dès 5 colonnes (lisible à 390 px jusqu'à 12 colonnes). Piège : une chaîne JS
  `"\left…"` à antislash simple perd ses commandes (`\r` devient un retour chariot) — corrigé dans
  `formatAssociation.ts`, aucun autre cas hors attributs JSX (où l'antislash simple est correct).

- **5e (4h), Chapitre 5 — Dérivées et applications** (suite) : audit du contenu puis enrichissement
  validé (toutes les recommandations). Erreurs corrigées : canette (h = 2r juste dans le modèle,
  mais une vraie canette a h ≈ 3,5r — fond/couvercle plus épais, explication ajoutée) ; application
  « sprinteur » (texte contredisant le modèle logistique) remplacée par une épidémie (pic des
  nouveaux cas = point d'inflexion de N) ; médicament en modèle calculable en 5e (10t/(t²+4), pic
  t = 2 h) ; rappel « dériver un polynôme dès maintenant » en §2 (les exemples utilisaient les règles
  de §3) ; √x dérivable pour x > 0 ; règle (k·u)′ ; rappels vides → sous-titres ; tableaux des
  dérivées de référence et de la chaîne transposés en 2 colonnes (lisibles au téléphone) ; tableau
  des grandeurs de §11 précisé ; Agnesi (1750, 32 ans) ; Fermat « adégalité » ; §4 renommée « Signe
  de f′ et de f″ : variations et concavité » ; forward vers la 6e. Ajouts : tableau de convergence
  des taux (§1), approximation affine (§2), notation de Leibniz (§3), dérivable ⟹ continue (§4),
  lecture du graphique de f′ (§6), étude complète d'une cubique (§7), boîte sans couvercle (§8),
  distance de freinage + historique Newton/fluxions (§11) ; 5 énoncés de démonstration par clé
  (clé « étude complète » renommée « avec asymptote oblique » pour lever l'ambiguïté). Ateliers :
  7 nouveaux — `secante-tangente-widget` (§1), `zoom-tangente-widget` (§2),
  `f-fprime-fseconde-widget` (§4, modes « devine f′ » et « lecture inverse »),
  `boite-carton-widget` et `canette-optimale-widget` (§8), `dichotomie-widget` (§9),
  `mobile-piste-widget` (§11, freinage) ; 3 améliorés — `point-critique-signe-widget` (tableau de
  signes en direct, concavité), `recette-benefice-widget` (curseurs a et c, courbe de B),
  `extrema-bornes-widget` (deux bornes, 3 fonctions, liste des candidats). Piège retrouvé :
  `epinglerFigure` ne retient qu'une `<svg>` d'au moins 120 × 80 px — `mobile-piste-widget` empilait
  4 svg de 57–71 px, jamais épinglées ; graphes passés à ≥ 80 px de haut (HG 92 → 110). Vérifié :
  0 débordement interne à 308 px, épinglage 390 × 760 et 1280 × 800 sans échec (les 3 non épinglés
  tiennent à l'écran), 0 erreur KaTeX/console, 0 `$` visible.
- **5e (4h), Chapitre 5 — Dérivées et applications** (suite) : nouveaux générateurs 5gen68–70.
  Cartes 5gen68 « Approximation affine » en § 2 (après 5gen28, précédée d'un `attention` « Erreur
  commise, h négatif et radians »), 5gen70 « Taux de variation instantané en contexte » en § 3 (après
  5gen27 ; `attention` « Unité et signe d'un taux de variation » juste après le tableau taux moyen /
  nombre dérivé), 5gen69 « Déterminer une fonction par des conditions » en § 5 (après 5gen29, précédée
  d'une `astuce` « Retrouver une fonction à partir de conditions ») ; aucun nouvel exemple (pas
  d'énoncé de démonstration à ajouter). Registres (`registry.ts`, `evaluationAdapterRegistry.ts` avec
  `versionPapier`, `evaluationPayload.ts` : processus 2 / 3 / 2 ; libellés des lignes pilotes 5gen27,
  5gen28, 5gen29 remplis). Détail : `.claude/rules/feuilles-evaluations.md`, « 5e ch. 5, nouveaux
  générateurs — 5gen68–70 ».
- **5e (4h), Chapitre 5 — Dérivées et applications** (suite) : audit du 24/11, lots A, E, F, G (toutes
  les recommandations validées). **A (cours)** : astuce « La même méthode, même avec une racine » (le
  taux de √x donne 0⁄0, jamais ∞ − ∞) ; dichotomie « à moins de 0,04 près » (dernier intervalle de
  largeur 0,0625) ; Barrow QUITTE sa chaire (théologie) et RECOMMANDE Newton (plus de « cède à son
  élève ») ; point critique sans extremum = inflexion « pour les fonctions de ce chapitre » ; sommet
  lisse (en un point anguleux f′ n'existe pas) ; tableau taux / nombre dérivé transposé (une ligne par
  lecture) ; Fermat 1601 ou 1607 ; Rm = Cm en KaTeX. Parcours : 3 parties (« Le nombre dérivé et la
  tangente » 1–3, « Signe de f′ et de f″ : étudier une fonction » 4–7, « Optimiser et modéliser »
  8–11), 11 `titreCourt`, 31 phrases d'`essentiel`, 42 cartes (une « Où est l'erreur ? » par section,
  tirée de ses pièges). Formulaire : groupe « Conditions, unités, distances et temps » (5gen69–71) ;
  banque « Formule » : unité de f′(a), conditions sur ax³ + bx² + cx + d, AM², t = d/v, freinage.
  Questions de compréhension : « toujours » retiré (fonction dérivable, polynôme). **F** : 11
  démonstrations tirables (D2–D12 : produit, (k·u)′ et (u + v)′, (xⁿ)′ de proche en proche, quotient
  par 1⁄v, tan, racine double au contact, dérivable ⟹ continue, f′(a) = 0 en un extremum intérieur,
  carré et canette h = 2r, Rm = Cm et C′ = C_M, freinage v₀²/(2a)) et 6 exemples (√(x + 5) par la
  définition, Δ < 0 sans tangente horizontale, f(a) et f′(a) lus sur une tangente tracée, unité et
  signe d'un taux, quatre conditions, point de √x le plus proche) ; 17 énoncés par clé — clés
  « bénéfice maximal, vérification » et « coût moyen minimal, par dichotomie » précisées (sinon
  ambiguës avec D11) ; le libellé de D12 évite « distance de freinage » (clé de l'exemple). D8/D9 sont
  AU MILIEU du § 4 (l'exemple « dérivée à gauche et à droite » du lot H va en fin de § 4). **E** : quiz
  5gen43 = 10 thèmes × 35 (18 V / 17 F), « applications en contexte » réparti en `optimisation`,
  `economie`, `extremaBornes`, `mouvement` ; `nombreQuestions` / `etendueNombreQuestions` (accueil
  calculé) ; `QUIZ_THEMES_EVALUATION_PILOTE` un thème par section (§ 5–6 partagés) — un plan enregistré
  avec l'ancien thème `applicationsEnContexte` retombe sur plateforme-maths. **G** : 5 ateliers KaTeX
  (`katex-shadow.js` + `limites-commun.js`) : `approximation-erreur-widget` (§ 2, erreur ÷ h²),
  `rectangle-produit-widget` et `engrenages-chaine-widget` (§ 3), `fprime-vers-f-widget` (§ 6 :
  prédictions jugées ✓ / ✗ puis f révélée — le mode « lecture inverse » de `f-fprime-fseconde-widget`
  n'a ni prédiction ni f′ réglable), `etude-complete-widget` (§ 7, question → réponse, tableau et
  figure construits étape par étape) ; `mobile-piste-widget` : 75 km/h ajouté (exemple 50/75 km/h).
  Vérifié : KaTeX strict sur 1 375 champs (chapitre, quiz, « Formule ») et les 48 énoncés, 0 erreur ;
  étapes et onglet Réviser iPhone 13 / 1 280 px, clair / sombre : scrollWidth = largeur, 0
  `.katex-error`, 0 texte brut suspect, 0 erreur console, 42 cartes retournées ; ateliers ouverts dans
  le panneau et manipulés : 0 NaN, 0 erreur ; quiz : chaque thème parcouru en entier (35 / 35, sans
  répétition) ; documents réels (vrai/faux des 10 thèmes en une question, 6 démonstrations tirées).
  Piège de mesure : les `<path>` des racines KaTeX (largeur en em) dépassent leur boîte — faux
  « débordements », à exclure.

- **6e (6h), Chapitre 5 — Nombres complexes** (`nombres-complexes`) : corrections issues de l'audit
  des générateurs (68 points, décisions A–M, toutes suivies ; 5 lots). Utilitaire commun
  `diagnostiquerAngle`/`ecartAngulaire` (`moteur6e/equivalenceExponentielle.ts`) : angles acceptés à
  2kπ près partout (refus « non réduit » seulement si la consigne exige ]−π ; π], message « en
  radians » pour une saisie en degrés, sans tentative). Parseur partagé `expressionComplexe.ts` :
  normalisation additive (« − », « · », « × », « √ », « ² », sqrt) — 93 332 saisies ASCII rejouées
  sans différence — et exposant borné (« 6^99^51 » figeait le navigateur ; exponentiation rapide
  au-delà de 64, refus au-delà de 10⁶). Conventions : compteur de génération dans la clé d'écran,
  parse_error sans tentative, une seule tentative et options mélangées par graine sur les choix
  fermés, forme réduite exigée (énoncé recopié refusé), placeholders hors tirages, aides en LaTeX,
  `\arg`. Par générateur : 6gen34 (aide fausse −i/k, réponses non soufflées, nombres bornés) ;
  6gen35 (méthode du cours x²+y²=√(a²+b²), ±x, famille milieu/distance, parallélogramme entier,
  `PlanArgandMini`) ; 6gen36 (tirage libre = Δ<0 et bicarrée réels, autres familles en
  « approfondissement » au sélecteur, r₁ ou r₂) ; 6gen37 (axes ~10 % via option de
  `tirerZAvecAngleRemarquable`, famille E en π/12 avec cos et sin séparés) ; 6gen38 (recopies
  refusées, cos³ accepté, 2 variantes nouvelles) ; 6gen39 (ensemble des racines à 2π près,
  tolérance annoncée, 2√5) ; 6gen40 (famille z′ = az + b, figures) ; 6gen41 (verdicts variables,
  4 cas de triangles, famille alignés/perpendiculaires, figure montrée seulement APRÈS les verdicts) ;
  6gen42 (D_reelles résoluble, équations à un multiple près et formes équivalentes, lieux du cours
  au tirage libre, Thalès/Apollonius en approfondissement, familles pauvres enrichies). Cours :
  équation à coefficients complexes (§3), parallélogramme (§2), isocèle rectangle (§8), exemple
  « classer z′ = (1+i)z + 2 » (§7), cartes alignées, badges propres. Quiz 6gen68 réécrit (10 V /
  10 F par thème, « chapitre 5 »). Catalogues : entrées ajoutées (données seulement, composant du
  sélecteur intact).

- **6e (6h), Chapitre 5 — Nombres complexes : refonte des feuilles et évaluations (6gen34–42)**,
  décision M de l'audit des générateurs, après les corrections des lots A–E. Les 9 adaptateurs
  `exportEvaluation.ts` suivent tout le contrat de `.claude/rules/feuilles-evaluations.md` :
  énoncé papier = données + consigne globale (plus de « en posant », « isole z », QCM d'écran ni
  verdict annoncé), étapes d'écran → « Étape n » du corrigé, ligne Piège, barème 4 pts sans critère
  < 0,5, figures en `figureHtml` du corrigé seulement (parallélogramme/milieu 6gen35, point z 6gen37,
  polygone des racines 6gen39, points/images 6gen40, triangle après les verdicts 6gen41, lieux
  6gen42 — plan complexe partagé `generateurs6e/figuresPlanComplexe40-42.ts`), `versionPapier(...)`
  pour les 9, `?code=` dans les 9 applis (sélecteurs intacts), 6gen42 en processus 3.
  Profils de tirage équilibré : `profilsEvaluationComplexes34-36.ts` (`calcul` absent, convention
  de `profilsEvaluationLogarithmes.ts` — avec `'exacte'`, une évaluation « calculatrice autorisée »
  ne tirait plus aucun cas particulier), `…37-39.ts` (6gen38 : `forme` = cible SEULE ; avec n + cible,
  chaque série recevait exactement les douze mêmes exercices), `…40-42.ts` (verdicts de 6gen41 C/D
  dans `forme`, aucun cas particulier). Calculatrice indispensable : 6gen39 B, 6gen41 B.
  Démonstrations du chapitre réécrites PAR CLÉ dans `ENONCES_DEMONSTRATION['nombres-complexes']`
  (25 exemples, dont le nouvel exemple « classer une transformation z′ = az + b ») et chapitre ajouté
  à `CHAPITRES_ENONCES_VERIFIES`.
  Correctifs trouvés pendant la refonte : 6gen42 B « intersection » — la condition (1)
  (z−q₁)/(z−q₂) réel excluait q₂, pourtant donné comme point d'intersection → (z−q₁)/(q₂−q₁) réel
  (même droite, sans point exclu) ; `fracSimplifiee` (6gen37/39) sort le signe de la fraction
  (« +(−1)/2 i » à l'écran) ; racines n-ièmes : √ sans indice 2 et θₖ = 2kπ/n sans « 0 + » ;
  congruence « n = 8p » sans « 0 + » ; 6gen36 : coefficient imaginaire pur « iz »/« −5iz », plus
  « (i)z ». Reste à l'écran (lignes LaTeX seules) : « \text{réels : } » de 6gen38, corrigé sur papier.
  Vérifié : collecteurs (≈ 154 000 formules KaTeX strictes, 0 anomalie), documents réels des 9
  générateurs (2 graines, modes exercice/évaluation, aménagée) — 0 erreur KaTeX, 0 débordement à
  680 px et 1 280 px ; `?code=` rouvre l'instance (69/69) ; `npm run build` propre.

- **6e (6h), Chapitre 5 — Nombres complexes : contenu + ateliers** (audit de contenu accepté en
  entier). Erreurs corrigées : historique Cardan/Bombelli (√−15 vient du problème du 2nd degré
  « partager 10 en deux parts de produit 40 » ; le 3e degré x³ = 15x + 4 est l'épisode de Bombelli,
  avec un nouvel exemple « le calcul de Bombelli » (2+i)³ = 2+11i) ; titre Euler (« élue la plus
  belle », pas « jugée par Euler lui-même ») ; méthode de l'argument (a < 0 : +π si b ≥ 0, −π si
  b < 0 ; a = 0 : ±π/2 ; convention ]−π ; π]) ; figure du cycle économique recalculée avec
  zₙ₊₁ = r·e^{iπ/3}·zₙ (le premier pas ne tournait pas) ; Moivre pour n ≤ 0. Les 7 exemples à une
  seule étape sont détaillés en 2–4 étapes. Ajouts : symétries z̄/−z avec figure et racine carrée
  par √r·e^{iθ/2} (§2), vérification par somme/produit (§3), tableau des angles remarquables et
  exemple algébrique → exponentielle 1+i√3 / −1−i / √3−i (§4), linéarisation cos²x et cos³x
  jusqu'à la primitive de cos²x (§5), racines cubiques de −8 reliées à z³+8 = (z+2)(z²−2z+4) (§6),
  composition de deux rotations de centres différents (§7), angle orienté arg((z_C−z_A)/(z_B−z_A))
  et test équilatéral e^{±iπ/3} avec exemple (§8), médiatrice |z−a| = |z−b| et exemple
  |z−1| = |z+i| → y = −x (§9) ; formulaire et récapitulatif complétés ; 7 nouveaux énoncés de
  démonstration par clé. Choix assumés : la figure des symétries étiquette les points par leur
  valeur (2−i, −2−i…) car la barre de « z̄ » se plaçait mal dans la police des figures ; la
  linéarisation n'est pas au formulaire (aucun générateur ne la demande).
  7 nouveaux ateliers : `operations-plan-complexe-widget` (§1, z et w déplaçables, z+w, z−w, z̄,
  −z, 1/z, z·w, ×i), `racine-carree-complexe-widget` (§2, un tour de z = un demi-tour des racines),
  `racines-qui-se-rencontrent-widget` (§3, racines de z²+bz+c qui se rejoignent quand Δ = 0 puis
  repartent conjuguées), `euler-cercle-widget` (§4, aimant en θ = π), `spirale-puissances-widget`
  (§5, r < 1 / r = 1 / r > 1, version manipulable du cycle économique), `triangle-rapport-affixes-widget`
  (§8, quotient q affiché, 5 verdicts, aimants indispensables : aucun triangle équilatéral n'a ses
  3 sommets à coordonnées entières), `lieux-complexes-widget` (§9, mod 2π vs mod π, médiatrice).
  3 ateliers améliorés : `produit-modules-arguments-widget` (mode « × i répété », formes a+bi),
  `racines-niemes-widget` (formes exactes, case « Vérifier », préréglages −8 et 8i, `^` affichés
  supprimés), `transformation-az-b-widget` (réécrit : M déplaçable et M′, Ω/angle/rapport, mode
  « Composer » montrant que l'ordre compte). Vérifié : `npm run build` propre (vérificateur des
  énoncés OK), page réelle en 390 clair/sombre et 1280 : 0 débordement, 0 `$` isolé, 0 erreur
  KaTeX, 0 NaN, 10 ateliers montés sans débordement interne ; figure épinglée : 5 ok, 0 ko
  (les 5 autres ateliers tiennent à l'écran, pas d'épinglage requis).

- **5e (4h), Chapitre 2 — Trigonométrie : audit de contenu appliqué** (accepté en entier).
  Erreurs : angle d'Archimède (l'angle au centre vaut 360°/n, sa moitié α = 180°/n intervient dans
  le triangle rectangle) ; application du théodolite → loi des sinus (vue en 4e) ; collision de
  notations (second membre noté c, k ∈ ℤ conservé, « ici a joue le rôle de ω et b celui de φ »,
  2π/ω en §6 — titre et whereLabel de la carte 5gen10 intacts ; c désigne aussi la corde en §3,
  comme dans 5gen12, sections distinctes) ; rappel d'arcsin ; durée du jour (≈ 365,24 j, b ≈ 12 h à
  toutes les latitudes, modèle affiché en sinus, déplacée en §8) ; « − » typographique dans les
  étiquettes ; figure §6 graduée (π/9, 4π/9, 7π/9, axe des y, min en `bad`) ; Fourier nuancé
  (preuve de Dirichlet, 1829) ; récap tourné vers la 6e ; carte du quiz 5gen40 alignée sur ses 7
  thèmes. Structure : pont « le point qui tourne trace la courbe » et rappel du cercle
  trigonométrique (16 angles, tableau, Hipparque, vidéo « Arcs et secteurs (3/3) ») déplacés de §1
  en ouverture de §4 ; `secteur-segment-widget` en §2, `sinusoide-widget` en §4 (problème direct) ;
  tableau « Quelle méthode ? » en tête de §7. Contenu aligné sur les générateurs : essuie-glace,
  corde → angle θ = arccos(1 − c²/(2r²)), lentille (§3, 5gen12) ; A < 0 (§4, §6) ; φ par le
  maximum, réduction et vérification (§5) ; valeurs b ± |A| et liste des extremums dans [0 ; 2π]
  (§6) ; solutions dans [0 ; 2π[, exemple tangente, second degré à deux racines gardées (§7) ;
  départ hors extremum, deux candidats φ départagés par le sens de variation (§8) ; formulaire et
  récap complétés ; 6 nouveaux énoncés de démonstration par clé.
  7 nouveaux ateliers : `radian-enroule-widget` (§1), `lentille-essuie-glace-widget` (§3),
  `courbe-mystere-widget` (§5, aucun score), `substitution-cos-widget` et
  `intersections-trig-widget` (§7), `seuil-grande-roue-widget` et `duree-jour-latitude-widget`
  (§8 ; formule cos H₀ = −tan(lat)·tan(δ), sans réfraction : 16 h 17 à Bruxelles au solstice, le
  widget le signale). 7 ateliers améliorés : modele-sinusoidal (h₀ libre + sens, deux candidats φ),
  sinusoide (flèche Φ = −φ/ω), equation-trig (second membre c, solutions dans [0 ; 2π[, valeurs
  interdites de tan), archimede (mode doublement 6 → 96, graphe des bornes), secteur-segment (angle
  libre, corde par la loi des cosinus), extremums-sinusoide (A < 0, liste dans [0 ; 2π]),
  cercle-trigo (aimant sur les angles remarquables, valeurs exactes). Correctifs d'intégration :
  étiquettes « max/min » décalées de l'axe vertical et « t = 0 » posée à côté du point ; sélecteurs
  d'archimede et d'extremums qui débordaient de 9 et 18 px à 390 px (`max-width:100%`, retour à la
  ligne). Vérifié : `npm run build` propre, page réelle 390 clair/sombre et 1280 : 0 débordement,
  0 `$` isolé, 0 erreur KaTeX, 0 NaN ; 14 ateliers montés sans débordement interne ; figure
  épinglée 6 ok / 0 ko à 390 px, 7 ok / 0 ko à 1280 px (les autres tiennent à l'écran).

- **5e (4h), Chapitre 1 — Fonctions composées : corrections des générateurs** (audit 5gen1–5,
  quiz 5gen39, accepté en entier). 5gen1 : plus de blocage après une erreur de radicande (√N/D),
  aides de méthode sans symbole ni conclusion, une seule tentative sur l'écran CE, condition
  toujours vraie « x²+… ≠ 0 » acceptée comme « Aucune CE », `verifierEnsembleReelGuide` devenu
  ensembliste (ℝ∖{2} ≡ ]−∞;2[∪]2;+∞[ — partagé, n'accepte que des équivalents en plus),
  « −\dfrac{5}{3} », coefficients négatifs tirés, trinômes sans racine variés, « \operatorname{dom}f ».
  5gen2 : décomposition triviale refusée (≥ 2 lignes, fonctions de référence, sans identité, message
  sans perte de tentative), f construite couche par couche (a(…)+b non distribué, termes ordonnés),
  valeurs absolues redondantes retirées, champs vidés, ∛/÷/variable t acceptés. 5gen3 : toute forme
  équivalente bien structurée acceptée (forme non simplifiée → message sans perte de tentative),
  référence normalisée, écran C2 = conditions élevées au carré seulement, aides corrigées, conditions
  sans ordre imposé, tirage équilibré. 5gen4 : graphes SVG autonomes à grille unitaire fixe,
  segments droits, extrémités pleines, « − » ; 1 ou 2 questions « n'existe pas », ordre mélangé ;
  une seule tentative sur le choix d'existence. 5gen5 : A3–A5 retirés (contextes absurdes), A2 avec
  relevés chiffrés, B en valeurs exactes, C sur tableau de valeurs avec une seule lecture graphique
  (seuil, tolérance proportionnelle), aides en KaTeX, corrigé papier en b/3 exact. Quiz 5gen39 :
  140 affirmations en KaTeX, jargon et doublons retirés, 20 par thème (10/10). Contenu : formulaire
  réécrit (15 formules, conditions descriptives), deux démonstrations (associativité ; pourquoi
  dom(f∘g) exige x ∈ dom g et g(x) ∈ dom f), énoncés par clé, chapitre vérifié au build.

- **5e (4h), Chapitre 1 — refonte des feuilles et évaluations (5gen1–5)**, décision K. Les 5
  adaptateurs suivent tout le contrat (`feuilles-evaluations.md`) : énoncé papier = données +
  consigne globale (5gen4 : « Calcule, si elles existent, les valeurs suivantes », graphes
  `svgGrapheComposee` à grille unitaire dans l'énoncé ; 5gen5 : scénarios A1, A2, B1–B5 et les 12
  combinaisons de C, relevés en tableau), corrigés en « Étape n » (5gen1 : chaque condition puis
  intersection, tableau de signes au corrigé ; 5gen3 : substitution, deux conditions,
  \operatorname{dom}(f∘g) ; 5gen4 : « g(f(5)) n'existe pas » sans « = »), ligne Piège, barème 4 sans
  critère < 0,5, durée, `versionPapier`, `?code=` dans les 5 applis (catalogues partagés app ↔
  adaptateur), profils `profilsEvaluationFonctions1-2.ts`, `…3-4.ts`, `…5.ts` (cas particuliers 5gen1 :
  « pas de CE », « condition toujours vraie » ; 5gen5 A1 calculatrice indispensable). `svgGraph.ts`
  gagne `divisionsX`/`divisionsY` (ajout pur). Crochets inversés en `\mathopen{]}`/`\mathclose{[}`
  à la source dans `formatEnsembleReelLatex` (5e et 6e) : KaTeX espaçait « ]−∞ » comme une
  soustraction. Correction d'écran 5gen5 A1 : h = 2x montré au rayon optimal EXACT ∛(V/2π) (au rayon
  arrondi, h(7) ≈ 16 ≠ 14). Vérifié : collecteurs (≈ 240 000 formules KaTeX strictes, 0 anomalie),
  documents réels 2 graines (0 erreur KaTeX, 0 débordement), `?code=` 62/62, plans à 2 séries,
  `npm run build` propre.

- **5e (4h), Chapitre 1 — lots B, C, D de l'audit (5gen1–5)**. Règles communes : « − – — »,
  fractions et milliers lus ; illisible et incomplet sans tentative (moteurs et écrans) ; aides à 2
  niveaux en KaTeX partout ; messages ciblés ; ni points ni pénalités ; sélecteurs intacts.
  Contenus : 5gen2 sans affine sur la couche brute (2 couches), |x|³ ; 5gen3 allégé (bornes de
  dénominateur ≤ 12, plus de √u/u, deux combinaisons retirées du tirage, condition 2 sans effet
  gardée 1 fois sur 5, plus de « x·−1 ») et domaine vide en cas particulier (≈ 11 %) ; 5gen4 graphes
  déclarés complets, 0 à 3 « n'existe pas », valeurs intermédiaires distinctes ; 5gen5 B4 retiré
  (`retiree`), quantités B en centaines (coût total en centaines d'euros), B3 croissant, objets A1
  réalistes (boîte de conserve, bouteille, pot de peinture, cartouche, canette, bidon) avec
  V = 432π ou 686π cm³ (h = 2r exact au rayon lu), minimum A2 et seuil C entiers sur la grille,
  légende sous les graphiques, milliers espacés, même objet et même lettre à l'écran et sur papier,
  « partie non proportionnelle CV(x) ». Ce qui reste ouvert de l'audit : lot A (cours), lot E (quiz),
  graduations « 2000 » des axes de `svgGraph` (partagé, non espacées).

- **5e (4h), Chapitre 1 — Fonctions composées : audit de contenu appliqué** (accepté en entier).
  Erreurs : coût unitaire c(x) = C(x)/x présenté comme un QUOTIENT, avec une vraie composition
  économique à la place (ventes ← budget publicitaire, recette ← ventes) ; « hors domaine » (n'existe
  pas) distingué de « hors portion tracée » (pas lisible), aligné sur le quiz ; sous-titre §1
  reformulé ; exemple « domaine vide » en double condition (image de g disjointe de dom f, figure) ;
  unités hors mode math ; rappel « 2 opérations à surveiller, 2 sans danger ». Ajouts : notion
  d'image (intro, projection sur Oy) ; §1 : √(N/D) avec tableau de signes, N/√D strict avec
  changement de sens, dénominateur du 2e degré, piège du changement de sens ; §2 : f∘g et g∘f en
  expressions ; §3 réordonné (substitution → double condition → exemple « substituer puis
  simplifier » 3/x ∘ 7/(4x+6) = (12x+18)/7 sur ℝ∖{−3/2} → démonstrations, associativité en « Pour
  aller plus loin ») ; §4 : astuce du report par y = x ; §5 : coût unitaire par système (5gen5 B),
  bénéfice et seuil de rentabilité avec figure (5gen5 C) ; application « réactions chimiques »
  retirée (doublon de la chaîne de montage) ; formulaire (+6) et récap alignés ; 7 énoncés par clé.
  Piège trouvé : « $f…$ \qquad $g…$ » dans un champ `formula` affichait « \qquad » en clair (hors
  formule) — écrire les deux fonctions dans UNE seule formule.
  5 nouveaux ateliers : `detecteur-domaine-widget` (§1, bandes par condition, intersection, tableau
  de signes de N/D, sonde), `constructeur-composees-widget` (§2, briques, échange f∘g ≠ g∘f, défi),
  `simplification-piege-widget` (§3, formule simplifiée contre vraie composée), `bidon-optimal-widget`
  (§5, minimum en r = ∛(V/2π), h = 2r), `seuil-rentabilite-widget` (§5, CT/CA/bénéfice, coût unitaire
  quotient) ; `composition-graphique-widget` (§4) = sous-classe de la machine à composer ouverte en
  mode « un seul repère + y = x ». Améliorés : `composition-machine-widget` (mode y = x, préréglage
  « hors portion tracée »), `domaine-composee-widget` (image de l'intérieure en bande, préréglage
  « simplification piège »). Vérifié : `npm run build` propre, page réelle 390 clair/sombre et
  1280 : 0 débordement, 0 `$` isolé, 0 erreur KaTeX ; 8 ateliers montés ; figure épinglée 0 ko.

- **6e (6h), Chapitre 6 — Probabilités : audit des générateurs appliqué** (décisions A–M acceptées).
  Brique partagée `moteur6e/verificationProbabilites.ts` : `diagnostiquerProbabilite(texte, cible,
  decimalesMin?)` remplace la tolérance absolue 0,01 (qui acceptait 0,34 pour 1/3, 0 pour 1/120) :
  écriture exacte, ou décimal arrondi correctement avec ≥ 2 décimales (≥ 3 sous 0,1), ou « 33 % » ;
  pile au milieu (0,135) seul l'arrondi supérieur (0,14) est juste. Indépendance EXACTE
  (`TOLERANCE_PROBABILITE` 1e−9, `sontIndependantsEffectifs`) : avec 0,01, « somme = 3 » et « dés
  égaux » (incompatibles) étaient déclarés indépendants. Générateurs : 6gen30 nouvelle question
  « incompatibles / indépendants / ni l'un ni l'autre », « égal » possible, écran 1 en vrai tableau,
  famille B rééquilibrée (≈ 50 % indépendants — avant : jamais sur les dés, 82 % sur les cartes) ;
  6gen31 famille D « arbre pondéré » (4 écrans), aides par chemins (plus de C(n,k), « loi »), famille
  C sans équation à recopier ; 6gen32 contextes A ⊂ B supprimés (loterie, capteurs météo), Bayes
  réaliste, histogramme remplacé par « tester l'indépendance depuis un tableau » ; 6gen33 recentré
  (géométrique, financier, paramétrique, dérangements retirés ; anniversaires et série/parallèle
  gardés), comptage des chemins au lieu de C(n,k). Nouveaux : 6gen74 « Arbre, tableau, effectifs »,
  6gen75 « Fréquence et probabilité » (règle d'écart relatif selon n, sans intervalle de
  fluctuation), 6gen76 « Quand l'intuition se trompe » (Méré, Monty Hall 3–5 portes, deux enfants ;
  écran de prédiction non noté). Feuilles : 7 adaptateurs au contrat complet (figures SVG : tableau
  à double entrée, arbre pondéré, schéma série/parallèle ; inconnues marquées « ? », jamais de case
  vide ; `?code=` ; verdict jamais cas particulier). Quiz 6gen69 sans C(n,k)/A(n,k) ni grand calcul.
  Vrai/faux câblés dans les feuilles pour les 7 chapitres de 6e ; piège trouvé : une affirmation
  tirée SEULE sur une feuille perd le contexte de la précédente (« Toujours dans ce groupe ») —
  ≈ 380 énoncés rendus autonomes ; et des affirmations portaient sur le CODE des générateurs
  (quizConiques ≈ 50 : « BigInt », « `.field` »…) — réécrites en mathématiques. Cours : badges
  parlants, 2 démonstrations (règle du produit ; épreuves répétées par nombre de chemins), §4
  anniversaires et série/parallèle, 18 énoncés par clé (vérifiés), 53 virgules → `{,}`.
  `masquerMembresDeDroite` coupe au premier « = » de niveau 0 (« P(X=k) = … »).

- **6e (6h), Chapitre 6 — Probabilités : audit de contenu appliqué** (accepté en entier).
  Erreurs : l'historique attribuait à Méré un pari sur des SOMMES de dés — c'est Galilée (3 dés,
  9 contre 10 : 25/216 contre 27/216) ; Méré : double six en 24 lancers et problème des partis ;
  contrôle qualité : 80,5 % est le risque d'accepter un lot à 2 défectueuses (règle d'acceptation
  énoncée), pas « ce qui décide » ; spam : seule la barre « 3 mots » dépasse le seuil ; X défini au
  §4, « loi binomiale » retiré du formulaire ; « de probabilités non nulles » et P(B) > 0 ajoutés ;
  « a priori (ou théorique) » au lieu d'« intuitive » ; « sans remise » nuancé (tirages
  successifs) ; image de l'indépendance remplacée (B ne change pas la proportion de A). Structure :
  démonstration des trois écritures de l'indépendance au §1, §3 renommé « Probabilités totales et
  théorème de Bayes » (rappel + exemple « incompatibles, indépendants, ou ni l'un ni l'autre ? »),
  piège de la partition remonté, synthèse et formulaire complétés (règle du produit, Bayes
  développé, série/parallèle). Ajouts : loi des grands nombres et fluctuation, « ce dé est-il
  truqué ? » (règle de 6gen75), météo d'ensemble, tableau incompatibles/indépendants ; D(n) montré
  (9 dérangements de 4, récurrence, tableau 9/8/6/0/1, limite 1/e) ; grille sans remise (30 cases,
  texte : `outcomeGrid` ne retire pas de cases) ; maladie rare (1/6 puis 99/124 au 2e test),
  sensibilité/spécificité ; paradoxe de Méré résolu ; « combien d'essais pour 95 % » par les
  logarithmes ; Monty Hall avec arbre. Majuscules d'insistance → gras. 7 nouveaux ateliers :
  `stabilisation-frequences-widget` (séries superposées, dé mystère, règle de 6gen75),
  `deux-des-widget` (grille 6×6, histogramme des sommes, mode Galilée 3 dés), `arbre-tirages-widget`
  (urne, avec/sans remise, chemins allumés), `derangements-widget` (simulation, exact, 1/e),
  `anniversaires-widget`, `fiabilite-montage-widget`, `monty-hall-widget` (règle du cours = 6gen76 ;
  variante « toutes les autres portes » à part). Améliorés : `binomiale-positions-widget` (plus de
  C(n;k) ni de « ^ », liste des chemins, mode « au moins k »), `venn-double-entree-widget` (« Sachant
  B », repère d'indépendance, verdict exact en entiers), `bayes-test-medical-widget` (maladie rare,
  2e test, vocabulaire, grille de 1 000 points). Vercel : `vercel.json` désactive le déploiement des
  branches `claude/*` — les sauvegardes WIP avaient épuisé le quota quotidien (« Deployment rate
  limited »). Vérifié : build propre, page 390 clair/sombre et 1280 (0 débordement, 0 erreur
  KaTeX, 10 ateliers montés), épinglage ko 0, feuilles réelles du chapitre sans erreur.

- **4e, Chapitre 3 — Caractéristiques d'une fonction et fonctions de référence : 4 générateurs
  « transférer »** (processus 3, demande de l'utilisateur : aucun générateur de transfert dans ce
  chapitre). gen68 « Problèmes modélisés par une fonction de référence » (§2 : t(v) = d/v, √A, ∛V,
  |T − c|, coût moyen F/x + p, c² ; domaine imposé par le contexte, inéquation avec le sens qui
  s'inverse, interprétation) ; gen69 « Choisir le bon modèle » (§3 : courbe en contexte → famille,
  transformations, expression, utilisation, sens d'un paramètre ; 7 situations) ; gen70 « Lire un
  graphique en contexte » (§1 : 7 situations, 4 questions en langage courant, écran « quelle
  caractéristique ? » puis lecture exacte sur la grille) ; gen71 « Le portrait-robot d'une fonction »
  (§1–§3 : retrouver l'expression, raisonner sans expression avec « on ne peut pas savoir »,
  choisir la seule courbe valide). Feuilles au contrat complet, énoncé papier avec les VRAIES
  questions a) b) c), profils, `?code=`, cartes dans le chapitre, entrées pilote en processus 3.
  Saisie harmonisée dans le chapitre : rac(…), rac3(…), |…| (les anciennes écritures restent
  acceptées). Vérifié : build propre, pages 390/1280 sans débordement, feuilles réelles sans erreur.
- **4e ch3 — gen72 « Domaine et ensemble image après transformations »** (processus 3 transférer,
  idée de l'utilisateur) : f n'est connue que par dom f et im f ; son graphique subit 2 à 5
  transformations successives (niveau 1 : TH/TV/SOX/SOY ; niveau 2 : + EH/CH/EV/CV), 8 variantes
  (niveau × nombre). 3 écrans : classer chaque transformation (choix fermé, 1 essai), suivre le
  domaine puis l'ensemble image (un intervalle après chaque transformation de l'axe, jugé sur
  l'intervalle CORRECT de la chaîne ; diagnostic « bornes » / « crochets »). Saisie d'intervalle :
  crochets à toucher, bornes en champs libres, boutons −∞/+∞. Bloc de cours ajouté dans
  « Transformer » (tableau effet sur un point / sur les bornes, exemple résolu, piège de l'échange
  des crochets) : le chapitre n'expliquait nulle part l'effet d'une transformation sur dom et im.
  Intervalles en KaTeX avec `\mathopen{]}` / `\mathclose{[}` (sinon « ]−8 » se lit comme une
  soustraction). **Séries équilibrées** (demande de l'utilisateur) : `profil.ts`, `forme` = forme
  des ensembles de départ + nombre de translations/symétries/dilatations par ensemble ; cas
  particulier = ensemble inchangé. Générateur limité (≤ 2 symétries, ≤ 2 dilatations, pas de
  transformations qui s'annulent) pour que chaque forme reste retrouvable : mesuré ≥ 7
  correspondances attendues en 20 000 essais même au 1er centile (n2-5) ; vérifié sur 6
  évaluations réelles de 3 séries (même structure, nombres tous différents, < 60 ms).
- **4e ch5 — gen73 « Résoudre complètement un triangle »** (processus 2 appliquer, section
  `triangle`, carte après gen19, précédée d'un bloc `methode` « Résoudre complètement un triangle » :
  méthode par configuration, plus grand angle d'abord par Al-Kashi, cas SSA à un seul triangle,
  contrôle). 4 variantes = 4 configurations (AAS, SAS, SSS, SSA à un seul triangle : angle donné
  face au plus grand des deux côtés). Écrans : configuration (choix, 1 essai), première loi (choix,
  1 essai ; pour SSS aussi l'angle, le plus grand), 3 champs dans l'ordre de la méthode (jugés sur
  le triangle exact, tolérance de gen19 : 1 %, min 0,05), contrôle (l'angle obtenu par la somme,
  recalculé par Al-Kashi). Diagnostic ciblé de l'angle aigu de l'arcsin et de la calculatrice en
  radians. Cœur de calcul pur et exporté `moteur/resolutionTriangle.ts` (configuration, résolution
  à partir de 3 données, plan de la méthode, valeurs fautives) — à réutiliser par gen81. Figure à
  l'échelle `ui/croquisResoudreTriangle.ts` (écran + SVG papier). ≈ 40 % d'instances avec un angle
  obtus (100°–140°) ; `forme` = configuration + position de l'angle obtus (aucun / donné /
  calculé), forme la plus rare ≈ 20 % ; pas de cas particulier ; `calculatriceIndispensable`.

- **4e, Chapitre 5 — gen74 « Cas ambigu : 0, 1 ou 2 triangles ? »** (section `triangle`,
  processus 2 appliquer) : données SSA (a, b, Â opposé à a, aigu). Cœur PUR et exporté
  `4e/moteur/modeleCasAmbigu.ts` (`resoudreSSA`, `intersectionsSSA`, `sommetC` : sin B̂, candidats
  B̂₁/B̂₂, test Â + B̂ < 180°, triangles, côtés, hauteur h ; réutilisable pour une famille « deux
  positions possibles »). Toujours 5 écrans (la barre ne trahit pas l'issue) : sin B̂ (champ, au
  millième) → trancher sin B̂ > / = / < 1 (choix fermé) → candidats B̂ et Â + B̂ (champs) ou, sans
  candidat, « que fait l'arc de compas ? » (choix fermé) → nombre de triangles 0/1/2 (choix fermé)
  → côté c de chaque triangle, ou la plus petite longueur de BC (= h) s'il n'y en a aucun. Figure à
  l'échelle dont le cadre ne dépend que de Â et b ; l'arc de compas (centre C, rayon a) n'apparaît
  qu'après l'écran 4 et dans le corrigé papier (`figureHtml`, étape d). Issues tirées à 1/3 chacune
  (sin B̂ = 1 : Â = 30°, b = 2a, ≈ 5,6 % des tirages, dans « 1 triangle »). UNE seule variante et
  `forme` = format des données (entiers / un côté décimal) : l'issue est un verdict, jamais imposée
  entre séries. Bloc « Résoudre le cas ambigu » précisé : « B̂₁ convient toujours » n'est vrai que
  pour Â aigu (pour Â obtus et a ≤ b, aucun triangle bien que sin B̂ < 1).
- **4e ch5 — gen76 « Valeur exacte sans calculatrice »** (section « associes », processus 2
  appliquer) : synthèse de gen14 (réduire, quadrant, signe), gen15 (valeurs remarquables) et gen17
  (angles associés) — valeur exacte d'une expression de 2 ou 3 termes (sin 150° + cos 240° · tan 315°).
  4 variantes : 2 termes, 3 termes, angles > 360° ou négatifs (2 ou 3 termes), avec un carré.
  Angles multiples de 30°/45° STRICTEMENT dans un quadrant (jamais d'axe : aucune tangente
  indéfinie), au plus un produit. Écrans : pour chaque terme [angle ramené dans [0° ; 360°[] →
  quadrant et signe (sélecteur de gen14, choix fermés, 1 essai) → angle associé et valeur exacte ;
  puis valeur de l'expression. Calcul exact sans flottant dans ℚ(√2, √3)
  (`moteur/corpsValeurExacte.ts`) ; saisie « rac(…) » / « √ » comparée à 1e-9 ; une valeur
  décimale approchée (« 0,866 ») ou un sin/cos/tan recopié est refusé SANS tentative (un décimal
  exact comme 0,5 est accepté) ; diagnostics ciblés « signe » et « sinus/cosinus confondus ».
  Exemple résolu ajouté avant la carte (le cours ne combinait jamais plusieurs termes) + son énoncé
  dans `ENONCES_DEMONSTRATION`. Profil : `calcul: 'exacte'` toujours, `forme` = nombre de termes /
  de réductions / de tangentes / de produits / de carrés, cas particulier = un terme du premier
  quadrant (≈ 20 %) ; forme la plus rare au 1er centile ≈ 84 correspondances attendues en 20 000
  essais.
- **4e, chapitre 5 — gen80 « Composer deux forces ou deux vitesses »** (section `triangulation`,
  processus 3 transférer, après la carte gen58) : pont entre Al-Kashi / loi des sinus et la règle du
  parallélogramme du chapitre 6 (même notation `\vec{F_1}`, `\vec{v_R}`, intensités `F_1`, `v_R`).
  Situations : bateau et courant (nœuds), avion et vent (km/h), deux remorqueurs (kN), deux
  personnes qui tirent une caisse (N) ; θ multiple de 5°, aigu [35° ; 75°] ou obtus [105° ; 145°],
  jamais droit (pas de cas Pythagore, donc aucun cas particulier). 3 variantes : intensité seule
  (3 écrans), intensité + direction (4), cap à prendre (4, bateau/avion). Écrans : choix du triangle
  (1 essai, OAB = piège de l'autre diagonale), angle intérieur 180° − θ (message ciblé si θ), Al-Kashi
  avec unité (messages : θ dans Al-Kashi, radians, unité), direction = angle avec le GRAND vecteur
  (opposé au plus petit côté, donc toujours aigu : l'arc sinus suffit). Cap : loi des sinus d'abord
  (angle entre le cap et la route, aigu car opposé au courant < vitesse propre), puis le troisième
  angle, puis l'intensité. Figure SVG à l'échelle, une seule fonction écran/papier
  (`ui/figureComposerForces.ts`), triangle utile surligné après l'écran 1, corrigé `figureHtml`.
  Bloc de cours ajouté avant la carte (sous-titre, para, illustration du triangle OAC avec l'angle
  180° − θ, piège, astuce sur le cap) : le chapitre 5 ne parlait pas de composition de vecteurs.
  `forme` = situation:question:aigu|obtus (≈ 1/8 ou 1/4 des tirages, aucune bride) ; 6 évaluations
  réelles de 3 séries : même structure, nombres différents.
- **4e ch5 — gen75 « Aire d'un triangle quelconque »** (section `triangle`, processus 2 appliquer) :
  cinq familles = cinq variantes. (1) aire directe ½·XY·XZ·sin X̂ (choix de la formule, 1 essai —
  distracteurs cosinus, sans ½, angle non compris —, puis calcul) ; (2) angle à partir de l'aire :
  sin X̂, puis « une ou deux amplitudes ? » (choix fermé, 1 essai : l'oubli de la seconde est
  diagnostiqué là), puis les amplitudes (un ou deux champs, ordre libre ; messages ciblés : valeurs
  identiques, complémentaire au lieu de supplémentaire, radians, facteur 2 oublié) ; la figure
  ajoute la seconde configuration en pointillés une fois l'écran 2 clos ; (3) côté à partir de
  l'aire (choix de l'expression isolée, puis calcul) ; (4) quadrilatère convexe découpé par la
  diagonale AC : aire de ABC, AC par Al-Kashi, aire de ABCD (diagnostic « aire de ACD seule ») ;
  (5) Héron (« pour aller plus loin ») : demi-périmètre puis aire. Saisie libre décimale OU exacte
  (« 12√3 », bouton √), tolérance de gen19 (1 %, plancher 0,05 ; sinus : 0,002). Figure À
  L'ÉCHELLE (similitude, comme gen58), inconnue « ? » orange ; papier : même figure en SVG en ligne,
  sauf la famille angle (une figure ferait oublier la seconde configuration). Cours : un
  `attention` (deux amplitudes à partir de l'aire) et un `para` (aire d'un quadrilatère par une
  diagonale) ajoutés après le rappel « formule de Héron ». **Séries équilibrées** : `forme` =
  famille (+ angle ABC obtus/aigu pour le quadrilatère, demi-périmètre entier ou non pour Héron),
  cas particulier = angle droit (sin 90° = 1 ; famille angle : une seule amplitude), `calcul`
  'exacte' (angle remarquable, aire k, k√2 ou k√3 ; Héron d'aire entière) ou 'calculatrice'
  (absent pour l'angle droit, comme gen14–18) ; `calculatriceIndispensable: ["quadrilatere"]`.
  Toutes les combinaisons ≥ 2 300 attendues en 20 000 essais ; vérifié sur 4 évaluations réelles
  de 3 séries (calculatrice interdite/autorisée, cas coché ou non).
- **4e ch5 — gen81 « Le détective d'erreurs »** (section `triangle`, processus 3 transférer) : la
  résolution complète d'un triangle par un élève fictif (5 ou 6 lignes numérotées, KaTeX, marge
  rouge) contient UNE ligne fausse et la suite en découle (la copie reste cohérente avec son
  erreur). 6 variantes = 6 erreurs : angle obtus pris pour l'aigu par sin⁻¹, calculatrice en
  radians, arrondi intermédiaire (côté à l'unité, cosinus au dixième, rapport de la loi des sinus à
  l'unité), côté non opposé dans la loi des sinus, signe ou facteur 2 oublié dans Al-Kashi, second
  triangle oublié (cas ambigu). 16 scénarios = configuration (SAS, SSS, AAS avec rapport commun
  k = c/sin Ĉ, SSA) + ligne fausse fixe. 3 écrans : la ligne (choix fermé), l'erreur (4
  descriptions, leurres toujours faux pour CETTE ligne), la correction (valeur de la ligne puis
  résultat final, ou un seul champ si la ligne fausse est la dernière ; cas ambigu : B̂₂ puis c₂),
  jugée sur la valeur EXACTE à ± une unité du dernier chiffre (refuse donc l'arrondi trop tôt).
  Module de résolution propre (`moteur/modeleDetectiveErreurs.ts`), valeurs en mémoire, nombres
  recopiés arrondis ; seule la somme des angles est faite sur les angles affichés (sinon la
  soustraction affichée semblerait fausse d'un dixième). Garanties mesurées : l'erreur se voit
  (ligne fausse et résultat final à ≥ 4 tolérances), copie contredisant un contrôle du cours pour
  « obtus » et « radians », vérité terrain (résolution exacte indépendante) sur 1 750 tirages.
  **Bug évité** : le contrôle « angle réellement obtus » doit se faire par Al-Kashi direct, jamais
  sur la résolution corrigée (qui pose 180° − sin⁻¹ par construction). Papier : numéros de ligne
  écrits en clair (les puces d'un `<ol>` disparaissent dans la feuille de style des documents).
  Séries équilibrées : `forme` = type|configuration|ligne, chaque forme ≥ 25 % dans sa variante ;
  vérifié sur 6 évaluations réelles de 3 séries (même structure, nombres différents).
- **4e ch5 — gen79 « Le cercle dans le réel : rotations en contexte »** (processus 3 transférer,
  section « equations ») : grande roue, horloge de beffroi, bras de robot, éolienne, valve de vélo
  (10 variantes : situation × sens direct/inverse). Piège visé : le contexte ne part pas de 0° et ne
  tourne pas forcément dans le sens trigonométrique (θ = θ₀ ± α). 4 écrans : 1) position de départ
  et sens de rotation (choix fermés, 1 essai) ; direct : 2) θ réduit, 3) (r cos θ ; r sin θ),
  4) hauteur h + r sin θ ; inverse : 2) sin θ = k, 3) toutes les solutions (bouton « deux / une
  seule solution », jamais présélectionné selon la réponse), 4) retour au contexte (secondes,
  minutes après midi ou angle de rotation). Diagnostics ciblés (mauvais sens, α pris pour θ, x/y
  échangés, h oublié, angles θ rendus au lieu des durées) ; un angle juste mais non réduit ne compte
  pas de tentative. Figure SVG autonome (contexte + axes X/Y superposés) : énoncé sans le sens de
  rotation, corrigé (`figureHtml`) avec arc α, point(s) θ et hauteur. Aides : réutilise
  `CercleTrigTrajetBase` (gen14) et la construction quadrants/candidats/projections de gen18.
  Bloc de cours ajouté avant la carte (para + attention « Le contexte ne part pas de 0° »).
  **Séries équilibrées** : `forme` = variante + conversion (origine-sens) + réduction nécessaire ou
  non (direct) / nombre de solutions (inverse) ; `calcul` exacte (θ multiple de 30°/45°, sin θ =
  ±1/2) ou calculatrice ; cas particulier = sin θ = ±1 (une solution). Fréquence minimale mesurée
  (6 000 tirages/variante) : 1,3 % (≈ 260 correspondances attendues en 20 000 essais).
- **4e ch5 — gen77 « Du texte au triangle : problèmes en contexte »** (processus 3 transférer, section
  « triangulation », après gen58) : pendant à UN SEUL triangle de gen58. 7 situations (variantes) :
  deux trajets successifs (caps), deux mobiles partis du même point (caps), sommet vu sous deux
  angles d'élévation (distance oblique, jamais la hauteur), deux points vus sous deux angles de
  dépression, distance inaccessible (angles avec la base ou relèvements), parcelle (côté ou aire),
  « deux positions possibles » (cas ambigu en contexte : radar/phare ou tours de guet ; toujours deux
  positions, tranchées par une information de l'énoncé ; calcul local, gen74 non importé). 5 écrans :
  rôle des éléments (donné / à convertir / cherché), conversion en angles intérieurs, loi, calcul,
  phrase-réponse (unité + arrondi) ; pour deux positions : configuration, loi, deux angles candidats,
  deux distances, position retenue. Figure SVG proportionnelle (nord et arcs de cap, sol, horizontale,
  rivière, côte), inconnue en « ? », figure résolue dans le corrigé. Bloc de cours ajouté avant la
  carte (tableau « donnée du texte → angle intérieur » + piège « deux positions ») : le chapitre ne
  parlait ni de caps ni de dépression. `forme` = situation + loi + conversion (nord, relèvement…),
  ≥ 22 % par forme dans sa variante ; aucun cas particulier ; calculatrice indispensable.

- **4e, Chapitre 5 — Cercle trigonométrique & triangles quelconques** : (1) gen16 « L'un sans
  l'autre » reçoit une 3e famille « tan θ donné (retrouver cos θ et sin θ) », ajoutée en FIN de
  catalogue (les codes `?code=` déjà imprimés gardent leur indice de variante ; empreinte des
  instances cos/sin vérifiée identique avant/après pour plusieurs graines). Mêmes 3 écrans :
  cos²θ par 1 + tan²θ = 1/cos²θ, cos θ signé par le quadrant, puis sin θ = tan θ · cos θ (le
  3e écran demande sin θ au lieu de tan θ) ; |tan θ| = p/q (triplets 3/4, 4/3, 5/12, 12/5 ou
  p, q ≤ 5). Adaptateur, barème et carte du cours mis à jour. (2) Nouveau gen78 « Équations
  trigonométriques à transformer » (section `equations`, processus 2, après la carte gen18) :
  a·f(α) + b = c, a·f²(α) + b = c (sin, cos), produit nul f(α)·(a·g(α) + b) = 0. Écrans :
  équation(s) de base, puis pour chaque base angle de référence (verdict « pas de solution »)
  et solutions (cercle de l'aide de gen18), puis ensemble des solutions. Sans solution (|k| > 1,
  carré négatif) ≈ 15 % par variante sin/cos/carré : verdict, jamais un cas particulier ; cas
  particulier = base sur un axe (affine, carré) ; `forme` = variante + nombre d'équations de
  base ; `calcul` exacte/calculatrice (k décimal, angles au dixième). Le cours ne traitait pas
  ces formes : sous-titre « Pour aller plus loin — des équations à transformer », un para, deux
  exemples résolus (`4 sin² α − 3 = 0`, `sin α · (2 cos α − 1) = 0`, énoncés ajoutés à
  `ENONCES_DEMONSTRATION`) et un `attention` « Trois réflexes ». Produit : jamais
  `cos α · (a·tan α + b) = 0` (tan non définie en 90° et 270°).
- **4e ch6 — gen84 « Nature d'un quadrilatère »** (section `orthogonalite`, processus 2 appliquer,
  carte après gen25) : synthèse de gen26 (norme), gen20/21 (relation) et gen25 (orthogonalité).
  4 variantes : « nature » (4 points), « quatrième sommet » (trouver D tel que ABCD soit un
  parallélogramme, puis sa nature), « montrer que c'est un rectangle / un losange » (toujours vrai,
  puis « est-ce un carré ? »). Toujours 4 écrans, quelle que soit la nature : AB et DC (ou AB puis
  D), BC + normes de AB et BC (côtés CONSÉCUTIFS), critère d'orthogonalité AB·BC, conclusion
  (choix fermé parmi 5 natures, une tentative, récapitulatif des trois résultats sans verdict). Les
  écrans 2 et 3 se font même sans parallélogramme : un quadrilatère quelconque est construit comme
  piège (angle droit en B, AB = BC, les deux, trapèze, « presque parallélogramme »), c'est l'écran 4
  qui demande de ne pas conclure rectangle/losange sans parallélogramme. Diagnostics : CD au lieu
  de DC, BA, D obtenu avec AB = CD, norme au carré ou approchée, critère de signe opposé. Nature
  tirée uniformément parmi les issues de la variante (5, 4 ou 2) ; aucun côté horizontal/vertical,
  ABCD convexe, coordonnées dans [−6 ; 6]. Figure SVG unique `ui/figureNatureQuadrilatere.ts`
  (écran + papier) : repère quadrillé sans codage à l'énoncé, D absent tant qu'il n'est pas trouvé,
  codages (angles droits, côtés égaux) dans le corrigé et à la fin de l'exercice. Profil :
  `forme` = variante (affirmation comprise), jamais la nature ; pas de cas particulier ni de
  `calcul` (tout est exact) ; étoiles selon la variante seulement. Bloc de cours ajouté avant la
  carte (le chapitre ne donnait nulle part les critères losange/rectangle/carré) : sous-titre,
  para, `methode` « Nature d'un quadrilatère ABCD », exemple résolu (rectangle non carré, énoncé
  dans `ENONCES_DEMONSTRATION`), piège « Le parallélogramme d'abord ».

- **4e ch6 — gen86 « Carte au trésor et randonnée : déplacements successifs »** (section `norme`,
  processus 3 transférer, après la carte gen26) : 6 variantes = situation × question — carte au
  trésor (pas, 0 ou 1 pas « en diagonale ») avec retour au départ ou grand pas répété (k·w jusqu'au
  trésor T), randonnée (km) avec retour ou refuge C, drone (m, cases de 100 m) avec retour ou
  client C. Repère : origine au départ D, x vers l'est, y vers le nord. Écrans (4 ou 5) :
  traduire chaque instruction en vecteur (champs en colonne ; statuts « signe », « x/y échangés »),
  déplacement total (Chasles ; statut « sans signes »), puis distance à vol d'oiseau (norme, exacte
  en √ ou arrondie selon la consigne ; statuts « distance parcourue », « racine oubliée »,
  « valeur approchée ») et vecteur de retour (statut « opposé »), ou dernier déplacement PC
  (statuts « sens inversé », « coordonnées de C recopiées ») et sa longueur, ou RT, k, distance RT.
  Carte SVG (quadrillage, rose des vents, axes issus de D, cible) sans le trajet dans l'énoncé ;
  trajet + total après l'écran 2, vecteur final à la fin ; corrigé avec la carte complète
  (`figureHtml`). Papier : vraies questions a) position, b) distance / dernier déplacement / nombre
  de grands pas, c) retour / distance. `forme` = variante + nombre d'étapes + diagonale ;
  `calcul` exacte/calculatrice ; cas particulier « sur-un-axe » (≈ 11 %, retour et dernier
  seulement). Fréquence minimale d'une forme × calcul : 10,5 % (≈ 2 000 correspondances attendues
  en 20 000 essais). Bloc de cours ajouté avant la carte : sous-titre, para (Chasles, norme,
  opposé), `featureTable` « instruction → vecteur » et `attention` « distance parcourue ou à vol
  d'oiseau ? » (aucun nouvel exemple : rien à ajouter à `ENONCES_DEMONSTRATION`).
- **4e ch6 — gen91 « Le détective d'erreurs vectoriel »** (section `revision`, processus 3
  transférer, carte placée dans la section avant le quiz gen64 de la synthèse) : même principe et
  même rendu que gen81 (copie numérotée, marge rouge, une seule ligne fausse, la suite cohérente avec
  l'erreur — verdict compris). `EtapesDetectiveErreurs.tsx` factorisé sans changer gen81 :
  `EtapeDescriptionErreur` générique sur l'identifiant de description, `BlocAides` exporté ; la
  copie et l'écran 1 sont réutilisés tels quels, seul l'écran 3 est propre (`EtapesDetectiveVecteurs`
  : nombre, vecteur en colonne, point, verdict). 6 types d'erreur (variantes) sur 7 exercices
  supports : AB calculé A − B (point M tel que AM = AB + k·AC, lignes 1 ou 2 ; 4e sommet, ligne 2),
  Chasles (DM = AB − AC réduit en BC, ou DM = BA + CB réduit en AC), norme (racine oubliée ou
  (−3)² = −9, triangle isocèle en A, ligne 2 ou 4), colinéarité (déterminant avec « + », ou
  rapports x₁/x₂ et y₂/y₁), orthogonalité (« − » entre les produits, ou produit de deux négatifs
  compté négatif ; triangle rectangle en A), parallélogramme (AB = CD au lieu de AB = DC, ou milieu
  des diagonales par une différence). Écran 3 : bonne valeur de la ligne fausse (sauf ligne de
  traduction AB = CD : seulement la conclusion) puis conclusion (point, ou verdict choisi : une
  seule tentative, figé s'il est juste). Verdict juste tiré à pile ou face, indépendant de la forme ;
  `forme` = type|support|ligne(|sous-variante), aucune forme sous 24 % ; pas de `calcul` (tout est
  exact). Aucun bloc de cours ajouté : formules et critères déjà dans les sections 11 à 14.

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`), gen87 « Traverser une rivière :
  vitesses en composantes » (section `applications`, processus 3, carte après gen29). Tout en
  composantes dans un repère d'origine D (x le long de la rive, sens du courant ; y vers l'autre
  rive), jamais la loi des cosinus (c'est gen29). Variantes : « où accoste-t-il ? » (vitesse propre
  perpendiculaire aux rives ou donnée par ses composantes ; écrans v_R, durée L/y(v_R) — le courant
  ne change pas la durée, piège visé —, abscisse x_A, puis vitesse réelle ou distance DA) et
  « quelle direction pour arriver juste en face ? » (x(v_p) = −c, y(v_p) par Pythagore, durée ;
  le cas v ≤ c n'est jamais tiré). Situations bateau, nageur, kayak, bac ; m et m/s seulement.
  `forme` = variante + situation (+ vitesse/distance) ; `calcul` exacte (triplet pythagoricien)
  ou calculatrice (racine), une fois sur deux ; aucun cas particulier. Le cours n'avait que la
  résultante de deux forces : ajout d'un `para` (repère, v_R = v_p + v_c), d'un exemple résolu
  « traverser une rivière » (nageur, 40 m, énoncé ajouté à `ENONCES_DEMONSTRATION`) et d'un
  `piege` « le courant ne change pas la durée » (avec la condition « juste en face »).

- **4e, Chapitre 6 — gen90 « Équilibre de forces en composantes »** (section `applications`,
  processus 3 transférer, carte après celle de gen29). Complète gen29 (résultante par la loi des
  cosinus) : tout se fait en composantes avec F₁ + F₂ + F₃ = 0. Situations (= variantes, chacune
  « sans » / « avec la direction ») : lustre (poids + deux câbles), tir à la corde à trois, barque
  retenue par deux amarres contre le courant, anneau tiré par trois cordes (forces lues sur un
  quadrillage, 1 carreau = 10, 20 ou 50 N). Écrans : condition d'équilibre (choix fermé parmi
  F₃ = −(F₁ + F₂), F₁ + F₂, F₁ − F₂, F₂ − F₁), résultante F₁ + F₂, F₃ (piège : signe moins oublié),
  intensité (exacte k√m ou au dixième de N ; pièges : somme des intensités, somme des composantes,
  carré sans racine ; un décimal pour une valeur exacte demandée ne consomme pas de tentative),
  et, selon la variante, l'angle aigu avec l'axe x par l'arc tangente — le cours le permet : l'exemple
  « résultante par les composantes » calcule déjà la déviation par la tangente. Figure : forces en O
  à l'échelle dans un repère CENTRÉ (aucune place réservée qui trahirait la direction de F₃), F₃
  marquée « ? » dans la bande du bas ; après l'écran 3 et dans le corrigé, F₃ tracée + polygone des
  forces fermé. Le cours ne parlait pas d'équilibre : un para « Équilibre de forces » et un exemple
  « équilibre de trois forces » (lustre, énoncé ajouté à `ENONCES_DEMONSTRATION`) avant la carte.
  `forme` = situation + direction + nature de l'intensité (entier / racine / arrondi) ; cas
  particulier = F₃ horizontale ou verticale (sans direction) ; `calcul` exacte si intensité exacte
  sans angle.

- **4e ch6 — gen82 « Décomposer un vecteur selon deux directions »** (section
  `decompositionGeometrique`, processus 2 appliquer ; la section n'avait aucun générateur). Six
  variantes : quatre figures (réseau de parallélogrammes — directions du réseau ; parallélogramme
  ABCD découpé par ses milieux et son centre ; hexagone régulier de centre O ; quadrillage avec
  directions obliques, jamais perpendiculaires) et deux en composantes (poser et résoudre le
  système de l'exemple de la section 10 ; « la décomposition est-elle possible ? »). Vocabulaire du
  cours : u = a·v + b·w (a, b, comme l'atelier et l'exemple de la section 10), méthode du
  parallélogramme en sens inverse. Écrans graphiques : le point M (parallèle à v par l'origine,
  parallèle à w par l'extrémité — choix fermé parmi les lettres de la figure ; distracteurs :
  l'autre sommet du parallélogramme, les points « à contresens »), puis a, puis b (la combinaison
  complète s'affiche en conclusion : un écran « écris la combinaison » aurait fait recopier deux
  nombres déjà validés). Composantes : système (choix fermé : le bon, le transposé, a/b échangés
  ou composantes de u échangées), a et b, vérification (composantes de a·v et b·w — jamais a et b
  tous deux égaux à ±1). « Possible ? » : verdict (produits en croix), puis a et b ou k tel que
  w = k·v ; verdict tiré à pile ou face AVANT les rejets (sinon 65 % de « possible »), jamais figé
  (`forme` constante « possible:verdict », jamais de cas particulier). Profil : `forme` = variante
  + signes (++, +−, −−) + demi-entier ; cas particulier = coefficient nul (≈ 1/8) ; pas de
  `calcul`. Figure unique écran/papier (`ui/figureDecompositionVecteur.ts`), étiquettes placées
  par score de distance. Cours : un `para` (lire a et b, signe) et un `attention` « Le signe et le
  rôle des coefficients » ajoutés après la méthode, carte en fin de section.

- **4e, Chapitre 6 — Calcul vectoriel** : nouveau gen89 « Viser une cible : trajectoires
  rectilignes » (section `colinearite`, processus 3, exercice en contexte, carte après gen24).
  Billard, laser, passe au football, curling, vus de dessus dans un repère : l'objet part de A dans
  la direction et le sens de u ; touche-t-il la cible C ? Sens direct : vecteur à comparer (AC, CA,
  OC — choix fermé), composantes de AC, critère du cours (celui de gen24, ordre opposé accepté)
  + colinéaires ? + k (AC = k·u), conclusion (touche / passe à côté / bonne droite mais derrière A).
  Sens inverse (u à compléter par m) : condition (équation libre, tout multiple accepté), m, puis
  le sens (k > 0 : m convient ; k < 0 : aucune valeur ne convient). Issues = verdicts, tirées
  équiprobables, jamais dans `forme` (= situation + sens) ; « à côté » à moins d'une unité de la
  droite (critère ±1 ou ±2). Figure à l'échelle (scène, axes gradués discrets, flèche de u),
  trajectoire prolongée dans le corrigé. Bloc `attention` « Viser une cible » ajouté avant la carte :
  le cours ne liait pas la colinéarité au SENS du trajet.

- **4e ch6 — gen88 « Chantier et terrains : alignement, équerre, parallélisme, milieu »**
  (section `applications`, processus 3 transférer, carte après gen29). Plan de terrain repéré en
  mètres (quadrillage d'1 m, vue de dessus : piquets, arbres, poteaux, dalle, terrain de foot,
  murs, rangées de vigne, routes, bordures, maisons, bancs, enclos, clôture/chemin) ; six
  variantes : alignement, équerre, parallèles (verdicts oui/non à 50/50 dans CHAQUE instance ;
  « non » toujours à 1,5°–4° de l'alignement, de l'angle droit ou du parallélisme, pour que l'œil
  ne suffise pas), milieu (point à mi-chemin), quatrième coin d'un enclos en parallélogramme,
  piquet à planter sur une ligne d'abscisse ou d'ordonnée fixe (inconnue y ou x). Quatre écrans :
  outil (choix fermé parmi colinéarité / orthogonalité / distance / milieu / égalité de vecteurs —
  le contexte ne nomme jamais l'outil), composantes des vecteurs utiles, critère du cours
  (déterminant `x_u·y_v − y_u·x_v`, produit scalaire `x_u·x_v + y_u·y_v`, demi-vecteur, égalité
  `AB = DC` en choix fermé, équation du piquet en saisie libre), réponse (phrase-réponse en choix
  fermé avec deux pièges — « à l'œil », confusion d'outil — ou coordonnées). Profil : `forme` =
  variante (+ C entre/au-delà pour l'alignement, axe de la ligne pour le piquet) ; le verdict n'y
  entre jamais ; aucun cas particulier (aucune composante nulle), pas de `calcul` (tout exact).
  Cours : sous-titre « Sur un chantier : reconnaître l'outil caché dans les mots », un para, un
  `featureTable` mot du contexte → relation → critère et un `attention` (critère exact, le dessin
  ne prouve rien), avant la carte. Figures : chaîne SVG unique écran/papier
  (`ui/figureChantierTerrains.ts`) ; les deux couleurs des vecteurs du corrigé sont littérales car
  les documents imprimés redéfinissent `--accent` (bleu).

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`) : nouveau gen85 « Démontrer avec des
  vecteurs » (section `colinearite`, processus 3, carte après celle de gen24). Raisonnement
  vectoriel SANS repère : figure de base (parallélogramme ABCD, triangle ABC, trapèze ABCD avec
  DC = ½ ou ⅔ AB) et deux points E, F définis à partir des sommets (PE = k·PR, milieu, symétrique,
  ou PF = k·QR d'une autre origine) ; le coefficient de F est CALCULÉ pour que la propriété soit
  vraie (alignement, parallélisme, milieu, parallélogramme) et retenu seulement s'il est simple ;
  la définition de F ne cite jamais E ni la droite de E. Écrans : base adaptée (choix fermé :
  adaptée / colinéaire / possible mais maladroite), coefficients exacts des deux vecteurs utiles
  (diagnostic sens inversé et Chasles mal enchaîné), k tel que v = k·w (diagnostic rapport inversé,
  signe), conclusion qui cite la propriété (pièges parallèles ≠ alignés, ordre des sommets).
  `forme` = propriété + figure, aucun cas particulier, pas de `calcul`. Le cours ne montrait la
  colinéarité qu'en repère : sous-titre « Démontrer sans repère, avec des vecteurs », un para, une
  `methode` en 4 étapes, un exemple résolu (A, E, I alignés dans un parallélogramme, énoncé ajouté
  à `ENONCES_DEMONSTRATION`, clé « sans repère : trois points alignés » — le badge évite le mot
  « alignement », déjà clé d'un autre exemple de la section) et un `piege` « Parallèles ou
  alignés ? ».

- **4e, Chapitre 6 — Calcul vectoriel** (`calcul-vectoriel`) : nouveau gen83 « Construire une
  somme, une différence, un point » (section `additionGeometrique`, processus 2), qui prolonge la
  grille magnétique de gen23 (`VecteurGraph` + `MovablePoint`, `contraindreAuNoeudDeFenetre`,
  fenêtre fixe, fond non déplaçable, axes masqués, pas de quadrillage 1) : l'origine de chaque
  flèche est IMPOSÉE, l'élève fait glisser son extrémité, jugée sur le nœud exact. Variantes :
  u + v (triangle ou parallélogramme), u − v (en ajoutant −v, ou à partir d'une origine commune :
  de l'extrémité de v vers celle de u), k·u + l·v (k, l entiers ou demi-entiers), point M tel que
  AM = k·AB + l·AC ou MA = … (retournement : choix fermé, une tentative), lecture des
  composantes de deux vecteurs (champs libres en colonne). Cas particulier des évaluations :
  vecteurs colinéaires (jamais dessinés avec la même origine). Le cours ne montrait pas la
  construction d'une combinaison ni le placement d'un point par une relation : un `methode`
  « Construire une combinaison ou placer un point » ajouté avant la carte (pas d'exemple, donc
  rien à ajouter à `ENONCES_DEMONSTRATION`).

- **6e, Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen77
  « L'intégrale lue sur un graphique (aire signée) » (section `integralesdefinies`, processus 2,
  carte AVANT celle de 6gen25 : le sens de l'intégrale sans primitive précède le calcul par le
  théorème fondamental). Courbe affine par morceaux (sommets entiers, |y| ≤ 3) avec au plus une
  portion de disque (demi-disque ou quart de disque, rayon entier, centre sur l'axe), sur quadrillage
  orthonormé (`ui6e/figureIntegraleGraphique.ts` : l'énoncé ne colorie rien ; le corrigé colorie en
  vert/rouge et écrit l'intégrale de chaque morceau). Trois variantes de 3 écrans : `calcul`
  (abscisses de découpe en choix multiple à un essai, intégrale signée de chaque morceau, somme),
  `aireIntegrale` (changements de signe, intégrale par intervalle de signe constant, puis intégrale ET
  aire), `proprietes` (courbe connue sur [c ; d] seulement, intégrale donnée sur un intervalle plus
  grand : lecture, Chasles, bornes inversées). Valeurs exactes q + p·π représentées par `{q4, p4}`,
  saisie exacte (fractions, π). La « découpe » est définie sans ambiguïté (à chaque SOMMET de la
  courbe et à chaque traversée de l'axe) : « une figure simple » seule était ambiguë (un rectangle
  suivi d'un triangle forme aussi un trapèze). `forme` = variante + disque + nombre de morceaux (ou
  d'intervalles de signe), tirée uniformément AVANT la courbe ; aucun cas particulier, pas de
  `calcul`. Le cours ne montrait l'aire signée qu'en une phrase : `methode` « Lire une intégrale sur un
  graphique, sans primitive » et `attention` « Aire ou intégrale ? » ajoutés après le bloc
  « Propriétés » (pas d'exemple, donc rien à ajouter à `ENONCES_DEMONSTRATION`). Dans
  `GENERATEURS_EVALUATION_PILOTE`, la section ayant désormais deux générateurs, 6gen25 reçoit aussi
  un libellé.
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen84
  « Le détective d'erreurs : intégrales et primitives » (section `problemes`, processus 3), sur le
  modèle de gen81/gen91 : copie numérotée (`CopieEleve`), `EtapeLigneFausse` et
  `EtapeDescriptionErreur` réutilisés tels quels depuis `4e/components/EtapesDetectiveErreurs.tsx`
  (aucune modification du fichier 4e) ; seul l'écran 3 a son composant
  (`components6e/EtapeCorrectionDetectiveIntegrales.tsx` : nombres exacts ou fonctions, saisie de
  6gen25/6gen26 via `evaluerExpressionExponentielle`). 7 variantes = types d'erreur, 13 scénarios
  (support + ligne fausse fixes) : f(ax + b) sans diviser par a (∫ c·cos(kx), ∫ (ax + b)ⁿ) ;
  ln(x) au lieu de ln|x| (intégrale sur un intervalle négatif, condition initiale sur ]−∞ ; 0[ —
  la copie conclut alors « n'existe pas », seule suite cohérente : ln|x| et un ln(x) « recalé »
  donnent toujours le même nombre) ; signe de la primitive de sin (crochet) ou de cos (condition
  initiale, x₀ = π/6, π/2 ou π/3 → √3) ; aire sans découper aux racines (x² − k²) ou aux
  intersections (kx et x²) ; volume sans le carré (kx) ou sans π (√(kx)) ; bornes inversées
  (valeur moyenne) ; constante mal isolée (condition initiale) ou oubliée (cinématique). Valeurs
  toutes exactes (rationnels, π, ln, √3) : une valeur décimale proche est signalée « approchée »
  sans consommer de tentative ; une primitive est acceptée à une constante près quand la ligne ne
  demande qu'une primitive. `forme` = type + support + ligne + scénario, aucun cas particulier, pas
  de `calcul`. Le cours couvrait déjà toutes les formules : aucun bloc ajouté, seulement la carte.
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen82
  « Inégalités de revenus : courbe de Lorenz et coefficient de Gini » (section `problemes`,
  processus 3, carte après celle de 6gen29). Courbes de Lorenz plausibles uniquement (L(0) = 0,
  L(1) = 1, croissante, convexe, L ≤ x) : xⁿ (n = 2, 3, 4), a·x² + (1 − a)·x et a·x³ + (1 − a)·x
  (a ∈ {0,2 ; … ; 0,9}), (e^{kx} − 1)/(e^k − 1) (k = 1, 2, 3 : variante à la calculatrice) ; pays
  FICTIFS seulement (Valdorie, Belmarie…), une entreprise sans nom, un pays avant/après une réforme
  fiscale. Parcours : lecture (L(0,5) ou L(0,8), interprétation en choix fermé — pièges population
  ↔ revenus, plus riches, complément —, aire 𝒜 = ∫₀¹ (x − L(x)) dx, G = 2𝒜) ; comparaison (deux
  aires, deux Gini, verdict équilibré : l'ordre des courbes est tiré après leurs familles, écart de
  Gini ≥ 0,05) ; paramètre (𝒜(a), G(a), a pour un Gini visé). Une saisie illisible n'est pas
  soumise (aucune tentative comptée) ; `messagePiege` signale aire sous la courbe, facteur 2
  oublié, Gini hors de [0 ; 1], a hors de [0 ; 1]. Figures : `repereSvg` de 6gen26 (carré unité,
  diagonale pointillée, légende sous la figure) ; énoncé sans aire colorée, corrigé avec la région
  entre la diagonale et chaque courbe ; teinte `--attn` (et non `--accent`, bleu dans les documents
  imprimés) pour la première courbe. Profil : `forme` = variante + famille(s) (triées pour une
  comparaison), aucun cas particulier, `calcul` seulement là où il discrimine (exponentielle →
  calculatrice, comparaison de polynômes → exacte). Le cours ne parlait ni de Lorenz ni de Gini :
  sous-titre « Pour aller plus loin — inégalités de revenus… », un para, une `definition`, une
  illustration `curvePlot` (x², aire 1/6 colorée), un exemple résolu (énoncé ajouté à
  `ENONCES_DEMONSTRATION`, clé « coefficient de Gini d'un pays fictif ») et un `piege`, avant la
  carte.
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen78
  « La fonction aire » (section `integralesdefinies`, processus 2), carte placée juste après
  l'atelier `fonction-aire-widget` de la sous-section « La fonction aire » (et non en fin de
  section). Vocabulaire du cours conservé : la fonction aire s'appelle A (pas F), A(a) = 0, A′ = f.
  Données : la courbe de f seule, sur quadrillage d'unité 1 (segments à sommets entiers, parfois un
  demi-cercle), et la borne a. Les changements de signe de f ont toujours lieu en un sommet
  d'ordonnée nulle : aires multiples de 1/2 ou de π/4, extremums de A lisibles. Variantes :
  valeurs (aires signées puis A en 3 points, dont un à gauche de a si a est intérieur), sens de
  variation (choix par intervalle, coupé aussi aux sommets « pics » de f pour tester le piège « A
  décroît quand f décroît ») puis valeurs du tableau, extremums (abscisses candidates : zéros avec
  ou sans changement de signe, extremums de f) puis valeurs, A′ = f (pentes puis A(p) et tangente),
  graphique de A parmi 4 (A, f, f(a) + A, −A ; position tirée au hasard). Le cours ne disait pas
  comment lire variations/extremums de A sur la courbe de f : un `methode` « Lire la fonction aire
  sur le graphique de f » ajouté avant la carte (pas d'exemple, rien à ajouter à
  `ENONCES_DEMONSTRATION`).
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen80
  « Accumuler une grandeur : débits, puissances, consommations » (section `problemes`, processus 3,
  carte après celle de 6gen29). Huit variantes = situation × question de transfert : cuve (débit
  d'entrée constant, débit de sortie affine, volume initial) → volume maximal (débit net nul) ou
  instant où elle est vide ; salle/stade/festival (rythme d'entrée affine, personnes déjà là,
  capacité) → instant où c'est complet ; panneaux solaires sinusoïdaux → heure où la batterie est
  pleine ; deux installations solaires polynomiales → E_A − E_B ; averse exponentielle → instant où
  une hauteur est atteinte ; orage polynomial contre pluie fine constante → H₁ − H₂ ; CO₂
  (exponentielle, quantité déjà émise, budget carbone) → année où le budget est épuisé. Chaîne fixe
  de 5 écrans : intégrale à poser (choix fermé, une tentative ; pièges quantité initiale ou sortie
  oubliée, taux au lieu de son intégrale, bornes en heures de la journée / en années / en minutes),
  primitive (à une constante près), quantité accumulée, transfert, réponse dans l'unité demandée
  (L → m³, min → h, W·h → kW·h, mm sur un toit → L, kt → Mt). Graphique du taux avec unités sur
  l'écran et dans l'énoncé papier ; aire hachurée en fin d'exercice et dans le corrigé. Profil :
  aucun cas particulier, `forme` = variante, `calcul` exacte (cuve, salle, comparaisons) ou
  calculatrice (sinus, exponentielles, `calculatriceIndispensable` sur ces trois variantes). Le
  cours ne traitait que « débit → volume » sans sortie ni quantité initiale : `methode`
  « Accumuler une grandeur à partir de son taux » (taux net, maximum quand le taux net s'annule,
  unités, conversions) ajoutée avant la carte de 6gen29 (pas d'exemple, rien à ajouter à
  `ENONCES_DEMONSTRATION`). Dans `evaluationPayload.ts`, la ligne de 6gen29 reçoit le libellé
  « Problèmes (6gen29) » (la section a désormais deux générateurs).
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen83
  « Contenance d'objets de révolution » (section `volumes`, processus 3, carte après 6gen27). La
  méthode des disques en contexte : convention du cours (axe de l'objet = axe des abscisses, x en
  cm le long de l'axe, f(x) = rayon intérieur), origine au fond intérieur (verre, vase, pot) ou au
  milieu (tonneau, flacon : bornes −H et H). Variantes = objets : verre à vin f(x) = √(ax) avec
  pied, vase évasé r + x²/n avec fond, tonneau bombé R − x²/n, flacon ellipsoïdal
  (b/a)√(a² − x²) avec bouchon, pot de fleurs en tronc de cône (cotes en diamètres, f à trouver).
  Cinq écrans : modèle (choix fermé : disques / sans carré / sans π / rondelles avec le profil
  extérieur ou [2f(x)]²), bornes + [f(x)]² (ou f(x) pour le pot), V en cm³, contenance en L ou
  cL, transfert (hauteur du liquide — fraction de la contenance ou quantité en cL/L —, nombre de
  récipients — partie entière, ou entier supérieur pour le vase —, comparaison avec un cône ou un
  cylindre coté en diamètre, verdict 50/50). Messages ciblés sur les pièges (π, carré, diamètre,
  cote totale, conversion, arrondi) ; `parse_error` refusé avant soumission. Calculs exacts par
  fractions dans `core6e/contenanceObjetsCalcul.ts` (partagé A/B/ui). `forme` = objet-transfert,
  pas de cas particulier, `calcul` exacte (comparaison, fraction du verre ; sauf tonneau) /
  calculatrice. Piège découvert : une figure SVG dans `construireEnonce().enteteHtml` (ids uniques
  par appel) rend l'empreinte anti-doublon du pipeline toujours nouvelle → figure seulement dans
  `enoncePapier`. Cours : `methode` « Contenance d'un objet de révolution » avant la carte (pas
  d'exemple, rien à ajouter à `ENONCES_DEMONSTRATION`).
- **6e (6h), Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen79
  « Comparer et encadrer des intégrales » (section `integralesdefinies`, processus 2, carte après
  celle de 6gen25). Quatre variantes : signe d'une intégrale sans la calculer (f de signe constant,
  bornes dans l'ordre ou échangées — écran « positivité, bornes dans l'ordre » en plus quand elles
  sont échangées), comparaison de ∫f et ∫g (f ≤ g, f ≥ g ou f − g qui change de signe : verdicts
  équiprobables, tirés AVANT la paire et l'intervalle), encadrement m(b − a) ≤ I ≤ M(b − a) (f
  monotone : dérivée à étudier ; ou tableau de variations donné), encadrement de la valeur moyenne
  (m et M, intégrale, puis μ). Choix fermés à une tentative, champs exacts (e, ln, √, fractions)
  ou au centième. Figures : pour le signe et la comparaison, seulement une fois l'étape 1 close
  (elles montreraient la réponse) — f orange et g bleu quelle que soit l'issue, région entre elles
  grise ; pour l'encadrement, courbe sans graduation verticale ou tableau de variations, rectangles
  m(b − a) et M(b − a) à la validation finale et dans le corrigé. Profil : `forme` = variante
  (+ ordre des bornes, + monotone/variations) ; `calcul` seulement pour l'encadrement et la
  moyenne. Le cours énonçait déjà positivité et croissance mais pas l'encadrement comme propriété :
  sous-titre « Comparer et encadrer une intégrale sans la calculer », un `methode` (signe, bornes
  échangées, comparaison, encadrement et valeur moyenne), un exemple résolu (encadrer
  ∫₀¹ e^{x²} dx puis le comparer à ∫₀¹ eˣ dx, énoncé ajouté à `ENONCES_DEMONSTRATION`, clé
  « encadrer une intégrale sans primitive ») et un `piege` (bornes échangées, x³ ≤ x² sur [0 ; 1]).
- **6e, Chapitre 4 — Intégrales et primitives** (`primitives-integrales`) : nouveau 6gen81
  « Aires de formes réelles » (section `aires`, processus 3, carte après 6gen26). Quatre
  situations : mur à fronton en arc de parabole (surface à peindre, litres pour deux couches,
  pots arrondis à l'unité SUPÉRIEURE, coût), vitrail (lentille entre deux arcs, intersections à
  trouver, verre clair, coût avec conversion dm² → m²), section d'un canal / tunnel / gouttière
  (aire puis volume = aire × longueur, litres pour la gouttière), parcelle bordée par une rivière
  (unité 10 m : 1 u.a. = 100 m², valeur du terrain). Fonction donnée (repère superposé au schéma)
  ou À RETROUVER : par les deux pieds et le sommet (mur, section — origine LIBRE sur l'axe de la
  base : la fonction est acceptée à translation près, les bornes doivent être les pieds dans le
  repère de l'élève) ou par le sommet et un point (parcelle, forme canonique). Profil :
  `forme` = situation + donnée/retrouver (+ contexte de la section), `calcul` exacte/calculatrice,
  aucun cas particulier. Le cours ne parlait pas de modéliser une forme réelle : une `methode`
  « Aire d'une forme réelle » ajoutée avant la carte (pas d'exemple, donc rien à ajouter à
  `ENONCES_DEMONSTRATION`).

- **6e (6h), Chapitre 4 — retours de l'utilisateur sur le lot 6gen77–84** : 6gen82 — famille xⁿ
  élargie aux exposants fractionnaires 3/2, 5/2, 4/3, 5/3 (une fois sur deux), point de lecture
  carré ou cube parfait pour que L(p) reste décimal exact, aide « racine puis puissance », forme
  `lecture:puissance-frac` à part dans le profil. 6gen80 — variante « cuve-max » sans figure dans
  l'énoncé (le croisement e/s donnait l'instant du maximum), figure hachurée gardée au corrigé.
  6gen79 — courbes du signe et de la comparaison affichées dès le départ (écran et papier), version
  neutre pour le signe (région grise, légende sans le signe), figure colorée en fin d'exercice.
  6gen78 — encadré des données retiré (la définition de A était répétée). 6gen83 — tonneau et pot
  déclarés `calculatriceIndispensable` ; décision de l'utilisateur généralisée : en évaluation
  « calculatrice interdite », toute variante de cette liste est exclue (rangée grisée dans le
  panneau, retirée par `construireItemsPayload`).

- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen90
  « Échelles logarithmiques : rapports et sommes » (section `problemes`, processus 3, carte après
  6gen22). 6gen22 calcule pH, décibels et magnitude À PARTIR DE LA FORMULE ; 6gen90 fait raisonner
  sur l'échelle (écart ↔ rapport). Onze variantes = contexte × type : facteur → écart (n sources
  identiques, intensité divisée par k, magnitude d'un séisme k fois plus énergétique, pH après
  dilution, magnitude d'une étoile k fois plus/moins lumineuse), écart → rapport (deux niveaux
  sonores, amplitudes et énergies de deux séismes, concentrations en ions H₃O⁺, éclat de deux
  étoiles), écart visé → nombre minimal de sources (entier SUPÉRIEUR). Trois écrans fixes : traduire
  (choix fermé de la relation), calcul (écart, ou logarithme du rapport), réponse en contexte à la
  précision annoncée ; écran `EtapeAccumulerGrandeur` de 6gen80 réutilisé tel quel. Profil :
  `forme` = variante, `calcul` exacte (facteur puissance de 10, logarithme du rapport entier) /
  calculatrice, régime tiré avant les nombres ; aucune variante sans instance exacte. Le cours ne
  donnait l'écart ↔ rapport que par deux exemples (énergie des séismes, deux machines de 60 dB) :
  ajout d'une `methode` « Raisonner sur une échelle logarithmique : écart ↔ rapport » et d'un
  `featureTable` (décibels, séisme amplitude/énergie, pH, étoiles) avant la carte — pas d'exemple,
  donc rien à ajouter à `ENONCES_DEMONSTRATION`. Libellé de la page de conception donné à 6gen22.
- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen85
  « Lire une courbe logarithmique » (section `parametres`, processus 2, carte après 6gen18). À
  partir du graphique de f(x) = logₐ(x − c) + d : variante « lecture » (asymptote, domaine construit,
  base via le point une unité plus haut/plus bas que (c + 1 ; d), expression — log2(…), log(…),
  ln(…)/ln(1/2) acceptés) et variante « associer » (4 courbes, 4 expressions : référence, miroir de
  sens opposé, autre base de même sens, même base avec une translation changée ; un choix fermé par
  courbe). Bases 2, 3, 4, 5, 10 (lecture seulement) et 1/2, 1/3, 1/4 ; c, d entiers ; figure SVG
  unique écran/papier (`ui6e/figureCourbeLogarithmique.ts`, quadrillage d'une unité, fenêtre aux
  bornes entières, courbe échantillonnée en ln(x − c) pour atteindre le bord même en base 10, clip
  à identifiant dérivé du contenu) ; papier = courbe seule, points et coordonnées au corrigé.
  Profil : `forme` = variante + sens de variation + translations présentes, aucun cas particulier,
  pas de `calcul`. Le cours ne montrait pas comment lire la base sur un graphique : une `methode`
  « Lire une courbe f(x) = logₐ(x − c) + d » ajoutée avant la carte (pas d'exemple, donc rien à
  ajouter à `ENONCES_DEMONSTRATION`) ; libellé « Paramètres depuis des conditions graphiques
  (6gen18) » donné à l'entrée pilote de 6gen18.
- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen91
  « Optimiser un modèle logarithmique » (section `etude`, processus 3, carte après 6gen21). Cinq
  situations (= `forme`) : engrais R(x) = c + a ln(1 + x) − bx (dose optimale a/b − 1), bénéfice
  B(q) = a ln(q) − bq − c, bénéfice moyen (a ln(x) + d)/x (maximum en eᵏ), coût moyen
  a x ln(x) − bx + c (minimum en eᵏ, dont 1/e), débit d'une route av − bv ln(v) (maximum en eᵏ).
  Cinq écrans : domaine dans le contexte (crochets + bornes ; piège ]−1 ; +∞[ ou 0 inclus),
  dérivée, valeur EXACTE qui l'annule (une valeur approchée reçoit un message sans consommer de
  tentative), maximum/minimum (choix fermé, une tentative), optimum et valeur dans les unités de
  l'énoncé (exactes ou arrondies selon `mode`). Profil : aucun cas particulier, `calcul` = mode
  (engrais et bénéfice toujours « calculatrice », déclarés `calculatriceIndispensable`). Pas de
  figure dans l'énoncé (la courbe donnerait la nature et la position de l'optimum) ; courbe avec
  l'optimum au corrigé et en fin d'exercice. La section `etude` n'avait pas d'optimisation en
  contexte : sous-titre « Optimiser un modèle en contexte », un `para` et un `exemple` (débit
  D(v) = 5v − 2v ln(v), clé `ENONCES_DEMONSTRATION` « vitesse qui maximise le débit ») ajoutés
  avant la carte de 6gen21. Libellé de conception donné à 6gen21 (« Étudier une fonction (6gen21) »).
- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen88
  « Le détective d'erreurs : logarithmes » (section `problemes`, processus 3, carte après celle de
  6gen22), même mécanique que 6gen84 : `CopieEleve`, `EtapeLigneFausse`, `EtapeDescriptionErreur`
  et `BlocAides` réutilisés tels quels depuis `4e/components/EtapesDetectiveErreurs.tsx` ; écran 3
  propre (`components6e/EtapeCorrectionDetectiveLogarithmes.tsx`) avec quatre genres de valeur :
  nombre, fonction (vérificateurs de 6gen84 réutilisés), ENSEMBLE FINI de solutions (champ libre,
  « ; » entre les valeurs, ∅, comparaison ensembliste, aperçu `S = {…}`) et INTERVALLE
  (`EnsembleReelGuideBuilder` de 6gen14/6gen15, bornes exactes via `evaluerValeurExponentielle`).
  8 variantes = types d'erreur, 16 scénarios (2 par variante, support + ligne fausse fixes) :
  ln(x + a) écrit ln(x) + ln(a) / ln(eᵏx) écrit ln(eᵏ)·ln(x) ; ln(x²) = 2 ln(x) sans valeur absolue
  (équation : solution −a perdue ; inéquation : solutions négatives perdues) ; CE calculée sur la
  forme regroupée / CE jamais vérifiée (solution parasite gardée) ; base 1/2, 1/3, 0,5 ou 0,2 sans
  inverser le sens ; (ln x)² pris pour 2 ln(x) (équation, dérivée) ; quotient de logarithmes écrit
  log(x − y) ; (ln u)′ écrit 1/u (ln(x² + c), tangente à ln(ax + b)) ; changement de base inversé
  (aˣ = b, log_B(A)). Conclusion de chaque copie cohérente avec l'erreur. Valeurs toutes exactes
  (rationnels, puissances de e, quotients de ln) ; `forme` = type + scénario + ligne, aucun cas
  particulier, pas de `calcul`. Piège de mise en page trouvé au parcours à 390 px : le constructeur
  d'intervalle dans une grille CSS débordait (min-width auto des éléments de grille) — colonnes
  `minmax(0, 1fr)` + `minWidth: 0`. Le cours couvrait déjà toutes les règles : seulement la carte.
  Dans `GENERATEURS_EVALUATION_PILOTE`, 6gen22 reçoit un libellé (« Logarithmes : problèmes »).
## 6e (6h), Chapitre 3 — 6gen86 « Comparer et encadrer des logarithmes sans calculatrice »

- Section `proprietes` : nouvelle sous-section « Encadrer et comparer des logarithmes sans
  calculatrice » (avant « Le logarithme népérien ») — `para` (notation `log` = log₁₀, monotonie de
  logₐ), `methode` (encadrer entre deux entiers, cas 0 < a < 1, encadrements identiques → changement
  de base), deux `exemple` (badges « encadrer et comparer des logarithmes », « valeur approchée par
  le changement de base », énoncés dans `ENONCES_DEMONSTRATION`). Carte `6gen86` après celle de 6gen13.
- Générateur `6gen86` (`generateurs6e/comparerEncadrerLogarithmes/`) : 4 variantes — encadrer
  logₐ(N) (puissances → encadrement), comparer A et B (encadrer A, encadrer B, verdict <, >, = tiré
  avant la construction : bases sans lien aux encadrements séparés, ou bases c et cⁿ aux
  encadrements identiques tranchés par le changement de base ; bases < 1 une fois sur 3), ranger
  4 nombres (entier n de chaque logarithme, puis ordre au doigt : boutons touchés dans l'ordre,
  « Effacer »), changement de base avec log 2 ≈ 0,301 et log 3 ≈ 0,477 (ou ln 2, ln 3). Aucun
  logarithme rationnel « déguisé » (log₄ 8) n'est tiré. Champs : un nombre (une saisie avec
  logarithme est illisible, sans tentative décomptée). Profil : aucun cas particulier, pas de
  `calcul`, `forme` = variante (+ « base < 1 » pour comparer).
- **6e (6h), Chapitre 3 — générateur 6gen92 « Grands nombres et logarithme décimal »** (section
  `proprietes`, processus 3, carte juste après celle de 6gen13) : le logarithme décimal pour des
  nombres trop grands pour la calculatrice. Quatre variantes : nombre de chiffres de aⁿ (dont
  le contexte des nombres premiers de Mersenne 2ⁿ − 1 découverts de 1952 à 1982) ; comparer aⁿ
  et bᵐ (logarithmes à la calculatrice, ou sans calculatrice par un même exposant : 2³⁰⁰ = 8¹⁰⁰,
  3²⁰⁰ = 9¹⁰⁰ ; verdict tiré avant la construction) ; écriture scientifique et premier chiffre ;
  temps de calcul d'un algorithme en 2ⁿ opérations (durée en secondes puis en années, ou plus
  grand n traitable en une durée donnée). Marges du générateur : partie décimale de n·log a dans
  [0,01 ; 0,99], mantisse à 0,05 au moins d'un entier, écart des logarithmes ≥ 0,02. Profil :
  aucun cas particulier, `forme` = variante + sous-cas, `calcul` exacte seulement pour la
  comparaison par même exposant ; `calculatriceIndispensable` = chiffres, premier-chiffre, temps.
  Le cours n'avait pas le lien « nombre de chiffres ↔ partie entière de log » : sous-titre
  « Le logarithme décimal et les très grands nombres », `methode`, `exemple` (« nombre de chiffres
  de 2¹⁰⁰⁰ », énoncé ajouté à `ENONCES_DEMONSTRATION`) et `piege` (« + 1 » oublié) ajoutés avant
  la carte de 6gen13. Libellé de la ligne 6gen13 de la page de conception renseigné.
- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen89
  « Linéariser des données : du tableau au modèle » (section `problemes`, processus 3, carte juste
  après 6gen22). Un tableau de 6 mesures en contexte, arrondies à 3 chiffres significatifs (les
  points transformés ne sont donc pas exactement alignés). Trois variantes : semi-log (y = k·aᵗ :
  refroidissement — écart à la pièce, loi de Moore, bactéries, décharge d'un condensateur,
  désintégration), log-log (y = k·xⁿ : 3e loi de Kepler n = 1,5, métabolisme n ≈ 0,75, chute libre
  n = 2, éclairement n = −2) — écrans ln des deux lignes désignées → pente → ordonnée à l'origine →
  modèle (k = eᵖ, a = eᵐ ou n = m) → prévision (valeur, ou abscisse d'un seuil) ; « choisir »
  (contextes neutres, issue aucune/semi-log/log-log tirée avant la construction, rejet tant que la
  bonne représentation n'aligne pas les points à 1 % près et que les deux autres ne s'en écartent
  pas de 6 %) — choix → pente → ordonnée → prévision (même nombre d'écrans quelle que soit
  l'issue ; « aucune » = données brutes déjà alignées, modèle affine). Tolérances : intervalle
  obtenu en propageant aux coins les arrondis acceptés des étapes précédentes (ln, m, p au
  millième ; k à 4 chiffres significatifs ; a, n au millième), plus une demi-unité de la précision
  annoncée — la consigne de la prévision le dit (« petite différence due aux arrondis acceptée ») ;
  les tirages dont la tolérance dépasserait 5 % sont rejetés. Profil : aucun cas particulier,
  `forme` = variante + type de prévision (`choisir` seul : le verdict reste libre), `calcul`
  calculatrice, `calculatriceIndispensable: true`. Énoncé papier : contexte + tableau + a) modèle,
  b) prévision ; nuage transformé et droite seulement au corrigé (et en fin d'exercice à l'écran).
  Cours : sous-titre, `methode` « Linéariser des données » et un `exemple` (badge « linéariser un
  refroidissement », énoncé ajouté à `ENONCES_DEMONSTRATION`) avant la carte ; libellés de la page
  de conception : « Logarithmes : problèmes (6gen22) » et « Linéariser des données (6gen89) ».
- **6e (6h), Chapitre 3 — Fonctions logarithmes** (`fonctions-logarithmes`) : nouveau 6gen87
  « Tangentes aux courbes logarithmiques » (section `derivee`, carte après 6gen16, processus 2).
  Trois variantes : tangente en un point (f′(x) → f(x₀) et f′(x₀) → y = mx + p ; familles
  k ln(bx + c) + d, log_b(x), x ln(x) + cx, k ln(x)/x, k ln(x² + q)), tangente(s) parallèle(s) à une
  droite (f′(x) → abscisses de contact dans le domaine → une équation par tangente ; le nombre de
  tangentes, une ou deux, est tiré à 50/50 avant la famille), tangente passant par P(0 ; p)
  (équation en a → valeur de a → équation). Valeurs toutes exactes (combinaisons rationnelles de
  1, ln n, eᵏ, 1/eᵏ, √e, 1/ln b : `generateurs6e/tangentesLogarithmiques/exact.ts`), équations
  vérifiées par équivalence (« y = … », « … = y », « ux + vy + w = 0 » ou l'expression seule).
  Piège rencontré : deux points de MÊME pente proches l'un de l'autre encadrent un point
  d'inflexion et leurs tangentes sont presque confondues (k ln(x² + q) : écart d'ordonnée à
  l'origine toujours < 0,4 ; x²/2 + 2 ln(x) avec racines 1 et 2 : 0,11) — figure illisible ; la
  variante « parallèle » n'utilise donc que des racines écartées (1 ; 4), (1 ; 5), (1 ; 6),
  (2 ; 6) et les familles x²/2 + bx + c ln(x) et k ln(x) + c/x (une tangente : racine négative
  rejetée par le domaine ou racine double). L'ordonnée à l'origine de d est DÉTERMINÉE par f et la
  pente, pour que l'anti-doublon des séries écarte deux instances ne différant que par d. Profil :
  `forme` = variante + famille, aucun cas particulier, pas de `calcul`. Le cours ne traitait pas
  l'équation d'une tangente avec ln : `methode` « Tangente à une courbe logarithmique » (trois
  cas) et `exemple` « tangente à ln passant par l'origine » (énoncé ajouté à
  `ENONCES_DEMONSTRATION`) insérés après l'exemple « étudier un signe avec ln ».
- **6e (6h), Chapitre 3 — 6gen17 : famille D « Puissances f(x)^g(x) : formes 1^∞, 0^0, ∞^0 »**
  (demande de l'utilisateur, qui LÈVE la décision K4 de l'audit : l'ancienne famille D « forme 1^∞ »
  avait été retirée faute de cours ; la famille E — développements limités — reste retirée).
  Méthode unique : f^g = e^{g ln f} (f > 0), L = lim g ln f, puis continuité de l'exponentielle.
  7 sous-types disjoints (`familles/D.ts`, écritures `ui6e/formatLimitesPuissances.ts`) : 1^∞ —
  d1 (1 + a/x^p)^{(b/d)x^q} (x → ±∞), d2 ((x+b)/(x+c))^{kx^q}, d3 (1 + ax)^{c/x^q} (x → 0±) ;
  0^0 — d4 x^{ax^q} / x^{a/ln x}, d5 (e^{−1/x^p})^{ax^q} ; ∞^0 — d6 x^{a/x^q} / x^{a/ln x},
  d7 (e^{x^p})^{a/x^q}. **Équilibre** : type de forme et issue (valeur finie ≠ 1, 1, +∞, 0) tirés
  uniformément et indépendamment AVANT le sous-type (chaque type admet les 4 issues ; rejet sur les
  seuls paramètres : |L| ≤ 6, fraction irréductible) — mesuré sur 6 000 tirages : issues 24–26 %,
  types 32–35 %, chaque couple type × issue 7,8–9,2 % ; tirage libre A/B/C/D à 25 %. Catalogue :
  3 entrées par TYPE (« D-1inf », « D-00 », « D-inf0 ») ajoutées en fin (codes QR existants
  valides), jamais par issue. Trois écrans : (1) limites de la base (0, 1, +∞ en boutons —
  `ConfigPartieDiagnostic.optionsValeurs`) et de l'exposant + type de forme (choix fermé avec
  « pas indéterminée » en distracteur, prop `choix` d'`EtapeDiagnosticC`), 1 tentative ; (2) L
  (`EtapeReponseLimiteLog`) ; (3) lim f^g, e^L exact. Écrans 2–3 : une CATÉGORIE fausse (+∞ / −∞ /
  0 / valeur) clôt l'écran (message « ce choix ne se rejoue pas »), seule une valeur fausse dans la
  bonne catégorie consomme les 3 tentatives ; saisie illisible = message sans tentative
  (`diagnostiquerValeur`) ; e^L comparé par son logarithme (|ln s − L| ≤ 10⁻³ — la tolérance absolue
  de 0,005 acceptait 0 pour e^{−6}). Aides (2 niveaux) : réécriture / outil (ln(1+u)/u avec u
  explicite, croissance comparée, ln(e^t) = t), puis expression substituée non simplifiée.
  Corrigé « comme au tableau » de D seulement (`limitesLogarithmiques/corrigeDetaille.ts`, partagé
  écran/papier, `CorrigeDetailleEcran` après échec) ; A–C gardent l'ancien corrigé. Profil :
  `forme` = « D:type » (jamais l'issue) ou la famille pour A–C (en tirage libre, une question A
  reste A dans les séries B, C). Cours § 5 : sous-titre « Puissances : les formes 1^∞, 0^0 et
  (+∞)^0 », `intuition` (intérêts composés (1 + 1/n)^n → e), `methode`, deux `exemple` (badges « la
  limite qui définit e », « forme 0⁰ : x exposant x », énoncés clés), `piege` « 1^∞ ne vaut pas 1 » ;
  formulaire : f^g = e^{g ln f} et (1 + a/x)^x → e^a ; une question de compréhension ; quiz 6gen66 :
  4 affirmations (thème limites : 39, total 354 — texte de la carte mis à jour).

## 4e, Chapitre 7 — gen53 refondu : « Construction de la parabole au compas et à l'équerre »

- Ancien gen53 jugé raté par l'utilisateur (deux curseurs crantés sur une grille tournée avec d :
  l'élève comptait des carreaux, aucun geste d'instrument, pas de sommet, figure papier
  non orthonormée — rayon moyen de deux échelles différentes). Refonte totale :
  `core/constructionParabole.types.ts` (`methode`, `h` = 2, `theta`, `abscissesH`),
  `moteur/geometrieConstructionParabole.ts` (géométrie pure, repère local d : y = 0, F = (0 ; h)),
  `moteur/modeleConstructionParabole.ts` (écrans, tracés, acquis, vérification des GESTES),
  `moteur/sessionConstructionParabole.ts`, `components/PlanConstructionParabole.tsx` (figure Mafs
  sans grille + instruments), `SurcouchesConstructionParabole.tsx`, `ui/figureConstructionParabole.ts`
  (SVG papier, une seule échelle).
- Instruments : équerre = triangle qui glisse le long de d ou de l'axe (aimant 0,35 unité sur les
  projections des points remarquables, tolérance 0,25) ; compas = pointe choisie par BOUTONS
  « Pointe du compas en F/K/S/H… » + mine seule déplaçable (la zone tactile d'une poignée Mafs fait
  60 px : pointe et mine se chevauchaient au doigt pour une petite ouverture). Tracer / Effacer le
  dernier tracé ; un essai raté vide les tracés. Figure : zoom (0,7 à 4) et déplacement, bouton
  « Recentrer ». `Line.PointAngle` paraît tronquée sous `<Transform rotate>` (extrémités calculées
  avant rotation) et `Plot.Parametric` ignore la rotation : droites = longs `Line.Segment`, arcs de
  parabole = `Polyline` échantillonnée.
- Méthode du cercle (8 écrans) : axe (équerre sur d jusqu'à F) → sommet (cercles de même ouverture
  > KF/2 centrés en K et F, médiatrice tracée à la clôture) → report de r depuis K (pièges : pointe
  en F ou S, r ≤ KS, r trop proche d'un couple précédent) → parallèle (équerre sur l'axe jusqu'au
  point de coupe ; piège : côté opposé à F) → cercle de centre F à la même ouverture → deux couples
  « en enchaînement » (compas + équerre, diagnostic du premier geste fautif) → tracé (7 points
  touchés de proche en proche, arcs exacts entre voisins, segment pointillé sinon).
- Méthode de la médiatrice (7 écrans, variante) : axe → sommet (cas H = K) → perpendiculaire à d
  en H₁ → médiatrice de [FH₁] → H₂, H₃ en enchaînement → tracé ; le symétrique par rapport à l'axe
  de chaque point est ajouté (P′). Distances de H à K : trois parmi 1 ; 1,5 ; 2,5 ; 3,5 (au moins une
  ≤ 1,5 et une ≥ 2,5). Après chaque écran clos, PF et PH sont montrés codés égaux.
- Papier : énoncé = F, d oblique (et H₁, H₂, H₃) sans grille + consigne globale qui nomme la
  méthode ; corrigé « Étape n » (axe, sommet, trois couples/points, tracé) avec arcs de
  construction ; `forme` = méthode ; durée 15 min. Chapitre (section `parabole`) : paragraphe « En
  pratique, aux instruments » (axe, sommet par médiatrice, report depuis K, même ouverture), sous-titre
  « Deuxième méthode : la médiatrice » + figure (perpendiculaire en H ∩ médiatrice de [FH], PF = PH
  codés) + astuce (symétrique, choix des points, médiatrice = tangente).

- **5e (4h), Chapitre 3 — Suites** (`suites`), section `suites-geometriques` : nouveau générateur
  **5gen45 « Sommes de termes consécutifs »** (processus 2), carte après 5gen15 (et 5gen44). Quatre
  variantes, trois écrans à champs libres chacune : somme de uₚ à uₙ d'une suite arithmétique
  (formule an + b ou u₁ et r : nombre de termes → uₚ et uₙ → somme), somme arithmétique en extension
  (liste 7 + 11 + … + 203 : raison → N → S ; impairs/pairs : terme général → N → S ; multiples de d
  entre deux bornes : premier et dernier multiple → N → S), somme de uₚ à uₙ d'une suite géométrique
  (u₁ et q, ou formule k·qⁿ⁻¹ / k·qⁿ : N → uₚ → S = uₚ(1 − qᴺ)/(1 − q)), somme géométrique en
  extension (q → N par puissance connue → S). Termes toujours entiers (q = ±1/2 avec un premier terme
  multiple de la bonne puissance de 2), sommes ≤ 30 000 : tout est exact, pas de `calcul` dans le
  profil, aucun cas particulier ; `forme` = variante + type de données (+ `:fraction`), forme la plus
  rare ≈ 12,5 % de sa variante. Pièges diagnostiqués : « + 1 » oublié, rang du dernier terme pris
  pour N, Sₙ depuis u₁, u₁ au lieu de uₚ devant la fraction, exposant N ± 1, division par 2 oubliée,
  facteur (n − 1), quotient à l'envers. Cours : `attention` « une somme qui ne commence pas à u₁ :
  le premier terme de la somme » (avec 3 + 6 + … + 3072) et exemple résolu « somme de u4 à u9 »
  (énoncé ajouté à `ENONCES_DEMONSTRATION`) juste après l'exemple S₈ ; libellés de 5gen15 et 5gen45
  sur la page de conception.
- **5e (4h), Chapitre 3 — Suites** (`suites`) : nouveau 5gen44 « Définir et reconnaître une suite »
  (section `suites-geometriques`, carte après 5gen15, processus 2). Fusion (décision de
  l'utilisateur) de « notations et calcul de termes » et « nature d'une suite », cinq variantes,
  toujours trois écrans (le nombre de puces ne trahit jamais le verdict) :
  `notations` (uₙ = f(n) affine, second degré, homographique ou k·qⁿ : uₙ₊₁, puis u₂ₙ OU uₙ₋₁,
  puis uₚ ; vérification par ÉQUIVALENCE aux rangs entiers ; pièges diagnostiqués uₙ + 1, 2uₙ,
  uₙ − 1, substitution partielle, (2n)² ≠ 2n², rang décalé), `recurrence` (uₙ₊₁ = g(uₙ) non affine —
  uₙ/(1 + auₙ), (uₙ + a)/uₙ, a/(b − uₙ), (αuₙ + β)/(uₙ + δ), uₙ² + c : u₂, u₃, u₄ exacts, fraction
  acceptée, valeur approchée refusée avec message), `nature-formule` et `nature-recurrence`
  (uₙ₊₁ − uₙ puis uₙ₊₁/uₙ en expression — pour une récurrence l'élève écrit u pour uₙ, aperçu affiché
  uₙ —, puis verdict), `nature-termes` (4 ou 5 termes : tous les écarts, tous les rapports, verdict
  « compatibles avec… » ; pièges « écarts/rapports constants sauf le dernier », second degré,
  triangulaires ; le corrigé rappelle qu'une liste réfute mais ne prouve pas).
  Verdict : choix fermé (1 tentative) dont les options portent la raison candidate, toujours
  r = u₂ − u₁ et q = u₂/u₁ — le piège « on ne regarde que deux termes » est dans les options ; tiré
  AVANT la construction (1/3 par issue), jamais dans `forme`, jamais cas particulier. Profil :
  `forme` = `notations:{famille}:{double|precedent}`, `recurrence:{style}`, `nature-formule`,
  `nature-recurrence`, `nature-termes:{4|5}` ; aucun cas particulier ; pas de `calcul` (tout exact).
  Papier : seules les trois questions de `notations` restent en a) b) c) ; ailleurs énoncé + « Justifie
  et donne la raison » (différence/quotient = étapes du corrigé). Écritures exponentielles qui se
  simplifieraient (3·3ⁿ, 3/3ⁿ, 2ⁿ⁺¹/4) écartées. Cours : sous-titre « Définir et reconnaître une
  suite », `attention` (uₙ₊₁ ≠ uₙ + 1, u₂ₙ ≠ 2uₙ, exemple uₙ = n² + 3n) et `methode` (formule,
  récurrence, liste de termes « compatible ») avant la carte. Fichiers : `App5gen44.tsx`,
  `core5e/definirSuite.ts`, `generateurs5e/definirSuite/` (index, profilEvaluation,
  exportEvaluation), `moteur5e/{types,session,verification}DefinirSuite.ts`,
  `ui5e/{format,recapitulatif}DefinirSuite.ts`, `components5e/EtapeDefinirSuite.tsx`.

- **5e (4h), Chapitre 3 — Suites** (`suites`), section `suites-geometriques` : nouveau générateur
  **5gen46 « Trois termes consécutifs »** (processus 2), carte après 5gen45. a, b, c dépendent de x :
  pour quelle(s) valeur(s) de x sont-ils trois termes consécutifs d'une suite arithmétique
  (variante `arithmetique`, 2b = a + c, expressions affines ou avec des x² qui s'éliminent, toujours
  une solution) ou géométrique (variante `geometrique`, b² = a·c, expressions affines) ? Quatre
  écrans : relation (choix fermé, UNE tentative, 5 relations mélangées), équation réduite « … = 0 »
  (vérifiée à un facteur non nul près ; écriture non réduite, second membre non nul ou « x = … »
  refusés SANS consommer de tentative), valeur(s) de x (« Aucune valeur ne convient » / liste à
  compléter, patron de `4e/components/EtapeZeros.tsx`), puis a, b, c et la raison pour chaque valeur.
  Géométrique : le NOMBRE de valeurs qui conviennent (0, 1, 2) est un verdict tiré avant la
  construction (1/3 chacun) ; 2 → second degré à deux racines (interpolation de deux suites
  géométriques) ; 1 → racine double, ou racine annulant deux termes consécutifs (à ÉCARTER) + racine
  valable, ou premier degré ; 0 → Δ < 0, premier degré dont la racine annule deux termes, ou « 0 = k »
  (ex. x, x + 1, x + 2). Racines et termes entiers, raison q fraction possible. Sans valeur qui
  convient, l'exercice s'arrête après l'écran 3 mais la barre garde quatre puces (4e « sans objet »)
  pour ne pas trahir le verdict. Profil : aucun cas particulier, pas de `calcul`, `forme` =
  `arithmetique:affine|carres`, `geometrique:degre1|degre2` (forme la plus rare ≈ 22 %). Pièges
  diagnostiqués : 2 non distribué, signes, double produit oublié dans b², b au lieu de b², solution
  écartée gardée, solution manquante, raison à l'envers ou en différence. Cours : `methode` « trois
  termes consécutifs a, b, c qui dépendent de x » (b² = a·c plutôt que b = √(a·c), fausse si b < 0 ;
  aucun terme nul) et exemple résolu « trois termes consécutifs, x à trouver » (x − 1, 3x − 3, x + 15 :
  x = 1 écartée, x = 3 convient) après « isoler x entre deux termes », énoncé ajouté à
  `ENONCES_DEMONSTRATION` ; libellé de 5gen46 sur la page de conception.
- **5e (4h), Chapitre 3 — Suites** (`suites`), section `problemes-classiques` : nouveau générateur
  **5gen47 « Modéliser une situation par une suite »** (processus 3), carte après 5gen17, précédée
  d'un sous-titre « Modéliser une situation concrète par une suite » et d'un `methode` (nature —
  pourcentage de la valeur précédente ou d'une valeur fixe —, u₁ selon l'année de rang 1, raison
  r ou q = 1 ± t/100, rang = année − année de rang 1 + 1, terme / somme / seuil). 31 contextes
  (stocks : population, abonnés, valeur d'une voiture, livret… ; flux annuels : salaire, loyer,
  production, déchets, CO₂… — seuls les flux ont un « total »). Trois variantes = question finale
  (terme d'une année, total sur une période, première année où l'on franchit un seuil), toujours
  cinq écrans : nature (choix fermé, 1 tentative) → u₁ → raison → rang / N / tableau de quatre
  termes consécutifs (bascule en 2e-4e ligne, comme 5gen18) → uₙ / S_N / année. Départ `avant`
  (40 %) : l'énoncé donne la valeur de l'année précédant le rang 1. Phrasé « intérêts égaux à t %
  de la somme déposée au départ » (arithmétique) contre « … de la somme présente sur le compte »
  (géométrique). Profil : `forme` = `{question}:{départ}`, aucun cas particulier, nature jamais
  dans la forme (tirée 50/50 avant la boucle de rejet) ; `calcul` tiré INDÉPENDAMMENT de la
  nature (géométriques exactes q = 2 ; 1,5 ; 1,25 ; 0,75 ; 0,5 avec termes entiers, arithmétiques
  « lourdes » décimales ou non rondes) pour que la contrainte de calculatrice ne trahisse pas le
  verdict. Tolérance d'une unité de la précision annoncée en mode calculatrice ; unité tapée en fin
  de saisie ignorée. Pièges diagnostiqués : q = t/100, 1 + t/100 pour une baisse, valeur de l'année
  précédente prise pour u₁, rang décalé (sans le + 1), terme ↔ somme, rang au lieu de l'année,
  année trop tôt/trop tard, écart d'arrondi sur une somme. Fichiers : `App5gen47.tsx`,
  `core5e/modeliserSuite.ts`, `generateurs5e/modeliserSuite/` (index, contextes, profilEvaluation,
  exportEvaluation), `moteur5e/{types,session,verification}ModeliserSuite.ts`,
  `ui5e/{format,recapitulatif}ModeliserSuite.ts`, `components5e/EtapeModeliserSuite.tsx` ; libellés
  de 5gen17 et 5gen47 sur la page de conception.

- **5e (4h), Chapitre 3 — Suites** (`suites`), section `convergence` : nouveau générateur
  **5gen48 « Somme infinie en situation »** (processus 3), carte après 5gen16. Quatre familles,
  quatre écrans à champ libre chacune (premier terme u₁ → raison q → S∞ exacte, la condition
  |q| < 1 étant demandée dans la consigne et justifiée dans la réponse/le corrigé, plutôt qu'un choix
  toujours « oui » → réponse au problème) : `periodique` (0,272727…, 2,4545…, 1,2333…, 0,41515… →
  fraction irréductible ; sous-cas pur/mixte), `rebonds` (balle/bille/ballon lâché de h, remontées à
  p % ; distance = h + 2·S∞), `zenon` (poursuite d'Achille et de la tortue, d'un chien et de son
  maître, d'un cycliste et d'un piéton découpée en étapes à la Zénon : le poursuivi avance de la
  moitié, du tiers, du quart… de la distance restante ; uₙ = distance du poursuivi, réponse =
  avance + S∞), `figures` (triangles des milieux avec triangle central colorié, ou hexagones des
  milieux avec une couronne sur deux coloriée, q = 9/16 ; réponse = aire non coloriée) — jamais des
  carrés (déjà dans 5gen17). Figures SVG sans identifiant, une seule construction pour l'écran et le
  papier (`export5e/svgSommeInfinieSituation.ts`, palettes écran/papier). Valeurs exactes comparées à
  10⁻⁹ près ; valeur approchée et fraction non irréductible (réponse finale du nombre périodique)
  refusées SANS consommer de tentative. Profil : aucun cas particulier, pas de `calcul`, `forme` =
  `periodique:pur|mixte`, `rebonds`, `zenon`, `figures:triangle|hexagones` (≈ 50 % chacune dans sa
  variante). Pièges diagnostiqués : partie fixe prise pour u₁ ou oubliée, bloc mal placé, q = 1/10
  pour un bloc de deux chiffres, q à l'envers ou 1 − q, pourcentage tel quel, hauteur de départ
  prise pour u₁, h + S∞ / 2(h + S∞), distance du poursuivant prise pour u₁, S∞ sans l'avance, 3/4
  au lieu de 9/16, 1/2 au lieu de 1/4, 1 + q au dénominateur, somme commencée à u₂, aire coloriée
  donnée au lieu de l'aire non coloriée. Cours : `methode` « une somme infinie en situation » (u₁ et
  q, |q| < 1, revenir à la question : partie non périodique à ajouter, h + 2S∞) juste après
  l'atelier Zénon ; libellés de 5gen16 et 5gen48 sur la page de conception.
- **5e (4h), Chapitre 3 — Suites** (`suites`), section `problemes-classiques` : nouveau générateur
  **5gen49 « Détective d'erreurs : suites »** (processus 3), carte après 5gen47 (le cours couvrait
  déjà toutes les règles : seulement la carte). Même mécanique que 6gen88/6gen84 : `CopieEleve`,
  `EtapeLigneFausse`, `EtapeDescriptionErreur`, `BlocAides` réutilisés depuis
  `4e/components/EtapesDetectiveErreurs.tsx` ; écran 3 propre (`components5e/EtapeCorrectionDetectiveSuites.tsx`,
  un champ libre, raccourcis qui REMPLISSENT le champ « n'existe pas » / « +∞ » / « −∞ », valeur
  approchée d'une valeur exacte non comptée, message « c'est le résultat de la copie »).
  **Choix de profil différent de 6gen88** (fiche validée : type d'erreur et ligne fausse sont des
  verdicts, jamais figés par `forme`) : VARIANTE = exercice support, pas le type d'erreur —
  arithmétique (somme u_p + … + u_m : n au lieu de n − 1 en ligne 1, n − p termes en ligne 3),
  géométrique (raison u₁/u₂ en ligne 1, qⁿ en ligne 2, n − p termes en ligne 3), pourcentage (valeur
  d'une année : q = t/100 en ligne 1, rang sans le + 1 en ligne 2, qⁿ en ligne 3), convergence (somme
  infinie : raison inversée en ligne 1 — avec |q| < 1 ou > 1 —, « q < 1 » au lieu de « |q| < 1 » en
  ligne 2 ; ou limite de P(n)/Q(n) : numérateur et dénominateur divisés par des puissances
  différentes en ligne 2). Type tiré uniformément dans la variante AVANT les nombres ; `forme` = la
  variante seule ; aucun cas particulier ; `calcul` seulement pour « pourcentage », mode exact
  (q = 1,5 ; 1,25 ; 1,2 ; 0,75 ; 0,8, termes entiers) / calculatrice (arrondi à l'unité, tolérance
  d'une unité) tiré à pile ou face INDÉPENDAMMENT du type (leçon de 5gen47). Plan réel 3 séries :
  même structure, nombres différents, verdicts différents d'une série à l'autre. Piège trouvé au
  collecteur : `nombreLatex(x, 0)` retirait les zéros finaux d'un ENTIER (10 790 → 1 079) — ne
  retirer les zéros qu'après une virgule. Fichiers : `App5gen49.tsx`, `core5e/detectiveSuites.types.ts`,
  `moteur5e/{modele,session,verification}DetectiveSuites.ts`, `ui5e/formatDetectiveSuites.ts`,
  `generateurs5e/detectiveSuites/` (index, profil, exportEvaluation). Libellé de conception
  « Détective d'erreurs : suites (5gen49) ».
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `dispersion` :
  nouveau générateur **gen108 « Effet d'une transformation des données »** (processus 3), carte en
  fin de section après gen34. Le cours n'en parlait pas : ajout, entre la carte gen34 et la carte
  gen108, d'un sous-titre « Transformer toutes les données : l'effet de y = ax + b », d'un `para`,
  d'un `featureTable` (moyenne/médiane → a·x̄ + b ; étendue, écart-type → |a| ; variance → a²), d'un
  callout `intuition` (« Pourquoi b ne change pas la dispersion ? »), d'un `exempleLibre`
  « Exemple résolu — conversion en degrés Fahrenheit » (énoncé ajouté à `ENONCES_DEMONSTRATION`,
  clé « conversion en degrés Fahrenheit ») et d'un `piege` (σ + b, variance × a, |a|).
  Générateur : indicateurs de départ DONNÉS (tableau x̄, médiane, étendue, Vₓ = σₓ² exacte, σₓ),
  transformation décrite avec les mots du contexte (24 contextes : prime, bonus, thermomètre
  corrigé, °C → K, hausse en %, soldes, h → min, km → m, g → kg, € → $, °C → °F, taxi, « bonus puis
  ×5 », « prime puis hausse », points manquants 20 − x, temps restant 90 − x). Quatre écrans : a et b
  de y = a·x + b ; moyenne et médiane ; étendue, variance, écart-type ; phrase de conclusion (choix
  fermé, 4 idées fausses fréquentes). Valeurs EXACTES et courtes par construction (≤ 3 décimales,
  ≤ 4 pour la variance) ; une saisie seulement arrondie ou illisible ne compte pas de tentative ;
  pièges reconnus avec message ciblé (b ajouté à σ, variance × a, −σ, a = 0,03 pour 3 %, b non
  multiplié quand la constante est ajoutée AVANT la multiplication). Profil : variante = nature
  (constante / multiplication / affine), `forme` = signature tirée AVANT le contexte avec poids fixes
  (pourcentage/facteur ; direct/avant/negatif), aucun cas particulier, `calcul` exacte si a ∈ {−1 ;
  0,001 ; 0,5 ; 2 ; 5 ; 60 ; 1000}, sans objet pour « constante ». Libellés de conception
  « Paramètres de dispersion (gen34) » et « Effet d'une transformation des données (gen108) ».
  Fichiers : `AppTransformationDonnees.tsx`, `core/transformationDonnees.types.ts`,
  `moteur/{contextes,session,verification}TransformationDonnees.ts`,
  `ui/formatTransformationDonnees.ts`, `components/EtapesTransformationDonnees.tsx`,
  `generateurs/transformationDonnees/` (index, profil, exportEvaluation).
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `frequences` :
  nouveau générateur **gen111 « Diagrammes et graphiques trompeurs »** (processus 2), carte après
  gen30. Le cours ne parlait ni du diagramme circulaire ni des graphiques trompeurs : ajout, entre
  la carte gen30 et la nouvelle carte, d'un sous-titre « Le diagramme circulaire » (para
  αᵢ = fᵢ × 360°, featureTable sur la série des livres : 108°, 126°, 72°, 54°) et d'un sous-titre
  « Graphiques trompeurs » (attention aux 4 manipulations + `illustrationGroup` de deux `curvePlot`
  compacts : mêmes ventes 1000 → 1080 sur un axe tronqué à 960 puis sur un axe partant de 0 ; les
  barres de l'axe tronqué ont `lower: () => 960`, sinon le polygone descendait sous le cadre). Aucun
  `exemple` ajouté (rien à mettre dans `ENONCES_DEMONSTRATION`). Trois variantes : diagramme
  circulaire dans les deux sens (direct : effectifs → fréquences → angles, le disque attendu en
  `figureHtml` du corrigé ; inverse : angles → fréquences → effectifs), lecture (bâtons sur un
  quadrillage d'une unité, ou disque en % avec une part « ? »), trompeur (axe tronqué, graduations
  irrégulières, pictogrammes agrandis dans les deux sens, parts dont le total dépasse 100 % —
  écran 1 en choix fermé, puis vraies valeurs lues sur l'axe et vraie évolution en %, ou somme des
  pourcentages et nombre total de réponses). `forme` = variante + sous-type (fiche validée : le type
  de manipulation est la signature de l'exercice) ; aucun cas particulier, pas de `calcul` (tout est
  exact). Pièges trouvés : la feuille de style des documents définit `--accent` en BLEU (secteurs
  « accent » et « sky » confondus sur papier) → teintes des secteurs prises hors `--accent` ;
  `.figure-corrige-bloc svg { width: 100% }` agrandissait le disque du corrigé sur 14 cm → largeur
  maximale mise en style inline ; contexte « couleur des voitures » retiré (secteur « Rouge »
  dessiné en bleu). Fichiers : `AppDiagrammesTrompeurs.tsx`, `core/diagrammesTrompeurs.types.ts`,
  `moteur/{modele,session,verification}DiagrammesTrompeurs.ts`, `ui/{format,figure}DiagrammesTrompeurs.ts`,
  `ui/formatNombreDiagrammes.ts`, `components/EtapesDiagrammesTrompeurs.tsx`,
  `generateurs/diagrammesTrompeurs/` (index, profil, exportEvaluation). Libellés de conception
  « Tableau de fréquences (gen30) » et « Diagrammes et graphiques trompeurs (gen111) ».
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `moyenne` :
  nouveau générateur **gen109 « Retrouver une valeur manquante »** (processus 3), carte après gen32.
  Le cours ne traitait pas le problème « inverse » : ajout, entre la carte gen32 et la carte gen109,
  d'un sous-titre « Retrouver une valeur manquante », d'un `methode` (l'inconnue au numérateur ET, si
  c'est un effectif ou un coefficient, au dénominateur ; conclure dans le contexte), d'un
  `exempleLibre` « Exemple résolu — la note à obtenir » (énoncé ajouté à `ENONCES_DEMONSTRATION`, clé
  « la note à obtenir ») et d'un `piege` « La moyenne des moyennes » (deux classes de tailles
  différentes). Générateur : quatre variantes — note à obtenir (avec ou sans coefficients ; verdict
  possible / impossible > 20 tiré à part, ≈ 20 % d'impossibles), effectif effacé d'un tableau
  (moyenne donnée ; la valeur de la ligne « ? » vaut au moins 2, sinon « v·k » se confondrait avec
  « k »), combien de valeurs ajouter (toutes égales au max — forme `haut` — ou au min — forme `bas`)
  pour que la médiane devienne une valeur donnée, deux groupes (moyenne globale, ou moyenne d'un
  groupe connaissant la globale). **Médiane = règle du seuil du cours** (première valeur dont
  l'effectif cumulé dépasse STRICTEMENT n/2, jamais la moyenne des deux valeurs centrales) : l'équation
  « seuil = effectif cumulé » donne k₀ ; en `haut` l'égalité suffit (k_min = k₀), en `bas` il faut
  dépasser strictement (k_min = k₀ + 1) — c'est l'écran 3 qui le fait décider ; chaque instance est
  contrôlée par la règle du seuil (k_min donne la médiane voulue, k_min − 1 non, k_min + 1 encore).
  Le « quel effectif pour une médiane » de la fiche est traité par cet ajout de valeurs (un effectif
  INCONNU donnerait une inéquation, pas une équation). Trois écrans : poser l'équation (choix fermé,
  les 3 fausses équations = pièges classiques : moyenne des moyennes, coefficients oubliés, effectif
  total non mis à jour, mauvais effectif cumulé…), la résoudre (champ, pièges reconnus = solutions
  des fausses équations), conclure (choix fermé). Écrans et vérification des champs de gen108
  (`EtapesTransformationDonnees.tsx`, `verificationTransformationDonnees.ts`) réutilisés tels quels.
  Valeurs exactes par construction (note sur une grille de 0,5, effectifs entiers, moyennes à au plus
  deux décimales). Profil : `forme` = « variante:forme » (sans-coef/avec-coef, effectif, haut/bas,
  globale/groupe) tirée AVANT les nombres, verdict jamais dans le profil, aucun cas particulier, pas
  de `calcul` (tout se fait sans calculatrice). Libellés de conception « Moyenne pondérée (gen32) »
  et « Retrouver une valeur manquante (gen109) ». Fichiers : `AppValeurManquante.tsx`,
  `core/valeurManquante.types.ts`, `moteur/{contextes,session}ValeurManquante.ts`,
  `ui/formatValeurManquante.ts`, `generateurs/valeurManquante/` (index, profil, exportEvaluation).
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `position` :
  nouveau générateur **gen110 « Moyenne ou médiane ? La valeur aberrante »** (processus 3), carte
  après gen33. Le cours avait déjà l'intuition du château, la méthode « Quelle valeur centrale
  choisir ? », l'atelier `valeur-aberrante-widget` et l'application du basketteur ; seul le
  contre-exemple (« les deux se valent ») manquait : ajout, entre la carte gen33 et la nouvelle
  carte, d'une `astuce` « Moyenne ou médiane ? Le test du retrait » (retirer la valeur la plus
  éloignée et comparer l'effet sur les deux indicateurs). Aucun `exemple` ajouté. Générateur : une
  série BRUTE non rangée en contexte (6 contextes = 6 variantes = `forme` : salaires d'une petite
  entreprise gérante comprise, trajet, prix des maisons d'un village, points au basket, notes —
  valeur la plus PETITE retirée —, délais de livraison). Le VERDICT (médiane / les deux se valent)
  est tiré à pile ou face AVANT la construction, jamais dans `forme` ; le récit est le même dans
  les deux cas (on retire toujours la plus grande valeur, isolée ou non) — il ne trahit rien.
  Écrans : a) moyenne et médiane ; b) les mêmes sans la plus grande (plus petite) valeur ;
  c) indicateur (moyenne / médiane / les deux se valent) ET justification (4 phrases, toujours les
  mêmes, mélangées) validés ensemble en UNE tentative, puis explication chiffrée et nuage de points
  (moyenne et médiane repérées, couleurs en dur, montré seulement après l'écran c et dans le
  corrigé). « La moyenne » n'est jamais la bonne réponse : c'est le piège de la fiche (« croire la
  moyenne toujours meilleure »). Médiane = règle du SEUIL du chapitre (rang ⌊n/2⌋ + 1) ; le
  générateur impose que les deux valeurs centrales de la série d'effectif pair soient égales, pour
  que la convention « moyenne des deux valeurs centrales » donne la même valeur. Moyennes exactes à
  au plus 2 décimales ; pièges reconnus (médiane lue sans trier, moyenne non recalculée, ancien
  effectif, moyenne/médiane interverties) ; champs de gen108 (`EtapeChampsTransformation`,
  `diagnostiquerChamps`) réutilisés ; notes en « /20 » (saisie « 13,5/20 » nettoyée avant lecture :
  sinon lue comme une fraction). Profil : `forme` = contexte, aucun cas particulier, pas de `calcul`
  (tout est exact). Libellés de conception « Paramètres de position (gen33) » et « Moyenne ou
  médiane ? La valeur aberrante (gen110) ». Fichiers : `AppValeurAberrante.tsx`,
  `core/valeurAberrante.types.ts`, `moteur/{modele,session}ValeurAberrante.ts`,
  `ui/{format,figure}ValeurAberrante.ts`, `components/EtapesValeurAberrante.tsx`,
  `generateurs/valeurAberrante/` (index, profil, exportEvaluation).
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `dispersion` :
  **famille ajoutée à gen34** (« Paramètres de dispersion », `AppDispersion.tsx`) — données
  GROUPÉES EN CLASSES. gen34 n'avait pas de catalogue : il en a désormais un (`"valeurs"` = la
  famille historique, construction, écrans, vérification et papier INCHANGÉS ; `"classes"`),
  branché sur `SelecteurVarianteDev`, l'adaptateur (`catalogueVariantes`) et `?code=` ; le tirage
  libre choisit une famille sur deux (conséquence : un QR code imprimé AVANT ce changement, sans
  variante, peut rouvrir un autre exercice). Famille "classes" : 4 ou 5 classes de même amplitude
  (2 unités d'échelle `tirerEchelle`, centres entiers), effectifs 2 à 12, x̄ gardé seulement s'il a
  au plus UNE décimale ; produits (xᵢ − x̄)²·nᵢ décimaux exacts à ≤ 2 décimales (stockés arrondis au
  centième) ; V et σ en cascade d'arrondis à 2 décimales comme la famille historique (même
  vérification exacte). Rejet des tirages où la moyenne SIMPLE des centres égale x̄ ou une moyenne
  « avec les bornes » (pièges indistinguables, trouvé au parcours : 140 = x̄ − demi-amplitude).
  `ExerciceDispersion.enClasses?` (optionnel) porte les classes et les valeurs des pièges : les
  exercices que l'exercice de synthèse gen35 fabrique (`versDispersion`) n'en ont pas et gardent
  exactement leur comportement. Écrans : a) NOUVEAU « centres et moyenne » (`EtapeCentresMoyenneDispersion`
  : colonne des centres + x̄, aides « Rappel : … » et « première classe / x̄ à compléter ») ;
  b) le tableau historique (centres en xᵢ) ; c) variance et écart-type. Pièges diagnostiqués :
  centre = borne, x̄ avec les bornes, x̄ non pondéré, écart-type sans la racine (ce dernier
  seulement pour la famille "classes", l'écran étant partagé avec gen35). Les deux écrans partagés
  reçoivent `saisieIllisibleNonComptee` (passé par `AppDispersion` seulement) : une saisie
  illisible n'est plus envoyée ni comptée dans gen34 (décision permanente), gen35 inchangé. Bug de
  mise en page corrigé au passage : les messages d'erreur à formule (`.alert-error` est flex)
  éclataient en colonnes — contenu enveloppé dans un seul `<span>`. Clé de génération sur les
  écrans (champs vides après « Générer »). Papier : énoncé = tableau des classes + consigne globale
  (« en représentant chaque classe par son centre… x̄ (valeur exacte), V et σ arrondis à la 2e
  décimale ») ; corrigé « Étape 1/2/3 » (tableau classes/centres/nᵢ/xᵢ·nᵢ, puis les étapes
  historiques réutilisées) ; barème 0,5 + 1 + 1 + 0,75 + 0,75 ; durée 8 min. Profil : `forme` =
  famille, `calcul` exacte ssi σ entier (classes : ~1 % des tirages, ~50 attendus par recherche de
  200 ms). Cours : `rappel` « Variance de données groupées en classes » avant la carte, description
  de la carte mise à jour. Fichiers : `core/dispersion.types.ts`, `generateurs/dispersion/{index,exportEvaluation}.ts`,
  `generateurs/profilsEvaluationStatistique.ts`, `moteur/{session,types,verification}Dispersion.ts`,
  `ui/{format,recapitulatif}Dispersion.ts`, `components/EtapeCentresMoyenneDispersion.tsx` (nouveau),
  `components/Etape{Tableau,VarianceEcartType}Dispersion.tsx`, `AppDispersion.tsx`.
- **4e, Chapitre 4 — Statistique descriptive** (`statistique-descriptive`), section `revision` :
  nouveau générateur **gen112 « Détective d'erreurs : statistique »** (processus 3), carte entre
  gen35 et l'astuce du quiz gen59 ; le paragraphe d'ouverture de la section passe de « Deux façons
  de réviser » à « Trois façons » (mention du détective). Aucun bloc de cours ajouté (toutes les
  erreurs sont déjà traitées : piège de la moyenne non pondérée, de la moyenne des moyennes, du seuil
  strict, convention n / variance arrondie). Même mécanique que gen91 et 5gen49 (`CopieEleve`,
  `EtapeLigneFausse`, `EtapeDescriptionErreur`, `BlocAides` réutilisés) : copie de 4 à 6 lignes,
  UNE fausse, la suite cohérente avec l'erreur ; a) ligne (1 tentative), b) description parmi 4
  (1 tentative), c) résultat final corrigé (champ libre, 3 tentatives, message « c'est le résultat
  de la copie »). Variante = exercice support (jamais l'erreur) : moyenne pondérée + pourcentage
  au-dessus de x̄ (moyenneNonPonderee L2 | cumulMalLu L4), médiane/Q1/Q3/écart interquartile d'une
  série brute n = 12 ou 16 (medianeNonTriee L1 | q1MalPlace L4), variance/écart-type
  (moyenneNonPonderee L2 | varianceSansN L4 | sansRacine L5), effectifs cumulés : Q1, Q3 et
  pourcentage entre les deux (q1MalPlace L2 | cumulMalLu L4), moyenne de deux groupes réunis
  (moyenneNonPonderee L2 | moyenneDesMoyennes L3). Type d'erreur tiré uniformément AVANT les
  nombres ; contraintes de données COMMUNES à tous les types d'une variante (un cumulé vaut toujours
  n/4 en « cumules », n toujours multiple de 4 en « position », une valeur toujours entre la moyenne
  pondérée et la moyenne des valeurs en « moyenne »…) et garantissant que CHAQUE erreur possible
  change le résultat final d'au moins 0,1 — aucun détail des données ne trahit le verdict. Règle du
  seuil du chapitre (rang ⌊n/2⌋ + 1 ; médiane et Q3 sans ambiguïté entre conventions) ; variance
  divisée par n et arrondie à 2 décimales avant la racine, écart-type au centième (tolérance 0,01).
  Profil (`generateurs/detectiveStatistique/profil.ts`) : `forme` = variante, aucun cas
  particulier, `calcul: 'calculatrice'` pour « dispersion » seule (déclarée dans
  `calculatriceIndispensable`). Libellés de conception « Synthèse — Statistique descriptive
  complète (gen35) » et « Détective d'erreurs : statistique (gen112) ». Fichiers :
  `AppDetectiveStatistique.tsx`, `core/detectiveStatistique.types.ts`,
  `moteur/{modele,session,verification}DetectiveStatistique.ts`, `ui/formatDetectiveStatistique.ts`,
  `components/EtapeCorrectionDetectiveStatistique.tsx`, `generateurs/detectiveStatistique/` (index,
  profil, exportEvaluation).

- **6e (6h), Chapitre 5 — générateur 6gen93 « Linéariser avec les formules d'Euler »** (section
  `formulemoivre`, carte après 6gen38, processus 2) : la sous-partie « Le chemin inverse :
  linéariser cosⁿx » n'avait pas de générateur. Expressions cos²x, sin²x, cos³x, sin³x, cos⁴x,
  sin⁴x, cos²x·sin x, cos x·sin²x, cos²x·sin²x. Variantes `degre2`/`degre3`/`degre4` (quatre
  écrans : a) facteur K = 1/(2ᵖ(2i)ᑫ), nombre complexe exact, « ^ » refusé sans tentative ;
  b) coefficients entiers du binôme, un champ par exponentielle ; c) coefficients de cos(kx) ou de
  sin(kx) — imaginaires purs « 2i », « −6i » quand q est impair ; d) forme linéarisée, expression
  libre vérifiée par équivalence numérique en six points, une expression égale mais non linéarisée
  — cos³x recopié, produit de cos — refusée sans tentative par un test de linéarité : chaque
  cos/sin multiplié par λ, l'expression doit être affine en λ) et `application` (linéariser, une
  primitive à une constante près, l'intégrale EXACTE sur un intervalle remarquable ; un décimal qui
  n'est qu'un arrondi refusé sans tentative). Pulsation a ∈ {1 ; 2 ; 3} (a = 1 une fois sur deux)
  dans les variantes de linéarisation : sans elle, la famille de degré 2 n'aurait que deux
  exercices et les séries d'une évaluation se répéteraient. Profil (`generateurs6e/linearisationEuler/
  profilEvaluation.ts`) : `forme` = famille de degré (`degre2`… ; `application:degN`), cas
  particulier `termes-trig-nuls` (application : les sinus/cosinus de la primitive s'éliminent entre
  les bornes, l'intégrale se réduit au terme constant), pas de `calcul` (tout est exact). Pièges
  reconnus : signe de K / (2i)ᑫ, i oublié au dénominateur, facteur 2 de 2cos(kx) oublié, i de
  2i·sin(kx) oublié, constante oubliée, K non appliqué, primitive dérivée, 1/k oublié, signe de
  −cos(kx)/k, F(a) − F(b). Cours : astuce « Avec des sinus : 2i sin(kx) » ajoutée après l'exemple
  « linéariser cos²x et cos³x » (exemple sin³x). Libellés de conception « Formule de Moivre
  (6gen38) » (jusque-là vide) et « Linéariser avec les formules d'Euler (6gen93) ». Fichiers :
  `App6gen93.tsx`, `core6e/linearisationEuler.ts`, `moteur6e/{types,session,verification}LinearisationEuler.ts`,
  `ui6e/{format,recapitulatif}LinearisationEuler.ts`, `components6e/EtapeLinearisationEuler.tsx`,
  `generateurs6e/linearisationEuler/` (index, profilEvaluation, exportEvaluation).
- **6e (6h), Chapitre 5 — Nombres complexes** (`nombres-complexes`), section `transformationsplan` :
  nouveau générateur **6gen95 « Lire et placer dans le plan complexe »** (processus 1), carte après
  6gen40, précédée d'un `featureTable` (opération → point obtenu → transformation : z̄, −z, −z̄, iz,
  2z, z + w, z − w ; renvoi à la section 4 pour module/argument). Placée d'abord en section 2
  (`affixesracines`) par l'agent, déplacée au merge en section 7 : l'exercice mobilise l'argument
  (section 4) et la rotation/homothétie (section 7), pas encore vus en section 2.
  Chaîne fixe de 5 écrans : lire z (et w) sur le quadrillage (forme réduite exigée, diagnostic
  « parties inversées » / signes) → placer P puis Q (images de A par deux opérations tirées) →
  associer chaque opération à sa transformation (choix fermé, UNE tentative, 8 options dont les
  distracteurs rotation −π/2 et translation de vecteur BO ; 6 sans point B) → |z_C| exact et un
  argument (radians, à 2kπ près ; valeur approchée, degrés ou saisie illisible refusées sans
  tentative). Repère FIXE [−5 ; 5]², tous les points dans [−4 ; 4]², distincts, à ≥ 1,5 l'un de
  l'autre ; z = a + bi avec a, b ≠ 0 et |a| ≠ |b| (z̄, −z, −z̄, iz, −iz distincts : chaque piège de
  placement — z̄ ↔ −z, iz tourné de −π/2, i² oublié, une coordonnée doublée, w − z au lieu de
  z − w, somme ↔ différence, parties inversées — a sa position et son message). Placement au doigt
  (`components6e/PlanComplexeInteractif.tsx`, SVG maison) : UN toucher sur le quadrillage place le
  point sur l'intersection la plus proche, une seule poignée (zone de 44 px) se fait glisser de nœud
  en nœud. **Piège trouvé** : Chromium (et Safari) n'appliquent pas `touch-action` aux éléments
  graphiques SVG — une poignée `<circle style="touch-action:none">` recevait `pointercancel` après
  deux déplacements (le navigateur reprenait le geste pour faire défiler) ; la poignée est donc un
  `<div>` HTML posé sur la figure. Le fond garde `touch-action: manipulation` (la page défile en
  glissant sur la figure, contrairement à Mafs qui bloque tout le plan). Vérifié sur iPhone 13
  émulé avec de vrais événements tactiles (CDP). Variantes = familles d'opérations : `symetries`
  (2 parmi z̄, −z, −z̄), `rotation-homothetie` (iz ou 2z + une autre), `translations` (z + w ou
  z − w + une autre). Papier : figure de l'énoncé (A, B, C, aucune coordonnée, fenêtre fixe qui ne
  trahit pas les points à placer) + quatre vraies questions (lire, placer P et Q, nommer les
  transformations, module/argument), P et Q placés dans le corrigé (`figureHtml`). Profil
  (`generateurs6e/lirePlacerPlanComplexe/profilEvaluation.ts`) : `forme` = variante (les opérations
  précises, donc la transformation à nommer, changent d'une série à l'autre), cas particulier
  « axe » (C sur un axe : module entier, argument immédiat ; 1 fois sur 4), pas de `calcul`.
  Ajouts partagés (additifs) : `planComplexeSvg` accepte `fenetreFixe` et `idBase` (identifiants
  SVG déterministes). Libellé de conception de 6gen35 renseigné.
- **6e (6h), Chapitre 5 — générateur 6gen94 « Valeurs exactes par deux écritures d'un même
  complexe »** (section `formetrigonometrique`, carte après 6gen37, processus 3) : z = z₁z₂ ou
  z₁/z₂, un facteur de la famille de π/4 (c(±1 ± i)) et un de la famille de π/6 ou π/3
  (d(±√3 ± i), d(±1 ± i√3)), (c ; d) ∈ {(1 ; 1), (2 ; 1), (1 ; 2)}, ordre tiré au hasard : l'argument
  de z est toujours ±π/12, ±5π/12, ±7π/12 ou ±11π/12 (en douzièmes de π : ±3/±9 et ±2/±4/±8/±10,
  somme ou différence impaire et jamais multiple de 3). Calcul EXACT de la forme algébrique dans
  les nombres (p + q√3)/d (`core6e/deuxEcrituresComplexe.ts`), module de z toujours k√2. Variantes
  `produit` / `quotient`, quatre écrans à champs libres : a) Re z et Im z exacts (développement ou
  conjugué) ; b) module et argument de chaque facteur ; c) module et argument de z (forme
  trigonométrique) ; d) identification → cos θ et sin θ exacts (toute écriture exacte acceptée,
  (√3 + 1)/(2√2) comme (√6 + √2)/4). Arguments acceptés à 2kπ près ; degrés, valeur arrondie
  (décimale à 1 % près sans racine ni π), « i » dans une partie, cos(…) recopié : refusés sans
  tentative. Pièges reconnus : parties échangées, division par |z₂|² oubliée, multiplication par
  z₂ au lieu du conjugué, i² = +1, module sans racine ou somme des parties, arctan sans correction
  de quadrant, cos/sin d'un facteur échangés, arguments additionnés/soustraits à tort ou dans le
  mauvais ordre, modules additionnés, cos et sin échangés, partie réelle recopiée sans diviser par
  r. L'écran à champs libres `components6e/EtapeLinearisationEuler.tsx` (6gen93) est réutilisé tel
  quel. Papier : l'exercice classique en trois vraies questions (a) forme algébrique, b) forme
  trigonométrique, c) cos θ et sin θ, θ nommé), `etapesParQuestion` [a] [b, c] [d]. Profil
  (`generateurs6e/deuxEcrituresComplexe/profilEvaluation.ts`) : `forme` = type (produit/quotient),
  aucun cas particulier (toutes les instances demandent les quatre étapes), pas de `calcul`.
  Mesures (20 000 tirages par variante) : 192 énoncés distincts par type, fréquence max/min d'un
  énoncé 134/78, probabilité que deux séries tombent sur le même énoncé ≈ 0,5 %, les huit angles
  visés à 12,5 % ± 0,3 chacun. Cours : sous-titre « Deux écritures d'un même nombre : des valeurs
  exactes », paragraphe, exemple « cos(π/12) et sin(π/12) par deux écritures » (z = (1 + i)/(√3 + i),
  énoncé ajouté à `ENONCES_DEMONSTRATION`) et piège « n'oublie pas le module », insérés après le
  tableau récapitulatif des opérations, avant l'application électrique. Libellés de conception
  « Forme trigonométrique, module et argument (6gen37) » (jusque-là vide) et « Valeurs exactes par
  deux écritures d'un même complexe (6gen94) ». Fichiers : `App6gen94.tsx`,
  `core6e/deuxEcrituresComplexe.ts`, `moteur6e/{types,session,verification}DeuxEcritures.ts`,
  `ui6e/{format,recapitulatif}DeuxEcritures.ts`, `generateurs6e/deuxEcrituresComplexe/` (index,
  profilEvaluation, exportEvaluation).
- **6e (6h), Chapitre 5 — Nombres complexes** (`nombres-complexes`), section `racinesniemes` :
  nouveau générateur **6gen97 « Polygones réguliers et racines n-ièmes »** (processus 3), carte après
  6gen39, précédée d'un bloc `methode` (le cours ne traitait ni la rotation de centre quelconque à
  cet endroit, ni le côté/l'aire du polygone inscrit) : zₖ = c + (a − c)·e^{2ikπ/n}, côté
  |z₁ − z₀| = 2r·sin(π/n) (par factorisation de e^{iπ/n}), aire (n/2)·r²·sin(2π/n), somme des
  sommets = n·c. Trois variantes, chaîne fixe de 4 écrans chacune : `sommets` (n = 3, 4, 6, 8 —
  relation des sommets en choix fermé, distracteurs « rotation autour de O », « translation
  oubliée », « e^{2ikπ} », « kπ/n », « sens horaire » ; a − c et l'angle ; Z₁ ; Z₂ (et Z₃) en
  parties réelle/imaginaire exactes), `mesures` (n = 3, 4, 6 : rayon |z₀|, côté, périmètre, aire,
  valeurs exactes), `somme-nulle` (n = 3 à 8 : (ω − 1)S = ωⁿ − 1 puis « ωⁿ = 1 et ω ≠ 1 » en choix
  fermés, puis somme des affixes = n·c et somme sans A). Valeurs exactes p + q√d gérées par
  `moteur6e/modelePolygonesReguliers.ts` (affichage) ; saisie des sommets en DEUX champs réels
  (évaluateur réel, qui accepte √ et fractions — même choix que 6gen39) ; valeur décimale approchée,
  angle en degrés, saisie illisible ou forme non réduite refusées sans tentative. Figures écran
  (`components6e/PlanPolygoneRegulier.tsx`, SVG maison, fenêtre fixe) : pour `sommets`, C, A et le
  cercle seulement — les sommets demandés apparaissent écran après écran, le polygone complet à la
  fin (pour n = 4 ils tomberaient sur le quadrillage) ; racines de l'unité sur le cercle unité pour
  la démonstration de S = 0. **Leçon** : pour `mesures`, les réponses ne dépendent que de n et de
  |z₀|² — avec `forme` = variante + n et un point tiré dans [−4 ; 4]², un plan réel a donné deux
  séries sur trois aux réponses identiques (énoncés pourtant différents) ; corrigé en tirant |z₀|²
  équiprobable parmi 32 valeurs ([−7 ; 7]²) et en sortant n de la forme. Profil
  (`generateurs6e/polygonesReguliers/profilEvaluation.ts`) : `forme` = `sommets-nN`, `mesures`,
  `somme-nulle` ; cas particulier « centre-origine » (`sommets`, C = O : pas de translation, 1 fois
  sur 6) ; pas de `calcul`. Papier : `sommets` → une question (affixes de Z₁, Z₂ (, Z₃)), polygone
  complet dans le corrigé (`figureHtml`) ; `mesures` → rayon, démonstration du côté puis valeur,
  périmètre et aire ; `somme-nulle` → « Démontre que S = 0 », puis les deux sommes. Libellé de
  conception de 6gen39 renseigné.
- **6e (6h), Chapitre 5 — générateur 6gen96 « Électricité : impédances complexes »** (section
  `problemesavances`, carte après 6gen42, processus 3) : notation **j** des électriciens (décision
  de l'utilisateur), annoncée dans chaque énoncé (« j joue le rôle de i, car i désigne
  l'intensité », j² = −1). Variantes = type de circuit : `serie2` (R avec une bobine OU un
  condensateur), `rlc` (série RLC) et `parallele` (R ∥ L ou R ∥ C). Réactances entières (multiples
  de 5, 10 à 150 Ω), ω ∈ {100, 200, 500, 1000} rad/s, L en mH entier, C en µF à au plus une
  décimale ; jamais X = R (45°) ; en parallèle, forme algébrique décimale à au plus deux chiffres ;
  I entre 0,25 et 20 A (`core6e/impedancesComplexes.ts`). Cinq écrans : a) impédance de chaque
  composant réactif, saisie complexe avec j (évaluateur complexe du chapitre, j lu comme i ;
  « 80j », « j·80 », « −j/(25e-6·1000) » acceptés) ; b) Re Z et Im Z exacts ; c) |Z| au dixième
  d'ohm et φ au dixième de degré ; d) I = U/|Z| au centième (tolérance d'une unité, 0,8 % pour I
  qui peut venir d'un |Z| arrondi) ; e) nature inductif / capacitif / résistif (choix fermé, une
  tentative). Refusés sans tentative : saisie illisible, j dans une partie, angle en radians,
  arrondi trop grossier, arrondi là où une valeur exacte est attendue. Pièges : j oublié, mH/µF
  non convertis, 1/j = +j (signe de Z_C), Cω au lieu de 1/(Cω), X_C ajoutée, impédances des
  branches additionnées, 1/Z non inversé, division par R² + X² oubliée, module = somme des parties
  ou sans racine, arctan(a/b), signe de φ, I = U/R, U·|Z|. La nature (verdict) est tirée AVANT la
  boucle de rejet, à parts égales (inductif/capacitif ; + résistif = résonance en RLC), jamais dans
  `forme`. Schéma du circuit (symboles IEC, `ui6e/schemaCircuitImpedances.ts`, `currentColor`,
  aucune donnée calculée) à l'écran et sur papier (`enteteHtml`). Papier : description + schéma +
  rappels (j, impédances utiles, règle série/parallèle, loi d'Ohm, signe de φ) puis quatre vraies
  questions (Z sous forme algébrique, |Z| et φ, I, nature justifiée), `etapesParQuestion`
  [a, b] [c] [d] [e]. Profil (`generateurs6e/impedancesComplexes/profilEvaluation.ts`) : `forme` =
  type de circuit, aucun cas particulier (pas même la résonance, qui est une issue du verdict),
  `calcul: 'calculatrice'` partout et `calculatriceIndispensable` sur les trois variantes (exclues
  en « calculatrice interdite »). Mesures (20 000 tirages par variante) : 6 283 / 13 051 / 1 312
  énoncés distincts (probabilité que deux séries tombent sur le même : 0,025 % / 0,012 % /
  0,097 %), natures 50/50, 33/33/33, 51/49. Cours : l'application « Décrire un courant électrique
  alternatif » (section `formetrigonometrique`) passe de Z = 3+4i à Z = 3+4j (le texte annonçait
  déjà la notation j) ; après la carte 6gen42, sous-titre « Application : les impédances complexes
  en électricité », paragraphe (j, impédance, série/parallèle), tableau composant → impédance →
  effet, paragraphe (|Z|, loi d'Ohm, déphasage, nature, résonance), piège (1/j = −j, inverses en
  parallèle), exemple « circuit RLC série » (énoncé ajouté à `ENONCES_DEMONSTRATION`), carte.
  Libellés de conception « Nombres complexes — problèmes avancés (6gen42) » (jusque-là vide) et
  « Électricité : impédances complexes (6gen96) ». Fichiers : `App6gen96.tsx`,
  `components6e/EtapeImpedances.tsx`, `core6e/impedancesComplexes.ts`,
  `moteur6e/{types,session,verification}Impedances.ts`,
  `ui6e/{format,recapitulatif}Impedances.ts`, `ui6e/schemaCircuitImpedances.ts`,
  `generateurs6e/impedancesComplexes/` (index, profilEvaluation, exportEvaluation).
- **6e (6h), Chapitre 5 — Nombres complexes** (`nombres-complexes`), section `problemesavances` :
  nouveau générateur **6gen98 « Régions du plan complexe »** (processus 2), carte après 6gen42 (6gen96
  s'insère avant à la fusion), précédée d'un sous-titre « Régions du plan complexe », d'un paragraphe
  (frontière = l'inégalité devenue égalité), d'un `featureTable` Condition / Région / Frontière, d'une
  `methode` (frontière, bord large/strict, point test, « et » = partie commune) et de l'exemple
  « région |z−1−i| ≤ 2 et Im z > 1 » (énoncé ajouté à `ENONCES_DEMONSTRATION`) illustré : le
  `complexPlane` a reçu un champ additif `region` (polygone rempli `svg-plan-fill`, sans contour).
  Variantes `disque` (|z − a| ≤, <, ≥, > r), `demi-plan` (Re(z − w) ou Im(z − w) comparé à m : seule
  la partie utile de w compte), `mediatrice` (|z − a| ≷ |z − b|, médiatrice oblique), `secteur`
  (θ₁ ≤ arg(z − a) ≤ θ₂, angles multiples de π/4, petit ou grand secteur) et `intersection`
  (disque/extérieur + demi-plan Re ou Im qui coupe le cercle, ou Re + Im). Chaîne fixe de 4 écrans,
  une intersection posant chaque question pour ses deux conditions : a) nature de la frontière
  (choix fermé : cercle, droite verticale, droite horizontale, médiatrice, deux demi-droites),
  b) éléments (centre et rayon, équation x = k ou y = k, a et b, sommet et angle entre les
  demi-droites ; 3 tentatives, pièges reconnus : signe du centre, une seule partie changée, rayon au
  carré, m − Re(w), w oublié, mauvaise partie de w, A et B échangés, autre secteur, somme des
  angles), c) bord inclus ou non (choix fermé ; la frontière est montrée en violet, sans style),
  d) la région parmi quatre figures (une condition : {bonne frontière, frontière issue d'une erreur
  classique — centre opposé ou rayon faux si centré en O, x = m − Re(w) ou Re/Im échangés, droite (AB)
  au lieu de la médiatrice, angles mesurés à l'envers} × {bon côté, côté opposé} ; deux conditions :
  les quatre combinaisons de côtés). Le côté, le bord inclus et Re/Im sont tirés 1 fois sur 2 avant
  la boucle de rejet. Figures : `planComplexeSvg` (6gen40–42) étendu additivement (`regions` =
  intersection de disques/demi-plans/secteurs par clipPaths imbriqués, `pointilles` des
  demi-droites), fenêtre fixe [−5 ; 5]², frontières sur le quadrillage. Papier : l'ensemble E et une
  consigne (nature et éléments de la frontière, bord, représenter E) ; la région coloriée va dans le
  corrigé (`figureHtml`, étape d), avec le point test. Profil
  (`generateurs6e/regionsPlanComplexe/profilEvaluation.ts`) : `forme` = variante
  (`intersection-cercle-demiplan` / `intersection-quadrant`), cas particulier « origine »
  (condition centrée en O, 1 fois sur 6), pas de `calcul`. Mesures (20 000 tirages par variante) :
  verdicts à 50 % ± 0,5, cas particulier 16 à 17 %, énoncés distincts par forme complète de 320
  (disque) à 8 406 (médiatrice), le plus petit groupe (disque centré en O) en a 16 — rayon porté
  jusqu'à 4 dans ce cas pour l'élargir. Libellés de conception « Nombres complexes — problèmes
  avancés (6gen42) » (jusque-là vide) et « Régions du plan complexe (6gen98) ».

- **6e (6h), Chapitre 5 — Nombres complexes**, section `operationsbase` (demande de l'utilisateur) :
  après le piège « i² = 1 est FAUX », un `exempleLibre` « Où est l'erreur ? — une « démonstration »
  de 1 = −1 » (6 lignes 1 = √1 = √((−1)(−1)) = √(−1)·√(−1) = i·i = i² = −1 ; erreur au passage ② → ③ :
  √(ab) = √a·√b réservé à a, b ≥ 0 ; −1 a deux racines carrées i et −i, ℂ non ordonné) puis un
  `piege` « Jamais de √ sur un nombre négatif » (i défini par i² = −1, x² = −4 ⇒ x = ±2i). Énoncé
  papier apparié dans `ENONCES_DEMONSTRATION` (clé = label, build strict). La même copie est
  demandée comme thème du détective 6gen99.
- **6e (6h), Chapitre 5 — générateur 6gen99 « Détective d'erreurs : nombres complexes »** (section
  `problemesavances`, carte après 6gen96 — 6gen98 viendra s'intercaler avant elle à la fusion —,
  processus 3). Même mécanique que 5gen49 / 6gen88 (`CopieEleve`, `EtapeLigneFausse`,
  `EtapeDescriptionErreur`, `BlocAides` du dossier 4e) : copie de 4 à 6 lignes à UNE ligne fausse,
  la suite cohérente avec l'erreur ; a) ligne fausse (une tentative), b) erreur commise (4
  descriptions, une tentative), c) valeurs corrigées (champs libres, 3 tentatives ; boutons « √ » et
  « π » qui AJOUTENT le symbole au champ, sans filtre de frappe). Variante = exercice support,
  jamais le type d'erreur ; dans chaque variante, le type d'erreur (donc la ligne fausse) est tiré
  équiprobable AVANT les nombres, dans le même ensemble de données quel que soit le type :
  `formeTrigo` (z = k(−1 ± i√3) ou k(−√3 ± i), toujours a < 0 et |a| ≠ |b| : racine oubliée dans
  |z|, arctan(a/b), quadrant non corrigé) ; `quotient` (quotient entier de Gauss : numérateur
  multiplié par c + di au lieu du conjugué, (c + di)(c − di) = c² − d², i² = 1 dans le numérateur) ;
  `puissance` (z³ via z² : double produit oublié, (bi)² = b², produits croisés oubliés) ; `moivre`
  (arguments multiples de π/6, jamais ±π/4 / ±3π/4 où cos et sin se confondent ; rⁿ oublié,
  réduction de π au lieu de 2π, cos et sin échangés) ; `racines` (w toujours a < 0 : quadrant,
  |w|/n au lieu de ⁿ√|w|, pas de 2π au lieu de 2π/n) ; `moduleSomme` (|a| > |b|, z et w ni
  orthogonaux ni colinéaires : i dans le carré, √(c² + d²) = |c| + |d|, |z + w| = |z| + |w|) ;
  `racineProduit`, ajouté à la demande de l'utilisateur : la « démonstration » de n = −n
  (n = √(n²) ; √((−n)(−n)) ; √(−n)·√(−n) ; …), n de 1 à 20 (n = 1, ligne 3 : sa copie
  « 1 = −1 » mot pour mot), une seule erreur (√(ab) = √a·√b appliquée à deux négatifs) dont la
  POSITION (ligne 2, 3 ou 4) est tirée équiprobable ; c) demande la vraie valeur de √(−n)·√(−n).
  L'aide de b) renvoie au piège √(−1) de la section 1 (encadré ajouté par le coordinateur). Toutes
  les valeurs exactes (√, fractions, kπ/q) ; réels lus par `expressionExponentielle.ts`, arguments
  comparés à 2kπ près (ensemble, ordre libre, pour les racines n-ièmes), complexes par les contrôles
  communs (`saisieComplexe.ts`) ; refus sans tentative : illisible, forme non réduite, valeur
  décimale approchée, angle en degrés ; message ciblé quand la saisie reprend les valeurs de la
  copie. Profil (`generateurs6e/detectiveComplexes/profil.ts`) : `forme` = variante seule, aucun
  cas particulier, pas de `calcul`. Mesures (20 000 tirages par variante) : types et lignes à
  33 % ± 1 dans chaque variante ; données distinctes 48 (formeTrigo, puissance, moivre), 36
  (racines), 20 (racineProduit), ≈ 2 800 (quotient), ≈ 6 200 (moduleSomme) ; probabilité que deux
  séries aient les mêmes données 2,1 % / 2,1 % / 2,1 % / 2,8 % / 5,0 % / 0,04 % / 0,03 % (l'erreur,
  donc la copie, diffère alors le plus souvent ; l'anti-doublon écarte les copies identiques).
  Papier : énoncé + copie numérotée + consigne globale ; les trois écrans sont les étapes a, b, c du
  corrigé (Contrôle, Erreur, lignes corrigées, Conclusion, Piège). Cours : sous-titre « Repérer les
  erreurs classiques » + encadré `attention` (module d'une somme ≠ somme des modules, inégalité
  triangulaire, √(a² + b²) ≠ |a| + |b|) avant la carte. Fichiers : `App6gen99.tsx`,
  `components6e/EtapeCorrectionDetectiveComplexes.tsx`, `core6e/detectiveComplexes.types.ts`,
  `moteur6e/{modele,session,verification}DetectiveComplexes.ts`, `ui6e/formatDetectiveComplexes.ts`,
  `generateurs6e/detectiveComplexes/` (index, profil, exportEvaluation).
- **4e, Chapitre 8 — générateur gen100 « Positions de deux droites et plan déterminé »** (section
  `deux-droites`, carte en fin de section, processus 2 ; fiche validée : « Déterminer un plan » est
  fusionné ici). Deux variantes sur un solide en perspective cavalière (cube, parallélépipède
  rectangle, prisme droit, pyramide SABCD, tétraèdre), sans coordonnées. `positions` (3 écrans,
  choix fermés, UNE tentative) : a) plan commun aux deux droites parmi 3 plans nommés par 3 points
  + « aucun plan » ; b) sécantes / parallèles / gauches ; c) justification propre au verdict — où
  se coupent-elles (point nommé, point du solide non nommé, hors du solide), quelle droite du solide
  est parallèle aux deux, ou en quel point la seconde droite perce un plan (Q) qui contient la
  première (technique du cours). `plan` (2 écrans) : trois points / une droite et un point / deux
  droites ; a) déterminent-elles un plan, et un seul ? b) oui → nommer le plan (saisie libre « (ABG) »,
  3 tentatives, tout triplet de points nommés non alignés du plan, ordre et casse libres ; lettre
  inconnue, nombre de lettres ≠ 3 ou lettres répétées = illisible, sans tentative) ; non → la raison
  (alignés : une infinité de plans / aucun plan / « il faut 4 points » ; idem pour le point sur la
  droite ; gauches : aucun plan / une infinité / « seulement si sécantes »). Moteur : énumération
  unique par gabarit puis seaux (verdict × catégorie × nombre de milieux), `generateurs/deuxDroitesPlan/`.
  Ordre du tirage : verdict d'abord (1/3 chacun ; oui/non 1/2), puis nombre de milieux (0 ou 2,
  jamais 1 : une droite « sommet + milieu » n'est parallèle à rien, un seul milieu excluait
  « parallèles »), catégorie (point commun nommé / sur le solide / hors : 1/3 chacun quand des
  milieux existent ; gauches croisées SUR LE DESSIN 70 %, jamais sur un point nommé), gabarit.
  Triplets « plan » : 1 ou 3 points non sommets (les seuls possibles pour trois points alignés :
  A, I, B ; A, K, C avec K centre de face ; I, K, J sur une médiane de face), même tirage pour les
  non-alignés. Anti-devinette mesurée : plans de l'écran a nommés à 2 lettres communes avec les
  droites autant que possible ; dans un cas gauche, 85 % du temps un distracteur « une droite + un
  point de l'autre » nommé par ces 3 points (comme le bon plan d'un cas coplanaire sans autre point
  nommé) — meilleure stratégie « lettres seules » : 48 % (25 % au hasard, 33 % « toujours aucun ») ;
  le point de percée n'est jamais dans le nom de (Q). `Solide3DSketch` étendu de façon additive :
  prop `droitesSupplementaires` (seconde couleur, `.solide3d-droite-seconde`, variable
  `--solide3d-droite-2` du thème) — gen39/40/41 inchangés. Papier (`ui/figureDeuxDroitesPlan.ts`) :
  énoncé = consigne + figure (données seules) + une question globale ; corrigé : étapes a, b, c,
  figure complétée (section du plan commun / déterminé ou du plan (Q), point commun — cadrage élargi
  s'il est hors du solide). Profil : `forme` = variante + type de données (`positions`,
  `plan-troisPoints|droitePoint|deuxDroites`), aucun cas particulier, pas de `calcul`. Mesures
  (20 000 tirages) : verdicts 32,9 / 33,9 / 33,2 % ; oui/non 16,4–16,9 % par type ; énoncés distincts
  9 735 (positions), 3 194 à 4 763 par type « plan » ; P(deux séries identiques) ≤ 0,08 %. Cours :
  encadrés `methode` (« deux droites sur un solide dessiné ») et `rappel` (« Ces données
  déterminent-elles un plan ? ») avant la carte. Fichiers : `AppPositionsDeuxDroites.tsx`,
  `core/deuxDroitesPlan.types.ts`, `moteur/sessionDeuxDroitesPlan.ts`, `ui/formatDeuxDroitesPlan.ts`,
  `ui/figureDeuxDroitesPlan.ts`, `components/EtapeNomPlan.tsx`, `generateurs/deuxDroitesPlan/`
  (index, profil, exportEvaluation).

- **4e, Chapitre 8 — gen101 « Positions de deux plans et de trois plans »** (section `trois-plans`,
  couvre aussi `deux-plans`, processus 2). Deux variantes, sur parallélépipède, cube, prisme droit
  ou tétraèdre (`GABARITS_TOUS`), plans nommés par 3 points (sommets ou milieux d'arêtes nommés I,
  J, K) et dessinés par le TRIANGLE de ces points — jamais par leur section complète, qui
  trahirait deux plans confondus ; la section complète, la droite d'intersection et les points
  construits n'apparaissent qu'une fois l'exercice clos et dans le corrigé. **Deux plans** :
  parallèles / confondus / sécants (UNE tentative, tirés à parts égales AVANT le rejet) ; sécants →
  choisir deux points communs parmi les points nommés et des points de rencontre « (FK) ∩ (BC) »
  (corrects : une droite de chaque plan dans une même face ; leurres : droites GAUCHES qui ne se
  croisent que sur le dessin, ou droite qui n'est pas dans l'autre plan) ; parallèles / confondus →
  justification à choisir (une seule valable ; leurres vrais mais insuffisants : deux droites
  parallèles entre elles, deux points communs, triangles « sans point commun », impression du
  dessin). Lettres communes aux deux noms : 0 dans 70 % des cas sécants/confondus (toujours 0 pour
  parallèles) ; triangles disjoints sur le dessin ≈ 42 % pour CHAQUE position (piège « ne se
  touchent pas, mais sécants ») ; ≈ 45 % des cas sécants demandent au moins un point construit,
  dont la moitié hors du solide ; droite d'intersection entièrement hors du solide ≈ 5 %. **Trois
  plans** : un point / une droite / aucun point (Toblerone ou deux plans parallèles, 50/50) ;
  justification à choisir parmi 4 affirmations « (P) et (Q) se coupent suivant (XY), et (XY) perce /
  est incluse dans / est parallèle à (R) » ou « (P) et (Q) sont parallèles », vérité calculée
  géométriquement, leurres de même conclusion (droite qui n'est pas dans les deux plans). Profil :
  `forme` = variante seule (le verdict n'y entre jamais), aucun cas particulier, pas de `calcul`.
  Figures : `ui/figurePositionsPlans.ts` (même perspective et même visibilité que
  `Solide3DSketch`, fonctions pures de `ui/solide3DSketch.ts` réutilisées sans modification, cadre
  élargi au besoin pour un point construit). Cours : `methode` + `piege` + `exemple` « deux noms
  pour un même plan » en fin de section `deux-plans` ; `methode` + `exemple` « trois plans du cube
  sans point commun » + carte en fin de section `trois-plans` (énoncés dans
  `ENONCES_DEMONSTRATION`). Fichiers : `AppPositionsPlans.tsx`, `components/EtapesPositionsPlans.tsx`,
  `core/positionsPlans.types.ts`, `moteur/sessionPositionsPlans.ts`, `ui/formatPositionsPlans.ts`,
  `ui/figurePositionsPlans.ts`, `generateurs/positionsPlans/` (geometriePlans, index, profil,
  exportEvaluation).

- **4e, Chapitre 8 — gen103 « Démontrer un parallélisme »** (section `parallelisme`, carte en fin de
  section, processus 3). Deux variantes sur cube, parallélépipède, prisme droit, tétraèdre ou
  pyramide SABCD, sans coordonnées ; énoncé « Démontre que … » (QUOI démontrer, jamais la méthode) ;
  tous les écrans sont des choix fermés (UNE tentative). **Droite parallèle à un plan** (3 écrans) :
  a) critère (« trouver une droite du plan parallèle à (T) » ; leurres : parallèle passant par un
  point du plan, triangle « non rencontré » sur le dessin, deux droites sécantes du plan, deux points
  de (T) dans le plan) ; b) droite témoin parmi 4–5 droites nommées (une seule témoin ; leurres
  « parallèle mais HORS du plan » — toujours présent sauf dans le tétraèdre, qui n'en a pas — et
  « dans le plan mais gauche ») ; c) justification. **Deux plans parallèles** (4 écrans) : a) critère
  (leurres : une seule droite, deux droites parallèles, triangles disjoints, droite parallèle au
  plan) ; b) deux parallélismes « droite de (P) ∥ droite de (Q) » parmi 5 (leurres : droite hors de
  (P) ou hors de (Q) pourtant parallèle, faux parallélisme — une fois sur deux avec une droite témoin
  attendue —, et parfois un 3e parallélisme valable dont la droite de (P) est parallèle à une des
  deux autres : piège des deux témoins parallèles) ; c) et d) justification de chacun. Catalogue des
  raisons (`generateurs/demontrerParallelisme/geometrieParallelisme.ts`, énumération déterministe) :
  côtés opposés d'un parallélogramme de 4 sommets (face, plan diagonal : « BDHF est un rectangle »),
  droite des milieux d'un triangle, droite des milieux de deux côtés opposés d'un parallélogramme.
  Options de justification toutes conclues « donc (L) ∥ (M) » : la raison, un leurre aux mêmes mots
  mais insuffisant (côtés opposés d'un quadrilatère quelconque, même longueur, « un point de »), un
  leurre « bonne propriété, mauvaise figure » (vrai rectangle qui ne contient qu'une des droites,
  un seul milieu, ou milieu attribué au mauvais côté) et un leurre générique vrai (deux faces
  parallèles, face parallèle aux deux droites, aucun point commun, impression du dessin). Type de
  raison tiré à parts égales AVANT le rejet (droite-plan). Noms en ordre alphabétique partout
  (droites, segments, triangles) : l'ordre des lettres ne distingue jamais la bonne option ; milieux
  nommés I, J, K dans un ordre tiré au hasard, chacun sert au nom d'un plan ou de (T). Mesures
  (5 000 tirages par variante) : énoncés distincts 3 343 (droite-plan) et 1 719 (deux-plans),
  P(deux séries identiques) 0,1 % et 0,4 % ; types de raison 33/34/33 % ; meilleure stratégie
  « lettres seules » pour la droite témoin 30 % (hasard 22 %), pour la paire 22 % (hasard 11 %) ;
  stratégie « mots-clés » sur les justifications 55 % (une option valable sur deux candidates).
  Profil : `forme` = variante seule, aucun cas particulier, pas de `calcul`. Réutilise gen101 par
  extensions additives seulement : `figurePositionsPlansSvg`, `positionNommee`, `pointsPlan` et
  quelques textes acceptent un type élargi `DonneesFigurePlans` (solide, milieux, plans) ;
  `choisirPlan`, `droitesNommees`, `BlocAidesTexte`, `Explication` exportés ;
  description de la pyramide ajoutée à `DESCRIPTIONS_SOLIDES` — rendu de gen101 inchangé. Triangles de
  nommage propres à gen103 (`trianglesNommage`) : mêmes seuils de lisibilité mais jusqu'à 3 milieux,
  sinon le plan des milieux (tétraèdre, pyramide, plan médian) était exclu. Cours : `methode`
  « Justifier que deux droites de l'espace sont parallèles », `exemple` « une droite parallèle à un
  plan » (tétraèdre, droite des milieux ; énoncé dans `ENONCES_DEMONSTRATION`) et `attention` « La
  droite témoin doit être DANS le plan » avant la carte. Fichiers : `AppDemontrerParallelisme.tsx`,
  `components/EtapesDemontrerParallelisme.tsx`, `core/demontrerParallelisme.types.ts`,
  `moteur/sessionDemontrerParallelisme.ts`, `ui/formatDemontrerParallelisme.ts`,
  `generateurs/demontrerParallelisme/` (geometrieParallelisme, index, profil, exportEvaluation).
- **4e, Chapitre 8 — gen102 « Point de percée par plan auxiliaire »** (section `percee`, processus
  2). La méthode du cours, un écran par étape, sur parallélépipède, cube ou prisme droit (et
  tétraèdre pour un plan par trois points) : d = (XY) passe par des sommets, milieux d'arêtes,
  points aux tiers d'arêtes ou centres de faces (nommés I, J, K, L) — jamais par deux sommets ;
  variantes = nature du plan α (face, plan diagonal, plan par trois points), dessiné par le
  triangle de ses trois points. **Écran 1** : plan auxiliaire π parmi 4 (UNE tentative ; tout plan
  qui contient d est accepté — 1 ou 2 bons plans dans la liste ; leurres : plans qui ne contiennent
  qu'un point de d ; le triangle du plan touché s'affiche en vert). Noms jamais porteurs des deux
  lettres de d, lettre de d présente une fois sur deux quelle que soit la validité, jamais deux
  lettres du nom de α. **Écran 2** : deux points communs à π et α, en touchant un point nommé sur
  la figure ou en choisissant un point de rencontre « (AE) ∩ (BD) » (droites dessinées en bleu ;
  leurres : droites gauches, droite hors d'un des plans), comme gen101 (types et règles réutilisés).
  **Écran 3** : le point de percée parmi 3–4 points numérotés sur d (toucher sur la figure) : là
  où d croise sur le dessin une arête ou un côté de triangle (droites gauches, ou droite hors de α)
  et le bon point d ∩ b — toujours un point NOUVEAU, jamais un point nommé ; b est dessinée par le
  segment rouge entre ses deux points, à prolonger. Si le bon plan choisi n'a pas de droite
  commune constructible avec les points de la figure, la suite se fait avec le plan de référence
  (dit dans l'explication). Cadre de figure FIXE pour tout l'exercice et sur papier (point de
  percée et points construits, justes ou leurres, inclus : place pour les prolongements), étiquettes
  contrôlées sans chevauchement. Profil : `forme` = variante ; cas particulier « directe » (d dans
  une face qui coupe α suivant une droite par deux points nommés : rien à construire) ≈ 46–50 % ;
  pas de `calcul`. Mesures (5 000 tirages par variante) : devinette par les lettres écran 1 ≈ 32 %
  pour un hasard ≈ 29 %, écran 2 ≈ 5–7 % pour un hasard ≈ 1,7 % ; P hors du solide 86 % (face :
  géométrie), ≈ 35 % (diagonal, trois points) ; ≥ 1 point à construire dans la paire de référence
  31 % (diagonal), 37 % (trois points), 0 % (face) ; P(deux tirages identiques) ≤ 0,11 % par
  variante × cas. Cours : `astuce` « Choisir le plan auxiliaire » après l'exemple du point de percée
  hors du solide, carte en fin de section. Fichiers : `AppPointPercee.tsx`,
  `components/EtapesPercee.tsx`, `core/perceePlanAuxiliaire.types.ts`, `ui/formatPercee.ts`,
  `ui/figurePercee.ts`, `generateurs/perceePlanAuxiliaire/` (geometriePercee, index, profil,
  exportEvaluation).
- **4e, Chapitre 8 — gen105 « Perspective centrale : point de fuite »** (section `point-de-fuite`,
  s'appuie sur `fenetre-durer`, processus 2). Vraie construction, gardée en entier (décision de
  l'utilisateur), sur la vitre quadrillée de Dürer (12 × 9 carreaux, aucune coordonnée écrite) :
  ligne d'horizon y = h, points DONNÉS tous sur des nœuds, points à construire là où la construction
  les met. Variantes (= `forme`) : `boite` (point de fuite d'un pavé à partir de deux arêtes
  fuyantes, puis un sommet de la face arrière — fuyante + horizontale ou verticale par un sommet
  voisin ; visibilité des arêtes par faces visibles), `carrelage` (point de fuite V des diagonales
  du 1er rang, puis coin R du 2e rang par la diagonale prolongée), `poteaux` (sommet du 2e poteau
  sur la fuyante des sommets, puis pied du 3e par le milieu M du 2e — le milieu d'une verticale
  reste au milieu), `panneaux` (coins J et L d'un second panneau de face, plus loin, sur les mêmes
  fuyantes). **Écrans 1–2** : outils « Droite » (par deux points nommés, prolongée sur toute la
  figure), « Horizontale », « Verticale » (par un point nommé — les droites parallèles à la vitre
  restent parallèles), puis « Placer X » : un toucher place le point, UNE poignée HTML `<div>` de
  44 px le fait glisser (Chromium ignore `touch-action` sur le SVG), aimant aux intersections des
  droites dessinées (objets, horizon, tracés) puis aux nœuds tout proches ; tolérance 0,3 carreau,
  3 tentatives, diagnostics (pas sur l'horizon / sur une seule des deux droites qui portent le
  point) ; après clôture, les deux droites qui portent le point en vert et, si révélé, le point de
  l'élève en rouge. **Écran 3** : l'affirmation vraie parmi trois (UNE tentative ; une vraie, deux
  fausses tirées dans une banque par variante : fuyantes qui convergent, verticales et horizontales
  de face qui restent parallèles, longueurs non conservées, lien avec la cavalière ; aucune
  affirmation qui se déduit du seul énoncé). Étiquettes placées une fois sur la scène complète
  (rien ne bouge d'un écran à l'autre), « ligne d'horizon » glissée le long de la ligne loin des
  objets. Papier : figure de départ + a) construction, b) affirmations (vraies questions) ;
  construction complète dans le corrigé (`figureHtml`). Profil : `forme` = variante, aucun cas
  particulier, pas de `calcul`. Mesures (5 000 tirages par variante) : figures distinctes boîte ≈ 740,
  carrelage ≈ 580, poteaux ≈ 230, panneaux ≈ 130 (× 4 × 6 × 6 jeux d'affirmations). Cours : `methode`
  « Compléter un carrelage, une rangée de poteaux, placer un objet » + illustration du carrelage
  (diagonale prolongée jusqu'à V) avant la carte, en fin de section. Fichiers : `AppPointDeFuite.tsx`,
  `components/ConstructionPointFuite.tsx`, `core/pointFuite.types.ts`, `ui/formatPointFuite.ts`,
  `ui/figurePointFuite.ts`, `generateurs/pointFuite/` (geometrieFuite, index, profil,
  exportEvaluation).
- **4e, Chapitre 8 — gen104 « Dessiner en perspective cavalière »** (section `cavaliere`, processus
  2). Vraie construction sur un quadrillage de 1 cm : le dessin d'un pavé droit (cube une fois sur
  cinq), d'un prisme droit couché (face avant triangulaire ABC) ou d'une pyramide droite à base
  rectangulaire est commencé — face avant en vraie grandeur, arête [AB] seule pour la pyramide —,
  dimensions réelles entières données. **Écran 1** : placer un premier sommet arrière au bout de sa
  fuyante. **Écran 2** : les autres sommets arrière (fuyantes parallèles, même longueur) ; pour la
  pyramide, le 4e sommet de la base est complété et l'élève place S (diagonales de la base et
  centre O tracés). **Écran 3** : classer les arêtes (un toucher sur la figure ou un bouton par
  arête bascule trait plein / pointillés), validation globale, UNE tentative ; écrans 1–2 : 3
  tentatives. **Convention non trichée** : 45° et ×0,5 → décalage p·√2/4, jamais un nœud du
  quadrillage ; placement LIBRE (une seule poignée HTML à la fois, toucher pour poser puis
  glissement relatif, flèches au clavier), tolérance 0,25 cm et aimant vers la position exacte ;
  sous la figure, la mesure du segment comme à la règle et à l'équerre (« [BC] : 2 cm, à 45° de
  l'horizontale, vers la droite et vers le haut »). Pièges reconnus avec message ciblé : fuyante
  non réduite, « un carreau en diagonale par centimètre », fuyante horizontale ou verticale,
  mauvais sens de fuite, longueur ou angle, point à la place d'un autre sommet ; pour S : pied au
  milieu de [AB], hauteur réduite, hauteur non verticale ; écran 3 : arêtes cachées laissées en
  trait plein / arêtes vues en pointillés. Visibilité par la direction de projection exacte
  (√2/4 ; −1 ; √2/4), identique au moteur commun `ui/solide3DSketch.ts` (vérifié sur 15 000
  tirages) grâce à des marges : pour le prisme et la pyramide, face de gauche vue (une arête
  cachée) ou non (trois arêtes autour de D) tirée moitié-moitié AVANT la boucle de rejet ; sommets
  à ≥ 1 cm les uns des autres. Profil : `forme` = variante, aucun cas particulier, pas de `calcul`.
  Papier : énoncé = texte + quadrillage imprimé à l'ÉCHELLE RÉELLE (`width` en cm) avec la partie
  donnée ; corrigé : dessin complet (fuyantes en orange, cachées en pointillés, mesure 45° et
  longueur de la fuyante issue de B, diagonales et hauteur pour la pyramide). Étiquettes placées
  automatiquement loin des traits et des textes. Cours : `methode` « Dessiner un solide en
  perspective cavalière » après l'atelier, carte en fin de section. Fichiers :
  `AppPerspectiveCavaliere.tsx`, `components/FigurePerspectiveCavaliere.tsx`,
  `components/EtapesPerspectiveCavaliere.tsx`, `core/perspectiveCavaliere.types.ts`,
  `moteur/sessionPerspectiveCavaliere.ts`, `moteur/verificationPerspectiveCavaliere.ts`,
  `ui/figureCavaliere.ts`, `ui/formatCavaliere.ts`, `generateurs/perspectiveCavaliere/` (index,
  profil, exportEvaluation).

- **4e, Chapitre 8 — gen107 « Détective d'erreurs : géométrie dans l'espace »** (section
  `revision`, carte juste après le paragraphe d'introduction, processus 3). Même mécanique que gen91
  / 6gen99 (`CopieEleve`, `EtapeLigneFausse`, `EtapeDescriptionErreur`, `BlocAides` réutilisés) :
  la copie d'un élève fictif, avec figure, contient UNE ligne fausse ; trois écrans, tous des choix
  fermés à UNE tentative — a) la ligne fausse, b) l'erreur (4 descriptions), c) la correction (4
  lignes corrigées, droites ou justifications ; pour la cavalière, 4 DESSINS). Variante = thème
  (= `forme`) : **droites** (position de trois paires de droites, chacune des trois positions écrite
  une fois ; erreurs : croisement des traits pris pour un point commun, « parallèles » faute de
  croisement sur le dessin, « gauches » faute de face commune ; paires de l'énumération de gen100,
  boutons « Ligne n » qui tracent les droites citées), **plan** (trois jeux de données — trois
  points, droite + point, deux droites — qui « déterminent un seul plan » ; erreurs : points
  alignés, point sur la droite, droites gauches ; triplets de gen100), **section** (exemple du cours
  « 4 faces traversées » sur cube/pavé : trois remarques — côté direct, faces parallèles, point
  auxiliaire ; erreurs : segment sur une face qui ne contient qu'un des deux points, parallèle au
  mauvais côté, arête hors de la face citée), **parallélisme** (démonstration « deux plans
  parallèles » en 4 lignes, faits et leurres de gen103 ; erreurs : deux témoins parallèles, témoin
  hors du plan, raison écrite sur le gabarit de la vraie mais fausse pour la figure),
  **cavalière** (description et dessin d'un pavé sur quadrillage de 1 cm ; erreurs : angle 30°/60°,
  profondeur non réduite, mauvais sommet caché). Type d'erreur et ligne fausse tirés AVANT toute
  boucle de rejet, à parts égales, jamais dans `forme` ; pour droites/plan/section la ligne est
  tirée indépendamment du type. **Mesures « devinette sans figure »** (3 000 tirages par thème) : la
  longueur de la bonne proposition la trahissait (b : jusqu'à 100 %) → variantes de tournure
  choisies pour que le RANG de longueur de la bonne proposition soit tiré au hasard
  (`commun.ts::equilibrer`) : b ≈ 28–31 %, c ≤ 43 % (4 propositions) ; ligne fausse par
  caractéristiques du texte ≈ 33–35 % (droites, section, cavalière), ≈ 39 % (plan, nombre de
  points définis), ≈ 56 % (parallélisme : deux droites parallèles de (P) ne se justifient qu'avec
  des parallélogrammes, ce qui rend les lignes 2–3 plus courtes — structurel, non corrigé). Extensions
  ADDITIVES seulement : exports de fonctions et types internes de gen100 (`seauxPaires`,
  `seauxTriplets`, `candidatsDe`, `ligneLisible`, `pixel`…) et de gen103 (`justificationsPour`,
  `raisonDepuisFait`, `Contexte`) ; figures `figurePositionsPlansSvg` (gen101/103) et
  `figureCavaliereSvg` (gen104) réutilisées sans changement de rendu. Papier : énoncé = texte +
  figure + copie + consigne globale ; corrigé : contrôle de chaque ligne, erreur, ligne corrigée,
  figure (droites, plan témoin, section complète ou dessin juste). Fichiers :
  `AppDetectiveEspace.tsx`, `components/EtapesDetectiveEspace.tsx`, `core/detectiveEspace.types.ts`,
  `moteur/sessionDetectiveEspace.ts`, `ui/formatDetectiveEspace.ts`, `generateurs/detectiveEspace/`
  (commun, droites, plan, section, parallelisme, cavaliere, index, profil, exportEvaluation).
- **4e, Chapitre 8 — gen106 « Ombre à la lampe : projection centrale »** (section `ombre`, carte
  juste après celle de gen41, processus 2). Prolongement de gen41 avec une source PONCTUELLE : une
  lampe L au sommet d'un lampadaire de pied L₀ ; méthode = rayon issu de L par le sommet + trace au
  sol par L₀ et le pied de l'objet. Quatre variantes, deux écrans de choix chacune (composant de
  gen41 `ChoixCandidatsOmbre`, candidats mélangés à chaque écran, UNE tentative, bonne réponse en
  vert après un échec et explication de l'erreur commise), puis la construction complète :
  `poteau` (demi-droite de l'ombre issue du pied de A parmi 4 — leurres : parallèle à l'ombre de E
  « comme au soleil », vers la lampe, prolongement du trait depuis la lampe dessinée, depuis le pied
  de E, vers E, verticale du dessin —, puis A′), `cube` (ombres de deux sommets du haut d'un cube ou
  d'un pavé dont l'ombre est un coin VISIBLE du contour ; leurres : trace par le pied d'un autre
  sommet, rayon parallèle au premier, trace trop courte/longue, point sur le rayon hors trace, côté
  lampe), `mur` (point M où la trace atteint le pied d'un mur frontal, puis A′ sur la verticale du
  mur ; leurres : droit derrière le poteau, trace par le sommet, rayon jusqu'au pied du mur, trace
  trop inclinée ; puis trop bas/haut, hauteur du poteau, derrière le poteau, sur le rayon hors
  verticale), `lampe` (L₀ comme intersection des prolongements des deux ombres, puis L ; leurres :
  image de la lampe, une seule trace, rayon pris pour une trace, ombres échangées ; verticale trop
  basse/haute, un seul rayon). **Devinette sans la figure** : le rang de la bonne réponse est tiré
  AVANT la boucle de rejet, selon DEUX critères à la fois (distance au pied concerné ou abscisse /
  hauteur, et distance au centre des 4 candidats — sans ce second critère la bonne réponse, à
  l'intersection de deux droites portant chacune des leurres, était « celle du milieu » dans 70 à
  95 % des cas) ; les deux rangs étant liés par la géométrie, chaque écran tire un couple parmi deux
  « permutations » de couples réalisables mesurés (`COUPLES_PAR_ECRAN`), ce qui rend chaque rang
  uniforme. Mesures (5 000 tirages par variante) : rangs des critères équilibrés 19–30 % ; autres
  heuristiques ≤ 48 %, sauf « A′ est le point le plus éloigné de L₀ » (51 %, écran 2 de `poteau` :
  l'ombre est toujours du côté opposé à la lampe, rang par rapport au pied de L₀ irréalisable) et les
  clés sans objet (distance de L₀ à lui-même, points alignés sur le pied du mur) ; ≥ 4 500 énoncés
  distincts sur 5 000 par variante, P(deux tirages identiques) ≤ 0,03 %. Profil :
  `forme` = variante, aucun cas particulier, pas de `calcul`. Papier : scène sans rien à construire
  (lampadaire violet, mur brun) + consigne globale ; corrigé = construction complète en couleurs
  (`figureHtml`). `Solide3DSketch` : props additives `rayon` et `decalageLabel` sur les points
  annexes (petits sommets nommés du pavé). Cours : `methode` « construire une ombre à la lampe » +
  `piege` après l'atelier « soleil ou lampe ? » ; libellés pilotes « Ombre au soleil (gen41) » et
  « Ombre à la lampe : projection centrale (gen106) ». Fichiers : `AppOmbreLampe.tsx`,
  `core/ombreLampe.types.ts`, `ui/formatOmbreLampe.ts`, `generateurs/ombreLampe/` (geometrieLampe,
  index, profil, exportEvaluation).

- **4e, Chapitre 8 — lot H : gen133 « Lire un solide en perspective : vocabulaire et positions »
  et gen134 « Intersection de deux plans par parallélisme »** (audit du 4e ch. 8, décisions du
  22/11/2026). Cartes « S'entraîner » seulement, aucun bloc de cours : gen133 en § 1 (après gen104) et
  en § 2 (variante « Points d'un plan » — le § 2 n'avait aucune carte) ; gen134 en § 5 (première carte
  de la section) et en § 8 après gen102 (variante « un point et une direction », qui s'appuie sur le
  théorème du toit ajouté au § 8 par le lot A). Descriptions en texte brut. Registres : `registry.ts`,
  `evaluationAdapterRegistry.ts` (`versionPapier`), `evaluationPayload.ts` (processus 1 / 2, sections
  `cavaliere` / `deux-plans`). Détail : `.claude/rules/feuilles-evaluations.md`, « 4e ch. 8, lot H ».

- **Corrections d'écran validées par l'utilisateur (6e ch. 4 et 4e ch. 3)** : 6gen81 « section —
  fonction donnée » — tirage refait tant que la profondeur c = a·(W/2)² n'a pas une écriture décimale
  exacte d'au plus 4 décimales (`decimalCourt`, aussi pour la flèche du mur) : W = 10,5 et a = 0,3
  imprimaient f(x) = −0,3x² + 8,2688 (au lieu de 8,26875), dont ±5,25 n'étaient plus les racines
  (14 tirages sur 2 000 avant, 0 sur 3 000 après). 6gen29 — Archimède : réponse « 2/1875 ≈ 0,00107 »
  (fraction exacte en entiers, trois chiffres significatifs) au lieu de « ≈ 0,001 », consigne et
  tolérance relative alignées ; surplus (F) : réponse au dixième, Q et P au centième, vérification à
  un demi-dixième (`moteur6e/valeursIntegralesProblemes.ts`, source unique écran / corrigé /
  vérification). 6gen23/24/25 G3 : troisième coefficient renommé D (C = constante d'intégration,
  comme dans le cours). gen10 : option `etiquettesLisibles` du graphe (pas de 1/3 → entiers écrits)
  et « − » typographique sur les axes et dans la légende. Détails et mesures :
  `.claude/rules/feuilles-evaluations.md` (sections « Corrigé détaillé » et gen11).

- **4e, Chapitre 2 — Équations et inéquations du second degré** (`equations-inequations-second-degre`),
  section `contexte` (§ 7) : nouveau générateur **gen119 « Problèmes avec une fraction »**
  (processus 3), carte après gen57. Trois contextes = trois variantes, tous traduits par
  N/x + σ·N/(x + s) = p/q : prix unitaire et quantité (« s'il coûtait d € de moins, j'en aurais k de
  plus »), aller-retour à deux vitesses (w km/h de moins au retour, durée totale en h et min à
  convertir en fraction), deux robinets / deux imprimantes / deux jardiniers (fractions du travail
  faites en une unité de temps, durée ensemble en h ou en min). Racines rationnelles par
  construction (Δ carré parfait), la racine gardée est un entier ; l'autre est rejetée par le
  CONTEXTE (négative, ou vitesse au retour négative : la racine du trajet est positive mais
  inférieure à w), jamais par la CE — l'écran « rejeter » fait constater que les deux respectent la
  CE. Écrans : a) poser l'équation (choix fermé, 1 tentative ; fausses équations = pièges classiques :
  différence des prix inversée, durées additionnées, « distance × vitesse », durée décimale 3,30 pour
  3 h 30 min) ; b) valeurs interdites (liste) ; c) équation du second degré obtenue (toute équation
  proportionnelle acceptée) + ses solutions ; d) rejet (choix fermé) ; e) réponse à la question,
  avec l'unité (x lui-même en `directe`, grandeur déduite — prix, vitesse au retour, durée de l'autre
  robinet — en `deduite`). Profil : `forme` = « variante:directe|deduite » tirée avant les nombres
  (50/50), aucun cas particulier, pas de `calcul`. Niveau 6 (très difficile), ≈ 16 min. Libellé de conception
  « Problèmes avec une fraction (gen119) ». **Socle commun des nouveaux générateurs du ch. 2**
  (gen115, gen116, gen118, gen119, gen120) : écrans en DONNÉES (`ui/ecransTransfertSecondDegre.ts` :
  choix, ou champs typés nombre / liste / expression / équation à un facteur près / relation jugée
  par son ensemble-solution / ensemble construit), vérification `moteur/verificationTransfertSecondDegre.ts`
  (« − », « ² », « √ », virgule ; illisible = aucune tentative), algèbre et ensembles
  `moteur/algebreTransfertSecondDegre.ts` (forme canonique, comparaison d'ensembles, écriture KaTeX
  `\mathopen{]}`…), session `moteur/sessionTransfertSecondDegre.ts`, écran
  `components/EtapesTransfertSecondDegre.tsx` (saisie d'ensemble avec `ListeMorceauxInput` +
  `ListePointsIsolesInput` du chapitre) et coquille `components/AppTransfertSecondDegre.tsx` (puces,
  aides, corrigé de l'étape, `?code=`) ; briques de corrigé `ui/corrigeTransfertSecondDegre.ts`
  (Δ et racines dans la variable de l'exercice). Fichiers de gen119 : `AppProblemesFraction.tsx`,
  `core/problemesFraction.types.ts`, `ui/formatProblemesFraction.ts`, `generateurs/problemesFraction/`
  (index, corrigeDetaille, profil, exportEvaluation).

- **4e, Chapitre 2** (`equations-inequations-second-degre`), section `signe-trinome` (§ 2) : nouveau
  générateur **gen120 « Construire une inéquation à partir de sa solution »** (processus 3), carte
  après gen2. Démarche inverse : S est donné (variante `inequation` : ]r₁ ; r₂[, [r₁ ; r₂] ou
  l'extérieur, ouvert ou fermé ; variante `equation` : {r₁ ; r₂}, deux entiers ou un entier et une
  fraction de dénominateur 2 ou 3). Écrans : a) une (in)équation ax² + bx + c ◇ 0 de solution S —
  **toute réponse juste est acceptée** : la saisie libre « membre ◇ membre » est ramenée à un
  trinôme (degré 2 exigé) dont on calcule l'ensemble-solution, comparé à S (formes canoniques) ;
  messages ciblés (complémentaire = intérieur/extérieur confondus, mêmes bornes = crochets, racines
  opposées = facteur (x + r)) ; b) la même avec un coefficient de x² imposé (± 2, 3 ou 4, multiple
  du dénominateur) — son signe est tiré à pile ou face, négatif = symbole à retourner ; c) la
  parabole de racines r₁, r₂ qui passe par P(x₀ ; y₀) → a, b, c (champs, pièges de signe). Les trois
  écrans sont de VRAIES questions distinctes : elles restent en a) b) c) sur papier
  (`etapesParQuestion`). Profil : `forme` = « variante:allure:signe du coefficient imposé »
  (4 formes à 25 %), aucun cas particulier, pas de `calcul`. Niveaux 4–5. Libellés de conception
  « Tableau de signes (gen2) » (était vide) et « Construire une inéquation à partir de sa solution
  (gen120) ». Bug corrigé dans le socle commun en écrivant gen120 : `proches(±∞, x)` était vrai
  (∞ ≤ tol·∞), ce qui cassait les ensembles « extérieur ». Fichiers : `AppConstruireInequation.tsx`,
  `core/construireInequation.types.ts`, `ui/formatConstruireInequation.ts`,
  `generateurs/construireInequation/` (index, corrigeDetaille, profil, exportEvaluation).

- **4e, Chapitre 2** (`equations-inequations-second-degre`), section `resoudre` (§ 1) : nouveau
  générateur **gen115 « Équation à paramètre m »** (processus 3), carte après gen67. (E) :
  a(m)x² + b(m)x + c(m) = 0, coefficients affines en m ; variantes `b-egal-m` (a x² + m x + c,
  l'exemple du cours ; 22 énoncés distincts), `affine` (b et c dépendent de m), `a-egal-m` (a = m : en
  m = 0, (E) est du premier degré — Δ(0) = b(0)² > 0, donc m = 0 tombe dans la zone « deux
  solutions », où il n'y en a qu'une). Recherche au hasard : Δ(m) à racines entières distinctes
  (|m| ≤ 12), racines doubles rationnelles lisibles. Écrans : a) Δ(m) (expression en m, toute forme
  équivalente acceptée ; pièges : 4ac non soustrait en entier, double produit oublié) ; b) m₁ < m₂ et
  la racine double −b/(2a) pour chacune (4 champs) ; c) ensemble des m tels que Δ(m) > 0 (saisie
  d'ensemble en m), puis la parabole de Δ(m) (`ui/figuresTransfertSecondDegre.ts`, aussi dans le
  corrigé en `figureHtml`) ; d) discussion (choix fermé, 1 tentative ; fausses discussions : zones
  inversées, Δ = 0 lu « aucune solution », nombres de solutions décalés, cas m = 0 oublié). Corrigé :
  Δ(m) substitué puis développé, Δ(m) = 0 divisé par le PGCD (et par −1) avant d'être résolu
  (mise en évidence de m si le terme constant est nul), discussion zone par zone (m = 0 résolu à
  part). Profil : `forme` = « variante:exterieur|interieur » (signe du coefficient de m², seule
  `a-egal-m` peut l'avoir négatif : 43 % / 57 %), aucun cas particulier, pas de `calcul`. Niveaux
  3–4. Libellé de conception « Équation à paramètre m (gen115) ». Fichiers : `AppEquationParametre.tsx`,
  `core/equationParametre.types.ts`, `ui/formatEquationParametre.ts`,
  `ui/figuresTransfertSecondDegre.ts`, `generateurs/equationParametre/` (index, corrigeDetaille,
  profil, exportEvaluation).

- **4e, Chapitre 2** (`equations-inequations-second-degre`), section `signe-trinome` (§ 2) : nouveau
  générateur **gen118 « Parabole et droite : intersection et position »** (processus 2), carte après
  gen120. f(x) = ax² + bx + c, g(x) = mx + p (variantes `oblique` et `horizontale` y = k). Le nombre
  de points communs est un VERDICT tiré avant les nombres (2 : 70 %, 1 — tangente : 15 %, 0 : 15 %),
  jamais dans le profil ; h = f − g est construit à racines entières (ou A[(x − x₀)² + q]), puis
  f = g + h : coordonnées entières. Écrans : a) f(x) = g(x) ramené à 0 (toute équation
  proportionnelle acceptée ; pièges : g ajouté, parenthèse −(mx + p) oubliée) ; b) solutions
  (« aucune » accepté) ; c) ordonnées des points communs (écran absent s'il n'y en a pas : 3 ou 4
  écrans) ; d) f(x) ◇ g(x) par le signe de f − g (ensemble construit), puis la figure parabole +
  droite + points communs (aussi dans le corrigé, `figureHtml`). Corrigé : mise en évidence de x
  quand h n'a pas de terme constant (raccourci du cours), Δ sinon. Papier : deux vraies questions
  (points communs ; inéquation), `etapesParQuestion` [a, b, c] / [d] (ou [a, b] / [c]). Profil :
  `forme` = variante, aucun cas particulier, pas de `calcul`. Niveau 3. Libellé de conception
  « Parabole et droite : intersection et position (gen118) ». Fichiers : `AppParaboleDroite.tsx`,
  `core/paraboleDroite.types.ts`, `ui/formatParaboleDroite.ts`, `generateurs/paraboleDroite/`
  (index, corrigeDetaille, profil, exportEvaluation).

- **4e, Chapitre 2** (`equations-inequations-second-degre`), section `resoudre` (§ 1, « pour aller
  plus loin ») : nouveau générateur **gen116 « Bicarrées et changement de variable »** (processus 2),
  carte après gen115. (E) : a·u² + b·u + c = 0 avec u = x² (variante `bicarree`, ax⁴ + bx² + c = 0)
  ou u = x² + k (variante `changement`, comme l'exemple (x² − 1)² − 5(x² − 1) + 4 = 0). Le nombre de
  valeurs de t gardées est un VERDICT tiré avant les nombres (2 : 50 %, 1 : 40 %, 0 : 10 %) ; une
  valeur gardée donne x² = t − k > 0, carré parfait (70 %) ou non (solutions ±√n). Écrans : a)
  équation en t (toute équation proportionnelle ; une saisie en x est signalée « mauvaise lettre ») ;
  b) ses solutions ; c) valeurs de t gardées (choix fermé parmi les 4 sous-ensembles, 1 tentative) ;
  d) solutions en x (« ±√3 » accepté pour deux valeurs opposées, « aucune » possible ; piège : seules
  les racines positives). Corrigé : t = x², x⁴ = (x²)² = t², Δ en t, tri par x² = t − k ≥ 0, x² = a
  ⟺ x = ±√a, vérification en remplaçant x dans (E). Papier : « Résous dans ℝ l'équation … » (jamais
  la méthode). Profil : `forme` = variante (le verdict et les radicaux, qui n'existent que si une
  valeur est gardée, restent hors profil), aucun cas particulier, pas de `calcul`. Niveaux 3–4.
  Libellé de conception « Bicarrées et changement de variable (gen116) ». Fichiers :
  `AppBicarree.tsx`, `core/bicarree.types.ts`, `ui/formatBicarree.ts`, `generateurs/bicarree/`
  (index, corrigeDetaille, profil, exportEvaluation).
- **4e, Chapitre 2 — nouveau générateur gen121 « Détective d'erreurs : second degré »** (lot H de
  l'audit `audit-4e-ch2.md`, processus 3 Transférer, section `revision`, carte après le quiz gen61) :
  même mécanique que gen81/gen91/gen107/gen112 (copie fictive de 4 à 6 lignes, une seule ligne fausse
  et la suite qui en découle ; écran 1 ligne fausse et écran 2 description, choix fermés à une
  tentative ; écran 3 ensemble-solution corrigé, 3 tentatives). Six variantes = supports
  (discriminant ; facteur commun kx² = mx ou (x + p)² = k(x + p) ; équation sans solution ;
  inéquation k(x² + βx + γ) ◇ 0 avec k < 0 ; équation rationnelle x²/(x − p) = (sx − pr)/(x − p) ;
  inéquation rationnelle (2x − (z + p))/(x − p) ◇ 1), deux types d'erreur par variante, sur deux
  lignes différentes, tirés au hasard (verdict, jamais dans `forme`) : −3² dans Δ, b au lieu de −b,
  division par x ou x + p, signes des solutions inversés, −4ac mal signé, Δ < 0 lu « racine double »,
  sens non changé en divisant par un négatif, signe de a lu entre les racines, CE fausse, valeur
  interdite gardée, produit en croix dans une inéquation, valeur interdite incluse avec ≥. Contraintes
  communes aux deux types d'une variante (chaque erreur change S ; mesuré : 0 copie = correction sur
  2 400 tirages). Erreur non reprise : « a oublié dans a(x − x₁)(x − x₂) » (sa réponse serait une
  expression, pas un ensemble). Saisie guidée partagée avec gen117 :
  `components/SaisieEnsembleSolutionTrinome.tsx` (six allures comme gen2, bornes en fractions,
  comparaison d'ENSEMBLES `ui/ensembleSolutionTrinome.ts`) et `components/EtapeEnsembleSolutionTrinome.tsx`.
  Profil : `forme` = variante, aucun cas, pas de `calcul` ; niveau 3, 8 à 10 min selon la variante
  (jamais selon le type). Fichiers : `AppDetectiveSecondDegre.tsx`, `core/detectiveSecondDegre.types.ts`,
  `moteur/{modele,session,verification}DetectiveSecondDegre.ts`, `ui/formatDetectiveSecondDegre.ts`,
  `generateurs/detectiveSecondDegre/` (index, profil, corrigeDetaille, exportEvaluation).

- **4e, Chapitre 2 — nouveau générateur gen113 « Méthode et nombre de solutions »** (lot H, processus 1
  Connaître, section `resoudre`, carte après gen67) : une équation, 2 ou 3 écrans — la méthode la plus
  rapide (6 choix : mise en évidence, différence de deux carrés, aucune solution sans calcul, carré
  parfait, racine évidente, discriminant ; une tentative), le nombre de solutions (la seule affirmation
  vraie parmi quatre « N solutions, car … », prémisses c = 0, b = 0 et x² = −c/a, Δ, a ± b + c = 0,
  P < 0 ; une tentative), puis les solutions quand elles sont évidentes (champ libre, valeurs séparées
  par « ; »). Décision 1 : pour a ± b + c = 0, « racine évidente » ET « discriminant » acceptés (note
  sous la validation : la racine évidente est plus rapide). Variantes = allure (incomplètes c = 0 ou
  b = 0 / complètes), méthode = verdict tiré au hasard (1/3 chacune), une seule méthode applicable
  par équation (collecteur : 0 ambiguïté sur 1 200 tirages ; contrôle indépendant des raccourcis),
  présentation réduite ou déplacée à parts égales. Niveau CONSTANT (2, 7 min) : le nombre d'écrans
  dépend du verdict. Profil : `forme` = variante, aucun cas, pas de `calcul`. Composants génériques
  ajoutés : `ChoixUniqueFragments.tsx` (choix fermé, une tentative, note après validation),
  `EtapeChampLibreTrinome.tsx` (un champ libre, 3 tentatives). Fichiers : `AppMethodeNombreSolutions.tsx`,
  `core/methodeNombreSolutions.types.ts`, `moteur/{modele,session,verification}MethodeNombreSolutions.ts`,
  `ui/formatMethodeNombreSolutions.ts`, `generateurs/methodeNombreSolutions/`.

- **4e, Chapitre 2 — nouveau générateur gen117 « Lire une inéquation sur un graphique »** (lot H,
  processus 1 Connaître, section `signe-trinome`, carte après gen2 ; libellé pilote de gen2 rempli :
  « Tableau de signes (gen2) ») : parabole 𝒫 (trait plein) et droite d (pointillés : axe des x, y = k ou
  y = mx + p selon la variante) sur un quadrillage d'une unité ; trois écrans — abscisses des points
  communs (champ libre ou bouton « Aucun point commun »), position (4 lectures « il faut 𝒫 au-dessus /
  en dessous de d : c'est le cas entre / à l'extérieur / partout / nulle part », une seule juste),
  ensemble-solution avec crochets (saisie guidée de gen121). f − g = α(x − x₁)(x − x₂), α(x − x₁)² ou
  α((x − x₁)² + d), α ∈ {±1 ; ±1/2}, entiers : chaque point commun est un NŒUD de la grille ; fenêtre de
  10 unités, bornes entières, hauteur 8 à 14 (collecteur : 0 point hors nœud ou hors fenêtre, S
  contrôlé en 121 points, une seule lecture vraie, sur 1 800 tirages). Figure commune écran / papier
  (`export/svgGraph.ts`, aucun point marqué dans l'énoncé ; points étiquetés au corrigé, `figureHtml`) ;
  fond blanc sous les graduations de l'axe des y (une droite y = 4 en pointillés faisait lire « −4 »).
  Issues tirées au hasard : 2 points (60 %), contact (20 %), aucun (20 %), symbole équiprobable.
  Profil : `forme` = variante, aucun cas, pas de `calcul` ; niveau 1, 7 min (lecture + 2 écrans).
  Fichiers : `AppLectureInequationGraphique.tsx`, `core/lectureInequationGraphique.types.ts`,
  `moteur/{modeleLectureInequationGraphique,sessionLectureInequation}.ts`,
  `ui/formatLectureInequationGraphique.ts`, `generateurs/lectureInequationGraphique/`.

- **4e, Chapitre 2 — nouveau générateur gen114 « Signe des racines sans les calculer »** (lot H,
  processus 2 Appliquer, section `resoudre`, carte après gen113) : variante « signes » — P = c/a, puis
  Δ si P > 0, puis S = −b/a si Δ > 0, puis le verdict (signes opposés, deux positives, deux négatives,
  aucune racine ; choix fermé, une tentative) : 2, 3 ou 4 écrans selon le verdict ; variante « racine
  évidente » — x₁ (a ± b + c = 0), P, x₂ = P/x₁, verdict. Champs libres (fractions, 3 tentatives,
  saisie illisible non comptée) avec messages ciblés (−c/a, b/a, −4ac mal signé, 1 au lieu de −1).
  Verdict tiré AVANT les coefficients (1/4 chacun en « signes », 1/3 en « racine évidente » ;
  collecteur : verdict recontrôlé par les racines exactes, 0 écart sur 1 200 tirages) ; pas de racine
  évidente dans la variante « signes ». Niveau CONSTANT (2, 8 min) : le nombre d'écrans trahirait le
  verdict. Profil : `forme` = variante, aucun cas (« signes opposés » est un verdict), pas de `calcul`.
  Fichiers : `AppSigneRacines.tsx`, `core/signeRacines.types.ts`,
  `moteur/{modele,session,verification}SigneRacines.ts`, `ui/formatSigneRacines.ts`,
  `generateurs/signeRacines/`.
## 4e, Chapitre 2 — lots B, C et E de l'audit (gen1–6, gen57, gen67)

Décisions de l'utilisateur appliquées (audit 4e ch. 2, fichier de décisions du chantier) :

- **gen1 accepte les deux méthodes** quand une racine évidente existe (cas général non irrationnel,
  Δ > 0) : bouton « Racine évidente » (1 tentative) ou « Aucune méthode rapide » ; l'écran suivant
  s'adapte (factorisation « (x − 1)(ax − c) » ou Δ) ; corrigé et récapitulatif suivent la méthode
  retenue (`methodeRetenue` du moteur, `4e/moteur/methodeSecondDegre.ts`), corrigé papier : racine
  évidente quand elle existe. **Variante « Aucune solution »** (ajoutée EN FIN de catalogue, indices
  QR inchangés) : Δ < 0, ou b = 0 avec a et c de même signe (catégorie `irreductible`, écran de
  factorisation sauté) — un verdict, jamais un cas particulier. Coefficients irrationnels gardés.
  Second membre factorisé (G10) : « (x + p)² = m(x + p) ».
- **Groupes « à verdict »** dans le panneau d'évaluation seulement (gen1 méthode, gen2 signe de Δ,
  gen4 racine à rejeter) : mécanisme générique `groupesVerdict` (voir feuilles-evaluations.md).
- **gen57, variable entière** (produit d'entiers consécutifs, carré diminué, somme-produit) : réponse
  = ensemble d'entiers « x ∈ {8 ; 9 ; … ; 30} » (écran « Plus petit entier / Plus grand entier »,
  corrigé : intervalle puis entiers) ; racines entières consécutives avec « > » → symbole large
  (jamais d'ensemble vide).

Lot B (tous les générateurs du chapitre) : « − » typographique normalisé dans tous les champs ;
saisie illisible jamais comptée (`useTentativeLisible`, y compris le Δ de gen1, désormais
`parse_error` s'il n'est pas un nombre ou un calcul numérique) ; choix fermés à 1 tentative ; aides
à deux niveaux en KaTeX et messages ciblés (`4e/ui/aidesSecondDegre.ts`) ; figures : gen2 parabole
avec « ? » par zone jusqu'à validation (écran du signe de a fusionné avec la lecture), gen5 / gen6
courbe et signes après validation (`CourbeSignes.tsx`, `ValidationEcran.figureApres`).

Lot C : gen2 consigne « Résous l'inéquation. », racine double jamais nulle ; gen4 dénominateur
commun accepté (chemin du premier degré, `moteur/denominateurCommun.ts`, aussi sur papier), racine
étrangère variée en sous-variante C, solutions bornées à 20 ; gen5 monôme en tête sans parenthèses,
« Facteur à étudier » ; gen57 « f(x) − k ◇ 0 » accepté (et multiplié par un nombre non nul, symbole
inversé si négatif), « Pour quelles valeurs… », sens et symbole large tirés par famille (familles D :
« > » seulement, l'autre sens donnerait deux intervalles), camions 25–40 L/100 km, domaines élargis
(énoncés distincts : 24–30 → 38–1 900 par variante) ; gen67 quatre variantes (racines distinctes
a = ±1, racine double, racine nulle, a ≠ ±1) avec sélecteur, b) papier « À l'aide de a), retrouve
les racines, puis factorise le membre de gauche » (les racines ne sont plus imprimées), corrigé b)
qui retrouve les racines à partir de S et P, cas particulier réduit aux racines opposées.

Lot E : profils de forme gen3 / gen5 / gen6 / gen57, lectures revues (méthode et factorisation
après Δ = étapes), barème gen57 (forme « f(x) − k ◇ 0 », ensemble d'entiers). Bugs trouvés en
route : « S = ∅ » du cas b = 0 rendu « S=arnothing » (`"\v"` dans une chaîne TS), justification
« x · y \geq 70 » en texte (gen57), aide « racines du numérateur » pour un produit (gen5),
`<div>` dans `<p>` (aide niveau 2 de la validation gen57). Mesures : feuilles-evaluations.md.

- **4e, Chapitre 5 — nouveau générateur gen122 « Lire sur le cercle trigonométrique »** (lot H de
  l'audit, processus 1 Connaître, section `remarquables`, carte après gen15) : M(θ) sur le cercle,
  dans un quadrillage dont les lignes passent par 0, ±1/2, ±√2/2, ±√3/2, ±1 (graduées sur les
  demi-axes positifs : la valeur se lit sur la ligne symétrique, le signe au quadrant) ; tangente
  x = 1 graduée en ±√3/3, ±1, ±√3. Écrans (3 tentatives chacun) : cos θ et sin θ (deux champs) ; θ
  dans [0° ; 360°[ (deux candidats de même cosinus, le signe de sin θ
  tranche) ; tan θ lue sur la tangente ou bouton « tan θ n'est pas définie » (verdict, jamais cas
  particulier). L'aide 2 de l'écran 3 trace (OM) ; l'aide 2 de l'écran 2 ne donne α que hors du
  quadrant I (sinon c'était θ). Saisie : toute forme exacte (√3/2, sqrt(3)/2, \frac{\sqrt3}{2},
  1/√3, 0,5, préfixe « cos θ = » et « ° » ignorés) ; illisible, décimal approché d'une valeur
  irrationnelle, sin/cos/tan recopié et angle écrit avec π ou « rad » (« En 4e, les angles
  s'écrivent en degrés » — décision de l'utilisateur : le radian n'est pas enseigné en 4e, la
  variante « radians », 2e du catalogue, a été retirée ; l'indice de « degrés » est inchangé) :
  aucune tentative. Pièges
  ciblés : cos/sin échangés, signe, graduation voisine, coordonnée nulle ; tour en trop,
  angle du premier quadrant, autre candidat de même cosinus / sinus, point opposé ; tan = sin θ,
  signe de T, inverse, cos θ, verdict à tort. Tirage : axe vertical 20 %, axe horizontal 10 %,
  quadrants 17,5 % chacun ; profil sans `forme` (une seule variante), cas particulier = quadrant I. Fichiers :
  `AppLectureCercle.tsx`, `components/EtapeLectureCercle.tsx`, `core/lectureCercle.types.ts`,
  `moteur/{modele,verification,session}LectureCercle.ts`, `ui/formatLectureCercle.ts` (textes et
  figure écran = papier), `generateurs/lectureCercle/` (index, profil, corrigé, adaptateur).
  Mesures (après retrait des radians) : 2 000 tirages, ≈ 129 000 saisies justes écrites autrement toutes
  acceptées, 0 anomalie ; parcours iPhone 13 (5 instances dont axes et tentatives épuisées),
  scrollWidth 390, 0 erreur console ; QR code : 12 / 12 codes de feuille rouvrent le même M.

## 4e, Chapitre 5 — lots A, E, F et G de l'audit (cours, quiz gen63, figures, atelier)

Lot A (cours) : tableau des caps (écart pris entre 0° et 180°, sinon 360° − différence : faux
dans 45 % des gen77 « trajets ») ; § 8 « un thème par grande partie » ; renvoi « rappel du début
du chapitre » (et non « section 1 ») ; « angle du premier quadrant » partout (cours, énoncés de
démonstration, et SEULEMENT ce texte dans gen14 et gen76 — chantiers parallèles sur leurs
fichiers) ; notation Â (kicker § 6, descriptions) ; « avant », « un seul triangle » en
minuscules ; « al-Kashi » en minuscule dans le nom complet, comme « al-Tusi » (« Al-Kashi » seul
reste en capitale) ; « des centaines de millions de côtés » (3·2²⁸) ; fractions clavier des
étapes d'exemples (3/5, 1/√2, CH/AC, BS/sin Â…) passées en KaTeX. Formulaire complété (tangentes
des angles associés, 90° + θ, 1 + tan²θ, ±, angles sur les axes, |k| > 1, sin²α = k, produit
nul, mouvement circulaire, Al-Kashi en b² et c², test du cas ambigu, aire, Héron, forces, caps,
élévation, dépression) ; récapitulatif : 3 puces de plus, dans l'ordre des sections.

Lot F : six figures en kinds existants, coordonnées calculées (script, jamais à l'œil) —
`circleAngles` tan α = 1 (étiquettes en `freeLabels` pour ne pas toucher la tangente), cas
ambigu en `illustrationGroup` de trois `vectorPlane` (arc de compas = `curves`
y = 4 − √(a² − (x − 6,928)²), domaine isotrope 320/300), deux triangles de même aire, quadrilatère
+ exemple résolu (aire ≈ 24,09), grande roue, caps. Démonstrations « Démonstration — … »
(1 + tan²θ, règles des angles associés par symétrie, nombre de triangles en SSA) ; les
démonstrations existantes (loi des sinus — qui était un `exemple` —, Al-Kashi, aire) n'étaient
PAS reconnues par `estBlocDemonstration` (labels « Loi des cosinus », « Aire ») : relabellisées,
énoncés sans méthode. Exemples 90° + θ (120°) et sin α = sin 200°. **Piège** : `vectorPlane` en
`illustrationGroup` → étiquettes à ≈ 8 px sur téléphone (deux colonnes de 170 px) ; garder des
étiquettes d'une lettre. Contrôle « étiquette SVG hors cadre » (`getBoundingClientRect` de chaque
`<text>` contre sa `<svg>`) : il a trouvé deux défauts anciens, corrigés — étiquettes
« α₁ = 30° » et « sin α = k » rognées (figure sin α = 0,5) ; composant `Triangulation` : arcs
d'élévation dessinés SOUS le sol (facteur −1 sur l'angle), « d = 40 m » sur la visée, jambages de
« appareil 1 » coupés.

Lot E (quiz gen63) : banque en `$…$` (`TexteRiche` à l'écran, `banquesVraiFaux` sur papier),
plus aucune écriture clavier ; « variante » → « façon de relier » ; six « jamais / uniquement »
de « triangles liés » remplacés (les nouveaux restent sur papier : jamais « l'exemple du cours ») ;
trois thèmes nouveaux (équations à transformer et rotations, aire et cas ambigu, forces / caps /
visées) : 350 affirmations, 10 × 35, 18 V / 17 F partout ; catalogue dans l'ordre des sections ;
`QUIZ_THEMES` avec un libellé par thème quand une section en a deux. Contrôle automatique :
`check_banque.mjs` du dossier de travail (KaTeX `throwOnError`, barre de fraction / `sin(` / `^`
/ `√` hors formule, majuscules, doublons, équilibre).

Lot G : `roue-hauteur-widget` (§ 5, avant gen79) : θ₀, sens, α, r ∈ [2 ; 12], h ∈ [12 ; 20], H ;
fenêtre fixe −1 à 34 m (pire cas h + r = 32) ; couleurs par rôle reprises dans le texte et les
curseurs. Vérifié : 8 réglages × 2 tailles × 2 thèmes, valeurs recoupées à la main, axes
identiques après chaque réglage, scrollWidth 390, 0 étiquette rognée.

## 5e (4h), Chapitre 2 — lots A, E et F de l'audit (cours, quiz 5gen40, figures)

Lot A (cours) : k → c comme second membre (§ 7 : produit nul, mise en évidence, tableau « Quelle
méthode ? », carte 5gen10, titre de la vidéo ; titre et whereLabel de la carte intacts) ; 16
majuscules d'insistance retirées ; « [0 ; 2π[ » au § 6. Notation unique : « déphasage φ » (cartes
5gen8 / 5gen9, § 5, § 8), Φ = −φ/ω seul décalage horizontal (rappel du § 4, récapitulatif) ;
fréquence en toutes lettres (`\text{fréquence}`, plus de f_req : f est la fonction). Durée du jour :
UN modèle sur la page, celui de l'atelier, `12 + 4,5 sin(2π(j − 80)/365,24)` (j = jour de
l'année) — l'application comptait x depuis le solstice. Rappel arcsin remonté en tête du § 8 (première
utilisation). Cinq démonstrations « Démonstration — … » (s = rθ et A = ½r²θ ; corde et segment ;
période et décalage ; extremums réunis tous les π ; solutions de sin x = c par symétrie) ; exemples
« arc et aire donnés » (r = 2A/s), « k côtés », « maximum en t₀ ≠ 0 », « deux points de la courbe »
(décision 3 : méthode + exemple + attention arcsin ; A, b donnés, points sur une même montée).
Formulaire : radians → degrés, θ = s/r, r = 2A/s, r = √(2A/θ), arc / secteur sur k côtés (lettre k
comme 5gen7), fréquence, φ = −ω·x₀, φ ∈ ]−π ; π], extremums du cosinus, groupe « Modéliser en
contexte ». **Piège** : la démonstration de sin x = c avait une clé contenant « deux familles de
solutions », sous-chaîne du badge d'un exemple → `verifier-enonces-evaluation` « clé ambiguë » ;
label renommé (« … par symétrie »).

Lot F : sept figures en kinds existants, coordonnées calculées (commentées dans le contenu) —
octogone et secteur sur 3 côtés (`circleDiagram`, sommets en π/8 + kπ/4), essuie-glace et corde
(A(6 ; 8), B(−6 ; 8)) et lentille (O₁(−8 ; 0), O₂(√28 ; 0)) en `vectorPlane` isotrope, 6 solutions
sur le cercle (`circleAngles`, étiquettes en `freeLabels` : une étiquette ancrée à droite de 355°
sortait du cadre), inéquation lue sur la courbe (`shadedRegions`), modèle à deux points. **Piège** :
arc `y = √(r² − x²)` près de (r ; 0) → dernier segment rectiligne visible ; finir l'arc en
`curvesOfY`. Contrôle « étiquette SVG hors cadre / chevauchement » : défauts ANCIENS corrigés —
cercle à 16 angles (« 180° », « 3π/2 », « sin » rognés, « 0° » / « π/2 » sur la flèche :
`CircleAngles`, mode `mono` seulement, étiquette rapprochée quand |cos| > 0,5 et posée à côté d'un
point situé sur un axe), « sin u = 1/2 » rogné, « y = c » sur « π−α », « cos(u)=1/2 » sur « u=π/3 »
(valeur en `freeLabels` près de l'axe), graduations « 0.5 » du § 5. Les trois « chevauchements » qui
restent (120°/135°…) sont des boîtes de ligne : 5 px, autant qu'entre les deux lignes d'une même
étiquette (mesuré tspan par tspan), aucun contact de glyphes à l'écran.

Lot E (quiz 5gen40) : banque réécrite en `$…$` (`TexteRiche5e` dans la question, la correction et
le résumé ; `banquesVraiFaux` sur papier), 245 affirmations, 7 × 35, 18 V / 17 F (17 / 18 pour les
paramètres) ; c / k, φ / Φ, plus de « bArg » ; notions ajoutées (polygones, Archimède, θ = s/r,
r = 2A/s, parité, construction, φ = −ω·x₀, tan interdite, t₀ ≠ 0, deux candidats, deux points,
inéquations, durée du jour). `nombreExercices` = `nombreQuestions(theme)`, accueil et carte du cours
mis à jour ; catalogue dans l'ordre des sections ; `QUIZ_THEMES` : § 2 rattaché au thème des arcs.
Contrôle `check_banque5e2.mjs` (dossier de travail) : KaTeX `strict: 'error'`, notation clavier hors
formule, majuscules, « trig(…) = k », point décimal, doublons, équilibre, session sans répétition,
fragments papier sans `$` — 0 problème ; parcours Playwright : 35 / 35 énoncés distincts, 0 `$`
isolé, 0 `.katex-error`.
## 4e, Chapitre 5 — lots B, C et D de l'audit (gen14–19, gen58 ; gen73–81)

- **Lot B (sept anciens générateurs)** : champs d'angle `ChampAngleTrig` (gen14 réduction et angle
  du premier quadrant, gen15), de valeur exacte `ChampValeurExacte` (gen16) ; `useTentativeLisible`
  partout (une saisie illisible n'est jamais transmise), messages d'illisible par nature de champ
  (`MESSAGE_ANGLE_ILLISIBLE`, `_LONGUEUR_`, `_VALEUR_`, `_VALEUR_EXACTE_`, `MESSAGE_VALEUR_APPROCHEE`
  dans `RetourSaisie.tsx`) ; `AidesNiveaux` reçoit `figure(niveau)` (le cercle d'aide s'affiche au
  niveau 2, composants `Aide…CercleTrig` / `AideQuelAngle` avec `sansBouton`) et `onNiveau`. Textes
  et messages ciblés : `ui/aidesCercleTrigo.ts`, `aidesUnSansLautre.ts`, `aidesAnglesAssocies.ts`,
  `aidesQuelAngle.ts`, `aidesTriangles.ts` (gen19 : radians, côté non opposé, signe d'Al-Kashi, ½,
  unité), `aidesTrianglesLies.ts` (anciens `texteAide…` de gen58 supprimés : « ET », « MÊME »).
  Choix fermés à 1 tentative sans case rouge : gen14 signes et valeurs sur un axe, gen15 valeurs
  exactes (message ciblé « sinus et cosinus échangés » / « signe » en `messageRevele`), gen58
  interprétation (2 niveaux d'aide). gen16 : valeur exacte seulement (`moteur/saisieExacteTrigo.ts`,
  repris par gen78 ; décimal exact accepté, approché refusé sans tentative, signe testé après la forme).
- **Variantes en fin de catalogue, hors tirage libre** (les `?code=` « libres » imprimés restent
  valides) : gen17 `sinCos-plus90` (relation `plus90`, θ = 90° + α, règle directe) ; gen18 `egalite`
  (`angleEgal` = β, solutions β et 180° − β ou β et −β ramenées ; corrigé : réduction sur une ligne à
  part, sinon > 48 caractères).
- **Lot C** : gen58 câble = longueur TO (décision 5), R entre O et le pied (angle ORM ∈ [100° ;
  165° − élévation]) avec l'élévation de M donnée une seule fois (même libellé, dédoublonné sur
  papier), villes en km, réponse brève au centième avec zéros, « triangle ACD » ; gen15 0°/90° variés
  (forme « axe:… ») ; gen14 sans « ≡ » ; gen19 Â/B̂/Ĉ (`ANGLE_CHAPEAU`) et ancienne correction en
  KaTeX ; gen73 `egalOuEnvironElement` ; gen78 k exact, ∅ sans précision ; gen80 décimales fixes et
  a) b) ; gen81 `finalSansArrondi` (acceptée, annoncée) ; gen77 sous-types `releve` (trajets, loi des
  sinus, 3 conversions) et `telemetre` (élévation, Al-Kashi), une fois sur trois ; gen79 intervalle
  `[0^\circ \,;\, 360^\circ\mathclose{[}` (espacé comme gen18). **Piège** : une chaîne Python non
  brute écrivait `\${f}` dans un gabarit TS (« ${f} » littéral) — le collecteur l'a vu (KaTeX invalide).
- **Lot D** : voir `feuilles-evaluations.md` (verdicts gen75/gen79, groupes gen17/19/73/81).
- **Pas de radian en 4e** (décision de l'utilisateur) : gen122 sans variante « radians » ;
  `radiansLatex` et `lignesReductionRadians` retirés de `corrigeCercleTrigo.ts` ; seule mention
  restante, le piège de la calculatrice réglée en mode RAD (gen19/58/73/75/80/81 ; gen81 écrit
  « (mode RAD) », plus « rad » comme unité).

- **5e (4h), Chapitre 2 — Trigonométrie, lot G (5gen50–5gen53)** : quatre nouveaux générateurs, cartes
  ajoutées seules (aucun autre bloc du cours touché) — 5gen51 après le tableau des valeurs exactes (§ 4),
  5gen52 après 5gen8 (§ 4), 5gen53 après 5gen9 (§ 5), 5gen50 après 5gen13 (§ 8). Socle commun
  (`moteur5e/trigExact.ts` : rationnels et multiples de π exacts, valeurs remarquables ;
  `moteur5e/sinusoideExacte.ts` ; `moteur5e/saisieTrig.ts` : lecture des saisies — « − » « – » « — »,
  π, √, fractions, listes « ; » —, aperçu KaTeX, `DiagnosticSaisie` dont `illisible` / `approchee` /
  `nonCompte` ne consomment jamais de tentative ; `components5e/CoqueTrig5e.tsx`, `EtapesTrig5e.tsx`
  (champs, choix fermé à 1 tentative avec explication du choix faux), `EtapePlacerPointsTrig5e.tsx`).
  - **5gen50 détective** (Transférer) : supports secteur / maximum d'une sinusoïde / sin(2x) = c ou
    cos(2x) = c / (tan x − c)·cos x = 0 ; erreurs du cours (π perdu, ½ oublié, degrés, T = π/ω, Φ = φ,
    ordre des extremums, mauvaise table, seconde famille oubliée ou fausse, 2kπ non divisé, période 2π
    de tan, cos x = 0 ⟺ kπ, valeur interdite gardée) ; abscisse d'un maximum juste à une période près ;
    ensembles comparés comme ensembles, solution hors de [0 ; 2π[ signalée sans compter.
  - **5gen51 radians sur le cercle** (Connaître) : réduction, quadrant, cos/sin lus sur le cercle
    quadrillé aux valeurs remarquables (comme gen122, M placé après le quadrant), tan ou « n'existe
    pas » ; cas particulier = quadrant I, axes et tan non définie = verdicts.
  - **5gen52 construction point par point** (Appliquer) : A, b, T, Φ, puis cinq points d'une période
    et quatre points reportés touchés sur un quadrillage au pas T/4 ou T/8 étiqueté en multiples de π.
  - **5gen53 associer formules et courbes** (Connaître) : un écran par courbe, variantes par paramètre
    piège (φ/Φ, signe de A, ω/T, mélange), même quadrillage pour les quatre courbes.
  Vérifié : 2 000 tirages par variante (réponses recalculées à part : balayage numérique des
  solutions, points clés sur la courbe et sur une intersection, une seule expression par courbe),
  0 problème ; parcours iPhone 13 des quatre applis (bonnes réponses, erreurs ciblées, illisible),
  scrollWidth 390, 0 erreur console ; captures dans le dossier de travail `5gen50-53`.
- **5e (4h), Chapitre 2 — Trigonométrie** (`trigonometrie`), lot G de l'audit (moitié 2) : quatre
  nouveaux générateurs, cartes ajoutées sans toucher au reste du cours. **5gen56 « Encadrer π comme
  Archimède »** (§ 1, carte juste après l'atelier `archimede-widget`) : α = 180°/n, côtés 2r sin α et
  2r tan α, encadrement n sin α ≤ π ≤ n tan α, doublement, nombre de côtés pour une largeur sous un
  seuil (départ hexagone, carré ou autre polygone ; figure du cours). **5gen54 « Choisir φ quand le
  départ n'est pas un extremum »** (§ 8, après l'astuce « vérifie sur une deuxième donnée ») : A, b,
  ω ; sin φ ; deux candidats de ]−π ; π] (à 2π près) ; le sens de variation tranche (choix fermé à
  trois options, dont « les deux conviennent ») ; premier maximum. **5gen55 « Inéquations
  trigonométriques »** (§ 8, après le piège « arc où le sinus est le plus grand ») : sin ou cos(ax + b),
  exact, coefficient parfois négatif, intervalles saisis ligne par ligne avec leurs crochets ;
  inéquation toujours vraie / sans solution = cas particulier (décision de l'utilisateur).
  **5gen57 « Modéliser des relevés réels par une sinusoïde »** (§ 8, après 5gen13, processus 3) :
  marée, durée du jour (six villes), températures mensuelles (cinq villes), ordres de grandeur réels,
  relevés = modèle arrondi. Socle partagé (`AppEcransTrigo`, `EtapeEcransTrigo`, `sessionEcransTrigo`,
  `lectureValeurTrigo`). Libellés de 5gen6 et 5gen13 ajoutés dans `GENERATEURS_EVALUATION_PILOTE`
  (leurs sections ont maintenant deux générateurs). Vérifié : 2 000 tirages par variante (recalcul
  indépendant, saisies justes autrement écrites, « − », illisible), parcours iPhone 13 (390 px,
  0 erreur console), documents réels 2 séries + aménagée sans débordement, collecteur 0 égalité fausse.
## 5e (4h), Chapitre 2 — lots B, C et D de l'audit (générateurs 5gen6–5gen13)

Lot B (retours de saisie) : illisible sans tentative et message par nature de champ, messages ciblés,
aides à deux niveaux en KaTeX (`ui5e/aidesTrigonometrie.ts`, `components5e/RetourSaisieTrig.tsx`),
« Ici u = … », « — » lu comme « − ». Bugs trouvés au parcours : illisible jugé « faux » avant d'être
lu sur les écrans « aucune solution » / racine à rejeter / φ de B1 ; « 13sin(…) » (coefficient collé)
jugé faux en 5gen10 et 5gen13 (`\b` devant sin) ; formules d'aide et du corrigé (« cos X = a ⟺ … »)
sorties de l'écran à 390 px ; notations affichées illisibles (cos²(x), « = 0 », « f(t) = », ω/φ/arcsin
du placeholder du système B3) ; placeholders 5gen10 sans « * » ni « pi ». Lot C : 5gen10 sans famille entièrement exclue, ni 0·sin x, ni −1·, ni
doublon, décimales au centième ; φ dans ]−π ; π] (5gen8, 5gen13) ; libellés 5gen8 ; 5gen7 sans
`calculatriceIndispensable` ; « question b) » fantôme de 5gen13 retirée ; essuie-glace 30°–170° ;
fenêtre 5gen11 [0 ; 2T[ quand T n'a pas π ; étiquettes du cercle au dixième. Lot D : profils 5gen7,
5gen12, cas particuliers et `groupe_technique` de 5gen10, `forme` de 5gen11 et 5gen13 (détail :
`feuilles-evaluations.md`, « Textes : écran vs papier »).

## 6e (6h), Chapitre 2 — lots A et F de l'audit (cours, quiz 6gen65)

Lot A (cours) : C1 (2^{1/12} : exposant **rationnel**, exemple 2^{√2}), C2 (« seule base a » et
non « seule fonction » : lede, § 2, formulaire), C3 (Moore : c'est le phénomène réel qui s'écarte,
une exponentielle ne ralentit jamais), C4 (figure de saturation et `croissance-saturation-widget`
à k = 0,1 : (10 ; 0,63)), C5 (x³ contre eˣ, croisements 1,86 et 4,54 en `xTickLabels`), C6
(exemple 4ˣ − 3·2ˣ + 2 = 0 ; récapitulatif : ln seulement comme touche de calculatrice, § 7), C7
(monotonie DÉMONTRÉE au § 2, renvois « section 2 » dans les §§ 4–5), C8 (exp′ = exp devient
« Conséquence — … » : ln e = 1 admis). « base » → a partout (méthodes, tableaux, descriptions) ;
majuscules → gras ; légendes en KaTeX ; tableau des dérivées en KaTeX ; « lim » du formulaire en
`\displaystyle\lim_{x \to …}` ; ordre de l'étude (domaine, limites, variation, concavité) dans les
deux exemples du § 6 ; « et réciproquement » remplacé (f′ paire ⇏ f impaire, contre-exemple x + 1).
Six démonstrations « Démonstration — … » : aˣ > 0 (§ 1), (1 + k/x)ˣ → eᵏ, signe de ln a (point 1 :
aʰ > 1 par les rationnels puis la continuité ; ln a ≠ 0 par l'absurde ; 0 < a < 1 par b = 1/a),
limite fondamentale (aˣ − 1)/x → ln a, dominance xⁿ/aˣ → 0 (minoration aˣ > (ln a)²x²/2 par l'étude
de g, gendarmes, puis a^x = (a^{x/n})ⁿ) — toutes au § 2, après la dérivée — et parité → dérivée
(§ 3). **Règle de L'Hôpital** (décision 1) : fin du § 2 (elle utilise les dérivées ; renvoi depuis
le § 1 et la carte 6gen6), intuition par les tangentes, théorème admis avec ses conditions (0/0 ou
∞/∞, dérivables au voisinage, g′ ≠ 0, limite du quotient des dérivées qui existe ; aussi à gauche,
à droite, en ±∞), deux exemples (sin 4x / (e^{2x} − 1) ; deux applications), piège hors forme
indéterminée ((eˣ + 1)/(x + 1)), condition (2) ((x + sin x)/x), méthode « croissances comparées
d'abord ». Développement limité : aucune mention. § 3 : tableau de lecture f′ ↔ f, figure
(x − 1)eˣ / x·eˣ annotée, exemple, piège « signe de f ». § 6 : asymptote oblique (définition,
exemple 2x − 1 + e^{−x}, figure dont la fenêtre contient toute la droite : `obliqueAsymptotes`
n'est pas découpé en y et débordait sous le cadre). § 7 : doublements à rebours, modèle
L + C·qᵗ (rapport des écarts = q^d ; café 84/36/24 → q = 1/2, C = 64, L = 20, figure), Q₀(1 − qᵗ),
maximum de tⁿe^{−at} (médicament 5t·e^{−0,5t}). Formulaire : 9 groupes dans l'ordre des sections
(33 formules). `ENONCES_DEMONSTRATION` au format par clé (énoncé « k⁷ = 2 » sans méthode) et
chapitre ajouté à `CHAPITRES_ENONCES_VERIFIES` ; badge « base 1/2, entre 0 et 1 » (sinon clé
ambiguë avec « base entre 0 et 1, exposant du second degré »). **Piège** : la `caption` d'un
`signTable` est en texte BRUT (`$` visible) — Unicode.

Lot F (quiz 6gen65) : Q1–Q3 corrigées (tⁿe^{−at}, « base > 1 », « sur un intervalle ») ; 2
affirmations « développement limité » et 5 grands calculs remplacés ; L'Hôpital gardé (cohérent
avec le cours) ; 2 « méta » typographiques remplacées ; « x = ln 2 » remplacé ; ln e = 1 « admis »,
plus « définition » ; base → a/b ; 0 majuscule ; deux thèmes (`puissancesNombreE` en tête,
`modeleExponentiel` en fin) : 315 affirmations, 9 × 35, 17 à 20 vraies. Affirmations nouvelles en
`q("…$…$…", rep, "…")` (helper local `rt`). `nombreExercices` = `nombreQuestions(theme)`, accueil
calculé ; `QUIZ_THEMES` avec libellés (deux thèmes en § 1 et en § 7). Justification de l'écran de
correction enveloppée dans un `<span>` (`.triangle-quelconque-aide` est flex : chaque fragment
KaTeX devenait une colonne — même défaut corrigé ensuite dans les 8 autres panneaux, 6gen66–73).
Contrôle `check_banque.ts` (KaTeX `strict: 'error'`, notation clavier, majuscules, doublons,
équilibre, session sans répétition, fragments papier sans `$`) : 0 problème.
- **6e (6h), Chapitre 2 — Fonctions exponentielles** (`fonctions-exponentielles`), lot G de l'audit
  (seconde moitié) : quatre nouveaux générateurs, cartes ajoutées sans toucher au reste du cours.
  **6gen148 « Lire une courbe exponentielle »** (§ 1, carte juste après l'atelier
  `exponentielle-widget`) : asymptote y = c, k par f(0), base par le rapport des ÉCARTS à
  l'asymptote, expression ; points marqués d'abscisses 0 et 1 ou −1 et 0 (variantes), tous sur la
  grille. **6gen149 « Tangente à une exponentielle et nombre ln a »** (§ 2, juste après l'atelier
  `tangente-exponentielle-widget`) : ln a seulement comme pente en (0 ; 1) de aˣ (exacte ou touche ln,
  décision de l'utilisateur) ; variantes en (0 ; 1) (verdict du signe), en x₀ pour k·aˣ, base e
  (k·eᵐˣ). **6gen151 « Intérêts composés et nombre e »** (§ 2, après 6gen7) : Bernoulli (100 %, un
  an) ou placement réaliste ; trois capitaux, limite K₀·eʳᵗ, taux équivalent eʳ − 1, sans logarithme.
  **6gen150 « Modèle L + C·qᵗ »** (§ 7, après 6gen12, processus 3) : thé, bouteille, inscrits à une
  appli ; trois mesures exactes, rapport des écarts, L et C, q, prévision, seuil (ln à la
  calculatrice, astuce du § 7). Aides à deux niveaux (jamais la réponse), messages ciblés (k = f(0),
  rapport des ordonnées, (k·a)ˣ, ln a oublié, aˣ dérivé comme xⁿ, ordonnée f(x₀), ln arrondi trop
  tôt, rapport des mesures, dernière mesure prise pour L, q = r, taux non divisé par n, 1 non retiré).
  Libellé de 6gen6 dans `GENERATEURS_EVALUATION_PILOTE` laissé vide (fichier hors périmètre de ce
  lot) alors que § 1 a maintenant deux générateurs. Vérifié : 2 000 tirages par variante (recalcul
  indépendant, saisies justes autrement écrites, « − », illisible, `?code=`), parcours iPhone 13
  (390 px, 0 erreur console), page du chapitre (4 cartes, 0 erreur), documents réels 2 séries +
  aménagée sans débordement, collecteur 0 égalité fausse.

- **6e (6h), Chapitre 2 — Fonctions exponentielles**, lot G de l'audit (6gen144–6gen147, nouveaux) :
  quatre cartes `entrainement` ajoutées, chacune à l'endroit où sa notion est enseignée. **6gen146
  « Puissances à exposant réel sans calculatrice »** (§ 1, après l'intuition « Pourquoi a⁰ vaut-il 1 ? ») :
  règles des puissances, comparaison par l'exposant et le sens de la base, exposant en x ; valeurs
  exactes seulement (ln reste une touche de calculatrice, décision de l'utilisateur). **6gen145
  « Limites de référence et croissances comparées »** (fin du § 1, après 6gen6) : forme, limite de
  référence, valeur ; L'Hôpital accepté. **6gen147 « Modèle exponentiel lu dans un tableau »** (§ 7,
  après l'illustration Q(t) = 100·1,5ᵗ) : rapports, verdict exponentiel / linéaire, paramètres,
  prévision. **6gen144 « Le détective d'erreurs : exponentielles »** (fin du § 7, après 6gen12) : huit
  erreurs relevées par l'audit (ln a oublié, signe de e^{−kx}, sens d'une inéquation de base < 1,
  racine t < 0 gardée, règles des puissances, dominance, baisse en 1 + p, facteur pris comme une
  différence). Libellé pilote de 6gen6 précisé (« Calcul de limites (6gen6) ») : sa section a
  maintenant deux générateurs. Vérifié : 2 000 tirages par variante (recalcul indépendant, écritures
  équivalentes, « − », illisible), parcours iPhone 13 (390 px, 0 erreur console), documents réels sans
  débordement, collecteur 0 égalité fausse.

- **6e (6h), Chapitre 2 — 4 ateliers de l'audit et structure du § 3** (validés par l'utilisateur ;
  conventions des retours « 14 widgets », « couleurs », « tableaux tronqués » dès la première passe).
  **`rattrapage-exponentielle-widget`** (§ 1, après la figure eˣ / x³) : aˣ contre xⁿ, a ∈ [1,05 ; 3]
  (bouton « a = e »), n de 1 à 8 ; croisements par bissection de x·ln a − n·ln x (minimum en n/ln a),
  le plus grand = dernier dépassement ; zone « xⁿ devant » ombrée ; fenêtre réglée UNIQUEMENT par
  sélecteurs (abscisses 5 à 2 000, échelle log par défaut ou normale avec hauteur au choix ; haut de
  l'échelle log fixé par fenêtre). Défaut a = e, n = 3 : 1,86 et 4,54 (comme la figure). **`vers-e-widget`**
  (§ 2, après l'encadré Bernoulli) : (1 + 1/n)ⁿ, curseur logarithmique jusqu'à 10⁹, chiffres justes en
  vert, écart à e, tableau de repères ; mode « intérêts composés » (1 000 € à 100 %, de l'année à la
  seconde, escalier + courbe K₀·eᵗ). **Piège** : `Math.pow(1 + 1/n, n)` dépasse e à n = 10⁹
  (2,7182820520) — calcul par `exp(n·log1p(1/n))`. **`f-fprime-exponentielle-widget`** (§ 3, sous-titre
  « f et f′ côte à côte », après le piège « croissance, jamais signe ») : 6 fonctions du chapitre
  ((x − 1)eˣ, x·eˣ, e⁻ˣ², ch, x·e⁻ˣ, eˣ − 2), deux graphiques superposés, un seul code couleur (vert
  f′ > 0 / rouge f′ < 0 sur f, f′, tangente et points ; extremum cercle foncé, inflexion cercle violet),
  glisser sur le graphique (`touch-action: pan-y`, `preventDefault` à la souris : sinon le glissement
  sélectionne le texte de la page). **`rapports-differences-widget`** (§ 7, avant 6gen147) : 9 tableaux
  (3 linéaires, 4 exponentiels, 2 ni l'un ni l'autre ; pas de 1, 2 ou 3 ; départ en t = 1), tableau
  VERTICAL avec écarts entre deux lignes (l'horizontal débordait sur iPhone : 338 px pour 308),
  verdict et modèle calculés (r = rapport^(1/pas), Q₀ = v₀ / r^t₀ ; m, p), fenêtre écrite par
  tableau. § 3 : méthode « Lire le graphique de f′, étape par étape » et sous-titre « Ce que le
  graphique de f′ dit, et ce qu'il ne dit pas ». Vérifié (Vite, iPhone 13 et 1 280 px, clair et
  sombre) : 0 erreur console, scrollWidth 390, 0 `$` / `.katex-error`, Shadow DOM sans `^ $ NaN
  Infinity undefined`, 0 étiquette SVG rognée, tableaux ≤ 301 / 308 px, axes identiques après chaque
  curseur, `test-epingle` 0 échec. Captures : `scratchpad/ateliers-6e2/`. **Piège de vérification** :
  avec `node_modules` lié hors du worktree, `vite` refuse les polices KaTeX (403) — serveur lancé par
  l'API (`createServer`, `server.fs.allow`) ; captures d'atelier épinglé faussées → fenêtre agrandie
  le temps de la capture.

## 4e, Chapitre 1 — lots A, E et F de l'audit (cours, quiz gen60, figures)

Lot A (cours) : sous-titre brut « x_S = -b/(2a) » → « D'où vient la formule de l'abscisse du
sommet ? », « graphe Mafs » retiré de la carte gen8, « MÊME », checklist (« le sommet ou la borne
retenue », x_S en KaTeX — la checklist passe par `RichText`). Notation (décision 3) : sommet
S(x_S ; y_S) et a(x − x_S)² + y_S partout ; p et q seulement pour les translations (légende de
`transformations-widget` : « sommet (TH ; TV) »). Trois démonstrations « Démonstration — … » :
abscisse du sommet (§ 1, ancienne dérivation mise en bloc), forme canonique générale
a(x + b/2a)² + c − b²/4a sans Δ et image par un carré ≥ 0 (§ 2) ; énoncés par clé sans méthode
(et méthode retirée de 4 énoncés existants). Astuce « lire a » (point (x_S + 1 ; y_S + a),
|a| = EV/CV). Formulaire : 9 groupes dans l'ordre des sections (tableau de valeurs, milieu des
zéros, sens des translations, compléter le carré, forme générale, retrouver l'équation, domaine
de validité) ; récapitulatif : 2 puces de plus (lire et reconnaître, transformations). Plus de
« Δ » dans le § 4 ni le forward. Tableau de variation du § 1 raccourci (↘/↗ : 443 px sur
iPhone). `QUIZ_THEMES` : « optimisation » (section `utiliser`) et les 4 thèmes nouveaux.
Décision 4 : les widgets gen7/gen8 n'ont jamais été fusionnés (règles et commentaires corrigés).

Lot F : figures en kinds existants, valeurs calculées — « lire a » (`vectorPlane` quadrillé
ISOTROPE 8 × 7,5, rapport 320/300 : un carreau = 1 dans les deux sens), cas 2 de l'optimisation
(domaine [12 ; 20[ en `shadedRegions`, borne 20 ouverte, étiquette de l'optimum en `textLabels`
au-dessus : posée à droite du point, elle chevauchait la courbe), trajectoire h(t), tableaux de
signes à un zéro double et sans zéro, exemples « sommet + point » / « zéros + point » dessinés.
`CurvePlot` : graduations « − » et virgule (`nombreTick`, tout le site). **Piège** : une formule
de `featureTable` sans groupe `{…}` se coupe à chaque opérateur dans une colonne étroite.

Lot E (quiz gen60) : banque réécrite en `$…$` (`TexteRiche` dans la question, la correction et
le résumé ; `banquesVraiFaux` sur papier) ; 2 affirmations fausses corrigées (EV et CV se
combinent : |a| = EV/CV, comme gen8/gen9 ; signe de a et y_S donnent le NOMBRE de zéros, pas le
tableau complet), 2 imprécises (p ≠ 0 ; un bénéfice peut être négatif) ; ni « concavité »,
« coefficient dominant », « Δ », « discriminant », « irréductible », ni majuscules. 4 thèmes
nouveaux (lire a, b, c ; différences secondes ; compléter le carré ; trois écritures et retrouver
l'équation) : 350 affirmations, 10 × 35, 18 V / 17 F (formeCanoniqueSommet 17 / 18), catalogue
dans l'ordre des sections ; accueil calculé depuis la banque. Banque écrite dans un texte source
(dossier de travail `lotE/banque60.txt`, séparateur « ¦ » : « | » sert à |a|) puis générée
(`json.dumps`). Contrôle `check_banque.cjs` (KaTeX `strict: 'error'`, notation clavier, Unicode
hors formule, majuscules, mots interdits, doublons, équilibre) : 0 problème ; fragments papier des
10 thèmes : 0 « $ ». Vérifié : page en clair/sombre, iPhone 13 et 1 280 px (scrollWidth 390,
0 `$` isolé, 0 `.katex-error`, 0 NaN) ; quiz parcouru (un thème en entier : 35 / 35 distinctes,
3 affirmations dans chacun des autres).

- **4e ch. 1 — corrigé « comme au tableau », niveaux 1–7 et lots B, C, D de l'audit (gen7, gen8,
  gen9, gen55)** : corrigés `generateurs/{analyseFonction,transformationsGraphiques,formeCanoniqueTransformations,optimisation}/corrigeDetaille.ts`
  (partagés avec l'appli), détail dans `feuilles-evaluations.md`. Corrections à la source :
  gen7 mise en évidence de a·x, binôme borné pour |a| ≥ 5, libellés sans Δ ; gen8 a devant la
  parenthèse et graphique papier à une échelle ; gen55 « forme parabolique » réécrite, unités
  réalistes (cm / dm), espace fine des milliers, condition supplémentaire (sommet hors du domaine
  ≈ 40 % par famille), « coupée » accordé ; étiquette « c = −13 » du croquis d'allure de gen7.

## 6e (6h), Chapitre 2 — lots B, C, E de l'audit (générateurs 6gen6–6gen12)

Lot B : `?code=` lu par les 7 applis, saisie illisible sans tentative (message par nature de champ),
choix fermés à 1 tentative, aides à deux niveaux en KaTeX, messages ciblés (ln a oublié ou doublé,
côté opposé, reste / complément, ordre T − t…), placeholders sans notation clavier. Lot C : 6gen6 G
retirée (entrée `retiree` gardée pour les codes), écrans « forme » B / C ; écran « existence » de
6gen9 / 6gen10 ; 6gen9 C en puissances exactes de 2, 3, 5 ; 6gen7 E sans fonction constante ; 6gen8 A
cadré sur l'extremum de f′ ; 6gen10 D-variable compacté (exposant −x−2, produit sans `\cdot` : il
débordait de 51 px à 390 px) ; 6gen12 contextes réécrits (`contextes.ts` : bornes par contexte,
objectif de G, question explicite du doublement), phrases de contexte en fragments KaTeX (`prose`),
espace fine des milliers (`formatDecimal`, `milliers`). Lot E : voir `feuilles-evaluations.md`.

## 5e (4h), Chapitre 1 — lots A (cours) et E (quiz 5gen39) de l'audit complet

Lot A (`fonctions-composees.ts`, `evaluationPayload.ts`) : astuce « racine au dénominateur » qui
contredisait l'exemple (poser les deux conditions, puis leur intersection donne « > 0 ») ; « une
seule valeur retirée » → « des valeurs isolées (les zéros du dénominateur) » (attention, formulaire,
compréhension « domaine » n° 2) ; application « pipe » : `grep "erreur" fichier.txt | wc -l`, deux
étages h = u∘v, guillemets français au lieu des accents graves (non lus par `RichText`) ;
historique : Brahmagupta pose 0 ÷ 0 = 0 et laisse n ÷ 0 en fraction, Bhāskara II dit n ÷ 0 infini ;
« C_f » des tags → « la courbe de f », `$C_f$` dans la légende ; 8 majuscules d'insistance ; étage
oublié (wrongRight + attention cohérents) ; 3 descriptions de carte (aucune CE, 5gen2 « même type »,
5gen4 « domaine de la seconde fonction ») ; corrigé de compréhension « graphique » n° 2 : « n'existe
pas » (hors domaine) distinct de « pas lisible » (hors portion tracée). 3 démonstrations
(`exempleLibre`, énoncés par clé) : racine au dénominateur ⟺ radicande > 0 (§ 1), composée de deux
affines (pente mm′, ordonnée à l'origine mp′ + p = f(p′), § 2), bidon fermé optimal h = 2r (§ 5).
**Bidon sans dérivée** : les dérivées n'arrivent qu'au ch. 5 de 5e, et 5gen5 A1 ne les utilise pas ;
preuve par le signe de A(r) − A(r₀) = 2π(r − r₀)²(r + 2r₀)/r avec V = 2πr₀³ (factorisation d'un
trinôme de racine connue, signe d'un produit — acquis de 4e). La clé d'énoncé de l'exemple « racine
au dénominateur » est devenue le badge complet (sinon ambiguë avec la démonstration). Formulaire :
signe d'un quotient et d'un trinôme, Im f, fonctions de référence admises (5gen2), composée de deux
affines, A(r) = 2πr² + 2V/r, formes de coût unitaire (deux relevés), coût fixe / variable.
2 figures : droite graduée de dom(N/√u) (3 exclu), c(x) = 6 + 200/x avec ses deux relevés et
l'asymptote y = 6. Tableau de signes du § 1 : défilait à 390 px (391 / 316) ; ligne « quotient »
(au lieu de « (x − 1)/(x + 2) », déjà dans la légende) et `table.tableau td` resserré sous 480 px
(`index.css`, padding 8px 6px, tous les tableaux de signes du site) : 0 défilement. Milliers du
bidon et du seuil avec `\,`, « 1000/(πr²) » en KaTeX.

Lot E (`quizFonctions5e`) : 8 thèmes de 35 (280), +15 par thème et thème nouveau
`domaineComposee` (« Domaine d'une composée — double condition et image », § 3, libellés
« Expressions » / « Domaine d'une composée » dans `QUIZ_THEMES`) ; 18 V / 17 F par thème
(17 / 18 pour le nouveau). Corrigées : « N/D ≥ 0 garantit D ≠ 0 » (logiquement vraie) remplacée par
« sans exclure les zéros de D » (FAUX) ; « +10 € par objet » précisée « avec un coût total affine » ;
milliers avec `\,`. `nombreQuestions` / `etendueNombreQuestions` (accueil calculé, plus « 7 thèmes,
20 affirmations »). Contrôle : script d'échantillonnage (98 vérifications numériques : domaines,
images, composées en un point, identité du bidon), typographie hors `$` et équilibre — 0 erreur.
## 6e (6h), Chapitre 1 — 8 ateliers de l'audit et remise à niveau des 3 existants

Conventions « 14 widgets », « couleurs », « tableaux tronqués » dès la première passe. Huit
ateliers (blocs `atelier` seuls dans le chapitre) :
- **`droite-horizontale-widget`** (§ 1, après les deux figures du test) : horizontale y = k,
  intersections comptées sur la restriction choisie (x² − 2x, x³ − 3x, sin, x³/4 ; 2 à 5
  restrictions), verdict injective / bijective avec l'image, horizontale témoin ; points verts
  (≤ 1 intersection) ou rouges ; sin sur ℝ : « une infinité ».
- **`machine-reciproque-widget`** (§ 1, après l'exemple de la méthode 1) : aller de haut en bas,
  retour de bas en haut, même valeur sur chaque ligne ; x = 1 interdit pour 5/(x − 1) ;
  2√x − 3 (retour par le carré, y ≥ −3). Sans SVG (pas d'épinglage).
- **`pentes-inverses-widget`** (§ 1, après l'intuition « Pourquoi la pente s'inverse ») :
  tangentes en A(a ; b) et A′(b ; a), triangles de pente aux côtés échangés, produit 1, tangente
  verticale si f′(a) = 0 (x², x³, sin) ; repère orthonormé. Défaut a = 1,5 (a = 1 est sur y = x).
- **`arc-de-trig-widget`** (§ 2, après le piège « l'unique angle ») : θ = kπ/48 sur [−2π ; 2π],
  résultat EXACT en entiers (réduction modulo 2π puis symétrie), relation affichée (π − θ,
  2π − θ, θ − π…), tan θ inexistante, graphique en dents de scie.
- **`equation-ce-widget`** (§ 3, après l'exemple « la CE rejette ») : membres tracés seulement sur
  leur CE, bandes « CE gauche / droite », bande verte commune, candidats acceptés / rejetés,
  balayage de x ; 4 équations (cours, arccos du cours, arctan sans CE, CE vide).
- **`transformees-arc-widget`** (§ 5, après les trois graphes de référence) : c + k·arc(mx + n),
  domaine et image exacts (fractions, c ± aπ) ; fenêtre fixe −6,5 à 6,5 × −8,6 à 8,6
  (|c| + |k|π ≤ 2 + 2π). **Piège** : aux bornes du domaine, mx + n vaut 1,0000000002 → NaN dans
  le `d` du chemin ; argument borné à [−1 ; 1].
- **`angle-de-vue-widget`** (après l'application de l'écran) : scène à l'échelle et θ(x) en
  degrés, maximum √(ab), vert tant que θ′ > 0, θ → 0 près du mur ; fenêtre 0–90° (θ* ≤ 65,4°).
- **`refraction-widget`** (après l'application de la réfraction) : θ₂ = arcsin(n₁ sin θ₁ / n₂),
  angle limite arcsin(n₂ / n₁), réflexion totale (air, eau, verre, diamant).
Remise à niveau de `reciproque-miroir-widget`, `cyclometrique-miroir-widget`,
`cyclometrique-tangente-widget` (comportement inchangé) : graduations et quadrillage, légende en
HTML sous la figure (fractions, radicaux), (arcsin x)′ en fraction au lieu du monospace
« arcsin'(x) = 1 / √(1−x²) », libellés sans monospace, cibles de 44 px. Dans tous ces ateliers,
les étiquettes de graduation sont ramenées au premier plan après les courbes. **Pièges** : une
formule longue dans un `.fm` (`white-space: nowrap`) déborde à 390 px — la couper en deux blocs
(θ(x) de l'angle de vue, CE vide de l'équation) ; graduation 3 et π superposées (garder π).
Vérifié (Vite, page réelle, iPhone 13 et 1 280 px, clair et sombre) : 0 erreur console,
scrollWidth 390, 0 `$` / `.katex-error`, Shadow DOM sans `^ $ NaN Infinity undefined`, 0
étiquette rognée, 0 débordement, axes identiques après chaque curseur (bornes comprises),
`test-epingle` 0 échec ; valeurs recoupées à la main ; `tsc`, `oxlint`, `npm run build` propres.
Captures : `scratchpad/ateliers-6e1/`. Machine saturée par d'autres agents : manipulations faites
en partie sur un banc d'essai léger (`harness/index.html`, mêmes fichiers et `index.css`).
## 5e (4h), Chapitre 1 — lot G de l'audit (5gen61–5gen63, nouveaux générateurs)

Trois cartes ajoutées sans toucher au reste du cours (un autre chantier crée 5gen58–60). **5gen61
« Composer des polynômes »** (§ 3, après 5gen3) : f et g affines, ou une affine et une du second degré
(exemple du cours x² + 1 ∘ 2x − 3) ; f(g(x)), (f∘g)(x) et (g∘f)(x) développées et réduites,
vérification en un point, verdict f∘g = g∘f pour deux affines. **5gen62 « Domaine d'une composée par
l'image »** (§ 3, après 5gen61) : g ∈ {x² + k, −x² + k, |x| + k, mx + p, √x + k, 1/x + k}, f ∈ {√(x − c),
√(c − x), 1/(x − c), 1/√(x − c), 1/√(c − x)} ; Im g, dom f, Im g ∩ dom f, dom(f∘g) ; domaine vide en cas
particulier (décision de l'utilisateur). **5gen63 « Composée sur un seul repère (droite y = x) »**
(§ 4, après 5gen4) : Cf, Cg et y = x sur la même grille, report par la diagonale (astuce du § 4),
variantes (f∘g)(a), (g∘f)(a), (f∘f)(a). Socle d'écrans du 5e ch. 2 étendu (options additives, voir
`feuilles-evaluations.md`). Vérifié : 2 000 tirages par variante (réponses recalculées à part —
composées évaluées en 7 points, domaines par échantillonnage de f(g(x)) sur la grille n/60, lectures
sur les sommets des courbes ; saisies justes autrement écrites, « − – — », illisible, formes à
reprendre, pièges) : 0 anomalie ; parcours iPhone 13 des trois applis (bonnes réponses, erreurs
ciblées, aides à deux niveaux, domaine vide, composée qui existe) : scrollWidth 390, 0 erreur
console, `?code=` identique ; captures dans le dossier de travail `5gen61-63`.
## 6e (6h), Chapitre 1 — lot G de l'audit (générateurs 6gen152–6gen155, nouveaux)

Quatre cartes `entrainement` ajoutées, chacune à l'endroit où sa notion est enseignée : **6gen155
« Dérivée d'une réciproque en un point »** et **6gen154 « Graphe de la réciproque »** (fin du § 1,
après 6gen1 — répond aussi à C6 : le cours annonçait une dérivée au point voulu que 6gen1 n'a pas) ;
**6gen153 « Identités trig∘arc et arc∘trig »** (fin du § 2, après 6gen2 ; identités enseignées par le
lot A, décision 1) ; **6gen152 « Détective d'erreurs : réciproques et arcfonctions »** (fin du § 5,
après 6gen5). Pilote d'évaluation : 6gen154/155 dans `reciproques`, 6gen153 dans `cyclometriques`
(processus 2), 6gen152 dans `graphiques` (processus 3). Décisions appliquées : « ∅ / existe ou non /
lequel » = verdict (θ dans l'image, signe, domaine, f′(x₀) = 0, graphe, type d'erreur), jamais un cas
particulier ; aides à deux niveaux sans la réponse ; choix fermés à une tentative. Vérifié : 2 000
tirages par variante, parcours iPhone 13 (390 px, 0 erreur console), page du chapitre (4 liens, 390 et
1 280 px, 0 erreur), documents réels sans débordement, collecteur 0 égalité fausse.
## 6e (6h), Chapitre 1 — lots A et F de l'audit (cours, quiz 6gen64)

Lot A (cours) : C1 (angle de vue : trop près, angle presque nul ; exemple résolu θ′ = 0 en x = √(ab)),
C2 (arcsin impaire, arccos(−x), arcsin + arccos réécrites par la caractérisation : « sin y = x **et**
y dans l'image », la condition de l'intervalle vérifiée en ligne), C3 (f⁻¹ = f quand a = −d ou f = id,
ad − bc ≠ 0), C4 (théorème : continue et strictement monotone sur un intervalle), C5 (incidence
normale ; angle limite eau → air ≈ 48,8°, réflexion totale = CE de arcsin), C6 (carte 6gen1 sans
dérivée). Décisions 1 et 2 : § 2 « Composer une arcfonction et une fonction trigonométrique »
(trig∘arc toujours, arc∘trig seulement sur l'image ; démonstrations arcsin(sin θ) = θ ⟺ θ ∈
[−π/2 ; π/2], cos(arcsin x), cos(arctan x) ; méthode ; figure `circleAngles` 5π/6 / π/6) et tableaux
VERTICAUX des valeurs remarquables ; § 3 arctan injective sans CE, « arcfonction = angle » (∅ si
l'angle sort de l'image), « arcfonctions différentes » (compatibilité des images, mise au carré,
arcsin(4x) = arccos(3x) : −1/5 dans la CE mais parasite ; arctan(x) = arcsin(x/√2) : sin injective sur
[−π/2 ; π/2], équivalence) ; § 4 méthode de dérivation, domaine ]0 ; 1[, arctan x + arctan(1/x) = π/2
(x > 0) ; § 5 caractéristiques, figure unique des trois arcfonctions, méthode c + k·arc(mx + n)
(domaine, image, sens selon k·m, extremums, centre (−n/m ; c), jamais paire), deux exemples sur
grille en π/2 (g(x) = π/2 − 2 arctan(x + 1) passe par l'origine sans être impaire) ; nouveau § 6
« Étudier une fonction cyclométrique » (arctan x − x/2 ; x·arctan x avec asymptotes obliques).
§ 1 : méthode « étudier la réciproque », trinôme restreint (2 + √(x + 3)), (f⁻¹)′(2) pour x³ + x avec
figure des tangentes 4 et 1/4 (réciproque par dichotomie). Formulaire : 8 groupes, 46 formules, ordre
des sections. Énoncés par clé (arccos′ : même énoncé pour ses deux démonstrations), chapitre dans
`CHAPITRES_ENONCES_VERIFIES`. Tableaux à 2 colonnes sur iPhone (restrictions, caractéristiques,
récapitulatif) ; tableau de variations de g sur [0 ; +∞[ (fonction impaire). **Ajouts de composant
(optionnels, sans effet ailleurs)** : `curvePlot.grid` (lignes aux graduations, y compris en π/2) et
`obliqueAsymptotes[].from/to` (une asymptote en +∞ ne traverse plus tout le graphe ni ne sort du
cadre). **Piège** : `tone: 'faint'` d'un `vectorPlane` est aussi foncé qu'un axe — y = x en vecteur
pointillé.

Lot F (quiz 6gen64, porté de plateforme-maths) : 175 affirmations réécrites en `$…$` (texte source
`banque64.txt`, séparateur « ¦ », généré en `q(…)`), majuscules retirées, 4 grands calculs remplacés,
homographique complétée ; deux thèmes ajoutés (`compositionsArcTrig` § 2, `etudeFonctionCyclometrique`
§ 6), équations « = angle » / arcfonctions différentes et transformées intégrées : 245 affirmations,
7 × 35, 18–19 vraies. Appli, moteur, composants calqués sur 6gen65 ; registre, carte de fin de
chapitre, `QUIZ_THEMES` (deux thèmes en § 2, un en § 6), `banquesVraiFaux` (le vrai/faux du ch. 1 ne
part plus sur plateforme-maths). Vérifié : contrôle de la banque (KaTeX `strict: 'error'`,
notation clavier, majuscules hors « CE », doublons, équilibre, sessions sans répétition, fragments
papier sans `$`) 0 problème ; quiz parcouru sur iPhone 13 (thème 3 en entier : 35/35 distinctes,
« Question 35 / 35 », 19 « Vrai » = 19 vraies ; 3 affirmations des autres thèmes ; sombre) ; page en
clair/sombre, iPhone 13 et 1 280 px : scrollWidth 390, 0 `$`, 0 `.katex-error`, 0 NaN, 0 tableau qui
déborde ; évaluation locale 2 séries : « Vrai ou faux » présent (6 affirmations du ch. 1).
**Piège de vérification** : machine chargée (plusieurs `tsc` en parallèle) → `tsc` tué (OOM) ou
`locator.click` hors délai ; relancer avec `NODE_OPTIONS=--max-old-space-size=3072` et des délais
Playwright longs (`setDefaultTimeout`), en attendant chaque bouton (`waitFor`) plutôt qu'un délai fixe.
## 5e (4h), Chapitre 1 — lot F de l'audit (4 ateliers validés par l'utilisateur)

`projections-domaine-image-widget` (intro, juste après la figure x² − 2x) : 3 courbes par nœuds
ENTIERS interpolés en cubique monotone (Fritsch–Carlson : pas de dépassement, extremums toujours
sur un nœud, donc bornes lues sur la grille), extrémités sur abscisses entières (glisser ou ◀ ▶),
pleines / creuses ; dom f et Im f projetés et écrits en intervalles ; une borne de l'image n'est
ouverte que si elle n'est atteinte qu'en une extrémité creuse (sinon « atteinte ailleurs : crochet
fermé »). `composer-en-un-point-widget` (§ 2, après la machine à composer) : 4 couples (√x et
4 − x², 1/x et x² − 4, √(x − 1) et 3 − x, 1/(x − 2) et √(x + 1)), ordre f∘g / g∘f, a de −5 à 5
par pas de 0,5 ; réponse « existe / n'existe pas » AVANT la valeur ; calcul EXACT (rationnels et
r + s√m, inverse rationalisé), raison écrite (radicande, dénominateur, ou première machine qui
refuse) ; sans score : essais reportés sur une droite, domaine affichable. `commutent-affines-widget`
(§ 2, après l'exemple « f∘g et g∘f en expressions ») : a, c ∈ [−3 ; 3], b, d ∈ [−4 ; 4] entiers,
substitution écrite, droites parallèles de pente ac, confondues ⟺ ad + b = cb + d ; préréglages
translations, linéaires, même point fixe. `image-inter-domaine-widget` (§ 3, après l'atelier de
la double condition) : 8 intérieures × 7 extérieures, ensembles EXACTS (unions d'intervalles,
image réciproque écrite fonction par fonction), règle des valeurs (Im g, dom f, zone commune) et
règle des x (dom g, dom(f∘g)) ; cas vide (−x² et √(x − 1)) et un seul point (−x² et √x) commentés.
**KaTeX dans un Shadow DOM** : module partagé `src/interactive/katex-shadow.js` (premier usage
dans les ateliers) — `katex.min.css?inline` recopié dans chaque racine (sans les @font-face,
déjà déclarés par le document), `tex()`, `texEgalites()` (un morceau KaTeX par membre : sur
téléphone la ligne se coupe entre deux « = », jamais au milieu d'une formule), `CSS_BASE`
(boutons ≥ 44 px, panneaux alignés à gauche : le cadre d'atelier centre le texte). **Piège** : la
`caption` d'un bloc `atelier` est rendue en texte BRUT (pas de `RichText`) — `$…$` et `**…**`
s'y affichaient tels quels ; Unicode seulement. **Faux débordement** : les `<svg>` internes de
KaTeX (`\sqrt`, fractions, largeur 400em rognée) dépassent l'hôte au `getBoundingClientRect` —
les exclure (`closest('.katex')`) des contrôles de débordement. **Piège** : une grille de réglages
à deux colonnes posée par `@media (min-width…)` suit l'ÉCRAN, pas l'atelier (560 px de large à
1 280 px) : les curseurs débordaient — `repeat(auto-fit, minmax(min(100%, 260px), 1fr))`.
Vérifié (Vite, iPhone 13 et 1 280 px, clair et sombre) : 0 erreur console venant du site (seules
les vidéos YouTube signalent parfois « compute-pressure »), scrollWidth = largeur, 0 `$`, 0
`.katex-error`, Shadow DOM sans `^ $ \ NaN undefined Infinity`, 0 débordement interne, contrôles
≥ 44 px ; balayage complet : 660 réglages de courbe (image recalculée sur la polyligne tracée),
168 essais « en un point » confrontés au domaine attendu (54 « n'existe pas »), 1 323 réglages
affines (101 confondus, verdict ⟺ ad + b = cb + d), 56 couples image ∩ domaine confrontés à
1 201 x échantillonnés ; glisser à la souris ; `test-epingle` 0 échec. Captures :
`scratchpad/5e1-ateliers/`.

## 5e (4h), Chapitre 4 — passe contenu, démonstrations, ateliers et quiz (rapport de propositions)

Décisions de l'utilisateur : tout le rapport (15 erreurs, 9 contenus, 4 démonstrations, Michaelis–Menten,
quiz 9 × 35, 7 ateliers + remise à niveau des 3). Le cours des NOUVEAUX générateurs (position courbe /
asymptote, tableau de limites → esquisse, retrouver f) viendra après leur fusion ; cartes `entrainement`
des sections et 5gen20–24 intouchées (deux autres chantiers) — seule exception : la description de la
carte du quiz 5gen42 (récapitulatif), qui annonçait « 7 thèmes de 20 ».

**Erreurs corrigées** : `\,` simple dans une chaîne JS (« (1,;2) », « (1,;1) ») → `\\,` ; « ℝ\{1} » hors
KaTeX → `$\mathbb{R}\setminus\{1\}$` ; renvoi « chapitre précédent » → « chapitre 1 (fonctions) » ;
tableaux d'opérations complétés (m + (±∞), (−∞)·(−∞), m/(±∞) = 0, produit « règle des signes ») ;
exemple du saut : limite à gauche calculée, conclusion « 5 ≠ −1 », points d'approche verts / rouges
(points sans étiquette) ; g = 1/((x+1)(x−2)) tracée jusqu'à ∓0,03 des asymptotes (elle sort enfin du
cadre) ; figure ∞/∞ à partir de y = −0,8 (la courbe passe sous l'axe) ; `v_{max}` ; Cᵤ « = » (valeurs
exactes) ; renvois « ici » de l'attention et de l'astuce du § 4 nommés ; signe en x = 1 de l'étude
complète par le signe du dénominateur + **tableau de signes** (`signTable`, −1, 1, 3), la sonde en
vérification ; intuition ∞ − ∞ « un nombre (parfois 0), ±∞ ou aucune limite » ; étiquettes déplacées
(chevauchements relus sur capture : vraie AV, point vide, g, étude complète, point vide de C5).
**Piège de figure** : l'étiquette d'une asymptote (`label`) se pose toujours au même endroit ; quand la
courbe ou l'étiquette d'axe la chevauche, la retirer et écrire un `textLabels` à un endroit libre.

**Contenu** : racine double (x+2)/(x−1)² comparée à (x+2)/(x−1) (§ 1, figure à deux courbes) ; « terme
dominant — trois autres cas » ; 0/0 avec racine (√x − 2)/(x − 4) = 1/4 ; ∞ − ∞ de limite 2
(√(x² + 4x) − x, figure) ; intuition « Pourquoi seul le terme dominant compte » (85,5 % / 99,83 % /
99,9998 % ; 6e intuition, le plafond) ; asymptote oblique à dénominateur de degré 2
(2x³ + x² − 1)/(x² + 1) = 2x + 1 + (−2x − 2)/(x² + 1), recoupement (−1 ; −1) (§ 2) ; étude complète avec
point vide (1 ; −2) ET asymptote verticale x = 2, AH y = 1 jamais recoupée (§ 5) ; figure de
g = 2x + 1 + 1/(x + 1) en `illustrationGroup` avec celle de 3 + 1/(x − 2). **Michaelis–Menten** remplace
le modèle exponentiel du § 5 : v(S) = v_max·S/(K + S), AH v = v_max, division euclidienne
v_max − v_max·K/(K + S) (forme b + a/(x + p), a < 0), v(K) = v_max/2 (figure avec le point v(K) = 5).

**Démonstrations** (`exempleLibre` « Démonstration — … », énoncés par clé dans `ENONCES_DEMONSTRATION`,
chapitre déjà dans `CHAPITRES_ENONCES_VERIFIES`) : degrés égaux ⟹ rapport des coefficients dominants
(§ 1) ; f = ax + b + r(x), r → 0 ⟹ lim f/x = a et lim (f − ax) = b (§ 2) ; une rationnelle a la même
limite finie en −∞ et en +∞ (§ 3, justifie « jamais deux AH différentes ») ; b + a/(x + p), a > 0,
p > 0 : décroissante sur [0 ; +∞[ et jamais égale à b (§ 4, par l'inverse décroissant de 4e, sans
dérivée). Les nouveaux exemples ont tous leur énoncé (clés « racine double au dénominateur », « terme
dominant — trois autres cas », « forme 0/0 avec une racine », « forme ∞−∞ avec une limite non nulle »,
« dénominateur de degré 2 », « un point vide et une asymptote verticale »). **Piège de clé** :
l'appariement cherche la clé DANS le badge (`includes`) ; un nouveau badge ne doit contenir aucune clé
existante de sa section (« recoupement », « vraie asymptote verticale »…).

**Quiz 5gen42** : 9 thèmes × 35 = 315 (+15 par thème, `operationsEtFormes` et `gaucheDroiteExistence`
nouveaux, rattachés au § 1 dans `QUIZ_THEMES`, donc tirés par `banquesVraiFaux`) ; 18 V / 17 F (17 / 18
pour « gauche, droite ») ; racine double : hypothèse « le numérateur ne s'annule pas en r » sur les deux
affirmations vraies (contre-exemple (x − 1)/(x − 1)²) ; `nombreQuestions` / `etendueNombreQuestions`,
accueil calculé (plus de `nombreExercices: 20`). Contrôle : 315 affirmations, KaTeX `strict: 'error'` sur
630 textes, 0 `$` impair, 0 notation clavier hors `$`, valeurs numériques recalculées.

**Ateliers** (KaTeX dans le Shadow DOM par `katex-shadow.js` ; module partagé du chapitre
`src/interactive/limites-commun.js` : repère à fenêtre FIXE et axes fléchés, `courbe` coupée aux
asymptotes et rognée par `clipPath`, `curseur` − / + ≥ 44 px, `choix`, `texGrand` / `texPetit` /
`texPoly`, `rel` = « = » si la valeur est exacte, « ≈ » sinon) — 7 nouveaux :
`aussi-pres-que-tu-veux-widget` (§ 1, après Cauchy : bandes ε / δ, point vide et saut, x = a exclu),
`infini-moins-infini-widget` (§ 1 : (x² ; x), (x + 3 ; x), (√(x² + 1) ; x), (x ; x²), tableau en 10 … 10⁶,
√(x² + 1) − x calculé par 1/(√(x² + 1) + x)), `terme-dominant-widget` (§ 1, avant ∞/∞ : x = 10^k, barres
0–100 %, |f − 3| = (5x + 5)/(x² + 2) sans soustraction), `zoom-arriere-asymptote-widget` (§ 2 : Z ×10, le
zoom est l'effet voulu), `cote-asymptote-widget` (§ 3 : k/(x − 1)ⁿ, sonde h de 1 à 0,001, signes en
direct), `cuve-eau-salee-widget` (§ 4 : plafond = c, t₉₀ = 9V₀/r), `recoupement-widget` (§ 5 :
(x² + px + q)/(x² + 1), x = (1 − q)/p, p = 0). Remis à niveau (réécrits en module ES, mêmes balises) :
`point-vide-ou-asymptote-widget` (limites à gauche / droite N(−3)/0∓, valeur du point vide, asymptote
oblique y = x − (r₁ + r₂ + 3)), `degre-asymptote-widget` (dénominateur x − 1 ou x² + 1, division
euclidienne exacte affichée, degrés 0 à 4), `plancher-plafond-widget` (mode plafond b + a/(x + p), a < 0 ;
une fenêtre par mode). **Piège** : un nombre arrondi par `texGrand` peut donner une mantisse « 10 »
(999 999·10⁶ écrit « 10·10¹¹ ») — renormaliser après arrondi. Vérifié (Vite `watch: null`, port 5895) :
page à 390 / 1 280 px, clair / sombre — 0 débordement, 0 `.katex-error`, 0 texte suspect (page ET Shadow
DOM : `$ ^ \ NaN undefined Infinity`), 0 erreur console du site, 33 figures et 10 ateliers capturés et
relus ; manipulation Playwright : chaque curseur à ses deux extrémités, chaque bouton, axes identiques
avant / après (sauf zoom et changement de mode, voulus), 20 valeurs recoupées par un calcul indépendant
(recoupement x = 1 et 2, t₉₀ = 180 et 1 800, C(40) = 20, N(−3) = 24 et y = x − 7, y = 2x + 1, côtés ±∞,
ε / δ, f(10⁶) ≈ 2,999995, Cᵤ(100) = 10,4…). Captures et scripts : `scratchpad/5e4/`.
## 5e (4h), Chapitre 4 — lot G de l'audit (5gen64–5gen67, nouveaux générateurs)

Quatre cartes ajoutées (descriptions en Unicode, sans `$…$`) sans toucher au reste du cours ni à
5gen20–24 (chantier parallèle des corrigés) : **5gen64 « Limites avec racines carrées : expression
conjuguée »** (§ 1, après 5gen20), **5gen66 « Du tableau de limites au graphique »** (§ 3, après
5gen22), **5gen65 « Retrouver une fonction à partir de ses asymptotes »** (§ 5, après 5gen24) et
**5gen67 « Détective d'erreurs — limites »** (§ 5, après 5gen65). Registres `registry.ts`,
`evaluationAdapterRegistry.ts` (`versionPapier`) et `evaluationPayload.ts` (sections limites-calcul
P2, lecture-graphique P1, etude-complete P2 et P3). Détail des choix, mesures et pièges :
`feuilles-evaluations.md`, entrée « 5e ch. 4, lot G ».

## 5e (4h), Chapitre 4 — lots B, C, D (règles communes 5gen20–24, famille « position » de 5gen21)

Cours complété, calqué sur les corrigés des générateurs, chaque fois méthode + exemple résolu placés
avant la carte correspondante : § 1 « racine en −∞ — √(x²) = |x| = −x » (avant 5gen64 ; les trois
exemples d'expression conjuguée existants suffisaient pour le reste) ; § 2 position de la courbe par
rapport à son asymptote (écart réduit, Δ < 0, `signTable`, recoupement (2 ; 3), côtés d'approche,
`curvePlot` + Attention « reste constant ») avant 5gen21, dont la carte cite la nouvelle famille ; § 3
d'un tableau de limites à une esquisse (asymptotes, bouts de branche, liaison ; f(x) = 2 + 1/(1 − x))
avant 5gen66 ; § 5 retrouver (ax + b)/(x + d) depuis ses asymptotes et un point, et le cas
ax + b + c/(x − p), avant 5gen65. Quatre énoncés soignés ajoutés par clé (`ENONCES_DEMONSTRATION`, build
strict). Détail : `feuilles-evaluations.md`, entrée « 5e ch. 4 (lots B, C, D) ».

## 4e, Chapitre 6 — Calcul vectoriel, lot H (nouveaux générateurs gen129, gen130)

Deux cartes : **gen129 « Vecteurs directeurs d'une droite »** (§ 15, après l'atelier
`vecteur-directeur-widget`, avant le rappel « vers le chapitre 7 » ; première carte du § 15, seul
générateur Connaître du chapitre) et **gen130 « Chasles sans figure : réduire et démontrer une égalité
vectorielle »** (§ 6, après la carte gen27). Cours du § 6 complété AVANT l'atelier `chasles-defi-widget`
(le cours ne traitait ni les coefficients, ni la démonstration d'une égalité, ni un point défini par une
égalité) : astuce « Des coefficients ? Regroupe d'abord » (2AB + 2BC − AC = AC), exemples « démontrer une
égalité vectorielle » (AB + CD = AD + CB, un seul membre transformé) et « un point défini par une
égalité » (2MA + MB = 0 ⟹ AM = ⅓AB), énoncés ajoutés par clé dans `ENONCES_DEMONSTRATION`. Le bloc « Pour
aller plus loin — le milieu par Chasles » n'est pas touché (lot F de l'audit). Registres `registry.ts`,
`evaluationAdapterRegistry.ts` (`versionPapier`), `evaluationPayload.ts` (gen129 `directeur`, processus 1 ;
gen130 `chasles`, processus 2 ; libellé de gen27 renseigné), `regroupementsPapier.ts` (gen130). Détail :
`feuilles-evaluations.md`, entrée « 4e ch. 6, lot H ».


## 4e, Chapitre 6 — Calcul vectoriel, lots A, E, F et G de l'audit (cours, quiz gen64, démonstrations, ateliers)

Lot A (cours) : § 18 sans « un thème par générateur » ; questions « Formule » relues avec
`deriveQuestionsFormules` (outil `formules.ts` du dossier de travail) — chaîne fermée séparée
(AB + BC + CA = 0), milieu rattaché au § 12 (la méthode écrit maintenant `\dfrac{x_A+x_B}{2}`, plus
« (x_A+x_B)/2 » : la PREMIÈRE section qui contient la formule telle quelle gagne), produit scalaire au
§ 14 (le piège du § 13 l'écrit `x_u x_v + y_u y_v`, sans `\cdot`, pour ne plus capter la formule),
opposé au § 10, vecteur directeur « de la droite y = mx + p » ; conditions du formulaire sans
parenthèses (elles sont imprimées entre parenthèses). Alignement : AB et AC, deux vecteurs de même
origine ; Hamilton : une des premières tentatives EN TROIS DIMENSIONS (Wessel, Argand, Bellavitis
avant lui dans le plan) ; majuscules d'insistance ; renvoi final « plus tard » ; convention du pas en
diagonale (une case dans chaque direction, √2) ; § 12 « AB = B − A » ; « Al-Kashi (loi des cosinus) »
partout (aussi `resultante-vecteurs-widget`). Formulaire complété (‖k·u‖, décomposition, quadrilatères
et quatrième sommet, viser, déviation obtuse, directions, traversée, équilibre) : 36 questions
« Formule », chacune dans la section qui l'enseigne. Récapitulatif : 3 puces.

Lot F : D6 relabellisé « Démonstration — le milieu par Chasles » ; D7 (coordonnées du milieu, § 12),
D8 (‖k·u‖, § 11), D9 ((1 ; m) dirige y = mx + p, § 15), D10 (jamais colinéaires et orthogonaux, § 14),
D11 (parallélogramme ⟺ diagonales de même milieu, § 12), énoncés par clé sans méthode. Figures :
pas en diagonale, traversée de la rivière (vitesses × 10), équilibre (forces au point + triangle
fermé, `illustrationGroup`), quatre natures de quadrilatère (`illustrationGroup` de 4, quadrillage) ;
domaines au rapport 320/300.

Lot E (quiz gen64) : banque réécrite en `$…$` (`TexteRiche` à l'écran, `banquesVraiFaux` sur papier ;
`ui/formatQuizCalculVectoriel.ts` supprimé), 420 affirmations, 12 × 35, 18 V / 17 F ; thèmes
`decomposerDemontrer`, `quadrilateresConstructions`, `vecteursContexte` ; catalogue dans l'ordre des
sections ; `QUIZ_THEMES` : libellés pour § 14 et § 17 (deux thèmes chacun), § 7 pour la décomposition.
Contrôle `check_banque.mjs` (KaTeX, notation clavier, majuscules, doublons, équilibre ; seule alerte :
« m/s ») ; parcours Playwright des 12 thèmes : 35 / 35 énoncés distincts, 0 `.katex-error`.

Lot G : cinq ateliers — `arrivee-moins-depart-widget` (§ 8, piège A − B = BA, même vecteur depuis P),
`carte-tresor-widget` (§ 11, rose des vents, parcourue n + m√2 contre ‖DA‖, retour), 
`longueur-direction-sens-widget` (§ 16, trois voyants + ligne du tableau en liste : un tableau à quatre
colonnes débordait à 308 px), `traversee-riviere-widget` (§ 17, curseurs c, v, θ ; « juste en face »
impossible si v ≤ c), `equilibre-forces-widget` (§ 17, F₃ = −(F₁ + F₂), triangle fermé, piège
F₃ = F₁ + F₂). Fenêtres fixes, flèches d'axes, figure seule dans `.graphe-zone` (épinglage : 13 ok,
0 ko). Valeurs recoupées (script `ateliers.cjs` : 15 contrôles × 2 tailles × 2 thèmes, 60 / 60).

## 4e, Chapitre 6 — lots B, C, D de l'audit (gen20–29, points ouverts gen84, 87, 90, 91)

Aucun changement du cours (chapitre `calcul-vectoriel.ts` intact). Générateurs : règles communes des
anciens gen20–29 (illisible sans tentative, choix fermés à une tentative, aides à deux niveaux,
messages ciblés), défauts propres (gen22 « sans parenthèses », gen26 cible √N et « la ou les
valeurs », gen25 x en 1ʳᵉ ou 2ᵉ composante, gen28 figure et écran « égalité », gen84 « produit
scalaire » comme le cours, gen87, gen90, gen91), trois variantes ajoutées en fin de catalogue (gen20 « symétrique
d'un point », gen24 « paramètre au carré », gen26 « nature d'un triangle ») et tirage équilibré (gen91
ligne fausse tirée + `groupe_erreur`, gen29 Sud ≈ 30 %). Libellés du panneau gen24, 25, 26, 29.
Détail : `feuilles-evaluations.md`, entrée « 4e ch. 6 (lots B, C, D) ».

## 4e, Chapitre 6 — retouches gen28, gen29, gen83 (décisions de l'utilisateur, 21/11/2026)

gen28 : étiquettes placées en PIXELS réels (`ui/etiquettesComparaison.ts`, partagé écran / papier) —
près du milieu de leur vecteur, des deux côtés de la normale, écart borné, au-delà des extrémités en
dernier recours ; jamais sur un trait, une tête, une autre étiquette, hors cadre, ni plus proche d'un
autre vecteur (retour arrière, budget fixe). Écran : largeur réelle du graphe
(`VecteurGraph.onLargeurGraphe`, `components/FigureComparaison.tsx`) ; papier : fenêtre resserrée
autour des vecteurs et des étiquettes. Données et `?code=` inchangés. gen29 : aides à deux niveaux
sur « modélisation » (θ de l'énoncé, pas l'angle du triangle bout à bout) et « interprétation »
(Est / Ouest lu dans l'énoncé, Nord / Sud par la déviation comparée à 90°), sans suivi moteur.
gen83 « lecture » : titre papier « Composantes d'un vecteur » (`titrePapier`). Gen26 « paramètre »
laissé tel quel (décision). Détail et mesures : `feuilles-evaluations.md`, entrée « 4e ch. 6
(retouches) ».

## 4e, Chapitre 7 — Géométrie analytique plane, lots A, E, F et G de l'audit (cours, quiz gen65, démonstrations, ateliers)

Lot A (cours) : C2 « coefficients différents → ellipse » corrigé (hyperbole, parabole, aucun point :
les coniques en 6e ; libellé « Condition — même coefficient devant x² et y² ») ; C3 foyer-directrice
chez Pappus, pas Apollonius ; C4 distance à la directrice $|y + p/2|$. **Angle avec Oy défini**
(décision 3) : depuis le demi-axe positif de Oy, sens des aiguilles d'une montre, dans [0° ; 180°[
(= 90° − θ_Ox ramené), paragraphe + figure ($y = -x + 2$, 135° et 135°). `\text{dist}`, GPS raisonné
dans le plan (sphères, horloge), Pythagore « attribué à », piège « un seul point ≠ tangente » (droite
parallèle à l'axe d'une parabole, essentiel du § 10). Formulaire complété (milieu, G, aire, médiatrice,
hauteur, médiane, symétrique, CH comparé à r, r = CH, foyer et directrice, soustraction de deux cercles,
t₁ = t₂, a(m) = b(m) = 0 rejeté, (sin α ; cos α)) ; récapitulatif : 4 puces (paramètres et mobiles,
triangle/projeté/symétrique, cercle et droite, deux cercles).

Lot F : onze démonstrations tirables (`exempleLibre` « Démonstration — … », paragraphes seuls : le
corrigé n'en garde que les `para`) — D1 m·m′ = −1 (par le produit scalaire), D2 x² = 2py (p ≠ 0, valeur
absolue), D3 cercle par Pythagore (ex-`rappel`), D4 paramétrique depuis AM = t·u (ex-`rappel`), D5
(−b ; a) dirige ax + by + c = 0 (soustraction de deux points, critère de colinéarité), D6 médiatrice en
coordonnées, D7 deux parallèles ne diffèrent que par c, D8 tangente ⟂ rayon (Pythagore, point unique),
D9 coordonnées du symétrique, D10 soustraction de deux équations de cercles, D11 foyer de y = ax²
(ex-`rappel` « Lien avec le chapitre 1 »). Énoncés par clé, sans méthode (`ENONCES_DEMONSTRATION` ;
l'énoncé positionnel de la parabole devient une clé) — **piège des clés** : un label nouveau ne doit
contenir aucune clé existante de sa section (« deux cercles », « axe vertical », « tangente en un point
du cercle »…), d'où « soustraction de deux équations de cercles », « l'équation x² = 2py, sommet à
l'origine ». Figures : deux mobiles (K, t₁ = 2 ≠ t₂ = 3), hauteurs et orthocentre, projeté et
symétrique, réflexion (A′, I ; J plus long : $\sqrt{10} + \sqrt{20} \approx 7{,}63$, d'abord écrit 7,64 —
trouvé par l'atelier), cercle par trois points et ses médiatrices, deux cercles et x = 4, droite x = 2
et parabole x² = 4y. Exemples : « point et angle de 30° avec Oy » (§ 1, (1 ; √3)), « droite parallèle à
l'axe d'une parabole » (§ 10).

Lot E (quiz gen65) : banque passée en `$…$` par un convertisseur (jetons mathématiques → KaTeX,
coordonnées `(a\,;\,b)`, fractions, `\vec{AB}=`, variables isolées), puis 33 retouches à la main et
relecture (outil `restes.py` : notation clavier hors formule, « / » dans une formule) ; `TexteRiche` à
l'écran, `formatQuizGeometrieAnalytique.ts` supprimé. Q3–Q7 corrigés (ellipse, « p impair » remplacés,
« critère de colinéarité nul pour tester la colinéarité », « la valeur t = 1 donne le point … »,
perpendiculaire par le vecteur normal, majuscules). Quatre thèmes de 35 (18 V / 17 F) : `cercleConditions`,
`triangleProjete`, `parametresMobiles`, `lieuxDeuxCercles` ; 595 affirmations, 17 thèmes, catalogue dans
l'ordre des sections ; `QUIZ_THEMES` (libellés des sections relations, distance, cercle ;
`lieuxDeuxCercles` rattaché à `notion-lieu`) ; § 11 et carte : C1. Contrôles : `check_banque.mjs` 0
problème ; parcours Playwright des 17 thèmes : 35 / 35 énoncés distincts, 0 `.katex-error`.

Lot G : cinq ateliers sur un module partagé `geo-analytique-commun.js` (`window.GeoAnaCommun`,
importé avant l'atelier par chaque `register-*.js` ; repère à fenêtre fixe, axes fléchés, graduations
« − », coordonnées (x ; y) insécables, glisser) — `lieu-trace-widget` (§ 7, cinq règles, traces
vertes / rouges, « Révéler le lieu »), `deux-mobiles-widget` (§ 5), `reflexion-viser-widget` (§ 6),
`droites-remarquables-widget` (§ 6, équations entières, O, H, G en fractions « 8⁄3 »),
`deux-cercles-widget` (§ 10). Figure seule dans `.graphe-zone` : épinglage 12 / 12 ateliers du chapitre
sans problème (375×667, 390×664). Valeurs recoupées (`ateliers.cjs`, 28 contrôles × 2 tailles × 2
thèmes : 112 / 112).

## 4e, Chapitre 7 — lots B, C, D de l'audit (gen42–54) et banque « Formule »

Cours intact. Générateurs gen42–54 : règles communes (illisible sans tentative, choix fermés figés,
aides à deux niveaux, messages ciblés, `\,;\,`, graduations, tan⁻¹, rayon r), angles 30°/60°/120°/150°
dans les variantes « angle » de gen42 et gen46, gen54 pente indépendante du verdict + `groupe_points`,
deux variantes en fin de catalogue (gen50 « Est-ce un cercle ? », gen54 « droite parallèle à l'axe de la
parabole », droites y = k et x = k), verdicts hors de la `forme` (gen42, gen45, gen48), choix fermés
jugés affichés rouge ✗ / vert ✓, figures de gen47 (corrigé) et gen132 sans étiquette sur une graduation. Banque « Formule »
(`lib/questionsFormules/niveau4e.ts`) : douze questions (milieu, G, aire, droites remarquables,
symétrique, CH et r, foyer / directrice ×2, deux cercles, t₁ = t₂, a(m) = b(m) = 0, (sin α ; cos α)),
sections `intersection` et `lieux` ajoutées. Détail : `feuilles-evaluations.md`, entrée « 4e ch. 7
(lots B, C, D) ».

## 4e, Chapitre 8 — Géométrie dans l'espace, lots A, E, F et G du second audit (cours, quiz gen66, démonstrations, ateliers)

Lot A (cours) : C1 Monge (méthode tenue secrète par l'École du génie de Mézières, enseignée publiquement
en 1795 — pas Napoléon), C2 « fuyantes » au lieu de « toutes les parallèles d'un plan horizontal » (kicker
du § 11, synthèse, questions de compréhension), C3 lampe : ce sont les DROITES des ombres qui passent par
L₀ (essentiel, carte, rappel, légende de `ombre-soleil-lampe-widget`). Décision 4 : critère du § 7
« parallèle ou incluse », plans confondus au § 5. Décision 1 : étape 4 de « 4 faces traversées » par
points auxiliaires — les faces latérales ne donnent que des points déjà connus, on passe par le plan de
la base (I = (PQ)∩(AB), J = (QR)∩(BC), K = (IJ)∩(CD), puis (KR) donne S) ; énoncé par clé nommant le
pavé ABCDEFGH. Décision 3 : phrase de cours (Thalès) pour la taille apparente de l'atelier du § 10.
Cartes gen100 (§ 2) et gen101 (§ 5). Formulaire : « Deux plans, point de percée », « Justifier un
parallélisme », « Ombre à la lampe », compléments cavalière et perspective centrale ; synthèse
(+ cavalière, démontrer un parallélisme, lampe, croisement du dessin) et checklist (+ témoin, L₀).
Banque « Formule » : 7 questions (positions droite/plan, deux plans ×2, plan auxiliaire, théorème du toit,
Dürer, lampe). **Piège** : un `\alpha` écrit dans une chaîne Python NON brute devient `\x07lpha` (BEL)
— corrigé au lot E ; écrire `\\alpha` ou une chaîne brute.

Lot E (quiz gen66) : Q1 (trois plans « … ou confondues », et sa jumelle), Q2 bancal, Q3 fuyantes, Q4
diagonales de la façade, Q5 retirée, Q6 « parallèle à une droite du plan », majuscules d'insistance.
Couverture de gen100–107 en remplaçant des affirmations redondantes (toujours 7 × 35, 18 V / 17 F) :
thème `ombreSoleil` renommé « Ombres : soleil et lampe » (9 sur la lampe), témoin dans le plan, droite des
milieux, plans confondus, croisement du dessin, carrelage, poteaux, milieu d'une fuyante, objet de face,
fuyante mesurée à la règle, pied de la hauteur. Banque passée en `$…$` par un convertisseur (noms entre
parenthèses ou crochets, solides, points isolés, d, α, π, axes, degrés, cm), rendue par `TexteRiche`
(question, résultat, résumé). `evaluationPayload` : les 4 thèmes manquants déclarés (cavaliere,
deux-droites, parallelisme, point-de-fuite). Parcours Playwright des 7 thèmes : 35 / 35 énoncés
distincts, 0 `.katex-error` ; évaluation et feuille réelles (2 séries, 14 vrai/faux des 7 thèmes) :
0 `.katex-error`, 0 `$` visible.

Lot F : D1 critère droite ∥ plan (§ 7), D2 propriété 2 (§ 5), D3 trois plans (§ 6), D4 deux sommets par
face traversée (§ 9, argument de convexité), D5 ombres au soleil parallèles et D6 droites des ombres par
L₀ (§ 12), D7 milieu d'une fuyante et D8 point de fuite commun (§ 11), D9 (AB)/(CG) gauches rédigée
(ex-`exemple`, clé renommée), D10 théorème du toit (propriété au § 8, décision 2). Exemples « un point
commun et une direction » ((ABG) ∩ (DCF) : centre de ADHE + direction (AB)) et « section triangulaire »
(coin B, figure `solidCavaliere` avec sommets nommés). Énoncés par clé sans méthode, section
`point-de-fuite` ajoutée ; **piège des clés** évité : « intersection de deux plans » et « tétraèdre »
sont des clés existantes, aucun nouveau titre ne les contient.

Lot G : module partagé `espace-commun.js` (`window.EspaceCommun` : cube de côté 2, points nommés I milieu
de [AE], J de [BF], K de [FG], O, O′ ; calcul exact ; position de deux plans ; découpe ; localisation en
mots ; vue cavalière cadrée sur l'encombrement réel ou tournée au doigt ; styles du thème). Ateliers
`livre-plans-widget` (§ 2, pages fantômes, animation coupée si `prefers-reduced-motion`),
`deux-plans-cube-widget` (§ 5), `droite-temoin-widget` (§ 7), `plan-auxiliaire-widget` (§ 8) ;
`positions-cube-widget` réemployé au § 4. Contrôle `ateliers.cjs` (dossier de travail) : valeurs des
réglages du cours + tirages (≈ 850 paires de plans, ≈ 1 000 droites/plans, ≈ 370 percées) recoupés, 0
erreur, 390 px clair et sombre ; un premier passage a trouvé un faux « elle le perce » quand d est
parallèle à α sans témoin tracée par deux points nommés (corrigé). Page du chapitre (iPhone 13 et 1 280,
clair et sombre, 14 vues, 12 ateliers ouverts dans leur panneau) : scrollWidth = largeur, 0
`.katex-error`, 0 `$`/astérisque isolé, 0 « déterminant »/radian, 0 erreur console.

## 4e, Chapitre 8 — lots B, C, D du second audit (gen39–41, points ouverts gen101, gen103, gen107)

Cours intact (seule la variante « triangle » de gen40 s'ajoute ; l'exemple « section triangulaire » du
§ 9 existait déjà). Choix fermés de gen39 (position, justification « parallèle » / « sécante » : 1
tentative), gen40 (faces) et gen41 (rayons, points) jugés rouge ✗ / vert ✓ avec un message propre au
choix ; gen39 : aides à deux niveaux sur la justification, plus de leurre vrai (segment dont la percée
est une extrémité), « parallèle à (AC), une droite du plan » partout ; gen40 : variante « triangle » (sommet
visible, aucun côté en pointillés) en fin de catalogue, noms « ABCDEFGH », « ABCDEF (bases ABC et DEF) » ; gen41 : obstacles nommés K, L, M
sur la figure dès qu'il y en a deux, étiquettes des pieds du corrigé dégagées ; gen101 : parallélismes
toujours prouvables ; gen103 minuscules, gen107 aide 2. Tirage : `groupe_position` (gen39), cas
particulier « triangle » (gen40). Détail : `feuilles-evaluations.md`, entrée « 4e ch. 8 (lots B, C, D) ».

## 4e, chapitres 1–5, 7, 8 — champs du parcours (décision de l'utilisateur, 21/11/2026)

`titreCourt`, `partie`, `essentiel`, `cartes` remplis pour les 7 autres chapitres de 4e sur le modèle
du pilote `calcul-vectoriel.ts` (blocs du cours inchangés). Parties : ch. 1 « La parabole : la lire,
la transformer » 1–2 / « S'en servir, puis réviser » 3–4 ; ch. 2 « Résoudre, puis étudier un signe »
1–3 / « Quand x est au dénominateur » 4–6 / « En contexte, puis réviser » 7–8 ; ch. 3 « Lire et
étudier une fonction » 1–2 / « Transformer, puis réviser » 3–4 ; ch. 4 « Organiser et représenter les
données » 1–2 / « Moyenne, médiane, quartiles » 3–5 / « Mesurer la dispersion » 6–7 / « Comparer,
puis réviser » 8–9 ; ch. 5 « Le cercle trigonométrique » 1–5 / « Les triangles quelconques » 6–8 ;
ch. 7 « Écrire, lire et tracer une droite » 1–3 / « Deux droites : position et distance » 4–6 / « Lieux
géométriques : cercle et parabole » 7–11 ; ch. 8 « Dessiner l'espace, positionner droites et plans »
1–7 / « Constructions sur un solide » 8–9 / « Perspective centrale et ombres » 10–13. 57 sections, 57
essentiels (141 phrases), 195 cartes ; révisions : essentiel = le quiz, cartes « détective » tirées des
erreurs que la section liste (aucune au ch. 5, sans liste). Piège trouvé au rendu iPhone 13 : une
formule longue d'un seul tenant (formule unifiée des 8 paramètres, égalité à deux membres) déborde de
l'encadré et de la fiche — la couper en deux `$…$` (« g(u), avec u = … »). Vérifié : KaTeX strict sur
tous les champs (0 erreur), étapes / fiche / 195 cartes retournées sans débordement, 0 erreur console,
texte `pdftotext` des 7 PDF A4 identique avant / après.

## 5e ch. 1–4 et 6e ch. 1–5 — champs du parcours (décision de l'utilisateur, 22/11/2026)

`titreCourt`, `partie`, `essentiel`, `cartes` remplis pour les 9 chapitres « complets » (pas 5e ch. 5,
pas 6e ch. 6–10), sur le modèle de la 4e (blocs du cours inchangés, notations reprises de chaque cours :
`\lim\limits_{x \to a}`, dom($f^{-1}$), log décimal, radians). Parties : 5e ch. 1 « Le domaine, puis
composer » 1–3 / « Sur un graphique, en contexte » 4–5 ; ch. 2 « Arcs, secteurs et aires » 1–3 / « Les
fonctions sinusoïdales » 4–6 / « Équations et modélisation » 7–8 ; ch. 3 « Deux familles de suites » 1–2
/ « Limites et problèmes classiques » 3–4 / « Comparer et prévoir le long terme » 5–6 ; ch. 4 « Calculer
limites et asymptotes » 1–2 / « Lire, interpréter, étudier » 3–5 ; 6e ch. 1 « Réciproques et
arcfonctions » 1–2 / « Équations et dérivées » 3–4 / « Graphes et études » 5–6 ; ch. 2 « Limites et
dérivée » 1–3 / « Équations et inéquations » 4–5 / « Étudier et modéliser » 6–7 ; ch. 3 « Propriétés,
équations, inéquations » 1–3 / « Dérivée, limites, paramètres » 4–6 / « Étudier, puis appliquer » 7–10 ;
ch. 4 « Les primitives » 1–2 / « Intégrale définie et aires » 3–4 / « Volumes, longueurs, problèmes »
5–7 ; ch. 5 « Calculer dans ℂ » 1–3 / « Module, argument, puissances » 4–6 / « Géométrie avec les
complexes » 7–9. 63 sections, 63 essentiels (185 phrases), 248 cartes (réponses recalculées). Même piège
qu'en 4e au rendu iPhone 13 : la carte « 1 = √((−1)(−1)) = … = −1 » débordait — réduite à la seule
ligne fautive. Vérifié : KaTeX strict (0 erreur), étapes / fiche / 248 cartes sans débordement, 0 erreur
console, `pdftotext` des 9 PDF A4 identique avant / après.

## Synthèses en KaTeX — les 23 chapitres (décision de l'utilisateur, 22/11/2026)

« Ce qu'il faut retenir » (`recap`) entièrement en KaTeX (règle : `content-authoring.md`, « Synthèses en
KaTeX »). Trouvé au départ : 6e ch. 3, tableau en notation clavier dans une police monospace
(« ln(ab)=ln(a)+ln(b) », « 1/x (et (ln|x|)′ = 1/x pour x ≠ 0) », « ]0;+∞[ ») et checklist
(« ln(x²) = 2 ln|x| »). Rendu : `FeatureTable synthese` (en-têtes par `RichText`, police de lecture) ;
items, cellules, checklist et `forward` passaient déjà par `RichText`. Contenu : 211 champs réécrits
(4e : 64, 5e : 42, 6e : 105 ; de 1 champ en 4e ch. 8 à 16 en 4e ch. 5), seuls les champs de `recap`
touchés (diff limité aux littéraux modifiés). Vérifié : KaTeX `strict: 'error'` sur les 477 champs
RichText des synthèses (0 erreur, 0 `$$`, 0 `$` orphelin, 0 `*` simple, 0 `^`/`sqrt`/`a/b`/`<=`/`>=`/`!=`/`->`
hors `$…$`) ; onglet Réviser des 23 chapitres (build de production, iPhone 13 et 1 280 px) : 0 erreur
console, 0 débordement de page ou de synthèse, 0 barre de défilement visible (seule formule plus large
que l'écran du téléphone : la formule unifiée des 8 paramètres, 4e ch. 3, qui défile dans son cadre) ;
PDF A4 de 3 chapitres : même nombre de pages, texte `pdftotext` hors synthèse identique (mêmes
caractères ; dans le formulaire, seul l'ordre d'extraction des fractions KaTeX bouge, le formulaire
étant décalé verticalement) ; export HTML (6e ch. 3) : synthèse sans `$` littéral, 25 formules KaTeX.
Notation clavier repérée ailleurs dans le cours (pas corrigée) : fractions « a/b » dans des légendes,
cellules et textes (« (x−2)/(x+1) », « √3/2 », « 0/0, ∞/∞ », « 3 + 10/71 < π »), « ^ » dans des
étiquettes de figure (6e ch. 3 « y=2^x », 6e ch. 2 « 2^√3 » en description, 6e ch. 5 « e^(iπ/3) » en
légende), « x* = (a − 10)/4 » (5e ch. 5, légende d'atelier), « Rm = Cm = 30 € » hors `$…$` (5e ch. 5).

## Notation clavier hors synthèses — les 23 chapitres (décision de l'utilisateur, 22/11/2026)

Corrigée dans tout le cours (463 chaînes, 21 chapitres ; 223 RichText → KaTeX, 240 brutes → Unicode : fraction
`⁄` U+2044 pour un quotient simple « 3⁄5 », « π⁄2 », barre entre espaces fines insécables U+202F pour un quotient
composé « (x − 2) / (x + 1) », exposants Unicode « 2ˣ », « e⁻ᵏˣ » ; seule exception, la description de 6gen146 :
« 2 exposant √3 », aucun exposant Unicode pour √) — tableaux entiers passés en KaTeX quand une cellule l'était.
Restent, voulues : « ou » entre mots/sigles (vrai/faux, EV/CV…, f′/f″, sin/cos), numéros de parties de vidéo
« (1/2) », unités (g/L, rad/s, tr/min…), notes « 13/20 », sources. Badges/labels modifiés ⇒ clés de
`ENONCES_DEMONSTRATION` (`evaluationPayload.ts`) mises à jour (24) : le build échoue sinon. Vérifié : KaTeX strict
(0 erreur nouvelle), 0 `$` en champ brut, 148 étapes iPhone 13 sans débordement, 0 `.katex-error`, PDF de 3 chapitres.

## 6e (6h), Chapitre 7 — lots B et C de l'audit (générateurs 6gen43–6gen48)

Lot B (socle commun, détail dans `feuilles-evaluations.md`, « 6e ch. 7 (lots B et C) ») : les six
moteurs, les sept écrans et les six récapitulatifs d'origine sont remplacés par `sessionCombinatoire`,
`EcranCombinatoire`, `AppCombinatoire` et la lecture `saisieCombinatoire` (illisible gratuit, choix fermés
seuls et à une tentative, plus aucun exemple de champ qui soit une réponse, aides à deux niveaux sans la
réponse, écrans « formule » qui vérifient la forme, `?code=`, champs vidés, KaTeX partout, messages
ciblés, explication après échec). Lot C :
- 6gen43 : famille A sur un ensemble de chiffres tiré (dix chiffres ou 6 à 8, avec ou sans 0 ; avant,
  deux énoncés « total » sur 2 000 tirages) ; C en contexte, quatre groupements du cours (P, A, B, C,
  formule tirée d'abord) + variante `C_arrangement` en fin ; E en contexte (table / ronde / bracelet /
  anneau) ; tirage libre à parts égales par variante (avant : chaque A à 3 %).
- 6gen44 : multinomiale n ≤ 15 (≤ 630 630), tailles ≥ 2 ; B et D en prose (plus « TOUTES », « NE PEUVENT
  PAS ») ; Γₙᵖ pour p = 2 à 4 ; comparaison dés discernables / indiscernables à verdict tiré (quatre
  options A, B, C, Γ) ; D verdict 50 / 50, n ≤ 25 ; `E_anagrammes` en fin (Mississippi : 34 650 mots,
  34 649 anagrammes ; ANANAS, ABRACADABRA…).
- 6gen45 : terme de rang r = T₍ₖ₊₁₎ (écran « valeur de k ») ; polynôme final comparé exactement et
  DÉVELOPPÉ (« (2x − 3)⁴ » refusé sans tentative) ; C = vraie approximation (1 + nε, terme négligé
  Cₙ²ε², valeur au dix-millième ; |nε| ≤ 0,3) ; `D_pascal` en fin (ligne suivante, somme 2ⁿ⁺¹) ; profil :
  D `exacte`, C plus de `calcul`.
- 6gen46 : poker sur un jeu tiré (6 à 13 hauteurs × 3 ou 4 couleurs) ; B = groupes non nommés de même
  taille (décision de l'utilisateur ; vérifié par énumération) ; C sans 2⁴ / 4² ni n = k, message ciblé
  base / exposant ; D : trois dés, sommes 7–14, verdict S₁ / S₂ / égales tiré au tiers, comparaison sur
  son propre écran.
- 6gen47 : vérification exacte (plus de tolérance 0,01) ; contextes en prose avec N, K, n ; B a ∈ {1, 2},
  rouge / bleue, écrans séquence → nombre d'ordres → composition ; C « 0 bon numéro bonus » à 50 %.
- 6gen48 : famille A propre (`familleA6gen48.ts` ; `familleA.ts` inchangé, utilisé par 6gen50 / 6gen53) :
  contexte cohérent avec p (pièce, vrai / faux : 0,5), stratégie tirée au tiers et toujours la plus
  courte (≤ 3 termes), termes ≥ 0,001, écrans stratégie (seule) → valeurs de k → termes → résultat,
  4 puces tant que la stratégie n'est pas jugée ; variantes du sélecteur aléatoires (n, p) ; B :
  probabilité de chaque tirage puis produit, message « avec remise ».
Hors périmètre, à faire : cartes du chapitre (6gen46 « 32 cartes », « répartitions en boîtes » ; 6gen45
« triangle de Pascal » désormais vrai), refonte papier (lot E : profils, corrigé « comme au tableau »,
niveaux, `versionPapier`).

## 6e (6h), Chapitre 7 — lot E de l'audit (papier et évaluations de 6gen43–6gen48, 25/11/2026)

Adaptateurs provisoires remplacés par `construireAdaptateurCombinatoire` : énoncé papier = situation en
prose (nombres en formules en ligne : plus rien de coupé à l'impression — l'audit mesurait 34 à 81 % visible
en 6gen47 / 48) + consigne globale ; vraies questions seulement en 6gen47 B, 6gen45 C et D. Corrigés « comme au
tableau » (une lettre par écran) partagés écran / papier, affichés dans les applis : écran révélé, bouton
« Voir comment on y arrive » après une bonne réponse, fiche des puces (convention du 25/11 reprise dans
`AppCombinatoire`). Barème par écran (somme 4), brève, `criteresDifficulte` mesurés, `versionPapier`,
regroupements a), b), c), libellés pilotes. Profils (consigne du lot E, détail dans `feuilles-evaluations.md`,
« 6e ch. 7 (lot E) ») : cas particuliers deux-groupes / unitaire / aucun-tous, `calcul` revu (6gen48 :
`exacte` seulement pour p = 1/2), quatre groupes à verdict (6gen43 C, E ; 6gen44 B, D). Petite correction
d'écran : 6gen47 A « On cherche la probabilité de que Léa… » → `laProbabiliteDe` (« la probabilité que Léa… »).
Mesures : collecteur 250 tirages par variante (≈ 52 800 relations du corrigé recalculées, 0 fausse, 0 NaN,
0 KaTeX invalide, 0 notation clavier) ; plans réels 2 séries interdite / autorisée : structure B = A,
`?code=` = instance de l'adaptateur ; documents (feuille + aménagée, évaluation 2 séries + aménagée + corrigé
+ grille, Word) : 0 débordement, 0 formule coupée, 0 `.katex-error` à 680 / 820 / 1 280 px.
## 6e (6h), Chapitre 7 — lot G de l'audit, première moitié (5 ateliers, agent G1, 25/11/2026)

Le chapitre n'avait aucun atelier. Cinq blocs `atelier` ajoutés, seuls (aucun autre bloc touché), notation
du tableau de classification (n, p ; Aₙᵖ, Cₙᵖ, Bₙᵖ = nᵖ, Γₙᵖ = Cₙ₊ₚ₋₁ᵖ) et du § 3 (Cₙᵏ), KaTeX dans les
Shadow DOM (`katex-shadow.js`), légendes en Unicode (« K⁄N » : barre de fraction U+2044) :
- **`ordre-repetition-widget`** (§ 1, après l'astuce « La question 1 coupe le tableau ») : n lettres (2 à 5),
  longueur p (1 à 3), interrupteurs ordre / répétition ; TOUS les groupements listés en tuiles. Ordre : les
  mots aux mêmes lettres rangés dans un cadre ; couper l'ordre fait FUSIONNER chaque cadre en une tuile
  « ×k » (animation Web Animations, zone à hauteur gardée pendant la fusion, rien si `prefers-reduced-motion`).
  Avec répétition, cadres de tailles différentes (×6, ×3, sans badge) : d'où Γₙᵖ ≠ nᵖ / p!. Compteurs A, C,
  B, Γ en tableau 2 × 2 (cases cliquables). Sans SVG : pas d'épinglage.
- **`etoiles-barres-widget`** (§ 1, après le piège « confondre Γ et C ») : p boules (1 à 8), n parfums (2 à 5),
  barres GLISSÉES à la souris et au doigt (Pointer Events + capture, `touch-action: none` sur la figure),
  flèches du clavier ; lecture « 2 vanille, 0 fraise, 1 chocolat », effectif sous chaque compartiment,
  compteur des répartitions construites, liste complète si ≤ 84. Mode « au moins un de chaque » : barres au
  bord ou collées en rouge, Cₚ₋₁ⁿ⁻¹ = Γₙᵖ⁻ⁿ.
- **`pascal-vivant-widget`** (§ 3, après le piège « mauvais partenaire de symétrie ») : n de 0 à 15, une unité
  SVG = un pixel (cases de taille et de place constantes, défilement horizontal au-delà de la largeur) ; clic
  ou Entrée sur une case : parents (ou parent unique au bord), case symétrique, bande de la ligne, panneau
  Pascal / symétrie / somme = 2ⁿ. « Colorier les impairs » : cadre FIXE des 16 lignes ajusté à la largeur
  (Sierpiński entier sur téléphone, 81 impairs) ; « Développement de (a + b)ⁿ » : terme de la case encadré.
- **`mains-poker-widget`** (§ 4, après le diagramme des catégories) : 32 cartes, classement par hauteurs
  seulement (comme le cours), cartes de la combinaison mises en évidence, calcul en deux étapes de la
  catégorie (pièges full 8 × 7 / deux paires C₈²) ; simulation par 10 000, échelle FIXE 0 à 0,6 ; partition
  224 + 1 344 + 10 752 + 24 192 + 107 520 + 57 344 = 201 376 = C₃₂⁵.
- **`hypergeometrique-binomiale-widget`** (§ 5, après l'astuce « hypergéométrique contre binomiale ») : N parmi
  10 à 1 000 (K suit la proportion choisie), K, n de 1 à 10 ; barres jumelées, fenêtre FIXE (k de 0 à 10, P de
  0 à 1), valeurs du k choisi au-dessus des barres, tableau à 4 décimales, calcul exact (BigInt) jusqu'à
  13 chiffres au dénominateur ; « Faire grandir N » ; « Exemple du cours » (N = 20, K = 6, n = 5 : 0,1291…).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth
390, 0 `.katex-error`, Shadow DOM sans `^ $ \ * NaN undefined Infinity`, 0 étiquette rognée ; balayages :
136 cases de Pascal (parents, symétrique, 2ⁿ), 46 réglages ordre / répétition (tuiles = formule, badges =
mots), 240 réglages N, K, n (valeurs recalculées, axes identiques), 54 réglages étoiles (liste = formule),
glisser au doigt (CDP) et à la souris, 300 mains classées, 30 000 mains simulées (écart < 4σ) ; épinglage
dans le panneau 0 KO à 390 × 664 et 375 × 667. Scripts et captures : `scratchpad/g1-6e7/`.

## 6e (6h), Chapitre 7 — lot G de l'audit, seconde moitié (4 ateliers, agent G2, 25/11/2026)

Quatre blocs `atelier` ajoutés (aucun autre bloc touché), même style que G1 (`katex-shadow.js`, palette
accent / sky / good / plan / rose / tip, tuiles et cadres, boutons ≥ 44 px) :
- **`table-ronde-collier-widget`** (§ 1, après le piège « oublier la division par 2 ») : n de 2 à 6,
  modes table / collier ; « Tourner » (animation de rotation), « Retourner » (miroir autour de l'axe
  vertical, place du haut fixe ; la disposition retournée remplace l'ancienne à mi-course, jamais de
  lettres en miroir), échange de deux perles au toucher, « Au hasard ». Après chaque geste : « même table
  / autre table » (classes comparées par forme canonique). Files de la classe (n rotations, + n
  retournées pour un collier, pâles quand déjà vues : n = 2). Classes ÉNUMÉRÉES (n ≤ 5) en petits
  cercles cliquables : 1, 2, 6, 24 tables ; 1, 1, 3, 12 colliers ; n = 2 → 1 collier, « et non 1⁄2 ».
  Géométrie fixe (même cercle pour tout n), sens de lecture fléché à droite de l'axe (jamais dessus).
- **`anagrammes-fusion-widget`** (§ 2, après l'astuce « sans lettre répétée, on retrouve n! ») : champ
  texte JAMAIS filtré (ni `maxlength`, ni transformation à la frappe : la saisie est seulement lue —
  accents retirés, majuscules, non-lettres ignorées et SIGNALÉES) ; limites affichées (calcul jusqu'à
  20 lettres en BigInt, liste ≤ 360 mots, lettres discernables ≤ 5 lettres) ; effectifs en pastilles,
  n! ÷ (n₁! × …) (1! compris, comme l'exemple du cours) en `texEgalites`, anagrammes = résultat − 1
  (« aucune » pour AAA). Liste : lettres identiques indicées (P₁, P₂), cadres de n₁! × n₂! × …
  permutations ; « indiscernables » → FUSION animée (fantômes, comme `ordre-repetition`) en tuiles
  « ×k » ; « Retirer le mot de départ » le barre et recompte. Exemples PAPA, RADAR, ANANAS, MATHS,
  MISSISSIPPI (34 650 ; 34 649).
- **`mots-binome-widget`** (§ 3, après la démonstration du binôme par dénombrement) : n de 1 à 6, les 2ⁿ
  mots (a pâle, b gras, bord coloré selon le nombre de b) en grille puis « Regrouper par nombre de b »
  (transition CSS des `<g>`) en colonnes de hauteurs Cₙᵏ, étiquettes Cₙᵏ et monômes ; dans chaque
  colonne, trait pointillé entre les mots finissant par a et par b (relation de Pascal, expliquée) ;
  mini-triangle de Pascal, ligne n encadrée aux couleurs des colonnes ; mot touché → facteurs qui
  fournissent b et terme encadré du développement. viewBox fixe pour un n (grille et colonnes dans le
  même cadre ; grille d'autant de rangées que la plus haute colonne, centrée).
- **`approximation-binome-widget`** (§ 3, après l'avertissement « quand nε n'est plus petit ») : n de 1 à
  100, ε de −0,1 à 0,1 au millième ; exemples 1,01⁴ / 1,01¹⁰⁰ / 0,99¹⁰ / 1,05²⁰. Valeur exacte,
  1 + nε et erreur calculées en BigInt ((1000 + 1000ε)ⁿ ÷ 1000ⁿ : exactes si ≤ 10 décimales, sinon ≈ à
  6 décimales : 1,01¹⁰⁰ ≈ 2,704814) ; verdict par l'erreur relative (< 1 %, < 10 %, échec) avec nε ;
  tableau des termes Cₙᵏεᵏ (k ≤ 4, valeurs exactes) et somme des suivants. Graphique à fenêtre FIXE en
  abscisse nε (−2 à 3, y de −1 à 5) : points (nε ; (1 + ε)ⁿ) pour n = 0 à 100, droite y = 1 + nε, bande
  « nε petit », segment d'erreur rouge ; hors cadre, un message le dit. Lignes de valeurs empilées (une
  grille dt / dd laissait déborder la chaîne d'égalités à 390 px).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth
390, 0 `.katex-error`, Shadow DOM sans `^ $ \ * NaN undefined Infinity`, 0 étiquette SVG rognée ;
balayages : table / collier n = 2 à 6 × 2 modes × 6 dispositions au hasard (rotation exacte, « même » après
tourner, « autre table » / « même collier » après retourner, nombre de classes et de files), échange au
doigt ; 80 mots tirés au hasard (tuiles = n! ou formule, cadres = formule, mots distincts), MISSISSIPPI,
accents, caractères ignorés, 25 lettres (champ intact), mot vide ; 2ⁿ mots n = 1 à 6 × 2 vues (2ⁿ tuiles
distinctes dans le cadre, 0 chevauchement, colonnes = Cₙᵏ) ; 160 réglages (n, ε) comparés à `Math.pow`
(valeur, approximation, erreur). Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667 (9 ateliers du
chapitre). Scripts et captures : `scratchpad/g2-6e7/`.

## 6e (6h), Chapitre 8 — lot H1 de l'audit (nouveaux générateurs 6gen110–6gen115, 25/11/2026)

Six générateurs nouveaux sur le socle `AppEcransTrigo` (détail, profils et mesures : `.claude/rules/feuilles-evaluations.md`,
section « 6e ch. 8, lot H1 ») : 6gen110 variance et écart-type (§ 1), 6gen111 Y = aX + b (§ 1), 6gen112 fonction de
répartition (§ 3), 6gen113 densité de probabilité (§ 3), 6gen114 discrète ou continue ? (§ 4, Connaître), 6gen115 loi
uniforme continue (§ 5). Cartes « S'entraîner » ajoutées en fin de section (6gen110 et 6gen111 après 6gen49) ; registres
par ajout (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts` : union et entrées
pilotes avec processus, `regroupementsPapier.ts` : 6gen111, 6gen114). Aucun bloc de cours ajouté : le cours ne contient pas
encore E(aX + b) = aE(X) + b et V(aX + b) = a²V(X) (6gen111, démonstration D2 du lot F), ni P(a < X ≤ b) = F(b) − F(a) pour
une variable discrète (6gen112 escalier), ni « trouver k » (6gen113) ni le sens inverse de la loi uniforme (6gen115).

## 6e (6h), Chapitre 10 — lot H2 de l'audit (nouveaux générateurs 6gen138–6gen143, 25/11/2026)

Six générateurs nouveaux sur le socle `AppEcransTrigo` (détail, profils et mesures : `.claude/rules/feuilles-evaluations.md`,
section « 6e ch. 10, lot H2 ») : 6gen138 tangente par la dérivée et forme dédoublée (§ 5 `tangentes`, Appliquer), 6gen139
position d'une droite et d'une conique selon un paramètre (§ 4–5, carte au § 5, Transférer), 6gen140 miroirs en contexte
(§ 6 `optique`, Transférer), 6gen141 orbites et ellipses : Kepler (§ 1 et § 3, carte au § 3 `airefocale`, Transférer),
6gen142 hyperbole de navigation : LORAN (§ 6, Transférer), 6gen143 détective d'erreurs : coniques (fin, carte en fin de § 6,
Transférer). Convention y² = 2px partout. Cartes « S'entraîner » ajoutées en fin de section (après 6gen60 : 141 ; après
6gen62 : 138, 139 ; après 6gen63 : 140, 142, 143) ; registres par ajout (`registry.ts` après 6gen73,
`evaluationAdapterRegistry.ts` avec `versionPapier` après 6gen63, `evaluationPayload.ts` : union et entrées pilotes,
processus 2 / 3 / 3 / 3 / 3 / 3, `regroupementsPapier.ts` : 6gen138, 6gen139). Aucun bloc de cours ajouté ; le cours doit
porter (lot F) : la condition de tangence k² = a²m² ± b² et le cas « droite parallèle à une asymptote / à l'axe : un
seul point, pas une tangente » (6gen139), FT = FP pour la parabole (6gen140 `ftfp`), la distance focale D²/(16h) d'une
antenne et les trajets 2a du lithotriteur (6gen140), le LORAN avec ses deux intersections possibles (6gen142). Module de
figures propre au lot (`ui6e/outilsConiquesLotH2.ts`) : la figure de coniques des lots BC / H1 n'était pas fusionnée.

## 6e (6h), Chapitre 9 — lot H2 de l'audit (nouveaux générateurs 6gen128–6gen131, 25/11/2026)

Quatre générateurs nouveaux sur le socle `AppEcransTrigo` (détail, profils et mesures : `.claude/rules/feuilles-evaluations.md`,
section « 6e ch. 9, lot H2 ») : 6gen128 traduire un lieu : réciproque et points exclus (§ 4 `lieux-elimination`,
Transférer), 6gen129 courbe paramétrée : élimination et restriction (§ 6 `lieu-parametrique`, Appliquer), 6gen130 lieux en
contexte : un point qui bouge (§ 5 `methode-generatrices`, Transférer), 6gen131 détective d'erreurs : lieux, droites et
cercles (fin, Transférer). Cartes « S'entraîner » ajoutées en fin de section (après 6gen56 : 128 ; après 6gen57 : 130 ; fin
du § 6 : 129, 131) ; registres par ajout (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`,
`evaluationPayload.ts` : union et entrées pilotes, processus 3 / 2 / 3 / 3). Aucun bloc de cours ajouté : le cours doit
enseigner la réciproque et les points exclus d'un lieu (6gen128), la restriction d'une représentation paramétrique à
l'intervalle de t (6gen129) et l'arc capable (6gen130 « radars » : la pente du faisceau est donnée dans l'énoncé).

## 6e (6h), Chapitre 8 — lot H2 de l'audit (nouveaux générateurs 6gen116–6gen122, 25/11/2026)

Sept générateurs nouveaux sur le socle `AppEcransTrigo` (détail, profils et mesures : `.claude/rules/feuilles-evaluations.md`,
section « 6e ch. 8, lot H2 ») : 6gen116 lire la table de Φ (§ 6, Connaître), 6gen117 courbe de Gauss : aires et règle
empirique (§ 6, Connaître), 6gen118 approximation normale avec correction de continuité (§ 7, Appliquer), 6gen119 choisir le
modèle (fin, Transférer), 6gen120 loi normale : retrouver μ ou σ (§ 6, Transférer), 6gen121 Poisson : λ inconnu, valeur la
plus probable, seuil d'alerte (§ 8, Transférer), 6gen122 détective d'erreurs : variables aléatoires (fin, Transférer).
Cartes « S'entraîner » ajoutées en fin de section (après 6gen51 : 116, 117, 120 ; après 6gen52 : 118 ; après 6gen53 : 121,
119, 122) ; registres par ajout (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts` :
union et entrées pilotes avec processus, `regroupementsPapier.ts` : 6gen116). Table de Φ : valeurs de la source unique
`lib/tablePhi.ts` et composant partagé `components/TablePhi.tsx` (créés par l'agent de 6gen49–53, fusionnés ici), ouverts
par un bouton flottant `components/BoutonTablePhi.tsx` ; contrat papier `besoinTablePhi` (annexe : lot E). Aucun bloc de
cours ajouté : le cours doit enseigner la correction de continuité (6gen118, 6gen122 « continuité »), la convention de
lecture inverse « case la plus proche » (6gen116, 6gen120) et la règle empirique 68,3 / 95,4 / 99,7 (6gen117).

## 6e (6h), Chapitre 8 — lots B et C de l'audit (générateurs 6gen49–6gen53, 25/11/2026)

Lot B (socle du ch. 7 réutilisé, détail dans `feuilles-evaluations.md`, « 6e ch. 8 (lots B et C) ») : les
cinq moteurs, écrans et récapitulatifs d'origine sont remplacés par `AppCombinatoire` (illisible gratuit,
« % » et « 19! » lus, choix fermés seuls et à une tentative — plus aucun bouton recouvert par un champ (G17) —,
`?code=`, champs vidés, messages ciblés, explication après échec, corrigé consultable après chaque réponse),
la lecture `saisieVariablesAleatoires.ts` (consigne d'arrondi explicite, virgule décimale, vérification
exacte : plus de tolérance 0,01) ; plus aucun exemple de champ ni aide qui donne la réponse ; verdicts tirés
avant les nombres ; variantes du sélecteur qui varient. Lot C :
- 6gen49 : A, conditions variées des deux côtés (≤ < ≥ > = ≠ pair impair entre hors), verdict « contraires »
  50 / 50, aucun événement certain / impossible / doublé, la moitié des « non contraires » ont P₁ + P₂ = 1 ;
  loi en vrai tableau (`TableauLoi`) ; B contextes à effectifs (dé à 6–12 faces avec gains groupés, roue,
  enquête) et hypergéométrique nommée, X défini ; C mise positive, conclusion favorable / défavorable /
  équitable demandée (tirée au tiers), « imposer » : mise équitable puis jugement d'une mise proposée. V et σ :
  renvoyés au futur 6gen110 (carte réécrite).
- 6gen50 : A reconnaître (binomiale 50 / 50 ; sinon UNE condition échoue : nombre d'épreuves non fixé, épreuves
  dépendantes ou p qui change, X qui ne compte pas des succès), puis n et p (« 20 % » accepté) ; B recentrée
  (décision 3) : loi complète de 𝓑(n ; p), n ≤ 5, diagramme à reconnaître parmi trois (juste, miroir, p = 0,5),
  E et V exactes, σ ; C trouver n (60 couples, inéquation jugée par son ensemble de solutions, n isolé, sens qui
  change). Anciennes B « exactement… tous » retirées (`retiree`).
- 6gen51 refondu : table de Φ consultable (`TablePhi`, composant partagé créé ici, le cours n'en avait pas
  encore) sous chaque écran A–D, courbe de Gauss hachurée, référence = lecture de table (z au centième, Φ à
  4 décimales) ou calculatrice, lecture inverse : deux cases voisines acceptées ; écrans « écriture avec Φ »
  et « égalité de table » (choix seuls) ; sens inverse avec cibles NÉGATIVES (symétrie) et forme « ≥ » ajoutée
  en fin ; contextes réalistes (μ > 0), x tels que z tombe pile au centième ; E règle empirique (68,3 / 95,4 /
  99,7) ou valeur exacte acceptées.
- 6gen52 (Transférer) : A épreuve composée cohérente (jeu à deux épreuves, double six, pièce et dé, deux roues ;
  cartes réelles en direct) puis trouver n ; D vrai Bayes P(Cⱼ | S), catégorie tirée, messages « a priori »,
  « conditionnement inversé », « intersection » ; F loi reconstruite, E(X), total attendu ; B, C, E retirées
  (décision 3, `retiree`).
- 6gen53 : A verdict « approximable » 50 / 50 (sinon une condition échoue au tiers), λ = np, P(X = k) ;
  B λ ≤ 15, contextes dans les conditions du cours (plus de gauchers à 12 %), X défini, k près de λ et
  résultat entre 0,005 et 0,995 ; écran « stratégie » supprimé (le type de question le donnait).
Cartes du chapitre (descriptions de 6gen49–53) réécrites. Hors périmètre : le cours (agent AFD), 6gen110–122,
le papier définitif (lot E : corrigé « comme au tableau », niveaux, profils d'équilibre, annexe Φ).
## 6e (6h), Chapitre 8 — lot E de l'audit (papier et évaluations de 6gen49–6gen53, 25/11/2026)

Adaptateurs papier définitifs des cinq générateurs (détail : `feuilles-evaluations.md`, « 6e ch. 8 (lot E… ») :
énoncé en prose + consigne globale sans méthode, conditions justifiées dans le corrigé, corrigé « comme au tableau »
partagé écran / papier (`corrigeDetaille.ts` par générateur, `ui6e/corrigeVariablesAleatoires.ts`), barème sur 4,
réponse brève, niveaux mesurés, `versionPapier`, regroupements, libellés pilotes remplis (6gen52 processus 3).
**Table de Φ en annexe** (décision du 18/11) : `besoinTablePhi` lu par le pipeline (une table par document, après
les formulaires, copie Word comprise — `export/tablePhiDocx.ts`). Écrans : 𝓑 en `\mathcal`, `P(C_j\mid S)`.
Adaptateur provisoire `adaptateurVariablesAleatoires.ts` supprimé. Aucun `?code=` changé (générateurs intacts).

## 6e (6h), Chapitre 8 — lot G de l'audit, première moitié (5 ateliers + 6 réemplois, agent G1, 25/11/2026)

Le chapitre n'avait aucun atelier. Onze blocs `atelier` ajoutés, seuls (aucun autre bloc touché), placés par
ancre solide (le cours est réécrit en parallèle). Module partagé `src/interactive/variables-aleatoires-commun.js` :
Φ en double précision (série de Marsaglia), `phiTable` (z arrondi au centième, Φ à 4 décimales : les ateliers
calculent comme au cours, par la table), loi binomiale, écritures à la belge, curseurs − / +. Notation 𝓑(n ; p),
𝒩(μ ; σ) (σ = écart-type), conditions d'approximation « du cours » (n > 30 ; 0,3 < p < 0,7), lectures de table
écrites « ≈ ». Légendes en Unicode (texte brut).
- **`balance-esperance-widget`** (§ 1, après la définition « Espérance E(X) ») : poutre graduée de −6 à 6, loi
  faite de 20 blocs de 0,05 (somme toujours 1), bloc glissé au doigt / à la souris ou « toucher une pile puis une
  valeur » ; appui en E(X) (centre de gravité), bande [E − σ ; E + σ] ; calculs exacts en vingtièmes (E, E(X²), V
  par König, σ arrondi), sommes coupées terme par terme (une formule KaTeX ne se coupe pas). Lois prêtes :
  exemple du cours (2 à 6, E = 3,85), jeu du cours (−2 / 3 / 5 €, E = 1,5), ±1 €, ±5 € ; « Garder en mémoire » /
  « Deux jeux de même E(X) » (bande grise sous la poutre, même échelle).
- **`densite-repartition-widget`** (§ 3, après la liste des propriétés de F et f) : densités uniforme, triangulaire
  et parabole de la figure du cours sur [0 ; 6] ; a et b au dixième ; aire sous f = segment F(b) − F(a) de même
  couleur sur le graphique de F (défini sur ℝ, fenêtre FIXE x de −1 à 7) ; tangente à F en b de pente f(b) ;
  a = b → P(X = a) = 0.
- **`table-phi-widget`** (§ 6, juste avant le sous-titre « Sens inverse ») : cloche 𝒩(0 ; 1) fenêtre fixe, table
  complète 0,00 à 3,99 dans une boîte défilante (en-têtes collants), case + ligne + colonne allumées, case touchée
  = |z| ; modes P(Z ≤ z), P(Z ≥ z), P(a ≤ Z ≤ b) (deux cases, intervalle symétrique 2Φ(k) − 1), sens inverse
  (p donnée, case la plus proche ; à égale distance, milieu : 0,95 → 1,645 ; p < 0,5 → 1 − p puis signe).
- **`deux-echelles-standardisation-widget`** (§ 6, après la définition « Standardisation ») : cloche de 𝒩(μ ; σ)
  (x de 0 à 100, fixe) et référence 𝒩(50 ; 10) en pointillé ; seconde graduation z sous l'axe des x (traits en
  μ + kσ) reliée à l'axe de Z ∼ 𝒩(0 ; 1) dessiné dessous ; même aire teintée sur les deux cloches ; hauteur du
  sommet 1/(σ√(2π)).
- **`binomiale-vers-normale-widget`** (§ 7, après l'exemple résolu n = 100, p = 0,5) : n de 5 à 200, p, k, X ≤ k /
  X ≥ k / X = k ; histogramme de 𝓑(n ; p) sous la cloche ; P exacte, approchée sans correction (borne k) et avec
  correction de continuité (k ± 0,5), écarts ; conditions en pastilles vertes / rouges (+ « la convention est
  prudente » : n = 200, p = 0,2 est très bien approché). Abscisses de −0,5 à n + 0,5, ordonnées fixes pour un n
  (indépendantes de p et k) ; « Loupe autour de k » (17 unités) ; toucher / glisser sur la figure choisit k (la
  fenêtre de la loupe est FIGÉE pendant le glissement — sinon elle suivait k sous le doigt et k s'emballait).
- **Réemplois** (blocs `atelier` seuls, légendes adaptées au ch. 8) : `stabilisation-frequences-widget` (§ 2, après
  « Schéma de Bernoulli », pont E(X) = np), `binomiale-positions-widget` (§ 2, après l'exemple n = 5, p = 0,4 :
  « règle p = 0,4 », le défaut du widget est 0,3), `fonction-aire-widget` (§ 3, F′ = f) et
  `rectangle-valeur-moyenne-widget` (§ 3, après E / V continues : valeur moyenne d'une densité = 1/(v − u), et
  « E(X) n'est PAS cette valeur moyenne »), `tchebychev-garantie-widget` (§ 6, après l'attention « Diviser par 2 » :
  série en cloche, k = 2 → 95 % contre 75 % garantis), `bayes-test-medical-widget` (§ 7, juste après le sous-titre
  « Théorème de Bayes à 3 catégories », en rappel ; légende sans « P(A|B) » tapé).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, Shadow DOM sans `^ $ \ * NaN undefined Infinity`, 0 étiquette SVG rognée ; balayages contre un
recalcul indépendant (Φ par Simpson, binomiale par produit récurrent, aires par Simpson) : 420 lectures de table
(dont 120 sens inverse), 900 valeurs binomiale / approximations, 480 aires et pentes, 600 contrôles de balance
(200 déplacements au pointeur, somme 20 blocs, E, V, place de l'appui), 480 standardisations : 0 faux ; gestes au
doigt (CDP) : bloc glissé, toucher-poser, glisser k sous loupe, case de table touchée. Épinglage dans le panneau :
0 KO à 390 × 664 et 375 × 667 (11 ateliers ; les cases de table rognées par leur boîte défilante sont exclues de la
mesure). Scripts et captures : `scratchpad/g1-6e8/`.

## 6e (6h), Chapitre 8 — lot G de l'audit, seconde moitié (4 ateliers + table de Φ alignée, agent G2, 25/11/2026)

Quatre blocs `atelier` ajoutés, seuls, par ancre solide ; module partagé `variables-aleatoires-commun.js` réemployé
(aucune modification), mêmes conventions que G1 (𝓑(n ; p), écritures à la belge, curseurs − / +, figure dans une
`<svg>` sans bouton dans son conteneur, légendes en Unicode, « P(A|B) » jamais tapé dans une légende).
- **`simulateur-jeu-esperance-widget`** (§ 1, après l'astuce « Retrancher une constante… », fin de « Jeux et
  gains ») : jeu du cours (−2 / 3 / 5 €, E = 1,5), jeu avec mise du cours (10 / 4 / −6 €, E = 0,2), dé (12 / 3 / 0 €,
  E = 2,5) ; +10 / +100 / +1 000 parties (10 000 max, 3 séries superposées), abscisse logarithmique FIXE 1 à 10 000 ;
  mise m (pas 0,05) retirée de chaque gain : les parties sont gardées en sommes cumulées, changer m recalcule sans
  rejouer ; pastille favorable / équitable / défavorable ; tableau (une ligne par issue : gain, probabilité, fréquence
  observée — transposé, sinon il débordait à 390 px) ; « Loupe autour de E » (E ± 1 €).
- **`regle-empirique-widget`** (§ 6, après l'attention « Diviser par 2 pour un seul côté », avant le réemploi
  `tchebychev-garantie-widget`) : μ (30 à 70), σ (6 à 20), k (0,25 à 3,5, boutons k = 1, 2, 3), fenêtre FIXE
  x de 0 à 100 ; zone teintée : bande, hors de la bande, un seul côté ; pourcentages EXACTS au centième de pour cent
  (68,27 / 95,45 / 99,73, un côté 15,87 / 2,28 / 0,13 = tableau du cours), un côté = 1 − Φ(k) (jamais la moitié d'un
  arrondi affiché) ; « ne dépendent que de k » ; option Tchebychev (au moins 1 − 1/k², rien pour k ≤ 1) en barres.
- **`bayes-trois-categories-widget`** (§ 7, juste après l'exemple résolu de l'assurance) : 1 000 carrés (40 × 25,
  colonne par colonne), C₁ / C₂ / C₃ en bleu / violet / orange ; P(C₁), P(C₂) au pas de 0,05 (P(C₃) déduite, ≥ 0,05),
  P(S | Cᵢ) au pas de 0,02 → 1 000 × P(Cᵢ) × P(S | Cᵢ) toujours ENTIER, les carrés allumés donnent les probabilités
  exactes ; barre des carrés allumés regroupés = P(Cⱼ | S) ; « Ne garder que S » ; a priori / a posteriori ;
  exemples assurance (220 allumés, P(C₃ | S) ≈ 0,4545), trois machines, même taux partout (P(Cⱼ | S) = P(Cⱼ)).
- **`poisson-ou-binomiale-widget`** (§ 8, après la figure de Poisson λ = 4 qui suit l'exemple 𝓑(50 ; 0,08)) : n (5 à
  200), p (0,01 à 0,50), k ; X = k / X ≤ k / X ≥ k ; barres côte à côte (binomiale bleue, Poisson orange) ; fenêtre
  λ ± 4√λ aux multiples de 5 ; écart maximal marqué et chiffré ; 3 conditions du cours (n ≥ 30, p ≤ 0,1, np ≤ 15) en
  pastilles ; « au moins » par complément (Poisson sans valeur maximale) ; toucher / glisser la figure choisit k.
  Exemples : cours (0,0827 contre 0,0916), contrôle qualité 𝓑(200 ; 0,02), p trop grand, n trop petit.
- **`table-phi-widget` aligné sur la table du cours** : z de 0,00 à 3,49 (35 lignes, curseurs bornés à ±3,49) ;
  valeurs des cases (`valeurCase`), lecture d'une case (`valeurTablePhi`) et sens inverse (`lectureInverse`)
  IMPORTÉS de `src/lib/tablePhi.ts` (un `.js` de `src/interactive/` peut importer un `.ts` : Vite et `tsc` avec
  `allowJs` l'acceptent) ; note « au-delà de 3,49, Φ(z) ≈ 1 » quand une borne atteint 3,49 ; modes inchangés. Le
  `phiTable` du module commun (autres ateliers) donne les mêmes 350 cases (vérifié) ; il reste exact au-delà de 3,49.
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, Shadow DOM sans `^ $ \ * NaN undefined Infinity`, 0 étiquette SVG rognée ; balayages contre un
recalcul indépendant : 400 réglages Poisson / binomiale (binomiale par produit récurrent, Poisson par log-gamma,
écart maximal et sa position, pastilles), 300 règles empiriques (Φ par Simpson, bornes, Tchebychev), 400 Bayes
(carrés comptés dans le DOM, P(S), P(Cⱼ | S)), 303 simulations (E, verdict, gain moyen, fréquences, convergence à
4,5 σ/√N sur 10 000 parties), 350 cases de table + 190 lectures inverses contre `lib/tablePhi.ts` : 0 faux ; gestes au
doigt (CDP) : toucher / glisser k, boutons − / +. Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667
(15 ateliers du chapitre). Scripts et captures : `scratchpad/g2-6e8/`.

## 6e (6h), Chapitre 9 — lot G de l'audit, première moitié (5 ateliers + 5 réemplois, agent G1, 25/11/2026)

Le chapitre n'avait aucun atelier. Dix blocs `atelier` ajoutés, seuls (aucun autre bloc touché), placés par ancre
solide (le cours est réécrit en parallèle). Repères tracés avec `geo-analytique-commun.js` (4e ch. 7 : fenêtre FIXE,
axes fléchés, poignées) importé en tête de chaque module ; KaTeX par `katex-shadow.js` ; curseurs − / + de
`variables-aleatoires-commun.js` ; nouveau module `src/interactive/lieux-geometriques-commun.js` (fractions et
racines simplifiées en LaTeX, `texDroite`, distances point–segment / demi-droite / polygone, lecture automatique
`lecteur`, styles des repères). Repères orthonormés (même unité en x et y : cercles ronds), figure dans une `<svg>`
sans bouton dans son conteneur, coordonnées avec espaces insécables, légendes en Unicode.
- **`aire-variable-widget`** (§ 1, fin de la sous-section « Aire variable », juste avant « Symétrique d'un point ») :
  A(1 ; 1), B(5 ; 1), C(t) = P₀ + t·u sur quatre droites (⟂ (AB) : x = 3, oblique y = 2x − 3, par A : y = −x + 2,
  ∥ (AB) : y = 3), t au pas de 0,125, k de 0 à 8 au pas de 0,5. Une seule `<svg>` à deux panneaux : triangle et
  graphique de l'aire en V (½|K + Mt|, K et M affichés). C₁, C₂ symétriques par rapport au point I = d ∩ (AB)
  (milieu de [C₁C₂]) ; symétrique C₁′ de C₁ par rapport à (AB) dessiné hors de d quand d n'est pas ⟂ (AB) (corrige
  C3 de l'audit) ; k = 0 : une position (triangle aplati) ; d ∥ (AB) : aire constante 4. C glissé au doigt
  (projeté sur d), toucher le graphique choisit t.
- **`points-remarquables-widget`** (§ 1, juste avant la carte 6gen54 — à remonter après la nouvelle sous-section
  « points remarquables » du cours quand elle existera) : sommets entiers glissés (ou sommet + curseurs x, y),
  triangle aplati (angle < 6°) refusé ; familles médianes / G (orange), hauteurs / H (violet, côté prolongé en
  pointillé quand le pied tombe dehors), médiatrices / O + cercle circonscrit (bleu), bissectrices / I + cercle
  inscrit (vert), droite d'Euler (rose), cercle des neuf points (ocre, ses neuf points marqués). G, O, H, N en
  fractions exactes, I approché (« ≈ ») ; OG→ et OH→ exacts, OH→ = 3 OG→, GH = 2 OG ; nature (acutangle,
  rectangle : H au sommet et O milieu de l'hypoténuse, obtus : O et H dehors, isocèle : axe = droite d'Euler,
  équilatéral : tout confondu). Préréglages quelconque, isocèle, rectangle, obtus, équilatéral (sommet non entier).
  Étiquettes des points : première place libre parmi 8 (ni sur une autre étiquette ni sur un point).
- **`trace-lieu-widget`** (§ 4, en fin de section juste avant la carte 6gen56 : il reprend toutes les conditions
  de la section) : base `lieux-complexes-widget` (6e ch. 5), refaite. Huit conditions : MA² + MB² = k (A(−2 ; 0),
  B(2 ; 0), seuil 8 : cercle / point I / vide), MA² = k·MB² (k au quart, cercle de centre 2(k+1)/(k−1) et de rayon
  8√n/|n−4| pour k = n/4, médiatrice pour k = 1, « on ne divise pas par 1 − k »), MA² − MB² = k (x = k/8),
  |x − 2| ± |y + 1| = k (losange / point / vide ; quatre demi-droites ou deux droites), deux parallèles x = ±2
  (vide / bande pleine / deux droites), carré [−2 ; 2]² (vide / carré plein / octogone, piège 4c contre 4c²),
  angle AMB droit (cercle de diamètre [AB], A et B exclus en ronds vides). M vert ⟺ distance EXACTE de M au lieu
  ≤ 0,13 ; trace effacée quand k change ; panneau « Le lieu pour cette valeur de k » (équivalences, seuil, nature).
  Formules longues coupées en plusieurs KaTeX (Apollonius, carré : elles débordaient à 320 px).
- **`generatrices-animees-widget`** (§ 5, après l'exemple du rectangle, juste avant « Une médiane qui émerge… ») :
  « ▶ Lancer » (24 pas par seconde), α en curseur ; configurations rectangle (segment ouvert (2 ; 0)–(2 ; 3), α = 0
  singulier, α = 6 exclu par l'énoncé), céviennes (médiane 4x + 3y − 12 = 0, ]M ; A[), perpendiculaires (x = 1,
  (1 ; 0) jamais atteint, α = 0 : parallèles, P hors cadre signalé), angles α et 2α (cercle de centre A(2 ; 0) et de
  rayon 2 privé de (4 ; 0), O atteint pour α = 90°, d₂ verticale pour α = 45°). Équations des génératrices pour α ;
  « Montrer le lieu » : équation brute factorisée, statut des morceaux, restriction, ronds vides (tracés PAR-DESSUS
  la trace). Fenêtre fixe par configuration.
- **`courbe-parametree-widget`** (§ 6, juste après la figure de l'astroïde) : astroïde, cercle (option
  t ∈ [0 ; π] : demi-cercle y ≥ −1), x = cos t, y = cos 2t (arc de y = 2x² − 1), x = t², y = t⁴ (demi-parabole
  parcourue deux fois), x = t + 1, y = t² − 3 (entière) ; courbe décrite (orange) sur la courbe cartésienne
  complète (gris pointillé) ; t trigonométrique au pas de π/48 écrit en fraction de π ; panneau « Éliminer t »
  (identité, équation, partie décrite).
- **Réemplois** (légendes réécrites pour le ch. 9) : `relations-droites-widget` (§ 1, juste avant « Caractériser une
  droite par sa pente » : directeur (−b ; a) ⟂ normale (a ; b), a₁b₂ − a₂b₁ = 0), `distance-droite-widget` (§ 1,
  juste avant la « Boîte à outils » : comparer à |ax + by + c| / √(a² + b²)), `cercle-equation-widget` (§ 2, juste
  avant « Cercle passant par 3 points » : même forme x² + y² + Dx + Ey + F = 0 que le cours),
  `triangle-deformable-widget` (§ 2, juste avant « Cercle passant par 2 points » : le cercle par trois points,
  diamètre a / sin Â), `droite-cercle-widget` (§ 2, juste avant la carte 6gen55 : la droite y est écrite y = mx + p,
  comme l'exemple des tangentes du cours, ce que la légende dit).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, 0 KaTeX qui déborde, Shadow DOM sans `^ $ \ * NaN undefined Infinity`, 0 étiquette SVG rognée ;
balayages contre un recalcul indépendant (sources LaTeX lues par un espion sur `katex.renderToString`) : 40 820
positions de M sur 157 régimes (distance au lieu mesurée par changement de signe de la condition exacte, natures
contre les règles du cours) ; 232 triangles entiers (O et H par intersection de deux médiatrices / hauteurs, I
pondéré, N, OH→ = 3 OG→, nature) ; 784 valeurs de α (P comparé à l'intersection géométrique, sur le lieu et dans la
restriction, raison affichée quand il n'y a pas de P) ; 582 valeurs de t (point, équation cartésienne, restriction,
demi-cercle) ; 204 réglages d'aire (aire de C₁ et C₂ par la formule des coordonnées, sur d, milieu = I, verdict de C) :
0 faux. Gestes au doigt (CDP) dans le panneau : M glissé et tracé en arc (21 points verts), sommet C glissé, C glissé
sur d, graphique touché, « Lancer » / « Pause ». Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667
(10 ateliers du chapitre). `tsc`, `oxlint`, `npm run build` (24 pages) propres. Scripts et captures :
`scratchpad/g1-6e9/`.
## 6e (6h), Chapitre 9 — lot H1 de l'audit (nouveaux générateurs 6gen123–6gen127, 25/11/2026)

Cinq générateurs nouveaux sur le socle `AppEcransTrigo` (détail, profils et mesures : `.claude/rules/feuilles-evaluations.md`,
section « 6e ch. 9, lot H1 ») : 6gen123 démontrer par la géométrie analytique (§ 3, Transférer), 6gen124 points remarquables
et droite d'Euler (§ 1), 6gen125 reconnaître droites, points et cercles remarquables (§ 1–§ 2, Connaître), 6gen126 tangentes et
position relative droite–cercle (§ 2), 6gen127 quelle est la nature du lieu ? (§ 4, Connaître). Cartes « S'entraîner » ajoutées
en fin de section (6gen124 après 6gen54, 6gen125 et 6gen126 après 6gen55, 6gen123 après l'historique du § 3, 6gen127 après
6gen56) ; registres par ajout (`registry.ts`, `evaluationAdapterRegistry.ts` avec `versionPapier`, `evaluationPayload.ts` :
union et entrées pilotes avec processus — les libellés vides de 6gen54–57 laissés aux lots qui les refont —,
`regroupementsPapier.ts` : 6gen124, 6gen126, 6gen127). Aucun bloc de cours ajouté : le cours ne traite pas encore l'orthocentre,
le centre du cercle circonscrit, la droite d'Euler ni le cercle des neuf points (6gen124, 6gen125), les cercles exinscrits
(6gen125), la tangente verticale et la longueur PT par Pythagore (6gen126), l'octogone et les quatre demi-droites comme natures
(6gen127, la définition « 7 natures » est à corriger par le lot A) — lot F de l'audit.


## 6e (6h), Chapitre 9 — lot E de l'audit (papier et évaluations de 6gen54–6gen57, 25/11/2026)

Adaptateurs papier définitifs des quatre générateurs (détail : `feuilles-evaluations.md`, « 6e ch. 9 (lot E… ») sur
l'adaptateur commun du ch. 7 : énoncé « On donne … » + une consigne sans méthode ni verdict (6gen54 C avec le
paramétrage C(t), E « toutes les droites », H sans « deux points Ad, Bd » ; 6gen55 G inscrit ou exinscrit nommé ; 6gen56
carré placé, D « partie réellement décrite » ; 6gen57 configuration en prose, processus 3), corrigé « comme au tableau »
partagé écran / papier (`corrigeDetaille.ts` par générateur, brique `ui6e/corrigeLieux.ts` : droites simplifiées,
systèmes ligne par ligne, symétriques), figure du lieu ou du cercle sous le dernier résultat (chaîne SVG de l'écran),
barème sur 4, réponse brève, niveaux mesurés, profils (`droiteAxe`, `origineSurCercle`, `triangleRectangle`, `m1`,
`centreOrigine` ; verdicts jamais dans le profil), `versionPapier`, regroupements (6gen54 A–F, 6gen55, 6gen56 ; et
6gen129). Adaptateur provisoire `adaptateurLieux.ts` supprimé. 6gen56 : `params` sur l'instance (ajout pur, mêmes
`?code=`), C à m = 1 écrit sans parenthèses. Finitions : cours § 1 (« Trois constructions qui reviennent souvent »)
et quiz 6gen72 (thème 1, l'affirmation fausse « la seule droite… » devient « si P est le milieu de [AB], une seule
droite… » : fausse, une infinité) alignés sur 6gen54 E (2 droites, 1 seule ou une infinité) ; aperçu de l'énoncé
replié : lignes de données collées corrigées dans `cadre.css` (écart « bloc suivant » en `!important`).

## 6e (6h), Chapitre 9 — lot G de l'audit, seconde moitié (4 ateliers, agent G2, 25/11/2026)

Quatre blocs `atelier` ajoutés (aucun autre bloc touché), même style que G1 : repère `geo-analytique-commun.js` à
fenêtre FIXE et ORTHONORMÉ (même unité en x et y : cercles ronds), `katex-shadow.js`, curseurs − / +, figure dans une
`<svg>` sans bouton dans son conteneur. Ajouts au module `lieux-geometriques-commun.js` (en fin de fichier, rien de
modifié) : `racineEntiere`, `placeurEtiquettes` (première place libre parmi 8 autour du point, puis étiquette décalée
pour rester ENTIÈREMENT dans le cadre), `marqueAngleDroit`, `texPolynome`.
- **`repere-affine-widget`** (§ 1, juste après les deux panneaux « orthonormé / affine », avant l'astuce « vérifie que
  le repère est orthonormé ») : angle ω entre les axes (30° à 150°) et rapport k des unités (0,5 à 2) ; quadrillage du
  repère en parallélogrammes, unités « 1 » marquées en couleur sur chaque axe (corrige le point 23 de l'audit : aucune
  unité n'était visible) ; l'ensemble x² + y² = 4 (vert) comparé au vrai cercle de rayon 2 (pointillés) : cercle
  seulement pour ω = 90° et k = 1, sinon ellipse ; M parcourt l'ensemble (glissé, ou curseur t), coordonnées lues
  parallèlement aux axes, √(x² + y²) = 2 contre la vraie longueur OM = √(x² + 2k·cos ω·xy + k²y²) (« la formule tombe
  juste par hasard » sur un axe) ; préréglages orthonormé, unités différentes, axes obliques, quelconque.
- **`cercles-deux-points-widget`** (§ 2, après le piège « n'en retenir qu'un seul », avant l'application des antennes) :
  A et B entiers glissés (ou choisis puis réglés aux curseurs), r au pas de 0,5 ; centres = points communs aux cercles
  de centres A et B et de rayon r (pointillés), sur la médiatrice (équation entière réduite) ; comparaison EXACTE de
  (2r)² et AB², h = √(r² − (AB/2)²) en racine simplifiée, centres en fractions quand ils sont rationnels (sinon « ≈ ») ;
  « Exemple du cours » A(0 ; 0), B(6 ; 0), r = 5 → (3 ; 4) et (3 ; −4).
- **`tangentes-point-widget`** (§ 2, après la démonstration PT = √(OP² − r²), avant le réemploi `droite-cercle-widget`) :
  cercle x² + y² = 25, P entier glissé ; méthode du cours (droite a(x − x_P) + b(y − y_P) = 0, dist(O ; d) = 5 →
  équation homogène en a et b affichée) ; b = 0 solution ⟺ x_P² = 25 : tangente VERTICALE en évidence (« y = mx + p
  l'aurait perdue »), sinon « pas de tangente verticale ici » ; équations entières quand PT est entier ou qu'une tangente
  est verticale, sinon coefficients arrondis au centième (b = 1) ; points de contact, rayons [OT] et angles droits, PT ;
  intérieur : aucune ; sur le cercle : une, de normale OP→. Préréglages P(0 ; 13), P(5 ; 3) (les deux exemples du
  cours), P(3 ; 4), P(1 ; 2).
- **`arc-capable-widget`** (§ 5, juste après l'application des radars, dont il reprend la figure) : A(−3 ; 0), B(3 ; 0),
  θ de 40° à 150° (45° par défaut) ; « Lancer les radars » : faisceau de A d'angle α, de B d'angle α + θ (P par la loi
  des sinus), le croisement trace l'arc ; P aussi glissé librement, angle APB mesuré, vert si P est à ≤ 0,12 du lieu ET
  à 1,5° près de θ (près de A et B, l'angle varie trop vite pour la seule distance) ; « Montrer le lieu » : deux arcs
  symétriques par rapport à (AB), A et B en ronds vides, restes des cercles en pointillés (angle 180° − θ), centre
  (0 ; 3/tan θ) et rayon 3/sin θ exacts pour 45°, 60°, 90° (cercle de diamètre [AB], lien au § 4), 120°, 135°, 150°.
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, 0 KaTeX qui déborde (aussi à 320 px), 0 étiquette SVG rognée ; balayages contre un recalcul
indépendant (sources LaTeX lues par un espion sur `katex.renderToString`, et contrôle de CHAQUE état : textes, KaTeX,
étiquettes) : 3 872 réglages A, B, r (médiatrice, AB, h, centres à distance r de A et B, nombre de cercles tracés),
399 positions de P (tangentes par P et à distance 5 de O, verticale ⟺ x_P² = 25, contacts sur le cercle et la tangente,
PT), 759 positions de faisceaux + 26 588 positions libres de P (✓ jamais à plus de 1,5° de θ, ✗ jamais sur le lieu),
4 200 réglages ω, k, t (OM, M, courbe tracée vérifiant x² + y² = 4) : 0 faux. Gestes au doigt (CDP) et à la souris dans
le panneau : A, B, P glissés, P promené sur l'arc (41 points de trace), « Lancer » / « Pause », M glissé ; aucun
défilement du panneau pendant un glisser. Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667 (14 ateliers du
chapitre). Scripts et captures : `scratchpad/g2-6e9/`.

## 6e (6h), Chapitre 10 — lot G de l'audit, première moitié (5 ateliers + 3 réemplois, agent G1, 25/11/2026)

Le chapitre n'avait aucun atelier. Huit blocs `atelier` ajoutés, seuls (aucun autre bloc touché ; la figure fausse du
miroir hyperbolique reste au lot A), placés par ancre solide (le cours est réécrit en parallèle). Même style que le
ch. 9 : repères `geo-analytique-commun.js` à fenêtre FIXE et ORTHONORMÉS (cercles ronds), axes fléchés,
`katex-shadow.js`, curseurs − / +, `placeurEtiquettes` (étiquettes jamais rognées), figure dans une `<svg>` sans bouton
dans son conteneur. Nouveau module `src/interactive/coniques-commun.js` : rationnels exacts (`Q`, `texQ`,
`texRacineQ`), échantillonnage ellipse / hyperbole / parabole (centre ou sommet + axe quelconque, parabole Y² = 2pX),
chemins découpés au cadre, réflexion d'un rayon sur une tangente, arcs d'angle. Convention de la parabole y² = 2px,
p = dist(F ; d), partout.
- **`jardinier-coniques-widget`** (§ 1 B, après le piège « L'ellipse n'existe que si a > c », juste avant « Équation
  cartésienne de l'ellipse ») : F et F′ entiers glissés, 2a de 0 à 14 (pas 0,5), bascule somme / différence ;
  « Faire le tour » (un tour complet pour une courbe fermée), P glissé ou curseur, trace rose (gardée quand on change de
  branche) ; ficelles [PF] et [PF′] et leurs longueurs ; régimes : ellipse, cercle (F = F′), segment [FF′] (2a = 2c),
  vide, hyperbole (une branche à la fois), deux demi-droites (2a = 2c), médiatrice (différence, 2a = 0), tout le plan ;
  a, c = |FF′|/2 et b en racines simplifiées, triangle orange rectangle (a² = b² + c², ou c² = a² + b² avec le
  rectangle 2a × 2b et les asymptotes). Préréglages : ellipse et hyperbole du cours, F = F′, foyers obliques.
- **`excentricite-curseur-widget`** (§ 2, juste après la figure des trois coniques de même foyer) : F(1 ; 0) et
  d ≡ x = 0 fixes (ceux de la figure), e de 0 à 2,5 (pas 0,05) ; courbe par la forme polaire depuis F ; e = 0 : le seul
  point F (« le cercle n'a pas de directrice » ; b/a = √(1 − e²) → 1 affiché pour les ellipses) ; e = 1 :
  y² = 2(x − 1/2) ; centre, a, b, c, F′, d′, asymptotes ; P glissé sur la courbe (branche la plus proche du doigt) ou
  curseur + « Autre branche » ; |PF|, dist(P ; d) et e·dist(P ; d) en direct.
- **`dandelin-cone-widget`** (§ 2, juste après la figure de Dandelin « vue en coupe ») : cône de demi-angle 30°, plan qui
  tourne autour de la droite (x = 0,6 ; z = 1,8) — il ne passe jamais par le sommet —, θ de 0° à 90° ; perspective
  orthogonale (parties cachées en pointillés : bord inférieur, section, cercles de contact), sphères calculées
  exactement (centres z = k/(cos θ ± sin α)), foyers, génératrice par P avec M et M′ ; vraie forme dans le plan
  (foyers, directrices = traces des plans des cercles de contact) ; |PF| = |PM|, |PF′| = |PM′|, somme ou différence
  = |MM′|, |PF| / dist(P ; d) = e = sin θ / cos 30°. Sur téléphone (< 560 px), une vue à la fois (boutons « Vue en
  perspective » / « Vraie forme ») : les deux vues empilées étaient réduites par l'épinglage jusqu'à l'illisible.
- **`reduire-translation-widget`** (§ 2, juste après la figure de la conique de l'exemple résolu dans R₁) : m, n
  (−40 à 40), r, s (−300 à 300), t (−500 à 500) entiers, bouton « Choisir t pour un second membre nul » (t rationnel
  exact) ; méthode du cours en valeurs EXACTES (1) regroupement, 2) carrés complétés et second membre K,
  3) translation et nouvelle origine, 4) division par K — signalée quand K < 0 —, 5) nature et éléments dans R₁) ; tous
  les cas : ellipse, cercle, hyperbole (axe selon le signe), point, vide, deux droites sécantes, parabole (m ou n nul :
  sommet, 2p, foyer à p/2, directrice), deux droites parallèles, droite double, « pas une conique » (m = n = 0). Chaque
  membre d'égalité dans son propre KaTeX (sinon la ligne débordait à 390 px). Préréglages dont l'exemple résolu du cours.
- **`trois-miroirs-widget`** (§ 6, juste après les figures des miroirs elliptique et hyperbolique, qu'il complète) :
  parabole y² = 4x, ellipse x²/25 + y²/16 = 1, hyperbole x²/9 − y²/16 = 1 (seule la branche de droite est un miroir) ;
  sources : faisceau parallèle à l'axe, source au foyer, rayons qui visent F (Cassegrain) ; P glissé ; rayon réfléchi
  calculé par la loi de la réflexion, angle avec la droite vers le foyer mesuré À PART ; hyperbole source en F :
  prolongement en pointillés jusqu'à F′ (« semble venir de F′ ») ; faisceau parallèle sur l'ellipse ou l'hyperbole :
  croix rouges aux passages sur l'axe et leur étendue (aucun point commun).
- **Réemplois** (légendes réécrites pour le ch. 10) : `trace-lieu-widget` (§ 1, juste avant « A. La parabole » : une
  conique est un lieu défini par des distances), `parabole-foyer-widget` (§ 1 A, juste après la figure de la parabole
  de foyer F(1 ; 0), avant « Équation cartésienne de la parabole » : mode compas = la construction du cours, r < p/2),
  `repere-affine-widget` (§ 1 B, juste après les figures « cercle aplati »). Non repris : `droite-cercle` (base de
  l'atelier 6 « Droite et conique » du lot G2), `completer-le-carre` (méthode d'al-Khwārizmī pour x² + bx = c : la
  réduction pas à pas le remplace), `lieux-complexes` (conditions sur z, aucune conique ; le jardinier et le curseur
  d'excentricité en reprennent l'idée de trace).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, 0 KaTeX qui déborde, Shadow DOM sans `^ $ \ NaN undefined Infinity`, 0 étiquette SVG rognée ;
balayages contre un recalcul indépendant, à partir de ce qui est DESSINÉ (SVG ramené au repère) et AFFICHÉ :
1 701 réglages e / P (44 735 points de courbe avec |PF| = e·|x|, mesures affichées), 300 configurations du jardinier
(39 597 points du lieu, verdicts, b, ficelles), 707 positions de miroir (P sur le miroir, tangente ⟂ gradient, angles
égaux, rayon vers F / parallèle à l'axe / prolongement par F′ / vers F′ selon le cas), 1 500 équations aléatoires
(365 051 points tracés sur la conique, nature par un classement indépendant, foyers : somme / différence constante,
parabole |PF| = dist(P ; d)), 1 911 réglages θ / P de Dandelin (foyers par dichotomie sur la tangence, |PF| = |PM|,
somme ou différence = |MM′|, rapport = sin θ / cos 30°) : 0 faux. Gestes au doigt (CDP) et à la souris dans le
panneau : P glissé (ellipse, puis seconde branche), F glissé, P promené (trace), point d'impact glissé, P dans la vraie
forme, boutons ; aucun défilement du panneau pendant un glisser. Épinglage dans le panneau : 0 KO à 390 × 664 et
375 × 667 (8 ateliers du chapitre). Scripts et captures : `scratchpad/g1-6e10/`.

## 6e (6h), Chapitre 10 — lot G de l'audit, seconde moitié (4 ateliers, agent G2, 25/11/2026)

Quatre blocs `atelier` ajoutés, seuls (aucun autre bloc touché), placés par ancre solide (le cours est réécrit en
parallèle). Même style que G1 : `geo-analytique-commun.js` à fenêtre FIXE et ORTHONORMÉ, `katex-shadow.js`, curseurs
− / +, `placeurEtiquettes`, figure dans une `<svg>` sans bouton dans son conteneur ; `coniques-commun.js` réutilisé tel
quel (rationnels exacts, tracés, chemins découpés, arcs d'angle), rien n'y est modifié. Convention y² = 2px partout.
- **`triangle-focal-widget`** (§ 3 A, juste après la figure du triangle FPF′ de l'exemple |PF| = 2|PF′|) : a et b
  entiers (b < a), P glissé sur l'ellipse ; |PF| = a − e·x_P et |PF′| = a + e·x_P comparés aux longueurs MESURÉES,
  somme 2a, encadrement a − c ≤ |PF| ≤ a + c (exact) ; θ = F′PF mesuré, θ_max aux sommets (0 ; ±b) avec
  sin(θ_max/2) = e ; aire de trois façons (½·|PF|·|PF′|·sin θ, c·|y_P|, b²·tan(θ/2)). Mode « Angle imposé » : θ au
  degré, les quatre points construits (rayons racines de t² − 2at + 2b²/(1 + cos θ)) ou « aucun point » au-delà de
  θ_max (le produit 2b²/(1 + cos θ) dépasserait a²). Préréglage « Exemple du cours » avec ses valeurs exactes (10/3,
  20/3, cos θ = 11/25, aire 8√14/3).
- **`droite-conique-widget`** (§ 4, juste après la figure de la droite qui coupe l'hyperbole de l'exemple résolu ;
  base `droite-cercle-widget` du 4e, réécrite) : ellipse x² + 4y² = 8 et parabole y² = 2x (exemples du cours),
  hyperbole 4x² − y² = 4 et hyperbole d'axe vertical y² − 4x² = 4 ; droite y = mx + k (m, k au pas de 1/4, deux
  poignées : ordonnée à l'origine, pente) ou x = h. Substitution écrite en valeurs EXACTES (nombres p + q√r), équation
  à coefficients entiers premiers entre eux (premier positif), Δ = B² − 4AC, points en fractions ou racines
  simplifiées ; « Δ a le signe de 8m² + 2 − k² » (selon la conique). Verdicts : sécante, tangente (point double),
  extérieure, et le cas C8 de l'audit — coefficient de x² nul (parallèle à une asymptote ou à l'axe) : premier degré,
  UN point SANS tangence (y = 2x + 1 → (−5/4 ; −3/2), y = 3 → (9/2 ; 3)) — ou aucun point (l'asymptote elle-même).
  « Garder la droite tangente » : k par Δ = 0 (racine exacte, « Autre tangente » pour le signe), la droite roule quand
  m change ; tangentes verticales x = ±2√2, x = ±1, x = 0, aucune pour l'hyperbole verticale. **Bug évité, à retenir**
  : pour l'hyperbole, k² = a²m² − b² = 0 (m = ±b/a) donne l'ASYMPTOTE, pas une tangente — condition stricte k² > 0
  (le panneau le dit) ; trouvé par le balayage.
- **`tangente-dedoublee-widget`** (§ 5, juste après la figure de la tangente à l'ellipse en P(3 ; 3,2)) : ellipse
  x²/25 + y²/16 = 1, hyperbole x²/9 − y²/16 = 1 (deux branches), parabole y² = 4x (p = 2) ; P glissé, AIMANTÉ aux
  points à coordonnées rationnelles simples (énumérés : x = n/d, d ≤ 6, y² carré rationnel ; parabole y = n/2) :
  valeurs exactes là (vérification « P est sur la conique », forme dédoublée avec les nombres, forme entière ax + by = c,
  y = mx + q ; pente −b²x_P/(a²y_P), b²x_P/(a²y_P) ou p/y_P, et y − y_P = m(x − x_P)), valeurs approchées ailleurs ;
  demi-courbe de la fonction dérivée surlignée ; sommets : pas de pente, tangente verticale donnée par la forme
  dédoublée (x = ±5, x = ±3, x = 0).
- **`loran-widget`** (§ 6, juste après l'application « Trouver sa position en mer », avant la carte 6gen63) : deux
  paires de stations glissées sur les nœuds (1 carreau = 100 km), différence d = |MA| − |MB| au curseur (pas 0,1,
  |d| < |AB|) ou lue sur le navire N glissé ; Δt = d·100 km / 300 000 km/s en µs ; UNE branche (côté de la station la
  plus proche), médiatrice pour d = 0 ; points communs par dichotomie le long de la première branche (jusqu'à 40
  carreaux, hors cadre signalés) : aucun, un, ou deux (« Deux positions possibles » : A₂(−3 ; −3), B₂(2 ; −2), N(1,5 ; 3)
  et N′(1,74 ; −4,47)) ; bouton « Seconde paire » (une seule mesure = toute une branche). Préréglages : figure du cours
  (N(12/√7 ; 12/√7)), deux positions, Δt = 0.
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px) : 0 erreur console, scrollWidth 390,
0 `.katex-error`, 0 KaTeX qui déborde, Shadow DOM sans `^ $ \ NaN undefined Infinity`, 0 étiquette SVG rognée ;
balayages contre un recalcul INDÉPENDANT en flottants, à partir de ce qui est DESSINÉ (SVG ramené au repère) et
AFFICHÉ (sources LaTeX lues par un espion sur `katex.renderToString`) : 4 718 réglages droite / conique (toute la grille
m, k, h des 4 coniques + mode tangent : verdict, nombre et valeur exacte des points, points sur la conique, signe de Δ,
points et droite dessinés), 1 604 positions de P (P sur la conique, tangente ⟂ gradient et par P, 376 positions
exactes : équation entière proportionnelle, pente exacte, 54 sommets), 3 015 positions + 2 700 angles imposés du
triangle focal (rayons formule = mesurés, θ, trois aires, point construit = point trouvé à part par dichotomie,
existence ⟺ cos θ ≥ 1 − 2e²), 600 configurations LORAN aléatoires (branches dessinées, 747 positions affichées vérifiant
les deux différences, positions dans le cadre = celles d'une recherche indépendante en polaire depuis B₂) : 0 faux.
Gestes au doigt (CDP) et à la souris dans le panneau : poignées k et pente, P aimanté, P promené, navire et station
glissés ; aucun défilement du panneau pendant un glisser. Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667
(12 ateliers du chapitre). Scripts et captures : `scratchpad/g2-6e10/`.

## 5e (4h), Chapitre 6 — Statistique à deux variables : ateliers (6 + 1 en option, agent G, 25/11/2026)

Chapitre nouveau (squelette du coordinateur, cours rédigé en parallèle par le lot AF) : sept blocs `atelier` ajoutés
SEULS, chacun en fin de section, après le paragraphe provisoire (le coordinateur les replacera à la fusion). Nouveau
module `src/interactive/statistique-deux-variables-commun.js` : calculs écrits une fois (moyennes, V et σ divisés
par n, Cov, a = Cov/V(x), b = ȳ − a x̄, r ; Mayer : tri selon x puis y, PREMIER groupe de ⌊n/2⌋ points — groupes
de 3 et 4 pour n = 7, comme la proposition ; somme des carrés des écarts verticaux), interprétation de r selon le
tableau validé (|r| = 1 parfaite ; 0,98 ≤ |r| < 1 très forte ; 0,80 forte ; 0,60 moyenne ; 0,35 faible ; sinon
nulle — classement sur la valeur AFFICHÉE à 3 décimales, et un r qui s'arrondirait à ±1 sans l'être reçoit des
décimales de plus : « 1 » réservé aux points alignés), écritures « = » (exact à 4 décimales) ou « ≈ »,
`repereStat` (fenêtre FIXE, échelles x et y indépendantes, graduations dans les MARGES : jamais rognées ni cachées
par un point, centrées mais gardées dans la figure), `nuageEditable` (toucher une place vide ajoute un point,
glisser le déplace, mode « Retirer un point » ; aimant au demi ; capture du pointeur sur la `<svg>`, qui survit
aux rendus), `[hidden]{display:none !important}` (sinon `.rangee{display:flex}` réaffiche un bloc masqué). KaTeX
par `katex-shadow.js`, curseurs − / + par `variables-aleatoires-commun.js`, styles de tracé `CSS_LIEUX`. Figure
seule dans sa `<svg>`, aucun bouton dans son conteneur. Légendes en Unicode (pas de `$`).
- **`jusqu-ou-prevoir-widget`** (§ 2 ; endroit idéal : après la définition interpolation / extrapolation, il sert
  aussi l'exemple « mortalité infantile » du § 6) : droite des moindres carrés RECALCULÉE, abscisse x₀ glissée sur
  la figure ou au curseur ; bande verte « on interpole » (texte vertical si la bande est étroite), ocre « on
  extrapole », rouge « impossible ». Mortalité infantile par périodes de 5 ans (1 = 1946-1950 ; valeurs d'exemple
  61,3 ; 45,6 ; 34,2 ; 27,1 ; 22,4 ; 18,0, proches de celles du manuel) : y ≈ −8,38x + 64,09, r ≈ −0,967, nulle vers
  x ≈ 7,65, période 12 (2001-2005) ≈ −36,4. Espérance de vie en Belgique 2000-2014 (Banque mondiale, valeurs du
  document) : y ≈ 0,2133x − 348,80, r ≈ 0,983, 122 ans (record humain) vers 2207. Le calcul écrit utilise des
  coefficients à 4 ou 5 décimales (ou la forme ȳ + a(x₀ − x̄)) pour que l'arrondi affiché soit celui du calcul
  exact (vérifié pour chaque x₀).
- **`nuage-mayer-widget`** (§ 3 ; endroit idéal : après la méthode en 5 étapes, ou l'exemple « 7 données ») :
  repère 0–10 × 0–20, séries « exemple du cours » (1 ; 8)…(6 ; 15) et « 7 points en désordre » ; panneau des 5
  étapes (ordre de saisie puis groupes triés, « sans le tri, les groupes seraient faux », x̄₁ = somme / n₁ écrite
  — somme calculée au-delà de 6 valeurs —, pente non arrondie, b, équation, a x̄ + b = ȳ) ; verdict pair (G milieu de
  [G₁G₂]) / impair (groupes de ⌊n/2⌋ et n − ⌊n/2⌋) / G₁ et G₂ de même abscisse (droite verticale refusée) ; frontière
  des groupes en pointillés ; boutons « Point moyen G » et « G₁, G₂ et droite de Mayer ». 2 à 14 points.
- **`moindres-carres-widget`** (§ 4 ; endroit idéal : après la définition par les écarts verticaux, avant les
  formules) : repère ORTHONORMÉ 0–7 : chaque écart est le côté d'un VRAI carré (à droite du point). Droite réglée par
  a, b (pas 0,05) ou par deux poignées (x = 3 : translation ; x = 6 : rotation autour de la première) ; écarts et
  carrés écrits terme à terme, S, plus petit S atteint ; « Montrer la meilleure droite » (a = Cov/V(x), b, S minimal,
  ses carrés en pointillés verts), « Droite de Mayer » (série du cours : 2,4 contre ≈ 2,444). « Autre nuage » : 5
  ou 6 points entiers, 0,5 ≤ |r| < 0,97.
- **`quadrants-covariance-widget`** (§ 5 ; endroit idéal : juste après l'image concrète des quatre quadrants) :
  axes par G, rectangle de chaque point jusqu'à G, vert (produit > 0) / rouge (< 0), signes des quadrants dans les
  coins ; bilan aires vertes − aires rouges = Σ, Cov = Σ / n, σx, σy, r ; produits listés ; nuages « croissante »,
  « décroissante », « sans liaison », « en arc » (parabole symétrique : Cov = 0 exactement, « pas de lien LINÉAIRE »).
- **`devine-r-widget`** (§ 5 ; endroit idéal : après le tableau d'interprétation ou l'exemple « cinq nuages, cinq
  r ») : nuage de 12 à 30 points (ρ visé tiré : 15 % proche de ±1, 15 % proche de 0, sinon uniforme ; r CALCULÉ sur
  les points), estimation au curseur (pas 0,01), « Vérifier » (vraie valeur, écart, interprétation, droite), six
  derniers écarts (aucune note) ; mode « Fabrique un nuage » : cibles 0,9 ; −0,8 ; 0,5 ; −0,3 ; 0 ; 0,99 ; −0,95 ;
  0,7 ; −0,6 ; 0,3, réussi ⟺ n ≥ 5 et |r − cible| ≤ 0,05 ; jauge −1…1 (estimation, cible, valeur) dans une seconde
  `<svg>`, plus petite (l'épinglage prend la plus grande).
- **`changer-unites-widget`** (§ 5, l'option ; endroit idéal : juste après la démonstration 7) : X = αx + β,
  Y = γy + δ ; le nuage reste le MÊME dessin, seules les graduations changent ; espérance de vie (années brutes,
  depuis 2000, centrées sur 2007 ; années ou mois) et taille / masse de six adolescents (valeurs d'exemple ; cm ou
  m, kg ou g) ; droite et r recalculés sur les données transformées, a′ = a·γ/α écrit, r identique.
- **`point-aberrant-widget`** (§ 6 ; endroit idéal : après « un point aberrant peut faire basculer la droite »,
  avant le « Le sais-tu ? » d'Anscombe) : notes sur 20 de math (x) et de physique (y), 8 points fixes + P (rouge)
  glissé (ou amené en touchant le cadre) ; droites AVEC P (orange) et SANS P (pointillés), équations, r et
  interprétations, prévision pour 18 en math ; « Retirer P » (« seulement si on a une raison »), « P loin du nuage »
  (16 ; 2 : r passe de 0,993 à 0,342). « Quartet d'Anscombe » : les VRAIES données de 1973, 2 × 2 repères dans la
  même `<svg>` (même taille de figure), tableau x̄, ȳ, σx, σy, r, a, b recalculés à 2 décimales fixes (9,00 ; 7,50 ;
  3,16 ; 1,94 ; 0,82 ; 0,50 ; 3,00 pour les quatre).
Vérifié (Vite, page réelle, panneau, iPhone 13 clair / sombre et 1 280 px clair / sombre) : 0 erreur console,
scrollWidth 390, 0 `.katex-error`, 0 KaTeX qui déborde, Shadow DOM sans `^ $ \ NaN undefined Infinity`, 0 étiquette
SVG rognée. Balayages contre un recalcul indépendant (statistiques réécrites dans le script, sources LaTeX lues par
un espion sur `katex.renderToString`, « = » seulement pour une valeur exacte) : 1 500 nuages de Mayer (2 à 14
points : x̄, ȳ, G₁, G₂, a, b, a x̄ + b, effectifs, verdicts), 11 685 droites sur 41 nuages (S, a, b, S minimal,
jamais S < minimum, 2,4 et 2,444 du cours), 1 500 nuages de covariance (Cov, σ, r, intensité, couleur de chaque
rectangle), 400 « devine r » (r, écart, intensité, n, cadre) + 1 500 états « fabrique » (verdict ⟺ règle), 861
positions de P (deux équations, deux r), 64 abscisses de prévision (valeur, calcul écrit, verdict interpole /
extrapole / impossible), 10 combinaisons d'unités (a′, b′, r) : 0 faux. Gestes réels (CDP doigt et souris) :
ajout, glisser, retrait (Mayer), poignées (moindres carrés), point glissé (quadrants), ajout en mode fabrique (et
aucun ajout en mode devine), P glissé, ligne de prévision glissée ; défilement de la page pendant les 10 glissés au
doigt : 0. Épinglage dans le panneau : 0 KO à 390 × 664 et 375 × 667 (7 ateliers). Scripts et captures :
`scratchpad/g-5e6/`.

## 5e (4h), Chapitre 6 — Statistique à deux variables : cours, démonstrations, parcours, quiz 5gen82 (lot AF, 25/11/2026)

Nouveau chapitre (squelette du coordinateur, ids fixes `nuage-point-moyen`, `ajustement`, `mayer`, `moindres-carres`,
`correlation`, `interpreter`), rédigé d'après la proposition validée par le professeur (toutes les recommandations
suivies) et son manuel scanné (contextes et progression repris ; nombres recalculés ou nouveaux ; seules les données
publiques de l'espérance de vie en Belgique 2000–2014, Banque mondiale, reprises telles quelles ; « Down Jones »
et « degrés C° » corrigés ; « Sine Qua Non » remplacé par tableur + GeoGebra).

**Décisions appliquées** : seuils de r du document avec « très forte » pour 0,98 ≤ |r| < 1 et « parfaite » réservé à
|r| = 1 (tableau `featureTable` au § 5, tableau |r| de la synthèse, formulaire) ; moindres carrés à la main sur 5
points (G(3 ; 4), ΣXY = 6, ΣX² = 10, y = 0,6x + 2,2), sinon TI-30XB ; droite de x en y en remarque ; ajustements non
affines en reconnaissance seulement (+ courbe de tendance du tableur en astuce) ; tableur (MOYENNE, PENTE,
ORDONNEE.ORIGINE, COEFFICIENT.CORRELATION, courbe de tendance, R²) et GeoGebra (outil d'analyse de régression à deux
variables). Convention Mayer pour n impair : premier groupe de k données, second de k + 1 (comme 5gen36). σ divise
par n. Touches TI-30XB écrites prudemment (data, 2nd + data, 2-Var Stats, L1 / L2, ONE, CALC ; liste n, x̄, Sx, σx,
ȳ, Sy, σy, Σx, Σx², Σy, Σy², Σxy, a, b, r) avec la consigne de vérifier une fois sur la série à la main.

**Contenu** : « Ce que tu sais déjà (4e) » (moyenne / variance / σ, y − y₁ = a(x − x₁), sommet −B/(2A)) ; 4 intuitions
(billes en équilibre sur G, pourquoi deux points moyens, ressorts verticaux, quatre quadrants autour de G, troisième
variable cachée) ; « Le sais-tu ? » vérifiés : Quetelet (Gand 1796, Observatoire de Bruxelles, 1835, IMC), Tobias
Mayer (vers 1750, 27 observations d'un cratère, 3 inconnues, groupes de 9, tables de la Lune et longitude, récompense
britannique à sa veuve), Piazzi / Gauss / Legendre (Cérès 1er janvier 1801, retrouvée fin 1801 ; Legendre publie en
1805, Gauss en 1809 — l'usage des moindres carrés par Gauss dès 1795 est écrit comme SA déclaration), Galton 1886,
Bravais 1846 / Pearson vers 1896, Anscombe 1973 (données originales, r ≈ 0,816, y ≈ 0,5x + 3, recalculés) ;
« À quoi ça sert ? » : courbes de croissance, prévision de la consommation électrique, droite d'étalonnage, chocolat et
Nobel (Messerli 2012, r ≈ 0,79). 16 exemples résolus (la liste de la proposition en compte 16, son résumé disait 14),
tous recalculés par script (`scratchpad/af-5e6/calc*.py`) : G(3,5 ; 11,5) ; valeurs effacées 6 et 17 ; quatre
nuages (sel r ≈ 1, recette en arc r ≈ 0,03, bactéries r ≈ 0,95, aucune) ; y = −6x + 210 construite EXACTE (données
dont la droite des moindres carrés est exactement celle-là) avec 5 °C / −8 °C / 35 °C → 0 GWh ; espérance de vie
(G₁(3 ; 78,515), G₂(11 ; 80,21), a = 0,211875, b = 77,879375, G(7 ; 79,3625) vérifié, 2018 → 81,69) ; n = 7 (y =
0,4x + 0,3, G(4 ; 1,9) qui n'est pas le milieu (3,75 ; 1,8), seuil 5 % en semaine 12) ; données en désordre (y = 1,8x +
1,4 contre y = 3x − 4 sans tri, les deux passent par G : le contrôle par G ne détecte pas l'oubli du tri) ; 0,6x + 2,2 ;
Mayer 2⁄3 x + 2 : 22/9 ≈ 2,44 contre 2,4 ; TI : consommation selon la puissance (a ≈ 0,0267, b ≈ 2,79, 110 ch →
5,73 L, 6,8 L → 150 ch) ; Cov = 1,2, σx = √2, σy = √1,2, r ≈ 0,77 ; boissons (Cov = 81, r ≈ 0,96) et abonnements
(Cov = −656,25, r ≈ −0,998) ; cinq nuages r = 0,70 / 0,99 / 0,05 / −0,93 / −0,45 (données générées, r recalculé) ;
mortalité (a ≈ −7,57, b = 63, r ≈ −0,97, période 12 → −28) ; point aberrant (r 0,13 → 0,99) ; trois corrélations.
7 démonstrations (`exempleLibre` « Démonstration — … ») : Mayer passe par G (moyenne pondérée, milieu si effectifs
égaux) ; b = ȳ − a·x̄ pour a fixé (trinôme en b) ; a = ΣXY/ΣX² (trinôme en a) ; deux formules de Cov ; a = Cov/V(x),
même signe que r ; S_min = n·σy²(1 − r²) ⟹ −1 ≤ r ≤ 1 ; x′ = kx + c (k > 0) ne change pas r. Vidéos « à venir » (une
par section). Parcours : 3 parties (« Décrire et ajuster un nuage » § 1–2, « Deux droites d'ajustement » § 3–4,
« Mesurer et interpréter la liaison » § 5–6), 6 `titreCourt`, 18 phrases d'`essentiel`, 23 cartes ; synthèse en KaTeX
(6 items, tableau |r|, 7 points de checklist, forward vers la 6e), formulaire (4 groupes), carte du quiz 5gen82.
Formules longues coupées (la covariance de l'essentiel § 5 débordait de la fiche à 390 px).

**Nouveau kind `scatterPlot`** (`components/illustrations/ScatterPlot.tsx`, voir `illustration-components.md`) : axes
au bord du cadre avec brisure, droites dont l'étiquette se place du côté libre (ancre selon le signe de la pente),
cibles G / G₁ / G₂ (8 positions d'étiquette), écarts verticaux et VRAIS carrés (côté en pixels), quadrants par G avec
rectangles verts / rouges, bandes interpolation / extrapolation (étiquette en bas). 20 figures, captures relues en
clair et sombre (`scratchpad/af-5e6/figs/`, `figs-dark/`) ; chevauchements corrigés (étiquettes de droites, G₁ / G₂,
« 35 °C » contre le nom d'axe, signes des quadrants contre la brisure et le nom d'axe).

**Ateliers du lot G** (fusionnés depuis la branche commune) placés après la notion illustrée : jusqu'où prévoir
(après l'exemple des trois prévisions, § 2), nuage et Mayer (après la démonstration « Mayer passe par G », § 3),
ta droite contre les moindres carrés (après la comparaison Mayer / moindres carrés, § 4), quadrants (avant la
définition de la covariance, juste après la figure des quadrants), changer d'unités (après la démonstration
correspondante), devine r (après « associer cinq nuages »), point aberrant (après l'exemple du point aberrant, avant
le quartet d'Anscombe, § 6) ; « (démonstration 7) » de la légende remplacé par « (démonstration ci-dessus) » (les
démonstrations ne sont pas numérotées dans le cours).

**Vérifié** : `tsc` ; `verifier-enonces-evaluation` (chapitre strict) ; page à 390 / 1 280 px, clair / sombre, carte,
6 étapes (tiroirs ouverts, « Tout montrer ») et Réviser : 0 `$`, 0 astérisque, 0 notation clavier, 0 `NaN`, 0
`.katex-error`, 0 débordement, 0 erreur console ; aucune formule plus large que son bloc à 390 px.

## 5e (4h), Chapitre 6 — Statistique à deux variables : générateurs 5gen78–5gen81 (lot H2, 25/11/2026)

Quatre générateurs Transférer, sans bloc de cours ajouté : cartes 5gen79 « Quel est le meilleur ajustement ? » en fin de
§ 4 (`moindres-carres`), 5gen78 « Modéliser et prévoir en contexte », 5gen80 « Corrélation ou causalité ? » et 5gen81
« Détective d'erreurs : statistique à deux variables » en fin de § 6 (`interpreter`, après la dernière mise en garde) ;
descriptions en texte brut (Unicode : x̄, ȳ, n − 1). Notations et seuils du cours (σ division par n, Cov, « très forte »
dès 0,98, « parfaite » pour |r| = 1, renvois « cours, § n », touches de la TI-30XB reprises du § 4). Contextes du manuel
du professeur, nombres nouveaux ; banque de 45 situations rédigées pour 5gen80. Registres par ajout. Détail (écrans,
verdicts, profils, niveaux, mesures) : `.claude/rules/feuilles-evaluations.md`, « 5e ch. 6, lot H2 — 5gen78–5gen81 ».

## 5e (4h), Chapitre 6 — Statistique à deux variables : générateurs 5gen76, 5gen77, 5gen36–5gen38 (lot H1, 25/11/2026)

Cinq nouveaux générateurs notés sur le socle `AppEcransTrigo`, avec adaptateur papier complet (détail :
`.claude/rules/feuilles-evaluations.md`, section « 5e ch. 6, lot H1 — 5gen76, 5gen77, 5gen36–5gen38 »). Cartes
`entrainement` en FIN des sections du cours réel (fusionné depuis la branche commune : lot AF + ateliers du lot G) :
5gen77 « Point moyen et valeurs manquantes » à la fin du § 1 (`nuage-point-moyen`), 5gen76 « Lire un nuage de points » à
la fin du § 2 (`ajustement`), 5gen36 « Droite de Mayer » § 3 (`mayer`), 5gen37 « Droite des moindres carrés » § 4
(`moindres-carres`), 5gen38 « Covariance et coefficient de corrélation » § 5 (`correlation`). Aucun bloc de cours
ajouté. Registres par ajout (`registry.ts` : `CH_5E_STATISTIQUE_DEUX_VARIABLES` ; `evaluationAdapterRegistry.ts` avec
`versionPapier` ; `evaluationPayload.ts`, processus 2 / 1 / 2 / 2 / 2 ; `regroupementsPapier.ts` pour 5gen76).
Alignement sur le cours : convention de Mayer pour n impair (k puis k + 1 données), σ divisé par n (Sx signalé comme
piège), seuils de r du cours (« très forte » 0,98 ≤ |r| < 1, « parfaite » |r| = 1), a = Cov/V(x), touches TI-30XB
« 2-Var Stats », série de l'espérance de vie (Banque mondiale) reprise ; chaque ligne « Ce qu'on utilise » des corrigés
renvoie à sa section (« (cours, § n) »). Corrections trouvées pendant la vérification : zéros finaux des entiers
retirés (« 40 » → « 4 ») dans `nL`, boucle infinie des séries « très forte » (seuil de rejet trop large), arc du
nuage de sens inversé, pas de 2,5 de la grue arrondi à l'affichage (pas de 5), « +0 » et « −−0,4 » dans les
équations, prévision de x négative (série de l'espérance de vie), écran « associer » de 5gen76 : la planche des
quatre nuages était illisible sous le bandeau replié (nuage de l'écran seul, en grand), points posés sur un axe ou sur
la brisure (marges), tableau de 9 colonnes à en-tête long qui débordait dans l'aménagée (coupé en deux blocs).
