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
  colonne par colonne (`tone: 'zero' | 'pos' | 'neg' | 'plain'` par cellule). Lu case par case par
  `LectureTableau` (voir « Tableau de signes lu case par case » en fin de fichier).
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
- `CarteChapitre.tsx` — `OngletsChapitre` (`tablist`, flèches/Début/Fin ; depuis le 27/11/2026 sous-titrés « Le
  cours · étape par étape », « Réviser · teste-toi », « Exercices · corrigés »), `BlocReprendre` (« Tu en es à l'étape
  n sur N » + durée + barre de position + « Continuer : titre › » / « Commencer », « k / N étapes comprises »),
  `ListeEtapes` (parties, pastille lue ✓ / en cours / numéro, pastilles « en cours » et « à revoir » — prop `aRevoir`,
  calculée par `ChapterPage` depuis `suiviChapitres.ts` —, `aria-current="step"`, durée ; variante `cote` pour la
  colonne de gauche d'une étape sur ordinateur), `LienVue` (vrai `<a href="#…">` intercepté). `FinEtape.tsx` : fin de
  l'étape affichée (« Tu as fini l'étape n », M'entraîner sur cette étape, Étape suivante). Détail : `cote-eleve.md`,
  « Côté élève plus clair ».
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
- `Prerequis.tsx` (chapitres autonomes, 25/11/2026 ; données : champ `utilise` des sections, voir
  `content-authoring.md`, « Chapitres autonomes ») — `CeChapitreUtilise` : sur la CARTE, après les onglets
  et avant « Avant de commencer », encadré REPLIÉ (`button` + `aria-expanded`, ≥ 52 px) « Ce chapitre
  utilise… · n étapes de k autres chapitres » ; déplié : une phrase d'explication, puis par chapitre cité
  (titre = lien vers sa carte, année entre parenthèses si autre année) une ligne par étape citée (lien
  « Étape n · titre court » ≥ 44 px, même onglet — on est sur la carte, rien à perdre ; « indispensable » /
  « utile · pour l'étape 3, 5 »). Classe `.ce-chapitre-utilise` ajoutée aux listes « ce que chaque vue
  montre » (carte seulement). `EtapeUtilise` : dans le corps de l'étape, juste sous « L'essentiel », pour les
  entrées `indispensable` seulement : « Cette étape utilise » puis une ligne-bouton par prérequis (titre
  court + « « Chapitre », étape n », pastille « Rappel » / « Fermer », ≥ 48 px) qui déplie SUR PLACE le
  rappel (`rappel`, sinon « L'essentiel » de l'étape citée) et « Revoir l'étape (nouvel onglet) » — nouvel
  onglet choisi pour ne pas perdre la lecture de l'étape en cours. Résolution : `lib/prerequisChapitre.ts`
  (`resoudreUtilise`, `phrasesRappel`, `prerequisJeBloque`). Les deux sont `no-export` (ni impression ni
  export HTML), jetons du site seulement (clair, sombre, thèmes du panneau « Aa »).
- Liens nommés `[[niveau/slug#section]]` dans le texte (`Math.tsx::LienChapitre`, React Router `Link`) :
  `ChapterRoute` donne `key={path}` à `ChapterPage`, qui se remonte donc en changeant de chapitre (haut de
  page, état de la carte remis à zéro).
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
Confort de lecture (25/11/2026) : « Lecture » en tête d'`OutilsChapitre`, « Aa » dans `EnteteEtape`,
corrections « fait d'office » (sous-titre, étiquettes sans capitales, colonne ≈ 68 signes) et réglages de
l'élève : voir `.claude/rules/cote-eleve.md`.

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
direct) ; puis, comme dans le cours (fin de l'étape : vidéos puis cartes « À toi »), les `video` et les
`entrainement` de l'étape dans leur ordre d'écriture ; enfin une diapo `teste` par carte (`cartes` :
question, minuteur 1 min, réponse au clic). Cases du lanceur (`INCLUSIONS`) : L'essentiel, Figures,
Exemples, Teste-toi, Ateliers, Cartes « S'entraîner », Vidéos (cochées) et Démonstrations (décochée) ;
un choix mémorisé avant le 25/11/2026 (sans `v: 2`) reçoit une fois les deux nouvelles cases. Chaque diapo porte ses `notes` (corrigé, réponse, légende : vue du
professeur et notes PowerPoint) et son nombre d'étapes de révélation `pas`. Choix mémorisé par
chapitre (`localStorage` `projection:{niveau}/{slug}`, try/catch) ; défaut : la dernière étape ouverte.

**Rendu** (`Diapo.tsx` + `projection.css`) : 1 280 × 720 px logiques, mis à l'échelle par `Scene`
(`transform: scale`, mesures toujours en px logiques). Composants du site réutilisés tels quels
(`RichText`, `Illustration`, `BlockRenderer`, `InteractiveWidget sansEpingle` — atelier disposé et
mis à l'échelle par `dispositionAtelier.ts`, voir « Atelier » ci-dessous). Fond clair dans les deux thèmes : `.theme-clair`
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
- **Atelier** (retour du professeur du 25/11/2026 : « une petite cadre au milieu de la diapo » — l'ancien
  `zoom` plafonné à 1,5, calé sur la hauteur et jamais sous 0,8 laissait 8 ateliers sur 10 à ×0,8 avec
  défilement, 31 % de la diapo) : titre réduit à UNE ligne (« ATELIER » + label, bouton « Plein écran »),
  zone = presque toute la diapo (1 208 × 596 px logiques, 60 px gardés en bas pour la barre).
  `components/projection/dispositionAtelier.ts` (`disposerAtelier`, aucun widget modifié) MESURE trois
  dispositions et garde la plus grande figure (aire × zoom²) : `pile` (l'atelier tel quel, mais calé sur
  son contenu RÉEL — union des textes au plus près, figures, contrôles, encadrés colorés —, pas sur les
  760 px de l'hôte ; tenu en largeur ET en hauteur, zoom ≤ 3, centré) ; `cote` (bloc figure = plus grand
  ancêtre de la plus grande `svg`/`canvas` — à défaut le plus grand `table` — sans contrôle, comme
  l'épinglage de la page ; son parent devient une grille par une feuille adoptée + attributs
  `data-proj-cote` / `data-proj-fig` / `data-proj-large` : figure en colonne 1 sur toute la hauteur,
  `grid-template-rows: repeat(n, auto) 1fr`, réglages en colonne 2 de 340 / 440 / 560 px ; refusée si
  la grille ne prend pas ou ne raccourcit pas l'atelier ; doit battre `pile` de 15 % d'aire) ; `defile`
  (dernier recours, figure ×1,6 en aire : zoom pour que tout jusqu'au bas de la figure ET du premier
  réglage qui la suit tienne ; le reste défile en douceur, pastille « ↓ La suite de l'atelier » tant
  qu'on n'est pas en bas). Enveloppe `.diapo-atelier-place` en absolu (non zoomée) + hôte zoomé (`zoom`,
  texte net, pointeurs justes). Remesure : nouvelle disposition si la zone change (plein écran) ; même
  disposition, zoom recalculé si l'atelier change de taille (`ResizeObserver`, `MutationObserver` qui
  repose la grille si le widget reconstruit son DOM). Mesuré sur 10 ateliers (4e, 5e, 6e, dont
  `condition-initiale-widget` « choisis la bonne piste ») : figure à 1 920 × 1 080 de 456–672 px de
  large à 827–1 134 px (×1,5 à ×1,9) ; 7 en `cote`, 2 en `pile` (déjà larges), 1 en `defile`
  (`multiplication-k-widget` : repère + curseur k en ×1,53, tableau et lecture dessous).
  **Plein écran de l'atelier** (`EtatProjection.atelierPlein`, partagé ; retombe à faux en changeant de
  diapo) : l'atelier seul sur toute la diapo (`.diapo[data-plein]` : ni titre ni filet, marge 6 px,
  nouvelle disposition mesurée), API Fullscreen demandée dans la fenêtre où l'on clique si la page n'y est
  pas déjà (sinon le calque plein cadre de la projection suffit), rendue à la sortie ; sortir du plein
  écran du navigateur fait sortir l'atelier. Barre masquée, revenue seulement à l'approche du bas
  (96 px : on manipule à la souris), bouton flottant « Quitter le plein écran » (en haut à gauche,
  visible au mouvement), Échap. Vue du professeur : bouton « Atelier en plein écran » (écran de la
  classe).
- **S'entraîner** (bloc `entrainement`) : surtitre « S'entraîner · générateur genN », titre,
  description, « Plateforme → … », bouton « Ouvrir le générateur ↗ » (`<a target="_blank"
  rel="noopener">`, lien de `generatorLink` : nouvel onglet dans la fenêtre où l'on clique, la
  projection ne bouge pas) ; à droite, QR code de 350 px logiques (`entrainement/export/qrSvg.ts`, celui
  des feuilles) vers l'adresse PUBLIQUE (`SITE_PUBLIC` + `/entrainement/…` pour un générateur rapatrié,
  sinon l'URL plateforme-maths) — jamais `localhost` : les élèves le scannent —, adresse courte dessous.
- **Vidéo** (bloc `video`) : titre + lecteur 16:9 aussi grand que la zone ; avec `youtubeId`, vignette
  (`i.ytimg.com`) + bouton de lecture, `youtube-nocookie.com/embed/…?autoplay=1` chargé AU CLIC
  seulement, dans la fenêtre cliquée (l'autre écran garde la même diapo) ; sans `youtubeId`, « Vidéo à
  venir — titre » comme le cours. Vue d'ensemble / diapo suivante : simple image (jamais un bouton dans
  le bouton de la vignette).

**Projection** (`ProjectionPage.tsx`) : `useProjection` = état `{ index, pas, blanc, debut, minuteur, fond, blanches, vues, atelierPlein }`
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
  vue d'ensemble (grille de vignettes `mode="vignette"`, atelier non monté), télécharger (palette
  PowerPoint / PDF annotés, nouvelle séance — « Projection annotée »), plein écran (Fullscreen
  API, refus ou absence → message « utilise F11 »), ‹ n / N ›, quitter (→ `#projeter`). Masquée (et le
  curseur) après 3 s sans mouvement — stylo en main compris depuis le 27/11/2026 (la pastille du dessin,
  elle, reste) ; pas tant qu'une palette est dépliée (colonne, nuancier, menu du fond, minuteur,
  télécharger). Palettes centrées au-dessus (`.projection-palettes`) : minuteur et télécharger seulement ;
  le dessin, l'équerre et l'écran blanc ont leurs palettes REPLIÉES à gauche (voir « Pastilles, zoom du
  repère, nuancier »). Infobulles = nom + raccourci.

**Outils de dessin et instruments** (décision du 24/11/2026 « toutes tes propositions » ; maquettes D1
palette, D2 équerre, D3 compas + calculatrice). Pointer events partout (souris, doigt, stylet, tableau
interactif ; `touch-action: none` sur ce qui se manipule, classe `.projection-interactif` = jamais
« diapo suivante » au clic ni au glisser).
- `Tableau.tsx` (`Annotations`) par-dessus la diapo, en px logiques 1 280 × 720 : canvas **fluo**
  dessous (`mix-blend-mode: multiply` — le conteneur `.projection-tableau` ne doit créer AUCUN contexte
  d'empilement, sinon le fluo ne se fond plus avec la diapo) puis canvas **stylo** (traits, arcs) ; la
  gomme (44 px, `destination-out`) passe sur les deux. Colonne du dessin `ColonneDessin`
  (`Pastilles.tsx`, ouverte depuis la pastille) : stylo 4 couleurs, fluo 4 couleurs pastel (jaune, vert,
  rose, bleu ; trait 22 px, bouts plats) + les 3 dernières couleurs du nuancier, 3 épaisseurs
  (`EPAISSEURS` : 3 / 5 / 9 px, aussi pour les arcs), gomme, annuler, tout effacer, « Nuancier ».
- **Gardées par PAGE, dans le navigateur** (depuis le 27/11/2026, voir « Projection annotée » plus bas) :
  `MagasinAnnotations` (`magasinAnnotations.ts`) = `Map<clé de page, ElementAnnotation[]>` (traits, arcs,
  résultats épinglés, courbes) ; clé STABLE `d:<clé de diapo>` / `b:<id de page blanche>` (jamais l'index) ;
  conservée en IndexedDB (rien en base, rien hors du navigateur) ; on la retrouve en revenant sur la diapo,
  après un rechargement ou le lendemain. « Annuler » (bouton, Ctrl/Cmd+Z hors champ)
  retire le dernier élément de la page courante (un trait de gomme annulé fait réapparaître ce qu'il
  effaçait) ; « Tout effacer » vaut pour la page courante.
- **Synchronisation** (deux écrans, même `BroadcastChannel`) : `trait` + `point` (tracé libre), `element`
  (ajout OU remplacement par id : trait à l'équerre, arc en cours, étiquette déplacée), `retirer`, `effacer`,
  `annotations` (tout, en réponse à la `demande` d'une fenêtre qui s'ouvre ou se recharge : la fenêtre
  des diapos ouverte après coup reçoit ce qui était déjà écrit ; toujours envoyée, même vide), `instruments`.
  Chaque message d'annotation porte la clé `page` (texte). Pages de l'écran blanc dans `EtatProjection`
  (`blanches`, `vues`, `fond` = fond proposé pour une nouvelle page).
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
    Réglages de l'équerre = trois boutons COLLÉS à elle (`BoutonsEquerre` de `Tableau.tsx`, depuis le
    27/11/2026 ; plus de palette au-dessus de la barre), état PARTAGÉ dans `EtatEquerre` : **Segment** (borné
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
    « Division par zéro », hors du domaine), rien n'est effacé. « Épingler le résultat » pose
    « expression = valeur » (KaTeX) sur la page courante : étiquette déplaçable, annulable ; plusieurs
    résultats sont empilés vers le haut, jamais l'un sur l'autre. Deux écrans : bouton « Masquer à la
    classe » (vue du professeur seulement) — la calculatrice n'est plus affichée sur l'écran projeté.
    **Bug « Épingler reste grisé » (25/11/2026)** — causes réelles reproduites (le bouton marchait au clic
    sur « = » à l'écran, souris comme doigt, une ou deux fenêtres) : taper « 3*4= » au clavier donnait
    « Caractère « = » non reconnu » (l'aide disait « puis « = » ») → `calculer` ignore les « = » finaux et
    un « = » tapé en fin de saisie calcule ; à l'ouverture le champ n'avait pas le focus (frappe perdue,
    Entrée = diapo suivante) → focus donné à l'ouverture (souris / clavier, pas au doigt : clavier
    virtuel ; seulement si la fenêtre a le focus) et chiffres / opérateurs frappés hors d'un champ
    renvoyés dans celui de la calculatrice (écouteur en capture : « . » n'éteint plus l'écran tant
    qu'elle est ouverte) ; le bouton exigeait un « = » préalable → « Épingler le résultat » calcule
    lui-même la saisie en cours (erreur affichée sinon). Désactivé (`aria-disabled`, cliquable : un
    `disabled` n'affiche pas son infobulle partout) seulement sans aucun calcul, infobulle « Rien à épingler
    pour l'instant : tape un calcul… ». **Punaise** (barre de titre, `EtatCalculatrice.garde`, partagée) :
    sans elle la calculatrice se ferme au changement de diapo (pas à l'écran blanc) ; avec, elle reste
    ouverte, à sa place, jusqu'à ce qu'on la ferme. `MagasinInstruments.calc` ne diffuse rien si rien ne
    change (les deux fenêtres ferment la calculatrice au même changement de diapo).
    **× des étiquettes** (demande du professeur du 25/11/2026) : toujours présent (avant : seulement avec
    la gomme), `aria-label` « Retirer ce résultat », cible ≥ 44 px RÉELS (`--cible` = max(44, 44 /
    échelle) px logiques : vue réduite du professeur comprise), pastille discrète de 26 px — à la souris
    visible au survol de l'étiquette, au doigt toujours visible (`(hover: none)` / `(pointer: coarse)` ou
    `data-tactile` posé au premier toucher) ; le glisser de l'étiquette ignore le bouton. Retrait diffusé
    (`retirer`) et annulable : pile `retraits` par page (élément + nombre d'éléments juste après) —
    Ctrl/Cmd+Z / « Annuler » le remet (diffusé en `element`) si rien n'a été ajouté depuis, sinon retire
    d'abord ces ajouts. Écran de la CLASSE (deux écrans, `role=diapos`) : pas de × (affichage seulement),
    sauf avec la gomme comme avant.
- **Écran blanc** : PLUSIEURS pages par diapo (voir « Projection annotée »), chacune son fond « uni /
  quadrillé / repère » (menu « fond ▾ » de la petite barre en haut à gauche, `OutilsBlanc`), partagé ;
  quadrillage de 40 px, repère = axes gradués à l'échelle de la VUE (zoom, déplacement : voir plus bas),
  origine au centre à la vue de départ (`FondBlancTableau`). Les instruments marchent dessus.
- Vue du professeur : stylo + équerre / compas / calculatrice au-dessus de la diapo projetée ; pastille,
  colonne, nuancier, petite barre de l'écran blanc et traceur POSÉS sur la diapo projetée
  (`.prof-scene-zone`, même principe qu'à l'écran de la classe) ; tout ce qui y est écrit apparaît au
  tableau, et inversement.
- **Un écran** : « Lancer » demande le plein écran DANS le clic (la navigation interne le garde).
  **Deux écrans** : `window.open` DANS le clic (`lib/projection/fenetre.ts`, nom fixe) → fenêtre
  `role=diapos` (accueil « Plein écran / Continuer sans ») ; la page courante devient la vue du
  professeur (`role=prof`) : diapo projetée (stylo qui écrit aussi au tableau ; atelier en vignette, il
  se manipule sur l'écran projeté), suivante (prochaine étape ou diapo), notes, minuteur, temps écoulé,
  écran blanc, vue d'ensemble, « Ouvrir la fenêtre des diapos » si elle est fermée. Fenêtre bloquée →
  un écran (`repli=1`) avec message.

**PowerPoint** (carte S'entraîner : QR code dans l'image, adresse en zone de texte CLIQUABLE ; vidéo :
cadre + lien YouTube cliquable — un iframe ne se capture pas ; `data-pptx-lien` → `hyperlink` du run)
(`lib/projection/exportPptx.tsx`, chargé à la demande avec `pptxgenjs` 4.0.1 —
l'ancien `buildPptx`/html2canvas avait été retiré en septembre, voir `export-pipeline.md`) : mêmes
diapos (même découpage), état final. Textes sans formule ni figure (surtitre, titre, phrases de
l'essentiel, question, réponse) = vraies zones de texte modifiables (Georgia / Calibri / Consolas, à
leur place mesurée) ; le reste = image de fond 1 920 × 1 080 (SVG `<foreignObject>` autonome : CSS du
site + polices Fraunces / Work Sans / Plex Mono — lues depuis la feuille Google Fonts — et KaTeX en
`data:`, woff2 latin / latin-ext seulement ; Shadow DOM des ateliers aplati) ; notes = `notes` en texte
(`texteBrut` / `latexEnTexte`). Une diapo par diapo finale, jamais une par étape de révélation.
Les instruments ne sont jamais exportés. Avec annotations (27/11/2026) : voir « Projection annotée » ;
nom du fichier « Titre.pptx » (ASCII, voir plus bas), PDF au même rendu.

**Projection annotée** (décision du professeur du 27/11/2026 : « oui » à PowerPoint / PDF annotés, pages
blanches multiples, traceur de fonctions ; dossier de travail `projection-annotee/`).
- **Clés stables** (`lib/projection/annotations.ts`) : une diapo = `d:<cle>` ; la clé d'une diapo
  (`diapos.ts`) est `<id étape>:titre`, `:essentiel`, `:<rang du bloc dans l'étape>`, `:carte<n>`, plus
  `~<n° de page>` pour un exemple découpé — elle ne dépend que du contenu, pas des étapes / inclusions
  choisies. Une sélection différente au lancement ne perd rien : les annotations d'une diapo absente
  restent dans le magasin et dans le navigateur, et réapparaissent quand elle revient (l'export ne prend
  que les diapos choisies ; le lanceur résume « … dans ces étapes » via `resumeDansSelection`, qui couvre
  aussi les pages `~n`).
- **Conservation** (`useConservation`) : IndexedDB `math-belgium-projection` / `annotations`, clé
  `<niveau>/<slug>` → `DonneesAnnotations` (`pages` non vides, `blanches`, `vues`, `fond`) ; repli
  `localStorage` `projection-annotations:<niveau>/<slug>` ; try/catch partout, lecture tolérante
  (`valider`). Enregistrée 600 ms après le dernier changement et tout de suite à `pagehide` /
  page cachée ; lue PENDANT le découpage des diapos (`Projection` attend les deux). Deux fenêtres :
  chacune enregistre la même chose ; une fenêtre qui s'ouvre lit la conservation PUIS reçoit
  `annotations` + `etat` de la fenêtre active (plus récents). Rien sur le serveur.
- **« Nouvelle séance »** (palette Télécharger) : confirmation DANS la palette (« Tout effacer » /
  « Annuler ») → `toutEffacer` (diffusé) + `oublierPagesBlanches` + enregistrement immédiat (entrée
  supprimée).
- **Pages de l'écran blanc** (`EtatProjection.blanches[cléDiapo]`, `vues[cléDiapo]`, `PageBlanche` :
  `id`, `fond`, `ex`, `ey`, `angle`, `marques`) : B ouvre la DERNIÈRE page vue de la diapo, ou en crée
  une (fond = le dernier choisi) ; petite barre en haut à gauche ‹ 2 / 3 › (`allerPage`), « + » nouvelle page (vierge,
  même fond / échelle, insérée après la page affichée), supprimer (menu « fond ▾ », confirmation dans le menu ; la
  dernière page est remplacée par une page vierge ; ses annotations partent : `oublierPage`). Chaque page
  a ses annotations, son annulation, son « Tout effacer ». Clavier : → ← et B gardent leur rôle ; quitter
  la diapo (→ ←, vignette) REFERME l'écran blanc (ses pages sont rattachées à la diapo) ; Page préc. /
  Page suiv. passent d'une page blanche à l'autre tant que l'écran blanc est affiché (sur la dernière :
  rien), sinon leur rôle d'avant. La calculatrice (sans punaise) ne se ferme pas en passant d'une page
  blanche à l'autre.
- **Traceur** (`Traceur.tsx` + `lib/projection/traceur.ts` PUR ; bouton f(x) de la petite barre de
  l'écran blanc pour replier / déplier — `OutilsLocaux.traceur`, LOCAL : replié au départ, déplié quand on
  choisit le fond « repère », replié dès qu'une courbe est tracée ou qu'on écrit) : « f(x) = » (nom suivant
  libre : f, g, h, k, m, p…) en saisie libre jamais bloquée (`type="text"`, seul `normaliserSigneMoins`),
  aperçu KaTeX en direct, « Tracer » ou Entrée ; erreurs du parseur en clair, rien effacé. Parseur de la
  calculatrice étendu (`analyser(s, { variable: true })` : jeton x, `|…|` — une barre FERME à
  l'intérieur d'une valeur absolue — et `abs(…)` ; `evaluer` refuse x ; `enLatex(…, { fractions: true })` :
  a/b en `\dfrac`, `rac` en exposant) ; « f(x) = » / « y = » en tête acceptés. Angles en RADIANS par
  défaut (choix de l'élève de 4e–6e en analyse ; DEG / RAD visibles, par page, les courbes sont
  recalculées). Couleurs = stylo (bleu, rouge, vert, noir, la première libre), épaisseur = stylo (≥ 4 px).
  Une courbe est un ÉLÉMENT de la page (`Courbe` : expression, jamais les pixels) : annuler, ×, tout
  effacer, deux écrans, export, conservation. Échelle par axe (`ECHELLES`, « 1 carreau = ») : réglage de
  la VUE (`avecEchelle`), graduations et courbes recalculées, annotations attachées. Tracé (`echantillonner`) : un échantillon par pixel logique, bissection (14 niveaux) là où
  l'écart dépasse 6 px ; écart qui ne se résorbe pas (> 30 px) = discontinuité → polyligne coupée (1/x,
  tan x) ; NaN / hors domaine → bord approché par bissection (√x part de l'origine) ; canvas découpé au
  cadre, ordonnées bornées ; tracés mémorisés (`traceMemorise`). Dessin : canvas `--courbes` SOUS le fluo
  et le stylo (on écrit par-dessus) ; la gomme ne touche pas les courbes. Étiquettes (`EtiquettesCourbes`,
  même composant à l'écran et à l'export) : nom près de la courbe (`placeEtiquette`), points cochés —
  Zéros, Sommet / extremums, Intersections — avec coordonnées KaTeX : décimal exact court (≤ 3
  décimales) tel quel, sinon forme reconnue comme la calculatrice (`formeExacte` : fraction, multiple de π,
  a√b/q ; extremums « aimantés » sur une fraction de dénominateur ≤ 12 ou un multiple de π/12 s'ils sont
  au moins aussi extrêmes), sinon « ≈ » et 0,01 ; zéro double = extremum nul ; 12 points au plus par genre
  et par courbe ; étiquettes placées sans se chevaucher ni sortir du cadre.
- **Télécharger** : bouton de la barre (pictogramme « télécharger », infobulle) → palette « PowerPoint
  annoté · PDF annoté · résumé · Nouvelle séance » (absente de la fenêtre de la classe en deux écrans) ;
  vue du professeur : bouton « Télécharger » de l'en-tête. **Quitter** avec des annotations (au moins une
  diapo annotée ou une page blanche écrite ; pas sur l'écran de la classe) : boîte « Télécharger tes
  annotations ? PowerPoint · PDF · Quitter sans télécharger · Rester » (Échap = rester ; après un
  téléchargement réussi, on quitte ; « elles restent gardées dans ce navigateur »). Lanceur : « Télécharger
  en PowerPoint » / « en PDF » + case « Avec mes annotations » (cochée d'office, seulement s'il y en a) —
  l'export « sans annotations » d'avant reste (case décochée ou rien de gardé).
  **Matière vue proposée** (chantier M, 27/11/2026) : pendant une heure de cours de l'horaire d'une classe de l'année du
  chapitre, Quitter ouvre une boîte « Noter la matière vue de la 5e A ? » (étapes montrées, générateurs ouverts par « Ouvrir
  le générateur » — `data-generateur` —, « vue en partie ») qui reprend aussi le téléchargement des annotations ; sinon la
  boîte ci-dessus, inchangée. Vue du professeur seulement. Détail : `.claude/rules/comptes.md`, « Matière vue proposée en
  fin de projection ».
- **Export annoté** (`telechargerProjection(chapter, choix, { format, annotations, diapos, progression })`,
  `telechargerPptx` gardé) : mêmes diapos (depuis la projection : les diapos déjà découpées), et juste
  après chaque diapo ses pages blanches ÉCRITES (une page vierge — écran blanc ouvert pour masquer — n'est
  pas exportée), dans l'ordre, fond rendu par `FondBlancTableau` (échelle comprise). Calques à 1 920 ×
  1 080 (`calques`, peinture commune `lib/projection/peinture.ts`) : **fluo** = le fond MULTIPLIÉ par le
  surligneur dans les zones surlignées (rendu exact du `multiply`), transparent ailleurs, posé SOUS les
  zones de texte PowerPoint (texte noir et modifiable par-dessus) — une image transparente « normale » ne
  peut pas reproduire un multiply ; **stylo** = courbes + traits + arcs + étiquettes KaTeX (calque
  `.pptx-calque` rastérisé sans fond), image transparente par-dessus. Ordre des objets d'une diapo :
  fond, fluo, zones de texte, stylo — chaque annotation est un objet à part que le professeur peut
  supprimer (`altText` « Annotations du professeur (surligneur) » / « Annotations du professeur »).
  Notes d'une page blanche : « Page blanche n (repère) — après « titre » » + `f(x) = …` en texte.
  **PDF** (`jspdf` déjà présent, chargé à la demande, jamais dans le paquet principal) : 720 × 405 pt
  (16:9), une page par diapo, fond JPEG (qualité 0,88, textes compris), UNE image PNG transparente
  d'annotation (fluo cuit sur le fond avec son texte + stylo), textes simples (ceux des zones de texte
  PowerPoint) en texte INVISIBLE Helvetica par-dessus : sélectionnables et cherchables, ramenés au
  Latin-1 (’ → ', — → -, œ → oe ; les polices standard de jsPDF perdent le reste) — sans police
  embarquée (≈ 100 ko par page). Noms : « Chapitre 3 - Titre - annote.pptx » / « Titre.pdf » = `libelleChapitre`
  (numéro du professeur, jamais celui du site) + « — annoté », écrits en ASCII (`nomFichier` : un accent
  ou un tiret long dans `download` fait perdre le nom dans Chromium — le fichier s'appelait « download »).

**Pastilles, zoom du repère, nuancier** (décision du professeur du 27/11/2026, captures à l'appui : les palettes
pleine largeur prenaient le tiers, voire la moitié inférieure de l'écran ; maquettes « pastilles » 1–5 validées,
réponses : pastilles à GAUCHE, repli automatique dès qu'on écrit ; dossier de travail `projection-pastilles/`).
- **Dessin** (`Pastilles.tsx`) : prendre un outil (stylo, fluo, compas : bouton ou S / H / C) ne fait apparaître
  QUE la pastille ronde en bas à gauche, au-dessus de la barre (`PastilleDessin` : couleur, épaisseur,
  pictogramme de l'outil ; `aria-expanded`, `aria-controls`, infobulle) — toute la diapo reste libre (maquette 1 ;
  ouvrir la colonne d'office la faisait couvrir le texte de gauche, où le professeur écrit). La toucher ouvre la
  colonne étroite (`ColonneDessin`, 154 px, grille de 3 × 44 px, défile si l'écran est bas) ; choisir une couleur
  la GARDE ouverte ; elle se replie au premier trait (`surEcrire` d'`Annotations` : trait, règle de l'équerre,
  compas), à Échap (puis Échap range l'outil, comme avant) ou en re-touchant la pastille. La pastille reste visible
  tant qu'un outil est actif, même barre masquée. État ouvert / fermé (`OutilsLocaux.palette`, `nuancier`,
  `menuFond`, `traceur`) LOCAL à chaque fenêtre : rien ne s'ouvre sur l'écran de la classe quand le professeur
  ouvre une palette chez lui. Colonne, traceur et menu du fond s'excluent (jamais l'un sur l'autre).
- **Hauteur insuffisante** (écran bas en paysage ≈ 870 × 400 — l'appareil du professeur —, vue du professeur à
  1 280 × 720 ; retouche du 27/11/2026) : JAMAIS de défilement. `useCompacte` (`useCompacte.ts`) mesure avant
  l'affichage : contenu qui déborde → disposition compacte (hauteur normale retenue), retour à la normale dès que la
  hauteur offerte (`hauteurAuDessus`, `hauteurTraceur`) la permet. Colonne : deux colonnes côte à côte (stylo + fluo en
  grilles de 4 | trait, gomme, annuler, effacer, Nuancier), 352 × 248 px avec 3 + 3 couleurs récentes à 870 × 400.
  Nuancier : en GRAND à la place de la colonne (masquée, revient à la fermeture), grille de 8 et réglage fin à droite
  (656 × 212). Traceur : trois blocs côte à côte (saisie + liste | RAD / DEG, « x : » et « y : » sur une rangée —
  « 1 carreau = » en infobulle | Zéros, Sommet, Intersections), 760 × 164 avec deux courbes. Ailleurs (1 024 × 768,
  1 280 × 720 et plus en un écran) : la colonne étroite et le panneau de 300 px d'avant.
- **Nuancier** (`Nuancier`, à droite de la colonne ; `lib/projection/couleurs.ts` PUR) : onglets Stylo / Fluo.
  Stylo : 24 teintes (11 teintes × 2 clartés + 2 gris), toutes à un contraste ≥ 3 sur la diapo claire (#fbfaf7,
  trait épais = « gros caractère ») + réglage fin teinte / clarté (curseurs `range` de 44 px, aperçu, « Prendre
  cette couleur ») : une couleur trop claire est ASSOMBRIE jusqu'au contraste 3 (`couleurStylo`). Fluo : 12 pastels
  (`hsl(h, 100 %, 76 %)`, posés en multiply) + réglage de teinte. Une couleur prise rejoint les couleurs rapides (3
  dernières par genre, `localStorage` `projection:couleurs-recentes`, try/catch) ; la pastille la montre ; fermé au
  premier trait. La couleur est dans l'élément : deux écrans, export, conservation inchangés.
- **Équerre** : Segment / Droite / cadenas = trois boutons collés à l'équerre (`--cible` = 44 px RÉELS, vue réduite
  du professeur comprise), jamais tournés (toujours à l'endroit), placés au-delà du coin droit, sinon du coin gauche,
  sinon sous l'hypoténuse — le premier qui tient dans la diapo, sinon recalés dedans. Visibles sur les deux écrans.
- **Écran blanc** (`OutilsBlanc`) : UNE petite barre en haut à gauche — ‹ n / N › · + (nouvelle page) · « fond ▾ »
  (menu `role="menu"` : uni, quadrillé, repère en `menuitemradio`, « Supprimer cette page… » avec confirmation DANS le
  menu ; fermé au clic ailleurs) · f(x) (repère) · −, +, recentrer (repère). Masquée avec la barre du bas après
  3 s (sauf menu / traceur dépliés). Traceur = panneau de 300 px sous elle (défile si besoin), replié sur f(x) dès
  qu'une courbe est tracée (la liste avec × revient en le rouvrant).
- **Zoom du repère** (`lib/projection/vue.ts` PUR) : `PageBlanche.vue` = `{ ex, ey, cx, cy }` (unités pour 40 px
  d'écran par axe, point du repère au centre de l'écran ; absente = vue de départ `{ page.ex, page.ey, 0, 0 }`).
  Trois repères : ÉCRAN (px logiques), PAGE (px de la page à sa vue de départ — les traits, arcs et résultats
  épinglés y sont STOCKÉS : `versPage` à la saisie, `transfoPage` / `versEcran` à l'affichage, à l'export, dans
  l'autre fenêtre) et REPÈRE (courbes, points, graduations : `repereVue`, `Repere.cx / cy` de `traceur.ts`). Une
  flèche dessinée vers un sommet le suit donc au zoom, au déplacement et au réglage « 1 carreau = » ; les marqueurs
  (zéros, sommet, intersections) et étiquettes sont recalculés pour la fenêtre visible ; les courbes sont
  ré-échantillonnées (nettes, jamais une image agrandie). Épaisseurs des annotations × racine carrée du zoom
  (`Transfo.s` : ×2 → ×1,41 ; la gomme suit le même facteur) ; épaisseur des courbes fixe. Arc tracé sur des axes
  d'échelles différentes : `Arc.ry` (ellipse dans la page, cercle à l'écran). Droite tracée à l'équerre :
  `Trait.droite`, prolongée jusqu'aux bords de l'écran à l'affichage. Gestes : pincer / glisser à DEUX doigts
  (écouteurs `pointer*` en capture sur la fenêtre : le deuxième doigt ANNULE ce que le premier écrivait et n'écrit
  rien) ; molette SEULE = zoom autour du pointeur (comme GeoGebra / Desmos ; Ctrl + molette = pincer au pavé tactile,
  pas plus fin) ; glisser à la souris ou à un doigt SANS outil = déplacer la vue (calque `.projection-vue`,
  `projection-interactif` : sur une page repère, un clic ne passe plus à la diapo suivante — les flèches et la barre,
  si) ; un doigt / la souris AVEC un outil écrit toujours ; boutons −, + (×1,5) et recentrer (vue de départ, grisé
  quand on y est). Graduations (`graduations`, `pasGraduation`) : plus petit pas 1 / 2 / 5 × 10ᵏ à ≥ 40 px dont les
  étiquettes (mono 14 px, 8,5 px par caractère + 4) ne se touchent pas, quadrillage aux graduations, nombre coupé par
  le bord non écrit, axe hors écran → ses nombres au bord ; zoom borné (`ECHELLE_MIN` 0,002 – `ECHELLE_MAX` 5 000
  unités / 40 px, même facteur sur les deux axes). « 1 carreau = » (traceur) : PILOTE la vue (`avecEchelle`, centre
  gardé), bouton coché seulement si la vue vaut exactement cette échelle — le plus simple pour le professeur : un seul
  état (la vue), pas de deuxième échelle cachée. Vue PARTAGÉE (deux écrans : `majVue` l'applique tout de suite et la
  diffuse au plus une fois par image), gardée par page (conservation, `valider`), exportée telle qu'elle est vue.
  « + » (nouvelle page) : même échelle que la vue, origine au centre. Instruments jamais zoomés ; compas sur un repère
  aux axes de même échelle : « r = 1,5 unités » (rayon en unités du repère, centre aimanté aux nœuds de la VUE, rayon
  à la demi-graduation), sinon comme avant ; équerre : « carreaux » seulement si la grille fait 40 px.
- Vérifications (27/11/2026, `projection-pastilles/verif.mjs` + `verif-ancien.mjs` = `verif.mjs` de
  `projection-annotee/` adapté à la nouvelle interface — mêmes 77 vérifications) : Vite de développement + faux client
  connecté, 4e ch. 6 — pastille seule à la prise du stylo, colonne (154 px, cibles 44 px), repli au premier trait / à
  Échap / à la pastille, barre masquée et pastille restante, nuancier (24 teintes au contraste ≥ 3, jaune clair
  assombri, pastel → fluo, pastille et trait de la couleur choisie, couleurs gardées après rechargement), équerre et
  ses boutons (suivent le déplacement, la rotation à −90°, recalés au bord, Droite / cadenas), écran blanc 3 pages
  (‹ ›, menu du fond, suppression confirmée), repère + 2 courbes + flèche vers le sommet, deux doigts stylo en main
  (aucun trait), pincer ×2 + glisser (sommet et flèche suivis au pixel, pas 1 → 0,5, aucun chevauchement, courbe de
  6 px), molette, glisser sans outil, +, recentrer, « 1 carreau = 2 » (flèche suivie), compas « r = 1 unité »,
  rechargement (vue revenue), PowerPoint et PDF de la page zoomée (relus), 1 280 × 720 / 1 024 × 768 / 1 920 × 1 080 /
  870 × 400 (téléphone paysage : colonne et traceur défilent, rien coupé), thème sombre (palettes claires), deux
  écrans (pastille et barre posées sur la diapo du professeur, rien chez la classe, trait reçu, boutons de l'équerre
  ≥ 44 px réels, zoom du professeur reçu au tableau, molette au tableau reçue chez le professeur), puis la retouche
  « hauteur insuffisante » (colonne, nuancier, traceur avec deux courbes : entiers sans défilement à 870 × 400 et dans la
  vue du professeur, une seule colonne à 1 024 × 768 et 1 920 × 1 080, cibles ≥ 44 px) — 129 + 77
  vérifications, 0 erreur console.

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

Projection annotée (27/11/2026, dossier de travail `projection-annotee/` : `verif.mjs`, `lanceur.mjs`,
`sombre.mjs`, `test-traceur.ts`, `info_pptx.py`) : Vite de développement + faux client connecté, 4e ch. 6
(§ 6 et 11, 24 diapos), 1 280 × 720 — un écran : 3 diapos annotées (stylo, fluo, résultat épinglé), 3 pages
blanches (uni, quadrillé, repère avec x² − 2x − 3 et 1/(x − 2) : asymptote non reliée, zéros exacts, 3
intersections « ≈ »), saisie illisible gardée, échelle x = 2 (graduations, courbes recalculées), Ctrl+Z, ×,
Page préc. / suiv., suppression confirmée, B → dernière page vue, → referme, rechargement → TOUT revient,
palette et résumé, PowerPoint (27 diapos : pages blanches après la diapo 2, fond / fluo / textes / stylo)
et PDF (27 pages 720 × 405, texte sélectionnable, ≈ 2,8 Mo) relus (LibreOffice + `pdftoppm`), Quitter →
boîte, Nouvelle séance → tout part (après rechargement aussi), lanceur ; deux écrans : trait, pages,
courbe et extremums (π/2 ; 1) reçus au tableau, trait du tableau reçu, troisième fenêtre qui reçoit tout,
Page préc. du professeur, Télécharger et Quitter de la vue du professeur — 77 vérifications, palettes dans
l'écran, cibles ≥ 44 px (nouveaux contrôles), 0 erreur console ; export SANS annotations depuis le lanceur
(4e ch. 1 § 1 : 25 diapos comme avant, une image chacune, PDF 25 pages) ; thème sombre (palettes et boîte
claires) ; `verif-p3.mjs` de `projection-3/` repassé (111 / 112 : l'échec restant est une course du
curseur de la calculatrice déjà présente — touche à l'écran puis frappe immédiate, caret replacé dans un
`requestAnimationFrame` — reproduite 1 fois sur 3, sans lien avec ce chantier).

Retouches du 25/11/2026 (dossier de travail `projection-3/` : `repro-calc.mjs`, `repro2.mjs`,
`ateliers.mjs`, `verif-p3.mjs`, `pptx.mjs`, `lire_pptx.py`) : Vite de développement + faux client
connecté, 1 280 × 720 et 1 920 × 1 080. Reproduction d'abord (souris / doigt CDP, un et deux écrans : le
« = » à l'écran marchait ; « 3*4= » au clavier et la frappe sans focus échouaient). `verif-p3.mjs` —
calculatrice : focus à l'ouverture, bouton désactivé + infobulle, « 3*4= », touche puis clavier,
épingler sans « = », frappe hors du champ, saisie illisible gardée, punaise (gardée à sa place sur
3 diapos et à l'écran blanc, fermée sinon), doigt (pas de focus forcé, 7 × 6 + Épingler) ; × : caché /
survol, 44 px, glisser intact, retrait, Ctrl+Z remet puis retire ; deux écrans : résultat et étiquette
reçus, × absent au tableau, × ≥ 44 px dans la vue réduite, retrait et Ctrl+Z des deux côtés, punaise
partagée ; atelier « choisis la bonne piste » en `cote`, curseur manipulé souris ET doigt sans changer
de diapo, plein écran (zoom plus grand, barre masquée au milieu / revenue en bas, bouton, Échap), deux
écrans (bouton du professeur, plein écran retombé au changement de diapo) ; ordre ateliers → vidéos →
S'entraîner → Teste-toi, QR décodé par jsQR = adresse publique, « Ouvrir le générateur » en nouvel
onglet sans quitter la diapo, vidéo chargée au clic seulement (youtube-nocookie, lecteur ≥ 55 % de la
largeur), vidéo sans identifiant, deux écrans (lecture sur l'écran cliqué) ; 0 erreur console.
PowerPoint (4e ch. 1 § 1) : 25 diapos comme à l'écran, une image chacune, liens cliquables YouTube et
générateurs, atelier exporté en disposition `cote`.

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
- Confort de lecture (lot G, 25/11/2026) : taille du texte (`calc(Npx * var(--g-t|--g-ui, 1))` dans `cadre.css` / `theme.css`,
  variables dans `confortLecture.css`), « Aa » dans `BarreGenerateur`, corrigé « Lire ligne par ligne »
  (`CorrigeDetailleEcran`), « Je bloque » (`JeBloque`, exemple de la section rendu par `ExemplePasAPas` /
  `ExempleLibrePasAPas`, exportés de `ContenuEtape.tsx`), majuscules d'insistance en gras (`TexteInsistance`) :
  voir `.claude/rules/cote-eleve.md`, « Générateurs ».
- Styles : `src/entrainement/cadre.css`, chargé APRÈS `theme.css`, tout sous `.entrainement`.
  Échelle 12 (capitales) / 14 / 16 / 18 px ; Andika (`--lecture`) pour énoncé et consignes. Piège
  trouvé : `.btn:hover:not(:disabled)` (plus spécifique que `.btn-primary:hover`) rendait « Valider »
  pâle sous texte blanc au survol / après un toucher — corrigé dans `cadre.css`.

## Tableau de signes lu case par case (planche 09, côté élève — 25/11/2026)

Maquette `signes.html` + planche 09 et démo validée `lecture-guidee.html` (onglet 9). Deux morceaux :
- `src/lib/lectureTableauSignes.ts` (PUR, sans DOM) : `grilleLecture(modele)` → une phrase par case
  (`grille[r][c]`, `c = 0` = libellé, `null` = case non navigable : borne vide, intervalle vide de la
  ligne des x) et un repère visuel court (« Ligne « x² − x − 6 » · entre −2 et 3 ») ; `resumeTableau`
  → conclusion (dernière ligne de signes, ou lignes de variations / concavité / texte s'il y en a).
  Modèle = forme du bloc `signTable` (`rows[0]` = ligne des x, cellules alternées point / intervalle).
  Lignes reconnues : signes (`+`, `−`/`-`, `0`, `‖`/`||`/`∄` = valeur interdite, signe sur un point = le
  signe continue), variations (`↗`/`↘`, extrémités `max (2)`, `min`, `maximum`, `PI (−4)`, `M (0;1)`,
  `AH y=0`, valeur simple → extrémum déduit des flèches voisines), concavité (`∪`/`∩`), texte libre
  (« en dessous »). Le « pourquoi » n'est donné que s'il se DÉDUIT des données et qu'il est cohérent
  avec elles (sinon rien) : règle des signes pour la ligne « produit » / « quotient » ou pour une
  dernière ligne égale au produit des signes d'au moins deux lignes au-dessus (« moins divisé par
  plus donne moins », compte des lignes négatives au-delà de deux) ; trinôme (libellé avec `²`, deux
  facteurs `(x…)(x…)`, `f(x)` dont la légende dit `a > 0` ou donne `f(x) = …`, ou `f′(x) = 3(x−1)(x+1)`)
  → signe de a à l'extérieur des racines / contraire entre / partout ; ligne à une seule racine →
  « s'annule en … : négatif avant, positif après » ; zéro d'un produit / quotient → quel facteur
  s'annule ; valeur interdite d'un quotient → quel facteur s'annule au dénominateur ; variations /
  concavité ↔ ligne « signe de f′(x) » / « signe de f″(x) » (« car f prime de x est positive »,
  « passe de plus à moins », « change de signe »). Rôles : `x − 2 (N)` (cours) ou `N : x − 2`
  (générateurs ; plusieurs lignes N → « facteur du numérateur »). Les phrases ne commencent JAMAIS par
  une formule à majuscule forcée (« En effet, x plus 3… », « C'est la racine… »).
  **Lecture des nombres en mots** : `lireTexteMath(x) = lireFormule(unicodeVersLatex(x))` (lot VX : le
  petit lecteur local a été remplacé par le lecteur des formules du site ; `unicodeVersLatex` ramène x²,
  x₁, f′(x), √2⁄2, 1⁄e, ±∞, ‖ au LaTeX) ; `latexVersTexte` (LaTeX des en-têtes KaTeX des générateurs →
  symboles Unicode du modèle) reste pour les repères visuels.
- `components/chapter/LectureTableau.tsx` : enveloppe un `<table>` DÉJÀ rendu, sans changer son
  balisage ni son aspect au repos ; modèle passé (`SignTable`) ou lu dans le DOM (`modeleDepuisTable` :
  texte des cellules, LaTeX lu dans l'annotation KaTeX, éléments `aria-hidden` ignorés ; `etiquettes`
  remplace un libellé — 5e : « Signe » → « Signe de f′(x) »). Grille refusée (rien n'est ajouté) si
  le modèle n'a pas la forme d'un tableau de signes ou ne correspond pas au DOM case pour case.
  - **Choix « actif au repos ? »** : non. Le tableau reste identique ; seule une ligne discrète
    « Lire case par case » (14 px, `--ink-soft`, 44 px de haut) apparaît dessous — sans elle, au doigt,
    personne ne devinerait qu'une case se touche. L'enveloppe `.lecture-tableau` n'a ni marge ni
    bordure : la marge du cadre (`.table-scroll`, `.grille-signes-scroll`) la traverse comme avant, et
    le bouton / le panneau remontent dans cette marge (marges négatives) — impression et export HTML
    (bouton retiré) gardent exactement l'espacement d'avant. La lecture s'active aussi au focus clavier (Tab) et au
    clic sur une case ; elle se referme par « Fermer » (focus rendu au bouton), Échap, ou quand le focus
    part ailleurs (Tab, clic sur un autre élément focalisable ; un toucher iOS ne donne pas de
    `relatedTarget` : on ne referme pas).
  - Grille : `role="grid"` / `row` / `gridcell` posés après chaque rendu (effet idempotent, sans
    dépendances), une seule case `tabindex="0"` (tabulation mobile), flèches (cases `null` sautées),
    Début / Fin, Entrée / Espace relit (région live vidée puis remplie 120 ms après), Échap. Case active
    `.lt-case` (cadre 3 px `--accent`, fond accent-soft à 60 % : les « + » verts y gardent 4,5:1) et sa
    colonne `.lt-colonne` (30 % + filets), sous `@media screen` seulement.
  - Panneau `no-export` : ← ↑ ↓ → (48 × 44 px, `tabIndex = -1` : au clavier, les flèches suffisent),
    « Résumé du tableau », « Fermer », puis la bulle (`--ink` / `--surface`, Andika 16 px, repère 13 px
    en casse normale — pas les capitales mono de la maquette). Boutons AVANT la bulle : une phrase plus
    longue ne déplace pas les boutons sous le doigt. Bulle ramenée à l'écran si elle passe sous le bas
    (`scroll-margin-bottom` : barre fixe de l'étape). Bulle `aria-hidden` : l'annonce passe par un
    `<p class="sr-only" aria-live="polite">` TOUJOURS présent (une région créée en même temps que son
    texte n'est pas toujours lue).
  - **Voix** (lot VX) : bouton « Dire chaque case » du panneau (voir `cote-eleve.md`, « Lecture à voix
    haute ») ; le résumé est inscrit dans `resumesTableaux` (`lib/phrasesPage.ts`) pour « Écouter l'étape ».
  - **Point d'accroche pour la voix** : chaque phrase émet
    `EVENEMENT_PHRASE_TABLEAU` (`'lecture-tableau:phrase'`, `CustomEvent<DetailPhraseTableau>` qui
    bouillonne depuis l'enveloppe : `{ phrase, source: 'case' | 'relire' | 'resume', ligne?, colonne? }`)
    et appelle `onPhrase` s'il est fourni.
  - Inerte dans une diapo de projection (`.diapo`) ; impression et export inchangés (panneau et bouton
    `no-export`, surlignage sous `@media screen`). À l'écran seulement, légende et `zero-cell` de
    `table.tableau` passent de `--ink-faint` (2,8–3,9:1) à `--ink-soft` (6–7,7:1).
- Tableaux AFFICHÉS des générateurs, même lecture (saisie jamais touchée : `TableauEtudeLocaleBuilder`,
  `EtapeGrilleSignes`… inchangés) : `LectureTableau generateur` autour du `.grille-signes-scroll` des
  récapitulatifs `TableauSignes*Recap` (8, 4e), `GrilleQuotientDomfRecap` et `TableauEtudeLocaleRecap`
  (5e).
- Vérifications (dossier de travail `eleve-T/`) : `verif.ts` (les 19 tableaux du cours, chaque phrase
  et résumé relus), `banc.mjs` + `harness.tsx` (récapitulatifs des générateurs montés hors
  générateur, 3 tirages de chaque variante : 120 tableaux, ~3 050 cases cliquées, phrase = région
  live), `verif-ui.mjs` (6 tableaux du cours + 2 de générateurs, iPhone 13 et 1 280 px, clair et
  sombre, cibles ≥ 44 px, pas de défilement horizontal, parcours clavier complet, une seule annonce par
  clic, événement voix), `contrastes.py`, `comparer_prerendu.py` (pré-rendu des 9 chapitres : texte et
  balisage des tableaux identiques à avant, aux attributs de grille près ; seul ajout visible : « Lire
  case par case ») et `impression.mjs` (média print : hauteurs et écarts des tableaux identiques, rien
  du panneau ni du bouton).


## Mots du cours (français simple, pilote 4e « Statistique descriptive », 28/11/2026)

Données et règles d'écriture : `content-authoring.md`, « Français simple et mots du cours ». Code :
- `components/motsDuCoursContexte.tsx` — `FournisseurMotsDuCours` (posé par `ChapterPage` autour de tout
  `.chapter-layout` quand `chapter.lexique` existe ; sinon rien ne change, nulle part) ; `SansMotsDuCours` (coupe le
  repérage : lede, `CeChapitreUtilise`, `EtapeUtilise`, `Formulaire`, `FeatureTable`, légendes de `Illustration`,
  consigne de `CarteManipuler`, blocs `subheading` / tableaux / figures / `atelier` / `entrainement` / `video` dans
  `BlockRenderer`, la bulle et le lexique) ; `PorteeMots` (un bloc : chaque mot n'est souligné que dans la PREMIÈRE
  chaîne du bloc qui le contient — `BlockRenderer` pour chaque bloc, `TiroirBloc` pour les exemples relus pas à pas,
  « Dans la vraie vie » et « Le sais-tu ? », `Essentiel`, chaque ligne de « La fiche du chapitre », chaque carte
  « Teste-toi » ; un bloc imbriqué garde la portée de son parent) ; `marquerMots`, appelé par `RichText`
  (`Math.tsx`) sur les seuls morceaux de texte simple (jamais formule, gras, lien). Hors fournisseur (générateurs,
  « Je bloque », projection, carnet, panneau « Aa », évaluations) : rendu strictement identique.
- Mot souligné : `<span class="mot-cours" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded
  aria-label="quartiles : voir la définition">` — pas un `<button>` (un bouton ne se coupe pas en fin de ligne :
  « polygone des effectifs cumulés » doit passer à la ligne comme le texte). Clic, toucher, Entrée ou Espace. Pointillé
  `--sky` (2 px, décalé sous les jambages ; `--ink` en contraste élevé), fond `--sky-soft` au survol / ouvert /
  focus ; cible tactile agrandie par un `::after` de 40 px de haut sans changer la ligne. `aria-expanded` posé
  directement sur l'élément à l'ouverture (magasin hors React : ouvrir une bulle ne redessine aucun texte). Écran
  seulement (`@media screen`) : imprimé comme du texte ; `buildHtml.ts` remplace le `span` par son texte. Présent dans
  le HTML pré-rendu (contenu identique hors ces balises) ; la bulle, elle, n'existe qu'ouverte.
- `components/chapter/MotsDuCours.tsx` (+ `motsDuCours.css`) — `HoteMotsDuCours` (dans `ChapterPage`) : bulle non
  modale (`role="dialog"`, `aria-modal="false"`, titre = le mot) rendue dans `body` par un portail ; focus dans la
  bulle à l'ouverture ; Échap, clic à côté, « Fermer » → fermée, focus rendu au mot ; changement d'étape / de vue →
  fermée. Contenu : le mot, la définition, « Exemple : … », « Écouter » (seulement si la synthèse existe, après le
  montage : `lire(phrasesDe(contenu), { sansBarre: true })`, le bouton devient « Arrêter » ; fermer la bulle arrête
  SA lecture), « Revoir l'étape n » (si le mot est expliqué dans une AUTRE étape que celle affichée), « Tous les
  mots » (onglet Réviser, défile jusqu'au lexique), « Fermer » (boutons ≥ 44 px). Ordinateur (≥ 760 px) : sous le
  mot (au-dessus s'il manque de place), 380 px au plus, tenue à 16 px des bords, replacée au défilement ;
  téléphone : feuille du bas pleine largeur (70 dvh au plus, défile), au-dessus de la barre « J'ai compris ».
  `z-index` 420 : au-dessus de la règle / du masque de lecture (400). `LexiqueChapitre` : section « Les mots du
  cours » (`id="mots-du-cours"`) de `ReviserVue`, après « La fiche du chapitre », par ordre alphabétique
  (`lexiqueAlphabetique`), définition, exemple, « Revoir l'étape n · titre » ; lien « Les mots du cours » dans la
  rangée « Dans cet onglet ».
- **Avec les aides existantes** (rien ne se gêne) : lecture à voix haute — `phrasesPage.ts` n'exclut que les vrais
  `button` : le mot est lu comme le reste de la phrase ; « toucher une phrase pour la lire » ignore `[role="button"]`
  (toucher un mot ouvre sa bulle, toucher ailleurs lit) ; règle / masque — calque `pointer-events: none`, la bulle
  passe au-dessus (420 > 400) ; « un bloc à la fois » — la bulle est hors du corps de l'étape (portail) : jamais un
  bloc ; toucher un mot d'un bloc effacé le rend net ET ouvre la bulle ; loupe — elle ne réagit qu'aux formules, qui
  ne sont jamais soulignées ; exemples guidés et tableaux lus case par case — inchangés (pas de mot dans un tableau).
