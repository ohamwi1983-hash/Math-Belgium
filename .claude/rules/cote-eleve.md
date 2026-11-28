---
paths:
  - "src/lecture.css"
  - "src/lib/reglagesLecture.ts"
  - "src/lib/formulesDebordantes.ts"
  - "src/components/lecture/**"
  - "src/lib/voixLecture.ts"
  - "src/components/chapter/ContenuEtape.tsx"
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
  - "src/lib/exempleJeBloque.ts"
  - "src/lib/phrasesPage.ts"
  - "src/lib/decoupagePhrases.ts"
  - "src/lib/lectureTableauSignes.ts"
  - "src/entrainement/components/EcouterAides.tsx"
  - "src/entrainement/components/CadreActions.tsx"
  - "src/entrainement/*/components*/EnTeteExercice.tsx"
  - "src/lib/guideEleve.ts"
  - "src/components/eleve/{BarreEleve,AidePage,VisiteAccueil,AccueilEleve,IconesEleve}.tsx"
  - "src/components/eleve/guideEleve.css"
  - "src/components/eleve/BlocEvaluation.tsx"
  - "src/components/eleve/blocEvaluation.css"
  - "src/lib/pageClasse.ts"
  - "src/routes/{HomePage,EntrainerPage}.tsx"
  - "src/entrainement/components/FinExercice.tsx"
  - "src/components/chapter/{FinEtape,CarteChapitre}.tsx"
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
(autre onglet). **Ajouter un réglage** : type + `ATTRIBUTS` + table `R` du script en ligne d'`index.html` +
règles CSS (onglet « Aides » : voir « Aides de lecture »).

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
  Aides (voir « Aides de lecture » ci-dessous). Pied : « Revenir au réglage du site » + mention. Boutons ≥ 44 px.
  Piège (dev seulement) : sous `StrictMode`, le panneau se referme aussitôt ouvert (le `close()` du nettoyage
  de l'effet émet `close` APRÈS le remontage → `onClose`) ; le build n'a pas ce double montage : tester le
  panneau sur `vite build` + `vite preview`.

## Aides de lecture (onglet « Aides », planches 07 et 09, lot A2)

Modèle validé : la démo `artefact-lecture/lecture-guidee.html` (onglets 7 et 9). Réglages ajoutés à
`ReglagesLecture` (et à la table `R` d'`index.html`) : `ligne` (aucune | regle | masque), `bande` (2 | 1 | 3
lignes), `unbloc` (non | oui), `exemples` (guides | libres — **guidés d'office**), `loupe` (non | oui), `signes`
(non | oui), `correspondances` (non | oui). Valeur du site = aucun attribut, comme le reste.

**Ce qui est CSS seul** (`lecture.css` § 6, juste dès l'affichage grâce au script anti-flash) :
- *Plus d'air autour des signes* : `margin` 0,13 em de part et d'autre des `.mbin` / `.mrel` de KaTeX (un
  « − » de signe est un `.mord` : il reste collé) ; remis à 0 dans `.msupsub`, `.op-limits`, `.root` (indices,
  exposants, bornes, indice de racine) ; jamais d'espacement des lettres. Mesuré sur les 179 étapes à 390 px :
  aucune page qui déborde ; 26 formules de plus passent en défilement avec dégradé (`formulesDebordantes`).
- *Correspondances* : `.katex .enclosing.m1|m2|m3` → couleur `--corresp-1|2|3` ET trait (plein / tirets /
  double, `border-bottom` en `em`) ; couleurs par thème (texte ≥ 5,4:1 sur le fond d'un tiroir d'exemple :
  clair 5,5–6,1, sombre 7,5–7,8, crème 5,4–5,7, contraste 9,6–10). Mécanisme de contenu : règle
  `content-authoring.md`, « Correspondances ».
- *Exemples résolus guidés* (planche 07 ; le site montrait déjà une étape à la fois) : l'étape en cours = le
  dernier `li` montré, entouré (2 px `--sky`, fond `--surface`) ; les précédentes en `--ink-soft` (≥ 5,5:1,
  jamais d'opacité), numéro en cercle évidé. `pas-fin` (résultat montré) : c'est le résultat l'étape en cours ;
  `pas-tout` (« Tout montrer » touché) : plus rien n'est mis en avant. Activé d'office : la démo validée par le
  professeur l'avait coché, il ne fait qu'ajouter un repère (rien n'est caché ni déplacé) et ne touche ni
  l'impression ni le pré-rendu (pas à pas absents du HTML pré-rendu : tiroirs de l'étape active seulement).
  « Écouter l'étape n » / « Écouter le résultat » (`ContenuEtape.tsx`, `BoutonsPas`) : seulement après le
  montage, si `speechSynthesis` existe, et en mode guidé.

**Ce qui est du code** (`components/lecture/AidesLecture.tsx` + `aidesLecture.css`, chargés à la demande par
`HoteAidesLecture` — dans `App`, à côté du panneau — dès qu'une aide est active ; jamais au pré-rendu) :
- *Zone* : `.chapter-layout.parcours` (cours) ou `.entrainement` (générateurs), retrouvée à chaque navigation
  et quand une page chargée à la demande arrive ; rien en projection.
- *Règle / masque* : calque `position: fixed`, `pointer-events: none`, `z-index` 400 (au-dessus de la barre des
  générateurs, 300) : la page et les widgets Shadow DOM restent manipulables à travers. Bande calée sur la
  ligne de texte visée (`caretPositionFromPoint` / `caretRangeFromPoint`, hauteur de ligne de CE texte),
  2 lignes = la ligne visée et la suivante. Position tenue en coordonnées de l'ÉCRAN : comme une règle posée,
  le texte défile dessous, et la bande se recale sur la ligne arrivée sous elle quand la page s'arrête
  (140 ms) — jamais poussée hors de l'écran ni tout l'écran assombri. Souris : suit le pointeur. Doigt :
  `touchstart` / `touchmove` PASSIFS — toucher place la bande, glisser la déplace, la page défile normalement
  (mesuré : même défilement avec et sans masque). Un seul calcul par image (`requestAnimationFrame`).
  Clavier : ↑ ↓ quand le contenu a le focus (`contenuAuFocus` : pas dans un champ, un curseur, des onglets, un
  dialogue, un Web Component) ; près d'une barre fixe, c'est la page qui défile d'une ligne. Boutons ↑ ↓ discrets (44 px) à droite,
  au doigt seulement (`pointer: coarse`). Masque : voile `--aide-voile` (0,6 clair, 0,72 sombre).
- *Un bloc à la fois* (cours, vue étape) : blocs = enfants du corps de l'étape (annexes dépliées en cartes et
  tiroirs) puis colonne de droite ; un sous-titre (`h3.sub-title`, `.section-kicker`) s'attache au bloc qui
  suit (net avec lui, pas entouré). Marques en ATTRIBUTS (`data-lb`, `data-lb-courant="cadre"` ; React ne les
  efface pas), retirées au démontage. Effacés : `opacity: .38` (exception assumée au 4,5:1 : c'est le but de
  l'aide ; un toucher, un clic ou le focus clavier rend un bloc net ; rien n'est caché aux lecteurs d'écran).
  Bouton flottant « Bloc suivant n / N » + « Bloc précédent », au-dessus de la barre fixe (téléphone) ou en bas
  à droite (≥ 760 px), annonce `aria-live`. Nouveau bloc : défilement doux sous les barres du haut (direct si
  animations réduites). Rescan (MutationObserver, 120 ms) : tiroir ouvert, contenu chargé ; changement d'étape
  → premier bloc visible. Pas de « un bloc à la fois » dans les générateurs (un écran = déjà un bloc).
- *Loupe* : clic / toucher sur une formule (cours `.math-inline`, générateurs `[data-testid="react-katex"]`,
  HTML en chaîne `.katex[role=img]`), jamais dans un élément qu'on touche pour agir (bouton, lien, choix,
  ancêtre à `tabindex` ou au curseur « main ») ni pendant une sélection de texte. Formules affichées rendues
  atteignables au clavier (`tabindex="0"` + `data-loupe-tab`, posés / retirés par la loupe), Entrée ouvre.
  `<dialog>` modal (focus sur « Fermer », piégé — Tab tourne entre ses boutons, `showModal` seul laisse
  ressortir vers le navigateur —, Échap, clic sur le voile, focus rendu à la formule) : copie du
  rendu KaTeX en 2,4 em (réduite jusqu'à 1,4 em si trop large, au-delà elle défile), « Se lit : « … » » (=
  `aria-label` de la formule) et « Écouter ».
- *Voix* : moteur complet `src/lib/voixLecture.ts` (lot VX, voir « Lecture à voix haute » plus bas) ; la loupe
  lit la formule par `lire(...)` (titre « Formule », formule entourée), fermer la loupe arrête la voix.
- Panneau, onglet « Aides » : Suivre la ligne (Rien / Règle / Masque + hauteur 1–3 lignes), Lire pas à pas
  (Un bloc à la fois ; Exemples résolus guidés « activé d'office »), Formules (Agrandir au toucher ; Plus d'air
  autour des signes ; Couleurs et soulignés qui se correspondent, avec un échantillon). Interrupteurs
  `role="switch"` décrits (`aria-describedby`). Section « Lecture à voix haute » : voir plus bas (lot VX).
- Vérifications : dossier de travail `eleve-A2/` (`cap.mjs`, `contraste.mjs`, `debord.mjs`, `identite.mjs`,
  `verif.mjs`).

## Lecture à voix haute (planche 08, lot VX)

Modèle validé : démo `artefact-lecture/lecture-guidee.html` (onglet 8), maquette `etape.html` / planche 08. Synthèse
vocale du NAVIGATEUR (`speechSynthesis`), en français, rien à installer, **rien n'est envoyé** ; gardé sur
l'appareil : la vitesse (réglage `vitesse` de `ReglagesLecture`, `'1' | '0.75' | '1.25'`, table `R` d'`index.html`
— `data-vitesse` sur `<html>`, sans CSS) et, clé `lecture:voix`, la voix choisie (`voix` : nom exact, vide =
automatique) et « Dire chaque case » (`cases`). « Revenir au réglage du site » oublie les deux (`oublierPreferencesVoix`).

### Moteur (`lib/voixLecture.ts`)

- `lire(phrases, { source, titre, zone, depuis, sansBarre })` : FILE de `PhraseVoix` (`texte` déjà en français,
  `range` = place dans la page, `bloc`, `zones` = formules dans le texte dit), **une `SpeechSynthesisUtterance` par
  phrase** (Chrome coupe les textes longs ; la phrase est l'unité de « précédente / suivante » et du surlignage) ;
  `lireTexte(texte)` découpe un texte brut. `pause()` coupe la voix et garde la place, `reprendre()` relit la phrase
  en cours depuis son début (`speechSynthesis.pause()` est trop irrégulier : Android l'ignore, Chrome reste bloqué) ;
  `phraseSuivante`, `phrasePrecedente`, `allerAPhrase(i)`, `arreter()`. Un `jeton` change à chaque phrase lancée :
  un `onend` / `onerror` d'une phrase annulée est ignoré ; l'énoncé en cours est gardé en mémoire (iOS n'envoie
  jamais `onend` à un énoncé ramassé) ; `speak()` 40 ms après `cancel()` (Chrome avale sinon la phrase).
- Voix : `voixFrancaises()` — `fr-BE`, puis `fr-FR`, puis tout `fr-*`, locales avant distantes ; la voix choisie si
  elle existe encore, sinon la première. Liste relue sur `voiceschanged` et à l'ouverture du panneau. Des voix
  connues mais aucune française : **rien n'est lu**, message clair dans la barre (« Aucune voix française sur cet
  appareil… La lecture en mots des formules reste visible… ») ; erreur `not-allowed` : « touche à nouveau
  « Écouter » » ; autre erreur : message (voix absente hors ligne…). Sans `speechSynthesis` : aucun bouton
  « Écouter » (la lecture en mots reste à la loupe), et le panneau le dit.
- Vitesse changée pendant la lecture : la phrase en cours reprend à la nouvelle vitesse. `boundary` (bonus, jamais
  une promesse) : la formule dont la zone contient `charIndex` est entourée ; sans `boundary`, une phrase qui n'est
  qu'une formule l'est d'office.
- Arrêt propre : changement de chemin ou de fragment (`HoteLecteurVoix`, donc d'étape et de vue), `pagehide`, bloc
  de la phrase retiré du document, Échap (hors dialogue). **Aucune lecture sans geste** : seuls les boutons appellent
  `lire`. Événements `lecture:phrase` (`{ index, total, texte, source }`) et `lecture:fin` (`{ source, raison }`) ;
  contrat du lot A2 gardé : `dire(texte)` / `lecture:dire` et `seTaire()` / `lecture:taire` passent par ce moteur
  (sauf `preventDefault()`).

### Ce qui est lu (`lib/phrasesPage.ts`, `lib/decoupagePhrases.ts`)

- `phrasesDe(racines, { exclure, prefixe })` : texte VISIBLE (`display: none`, `visibility: hidden`, `aria-hidden`,
  `hidden`, `.sr-only`, boutons, champs, figures `svg`, images, widgets `x-y`, `dialog` exclus), formules = leur
  `aria-label` (`lireFormule`, jamais de LaTeX). Un bloc (calculé par `display`) n'est jamais lu avec le suivant.
  Cas du gabarit : carte « Manipuler » → « Atelier : titre. » ; carte / tiroir vidéo → « Vidéo : titre. » ; carte
  « À toi » → « À toi : titre. » ; tiroir fermé → son titre seul (ouvert : titre + contenu) ; tableau enveloppé par
  `LectureTableau` → « Tableau de signes : » + son résumé (`resumesTableaux`, `WeakMap` remplie par le composant,
  rien dans le DOM) ; autre tableau → une phrase par ligne (cellules séparées par « , », vides sautées) ; chaîne de
  calcul du corrigé → une ligne (`data-ligne`) = gauche + droite + « , justification ». Titres, légendes,
  étiquettes d'encadrés : lus.
- Symboles en TEXTE brut (titres de tiroirs, sous-titres, étiquettes « (n−1) », « uₙ ») dits en mots
  (`enMots`) : indices / exposants Unicode, « − + × ÷ = ≤ ≥ ≠ ≈ ∞ √ ∈ ⟹ », « n° » → « numéro », « Ex. » →
  « Exemple : », « · » → virgule, « ✓ ✗ » muets, notation clavier « _ » / « ^ » → « indice » / « exposant »
  (« log_a » trouvé dans 6e ch. 3, réécrit « logₐ » dans le contenu ; indices Unicode ₐ ₑ ₓ dits aussi). Deux
  formules qui se suivent sans texte (données côte à côte) : une virgule entre elles.
- Découpage (`coupures`, PUR) : fin de phrase après « . ! ? … » (et « » ) " ») suivis d'une espace PUIS d'une
  majuscule, d'un chiffre, de « « ( [ − » ou du début d'une formule ; jamais avant une minuscule, ni dans « 3,5 » /
  « 3.5 », ni après « ex. cf. fig. c.-à-d. … » (jamais une lettre seule : « de raison r. La suite » finit une phrase),
  ni dans la lecture en mots d'une formule ; > 180 signes : coupure à la virgule / au point-virgule / aux
  deux-points suivants. Chaque phrase garde sa `Range` (début / fin exacts dans les nœuds texte, avant / après une
  formule) et ses `zones`.

### Où sont les boutons « Écouter »

- **Étape du cours** : « Écouter le point » (`EcouterEtape`, `ChapterPage`) sous le titre et la méta de l'étape
  active, avant le texte (choix : la maquette montre la barre, pas le bouton ; c'est l'endroit où l'élève commence
  à lire, sans réglage à activer). Lit `phrasesEtape` : « Étape n : titre », sous-titre, « L'essentiel », corps,
  annexes, colonne de droite (≥ 1 200 px). Pendant SA lecture, le bouton devient « Arrêter ».
- **Exemples résolus guidés** : « Écouter l'étape n » / « Écouter le résultat » lit l'étape montrée phrase par phrase
  (surlignée dans le tiroir). **Loupe** : « Écouter ». **Corrigé ligne par ligne** : « Écouter » (ligne surlignée).
- **Tableau de signes** : bouton « Dire chaque case » (`aria-pressed`, gardé sur l'appareil) dans le panneau de
  lecture case par case : chaque phrase de case / résumé est dite (`sansBarre` : la bulle affiche déjà la phrase).
  Le petit lecteur local `lireTexteMath` est remplacé : `lireTexteMath(x) = lireFormule(unicodeVersLatex(x))`
  (« ≈ 0,29 » → « environ 0 virgule 29 ») ; phrases inchangées (contrôle sur les 19 tableaux du cours : seules les
  lectures d'expressions changent — « 2 virgule 5 », « x au carré, moins x moins 6 », conventions de `lireFormule`).
- **Générateurs** (aucun `App*.tsx` réécrit) : énoncé — `EnTeteExercice` (×3) : petit « Écouter » en haut à droite
  de l'énoncé déplié (`.entete-ecouter`, absent du bandeau replié / clavier ouvert ; ajouté aux listes de
  `cadre.css` et à `HORS_DONNEES` de `CadreActions` pour que l'aperçu d'une ligne l'ignore) ; aides —
  `EcouterAides` (monté par `EntrainementPage`) ajoute « Écouter l'aide » en dernier enfant de chaque
  `.aide-5e` / `.triangle-quelconque-aide` (nœud DOM hors React, `data-voix-ajout`, remis en dernier si une aide de
  niveau 2 arrive, retiré des copies du tiroir) et le tiroir d'aide du téléphone a le sien dans ses actions (lit
  l'aide la plus récente) ; corrigé — « Écouter » dans l'en-tête de `CorrigeDetailleEcran` (corrigé complet).

### Barre de lecture (`components/lecture/LecteurVoix.tsx` + `lecteurVoix.css`, chargés à la première lecture)

- `HoteLecteurVoix` (dans `App`) : rien sans lecture (rien au pré-rendu). Barre `--ink` / `--surface` (claire en
  thème sombre) : précédente / pause (52 px, accent) / suivante (masquées pour une seule phrase), « « phrase » »
  sur deux lignes au plus, « titre · Phrase n sur N », vitesses 0,75 × / 1 × / 1,25 × (44 px), « Arrêter »,
  progression. Téléphone : pleine largeur à 8 px des bords ; ≥ 760 px : 380 px en bas à droite. Posée AU-DESSUS de
  ce qui est fixé en bas (`basLibre` : barre de l'étape, barre et tiroir d'aide des générateurs, barre collée du
  corrigé ligne par ligne ; recalculée au défilement, au redimensionnement, après un clic). `--voix-haut` /
  `--voix-hauteur` sur `<html>` (+ `data-voix-lecteur`) : « Bloc suivant » et les flèches de la règle remontent
  au-dessus, le bas de la page aussi (`body` `padding-bottom`). Dialogue modal ouvert (loupe, « Je bloque »,
  panneau « Aa ») : la barre y est rendue (portail), sinon elle serait inerte sous son voile.
- Surlignage : `CSS.highlights` (`::highlight(voix-phrase)`, aucun nœud ajouté, React jamais dérangé), fond ET
  couleur du texte imposés (formules comprises) — clair `#ffe08a` / `#182430` (12,2:1), sombre `#5c4512` /
  `#fff6e0` (8,4:1), crème `#f0cc6a` / `#2a2118` (10,2:1), contraste `#ffe500` / `#000` (16,5:1). Sans l'API :
  `data-voix-bloc` sur le bloc. Formule dite : `data-voix-formule` (cadre 2,5 px accent). Défilement doux vers la
  phrase (entre les barres du haut et la barre de lecture ; direct si animations réduites ; dans un tiroir /
  dialogue : `scrollIntoView` du bloc).
- Toucher une phrase de la zone de la lecture (`data-voix-zone`, curseur main) : lire à partir d'elle
  (`caretPositionFromPoint` / `caretRangeFromPoint` → `Range.comparePoint`) — jamais sur un lien, un bouton, un
  champ, un élément à `tabindex`, une carte, un tiroir, un tableau lu case par case, un widget, ni pendant une
  sélection.
- « Essayer la voix » (panneau) : sans barre (elle couvrirait le bas du panneau), le bouton devient « Arrêter
  l'essai ».

### Panneau, onglet « Aides » : section « Lecture à voix haute »

Texte d'intro (où sont les boutons), « Voix » (`select` : « Automatique (français de Belgique si l'appareil en a
une) » + chaque voix `fr-*` « nom (langue) »), « Vitesse » (0,75 × plus lent / 1 × normal / 1,25 × plus rapide),
« Essayer la voix », mention : « La qualité de la voix dépend de l'appareil : très bonne sur iPhone et Chrome
récent, plus robotique sur certains Android ; sans connexion, certaines voix manquent. » Sans synthèse : « Ce
navigateur ne sait pas lire à voix haute. La lecture en mots des formules reste disponible… ».

### Vérifications (dossier de travail `eleve-VX/`)

Faux moteur `faux-moteur.js` (Chromium headless n'a pas de voix : enregistre chaque phrase, `finir()`,
`frontiere(i)`, `sansFr`). `verif-voix.mjs` : 3 étapes (4e « fonction du second degré » avec tableau de signes, 5e
« Suites » étape 1 avec « un bloc à la fois », 6e « logarithmes ») × iPhone 13 / 1 280 × auto clair / auto sombre /
crème / contraste / sombre / clair : bouton ≥ 44 px, barre au-dessus de la barre de l'étape et sous « Bloc
suivant », surlignage, suivante / précédente / pause / reprise / 1,25 × (voix fr-BE), lecture complète (133, 95 et
43 phrases, 0 LaTeX, 0 « undefined »), résumé du tableau, toucher une phrase, Échap, arrêt au changement d'étape,
contrastes (phrase, textes de la barre ≥ 4,5:1), scrollWidth ; formule entourée sur `boundary` ; loupe (barre dans
le dialogue, fermer = arrêt) ; tableau « Dire chaque case » ; sans voix française (message, rien lu) ; sans synthèse
(aucun bouton) ; exemple guidé ; 5 générateurs × téléphone / ordinateur (5gen14, gen3, 6gen15, 5gen15, gen14) :
énoncé, aide (tiroir et aide en place), corrigé complet et ligne par ligne — 0 erreur console. `verif-panneau.mjs`
(build + `vite preview`) : section, voix proposées (fr seulement), mention, choix de la voix + 0,75 × + essai,
gardé sur l'appareil, retour au réglage du site, cibles, contrastes, anti-flash de `data-vitesse`. `textes-dits.txt` :
tout ce qui a été envoyé à la voix. Pas d'écoute réelle avec espeak-ng (installation refusée dans l'environnement).

## Vérifications (dossier de travail `eleve-A1/` : `verif.mjs`, `cap.mjs`, `montage.mjs`)

Voir le rapport du lot : DOM sans attribut sans réglage (5 pages × téléphone / 1 280 × clair / sombre),
`scrollWidth` = largeur (dont 320 px en Grand texte et 170 % OpenDyslexic), contrastes ci-dessus, signes
par ligne (1 280 et 1 440 : ≈ 68 / 60 / 50), panneau (focus, 40 Tab piégés, Échap, focus rendu, stockage,
pastille, retour au site, cibles, onglets au clavier), anti-flash (JS applicatif bloqué : attributs déjà
posés), impression identique avec / sans réglages, projection (`.projection` présent : jetons de
l'appareil), OpenDyslexic absente des feuilles et non téléchargée sans choix, générateurs (gen7,
5gen14, 6gen47 `AppCombinatoire`, 6gen100 `AppEcransTrigo`) et widgets suivent les jetons.

## Ma progression (ex-« Mon suivi ») et plan de révision (planche 13, plan refait le 27/11/2026)

Routes publiques, `noindex` (`usePageNonIndexee`), **jamais pré-rendues** (absentes de
`scripts/routes.mjs`), chargées à la demande (`App.tsx`) :

**Nom** (décision du 27/11/2026) : « Mon suivi » s'appelle **« Ma progression »** partout où l'élève le lit (titre de
l'onglet, `<h1>`, carte de l'accueil, liens du plan, « Effacer ma progression… ») ; l'adresse reste `/suivi`, les clés
`suivi:*` et les noms de code (`suiviEssais.ts`, `SuiviPage`…) ne changent pas.

- `/suivi` — `routes/SuiviPage.tsx`. `?niveau=` (sinon année de l'accueil `anneeDeDepart`, sinon celle
  du dernier essai), `?chapitre=` (sinon le dernier chapitre travaillé). Onglets des chapitres de
  l'année ; « À retravailler » en tête (pourquoi + « Revoir : point n, « … » » + « M'entraîner : id ·
  titre ») ; puis chaque étape : comprise (pastille ✓), 5 derniers essais en cases, « 9 réussis sur 11,
  dont 2 avec aide », cartes « n / N « Je savais » ». « Effacer ma progression… » : confirmation DANS la page
  (jamais `confirm()`), cases « essais » / « plan » cochées, « points compris et cartes de toutes les
  années » décochée. Pas de « bilan à montrer » ni d'« emporter » (planche 14 en suspens).
- `/suivi/plan` — `routes/PlanRevisionPage.tsx`, refait le 27/11/2026 (maquette `maquette-espace/plan-eleve.png`) :
  - **prérempli depuis une interro annoncée** (bouton « Je prépare mon interro » de la page de classe, de l'accueil,
    aperçu « Ce que verront tes élèves » du professeur ; format d'adresse plus bas) : en-tête « Interro mercredi 2/12 »
    (« Contrôle-bilan … » si `type=bilan`), « Les coniques · points 1 à 3 · annoncée par ton professeur », une seule
    question « Combien de minutes par jour ? » (10 / 15 / 20 / 30, **15 d'office**), « Faire mon plan », « Changer la
    date ou les étapes ». Un plan déjà fait pour la même date et les mêmes étapes s'ouvre directement ; un autre plan
    en cours est annoncé « sera remplacé ». L'adresse est nettoyée une fois lue ;
  - **sinon trois questions** numérotées : quand (`input type="date"`), quel chapitre (année + chapitre ; étapes
    « Tous les points » repliés en `<details>`, toutes cochées, « À retravailler » signalé), combien de minutes par
    jour ; « Un jour sans révision ? » replié ;
  - **le plan** : rangée des jours (puces « ven 27 » … jusqu'à l'interro, en rose ; aujourd'hui plein ; à partir
    d'avant-hier ; un jour passé fait porte ✓ ; défile seule sur téléphone), carte « Aujourd'hui · n min » avec « k sur
    N » et **au plus trois tâches concrètes** (`grouperTaches`) — case à cocher (zone 44 px, barrée une fois faite),
    libellé (« Relire « L'essentiel » du point 1 », « Faire 3 exercices de **6gen58** », « Teste-toi : 5 cartes du
    point 2 », « Évaluation blanche (20 min) puis corrigé »), sous-titre (« tu y as eu des difficultés mercredi » =
    dernier essai raté de ce générateur dans les 14 jours, sinon « proposé par ton professeur », sinon le titre de la
    carte) et **« Go »** (le premier « Go » non fait est plein ; nom accessible « Go — faire 3 exercices de 6gen58 ») →
    l'étape (`#section`), le générateur (`generatorLink`, nouvel onglet s'il n'est pas migré), les cartes (`#reviser`),
    l'évaluation blanche (`urlEntrainementEleve` : `/{niveau}/{chapitre}/exercices?notions=…&exos=…`, exercices du
    professeur) ; puis « Demain · n min » et les jours suivants en UNE ligne (« Point 3 : relire + 3 exercices de
    6gen59 »), la carte rose du jour de l'interro, « Un jour raté ? Le plan se décale tout seul, rien n'est perdu. ».
    **Plus de « revue n° k » ni de « reporté de »** : l'algorithme ci-dessous ne change pas, seul l'affichage se tait ;
    « le plan garde l'essentiel » devient « Il reste peu de jours : le plan garde l'essentiel… ».
  - **Cases cochées d'office** (`cochesAutomatiques`, pur) : un exercice terminé d'un générateur (« Ma progression »,
    `suivi:essais:v1`) un jour du plan coche un exercice de ce générateur prévu CE jour-là (d'abord les tâches déjà
    cochées « consomment » les essais, jamais deux fois) ; relecture et cartes restent à cocher par l'élève. Relu au
    retour sur la page (`visibilitychange`), à `suivi:modifie` et à `storage` (générateur ouvert par « Go » dans un
    autre onglet).
  - Générateurs d'une étape : celui « à retravailler » d'abord ; si le professeur en a retenu (`gen`), seulement eux
    dans les étapes qui en ont.
- Accès : depuis le 27/11/2026 (chantier E, section « Côté élève plus clair » en fin de fichier), porte
  « Préparer mon interro » de l'accueil et « Mon interro » de la barre du bas (→ `/suivi/plan`), « Voir ma
  progression » de la fin d'exercice et de « M'entraîner » (→ `/suivi`) ; les cartes « Mon suivi » /
  « Préparer mon interro » de l'accueil (`CarteSuivi`, `CartePreparer`) ont disparu.

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

Clé `suivi:plan:v1` : `{ debut, interro, minutes, jourLibre, niveau, etapes: ['chapitre#section'], faites: [idTâche] }`,
plus, facultatifs (27/11/2026, lecture tolérante, anciens plans intacts) : `annonce: true` (interro annoncée par le
professeur), `bilan: true`, `gens: [id]` (générateurs retenus). `MINUTES_POSSIBLES` = 10 / 15 / 20 / 30 (`MINUTES_DEFAUT`
15).

Algorithme (testé seul : `node --experimental-strip-types scripts/tester-plan-revision.mts`, 19 tests —
dates/heure d'été, 7 jours, jour libre, jours ratés, rattrapage, peu de temps, 12 étapes, interro
demain, interro passée, essentiel ; depuis le 27/11/2026 : trois tâches concrètes au plus sans en perdre aucune, tâche
groupée faite quand toutes ses tâches le sont, cases cochées d'office) :

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

**Point d'accroche (page de classe, accueil « Je prépare mon interro »)** — FORMAT DE L'ADRESSE (27/11/2026) :
`/suivi/plan?date=AAAA-MM-JJ&niveau=6e-6h&chapitre=coniques&etapes=idSection1,idSection2&gen=6gen58,6gen59&type=bilan`
— `date` (interro), `niveau` + `chapitre`, `etapes` (ids de sections), `gen` (générateurs retenus par le professeur,
facultatif), `type=bilan` (contrôle-bilan ; absent = interro) ; `?interro=` est aussi lu à la place de `date`. À
construire avec `pageClasse.ts::lienPlanRevision(interroPubliee)` (une `InterroPubliee` de la page de classe, telle
quelle) ou `planRevisionStockage.ts::lienPlanRevision({ date, niveau, chapitre, etapes, generateurs, bilan })`. Le
plan s'ouvre prérempli « annoncée par ton professeur » ; rien n'est remplacé sans que l'élève valide.

**Trois tâches concrètes** (`grouperTaches`, pur) : toutes les relectures du jour = une tâche, les exercices d'un même
générateur = une tâche (un exemple résolu à refaire compte comme un exercice), toutes les cartes du jour (revues
comprises, ou les cartes « À revoir » de la veille) = une tâche, l'évaluation blanche = une tâche ; s'il reste trop de
générateurs, les derniers sont réunis en une tâche « Faire des exercices : 2 de 6gen58, 1 de 6gen60 ». Cocher une tâche
groupée coche ses identifiants d'origine (`#i` compris au décochage) : la logique des reports est inchangée.

### Mise en page

`components/suivi/suivi.css` (chargé avec ces pages), classes `suivi-*` / `plan-*` (plan refait : `plan-entete`,
`plan-rangee` / `plan-puce`, `plan-jour-carte`, `plan-t*`, `plan-go` ; l'ancienne ligne du temps `plan-jour` / `plan-tache`
est retirée ; rose de l'interro = `color-mix` de `--rose` vers `--ink`, ≥ 4,5:1 clair et sombre), jetons du site
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
  panneau (autre lot). Par défaut : le corrigé complet, comme avant. **Choix retenu sur l'appareil** (décision du
  professeur, 25/11/2026 ; `lib/corrigeLigneParLigne.ts`, clé `corrige:ligne-par-ligne`) : après « Lire ligne par ligne », les
  corrigés suivants s'ouvrent à la ligne 1 ; « Tout montrer » touché AVANT la dernière ligne revient au corrigé complet pour la
  suite (à la dernière ligne, c'est la fin de la lecture : le choix reste) ; « Revenir au réglage du site » l'oublie. Testé
  (`lpl.mjs`, gen3, iPhone 13 et 1 280 px) : 22 vérifications, 0 échec. Vaut
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
- **Écouter** : point d'accroche commun `lib/voixLecture.ts` (lot A2) — `dire(texteParleDe(ligne))`, événement
  `lecture:dire` (formules lues en mots) ; « Écouter » n'est affiché que si `voixDisponible()`.
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
  « Point n · titre », l'exemple révélé pas à pas avec les composants du cours (`ExemplePasAPas` /
  `ExempleLibrePasAPas`, exportés par `ContenuEtape.tsx` — chargés à la première ouverture), à défaut
  « L'essentiel » de l'étape ; « Revoir le point n (nouvel onglet) » (`target="_blank"` : l'exercice en cours
  reste ouvert) et « Retour à l'exercice ». Rien de la réponse de l'écran.
- **Exemple choisi** (`cibleJeBloque`, pur) : section = celle de la carte « S'entraîner » (la même que le lien
  de retour) ; parmi ses `exemple` / `exempleLibre` (jamais une « Démonstration… »), le plus proche de la
  carte, à égalité celui d'avant ; « Pour aller plus loin » seulement s'il n'y en a pas d'autre. Couverture
  (356 générateurs au registre) : 311 avec un exemple, 27 avec « L'essentiel » seul, 18 quiz de fin de
  chapitre hors de toute section (pas de bouton).
- **Mon suivi** : l'ouverture n'est PAS notée comme une aide — le suivi recopie les puces (« juste avec aide »
  = bouton « Aide » de l'écran) et revoir le cours n'est pas l'aide de l'écran.
- **« Tu as besoin de… »** (chapitres autonomes, 25/11/2026) : `cibleJeBloque` renvoie aussi `prerequis` =
  les entrées `utilise` de l'étape (`lib/prerequisChapitre.ts::prerequisJeBloque`) : les `indispensable`, plus
  les `utile` dont `jeBloque` cite le générateur (décision 4 : gen24, gen25, gen26 — certaines variantes
  demandent une équation du second degré, pas d'option pour les éviter). Bloc sous l'exemple (ou
  l'essentiel) : par prérequis, titre court de l'étape, « « Chapitre », point n », le rappel (`rappel`, sinon
  « L'essentiel » de l'étape citée) et « Revoir le point (nouvel onglet) » (≥ 44 px). Les liens nommés du
  panneau s'ouvrent en nouvel onglet (`ModeLiensChapitre` « nouvel-onglet ») : l'exercice reste ouvert.
  Couverture : 68 générateurs (65 par un prérequis indispensable + gen24–26).

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
- `TexteInsistance` pose aussi les **espaces insécables** (avant « : ; ? ! », à l'intérieur de « … ») dans
  tous ces rendus — ce que le « fait d'office » du cours (`RichText`) laissait au lot G pour `TexteRiche`.
- **Nouveau texte d'écran** : passer par `TexteRiche`, des fragments, ou `<TexteInsistance texte={…} />` ;
  écrire de préférence directement en minuscules (le gras n'existe pas dans les données).
- **Contrôle** : `majuscules.mts` (recherche dans les sources : littéraux et texte JSX, jugés par la règle du
  papier — 1 015 textes en prose dans 164 fichiers, presque tous des données) et `scan-majuscules.mjs` (rendu
  RÉEL, build de production, les 356 générateurs du registre : chargé, « Aide » jusqu'au bout, trois essais
  faux ou un choix faux, corrigé déplié ; texte visible hors formules et hors gras jugé par la même règle).
  Mesure : rendus de fragments et `TexteRiche` seuls → 13 textes restants dans 12 générateurs (aides en chaîne
  brute) ; après le branchement des aides → 0 sur les 368 générateurs (31 mots mis en gras rencontrés) ; seul
  relevé : « LORAN » (6gen142), un sigle — ajouté à `SIGLES` (le papier l'aurait écrit « loran »).
  Limite : seuls les états atteints par le parcours automatique sont vus (premier écran surtout) ; les autres
  écrans passent par les mêmes composants de rendu.

### Vérifications du lot G (dossier de travail `eleve-G/`, build de production + `vite preview`)

- `verif-taille.mjs` : 15 générateurs de socles différents (gen3, gen5 grille de signes, gen7, gen23 construction
  Mafs, gen42, 5gen10, 5gen14, 5gen25 choix entre graphiques, 5gen29 tableau d'étude locale, 6gen12
  calculatrice, 6gen15, 6gen47 `AppCombinatoire`, 6gen51 table de Φ, 6gen65 quiz, 6gen100 `AppEcransTrigo`) ×
  100 / 145 / 170 % × iPhone 13 / 1 280 px × clair / sombre : `scrollWidth` = largeur, barre du haut sur une
  ligne (≤ 76 px, rien ne déborde), « Aa » 44 × 44, boutons du bas dans l'écran et texte qui tient, champs ≥ 52 px
  et ≥ 20 px, saisie « −3,5 » gardée telle quelle, sélecteur de variante visible à 12 px, texte des figures
  inchangé, 0 erreur console — 1 563 vérifications (3 « échecs » restants = variante tirée au hasard sans la
  même figure à 100 % et à 145 %).
- `verif-jebloque.mjs` : « Je bloque » et corrigé ligne par ligne sur 7 générateurs (5gen14, 5gen15, gen3, gen14,
  6gen43, 6gen24, 6gen55), téléphone 145 % clair et ordinateur 100 % sombre : pas de bouton au 1er essai, bouton
  au 2e (≥ 44 px, dans l'écran), panneau modal (focus dedans, exemple ou essentiel, pas à pas, lien `#…` en
  nouvel onglet, rien ne déborde), Échap → focus rendu, saisie intacte ; bouton parti à l'écran clos ; corrigé :
  focus « Ligne suivante », chaque ligne (en cours, à venir masquées, compteur, annonce), barre collée en bas,
  focus « Tout montrer » à la fin, retour au complet — 292 vérifications, 0 échec.
- `verif-divers.mjs` : sans réglage (rien sur `<html>`, tailles d'avant : base 16, titre 18, bouton 16, champ 18,
  contexte 12) ; « Aa » de la barre (ouvre le panneau, 170 % appliqué en direct à 27,9 px, énoncé épinglé qui
  suit la page décalée de 420 px, focus rendu, pastille) ; calculatrice de 6gen12 à 170 % (panneau dans l'écran,
  aucune touche qui déborde) ; contrastes des éléments nouveaux dans les 5 thèmes + auto sombre (tous ≥ 6,3:1,
  « Ligne suivante » et « Retour à l'exercice » sur `--accent-ink` : 8,0:1 en clair au lieu de 4,4:1 sur
  `--accent`) — 103 vérifications, 0 échec.
- `couverture-jebloque.ts` (esbuild + node) : exemple choisi pour chaque générateur du registre.

## Côté élève plus clair (chantier E, 27/11/2026 : maquettes `maquette-eleve/{accueil,chapitre,fin-etape,fin-exercice,entrainer}`)

Décision du professeur (point 5 des décisions du 27/11/2026). Tout se lit dans le navigateur ; rien n'est envoyé
(seule requête : la relecture de la page de classe PAR SON CODE, comme `/classe`). Logique PURE : `lib/guideEleve.ts`
(bilan d'un exercice, état d'un générateur, carte « Ma classe », aide « ? », explication des compétences) ; styles
`components/eleve/guideEleve.css` (classes `ge-*`, jetons du site : clair, sombre et thèmes « Aa »). Tests de la
logique : `tests/purs.test.ts` du dossier de travail `suite-E/` (esbuild + node).

- **Accueil** (`HomePage.tsx` + `components/eleve/AccueilEleve.tsx`) : onglets d'année gardés (`data-visite="annees"`) ;
  carte **« Ma classe »** (`CarteMaClasse`) si un code est gardé (`classe:code`) — version gardée (`classe:derniere`,
  refiltrée par `pageAuJour`) affichée tout de suite, relue en tâche de fond 0,9 s après (import de
  `pageClasseDonnees.ts`, jamais au pré-rendu) ; prochaine interro « Interro mardi 1/12 · dans 4 jours », « Suites —
  points 6 à 8 » (`texteEtapes` : suites de 3 et plus regroupées), devoir le plus proche, bouton **« Je prépare mon
  interro »** = `pageClasse.ts::lienPlanRevision` (`/suivi/plan?date=…&niveau=…&chapitre=…&etapes=…`, format du point
  d'accroche existant, lu par le plan de révision) ; code devenu inconnu → « Ton code de classe ne marche plus » +
  « Entrer le nouveau code » (rien n'est effacé ici, `/classe` s'en charge). **Trois portes** (`PortesAccueil`,
  `data-visite="portes"`) : Mon cours (« Reprendre : chapitre, point n » = dernière étape ouverte de l'année, sinon
  `/#chapitres`), M'entraîner (`/entrainer?niveau=&chapitre=`), Préparer mon interro (`/suivi/plan`). Ligne « Pas
  encore de classe ? Entre le code donné par ton professeur » (→ `/classe`) sans code gardé. La liste des chapitres
  de l'année reste dessous (`id="chapitres-<niveau>"`, `/#chapitres` y fait défiler) : le pré-rendu garde les liens
  de TOUS les chapitres et le script en ligne d'`index.html` est inchangé (même logique qu'`anneeDeDepart`). Le
  bandeau sombre « Reprendre » (`.accueil-reprendre`) n'est plus rendu (son CSS d'`index.css` est laissé en place).
- **Barre du bas** (`components/eleve/BarreEleve.tsx`, `HoteBarreEleve` monté UNE fois dans `App.tsx`) : téléphone
  (< 760 px) seulement — Accueil, Cours (le chapitre affiché, sinon le dernier ouvert de l'année, sinon
  `/#chapitres`), M'entraîner, Mon interro ; `aria-current="page"`, 56 px, `--l-echelle-ui`. Pages : `/`, `/entrainer`,
  `/suivi`, `/suivi/plan`, `/classe`, carte / Réviser / Exercices d'un chapitre (`ongletBarreEleve`) ; JAMAIS dans une
  étape (barre « J'ai compris »), un générateur (barre [Aide][Valider]), le lanceur de projection, les pages du
  professeur. `<html data-barre-eleve>` réserve 68 px en bas de page. Rien au pré-rendu (`window.__prerendu`).
- **Aide « ? »** (`components/eleve/AidePage.tsx`, dans `SiteHeader` entre la recherche et « Aa ») : deux phrases
  par page (`aideDePage` : accueil, M'entraîner, plan, Ma progression, classe, carte / Réviser / Exercices / étape d'un
  chapitre ; rien sur les pages du professeur ni les générateurs) ; bulle non modale (`role="dialog"`, Échap / clic à
  côté / « Fermer », focus rendu au bouton) ; sur l'accueil, « Revoir la visite guidée ». En-tête : marque · loupe · ? ·
  Aa · Professeur sur UNE ligne — marque en 14 px sous 440 px, logo seul sous 390 px (nom gardé pour les lecteurs
  d'écran). Présent dans les pages pré-rendues (bouton seul, la bulle n'existe qu'ouverte).
- **Visite facultative** (`components/eleve/VisiteAccueil.tsx`) : trois bulles (année, trois portes, « ? »), à la
  première venue une fois l'année choisie, « Passer » / Échap, « Suivant » / « C'est parti » ; clé `accueil:visite`
  = `1` ; bulle fixe sans voile (la page reste utilisable), cible entourée, placée sous / au-dessus de la cible et
  tenue dans l'écran au-dessus de la barre du bas ; jamais au pré-rendu.
- **M'entraîner** (`routes/EntrainerPage.tsx`, `/entrainer`, `lazy`, `noindex`, absente de `scripts/routes.mjs`) :
  chapitre (liste par année, `?niveau=&chapitre=` suivis dans l'adresse), feuille à imprimer **Rapide** (≈ 10 min, 4
  exercices → `/{niveau}/{chapitre}/exercices?type=feuille&nombre=4`), **Tout le chapitre** (`&nombre=10`), **Sur
  mesure** (l'assistant sans préréglage) — cartes en `radiogroup` (flèches) ; exercices corrigés tout de suite (cartes
  « S'entraîner » des étapes + quiz de fin) avec leur état **à revoir / nouveau / réussi** (`etatGenerateur` : même
  règle que « À retravailler » — dernier essai raté ou ≥ 2 ratés sur 3), à revoir d'abord, 6 puis « Voir les n
  autres » ; **Interro blanche (20 min)** (`?type=blanche&duree=20`) ; « Voir ma progression ». Préréglages lus par
  `AssistantEleve` (`?type=feuille|blanche`, `?nombre=` 1–30, `?duree=` 20 / 30 / 50 ; valeur inconnue ignorée, rien
  d'autre ne change).
- **Page de chapitre** (`CarteChapitre.tsx`, `ChapterPage.tsx`) : onglets sous-titrés « Le cours · point par point »,
  « Réviser · teste-toi », « Exercices · corrigés » (mêmes ids `apprendre` / `reviser` / `entrainer`, sous-titre lu
  après « : ») ; `BlocReprendre` = « Tu en es au point n sur N » (dernière ouverte) + « ≈ m min » + barre de position +
  « Continuer : titre › » (« Commencer » sinon) + « k / N points compris » ; `ListeEtapes` : ✓ (lue), pastille « en
  cours », **« à revoir »** (`aRevoir` = étapes au ton `retravailler` de `suiviChapitres.ts`, relues à
  `suivi:modifie` / `storage`), légende sous la liste. **Fin d'étape** (`FinEtape.tsx`, étape affichée seulement,
  `no-export`, jamais pré-rendue) : « Tu as fini le point n » (mot « point », décision du 28/11/2026), UN générateur → « M'entraîner sur ce point » ;
  PLUSIEURS → « M'entraîner sur ce point : choisis un exercice » + un bouton par générateur (titre, code, compétence, état
  à revoir / nouveau / réussi lu sur l'appareil) — jamais seulement le premier ; sans générateur : « Si tout est clair,
  touche J'ai compris » ; « Point suivant : titre › » (« Réviser le chapitre » à la fin), « ou revenir à la liste des points » ; hors du corps de l'étape (ni
  « Écouter le point » ni « un bloc à la fois » ne la prennent).
- **Fin d'exercice** (`entrainement/components/FinExercice.tsx`, montée par `EntrainementPage` sous l'appli — aucun
  générateur touché, `SelecteurVarianteDev` intact) : apparaît quand l'observateur de Ma progression note un essai
  (`observerProgression`, donc pour les générateurs à puces ; pas pour les quiz vrai / faux : une affirmation = un
  essai), disparaît quand un nouvel exercice commence (puces sans écran clos, ou clic sur un bouton « Nouvel
  exercice »…). « N questions faites · cours : point k » (point du cours de la carte ; jamais « Question n sur N · étape k » : l'en-tête du générateur dit déjà « Étape 3 / 3 » pour ses écrans, le même mot prêtait à confusion), puces colorées (`role="img"` en mots),
  « Exercice terminé » + bilan en une phrase (`bilanExercice` : « 3 réponses justes du premier coup, 1 avec une
  aide. »), **Un autre exercice** (clique le bouton « Nouvel exercice » du générateur, sinon remonte l'appli —
  `key`), **Revoir le cours du point k** (lien de retour de la barre), **Voir ma progression** (`/suivi?niveau=&
  chapitre=`) ; pastilles de compétence (`competencesGenerateur`) en boutons qui s'expliquent en une ligne
  (`EXPLICATION_COMPETENCE`). Pas de défilement automatique (le corrigé reste sous les yeux), aucun `.btn-primary`
  (sinon `CadreActions` le prendrait pour le bouton principal).
- **Pas fait / choix** : pas de barre du bas dans les générateurs ni les étapes (barres fixes déjà là) ; pastille de
  NIVEAU non expliquée (le niveau 1–7 n'est pas affiché à l'écran des générateurs) ; « ? » absent des générateurs
  (leur barre d'une ligne a « Aa » et « Je bloque »).
- **Vérifications** (dossier de travail `suite-E/` : `cap.mjs`, `cap2.mjs`, `tests/purs.test.ts`, captures dans
  `captures/`) : build de production servi en local, iPhone 13 et 1 280 px, clair et sombre, `lire_page_classe` simulé
  (`page.route`).

## Évaluation annoncée : contenu, changement, retrait (28/11/2026, maquettes 1a / 1b / 2 / 3 / 4 du professeur)

Côté professeur : `.claude/rules/comptes.md`, « Évaluations et devoirs annoncés : contenu précisé, fiche, modification,
suppression ». Côté élève, rien n'est envoyé ; seule requête : la relecture de la page de classe PAR SON CODE.

- **Même bloc partout** : `components/eleve/BlocEvaluation.tsx` (+ `blocEvaluation.css`, classes `be-*`) rend l'interro
  publiée (`InterroPubliee` étendue : `nom`, `competences`, `chapitres[].points[].exercices`, `connaitre`) sur `/classe`
  (`CarteEvaluation` ; ancien format sans `chapitres` → `CarteInterroAncienne`, rendu d'avant), dans la carte « Ma classe »
  de l'accueil et dans l'aperçu / la fiche du professeur. Titre « Interro vendredi 4/12 · 3e heure (dans 7 jours) » (nom
  libre du professeur : « Contrôle… », « Bilan… »), pastilles de compétences (`PastilleCompetence`, couleurs `--procN`, nom
  lu), par chapitre (titre seul, jamais le numéro du site) les points « numéro + titre » (jamais le mot « étape ») avec la
  précision « seulement : … » / « sans : … », les codes des exercices = LIENS vers les générateurs (`generatorLink`),
  ligne « Connaître : questions « formule » et quiz vrai/faux » + codes des quiz, « Je prépare mon interro › ». Conteneur
  < 520 px (téléphone) : codes en ligne et bouton « Voir les noms des exercices » (`aria-pressed`) ; plus large : une
  rangée par exercice (pastille, code, nom).
- **Carte « Ma classe »** (`AccueilEleve.tsx::CarteMaClasse`) : repliée — « Interro vendredi 4/12 · dans 7 jours »,
  « Fonctions exponentielles — point 7 ; Fonctions logarithmes — points 1 et 2 » (`guideEleve.ts::resumeClasse`, nom
  `nomInterro`), « date changée » si besoin — puis `<details>` « Voir le contenu » / « Cacher le contenu » avec le bloc.
- **Plan prérempli multi-chapitres** : `pageClasse.ts::lienPlanRevision(i)` →
  `/suivi/plan?date=&niveau=&chapitre=<premier>&etapes=slug%23section,…&gen=…&type=bilan&nom=<nom>&id=<événement>` (une
  étape d'un autre chapitre s'écrit `slug#section` ; l'ancien format `etapes=id,id` reste lu). `PlanRevisionPage`
  (`listeEtapesLien`) garde `nom`, `annonceId` (`id`) et `signature` (`signatureInterro` : date | points | exercices triés
  | nom) dans le plan (`planRevisionStockage.ts`, champs facultatifs, anciens plans intacts).
- **Dernière version sur l'appareil** (`classe:derniere`) : `garderPage(code, page, date)` renvoie la page ANNOTÉE — une
  interro (même `id`) dont la date a changé depuis la dernière version vue porte `avant` (« date changée — avant : ven. 4/12 »,
  gardé tant que la date reste nouvelle), sur `/classe` et dans la carte.
- **Avis dans le plan** (`PlanRevisionPage.tsx::AvisAnnonce`, plan fait depuis une interro annoncée) : relit la version
  gardée puis, 600 ms après, la page par son code ; interro trouvée mais signature différente → « Ton interro a changé » (+
  « Ton professeur l'a déplacée au … » si la date a bougé) et « Mettre mon plan à jour » (rien ne change sans le bouton :
  date, points, exercices, nom remplacés, coches gardées) ; interro absente (et ni passée ni au-delà des 3 interros
  publiées) → « Cette interro a été retirée par ton professeur », « Garder mon plan » (le plan n'est plus lié) / « Effacer mon
  plan ». Classes `.plan-avis` (`suivi.css`).

## « Point » au lieu d'« étape » partout côté élève (décision du 28/11/2026)

Les parties numérotées d'un chapitre s'appellent des **points** partout où l'élève les lit (convention complète et ce qui
reste « étape » : `content-authoring.md`, « Vocabulaire : « point » »). Fait : page de chapitre (onglet « Le cours · point
par point », `BlocReprendre`, `ListeEtapes`, légende, en-tête collant « titre · point n / N », méta « Point n · ≈ m min »,
`NavEtape` « Point précédent / suivant : … », « Écouter le point » — `phrasesEtape` lit « Point n : titre » —, carte « Teste-toi »
« Point n · … », fiche du chapitre et lexique « Revoir le point n », `Prerequis` « n points de k autres chapitres », « Ce point
utilise », « « Chapitre », point n »), lien nommé `[[…#section]]` → « « Titre », point n » (`lienChapitre.ts`, donc aussi
les notes de projection et le carnet qui passent par `texteSansLiens`), info-bulle « Point n : titre », `FinEtape` (déjà fait),
`FinExercice` (« cours : point k », « Revoir le cours du point k »), « Je bloque » (« Point n · titre », « Revoir le point n »,
« Ce point n'a pas d'exemple résolu »), `/entrainer` (« Point 7 »), `/suivi` (« Point n · titre », « Revoir : point n »,
« points compris »), `/suivi/plan` (« Relire « L'essentiel » du point 1 », « Teste-toi : 4 cartes du point 1 », « Points 1 et 2 :
relire + … », « Tous les points », « Garde au moins un point »), accueil (« Reprendre : chapitre, point n », « k / N points »),
carte « Ma classe » (`guideEleve.ts::texteEtapes` rend « point(s) »), aide « ? », visite, recherche (« titre · point n · niveau »),
panneau « Aa » (aperçu « Suites, point 1 »), `/classe` (« points lus »), textes du cours qui renvoient à une section (5e (6h)
« Nombres réels et suites », 4e « Statistique descriptive ») et renvois des générateurs « (cours, point n) » (5e (6h) ch. 1,
4e ch. 6 « (voir « … », point 1) »). Projection, espace professeur et renvois « § n » / « section n » des générateurs :
passés à « point » le même jour (voir `content-authoring.md`, « Vocabulaire »).

