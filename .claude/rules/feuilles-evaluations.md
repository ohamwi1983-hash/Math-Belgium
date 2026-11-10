---
paths:
  - "src/entrainement/export/**"
  - "src/entrainement/**/exportEvaluation.ts"
  - "src/lib/evaluationLocal.ts"
  - "src/lib/evaluationPayload.ts"
  - "src/lib/evaluationAdapterRegistry.ts"
  - "src/lib/banquesVraiFaux.ts"
  - "src/components/admin/EvaluationGeneratorPanel.tsx"
  - "scripts/verifier-enonces-evaluation.mjs"
---

# Feuilles d'exercices et évaluations — méthode (pilote : 6e, chapitre 3)

Refonte faite d'abord sur le chapitre 3 de 6e (« Fonctions logarithmes », 6gen13–22, commits
`d27dc03` → `6f1aebb`). Pour l'étendre à un autre chapitre, refaire **tous** les points ci-dessous,
générateur par générateur. Décisions de l'utilisateur : ce sont des règles, pas des suggestions.

## Décisions de l'utilisateur (non négociables)

- **Aucune place de réponse** sous les questions (feuille ET évaluation) : les élèves répondent sur
  une feuille à part. Jamais de `reponse` rendue, jamais de lignes/cadres vides.
- **Énoncé papier = énoncé + consigne globale seulement.** Les sous-questions a) b) c) d'un
  générateur sont ses étapes d'APPRENTISSAGE (une par écran) : elles n'ont de sens que dans le
  générateur interactif. Sur papier elles vont dans le **corrigé** (« Étape n — consigne », puis sa
  résolution). Exception : les VRAIES questions distinctes d'un problème (6gen22 : demi-vie, puis
  temps restant, puis facteur correctif) restent en a) b) c) ; les étapes de pur guidage (« pose
  l'équation », « isole le terme ») disparaissent.
- **Version aménagée** pour la feuille d'exercices ET l'évaluation : **exactement le même énoncé**
  que la version normale — JAMAIS découpé en étapes, aucun rappel de méthode (décision de
  l'utilisateur : l'aménagement porte sur la mise en page seulement) — police lisible (Atkinson
  Hyperlegible), grand interligne, une question par page, mêmes points. Il n'y a plus de champ
  `enonceAmenage` dans le contrat.
- Générateurs d'apprentissage : ni points ni pénalités affichés à l'écran.
- **Sélecteurs de variantes (`SelecteurVarianteDev`) : ne jamais les masquer ni les modifier.**
- Tout est poussé sur la branche ET `main` (fast-forward), à chaque lot.

## Contrat d'adaptateur (`export/genererFeuilleExercices.ts`)

Chaque `generateurs*/**/exportEvaluation.ts` du chapitre remplit, en plus de
`construireEnonce`/`construireCorrection` :

| Champ | Contenu |
| --- | --- |
| `difficulte` | 1–3 étoiles (★ application directe, ★★ plusieurs étapes, ★★★ réflexion), selon l'instance. |
| `reponseBreve` | Résultat seul (page « Je vérifie »). Pas de lettres a)/b) si l'énoncé papier n'en a pas. |
| `correctionDetaillee` | `EtapeCorrection[]` : `label` court (Méthode, Calcul, Condition, Conclusion, Piège…), `sousQuestion` = lettre de l'ÉTAPE (« a », « b »… dans l'ordre des écrans). Une ligne « Piège » ciblée. |
| `EtapeCorrection.figureHtml` | Figure SVG autonome sous une ligne du corrigé : tout exercice dont la réponse est un GRAPHIQUE (polygone des effectifs cumulés avec lecture de Q₁/Q₂/Q₃, boîte à moustaches attendue, courbes annotées…) la montre dans le corrigé détaillé — sinon elle disparaît, car `correctionDetaillee` remplace l'ancien corrigé. Jamais dans l'énoncé ni la version aménagée. |
| `bareme` | `reponseFinale`, `criteres` (poids, somme ≈ 4, `sousQuestion` = étape), `erreursFrequentes` (avec `cout`), `reponsesAcceptees`. |
| `enoncePapier` | `EnoncePapier` : `section` (énoncé + consigne globale ; `questions: []` sauf vraies questions), `etapesParQuestion` (lettres d'étapes couvertes par chaque question papier), `reponseBreve` alignée si celle de l'adaptateur est découpée par étape. |
| `dureeMinutes` | Durée indicative d'une instance en évaluation. |

Toutes les valeurs viennent des MÊMES fonctions que l'écran interactif (`formatReponseAttendue…`,
`consigneEcran`, aides) — jamais une seconde source recalculée à part.

Le pipeline (`lib/evaluationLocal.ts::appliquerEnoncePapier`) fait le reste : énoncé imprimé tiré de
`enoncePapier`, `etapesCorrige` (titres « Étape n — consigne » du corrigé, préfixe « Étape n (…) — »
retiré), critères rattachés à leur étape (`etape`), renvois « 0 pt sur a) et b) » réécrits en « sur
les étapes 1 et 2 » (ou en lettre de question papier).

## Tirage équilibré des évaluations (décisions de l'utilisateur)

- Par défaut, une ÉVALUATION ne tire que des exercices **complets** (tous les paramètres présents,
  toutes les étapes à faire) : plus de « sans déphasage », « sans décalage vertical », équation sans
  solution réglée en une ligne… tirés au hasard. La feuille d'exercices garde toute la variété, les
  générateurs interactifs aussi.
- Case **« Inclure un cas particulier »** par générateur (page de conception) : la DERNIÈRE instance
  de la ligne est alors un cas particulier simple, le **même dans toutes les séries** (fixé par la
  série A).
- **Calculatrice interdite** → seulement des valeurs exactes / remarquables ; **autorisée** →
  seulement des cas qui exigent la calculatrice (pas d'angles ni de valeurs remarquables).
- Contrat : `profilInstance(instance) → { casParticulier: string | null, calcul?: 'exacte' |
  'calculatrice' }` + `libelleCasParticulier` (texte de la case). Plusieurs caractéristiques →
  identifiants joints par « + » (jamais tirés pour la case). Rien d'autre à faire : le pipeline
  (`evaluationLocal.ts::graineInedite`) cherche une graine dont la PREMIÈRE instance respecte la
  contrainte — le QR code rouvre donc le même exercice sans changer l'appli. Paliers de repli :
  contrainte complète → exercice complet (cas introuvable) → sans calculatrice → sans contrainte.
- **Paramètres au choix** (idée de l'utilisateur) : quand les cas particuliers sont des PARAMÈTRES
  neutres (amplitude 1, pulsation 1, sans déphasage, sans décalage vertical ; translations ou
  étirement absents ; a = 0, b = ±1…), le panneau propose une case par paramètre (« Paramètres à
  inclure », toutes cochées) au lieu de la case unique : `parametresAuChoix: { id, label }[]`, `id`
  = marqueur d'absence du profil. Une case décochée impose l'absence de CE paramètre dans toutes les
  questions de la ligne et toutes les séries (ensemble exact des absents). Seulement pour des
  paramètres présents dans TOUTES les variantes du générateur (sinon garder la case unique).
- **Réglages PAR VARIANTE** (décision de l'utilisateur) : les cases « Paramètres à inclure » et
  « Inclure un cas particulier » sont propres à CHAQUE variante d'un générateur (sous-rangée sous
  la variante, dès qu'elle a au moins une question). Bouton « + Même variante, autres réglages » :
  copie la variante (clé « id~2 », « id~3 »… dans `parVariante`, `varianteDeCle` rend l'id réel)
  pour mettre, dans la même évaluation, un graphe avec translation horizontale et un autre sans.
  `LigneSelection.parametresExclusParVariante` / `casParticulierParVariante` ; l'ancien réglage de
  ligne reste lu pour les plans enregistrés (`reglagesVariante`). Le cas particulier va sur la
  dernière question de SA variante.
- **Un verdict n'est jamais un cas particulier** : si la question est de DÉCIDER (données
  cohérentes ou non, une ou deux valeurs de q, nature d'une suite, existe/n'existe pas quand c'est
  la question), filtrer une issue rendrait la réponse prévisible. Est particulier ce qui
  RACCOURCIT la résolution (équation sans solution réglée en une ligne, données directes…).
- **Même structure dans toutes les séries** : la série A fixe, question par question, le cas
  particulier et le TYPE de question (`ProfilInstance.forme`, ex. gen38 : centrage / dispersion /
  interprétation / lecture) ; les autres séries reproduisent cette structure avec d'autres nombres.
  Paramètres au choix et cas particulier coexistent (gen1 : case « racines irrationnelles » +
  case « équation incomplète ») ; `parametresNonApplicables` pour une instance où un paramètre est
  sans objet (racines irrationnelles en mise en évidence généralisée).
- `calculatriceIndispensable: true` pour un générateur dont toutes les instances exigent la
  calculatrice : le panneau avertit si le professeur choisit « calculatrice interdite ».
- Recherche de graine bornée par le temps (200 ms par palier) : les cas rares (σ entier, combinaison
  précise de paramètres) sont trouvés sans bloquer le panneau. Un cas particulier va sur la DERNIÈRE
  question de la ligne qui peut le recevoir (cas propre à une seule variante).
- Pour chaque chapitre : mesurer (≥ 5 000 tirages par variante) la part des cas particuliers et des
  cas « calculatrice », écrire le profil, vérifier avec un plan réel (2 séries, calculatrice
  interdite/autorisée, case cochée ou non). Modèle : `5e-4h/generateurs5e/profilsEvaluationTrigonometrie.ts`.
- **Durée estimée** : imprimée seulement si le professeur coche « Afficher la durée estimée »
  (`EnTeteEvaluation.afficherDuree`, défaut : non).

## Registre et code d'exercice

- Dans `lib/evaluationAdapterRegistry.ts`, envelopper chaque adaptateur du chapitre :
  `versionPapier(adaptateur…)` (`export/consignePapier.ts`) — réécrit les tournures d'écran :
  « CORRECTE de l'étape précédente » → « obtenue à l'étape précédente », « choisis le verdict »,
  « sélectionne le graphique », syntaxe de saisie (« sqrt(…) », « 3,2e-4 », rappel ln(…)/ln(…)).
  Ajouter une règle à `REECRITURES` si un nouveau chapitre a sa propre tournure d'écran.
- **QR code / `?code=`** : chaque appli du chapitre lit `lireCodeDepuisUrl()` et tire sa première
  instance via `genererAvecCode(code, CATALOGUE, genererLibre, genererVariante)` avec les MÊMES
  fonctions que l'adaptateur (`codeExercice.ts`, graine mulberry32 + indice de variante) — sinon le
  QR code de la feuille rouvre un autre exercice. Modèle : `6e-6h/App6gen14.tsx` (l. 52–74).

## Vrai/faux et démonstrations

- Vrai/faux générés localement depuis la banque du quiz du chapitre (`lib/banquesVraiFaux.ts`) ;
  jamais de « grand calcul » (voir `.claude/rules/quiz-generators.md`).
- Questions « démonstration » : énoncés soignés `ENONCES_DEMONSTRATION` (`lib/evaluationPayload.ts`)
  appariés **par clé** à leur bloc d'exemple ; ajouter le chapitre à `CHAPITRES_ENONCES_VERIFIES` pour
  que `scripts/verifier-enonces-evaluation.mjs` fasse échouer le build en cas de dérive.

## Textes : écran vs papier

- Aides et rappels : **aucune formule écrite au clavier** (« Q0·r^t », « ln(x^x) », « e^(−rt) »,
  « log_base(A·B) », « e^{…} », « (a+b)/2 ») — le texte est une phrase qui se termine par « : », la
  formule va dans la partie LaTeX (`AideAvecLatex.latex`, ou fragment `latex(...)`).
- Consigne globale autosuffisante : ajouter ce que l'écran donnait ailleurs (modèle y(t) = k/(1+a e^{−rt})
  pour la logistique, discussion « a > 1 / 0 < a < 1 », précision d'arrondi…).

## Mise en page (`export/assemblerEvaluationHtml.ts`)

Document A4 à largeur fixe (`body` 21 cm, viewport `width=820` : le téléphone dézoome au lieu de
réagencer ; en impression le body reprend la largeur imprimable). Formules display qui défilent dans
leur bloc, `overflow-wrap: anywhere` dans les blocs. Corrigé : une question longue se coupe ENTRE deux
étapes (`.question:has(.correction-bloc)`, `.corr:has(.etape-titre)`), jamais de page blanche.

## Vérification avant de pousser

1. Collecteur esbuild sur les adaptateurs (≥ 80 tirages + chaque variante) : relire les énoncés
   papier par famille ; chercher « CORRECT », « étape précédente » dans l'énoncé, « sur a) », notation
   clavier (`^`, `sqrt`, `log_`, `e^`) dans le corrigé et le barème.
2. Documents RÉELS via le pipeline : Vite (config `vite.nowatch.mjs`, port dédié, tuer par PID exact
   — `npx` lance un enfant, vérifier avec `ps` que l'ancien serveur est mort avant de relancer), puis
   `import('/src/lib/evaluationLocal.ts')` dans Playwright → `genererDocumentsDepuisPlan(plan)` en
   mode `exercice` et `evaluation`, `versionAmenagee: true`, plusieurs graines.
3. Débordements : 0 à 680 px impression (largeur imprimable A4) et 1280 px ; téléphone émulé
   (scrollWidth = 820) ; rendu PDF A4 relu à l'œil (en-tête, QR codes, corrigé, grille).
4. `npm run build` (inclut `verifier-enonces-evaluation`).
5. Rappeler à l'utilisateur que les fichiers déjà téléchargés sont des copies figées : regénérer.
