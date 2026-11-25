---
paths:
  - "src/lecture.css"
  - "src/lib/reglagesLecture.ts"
  - "src/lib/formulesDebordantes.ts"
  - "src/components/lecture/**"
  - "src/components/Math.tsx"
  - "src/components/SiteHeader.tsx"
  - "index.html"
  - "src/lib/suivi*"
  - "src/lib/planRevision*"
  - "src/routes/{Suivi,PlanRevision}*"
  - "src/components/suivi/**"
  - "src/routes/EntrainementPage.tsx"
  - "scripts/tester-plan-revision.mts"
  - "scripts/tester-suivi.mts"
  - "src/entrainement/components/ValidationEcran.tsx"
  - "src/entrainement/confortLecture.css"
  - "src/entrainement/components/{JeBloque,PanneauJeBloque,TexteInsistance,CorrigeDetailleEcran,BarreGenerateur}.tsx"
  - "src/entrainement/components/insistanceEcran.ts"
  - "src/lib/{exempleJeBloque,direLecture}.ts"
---

# Côté élève, sans compte

Décision du professeur (maquettes « côté élève sans compte », planches 01 à 13 validées ; planche 14 EN
SUSPENS) : « le confort de lecture est primordial ». **Aucune donnée d'élève ne quitte l'appareil** :
réglages en `localStorage` seulement (clé `lecture:reglages`, try/catch), mention « Gardé sur cet
appareil. Rien n'est envoyé. ». Aucun compte, aucun nom.

## Fait d'office pour tous (planche 11, sans aucun réglage)

En place dans `index.css` (valeurs changées sur place, rien de réordonné) et `Math.tsx` :
- Sous-titre d'étape (`.parcours .section-kicker`) : police de lecture 15 px, `--ink-soft` (6,3:1 clair,
  7,7:1 sombre ; avant : mono 12 px `--ink-faint`, 2,99:1). Fil d'Ariane (`.breadcrumb`) : Work Sans
  13,5 px `--ink-soft`, liens `--ink`. Durée des étapes de la carte et « Ce chapitre » : `--ink-soft`.
- Étiquettes sans `text-transform: uppercase` : `.parcours .callout-label` / `.etiquette` (L'essentiel,
  Pour visualiser, Manipuler, Vidéo, À toi) 14 px gras, parties de la carte (`.liste-partie` 13,5 px ;
  colonne 12,5 px), « Avant de commencer » (`.intro-avant`), méta de l'étape sur ordinateur (`.etape-meta`,
  Work Sans 13,5 px). Restent en capitales mono : surtitre du chapitre, « Ce chapitre », barre d'étape
  (comme sur la maquette).
- Colonne de lecture plafonnée : `.parcours .section-body > :is(p, ul, ol, h3, .callout, .essentiel,
  .wrong-right, .etape-annexes, .section-kicker) { max-width: var(--l-largeur, 32em) }` — 32em ≈ 68
  signes en Andika (MESURÉ sur le build, polices chargées : ≈ 2,1 signes par em) ; figures, tableaux, ateliers gardent
  toute la largeur ; sans effet sur téléphone.
- `RichText` (`Math.tsx`) : `insecablesFr` (espace ORDINAIRE avant « : ; ? ! » et à l'intérieur de « … »
  → U+00A0 ; les données ne sont pas réécrites) et ponctuation COLLÉE à la formule (`.math-inline` est un
  inline-block : le navigateur coupait juste après) : la ponctuation qui suit (`, . ; : ! ? … ) ] »`, ou
  insécable + `: ; ? ! »`) et `(` `[` `« ` qui précèdent vont dans `<span class="colle">` (`nowrap`,
  formule plafonnée à `100% − 0,8em` pour ne jamais déborder). Même DOM à l'impression et dans l'export
  HTML : seulement des coupures en mieux. Vaut aussi pour la projection, les légendes, le panneau des
  évaluations et le carnet (tous passent par `RichText`). Les générateurs ont leur propre `TexteRiche`
  (lot G).
- Formule trop large : `lib/formulesDebordantes.ts` marque `.math-inline` `data-deborde` (débord > 6 px :
  les indices KaTeX dépassent de 1 à 3 px sans être coupés), `data-defile`, `data-fin` ; dégradé à
  droite / à gauche (`lecture.css` § 4, `mask-image`, écran seulement). Mesure regroupée (≤ 1 fois par
  150 ms) après changement du DOM, redimensionnement, réglage, polices. **Jamais au pré-rendu** :
  `scripts/prerender.mjs` pose `window.__prerendu` (`addInitScript`).
- Outils du chapitre (« Lecture · Feuilles · Imprimer ») en 12,5 px, passent sous « Ce chapitre » si
  besoin (`.lecture-entete { flex-wrap: wrap }`).

## Réglages (`src/lib/reglagesLecture.ts`, API extensible)

`ReglagesLecture` : `police` (andika | atkinson | opendyslexic), `taille` (1–5 : 100/112/125/145/170 %),
`interligne` (1,6 / 1,8 / 2), `espacement` (lettres + 0 / 0,035 / 0,08 em, mots + 0 / 0,12 / 0,24 em,
paragraphes 1,1 / 1,4 / 1,8 em), `largeur` (≈ 68 / 60 / 50 signes : 32 / 28 / 23,5em), `theme` (auto |
clair | sombre | creme | contraste), `animations` (auto | reduites). `ATTRIBUTS` = valeurs admises, la
PREMIÈRE étant le réglage du site. Préréglages (`PREREGLAGES`, texte seulement) : Réglage du site ;
Lecture confortable (Andika 112 %, 1,8, aéré, ≈ 60) ; Dys (Atkinson 112 %, 2, très aéré, ≈ 50) ;
Grand texte (Atkinson 145 %, 1,8, aéré, ≈ 60). Magasin : `reglagesCourants`, `changerReglages`,
`revenirAuReglageDuSite`, `abonnerReglages`, `useReglagesLecture`, `animationsReduites()` (à utiliser
au lieu de `matchMedia('(prefers-reduced-motion)')` seul ; `ReviserVue` le fait), événement `storage`
(autre onglet). **Ajouter un réglage** (onglet « Aides » des lots suivants) : type + `ATTRIBUTS` + table
`R` du script en ligne d'`index.html` + règles CSS.

Mécanisme : chaque valeur ≠ défaut → attribut `data-<clé>` sur `<html>` (+ `data-lecture-perso` si au
moins un) ; valeur par défaut → AUCUN attribut (le pré-rendu et un visiteur sans réglage ont le DOM
d'avant ; `localStorage` vidé au retour au réglage du site). **Anti-flash** : script en ligne
d'`index.html` (après celui de `data-annee-accueil`), mêmes clés et valeurs ; `main.tsx` réapplique
(couleur de la barre du navigateur `meta[name=theme-color]`, police OpenDyslexic).

CSS (`src/lecture.css`, importé APRÈS `index.css`) : attributs → variables (`--l-echelle`,
`--l-echelle-ui` 1 / 1,05 / 1,1 / 1,2 / 1,2, `--l-interligne`, `--l-lettres`, `--l-mots`,
`--l-paragraphe`, `--l-largeur`, `--l-police`) ; application TOUJOURS sous `:root[data-…]` et `@media
screen` (sans attribut, rien ne change ; l'impression a ses propres réglages et ne change jamais) :
- police : `--lecture` (seul jeton de police de lecture) redirigé sur `.chapter-layout.parcours`,
  `.accueil`, `.entrainement` ; titres (Fraunces) et interface (Work Sans) inchangés ;
- taille (cours) : corps `17px × e`, titres `× min(e, 1,35)`, étiquettes `14px × min(e, 1,3)`, légendes,
  sous-titre, Réviser ; interface (barre du bas, boutons, tiroirs, barre d'étape) `× --l-echelle-ui`
  pour rester sur une ligne ; accueil : `zoom: --l-echelle-ui` dès 125 % ; formules en `em` : suivent ;
  générateurs : police + espacement + thème, et la TAILLE depuis le lot G (voir « Générateurs », plus bas) ;
- espacement : jamais dans `.katex` (KaTeX place chaque signe lui-même) ;
- zoom du navigateur à 200 % toujours possible (aucun `maximum-scale`).

OpenDyslexic (© Abbie Gonzalez, SIL OFL 1.1, `src/assets/polices/` + `OFL-OpenDyslexic.txt`, fichiers
@fontsource/opendyslexic 5.3.0 latin) : AUCUN `@font-face` en CSS — enregistrée par `FontFace` (JS)
SEULEMENT quand l'élève la choisit. Raison : `buildHtml.ts::inlinerPolices` télécharge et recopie TOUTES
les polices des feuilles de style dans l'export HTML d'un chapitre. Atkinson et Andika : `@fontsource`
déjà importés (`main.tsx`), téléchargés seulement s'ils sont utilisés. Les fichiers woff2 ne sont pas dans
le précache du service worker (motifs par défaut : js, css, html).

## Thèmes

« Auto » = aucun attribut = `@media (prefers-color-scheme)` d'avant. Choix explicite : jeux COMPLETS de
jetons sous `:root:is([data-theme=clair|creme|contraste])` (copie des valeurs claires de `:root`) et
`:root[data-theme="sombre"]` (copie du bloc sombre) — **à tenir à jour si un jeton de couleur est ajouté
à `index.css`** (comme `.theme-clair` de la projection) ; Crème et Contraste élevé redéfinissent ensuite
leur palette (rôles d'encadrés gardés). Jetons de composant posés sous `prefers-color-scheme` repris
dans les deux sens : `.site-header --logo-fond`, `.accueil` (`--sombre`…), `.accueil-reprendre`,
`.eleve-recap`, `.entrainement --solide3d-*`, `--admin-*`, `--profil-*`, `--agenda-*`, `--carnet-*`.
Contraste élevé : traits 2 px (encadrés, tiroirs, cartes), filet gauche 5 px, liens soulignés ; `--line-soft` #8f8f8f (filet 3,2:1 ET fond de pistes / onglets d'année : texte noir dessus 6,5:1 — le #4a4a4a de la maquette rendait les onglets d'année illisibles) ; bouton désactivé des générateurs blanc à trait tireté.
**Projection (professeur) jamais touchée** : chaque thème et « animations réduites » sont gardés par
`:not(:has(.projection))` (navigateur sans `:has()` : thème de l'appareil, comme avant).
Contrastes mesurés (Playwright, étape 1 de Suites, téléphone et 1 280 px) — sous-titre / fil d'Ariane /
méta : clair 6,31, sombre 7,67, crème 7,8, contraste 16,48 ; liens du fil / texte : ≥ 14 ; « Ce
chapitre » et parties de la carte (sur `--paper`) : clair 5,61, sombre 8,37, crème 6,88, contraste 16,48.

## Panneau « Confort de lecture » (`src/components/lecture/`)

- `BoutonLecture` (variantes `entete` — `SiteHeader`, « Aa Lecture » dès 900 px, masqué sur téléphone
  dans une étape ; `etape` — barre collante de l'étape ; `outil` — « Lecture » dans `OutilsChapitre`),
  pastille orange (`:root[data-lecture-perso] .pastille-reglee`, sans attendre le JS), `aria-expanded`,
  nom accessible « Confort de lecture… (réglage personnel actif) ». Téléphone ≤ 480 px hors étape :
  « Professeur » en icône seule (une ligne d'en-tête) ; sous 360 px partout, marges resserrées : une ligne dès 320 px (avant : deux lignes sous 360 px). Bouton dans la barre des générateurs : `BarreGenerateur`
  (variante `etape`, lot G).
- `etatPanneauLecture.ts` : un seul panneau (`HotePanneauLecture` dans `App`, panneau chargé à la demande
  à la première ouverture), focus rendu au bouton d'origine (sinon à un `[data-bouton-lecture]` visible).
- `PanneauLecture.tsx` : `<dialog>` modal (`showModal` : focus piégé, Échap → `cancel`, clic sur le
  voile). Téléphone : feuille du bas 92dvh ; ≥ 900 px : panneau de 420 px à droite, `body` décalé
  (`html.lecture-panneau-ouvert`), colonnes latérales de l'étape retirées : la page réagit en direct.
  Aperçu collant = « L'essentiel » de l'étape ouverte (sinon première étape du chapitre, sinon Suites
  étape 1), réglé par les mêmes variables. Onglets (`tablist`, flèches / Début / Fin) : Texte
  (préréglages, taille, police — textes honnêtes du rapport, OpenDyslexic « pas de lecture plus rapide ni
  plus juste… » —, interligne, espacement, longueur), Couleurs (5 thèmes, « Réduire les animations »),
  Aides (« Bientôt »). Pied : « Revenir au réglage du site » + mention. Boutons ≥ 44 px.

## Vérifications (dossier de travail `eleve-A1/` : `verif.mjs`, `cap.mjs`, `montage.mjs`)

Voir le rapport du lot : DOM sans attribut sans réglage (5 pages × téléphone / 1 280 × clair / sombre),
`scrollWidth` = largeur (dont 320 px en Grand texte et 170 % OpenDyslexic), contrastes ci-dessus, signes
par ligne (1 280 et 1 440 : ≈ 68 / 60 / 50), panneau (focus, 40 Tab piégés, Échap, focus rendu, stockage,
pastille, retour au site, cibles, onglets au clavier), anti-flash (JS applicatif bloqué : attributs déjà
posés), impression identique avec / sans réglages, projection (`.projection` présent : jetons de
l'appareil), OpenDyslexic absente des feuilles et non téléchargée sans choix, générateurs (gen7,
5gen14, 6gen47 `AppCombinatoire`, 6gen100 `AppEcransTrigo`) et widgets suivent les jetons.

## Mon suivi et plan de révision (planche 13)

Routes publiques, `noindex` (`usePageNonIndexee`), **jamais pré-rendues** (absentes de
`scripts/routes.mjs`), chargées à la demande (`App.tsx`) :

- `/suivi` — `routes/SuiviPage.tsx`. `?niveau=` (sinon année de l'accueil `anneeDeDepart`, sinon celle
  du dernier essai), `?chapitre=` (sinon le dernier chapitre travaillé). Onglets des chapitres de
  l'année ; « À retravailler » en tête (pourquoi + « Revoir : étape n, « … » » + « M'entraîner : id ·
  titre ») ; puis chaque étape : comprise (pastille ✓), 5 derniers essais en cases, « 9 réussis sur 11,
  dont 2 avec aide », cartes « n / N « Je savais » ». « Effacer mon suivi… » : confirmation DANS la page
  (jamais `confirm()`), cases « essais » / « plan » cochées, « étapes comprises et cartes de toutes les
  années » décochée. Pas de « bilan à montrer » ni d'« emporter » (planche 14 en suspens).
- `/suivi/plan` — `routes/PlanRevisionPage.tsx`. Formulaire (date de l'interro `input type="date"`,
  année, étapes par chapitre en `<details>` préremplies par « À retravailler », 10 / 20 / 30 min, jour
  libre), puis le plan jour par jour (cases cochables, durées, « revue n° k », « reporté de lundi »,
  résumé des reports d'un jour raté, évaluation blanche l'avant-veille → `/{niveau}/{chapitre}/exercices`).
- Accès : carte « Mon suivi » de l'accueil (`HomePage.tsx`, `CarteSuivi`, à côté de « Préparer mon
  interro ») ; le plan depuis Mon suivi. La maquette ne met pas de lien dans l'en-tête ni dans la page de
  chapitre : rien n'y a été ajouté.

### Enregistrer les essais des générateurs (`lib/suiviEssais.ts`)

Clé `suivi:essais:v1` : `{ v: 1, g: { [idGénérateur]: [{ t, e, v? }] } }` — `t` = `Date.now()` de la fin
de l'exercice, `e` = un caractère par écran (`o` juste du premier coup, `a` juste avec aide, `r` révélé,
comme les puces ; « sans objet » non gardé), `v` = variante si connue (quiz : le thème). Verdict d'un
essai : `rate` si un écran révélé, sinon `aide` si un écran avec aide, sinon `reussi`. Bornes : 30 essais
par générateur, 1 500 au total (≈ 60 Ko) ; quota plein → la moitié la plus ancienne part, un seul nouvel
essai. Événement local `suivi:modifie` (même onglet), `storage` (autres onglets).

**Points de passage communs** (aucun générateur réécrit) :

1. le magasin du cadre (`entrainement/components/cadreGenerateur.ts`), où `ProgressionPuces` publie ses
   segments — `EntrainementPage` s'y abonne (`observerProgression(...).segments`) ;
2. `ValidationEcran` (partagé par les trois chantiers, 724 usages) signale chaque écran clos
   (`useSignalerVerdict`, `SuiviVerdictContext`, une fois à l'apparition du bloc) ;
3. un écouteur de clic (capture) sur la racine de la page repère « Aide » (`.btn-aide`,
   `[data-bouton-aide]`, y compris via le tiroir du cadre qui clique le même bouton).

Piège constaté : la plupart des générateurs gardent le DERNIER écran « courante » jusqu'au clic sur
« Nouvel exercice », qui repart aussitôt sur un nouvel exercice — les segments ne sont jamais tous clos.
D'où la règle : un essai est noté quand tous les segments sont clos, OU quand `ValidationEcran` apparaît
alors que le seul segment non clos est l'écran en cours et qu'il est le dernier (résultat de ce dernier
écran = verdict révélé/juste + « Aide » touchée pendant cet écran). Une seule note par exercice ; la
suivante dès qu'un nouvel exercice recommence. Un écran : chaque verdict compte. Sans puces publiées du
tout : chaque verdict = un exercice d'un écran. Logique testée seule : `node --experimental-strip-types
scripts/tester-suivi.mts`. Couvre les 323 générateurs (sur 347 au registre) dont l'arbre d'import atteint
`ProgressionPuces` — tous les socles (`AppCombinatoire`, `AppEcransTrigo`, `sessionEcransTrig`,
`AppTransfertSecondDegre`, `AppEspaceLotH`…) et les applis propres. Un exercice abandonné en cours n'est
pas noté.

Sans puces partagées : `useNoterEssai()` (`lib/suiviContexte.ts`, contexte fourni par
`EntrainementPage`, sans effet ailleurs) — les 23 quiz vrai/faux (gen59–66, 5gen39–43, 6gen64–73 : une
affirmation répondue = un essai d'un écran, variante = thème) et gen40 « Section plane » (à « Nouvel
exercice » ; il entoure son rendu de `<SuiviVerdictContext.Provider value={null}>` pour que ses verdicts
écran par écran ne comptent pas chacun comme un exercice). Contrôle de couverture : script `couverture.mjs` du dossier de travail (arbre d'import de
chaque entrée du registre vers `ProgressionPuces.tsx`). Un nouveau générateur qui utilise
`ProgressionPuces` est couvert sans rien faire ; un nouveau quiz doit appeler `useNoterEssai()` dans son
`onValider` (même trois lignes que les autres).

### Rattacher un essai à son étape (`lib/suiviChapitres.ts`, pur)

Générateurs d'une étape = blocs `entrainement` de la section (un générateur cité dans deux sections
compte dans les deux) ; la carte `recap.entrainement` (quiz du chapitre) forme une ligne « Tout le
chapitre » si elle n'est dans aucune section. Progression : `lireParcours` (`parcours:…`), cartes :
`lireEtatsCartes` (`cartes:…`, clé `idSection:indice`). « À retravailler » : ≥ 2 ratés sur les 3
derniers essais d'un générateur, ou dernier essai raté, ou ≥ 1 carte « À revoir » ; le pourquoi le dit
(« 2 ratés sur tes 3 derniers essais de 5gen15, et 1 carte « Teste-toi » marquée « À revoir ». »).
Tons : Bien / À retravailler / Compris (lue, sans essai) / Commencé / Pas commencé.

Cases des 5 derniers essais : **forme et couleur** — ✓ plein vert (réussi), ✓ pointillés ambre (avec
aide), ✗ encadré rouge (raté), case grise (pas encore) ; `role="img"` + `aria-label` en mots ; légende
sous le chapitre.

### Plan de révision (`lib/planRevision.ts`, pur ; stockage `lib/planRevisionStockage.ts`)

Clé `suivi:plan:v1` : `{ debut, interro, minutes, jourLibre, niveau, etapes: ['chapitre#section'], faites: [idTâche] }`.

Algorithme (testé seul : `node --experimental-strip-types scripts/tester-plan-revision.mts`, 16 tests —
dates/heure d'été, 7 jours, jour libre, jours ratés, rattrapage, peu de temps, 12 étapes, interro
demain, interro passée, essentiel) :

1. **Plan de base** (ne dépend ni du jour courant ni des coches, donc stable) : jours `debut` → veille de
   l'interro ; jour libre sans tâche (jamais tous) ; dernier jour de travail = veille (cartes « À revoir »,
   10 min ; toutes les cartes si aucune n'est marquée) ; avant-dernier = évaluation blanche (20 min) s'il y
   a au moins 4 jours de travail ; un seul jour = « l'essentiel » (cartes + un exercice par étape, à
   retravailler d'abord). Les autres jours apprennent les étapes dans l'ordre (une par jour, ou par paquets
   égaux) : relire « L'essentiel » (2 min) + 2 exercices (3 si à retravailler, 4 min chacun ; un exemple
   résolu à refaire, 5 min, si l'étape n'a pas de générateur) + cartes (0,8 min/carte) ; réduit jusqu'à
   tenir dans le temps choisi (1 exercice, sans relecture, puis exercices retirés aux étapes non à
   retravailler). Jours restants : mélange (exercices, à retravailler d'abord). Cartes qui reviennent :
   le lendemain, 3 jours, une semaine (revues n° 2, 3, 4), sur le premier jour de travail suivant, avant la
   veille, sans dépasser temps + 10 min.
2. **Jours passés** : statut fait / en partie / pas fait ; ce qui n'est pas coché est reporté sur les
   jours à partir d'aujourd'hui, **jamais plus de 10 min de plus par jour** (`SURPLUS_MAX`), exercices un
   par un, la veille ne prend que des cartes. D'abord l'essentiel (cartes, premier exercice de chaque
   étape) — au besoin en allégeant un jour (relecture, exercices au-delà d'un) —, puis le reste ; ce qui ne
   tient pas est laissé de côté (« le plan garde l'essentiel »). Rien ne s'accumule : tout est recalculé
   à chaque affichage depuis le plan de base et les coches. L'évaluation blanche ne se reporte pas (20 min
   > surplus) ; elle reste proposée en bas du plan.
3. **Coches** : une tâche reportée garde l'identifiant d'origine (`#i` pour un exercice seul), donc la
   cocher n'importe quel jour vaut pour le jour d'origine ; des cartes d'une étape revues un jour suivant
   valent pour les revues manquées avant.

**Point d'accroche (page de classe, lot C)** : `lienPlanRevision({ date, niveau, chapitre, etapes })` →
`/suivi/plan?date=AAAA-MM-JJ&niveau=5e-4h&chapitre=suites&etapes=idSection1,idSection2` (`?interro=` est
aussi lu). Le formulaire s'ouvre prérempli (« Date et étapes reprises de la page de ta classe ») ; rien
n'est remplacé sans que l'élève valide.

### Mise en page

`components/suivi/suivi.css` (chargé avec ces pages), classes `suivi-*` / `plan-*`, jetons du site
uniquement (clair, sombre, tout thème qui les redéfinit) ; police de lecture `var(--l-police, Andika…)`.
Cibles ≥ 44 px (cases du plan dans une zone de 44 px, liens, onglets), onglets des chapitres au clavier
(flèches, Début, Fin), focus visible, la rangée d'onglets défile seule sur téléphone (jamais la page).

## Générateurs (lot G, planche 10)

Tout passe par le cadre commun de la page d'un générateur (`EntrainementPage`) et les composants de rendu
partagés : **aucun `App*.tsx` réécrit**, `SelecteurVarianteDev` intact (ni masqué ni retouché, il garde même
sa taille), aucune saisie filtrée, aucun chronomètre, aucun point.

### Taille du texte (`src/entrainement/confortLecture.css`, chargé après `cadre.css`)

- **Méthode** : les tailles de `cadre.css` / `theme.css` sont écrites `calc(Npx * var(--g-t, 1))` (texte de
  lecture : base de `.entrainement`, énoncés, consignes, données, aides, messages, verdicts, réponse
  attendue, corrigé, rappels, fiche) ou `calc(Npx * var(--g-ui, 1))` (interface : boutons, barre du haut,
  étiquettes en capitales, tableaux de saisie, grilles de signes, curseurs, bouton flottant de la
  calculatrice) — valeurs changées SUR PLACE (script `taille_css.py` du dossier de travail), rien réordonné.
  Les variables ne sont définies que dans `confortLecture.css`, sous `@media screen` et `:root[data-taille]` :
  sans réglage et à l'impression, calc(16px × 1) = 16px (rendu identique). Échelles : texte 1 · 1,08 ·
  1,18 · 1,35 · 1,55 (énoncé 18 px → 19,4 / 21,2 / 24,3 / 27,9 px ≈ corps du cours 17 px × 1,12 / 1,25 /
  1,45 / 1,7) ; interface = `--l-echelle-ui` (1 · 1,05 · 1,1 · 1,2 · 1,2) ; titre `--g-titre` plafonné à 1,25.
  **Ajouter une taille de texte dans un générateur** : l'écrire de la même façon (`calc(14px * var(--g-t, 1))`).
- **Pourquoi pas `zoom`** (maquette) : sous un ancêtre zoomé, les positions fixes que `CadreActions` calcule
  en pixels réels (`--col-x/-w/-top` de l'énoncé épinglé, `--clavier`, `--barre-aide-w`) sont multipliées une
  seconde fois, et les figures Mafs convertissent le doigt avec leur largeur non zoomée (Chromium et l'ancien
  `zoom` de WebKit/iOS ne mesurent pas pareil). La taille de police laisse figures, barres fixes et mesures
  exactes ; les formules (KaTeX en `em`) suivent le texte qui les porte ; le texte des figures (SVG, Mafs)
  garde sa taille (vérifié).
- **Champs** : dès qu'une taille est choisie, `.text-input` ≥ 52 px de haut, chiffres `max(20px, 18px × e)`
  (tableaux de saisie : 20 px). Interligne choisi appliqué aux textes de lecture (jamais sous 1,5).
- **Restent à leur taille** : `SelecteurVarianteDev`, le panneau de la calculatrice (touches en grille fixe),
  le bandeau replié d'une ligne (15 px), la table de Φ, le texte des figures.
- `EntrainementPage` : un réglage changé (`data-taille`, `data-police`, `data-interligne`, `data-espacement`
  sur `<html>`), une police chargée ou le panneau « Aa » ouvert sur ordinateur (`lecture-panneau-ouvert`,
  page décalée de 420 px) → un `resize` est envoyé (une fois, seulement si l'état change) : l'énoncé épinglé,
  l'aperçu replié et la barre du bas se recalculent.

### Bouton « Aa »

`BarreGenerateur` : `<BoutonLecture variante="etape" />` en bout de barre (44 × 44 px, pastille du réglage
personnel), grille `44px 1fr auto auto` (écart 8 px sous 400 px) : la barre reste sur une ligne de 320 px à
170 % (« niveau · chapitre » coupé par « … » comme avant).

### Corrigé ligne par ligne (`CorrigeDetailleEcran`)

- **Choix** : un petit bouton « Lire ligne par ligne » dans l'en-tête du corrigé (et non une option du
  panneau) — là où l'élève en a besoin, sans réglage caché à retrouver, et sans toucher l'onglet « Aides » du
  panneau (autre lot). Par défaut : le corrigé complet, comme avant ; le choix n'est pas mémorisé. Vaut
  partout où le corrigé typé est rendu : sous la réponse révélée, dans « Voir comment on y arrive »
  (`CorrigeDepliable`) et dans la fiche d'une puce (`FicheReponseEcran`).
- Une ligne = le texte d'une étape du corrigé, chaque ligne de calcul (avec sa justification), ou un piège ;
  une figure apparaît avec la dernière ligne de son étape (seule, elle est une ligne). Ligne en cours : fond
  accent clair + cadre 2 px (une ligne de calcul = ses cases sur la rangée) ; lignes lues en `--ink-soft`
  (jamais une opacité : les justifications, déjà secondaires, passaient sous 4,5:1) ; lignes à venir en
  `visibility: hidden` (place gardée : rien ne saute sous le doigt), étiquette d'étape masquée tant que sa
  première ligne n'est pas atteinte. Barre collée en bas (au-dessus de la barre fixe et du clavier) : « Ligne
  n sur N », « Ligne suivante » (focus donné à l'ouverture), « Tout montrer » (focus à la dernière ligne ;
  retour au corrigé complet), « Écouter ». Ligne ramenée dans la vue, annoncée dans une région `aria-live`
  (formules lues en mots).
- **Point d'accroche de la voix** (`src/lib/direLecture.ts`) : `dire({ texte, source, element })` émet
  `lecture:dire` (`CustomEvent<DetailDire>`, annulable, qui bouillonne depuis `element`) ; le module de voix
  l'écoute sur `document` et appelle `preventDefault()` pour prendre la main. Sinon, repli minimal
  `speechSynthesis` (voix `fr-BE`, puis `fr-*`). `texteLisible(el)` : texte de l'élément, formules remplacées
  par leur `aria-label` en mots, rien de ce qui est `aria-hidden`. « Écouter » n'est affiché que si
  `speechSynthesis` existe.
- Les boutons ne sont jamais `.btn-primary` (sinon `CadreActions` les prendrait pour le bouton principal).

### « Je bloque » (`JeBloque.tsx`, `PanneauJeBloque.tsx`, `lib/exempleJeBloque.ts`)

- **Quand** : message partagé « Incorrect — tentative n/m » visible dans la carte avec 2 ≤ n < m (écran pas
  clos) → bouton « Je bloque » ; il reste jusqu'à la fin de l'écran (bloc de validation affiché, ou autre
  écran « en cours » dans les puces publiées). Repérage par le DOM (MutationObserver), comme `CadreActions`.
  Les générateurs qui n'écrivent pas ce message (choix fermés à une tentative, quiz vrai/faux) n'ont pas de
  bouton : un choix fermé faux révèle déjà la réponse et son corrigé.
- **Où** : téléphone et tablette, pastille à gauche juste au-dessus du message de retour (lui-même au-dessus
  de la barre fixe ; la calculatrice flottante de la tablette est à droite), place réservée sous le contenu
  (`data-je-bloque`), champ actif remonté s'il passerait dessous ; ordinateur, en bas de la colonne des étapes.
- **Quoi** : `<dialog>` modal (`showModal` : focus piégé, Échap, clic sur le voile, focus rendu au bouton) —
  feuille du bas (92dvh) sur téléphone, panneau de 560 px à droite dès 900 px. « Tu bloques ? C'est normal. »,
  « Deux essais sans réussir : revois l'exemple résolu… Ton exercice t'attend ici, rien n'est perdu. »,
  « Étape n · titre », l'exemple révélé pas à pas avec les composants du cours (`ExemplePasAPas` /
  `ExempleLibrePasAPas`, exportés par `ContenuEtape.tsx` — chargés à la première ouverture), à défaut
  « L'essentiel » de l'étape ; « Revoir l'étape n (nouvel onglet) » (`target="_blank"` : l'exercice en cours
  reste ouvert) et « Retour à l'exercice ». Rien de la réponse de l'écran.
- **Exemple choisi** (`cibleJeBloque`, pur) : section = celle de la carte « S'entraîner » (la même que le lien
  de retour) ; parmi ses `exemple` / `exempleLibre` (jamais une « Démonstration… »), le plus proche de la
  carte, à égalité celui d'avant ; « Pour aller plus loin » seulement s'il n'y en a pas d'autre. Couverture
  (356 générateurs au registre) : 311 avec un exemple, 27 avec « L'essentiel » seul, 18 quiz de fin de
  chapitre hors de toute section (pas de bouton).
- **Mon suivi** : l'ouverture n'est PAS notée comme une aide — le suivi recopie les puces (« juste avec aide »
  = bouton « Aide » de l'écran) et revoir le cours n'est pas l'aide de l'écran.

### Plus de majuscules d'insistance à l'écran (point 8 « fait d'office »)

- **Règle** : `components/insistanceEcran.ts::segmentsInsistance` réutilise la règle du papier SANS la
  changer (`export/majusculesPapier.ts::sansMajusculesDInsistance`, liste `SIGLES`, noms de points,
  permutations, chiffres romains épargnés) : les lettres qu'elle met en minuscules désignent les mots
  d'insistance ; chaque suite de mots transformés (« À LA FOIS ») est rendue dans UN
  `<strong class="insistance">` en minuscules (majuscule initiale gardée en début de phrase). Aucune donnée
  réécrite : le papier garde sa propre règle, identique.
- **Branchement** (`TexteInsistance`, composant sans conteneur, `null` accepté) dans les rendus de texte
  partagés : fragments texte / LaTeX (`RenduFragments` 4e et 6e, `RenduFragmentsQuiz`, `SegmentsInline` 4e et
  5e, les `Fragments` locaux d'`EtapeEcransTrigo`, `EtapeEcransExp`, `EtapeDefinirSuite`,
  `EtapeModeliserSuite`, `EtapeSommeInfinieSituation`, `EtapeTroisTermes`, `EtapeSommesTermes`,
  `FragmentsConsigneSinusoide`, `EtapesChoisirModele`, `EtapesAireTriangleSinus`, corrigé
  `CorrigeDetailleEcran`), `TexteRiche` (4e) et `TexteRiche5e`, et les aides rendues en chaîne brute
  (`<p>{aideNiveau1.texte}</p>` : 210 rendus dans 110 composants ; `<p>{texteAide…(…)}</p>` : 54 rendus dans
  48 composants — scripts `brancher_aides.py`, `brancher_aides_fonctions.py` du dossier de travail). Deux
  chaînes affichées telles quelles hors de ces rendus passées en minuscules dans la source (gen101
  « deux points distincts », 6gen19 « la valeur exacte »).
- **Nouveau texte d'écran** : passer par `TexteRiche`, des fragments, ou `<TexteInsistance texte={…} />` ;
  écrire de préférence directement en minuscules (le gras n'existe pas dans les données).
- **Contrôle** : `majuscules.mts` (recherche dans les sources : littéraux et texte JSX, jugés par la règle du
  papier — 1 015 textes en prose dans 164 fichiers, presque tous des données) et `scan-majuscules.mjs` (rendu
  RÉEL, build de production, les 356 générateurs du registre : chargé, « Aide » jusqu'au bout, trois essais
  faux ou un choix faux, corrigé déplié ; texte visible hors formules et hors gras jugé par la même règle).
