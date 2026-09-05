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

**Piège vérifié en pratique** : `$latex$` imbriqué à l'intérieur de `**gras**` (ex.
`'**$a > 0$**'`) n'est PAS reparsé — le tokenizer capture tout le texte entre `**...**` comme
gras littéral, dollars compris, et KaTeX ne s'exécute jamais dessus. Toujours écrire le gras et
le math comme deux segments adjacents, jamais l'un dans l'autre.

**Piège confirmé en pratique** : seuls `text`/`items`/`formula`/`caption` passent par `RichText`.
Les `label` de callout, `badge` et `tag` d'exemple, `kicker` de section, `description` de bloc
`entrainement` et en-têtes de `featureTable` sont rendus en texte BRUT — y écrire `$...$` affiche
les dollars littéralement (détecté uniquement au rendu navigateur, jamais par `tsc`). Y mettre des
caractères Unicode (2ⁿ, x², ×, −), jamais du LaTeX.

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
