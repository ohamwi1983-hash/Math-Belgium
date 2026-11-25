---
paths:
  - "src/components/chapter/**"
---

# Composants réutilisables du gabarit de chapitre

- `ChapterPage` (`components/chapter/ChapterPage.tsx`) — le gabarit lui-même, en **parcours « une
  étape par écran »** (décision de l'utilisateur du 22/11/2026, maquettes ACarte / Main / AExemple /
  APC / CReviser ; téléphone d'abord). Voir la section « Parcours » ci-dessous.
- `BlockRenderer` / `BlockList` (`components/chapter/BlockRenderer.tsx`) — bascule sur
  `Block.kind` pour rendre chaque bloc de contenu.
- `Rappel`, `Methode`, `Attention`, `Astuce`, `PiegeClassique`, `Intuition`
  (`components/chapter/Callouts.tsx`) — callouts stylés distinctement (couleur + icône propres à
  chacun, cohérentes sur tout le site). `Intuition` (violet, réutilise `--plan`) est le plus
  récent : voir `.claude/rules/content-authoring.md` pour son rôle exact (image concrète, analogie,
  "pourquoi" — jamais un `label` méta comme "Ajout pédagogique").
- `ExempleResolu`, `WrongRight`, `CarteEntrainement`, `RecapFinal`, `ChecklistRelecture` (dossier
  `components/chapter/`) — `ChecklistRelecture` est un composant à part entière (fichier propre),
  distinct de `RecapFinal` : l'un résume la théorie ("Ce qu'il faut retenir"), l'autre est la
  liste de vérifications de méthode à se poser avant de rendre sa copie. `RecapFinal` l'utilise en
  composition quand `recap.checklist` est fourni.
- `SignTable` (`components/chapter/SignTable.tsx`) — tableau de signes/variation, lignes alignées
  colonne par colonne (`tone: 'zero' | 'pos' | 'neg' | 'plain'` par cellule).
- `FeatureTable` (`components/chapter/FeatureTable.tsx`) — tableau à en-tête fixe (colonnes
  nommées, ex. "Fonction | Domaine | Image"), réutilisé tel quel pour `recap.table`.
- `OperationChain` (`components/chapter/OperationChain.tsx`) — chaîne HTML/flexbox (pas SVG) de
  valeurs KaTeX reliées par des opérations nommées sur les flèches, `direction: 'forward' |
  'backward'` pour une chaîne qui se lit à l'envers (ex. "défaire" une composition).

Voir `.claude/rules/interactive-widgets.md` pour `InteractiveWidget.tsx` (montage des Web
Components portés, utilisé par `BlockRenderer` et `CarteEntrainement`) — et
`.claude/rules/content-history.md` pour l'historique des bugs/corrections apportés à ces
composants au fil des migrations de chapitres (ex. le bug du cadre vide dans `ExempleResolu`).

## Parcours « une étape par écran » (`ChapterPage`)

**Une seule route** `/{niveau}/{chapitre}` ; la vue vient du fragment de l'URL (`useLocation`) :
aucun → **carte** (onglet Apprendre), `#<sectionId>` → **étape** (les liens `…#sectionId` du carnet,
de Smartschool, de « Retour à la section » ouvrent la bonne étape), `#reviser`, `#entrainer` → onglets.
Chaque changement passe par `navigate()` : le bouton retour ramène à la vue précédente ; haut de page
et focus sur le titre de l'étape à chaque navigation.

**Tout le chapitre reste dans le DOM**, dans l'ordre et avec le balisage d'avant (en-tête, intro,
sections, `RecapFinal`, `Formulaire`) : la vue ne fait que MASQUER le reste à l'écran
(`.chapter-layout.parcours[data-vue]`, règles toutes sous `@media screen` dans `index.css`). Raisons :
pré-rendu SEO (texte de toutes les sections dans `dist/{route}/index.html`, même DOM que les
visiteurs, pas de page spéciale robots, pas de flash), impression et export HTML strictement
inchangés (l'ancêtre `.chapter-layout` est hors de `.page`, seul nœud cloné par `buildHtml.ts` ; à
l'impression aucune règle d'écran ne s'applique). Vérifié : texte `pdftotext` des PDF A4 des 23
chapitres (normal), du pilote (aménagé) et de l'export HTML identique à avant. **Ne jamais** mettre
une règle de masquage sans `@media screen` + `.parcours` ; tout élément propre à l'écran porte
`no-export`. Piège trouvé : les formules masquées ne chargent pas les polices KaTeX —
`imprimer.ts::chargerPolicesImpression` les charge toutes avant l'impression (et en tâche de fond).

Composants :
- `CarteChapitre.tsx` — `OngletsChapitre` (`tablist`, flèches/Début/Fin), `BlocReprendre`
  (progression « n / N étapes » + « Reprendre : n. titre » / « Commencer »), `ListeEtapes` (parties,
  pastille lue ✓ / en cours / numéro, `aria-current="step"`, durée ; variante `cote` pour la colonne
  de gauche d'une étape sur ordinateur), `LienVue` (vrai `<a href="#…">` intercepté).
- `ContenuEtape.tsx` — contenu d'une étape (et de l'intro « Avant de commencer », repliée sur la
  carte). Blocs dans l'ordre écrit ; les exemples sont rendus à leur place avec `en-tiroir` (imprimés,
  masqués à l'écran) et relus dans un **tiroir** (`button` + `aria-expanded`) pas à pas (« Montrer
  l'étape suivante », « Tout montrer »). Chaque partie de l'étape (jusqu'au prochain `subheading`) se
  termine par ses cartes **Manipuler** puis ses tiroirs (exemples, « Dans la vraie vie », « Le
  sais-tu ? ») ; l'étape se termine par ses vidéos (lecteur chargé à l'ouverture) et ses cartes
  **À toi**. ≥ 1200 px : Manipuler, Vidéo et À toi passent dans la colonne de droite (`ColonneDroite`).
  `historique`, `application`, `video`, `atelier`, `entrainement` (tous `no-export`) ne sont plus
  rendus dans le fil. `Essentiel` : encadré orange (champ `essentiel`).
- `NavEtape` (`ChapterPage.tsx`) — barre « ‹ n−1 · J'ai compris · n+1. titre › ». Jamais de titre
  coupé au milieu d'un mot (retour utilisateur : « 5. Soustraire u… » sur iPhone) : chaque lien porte
  `.nav-long` (« n. titre ») et `.nav-court` (« n ») ; si `.nav-long` ne tient pas en entier, classe
  `nav-compacte` → seulement « n › » (« Réviser › » pour la dernière étape). Mesure en
  `useLayoutEffect` (rétablir, mesurer `scrollWidth`/`Range`, replier), relancée par un
  `ResizeObserver` (largeur de la barre) et `document.fonts.ready`. Titre complet dans `aria-label` et
  `title`. Téléphone : le précédent reste « ‹ n » ; ordinateur : même règle pour les deux liens.
- `PanneauModal.tsx` — atelier ou vidéo dans un `<dialog>` natif (`showModal` : focus piégé, Échap,
  retour du focus) : plein écran sur téléphone, grand panneau (≤ 1100 px) sur ordinateur ; page
  verrouillée (`html.panneau-ouvert`), widget monté à l'ouverture, figures sans défilement tactile
  (`InteractiveWidget figuresTactiles`), épinglage de la figure propre au panneau
  (`InteractiveWidget panneau` : jamais par-dessus un réglage ou une consigne, voir
  `interactive-widgets.md`).
- `ReviserVue.tsx` — « Teste-toi » (champ `cartes`, « à revoir » remises en fin de paquet), « La fiche
  du chapitre » (une ligne par `essentiel`), liens vers synthèse / formulaire / quiz / impression
  (rendus ensuite par `ChapterPage`, visibles dans l'onglet Réviser).
- `src/lib/parcoursChapitre.ts` — progression et cartes en `localStorage` (clés
  `parcours:{niveau}/{slug}`, `cartes:{niveau}/{slug}`, try/catch partout, rien envoyé au serveur),
  `dureeEtape`, `titreCourt`. Clé GLOBALE `parcours:derniere-etape` (`{ "4e": { chapitre, section,
  quand }, … }`, une entrée par année) écrite par `ouvrir` à chaque étape ouverte, en plus de la clé du
  chapitre (inchangée) : lue par l'accueil (`lireDernieresEtapes`, bandeau « Reprendre ») et par le
  script en ligne d'`index.html`. `lireParcours(chapter)` est exporté (progression sans abonnement).

Lecture (écran seulement) : corps, encadrés, légendes, tiroirs en Andika via le jeton `--lecture`
(sur `.chapter-layout.parcours`), titres en Fraunces, interface en Work Sans ; 17 px, interligne
1,6 ; fond uni ; légendes à gauche ; formules `nowrap` qui défilent dans `.math-inline`. Quatre rôles
d'encadrés : orange (essentiel, définition, méthode, rappel), rouge (attention, piège), bleu
(exemple), violet (À toi) ; astuce/intuition en neutre clair. Ordinateur (≥ 760 px) : étape = carte
des étapes à gauche + article ≤ 760 px ; ≥ 1200 px : + colonne de droite. `OutilsChapitre`
(Feuilles, Carnet, Projeter — ces deux-là professeur connecté seulement —, Imprimer) : bas de la carte et colonne de gauche d'une étape.

## Mode projection « Projeter en classe » (maquettes du 24/11/2026)

Maquettes validées Main (lanceur, téléphone d'abord), Titre, Essentiel, Exemple, Teste (diapos
1 280 × 720). **Réservé au professeur connecté** (décision de l'utilisateur) : bouton, lanceur, page de
projection, fenêtre des diapos et PowerPoint. Rien n'est enregistré côté serveur.

**Où** : deux morceaux, choisis pour ne rien changer à la page pré-rendue.
- Lanceur = vue `#projeter` de la page du chapitre (même mécanisme que `#reviser`, `Vue` gagne
  `'projeter'`) : `components/projection/LanceurProjection.tsx` (chargé à la demande, `lazy`), rendu
  SEULEMENT quand le fragment vaut `#projeter` — le pré-rendu (sans fragment, sans session) n'en contient
  rien ; règle d'écran `.parcours[data-vue="projeter"] .page > :not(.lanceur-projection)` masquée.
  Bouton « Projeter » dans `OutilsChapitre` (bas de la carte, colonne de gauche d'une étape) : comme
  « Carnet », seulement si `useCompte()` (sans `demarrer`) est `connecte` avec profil actif → absent du
  pré-rendu et pour un visiteur (supabase-js non téléchargé).
- Diapos = route dédiée `/{niveau}/{chapitre}/projeter?etapes=…&inclure=…[&role=diapos|prof][&repli=1]`
  (`components/projection/ProjectionPage.tsx`, `lazy` dans `App.tsx`, absente de `scripts/routes.mjs`,
  `usePageNonIndexee`). Route plutôt que fragment : plein cadre sans `SiteHeader` ni le DOM du chapitre
  entier, une URL à donner à `window.open` (deux écrans), un morceau de code chargé seulement en classe.
- Garde : `GardeProfesseur` (même règle que `PageReservee` : `useCompte({ demarrer: true })`, profil
  actif) SANS redirection : « Connecte-toi pour projeter ce chapitre » + lien
  `/connexion?retour=<page demandée, fragment compris>`. Lanceur, route et fenêtre des diapos (même
  navigateur, même session) passent tous par elle.

**Données → diapos** (`lib/projection/diapos.ts`, PUR) : `construireDiapos(chapter, choix)`, aucune
donnée réécrite. Par étape cochée, dans l'ordre : `titre` (niveau · chapitre, « Étape n · partie »,
`title`, `kicker`, intertitres en puces) ; `essentiel` (champ `essentiel`, + première figure de
l'étape à côté — sauf phrases longues, > 300 caractères : la figure passe sur sa propre diapo, le texte
resterait sinon sous 28 px) ; puis dans l'ordre écrit : `figure` (chaque `illustration`/`illustrationGroup`, titre = dernier
`subheading`), `exemple` (formule = énoncé, étapes + résultat révélés une à une), `libre` (`exempleLibre`
bloc par bloc ; `demo` si son label commence par « Démonstration »), `atelier` (widget monté en
direct) ; enfin une diapo `teste` par carte (`cartes` : question, minuteur 1 min, réponse au clic).
Cases du lanceur (`INCLUSIONS`) : L'essentiel, Figures, Exemples, Teste-toi, Ateliers (cochées) et
Démonstrations (décochée). Chaque diapo porte ses `notes` (corrigé, réponse, légende : vue du
professeur et notes PowerPoint) et son nombre d'étapes de révélation `pas`. Choix mémorisé par
chapitre (`localStorage` `projection:{niveau}/{slug}`, try/catch) ; défaut : la dernière étape ouverte.

**Rendu** (`Diapo.tsx` + `projection.css`) : 1 280 × 720 px logiques, mis à l'échelle par `Scene`
(`transform: scale`, mesures toujours en px logiques). Composants du site réutilisés tels quels
(`RichText`, `Illustration`, `BlockRenderer`, `InteractiveWidget sansEpingle` — atelier mis à l'échelle
par `zoom`, jamais sous 0,8 : au-delà sa zone défile). Fond clair dans les deux thèmes : `.theme-clair`
recopie les jetons CLAIRS de `:root` (figures, encadrés, KaTeX) — à tenir à jour si un jeton de couleur
est ajouté à `index.css`. Tailles en `calc(N * var(--echelle))` : corps 32 px (exemple), 30–32 px
(essentiel), 28 px (démonstration), titres 42–76 px. Une étiquette d'étape longue (> 16 caractères)
passe au-dessus du texte ; PAS de `text-transform: uppercase` sur les étiquettes (« n→+∞ » deviendrait
« N→+∞ »). Énoncé / question longs : titre réduit (`est-long`).
- **Découpage** (`Paginateur.tsx`) : chaque exemple / démonstration est rendu hors écran tout révélé ;
  ses lignes (blocs) sont réparties sans coupure sur autant de diapos que nécessaire (« · suite »),
  avec 12 % de tolérance (absorbée par l'ajustement, jamais sous 28 px pour le corps de 32 px) ; jamais
  le résultat seul sur une page. Même calcul dans les deux fenêtres et dans le PowerPoint.
- **Ajustement** (`useAjustement`) : si le contenu déborde encore, `--echelle` descend par pas de 0,04
  (dernier recours ; mesuré : voir Vérifications).

**Projection** (`ProjectionPage.tsx`) : `useProjection` = état `{ index, pas, blanc, debut, minuteur }`
partagé par `BroadcastChannel` (`math-belgium-projection:{niveau}/{slug}`) : chaque changement local est
diffusé, un état reçu appliqué sans rediffusion ; une fenêtre qui s'ouvre demande l'état, seule une
fenêtre « active » répond. Avancer = étape de révélation suivante, puis diapo suivante (reculer : la
diapo précédente revient ENTIÈRE). Clavier (écouteur posé par cette page seulement, rien ailleurs) :
→ ↓ Page suiv. Espace Entrée → suivant ; ← ↑ Page préc. Retour arrière ; Début / Fin ; B ou « . » écran
blanc ; G vue d'ensemble ; Échap ferme ce qui est ouvert sinon ouvre la vue d'ensemble ; S stylo ;
H surligneur ; Q équerre ; C compas ; K calculatrice ; Ctrl/Cmd+Z annuler ; F / F5 plein écran (aucune
de ces lettres n'était prise). Une touche dans un champ ou un atelier (Shadow DOM compris,
`composedPath`) lui revient ; sur un bouton, seules les lettres restent des raccourcis. Clic sur la diapo = suivant (sauf boutons, atelier, stylo actif) ;
glisser au doigt = suivant / précédent.
- Barre du bas (`BarreOutils`) : fil « chapitre · § n titre court », stylo, équerre, compas,
  calculatrice, minuteur (1/2/3/5/10 min, affiché en haut à droite, rouge clignotant à 0), écran blanc,
  vue d'ensemble (grille de vignettes `mode="vignette"`, atelier non monté), plein écran (Fullscreen
  API, refus ou absence → message « utilise F11 »), ‹ n / N ›, quitter (→ `#projeter`). Masquée (et le
  curseur) après 3 s sans mouvement. Palettes centrées au-dessus (`.projection-palettes`) : fond de
  l'écran blanc, dessin, minuteur. Infobulles = nom + raccourci.

**Outils de dessin et instruments** (décision du 24/11/2026 « toutes tes propositions » ; maquettes D1
palette, D2 équerre, D3 compas + calculatrice). Pointer events partout (souris, doigt, stylet, tableau
interactif ; `touch-action: none` sur ce qui se manipule, classe `.projection-interactif` = jamais
« diapo suivante » au clic ni au glisser).
- `Tableau.tsx` (`Annotations`) par-dessus la diapo, en px logiques 1 280 × 720 : canvas **fluo**
  dessous (`mix-blend-mode: multiply` — le conteneur `.projection-tableau` ne doit créer AUCUN contexte
  d'empilement, sinon le fluo ne se fond plus avec la diapo) puis canvas **stylo** (traits, arcs) ; la
  gomme (44 px, `destination-out`) passe sur les deux. Palette `PaletteDessin` (`BarreOutils.tsx`) :
  stylo 4 couleurs, fluo 4 couleurs pastel (jaune, vert, rose, bleu ; trait 22 px, bouts plats), 3
  épaisseurs (`EPAISSEURS` : 3 / 5 / 9 px, aussi pour les arcs), gomme, annuler, tout effacer.
- **Gardées par diapo** : `Map<index, ElementAnnotation[]>` (traits, arcs, résultats épinglés) en
  mémoire de la page SEULEMENT (rien en base, rien hors du navigateur) ; on les retrouve en revenant sur
  la diapo. L'écran blanc est une page à part (clé −1). « Annuler » (bouton, Ctrl/Cmd+Z hors champ)
  retire le dernier élément de la page courante (un trait de gomme annulé fait réapparaître ce qu'il
  effaçait) ; « Tout effacer » vaut pour la page courante.
- **Synchronisation** (deux écrans, même `BroadcastChannel`) : `trait` + `point` (tracé libre), `element`
  (ajout OU remplacement par id : trait à l'équerre, arc en cours, étiquette déplacée), `retirer`, `effacer`,
  `annotations` (tout, en réponse à la `demande` d'une fenêtre qui s'ouvre ou se recharge : la fenêtre
  des diapos ouverte après coup reçoit ce qui était déjà écrit), `instruments`. Fond de l'écran blanc
  dans `EtatProjection.fond`.
- **Instruments** (`instruments.ts`, magasin externe `useSyncExternalStore` partagé entre fenêtres :
  un déplacement ne redessine que l'instrument, jamais la diapo ; indépendants de la diapo, comme un
  instrument posé au tableau) :
  - **Équerre Aristo** (Q) : triangle rectangle isocèle transparent, hypoténuse de 13 carreaux graduée
    en carreaux (0 au milieu, demi-graduations), rapporteur demi-cercle (traits tous les 5°,
    étiquettes 30/45/60 de chaque côté), axe médian pointillé. Poignée ronde = tourner autour du 0,
    angle affiché en direct (sens mathématique) avec cran à ±3° sur les multiples de 30° et de 45°.
    Re-clic = masquée.
    **Tracer directement** (décision du 25/11/2026) — règle d'appui sur l'équerre (`surEquerre`) : à
    ≤ seuil d'un des trois bords, dedans ou dehors (`seuilBord` : 12 px logiques à la souris / au
    stylet, 20 au doigt, jamais moins de 10 / 22 px RÉELS — vue réduite du professeur —, plafond 30) =
    **tracer** le long de ce bord, SANS activer le stylo, dans la couleur et l'épaisseur du stylo courant
    (fluo si le surligneur est l'outil actif) ; gomme ou compas actifs gardent la main ; ailleurs dans
    le triangle = **déplacer** ; juste autour mais au-delà du seuil = l'outil actif s'il y en a un, sinon
    rien. Zone d'appui = polygone `.eq-zone` transparent (le triangle + un trait de 2 × seuil au doigt) ;
    curseur choisi au survol (`crosshair` près d'un bord, `move` ailleurs). Le trait n'est ajouté qu'après
    4 px réels de mouvement (un simple appui ne laisse rien et ne fait pas « diapo suivante ») ; le clic
    qui suit le relâchement de TOUT geste est avalé (il tombait sinon sur la diapo = diapo suivante).
    Palette de l'équerre (`PaletteEquerre`, au-dessus de la barre tant qu'elle est posée ; dans la vue
    du professeur à côté de la palette de dessin), état PARTAGÉ dans `EtatEquerre` : **Segment** (borné
    au bord) / **Droite** (prolongée jusqu'aux bords de la diapo, `droiteDansDiapo`) ; **cadenas** =
    rotation verrouillée (`verrou` : poignée remplacée par un cadenas, la tirer déplace) pour faire
    glisser l'équerre et tracer des parallèles. **Perpendiculaire** : les deux côtés de l'angle droit
    sont perpendiculaires (vérifié : 90,000°) — côté gauche posé sur une droite, tracer le long du côté
    droit. **Graduation** : en segment le long de l'hypoténuse, extrémités accrochées au demi-carreau à
    ≤ 4 px ; pendant le tracé, petits traits aux extrémités (couleur du trait) et longueur sous
    l'hypoténuse (`EtatEquerre.mesure`, donc visibles sur l'autre écran) dans l'unité du compas
    (« 2,5 carreaux » sur quadrillage / repère, sinon « 2,5 u ») ; retirés au relâchement. Annuler,
    annotations par diapo et deux écrans : comme les autres traits (`element` ajout / remplacement).
  - **Compas** (C, outil de la palette : couleur et épaisseur du stylo) : appuyer sur le centre et
    écarter (rayon), relâcher ; appuyer ensuite loin du centre et tourner = arc (angles « déroulés »,
    tour complet possible) ; appuyer près du centre = nouveau centre. Rayon affiché dans UNE unité
    fixe, 1 carreau = 40 px logiques (32 × 18 sur la diapo, la même que la graduation de l'équerre) :
    « r = 6 carreaux » quand le quadrillage / repère est affiché (centre aimanté sur un nœud à 10 px,
    rayon sur le demi-carreau à 4 px), sinon « r = 6,3 u » — même nombre dans les deux cas, choisi
    parce que la diapo n'a pas d'échelle réelle (pas de « cm » honnête possible).
  - **Calculatrice** (K, `Calculatrice.tsx` + `lib/projection/calculatrice.ts` PUR) : générique (aucune
    apparence de marque), flottante, déplaçable par sa barre de titre, en px logiques (même place sur
    les deux écrans ; dans la vue réduite du professeur agrandie jusqu'à 80 % de la taille réelle, sans
    dépasser la diapo). Saisie libre au clavier JAMAIS bloquée (`type="text"`, pas d'`inputMode`, seul
    `normaliserSigneMoins`) + touches (2nde → sin⁻¹…, ln, log, xʸ, e, sin, cos, tan, √, x², chiffres,
    + − × ÷, parenthèses, π, virgule, Ans, =). Parseur MAISON (descente récursive, jamais
    `eval`/`Function`) : multiplication implicite, −2² = −4, puissances à droite, parenthèses non fermées
    fermées d'office, angles remarquables exacts en DEG. Affichage KaTeX : écho de l'expression (sin(40°)
    en DEG), valeur à 10 chiffres significatifs (virgule, espaces fines, « − »), « ≈ » si arrondie ;
    « Exact » = forme reconnue par la valeur à 10⁻¹¹ près quand le décimal est arrondi (fraction q ≤ 1 000,
    multiple de π q ≤ 60, ±a√b/q), sinon décimal. Erreurs en clair (« « abc » n'est pas reconnu »,
    « Division par zéro », hors du domaine), rien n'est effacé. « Épingler » pose « expression = valeur »
    (KaTeX) sur la page courante : étiquette déplaçable, annulable, retirable à la gomme (×). Deux
    écrans : bouton « Masquer à la classe » (vue du professeur seulement) — la calculatrice n'est plus
    affichée sur l'écran projeté.
- **Écran blanc** : choix « uni / quadrillé / repère » (palette au-dessus de la barre ; boutons à côté
  d'« Écran blanc » dans la vue du professeur), partagé ; quadrillage de 40 px, repère = axes gradués,
  origine au centre (`FondBlancTableau`). Les instruments marchent dessus.
- Vue du professeur : stylo + équerre / compas / calculatrice au-dessus de la diapo projetée, palette
  en dessous (sans les intitulés) ; tout ce qui y est fait apparaît au tableau, et inversement.
- **Un écran** : « Lancer » demande le plein écran DANS le clic (la navigation interne le garde).
  **Deux écrans** : `window.open` DANS le clic (`lib/projection/fenetre.ts`, nom fixe) → fenêtre
  `role=diapos` (accueil « Plein écran / Continuer sans ») ; la page courante devient la vue du
  professeur (`role=prof`) : diapo projetée (stylo qui écrit aussi au tableau ; atelier en vignette, il
  se manipule sur l'écran projeté), suivante (prochaine étape ou diapo), notes, minuteur, temps écoulé,
  écran blanc, vue d'ensemble, « Ouvrir la fenêtre des diapos » si elle est fermée. Fenêtre bloquée →
  un écran (`repli=1`) avec message.

**PowerPoint** (`lib/projection/exportPptx.tsx`, chargé à la demande avec `pptxgenjs` 4.0.1 —
l'ancien `buildPptx`/html2canvas avait été retiré en septembre, voir `export-pipeline.md`) : mêmes
diapos (même découpage), état final. Textes sans formule ni figure (surtitre, titre, phrases de
l'essentiel, question, réponse) = vraies zones de texte modifiables (Georgia / Calibri / Consolas, à
leur place mesurée) ; le reste = image de fond 1 920 × 1 080 (SVG `<foreignObject>` autonome : CSS du
site + polices Fraunces / Work Sans / Plex Mono — lues depuis la feuille Google Fonts — et KaTeX en
`data:`, woff2 latin / latin-ext seulement ; Shadow DOM des ateliers aplati) ; notes = `notes` en texte
(`texteBrut` / `latexEnTexte`). Une diapo par diapo finale, jamais une par étape de révélation.
Les annotations, instruments et résultats épinglés ne sont PAS exportés (état de classe, non gardé).

**Vérifications** (24/11/2026, dossier de travail `projection/` : `verif.mjs`, `verif-prod.mjs`,
`compter_pptx.py`, `comparer_prerendu.py`) : build de test (`NODE_ENV=development vite build --mode test`
+ faux client connecté / `anonyme`) sur 4e ch. 6 (§ 6–11, 24 diapos), 5e ch. 3 (§ 3, 14 diapos) et 6e
ch. 1 (§ 4 avec démonstrations et ateliers, 26 diapos), 1 280 × 720 et 1 920 × 1 080 : chaque diapo et
chaque étape de révélation mesurée (aucun texte hors de la zone de contenu, 0 `.katex-error`, fond
clair, aucun corps de texte sous 28 px), révélation pas à pas, stylo / gomme / effacement au changement
de diapo, minuteur, écran blanc, vue d'ensemble (G, Échap, vignette → diapo), Page préc., barre masquée
après 3 s, aucun raccourci hors projection ; deux écrans (deux pages : navigation et révélation dans
les deux sens, stylo du professeur reproduit au tableau, minuteur partagé) et fenêtre bloquée (repli
+ message) ; lanceur iPhone 13 clair / sombre (diapos claires en sombre, pas de défilement horizontal,
cibles ≥ 36 px) ; PowerPoint des trois chapitres (python-pptx : même nombre de diapos qu'à l'écran,
une image + des zones de texte + des notes par diapo ; rendu LibreOffice relu) — 1 062 vérifications,
0 erreur console. Build de PRODUCTION, visiteur sans session : aucun bouton, lanceur et route gardés
(20 vérifications). Pré-rendu : texte, balises méta et JSON-LD des 24 pages identiques à avant.
Piège trouvé : un `BroadcastChannel` créé dans un `useMemo` et fermé au démontage se tait sous
StrictMode (démontage / remontage simulé) — créer et fermer le canal dans le MÊME effet.
Outils (24/11/2026, dossier de travail `projection-outils/` : `verif-outils.mjs`, `test-calc.ts`) : Vite
de développement + faux client connecté, 4e ch. 6, 1 280 × 720 et 1 920 × 1 080 — fluo (multiply, gomme
qui l'efface), 3 épaisseurs croissantes, annuler (bouton, Ctrl+Z, arc, étiquette), retour sur une diapo
annotée identique au pixel près, équerre déplacée + tournée (cran à 30°) + trait aimanté (direction =
celle de l'équerre à 0,01° près malgré un tracé en zigzag), compas sur quadrillage (centre aimanté,
« r = 6 carreaux », arc de 90°), repère, calculatrice (8 × sin(40) ÷ sin(65) en DEG ≈ 5,673 901 241,
écho sin(40°), saisie « 2 + abc » gardée avec message, √(12)÷3 exact 2√3/3, mode ≈), épingler +
déplacer ; deux fenêtres (prof + diapos) : trait écrit avant l'ouverture reçu, fluo, équerre (position),
compas, calculatrice, épingle, « Masquer à la classe », annuler, trait du tableau vu chez le
professeur, repère partagé — 78 vérifications, 0 erreur console. Pièges : un `div` en
`position: absolute; left: 50%` + `translateX(-50%)` plafonne sa largeur à la moitié du parent (les
palettes passaient sur deux lignes) — `left/right` + `align-items: center` ; la vue du professeur
change de taille quand la palette s'ouvre : recalculer les coordonnées d'écran après coup.
Tracer à l'équerre (25/11/2026, dossier de travail `equerre-tracer/` : `verif-equerre.mjs`) : Vite de
développement + faux client connecté, 4e ch. 6, 1 280 × 720 et 1 920 × 1 080 — stylo rangé : trait droit le
long de l'hypoténuse malgré un tracé en zigzag (couleur / épaisseur du stylo, même diapo), simple appui = rien,
glisser ailleurs = déplacer, curseur au survol, Ctrl+Z ; « Droite » touchant les bords de la diapo ; côtés
de l'angle droit perpendiculaires (90,000°) passant par le sommet ; cadenas : glissée le long de la 1re
droite puis 2e perpendiculaire parallèle, poignée verrouillée sans rotation ; trois parallèles à 30°
(écarts de 70,0 px, segments −4,5 → 4,5) ; repère « 2,5 carreaux » / « 3 u » pendant le tracé et retiré
au relâchement ; gomme prioritaire ; pages séparées. Doigt (CDP) : trait sur le bord, déplacer, toucher
sans glisser = rien, jamais de diapo suivante. Deux fenêtres : repère et longueur vus au tableau pendant
le tracé du professeur, trait reçu, Droite / cadenas partagés, droite du tableau reçue chez le
professeur, Ctrl+Z — 63 vérifications, 0 erreur console ; `verif-outils.mjs` repassé (77 + 1 : son
repère d'écran du professeur, pris avant l'ouverture de la palette de l'équerre, est à recalculer).

## Page d'un générateur `/entrainement/:chantier/:generatorId` (refonte du 22/11/2026)

Maquettes A (partout), B (plusieurs étapes), C (choix entre graphiques), D (réponse révélée), E
(rappels), ordinateur ; téléphone d'abord. **Aucun `App*.tsx` réécrit** : tout passe par le cadre
partagé ; contenu, aides, tentatives et vérification inchangés, `SelecteurVarianteDev` intact.
- `EntrainementPage` : `BarreGenerateur` (barre d'une ligne : retour ≥ 44 px vers la section,
  « niveau · chapitre », segments, « Étape n / N ») à la place de `SiteHeader` + fil d'Ariane + lien
  retour ; le `<h1>` du générateur reste (18 px), surtitre et ligne chapitre masqués à l'écran.
- `components/cadreGenerateur.ts` : magasin externe (`useSyncExternalStore`). `ProgressionPuces`
  y PUBLIE ses segments et son `onSegmentClick` (ne dessine plus rien sur place dans ce cadre) ; la
  barre, `PanneauRappels` et `EnTeteExercice` s'y abonnent. Publier ne re-rend jamais le générateur.
- `components/CadreActions.tsx` : ne déplace aucun nœud ; REPÈRE et marque `data-barre="principal"`
  (seul `.btn-primary` visible de la carte, sinon `.validation-suivant`, sinon le dernier « Valider » ;
  sinon rien), `"aide"` (`BoutonAide`, attribut `data-bouton-aide`, qui le précède), `"retour"` (message
  qui le suit). < 1024 px : barre fixe du bas (`env(safe-area-inset-bottom)`, au-dessus du clavier via
  `visualViewport` → `--clavier`) ; ≥ 1024 px : boutons sous l'étape. `data-saisie` (champ actif sur
  écran tactile) : énoncé épinglé compact. Tiroir d'aide : COPIE en lecture seule des `.aide-5e` /
  `.triangle-quelconque-aide` (l'original reste dans la page), « Aide suivante » clique le vrai bouton.
  Ordinateur : énoncé (`.entete-exercice`) en position fixe calculée sur la carte (`data-enonce-fixe`,
  `--col-x/-w/-top`), étapes à droite.
- `ValidationEcran` : verdict + « Réponse attendue » dans un seul encadré (`.validation-verdict`),
  bouton `.validation-suivant` (libellé `labelSuivant` inchangé). Bonne réponse + `corrigeDetaille` :
  « Voir comment on y arrive » replié (`CorrigeDepliable`, aussi dans `FicheReponseEcran` via
  `EntreeHistoriqueEtape.corrigeDetaille`) — voir `feuilles-evaluations.md`, « Consultable après
  CHAQUE réponse » ; toute appli à corrigé a sa fiche (un générateur mono-écran publie UNE puce,
  « Étape 1 / 1 », cliquable dès l'écran clos). `PanneauRappels` (« Ce qu'on sait
  déjà » des 3 `RecapitulatifPanel` et des socles `AppEcransTrigo`/`AppEcransExp`) : une ligne ≥ 48 px
  par écran clos, ✓ vert / ✓ jaune (aide) / ✗ rouge, « Revoir › » seulement si la correspondance
  entrée ↔ écran clos est sûre (même nombre, même verdict) et que le générateur a une fiche.
- `EnTeteExercice` (×3) : carte sobre ; repliée en une ligne (touche pour déplier) dès qu'un écran
  est clos. Bandeau compact (replié, ou `data-saisie`, < 1024 px ; correctif du 24/11, 5gen32 / 5gen35
  rognés) : contenu aplati en UNE ligne (figures, tableaux, images non aperçus ; consigne montrée si
  pas de bloc de données) ; `apercuEnonce` (`CadreActions`) mesure formules KaTeX entières et mots, pose
  `data-apercu-coupe` + `--apercu-coupe`, et « … » recouvre tout ce qui ne tient pas — jamais une
  formule coupée au milieu, rien de masqué sans « … ». Pas de `text-overflow: ellipsis` : les éléments
  positionnés de KaTeX restent peints au-delà des points de suspension (Chromium). **Aperçu jamais vide
  (25/11, 6gen106)** : un bloc de données SANS texte hors figures / tableaux / images (figure seule)
  donnait un bandeau « … » seul ; `apercuEnonce` (`donneesSansTexte`) pose alors `data-apercu-consigne`
  et l'aperçu montre la consigne générale (même rendu que « pas de bloc de données »), « … » final pour la
  figure masquée — automatique, aucun générateur à modifier (bénéficiaires recensés : rapport du lot H2,
  6e ch. 7) ; un bloc qui a du texte garde l'aperçu d'avant. Deux options OPT-IN de `EnTeteExercice`
  (×3, mêmes props) : `apercu` (résumé explicite, ex. 6gen106 « 7 × 4 : A → B, sans P » — span
  `.entete-exercice-apercu`, jamais affiché déplié, seul aperçu du bandeau `.avec-apercu`, « … » final)
  et `figureToujoursVisible` (copie de la figure rendue seulement quand l'énoncé est replié,
  `.entete-figure-replie` : sous la ligne d'aperçu, 130 px de haut au plus, 100 px clavier ouvert,
  chevron calé sur la ligne, « … » limité à la ligne). Socle `AppEcransTrigo` : `DefinitionEcrans.apercuEnonce(e)`
  et `ConfigAppEcrans.figureToujoursVisible` (6gen106 seulement aujourd'hui). C : `EtapeSelectionGraphiqueQCM` (6gen8/11/20/21) et `EtapeApparierGraphiqueCyclo`
  (6gen5) en grille 2 × 2 dès 312 px, carte cliquable (même sélection), `LoupeGraphique` plein écran ;
  6gen20 : graphique de f épinglé (`ReferenceEpinglee`). 5gen25 : grille dès qu'il y a la place.
- Styles : `src/entrainement/cadre.css`, chargé APRÈS `theme.css`, tout sous `.entrainement`.
  Échelle 12 (capitales) / 14 / 16 / 18 px ; Andika (`--lecture`) pour énoncé et consignes. Piège
  trouvé : `.btn:hover:not(:disabled)` (plus spécifique que `.btn-primary:hover`) rendait « Valider »
  pâle sous texte blanc au survol / après un toucher — corrigé dans `cadre.css`.
