---
paths:
  - "src/content/**"
  - "src/lib/generatorLink.ts"
  - "src/components/Math.tsx"
  - "src/lib/lectureFormules.ts"
  - "src/lib/katexAccessible.ts"
  - "src/entrainement/components/KatexAccessible.tsx"
  - "scripts/*lecture-formules*"
  - "src/lib/lienChapitre.ts"
  - "src/lib/prerequisChapitre.ts"
  - "scripts/verifier-liens-chapitres.mjs"
  - "src/lib/motsDuCours.ts"
  - "src/components/motsDuCoursContexte.tsx"
  - "scripts/controle-lisibilite.mjs"
  - "scripts/lisibilite/**"
---

# Conventions de rédaction du contenu (`ChapterContent`)

## Programme : notions hors programme à ne jamais employer

- **4e : pas de radian** (décision de l'utilisateur) : le radian est une matière de 5e. En 4e, tous les
  angles sont en degrés — cours, générateurs (variantes, consignes, saisies acceptées, aides, corrigés,
  barèmes), quiz, ateliers et énoncés de démonstration. Seule mention admise : le piège de la
  calculatrice réglée en mode RAD au lieu de DEG (sans enseigner ce qu'est un radian), et le renvoi
  « les radians arrivent en 5e ».

- **4e : pas de « déterminant »** (décision de l'utilisateur). Le déterminant relève du calcul
  matriciel, absent du programme de 4e. Pour la colinéarité de deux vecteurs, dire « critère de
  colinéarité » : $x_u \cdot y_v - y_u \cdot x_v = 0$, autrement dit « les produits en croix sont
  égaux ». Vaut pour le cours, les générateurs (consignes, aides, corrigés, barèmes, quiz) et les
  énoncés de démonstration de la 4e.

## Schéma `ChapterContent`

Un chapitre a un en-tête (niveau, numéro, titre, lede), une intro optionnelle ("mise en
contexte"), puis une liste de `ChapterSection` numérotées. Chaque section est une liste ordonnée
de `Block` — le même bloc peut apparaître dans n'importe quel ordre selon le besoin pédagogique :

| `Block.kind`    | Rendu                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `para`           | Paragraphe de prose (texte riche, voir ci-dessous)                     |
| `subheading`     | Sous-titre de sous-section (`h3`)                                      |
| `list`           | Liste à puces simple, hors callout (`ul.plain`)                       |
| `rappel`         | Callout neutre "Rappel"                                                |
| `methode`        | Callout "Méthode", liste d'étapes numérotées                          |
| `attention`      | Callout "⚠ Attention"                                                  |
| `astuce`         | Callout "💡 Astuce" (+ liste optionnelle)                              |
| `piege`          | Callout "Piège classique"                                              |
| `intuition`      | Callout violet "image concrète / analogie / pourquoi", distinct des autres callouts — voir plus bas |
| `definition`     | Callout "Définitions" — paragraphes de définition formelle, pas une liste à puces |
| `exemple`        | "Exemple résolu" : badge, formule, étapes tagguées, résultat encadré  |
| `exempleLibre`   | "Exemple résolu" en forme libre : blocs imbriqués quelconques (prose, chaîne...), quand le raisonnement ne se découpe pas en étapes/résultat rigides |
| `wrongRight`     | Comparaison côte-à-côte ✗ incorrect / ✓ correct                       |
| `illustration`   | Figure SVG autonome (voir `.claude/rules/illustration-components.md`) |
| `illustrationGroup` | Plusieurs illustrations compactes côte à côte (grille `diag-multi`) |
| `signTable`      | Tableau de signes / de variation (lignes alignées colonne par colonne) |
| `featureTable`   | Tableau à en-tête fixe (colonnes nommées, lignes de données) — forme différente de `signTable` |
| `operationChain` | Chaîne de valeurs reliées par des opérations nommées sur les flèches (HTML/flexbox, pas SVG — les nœuds contiennent du texte riche/KaTeX) |
| `tablePhi`       | Table COMPLÈTE de la loi normale centrée réduite Φ (z de 0,00 à 3,49), `caption?` en RichText — composant du cours `components/TablePhi.tsx` (classes `.table-phi-cours*` ; le générateur a le sien, `entrainement/components/TablePhi.tsx`), valeurs de `lib/tablePhi.ts` (même source que les générateurs et l'annexe papier ; voir l'en-tête de `lib/tablePhi.ts`) |
| `video`          | Placeholder "vidéo à venir" (exclu de l'export)                        |
| `entrainement`   | Carte "S'entraîner" en fin de section, avec lien vers le générateur (voir `widgetTag` ci-dessous) |
| `atelier`        | Atelier interactif libre "Manipule toi-même" (widget porté, voir ci-dessous) |

Ne jamais écrire de JSX dans les fichiers de contenu : tout passe par la mini-syntaxe `RichText`
ci-dessous.

`ChapterContent.recap.items` est optionnel : une synthèse peut être purement tabulaire
(`recap.table`, même forme que `featureTable`) sans liste à puces — cas rencontré dès qu'un
chapitre récapitule plusieurs fonctions/objets comparables plutôt qu'une liste de principes.

### Synthèses en KaTeX (décision de l'utilisateur)

Toute la synthèse « Ce qu'il faut retenir » (`recap.items`, `recap.table` — **en-têtes compris** —,
`recap.checklist.items`, `recap.forward`) est en KaTeX, jamais en notation clavier ni en Unicode
« à la main » : `$]0\,;+\infty[$`, `$\ln(1)=0$`, `$\dfrac{1}{x}$`, `$x \neq 0$`, `$180^\circ - \theta$`,
`$0{,}3$`, `$P(A\mid B)$`, `$\lim\limits_{x \to a}$`… Un nom de variable isolé dans une phrase aussi
(« le signe de $a$ », « en $x$ »). Un titre en gras qui contient une variable : `**Coefficient**
$\boldsymbol{a}$` (jamais `**Coefficient a**`, jamais `**…$a$…**`). Les connecteurs entre mots
(« racines → signe de $a$ », « Horizontale ⟺ $f'(a)=0$ ») et les formules en mots
(« Milieu = moyenne des coordonnées ») restent du texte. Rendu : `RecapFinal` passe le tableau à
`FeatureTable synthese` — en-têtes par `RichText` (seule exception à la règle « en-têtes de
`featureTable` en texte brut », qui vaut toujours dans le corps du cours) et police de lecture
(`feature-table--synthese`) au lieu de la monospace des tableaux de signes. Restent en texte BRUT :
`recap.checklist.label` et la carte `recap.entrainement` (titre, description). Contrôle : script de
`.claude/rules/content-history.md` (« Synthèses en KaTeX ») — KaTeX strict, ni `$$`, ni `$` orphelin,
ni `*` simple, ni `^`/`sqrt`/`a/b`/`<=`/`>=`/`!=`/`->` hors `$…$`.

## Champs facultatifs du parcours (`ChapterSection`) — page « une étape par écran »

La page de chapitre est un parcours (carte → une étape par écran → Réviser, voir
`.claude/rules/chapter-components.md`). Quatre champs FACULTATIFS par section l'enrichissent ; un
chapitre sans eux fonctionne tel quel (une seule liste d'étapes, pas d'encadré « L'essentiel », pas de
cartes « Teste-toi »). Aucun n'est imprimé ni exporté : le chapitre imprimé ne change pas.

- `titreCourt?: string` — texte BRUT (pas de `$…$`) : carte du chapitre, boutons « étape suivante »,
  « tu as vu : … », fiche de révision. Court (2 à 4 mots : « Relation de Chasles »). Absent : `title`.
- `partie?: string` — texte BRUT : les sections CONSÉCUTIVES de même `partie` sont groupées sous ce
  titre sur la carte (ex. 4e ch. 6 : « Sans repère : des flèches et une règle » 1–7, « Dans un
  repère : les composantes » 8–15, « Comparer, appliquer, réviser » 16–18).
- `essentiel?: string[]` — RichText, 1 à 3 phrases courtes : ce qu'un élève doit retenir de l'étape.
  Encadré orange en tête d'étape ET ligne de « La fiche du chapitre » (onglet Réviser). Reprendre le
  cours mot pour mot (relire la section avant d'écrire), jamais une notion absente de la section ;
  rien n'est déduit automatiquement du texte.
- `cartes?: { question: string; reponse: string }[]` — RichText, 2 à 4 par section : questions de
  restitution ou de reconnaissance, réponse courte (une formule, une phrase). Elles forment le paquet
  « Teste-toi » de l'onglet Réviser (« Je savais » / « À revoir », mémorisé dans le navigateur).
  Aucune carte dans le chapitre : le bloc n'apparaît pas.

Mêmes règles que partout : KaTeX `$…$`, « − », virgule décimale, `**gras**` jamais autour de `$…$`,
pas de « déterminant » ni de radian en 4e. Pilote : `4e/calcul-vectoriel.ts`.

Durée affichée d'une étape : CALCULÉE (mots / 180 par minute + 1 min par atelier, arrondie,
`dureeEtape` dans `src/lib/parcoursChapitre.ts`), jamais saisie.

## `ChapterContent.formulaire` — formulaire de fin de chapitre

Champ optionnel, sibling de `recap`, rendu après lui par `Formulaire`
(`components/chapter/Formulaire.tsx`) — "fiche de référence" dense (perforation, 2 colonnes),
design choisi par l'utilisateur parmi 4 propositions (voir `.claude/rules/content-history.md`).
Contrairement à `recap` (synthèse narrative "ce qu'il faut retenir"), le formulaire ne rassemble
QUE les formules effectivement nécessaires pour répondre aux questions des générateurs du
chapitre — groupées par thème mathématique (`groups[].title` + `groups[].formulas`), jamais par
générateur (une même formule sert souvent à plusieurs générateurs à la fois). `formulas[].text`
et `formulas[].condition` passent par `RichText` (mêmes pièges `$...$`/`**gras**` que partout
ailleurs) ; `groups[].title` est rendu en texte BRUT (comme les autres titres/labels listés
ci-dessus), jamais de LaTeX dedans.

## Mini-syntaxe `RichText` (KaTeX + gras)

Le texte de tous les champs `text`/`items`/`formula` supporte une mini-syntaxe : `$latex$` pour
une formule KaTeX inline, `**gras**` pour l'emphase — voir `RichText`/`MathInline`/`RichParagraph`
dans `src/components/Math.tsx`.

**Piège vérifié en pratique** : l'emphase à un seul astérisque (`*mot*`, convention Markdown
courante) n'est **jamais** interprétée — `TOKEN_RE` ne reconnaît que `$latex$` et `**gras**`, rien
d'autre. Un seul astérisque s'affiche donc verbatim à l'écran (ex. `*exactement*`) — détecté
uniquement au rendu navigateur, jamais par `tsc`/`build`/`lint`. Toujours écrire `**gras**`, jamais
`*mot*`, y compris pour un mot isolé (terme latin, mise en relief d'un seul mot). Bug latent
retrouvé dans plusieurs chapitres déjà en production (`caracteristiques-fonctions-reference.ts`,
`statistique-descriptive.ts`) — à corriger au passage si l'un de ces fichiers est retouché.

**Piège vérifié en pratique** : `$latex$` imbriqué à l'intérieur de `**gras**` (ex.
`'**$a > 0$**'`) n'est PAS reparsé — le tokenizer capture tout le texte entre `**...**` comme
gras littéral, dollars compris, et KaTeX ne s'exécute jamais dessus. Toujours écrire le gras et
le math comme deux segments adjacents, jamais l'un dans l'autre.

**Piège vérifié en pratique** : il n'existe **aucune** syntaxe de math "display"/bloc — `$$latex$$`
n'est pas un délimiteur reconnu. `TOKEN_RE` (`/\$([^$]+)\$|\*\*([^*]+)\*\*/g`) ne matche que des
paires `$...$` dont le contenu ne contient aucun `$` : sur `$$y^2=2px$$`, le moteur ne peut pas
matcher depuis le tout premier `$` (le caractère suivant est aussi `$`, donc `[^$]+` échoue) ; il
matche en revanche depuis le **second** `$` jusqu'à l'avant-dernier, laissant le tout premier et le
tout dernier `$` comme texte littéral non reconnu — deux `$` isolés qui s'affichent verbatim de
part et d'autre de la formule (repéré au premier rendu réel : `$$` dupliqués sur toute la
maquette). Toujours écrire une seule paire `$...$`, même pour une équation qu'on voudrait "mise en
avant" (elle reste inline, sur sa propre ligne si elle est seule dans un `para`/`exemple`/`step`) —
jamais `$$...$$`.

**Piège confirmé en pratique** : seuls `text`/`items`/`formula`/`caption` passent par `RichText`.
Les `label` de callout, `badge` et `tag` d'exemple, `kicker` de section, `description` de bloc
`entrainement` et en-têtes de `featureTable` (sauf `recap.table`, voir « Synthèses en KaTeX ») sont rendus en texte BRUT — y écrire `$...$` affiche
les dollars littéralement (détecté uniquement au rendu navigateur, jamais par `tsc`). Y mettre des
caractères Unicode (2ⁿ, x², ×, −), jamais du LaTeX.

## Vocabulaire : « point », jamais « étape », pour une partie du chapitre (28/11/2026)

Décision du professeur : les parties numérotées d'un chapitre (les `sections`) s'appellent des **points** partout où
l'élève les lit (« le point 3 », « au point 3 », « du point 3 », « ce point », « 7 / 14 points compris », « Tu en es
au point 8 sur 14 », « Point suivant », « Revoir le point 2 »). Dans le texte du cours : « (point 7) », « comme
annoncé au point 2 », « la formule de ce point », « à la fin du point », lien nommé `[[…#section|point 7]]`.
Renvois des générateurs vers le cours : « (cours, point 4) », « Méthode du cours (point 4) ».
**« étape » reste** pour tout ce qui n'est PAS une section : étapes d'un calcul, d'une méthode, d'une démonstration
(« **Étape 1 —** »), d'un exemple résolu pas à pas (« Montrer l'étape suivante », « Écouter l'étape n » d'un exemple,
« Exemple résolu · 4 étapes »), d'un algorithme ou d'une construction répétée (« à chaque étape », « après n
étapes »), les écrans d'un générateur (« Étape 2 / 3 » de `BarreGenerateur`) et les étapes du corrigé papier
(« Étape n — consigne »). Les identifiants de code, fichiers, clés `localStorage`, paramètres d'URL (`etapes=`) et
types (`etape`, `EtapePubliee`…) ne changent pas. Les `label` / `badge` d'exemples ne changent pas non plus (clés
de `ENONCES_DEMONSTRATION`) : « Exemple résolu — la série des sections 3 et 4 » (4e statistique) est gardé tel quel.

**Aussi côté professeur et dans les générateurs** (même jour, le professeur a dit oui) : jamais « étape n », « § n »
ni « section n » pour une partie du chapitre, nulle part où on LIT le texte (écran, `aria-label`, `title`, texte lu,
copié, imprimé, exporté).
- Projection : diapo de titre « Point n · partie », notes « Point n : titre », fil de la barre « chapitre · point n ·
  titre court » (choix : « point n » plutôt que « n. titre », qui se confondait avec le numéro de chapitre), vignettes
  et étiquette de copie « Point n », lanceur « Points à projeter » (lien « Tous » / « Aucun »), « Coche au moins un
  point. », « n diapos · k points », « … dans ces points », « choisis moins de points », « choisis au moins un
  point », vidéo « Changements de point (chapitres YouTube) », « chapitres d'après les points montrés ».
- Espace professeur : tableau de bord « — point n » / « , point n », « Choisir les points », vue d'ensemble « , point n »,
  « n points sur N vus », « Points vus dans … » ; « Matière vue à noter » « Points projetés », « Point n — titre »,
  « vu en partie », « Suites, points 7 et 8 » ; « Noter la séance » « Coche un point entier… », parties de l'évaluation
  « n. titre » (plus « § n »), « coche les points évalués » ; carte de séance et texte pour l'agenda scolaire
  « — points 2 et 3 », « • Point 3 : titre » (rubrique « Vu en classe ») ; semaine « · points 6 et 7 » ; « dernière
  fois : Suites, point 3 « titre » » ; « 4 / 9 points », « points commencés », « + 3 points » ; agenda d'une période
  « (n points) » ; page des élèves « points du chapitre » ; panneau des évaluations « n points, … ces points »,
  « Question de démonstration (point 3) », « Afficher les titres des points du cours ». Aide :
  `components/carnet/outilsCarnet.ts::listePoints` (« point 3 », « points 2 et 3 », « points 1, 2 et 4 »).
- Générateurs : « (cours, point 4) », « Cours, point 1 : … », « (cours, points 1 et 4) » (ancien « § 1 et § 4 »,
  « §§ 4 et 5 », « § 4–5 »), « du point 1 du cours », « un par point du cours », « Je fais le point » : colonne
  « Point n — titre ». Remplacés HORS commentaires seulement (lexer qui ignore `//` et `/* */`) ; les commentaires
  gardent leurs « § n » (historique).
- **Restent** (ce ne sont pas des sections) : « Trois étapes » de l'annonce (Quand / Sur quoi / Publier), les étapes de
  « Premiers pas », les étapes de RÉVÉLATION d'une diapo (« étape 2 / 4 » de la vue du professeur, « Prochain clic :
  étape suivante de cette diapo », « Exemples résolus (une étape par clic) », « · étape 2 sur 4 » d'un exemple),
  « Corrigé : n étapes » du panneau, « Une section par classe » de l'agenda (section du document imprimé), « Émojis de
  section » (rubriques du texte), la « section » GÉOMÉTRIQUE (section plane d'un solide, points de section, aire de
  la section d'une gouttière…), et le « § » SENTINELLE du code (`lectureValeurTrigo.ts` « $1§ »,
  `SAISIE_NON_DEFINIE = "§non-definie"`, `join("§")` de `grilleCorrection.ts`). Les clés (`cle: 'Retour au § 1'`
  d'`evaluationPayload.ts`) ne changent pas. Les anciennes séances gardent leur texte enregistré.
- Contrôle d'un reste : chercher `§` et `[Ss]ections? +[0-9]` hors commentaires dans `src/entrainement`, `src/lib`,
  `src/components`, `src/routes` (seuls les sentinelles ci-dessus doivent rester).

## Chapitres autonomes : jamais de numéro de chapitre, liens nommés, champ `utilise`

Décision du professeur (25/11/2026, carte des prérequis validée) : les professeurs ne suivent pas tous
l'ordre des chapitres du site — chaque chapitre doit se lire seul, quel que soit l'ordre suivi.

- **Aucun numéro de chapitre dans le texte** (cours, synthèses, quiz, corrigés, énoncés, questions
  « Formule », énoncés de démonstration) : ni « au chapitre 2 », ni « ch. 3 », ni « chapitre précédent /
  suivant / prochain ». On NOMME ce qu'on cite. Les numéros internes au même chapitre (« point 3 », « § 3 »,
  « section 3 ») restent permis. Les annonces vers la suite (« tu le retrouveras… ») sont gardées, en lien
  nommé. Contrôle au build : `scripts/verifier-liens-chapitres.mjs` (chapitres + questions « Formule ») ;
  générateurs et `evaluationPayload.ts` : recherche `chapitre [0-9]` / `ch\. ?[0-9]` / « chapitre
  précédent… » hors commentaires (les sous-titres « Chapitre n — Titre » des pages de générateurs relèvent
  de « Mon ordre des chapitres »).
- **Lien nommé** (champs RichText seulement : `text`, `items`, `formula`, `caption`, `forward`, `essentiel`,
  `cartes`, `rappel`…) :
  - `[[4e/equations-inequations-second-degre#resoudre]]` → « « Équations et inéquations du second degré »,
    point 1 » (lien interne, info-bulle = titre court de l'étape) ;
  - `[[4e/geometrie-analytique-plane]]` → « « Géométrie analytique plane » » (carte du chapitre) ;
  - `[[4e/calcul-vectoriel#norme|la norme]]` → « la norme » (texte choisi, en clair : utile en début de
    phrase, où « « Titre », point n » se lit mal — préférer « En probabilités ([[…]]), … »).
  Résolution par `chaptersIndex.ts` (`lib/lienChapitre.ts`) ; lien cassé = ÉCHEC du build. Jamais dans
  un `**gras**` (non reparsé : `**binôme de Newton** ([[…]])`, pas `**… [[…]]**`), jamais dans un champ en
  texte BRUT (`label`, `kicker`, `badge`, `tag`, `titreCourt`, `partie`, titres, `description` de carte) :
  là, le nom du chapitre en clair (« Pour la suite — la géométrie analytique ») ou rien. Même règle dans les
  générateurs, quiz, corrigés et énoncés : nom en clair, sans lien (« (voir « Équations et inéquations du
  second degré », point 1) », « via la formule des exponentielles »). Rendu : `Math.tsx::LienChapitre`
  (React Router `Link`, même onglet ; nouvel onglet dans « Je bloque », texte seul dans les diapos de
  projection — contexte `ModeLiensChapitre`) ; à l'impression le texte seul (`.lien-chapitre` sans couleur
  ni soulignement), dans l'export HTML le lien est remplacé par son texte (`buildHtml.ts`) ; texte brut
  (méta, notes de projection, carnet, recherche, questions reprises des exemples) : `texteSansLiens`.
- **Champ `utilise` d'une section** (étapes d'AUTRES chapitres dont elle se sert) :
  `utilise: [{ cible: '4e/calcul-vectoriel#norme', poids: 'indispensable', rappel: '…' }, …]` — `poids`
  `indispensable` (l'étape ne se comprend pas sans) ou `utile` ; `rappel` RichText, 1 à 3 phrases reprises
  du cours cité (absent : « L'essentiel » de l'étape citée) ; `jeBloque: ['gen24']` = générateurs de
  l'étape pour lesquels « Je bloque » montre ce prérequis même s'il n'est qu'utile. Rendu
  (`components/chapter/Prerequis.tsx`) : encadré replié « Ce chapitre utilise… » sur la carte (toutes les
  entrées, par chapitre), « Ce point utilise » en tête d'étape (indispensables, rappel dépliable),
  « Tu as besoin de… » dans « Je bloque ». Jamais imprimé ni exporté. Contrôle au build : cible connue,
  autre chapitre, pas de doublon, générateur `jeBloque` présent dans l'étape. Limité à la MÊME année
  (décision 5 : les acquis des années précédentes ne sont pas listés pour l'instant). Source : carte des
  prérequis du 25/11/2026 (99 entrées dans 65 étapes de 15 chapitres, 44 indispensables), voir
  `.claude/rules/content-history.md`, « Chapitres autonomes ».

## Lecture en mots des formules (`aria-label`, future lecture à voix haute)

Chaque formule rendue porte sa lecture en français parlé : `role="img"` + `aria-label` sur le
conteneur (la sortie HTML de KaTeX reste `aria-hidden`), présente dès le HTML pré-rendu. Lecteur
MAISON `src/lib/lectureFormules.ts` (`lireFormule(tex)`, `analyserLecture(tex)` pour le diagnostic) :
jetons → arbre → texte, jamais des regex en chaîne ; décision du professeur, pas de MathML + Speech Rule
Engine. Branché dans `MathInline` (`components/Math.tsx`, cours), `entrainement/components/KatexAccessible.tsx`
(remplaçants à l'identique de `InlineMath`/`BlockMath` de react-katex, utilisés par les trois `Katex.tsx`
et `CorrigeDetailleEcran`) et `lib/katexAccessible.ts` (`htmlKatexAccessible` : attributs posés sur la
racine d'un HTML `katex.renderToString` — corrigés en chaîne HTML, ateliers via `interactive/katex-shadow.js`).
Les exports papier (Word, PDF, feuilles) n'en ont pas besoin et ne changent pas.

Conventions (maquette planche 08) : « u indice n plus 1 égale 3 fois u indice n » (u₍ₙ₊₁₎), mais
« u indice n, plus 1 égale … » (uₙ + 1) — décision du professeur : un indice ou exposant SIMPLE suivi d'un
opérateur prend une virgule (« x au carré, plus 1 »), un exposant composé suivi d'un opérateur se ferme
(« x exposant n plus 1, fin d'exposant, plus 1 ») ; « u indice n égale u indice 1, plus, parenthèse, n moins 1,
fin de parenthèse, fois r », « S indice n égale : fraction, n fois, parenthèse, u indice 1, plus u indice n,
fin de parenthèse, sur 2, fin de fraction », « l n de x » et « log de x » (comme les professeurs le disent), « 3 sur 4 » (fraction
simple : numérateur nombre/lettre/produit simple, dénominateur d'un seul tenant), « racine carrée de 3, sur 2 »,
« x au carré », « x puissance n », « x exposant moins 1 », « e exposant x », « f prime de x », « f réciproque de x »,
« l'intervalle ouvert en moins l'infini, fermé en moins 2 », « R privé de 2 et 3 », « probabilité de A sachant B »,
« X suit la loi binomiale de paramètres n et p », « C n k », « factorielle n », « A de coordonnées 2 ; moins 3 »,
« vecteur A B de composantes 3 ; moins 4 », « limite quand x tend vers 0 par la droite, de … », « intégrale de a
à b, de f de x d x », « 3 virgule 5 », « 1000 » (milliers sans espace : la voix dit « mille »), « y » → « i grec ».
« parenthèse … fin de parenthèse » seulement quand le contenu est composé (« 2 fois moins 3 », « (−3)² » garde
ses parenthèses). Les virgules et deux-points sont des PAUSES pour la voix, pas de la décoration.

Ajouter une notation LaTeX nouvelle au site = vérifier sa lecture : `npm run controle:lecture` (toutes les
formules des chapitres + adaptateurs papier ; échoue sur une commande inconnue, une lecture vide ou contenant
`\`, `{`, `_`, `^`) et `npm run test:lecture` (cas figés de `scripts/lecture-formules-cas.json` ; `-- --ecrire`
les réécrit, à RELIRE : une lecture doit se comprendre à l'oreille sans voir la formule). Une commande
inconnue n'est jamais lue (ni « backslash », ni son nom) : seul son contenu l'est.

## Correspondances (`\htmlClass{m1}{…}`) — option élève « Couleurs et soulignés qui se correspondent »

Planche 09 (lot A2, `.claude/rules/cote-eleve.md`) : dans QUELQUES exemples clés seulement — ceux où l'œil
doit relier deux lignes (ce qu'on remplace par sa valeur) —, les morceaux qui se correspondent portent la
même classe : `\htmlClass{m1}{…}` (trait plein), `m2` (tirets), `m3` (double trait). Avec l'option, chaque
paire a la même couleur ET le même trait (jamais la couleur seule) ; sans l'option, le rendu est
**strictement identique** (KaTeX ne fait qu'entourer le groupe d'un `<span class="enclosing m1">`, transparent
pour ses espacements). `MathInline` n'admet que ces trois classes (`trust` limité, `strict` muet pour
`htmlExtension`) ; ailleurs (générateurs, papier) `\htmlClass` n'est jamais écrit. La lecture en mots les
ignore ; `evaluationPayload.ts::parseRichText` les retire (exemples repris en questions ouvertes).

Exemple (5e Suites, étape 1) :

```ts
formula: 'Le premier terme … vaut $\\htmlClass{m2}{u_1} = \\htmlClass{m2}{7}$. Son sixième terme vaut $\\htmlClass{m1}{u_6} = \\htmlClass{m1}{22}$. …',
correspondances: [['u_6', '22'], ['u_1', '7'], ['(6-1)', '5']],   // légende m1, m2, m3 (LaTeX sans $)
steps: [{ tag: '…', text: '$\\htmlClass{m1}{u_6} = \\htmlClass{m2}{u_1} + \\htmlClass{m3}{(6-1)}r \\implies \\htmlClass{m1}{22} = \\htmlClass{m2}{7} + \\htmlClass{m3}{5}r$' }],
```

Règles :
- Champ `correspondances` du bloc `exemple` = légende « u₆ → 22 (trait plein) · … », montrée sous l'énoncé
  du pas à pas SEULEMENT avec l'option (au plus 3 paires, dans l'ordre m1, m2, m3).
- **Jamais un signe au début du groupe** : `(-\htmlClass{m2}{10})^2`, pas `(\htmlClass{m2}{-10})^2` — le « − »
  changerait de nature (binaire → signe) et le rendu sans option ne serait plus identique (mesuré : 9 px
  d'écart). De même `2x^2 - \htmlClass{m2}{10}x`, jamais `\htmlClass{m2}{-10}x`.
- Contrôle : `scratchpad/eleve-A2/identite.mjs` (rend chaque formule annotée et sa version d'origine, compare
  la position de chaque glyphe) — à relancer après une annotation nouvelle.
- Exemples annotés (4) : 5e Suites « retrouver la raison » (arithmétique, 3 paires ; géométrique, 2 paires),
  4e Second degré « cas général » (a → 2, b → −10, c → 8), 6e Variables aléatoires « effectif attendu »
  (μ → 170, σ → 8). Ne pas en annoter davantage sans raison : 3 à 6 dans tout le site (décision du lot).

## Callout `intuition` — apports pédagogiques (image concrète, analogie, "pourquoi")

`{ kind: 'intuition', label?, text }` — callout teinté violet (réutilise `--plan`/`--plan-soft`,
déjà utilisé pour la géométrie dans l'espace ; les deux usages ne se rencontrent jamais dans le
même callout, seulement parfois sur la même page). Sert à ajouter, à côté du contenu existant, un
des quatre types d'aide pédagogique validés avec l'utilisateur :

1. une image concrète ou une analogie **avant** la définition formelle (ex. le distributeur de
   boissons avant "une fonction associe...") ;
2. le **pourquoi** d'une règle, avant de la donner (ex. pourquoi un dénominateur à 0 ou une racine
   d'un négatif posent problème, pas seulement la règle "il faut que...") ;
3. une analogie mémorable pour un point qui se retient mal (ex. chaussettes-avant-chaussures pour
   l'ordre de composition de fonctions) ;
4. un pont explicite vers une notion déjà connue (ex. rappeler que f(x) est déjà connu depuis un
   chapitre antérieur, avant d'aller plus loin).

**Ne jamais** utiliser "Ajout pédagogique" (ou toute variante methodologique/meta) comme `label` —
ce texte n'a de sens qu'en interne, jamais pour l'élève qui lit la page. Toujours donner un `label`
naturel et spécifique au contenu du bloc (ex. "Pourquoi ça marche ?", "Pour visualiser",
"Ce que tu sais déjà", ou tout autre titre à hauteur d'élève) — jamais le label par défaut
générique "Intuition" laissé tel quel si un titre plus parlant est possible.

Ce callout est un **ajout**, jamais une réécriture de contenu existant : il ne remplace ni un
`rappel`, ni un `methode`, ni aucun autre bloc déjà présent — il vient en plus, à l'endroit où il
aide le plus (typiquement juste avant une définition dense, ou juste après une règle dont le
"pourquoi" n'est pas déjà expliqué ailleurs). Un chapitre n'en a pas besoin à chaque section : 3 à
6 par chapitre, aux endroits qui en profitent vraiment, valent mieux qu'un bloc systématique par
section qui finit par se banaliser et alourdir la lecture.

## Convention de lien vers un générateur

Le routing n'est **pas uniforme entre chantiers** — vérifié sur le déploiement réel, pas supposé :

- `4e` : générateurs à la racine → `https://plateforme-maths.vercel.app/{idGenerateur}`
- `5e-4h`, `6e-6h` : générateurs dans un dossier → `https://plateforme-maths.vercel.app/{chantier}/{idGenerateur}`

Voir `src/lib/generatorLink.ts`, qui encapsule ce cas spécial : l'authoring d'un chapitre pose
toujours `chantier` = `levelSlug` (ex. `'4e'`, `'5e-4h'`), la fonction se charge de générer la
bonne forme d'URL selon le chantier.

## Widgets interactifs portés — côté contenu

Certains chapitres embarquent des Web Components JS vanilla portés depuis un artifact d'origine
(implémentation complète : `.claude/rules/interactive-widgets.md`). Côté fichier de contenu, deux
kinds de `Block` :

- `{ kind: 'atelier', tag, label, caption? }` — atelier libre "Manipule toi-même", sans notion de
  correction ni de score, sans générateur `genN` équivalent (rien à lier en plus du widget).
- `{ kind: 'entrainement', ..., widgetTag? }` — extension additive de l'`entrainement` existant :
  un widget gradé serait monté AU-DESSUS de la description, dans `CarteEntrainement`, le lien
  "S'entraîner ↗" restant affiché en dessous. **Aucune carte ne s'en sert** : le portage de
  `gen7-widget` / `gen8-widget` n'a jamais été fusionné, et l'utilisateur a décidé de ne pas les
  porter (audit du 4e ch. 1) — ne pas poser de `widgetTag` sur les cartes gen7 / gen8.

## Français simple et mots du cours (pilote : 4e « Statistique descriptive », 28/11/2026)

Constat du professeur : des élèves de 4e (lecteurs moyens à faibles, certains « dys ») ne comprennent pas le cours
en le lisant (« mots compliqués ») et demandent à une IA de leur expliquer le texte. Démarche validée sur UN
chapitre pilote ; si le résultat convient, elle sera étendue à toute la 4e, la 5e et la 6e. Un chapitre est « en
français simple » quand il est déclaré dans `scripts/lisibilite/chapitres-francais-simple.json` : son contrôle
bloque alors le build.

**Règles d'écriture** (tout texte que l'élève lit : `para`, encadrés, items, étapes et résultats d'exemples,
légendes, `essentiel`, `cartes`, descriptions des cartes « À toi », synthèse) :
- une idée par phrase ; viser 20 mots au plus, **jamais plus de 25** (hors exception écrite dans le fichier des
  chapitres déclarés : énumération, formule longue) ; casser les incises « — … — » et les chaînes « donc …, puisque
  … » en phrases courtes ; « — » ne sert plus que d'étiquette (« **Moyenne** : … », « Médiane — seuil … » dans un
  exemple, synthèse) ;
- mots de tous les jours à la place des mots de manuel (liste noire réutilisable
  `scripts/lisibilite/mots-de-manuel.json`, avec ce qu'on écrit à la place : « les deux côtés de l'égalité » pour
  « les deux membres », « n'importe quel » pour « quelconque », « dans l'autre sens » pour « réciproquement »,
  « valeur approchée » pour « approximation », « qui se suivent » pour « consécutifs »…). Un mot de la liste
  nécessaire au cours (« strictement », « représentatif ») est GARDÉ s'il est au lexique ET expliqué sur place ;
- les vrais mots du cours (programme FWB) sont GARDÉS, expliqués en une phrase à leur première apparition dans
  l'étape où ils servent (« Une classe va d'une borne inférieure (son début) à une borne supérieure (sa fin). ») et
  mis au lexique ;
- tutoiement, ton, exactitude : rien de faux, rien de retiré du contenu exigé, aucun exemple / résultat / formule
  changé ; typographie (« − », virgule décimale, insécables), gras d'insistance en minuscules (jamais « ET »,
  « EXACTEMENT ») ; dire « point n » (jamais « étape n » ni « section n » : c'est ce que l'écran affiche, voir « Vocabulaire : « point » ») ;
- **structure intacte** : mêmes ids de sections, même nombre et même ordre de blocs, mêmes cartes « Teste-toi »
  (clés `idSection:indice`), mêmes générateurs / ateliers / figures ; les `badge` / `label` d'exemples ne changent
  pas (clés de `ENONCES_DEMONSTRATION`, `evaluationPayload.ts`). La progression des élèves, les annotations de
  projection (étape + rang du bloc) et les exports en dépendent. Contrôle de la réécriture : comparer avant / après
  (mêmes champs non textuels, mêmes formules `$…$` bloc par bloc) — script `structure.mjs` du dossier de travail
  `francais-simple/`, à reprendre pour chaque chapitre.

**Lexique** (« mots du cours ») : champ `ChapterContent.lexique?: MotDuCours[]` (`types.ts`), données dans
`src/content/lexiques/{niveau}/{slug}.ts`, importées par le fichier du chapitre (`lexique: lexiqueStatistiqueDescriptive`).
Par mot : `mot` (texte brut), `formes` (pluriel, féminin, variantes, « Q1 »…), `definition` (RichText, 1 ou 2
phrases courtes), `exemple` (RichText, concret, tiré du chapitre si possible), `etape` (section où il est expliqué :
bouton « Revoir le point n » ; absent pour « Avant de commencer »), `pasDans` (expressions où le mot a son sens courant
et ne doit pas être souligné : « toute la classe », « une classe de 40 élèves », « en moyenne », « mode statistique »).
Repérage automatique (`src/lib/motsDuCours.ts`, pur) : mots entiers, sans casse ni accents, la forme la plus longue
gagne (« effectif cumulé » avant « effectif »), jamais dans une formule, un gras (le mot y est souvent DÉFINI), un
lien, un titre, un tableau, une légende de figure ou une consigne d'atelier. Un mot est souligné **une fois par
bloc** (première chaîne du bloc qui le contient, calcul pur sur les données) et partout où il revient dans le
chapitre. Rendu : `components/chapter/MotsDuCours.tsx` (voir `chapter-components.md`, « Mots du cours »).

**Contrôle** : `npm run controle:lisibilite` (`scripts/controle-lisibilite.mjs`, logique pure dans
`scripts/lisibilite/mesure.mjs`), branché dans `npm run build` après `verifier-liens-chapitres.mjs`. Pour un chapitre
déclaré : phrase de plus de 25 mots sans exception écrite, mot de la liste noire hors lexique, mot du cours d'un
thème du chapitre (`scripts/lisibilite/vocabulaire-cours.json`, par thème : `statistique`…) absent du lexique, mot du
lexique jamais repéré (forme mal écrite), étape inconnue, définition de plus de 2 phrases → ÉCHEC. Les autres
chapitres ne bloquent jamais : `-- --rapport` (tableau de tous les chapitres), `-- --json f.json` (rapport complet),
`-- --plus 20 4e/slug` (phrases de plus de 20 mots d'un chapitre, pour la réécriture). Mesure : un jeton avec une
lettre = un mot, une formule = un mot, une suite de nombres (« 3, 5, 3, 7 ») = un mot ; phrases coupées après
« . ! ? … » suivis d'une majuscule, d'un chiffre ou d'une formule ; texte mesuré = tout ce que l'élève lit (pas les
titres, étiquettes, tableaux de données ni légendes de photos).

**Étendre à un chapitre** : (1) `-- --plus 20 niveau/slug` et la liste noire pour repérer ; (2) réécrire les textes
seulement ; (3) écrire `src/content/lexiques/{niveau}/{slug}.ts` et l'importer ; (4) ajouter le thème de
vocabulaire s'il manque ; (5) déclarer le chapitre ; (6) `npm run controle:lisibilite`, `npm run controle:lecture`,
comparaison de structure avant / après, `npm run build`.

