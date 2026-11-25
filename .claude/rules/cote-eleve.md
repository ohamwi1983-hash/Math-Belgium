---
paths:
  - "src/lecture.css"
  - "src/lib/reglagesLecture.ts"
  - "src/lib/formulesDebordantes.ts"
  - "src/components/lecture/**"
  - "src/components/Math.tsx"
  - "src/components/SiteHeader.tsx"
  - "index.html"
---

# Côté élève, sans compte — confort de lecture (lot A1, 25/11/2026)

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
  générateurs : police + espacement + thème seulement (la TAILLE dans les générateurs = lot G : barres
  fixes et calculatrices à valider) ;
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
Contraste élevé : traits 2 px (encadrés, tiroirs, cartes), filet gauche 5 px, liens soulignés.
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
  « Professeur » en icône seule (une ligne d'en-tête). Bouton dans la barre des générateurs : lot G
  (`ouvrirPanneauLecture` suffit).
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
