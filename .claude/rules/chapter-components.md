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
  `dureeEtape`, `titreCourt`.

Lecture (écran seulement) : corps, encadrés, légendes, tiroirs en Andika via le jeton `--lecture`
(sur `.chapter-layout.parcours`), titres en Fraunces, interface en Work Sans ; 17 px, interligne
1,6 ; fond uni ; légendes à gauche ; formules `nowrap` qui défilent dans `.math-inline`. Quatre rôles
d'encadrés : orange (essentiel, définition, méthode, rappel), rouge (attention, piège), bleu
(exemple), violet (À toi) ; astuce/intuition en neutre clair. Ordinateur (≥ 760 px) : étape = carte
des étapes à gauche + article ≤ 760 px ; ≥ 1200 px : + colonne de droite. `OutilsChapitre`
(Feuilles, Carnet, Imprimer) : bas de la carte et colonne de gauche d'une étape.
