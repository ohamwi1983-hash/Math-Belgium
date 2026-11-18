---
paths:
  - "src/entrainement/export/**"
  - "src/entrainement/**/exportEvaluation.ts"
  - "src/lib/evaluationLocal.ts"
  - "src/lib/evaluationRemediation.ts"
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
  La case « Inclure un cas particulier » ne s'affiche que sous une variante qui PEUT en recevoir
  un (`evaluationLocal.ts::varianteAdmetCasParticulier` : même tirage et même budget de 200 ms que
  le moteur, résultat mis en cache) — ex. gen42 : seulement « angle avec Ox/Oy ». Une variante sans
  paramètre au choix ni cas possible n'a pas de sous-rangée.
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
- **`forme` = signature de difficulté** quand le générateur combine librement des briques (gen72 :
  forme des ensembles + nombre de translations/symétries/dilatations par ensemble, jamais l'ordre
  exact) : la recherche de graine est aléatoire (20 000 essais, 200 ms), donc mesurer la fréquence
  de la forme au 1er centile et brider le générateur si une forme rare deviendrait introuvable pour
  les séries B, C… (`4e/generateurs/transformationsEnsembles/profil.ts`). Le pipeline mélange
  l'ordre des questions d'une série à l'autre : comparer les structures sans tenir compte de l'ordre.
- **Anti-doublon entre séries** (`evaluationLocal.ts::empreinteSection`) : empreinte de l'énoncé
  (fragments, consignes, `enteteHtml`). Les identifiants SVG (`id="…"`, `url(#…)`, `href="#…"`) y
  sont neutralisés — une figure à compteur global (`ri12`, `ig3`…) dans `construireEnonce` ne rend
  donc plus deux énoncés identiques « différents » (bug trouvé par 6gen83).
- **Durée estimée** : imprimée seulement si le professeur coche « Afficher la durée estimée »
  (`EnTeteEvaluation.afficherDuree`, défaut : non).

## Graphiques de transformation sur papier (gen8, gen10 — décision de l'utilisateur)

L'écran marque le point caractéristique et le « point croix » et donne leurs coordonnées ; sur
papier, l'énoncé n'a que la COURBE (aucun point marqué, aucune coordonnée dans le texte). Le
cadrage (`export/cadrageLisible.ts`) choisit le pas du quadrillage (1/dénominateur des écarts au
point caractéristique) et le zoom pour que le point caractéristique ET le point croix tombent sur
des intersections ; graduations écrites aux seules valeurs entières (lignes entières plus marquées,
`GrilleSvg` de `svgGraph.ts`). Le corrigé garde les points étiquetés et raisonne avec le point croix.
Même exigence pour gen12 (lecture des caractéristiques, valeurs toutes entières) : fenêtre aux
bornes entières, quadrillage d'une unité, graduations tous les 1/2/5 sur des lignes marquées,
carreaux de 11 à 18 px (`cadreCaracteristiques`) — le pas automatique de 5 ou 10 laissait les
valeurs entre deux lignes. Tout graphique papier à LIRE doit vérifier que les valeurs demandées
tombent sur les lignes de sa grille.

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

- **Tous les vrai/faux d'une série forment UNE seule question** (décision de l'utilisateur), même
  s'ils viennent de sections ou de chapitres différents : « Question n — Vrai ou faux ? Justifie
  chaque réponse. a) … b) … », lettres continues, chaque affirmation garde les points de sa ligne
  (`evaluationLocal.ts::itemVraiFauxRegroupe`, placée au rang du premier vrai/faux). Notion et
  section du cours gardées si toutes les affirmations viennent de la même section, sinon « Vrai ou
  faux ». Vaut pour la feuille d'exercices, l'évaluation, l'aménagée, le corrigé, la grille et le Word.
- **Lettre de la série en gras** (« Série **A** ») dans l'en-tête de la copie, du corrigé, de la
  grille, de l'aménagée et de la copie Word.
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
Énoncé : une question à une ou deux figures reste d'un bloc (sinon son texte restait seul en bas de
page) ; seules les questions à trois figures ou plus (`classeFigures` → `.figures-multiples`) se
coupent entre leurs figures. Les SVG internes de KaTeX (racines, flèches : largeur en `em`/`%`) ne
comptent pas comme figures (`balisesFigures` ; trois racines carrées faisaient une question « à trois
figures »).

Décisions de l'utilisateur (maquettes validées, lots A1–A4) :
- **Points d'une sous-question / affirmation dans une colonne à droite** (`.sq-pts` : texte en
  `flex: 1`, points `white-space: nowrap` ; colonne `td.pts-col` dans un tableau regroupé), jamais en
  fin de phrase où ils passaient seuls à la ligne. Copie, aménagée et copie Word (taquet droit).
- **Plus de MAJUSCULES d'insistance sur papier** (« la formule CONFIRMÉE », « ne change PAS ») :
  règle GLOBALE `export/majusculesPapier.ts`, appliquée par `fragmentsVersHtml` et
  `fragmentsVersRunsDocx` à TOUT texte imprimé (énoncé, consignes, corrigé, barème, vrai/faux,
  questions ouvertes ; HTML et Word), y compris les adaptateurs non enveloppés par `versionPapier`.
  Jamais dans les formules. Noms de points (ABC, (DEG), angle ROI₁), permutations (RBB, SSÉÉÉ), sigles
  (SOX, SOH-CAH-TOA, ASA, IPP, PGCD) et chiffres romains intacts — règles et mesure détaillées en tête
  du fichier. Un nouveau sigle ou mot-objet en capitales → l'ajouter à `SIGLES` ; une insistance
  courte (3–4 lettres) non reconnue → `MOTS_COURTS`. Re-mesurer sur un corpus (tous les adaptateurs,
  banques vrai/faux, questions ouvertes) : aucun nom de point ne doit apparaître dans les transformés.
- **Pied de page** sur chaque page (boîtes de marge `@page`, `stylePied`) : copie et aménagée
  d'évaluation « **Série A** · Nom : … » à gauche (la série en gras via `@bottom-left-corner` — une
  boîte de marge n'a qu'un style), « page n / N » à droite ; feuille d'exercices et aménagée de la
  feuille : « page n / N » seulement. Marge basse 1,5 cm. Firefox ignore les boîtes de marge.
- **Encadré « Consignes »** en tête de la copie d'évaluation et de l'aménagée (après le tableau des
  résultats) : « Réponds sur une feuille à part… ne rapporte pas tous les points. » + calculatrice
  autorisée/interdite + « Durée : n minutes. » seulement si `afficherDuree`. Jamais sur la feuille
  d'exercices. Même texte dans la copie Word (`TEXTE_CONSIGNES`).
- **Liste de données affichée** (« Données : \text{…},\ \text{…} », 6gen44/46/48) : une formule
  display ne se coupe jamais et sortait à 30 % de sa largeur ; une formule affichée de niveau 0
  découpable à ses « ,\ » / « ;\ » et longue (> 45 caractères visibles) est rendue en formules EN
  LIGNE séparées par leurs virgules (`formuleAfficheeHtml`, `genererFeuilleExercicesHtml.ts`).

## Options du document (cases du panneau, `EnTeteEvaluation`)

Toutes décochées par défaut ; un plan enregistré sans le champ se recharge avec « non ».

- **« Joindre le formulaire du chapitre en annexe »** (`joindreFormulaire`) : une page « Annexe —
  Formulaire : <chapitre> » à la FIN de la copie d'évaluation et de l'aménagée ; dans la feuille
  d'exercices, JUSTE APRÈS L'ÉNONCÉ, avant « Je vérifie » et le corrigé (décision de l'utilisateur :
  l'élève la consulte sans feuilleter le corrigé) — jamais dans le corrigé ni la grille. Une annexe par chapitre du
  plan qui a un `formulaire`, dans l'ordre du plan. Rendu `export/annexesPapier.ts::annexeFormulaire`
  (RichText → KaTeX, deux colonnes comme le « Formulaire seul » du site, une seule colonne dans
  l'aménagée).
  **Mécanisme générique d'annexes** : `AnnexeDocument` (`assemblerEvaluationHtml.ts`), liste
  construite par `evaluationLocal.ts::annexesDuDocument(plan, items)` et passée aux trois
  générateurs. Seconde annexe déjà décidée, PAS encore implémentée : une table de la loi normale Φ,
  ajoutée seulement si au moins une question du document en a besoin — écrire
  `annexeTableNormale()` dans `annexesPapier.ts` et l'ajouter dans `annexesDuDocument` quand un item
  le demande (par ex. un champ posé par l'adaptateur sur l'item).
- **« Économie de papier (deux colonnes) »** (`deuxColonnes`) : copie d'évaluation et énoncé de la
  feuille d'exercices seulement. Page nommée `@page compacte` (marges 0,9/1,2/1,4 cm, pour que
  « Je vérifie », le corrigé et les annexes gardent leurs marges), énoncés en deux colonnes
  (`STYLE_DEUX_COLONNES`). Cartouche, tableau des résultats et consignes pleine largeur ; les
  bandeaux de processus sont DANS la première question de leur processus (jamais seuls en bas de
  colonne). Règles mesurées sur des documents réels :
  - chaque exercice / question est un **inline-block** monolithique : avec `break-inside: avoid`
    seul, Chromium coupait une question entre deux colonnes quand la rangée commençait en milieu de
    page (sous une question pleine largeur) ; `orphans`/`widows` à 1 sur le conteneur, sinon deux
    questions (deux « lignes ») restaient dans la même colonne au lieu d'équilibrer ;
  - une figure est réduite à la largeur de la colonne (`svg[viewBox]` : `max-width: 100%`,
    `height: auto`) ; au-delà d'un seuil de largeur d'origine — 380 px pour la copie, 260 px pour la
    feuille (le QR code laisse ≈ 225 px au texte) — la question occupe toute la largeur
    (`.pleine-largeur`, `column-span: all`), comme les questions à trois figures ou plus ;
  - formule display trop large pour la colonne : passe à la ligne entre ses termes
    (`white-space: normal` sur `.katex`) ; QR code réduit à 52 px dans la feuille.
  JAMAIS pour la version aménagée, le corrigé, la grille ni la page « Je vérifie ».
- **Word** (`export/evaluationDocx.ts`, boutons « Word » du panneau sur la copie, le corrigé et la
  grille ; `evaluationLocal.ts::genererDocxDepuisPlan(plan, lettre, 'copie' | 'corrige' | 'grille')`) :
  même contenu que le HTML. Formules en images PNG (KaTeX rasterisé, comme la copie l'a toujours
  fait : `docx` n'écrit pas d'équation Word native) ; figures (`enteteHtml`, `figureHtml` du
  corrigé, blocs `html`) rasterisées en PNG. Pied de page Word (série, page n / N). Pas d'annexe
  formulaire ni de deux colonnes en Word.

## Feuille de remédiation en un clic (`lib/evaluationRemediation.ts`, décision C9)

Bouton « Feuille de remédiation » sous chaque évaluation / feuille ENREGISTRÉE (liste
« Enregistrements, import et historique » du panneau ; pas sous une remédiation). Formulaire :
questions de l'évaluation à cocher (aucune par défaut), « Exercices par question » (`Stepper` −/+,
1–6, défaut 2 — jamais de champ numérique), « Version aménagée en plus » (préremplie d'après le plan
d'origine), « Créer la feuille ». Résultat : une FEUILLE D'EXERCICES ordinaire (mode `exercice`,
une série, rendue par `genererDocumentsDepuisPlan` : énoncé, « Je vérifie », corrigé détaillé, QR
codes, aménagée si cochée) intitulée « Remédiation — <titre sans « Évaluation — »> ».
- **Numérotation = copie de la série A** (`questionsRemediables`) : mêmes règles que
  `itemsDepuisSerie` + `grouperParProcessus` — items rangés par processus (tri stable), TOUS les
  vrai/faux de la série = UNE question au rang du premier. À garder synchronisé si ces règles changent.
- **Exercice** : n exercices de la MÊME variante, avec la contrainte reconstruite depuis le profil de
  l'instance d'origine (`contrainteDepuisOrigine` : cas particulier exact, ensemble exact des
  paramètres absents, `forme`, calculatrice de l'évaluation). Graines neuves (`graineRemediation`) :
  jamais un énoncé de l'évaluation (TOUTES les séries, empreinte `empreinteSection`), jamais deux fois
  le même dans la feuille ; paliers : moteur `graineInedite` → même contrainte en recherche directe →
  même variante sans contrainte → exercice OMIS. Des variantes n'ont que 1 à 9 énoncés (6gen38 « n3 » :
  1 ; « cos seul » : 4 ; gen57 « produit d'entiers consécutifs » : 3) : plutôt moins d'exercices
  qu'une répétition ; `plan.remediation.incompletes` et le message du panneau le signalent. Question
  regroupée a)/b)/c) (`regroupable`) : reprise en entier, n fois.
- **Vrai/faux** : d'autres affirmations des mêmes thèmes, n × le nombre d'origine par thème ; celles de
  l'évaluation (toutes séries) seulement si la banque n'en a pas assez (`piocherIndices`).
- **Questions ouvertes** (« Formule », démonstration, compréhension) : la même question, une fois —
  mention « Même question reprise une fois (pas d'autre tirage possible) » dans le formulaire.
- En-tête hérité : `joindreFormulaire` (annexe des seuls chapitres des questions retenues),
  `deuxColonnes`, `afficherTitresSection`, surtitre/chapitre ; pas de numéro, de calculatrice ni de durée.
- Plan `PlanDocument.remediation` (`titreSource`, `questions`, `exercicesParQuestion`) : la feuille
  s'enregistre / s'exporte comme un autre plan (boutons habituels) ; « Recharger » rend ses documents
  sans toucher à la sélection du panneau (ses `lignes` sont celles de l'évaluation d'origine). Elle
  n'est pas enregistrée automatiquement ; ses exercices vont dans l'historique comme toute génération.
- Vérifié (Playwright, 5 chapitres 4e/5e/6e, toutes questions, n = 3) : numérotation identique à la
  copie A, mêmes générateurs/variantes/profils, 0 énoncé repris, 0 doublon, vrai/faux disjoints.

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

## Onglet « Connaître » : « Formule » et « Formule + démonstration » (décision utilisateur)

L'ancienne ligne « Questions ouvertes — formules / démonstrations » est remplacée par DEUX types
(`TypeQuestionEvaluation`) :
- **`formule`** — « Formule » : les formules du **formulaire** de fin de chapitre
  (`deriveQuestionsFormules`, `lib/evaluationPayload.ts`). Énoncé : membre de gauche à compléter
  (« Complète la formule (condition) : $s = \ldots$ ») ; pour une règle sans « = », ce qui suit le
  premier séparateur hors formule (« : », « → », « ⟺ », « ⟹ ») est masqué ; sinon la condition
  sert de description ; une simple propriété sans rien à compléter est écartée. Corrigé : la formule
  et sa condition. Rattachement à une section : la PREMIÈRE section où la formule (premier morceau
  contenant « = », ≥ 6 caractères) apparaît telle quelle, sinon le meilleur score de jetons rares
  (+ titre du groupe ↔ titre de section) ; les sections « Révision » ne sont jamais candidates.
  `ChapitreAvecSections.formulaire` doit être passé par le panneau.
- **`demonstration`** — « Formule + démonstration » : uniquement les blocs `exempleLibre` dont le
  label commence par « Démonstration » (`estBlocDemonstration`). Les exemples résolus (calculs)
  ne sont PLUS proposés dans Connaître (ils relèvent d'Appliquer) ; leurs énoncés par clé restent
  dans `ENONCES_DEMONSTRATION` (contrôlés au build) mais ne sont plus tirés.
Un plan enregistré avant ce changement est complété au chargement (lignes manquantes ajoutées
depuis `lignesInitiales`, lignes enregistrées reprises telles quelles).

### Énoncés de démonstration et choix des questions (décisions de l'utilisateur)

- **Énoncé = ce qu'il faut démontrer, jamais la méthode.** Pas de « en complétant le carré »,
  « à l'aide de Pythagore », « en posant… », « par l'absurde », « en démontrant les deux sens »…
  Restent : les hypothèses et notations nécessaires, les vraies sous-questions (« puis déduis-en… »)
  et, quand le résultat serait sinon une formule à réciter, le cadre imposé (« à partir de la
  définition du nombre dérivé »). Deux démonstrations d'un même résultat ont alors le même énoncé :
  le tirage au hasard n'en prend qu'une (`sansDoublonsEnonce`).
- **Choix explicite** (`LigneSelection.choix`, ids `QuestionOuverte.id`) : bouton « Choisir » sur les
  lignes « Formule » et « Formule + démonstration » — liste à cocher (titre du bloc, énoncé, nombre
  d'étapes du corrigé). Questions cochées = exactement celles-là, les MÊMES dans toutes les séries.
  **Points par question choisie** (`LigneSelection.pointsParChoix`, `QuestionOuverte.points` dans le
  payload) : une démonstration longue peut valoir plus qu'une courte ; la colonne « Points » de la
  ligne affiche alors la somme (lecture seule).
- **Sans choix**, « Formule » et « Formule + démonstration » sont aussi tirées une seule fois pour
  toutes les séries (équité : jamais une démonstration longue pour A et une courte pour B). La
  « compréhension » garde un tirage par série.
