---
paths:
  - "src/content/**"
  - "src/lib/generatorLink.ts"
  - "src/components/Math.tsx"
  - "src/lib/lectureFormules.ts"
  - "src/lib/katexAccessible.ts"
  - "src/entrainement/components/KatexAccessible.tsx"
  - "scripts/*lecture-formules*"
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

Conventions (maquette planche 08) : « u indice n plus 1 égale 3 fois u indice n », « u indice n égale
u indice 1 plus, parenthèse, n moins 1, fin de parenthèse, fois r », « S indice n égale : fraction, n fois,
parenthèse, u indice 1 plus u indice n, fin de parenthèse, sur 2, fin de fraction », « 3 sur 4 » (fraction
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
