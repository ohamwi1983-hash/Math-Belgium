---
paths:
  - "src/content/**"
  - "src/lib/generatorLink.ts"
  - "src/components/Math.tsx"
---

# Conventions de rédaction du contenu (`ChapterContent`)

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
| `video`          | Placeholder "vidéo à venir" (exclu de l'export)                        |
| `entrainement`   | Carte "S'entraîner" en fin de section, avec lien vers le générateur (voir `widgetTag` ci-dessous) |
| `atelier`        | Atelier interactif libre "Manipule toi-même" (widget porté, voir ci-dessous) |

Ne jamais écrire de JSX dans les fichiers de contenu : tout passe par la mini-syntaxe `RichText`
ci-dessous.

`ChapterContent.recap.items` est optionnel : une synthèse peut être purement tabulaire
(`recap.table`, même forme que `featureTable`) sans liste à puces — cas rencontré dès qu'un
chapitre récapitule plusieurs fonctions/objets comparables plutôt qu'une liste de principes.

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
`entrainement` et en-têtes de `featureTable` sont rendus en texte BRUT — y écrire `$...$` affiche
les dollars littéralement (détecté uniquement au rendu navigateur, jamais par `tsc`). Y mettre des
caractères Unicode (2ⁿ, x², ×, −), jamais du LaTeX.

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
  le widget gradé (gen7, gen8) est monté AU-DESSUS de la description, dans `CarteEntrainement`,
  mais le lien "S'entraîner ↗" vers la version hébergée sur plateforme-maths reste toujours affiché
  en dessous — c'est la version de référence maintenue, le widget embarqué est une commodité, pas
  un remplacement du principe "lien vers le générateur" ci-dessus.
