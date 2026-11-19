---
paths:
  - "src/entrainement/export/**"
  - "src/entrainement/**/exportEvaluation.ts"
  - "src/entrainement/**/corrigeDetaille.ts"
  - "src/entrainement/components/CorrigeDetailleEcran.tsx"
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
| `criteresDifficulte` | Critères du NIVEAU 1–7 de l'instance (étapes, méthode, piège, nombres) : voir « Niveau de difficulté et durée » plus bas. Remplace les étoiles `difficulte` et la constante `dureeMinutes`. |
| `reponseBreve` | Résultat seul (page « Je vérifie »). Pas de lettres a)/b) si l'énoncé papier n'en a pas. |
| `correctionDetaillee` | `EtapeCorrection[]` : `label` court (Méthode, Calcul, Condition, Conclusion, Piège…), `sousQuestion` = lettre de l'ÉTAPE (« a », « b »… dans l'ordre des écrans). Une ligne « Piège » ciblée. Format « comme au tableau » (typé, calculs alignés) : voir la section dédiée plus bas — obligatoire pour tout chapitre migré. |
| `EtapeCorrection.figureHtml` | Figure SVG autonome sous une ligne du corrigé : tout exercice dont la réponse est un GRAPHIQUE (polygone des effectifs cumulés avec lecture de Q₁/Q₂/Q₃, boîte à moustaches attendue, courbes annotées…) la montre dans le corrigé détaillé — sinon elle disparaît, car `correctionDetaillee` remplace l'ancien corrigé. Jamais dans l'énoncé ni la version aménagée. |
| `bareme` | `reponseFinale`, `criteres` (poids, somme ≈ 4, `sousQuestion` = étape), `erreursFrequentes` (avec `cout`), `reponsesAcceptees`. |
| `enoncePapier` | `EnoncePapier` : `section` (énoncé + consigne globale ; `questions: []` sauf vraies questions), `etapesParQuestion` (lettres d'étapes couvertes par chaque question papier), `reponseBreve` alignée si celle de l'adaptateur est découpée par étape. |

Toutes les valeurs viennent des MÊMES fonctions que l'écran interactif (`formatReponseAttendue…`,
`consigneEcran`, aides) — jamais une seconde source recalculée à part.

Le pipeline (`lib/evaluationLocal.ts::appliquerEnoncePapier`) fait le reste : énoncé imprimé tiré de
`enoncePapier`, `etapesCorrige` (titres « Étape n — consigne » du corrigé, préfixe « Étape n (…) — »
retiré), critères rattachés à leur étape (`etape`), renvois « 0 pt sur a) et b) » réécrits en « sur
les étapes 1 et 2 » (ou en lettre de question papier).

## Niveau de difficulté et durée (décision de l'utilisateur)

Les étoiles ★/★★/★★★ (posées au jugement) sont remplacées par un **NIVEAU 1–7** calculé par une grille
commune, affiché « numéro + palier », et la durée constante par générateur par une **durée PAR
EXERCICE** calculée avec les mêmes critères. Module commun `export/niveauDifficulte.ts`
(`niveauEtDuree(adaptateur, instance) → { niveau, palier, score, criteres, dureeMinutes, provisoire }`,
testable seul) ; contrat `criteresDifficulte(instance) → CriteresDifficulte`
(`genererFeuilleExercices.ts`).

- **Score par exercice** (instance tirée), niveau = score + 1 (1 à 7 ; le 7 est gardé). **Paliers** :
  Base 1–2, Intermédiaire 3–4, Avancé 5–7 (`palierDuNiveau`).
- **Étapes (0/1/2)** : étapes « qui transforment » (calcul, raisonnement) — une lettre `sousQuestion`
  du corrigé détaillé = un écran (`etapesDuCorrige(corrigé, lettresDeLecture)`, corrigé sans lettre →
  1 étape). Les écrans de **pure lecture** (lire une valeur, un point, une caractéristique sur un
  graphique ou un tableau ; placer un point) ne comptent pas : gen12 (tous), gen70 (tous : identifier
  la caractéristique puis la lire), 6gen95 a–c, 6gen98 c–d, gen10 a–b, gen69 a–b, 6gen85 a–b
  (« associer » : tous), 6gen82 « lecture » b, gen71 « courbe » b–d. **Charge** ajoutée par le module :
  une étape de plus de **9** lignes de calcul (`EtapeCorrection.calcul`, mêmes fonctions que le papier ;
  corrigé non typé : chaînes éclatées par `lignesDepuisChaine`) compte pour 2, de plus de **15** pour 3
  (`SEUILS_CHARGE`). Calibrage mesuré : 6/12 touchait 31 % des tirages, 8/14 17 %, 9/15 13 % et fait
  monter les cas visés (6gen34 E 1 → 2, 6gen40 D_rotation/D_similitude 2 → 3, 6gen78 valeurs 2 → 3).
  Puis étapes équivalentes 1–2 → 0, 3–5 → 1, 6+ → 2. Corrigé pas encore « comme au tableau » :
  `lignesMinimales` déclare les lignes qu'aurait l'étape au tableau (plus utilisé : 6gen21 l'a perdu
  à sa migration, charge mesurée sur le corrigé, durée moyenne 22,6 → 14,9 min).
  Écrans répétitifs (5gen15, décision de l'utilisateur) : les étapes de la SECONDE suite (phases
  « …B2 », mêmes calculs avec l'autre raison) comptent comme des lectures (1 min, sans niveau) ; un
  écran « termes proches » (u₂, u₃, u₄… calculés de la même façon) est une étape SANS charge
  (`lettresSansCharge`). Effet : « principal » 16,8 → 14,9 min en moyenne, maximum 25 → 21.
  gen72 : une transformation de la chaîne = une étape, `sansCharge`.
- **Méthode (0/1/2)** : 0 imposée/évidente ; 1 choisir parmi les méthodes du cours ; 2 l'élève
  construit lui-même le modèle ; formule du contexte / fonction donnée → au plus 1.
- **Piège (0/1)** : seulement s'il est dans les DONNÉES (signe/quadrant, valeur exclue, ordre, cas
  qui n'en est pas un, solution à rejeter) — jamais parce que le corrigé a une ligne Piège ; lu dans
  l'instance quand il en dépend (6gen26 f négative, 6gen34 G exposant négatif, 6gen37 A / 6gen39 B
  a < 0, 5gen16 suite qui oscille, gen72 symétrie).
- **Nombres (0/1)** : calculatrice (profil), ≈ / arrondi / environ, ln ou log d'un nombre ≠ 1 et ≠ 10,
  e^(nombre), angle kπ/n non remarquable (`anglesEnPi`, ch. 5 de 6e) → 1 ; fractions, radicaux,
  décimaux exacts → 0. Absent de `criteresDifficulte` → détecté sur la réponse brève et les lignes
  Calcul/Résultat du corrigé (`nombresDuCorrige`).
- **Durée (min)** = 2 + 2 × étapes équivalentes (charge comprise) + 1 × écran de lecture + 1 si
  Nombres + 2 si Méthode = 2 ; le piège n'ajoute rien. Item = somme des durées de ses exercices
  (`evaluationLocal.ts::dureeItem`) ; copie (« Afficher la durée estimée ») = somme des items arrondie
  aux 5 min. Panneau : estimation par variante avant tirage (`dureeEstimeeVariante`, moyenne de
  6 tirages, en cache) × nombre d'exercices.
- **Affichage** (maquette E) : cadre du NUMÉRO puis cadre du PALIER (« 5 » « Avancé »), noir et blanc
  (`niveauHtml`, `.niveau .num/.pal`) en tête de chaque exercice de la feuille et de sa version
  aménagée ; légende en tête de la feuille « Niveau 1 à 7 : Base 1–2 · Intermédiaire 3–4 · Avancé
  5–7. Il monte avec… ». Rien sur la copie d'évaluation ni en Word (les étoiles n'y étaient pas).
- **Chapitres notés** : 6e ch. 5, 6e ch. 4, 4e ch. 3, 6e ch. 3, 5e ch. 3 (ni `difficulte` ni
  `dureeMinutes` : `criteresDifficulte` seul). **Conversion PROVISOIRE** pour les autres adaptateurs
  (non encore notés) : leurs étoiles → niveau ★ 2, ★★ 3, ★★★ 5 (palier conservé), durée = leur
  constante `dureeMinutes` ; sans étoiles → rien d'affiché. Vrai/faux : niveau 2 (Base), provisoire.
- **Noter un nouveau chapitre** : pour chaque adaptateur, juger méthode et piège par variante (sur
  l'énoncé PAPIER), repérer les écrans de pure lecture, écrire
  `criteresDifficulte(e) = { ...etapesDuCorrige(correction(e), lecture), methode, piege }` (même
  enveloppe que les autres champs, ex. `avecFractionsNormalisees`), retirer `difficulte` et
  `dureeMinutes`, puis mesurer (≥ 200 tirages libres + 30 par variante, `niveauEtDuree`) : répartition
  des niveaux, durées, cas extrêmes (outil du chantier : `verif.ts`, dossier de travail, à recopier).

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
  (`EnTeteEvaluation.afficherDuree`, défaut : non) — somme des durées par exercice (voir « Niveau de
  difficulté et durée »).

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

## Corrigé détaillé — comme au tableau (pilote : 6e, chapitre 5)

Décision de l'utilisateur (maquette validée) : le corrigé détaillé des feuilles d'exercices et des
évaluations ne saute plus d'étape. **Chapitres migrés** : 6e ch. 5 (pilote, 6gen34–42, 6gen93–99) ;
4e ch. 3 (gen10–13, gen68–72 — voir « Lectures graphiques et décisions » plus bas) ; 6e ch. 4
(6gen23–29, 6gen77–84) ; 5e ch. 3 (5gen14–19, 5gen44–49) ; 6e ch. 3 (6gen13–22, 6gen85–92). Les autres adaptateurs s'affichent comme avant (contrat rétrocompatible).
- 4e ch. 4, moitié 1 (gen30–36, notés : `criteresDifficulte`) : briques `4e/ui/corrigeStatistique1.ts` (`COURS_*` § 1–7, `lignesSomme` / `lignesSommeProduits` — membre de droite ≤ 26 caractères visibles, sinon paquets « a+b+c=P » de gauche ≤ 18 : la colonne du milieu ne fait que ≈ 230 px à 680 px —, `couperSiLongue`, `ligneSeuil`, `ligneFrequence` « ×100 % = 20 % », `formulesInsecables` : formules des lignes de texte groupées `{…}`, sinon « h₁ = 32 % » se coupait après « = » en fin de ligne) ; une lettre par ÉCRAN (gen33 : 4 / 5 étapes, Q₁ et Q₃ séparés ; gen35 : 11 / 13 étapes, `etapesParQuestion` groupe les écrans par vraie question, ordre « classes » des questions = ordre des écrans) ; constructeurs d'étapes de gen32/33/34/36 réutilisés par gen35 sur l'exercice « mappé » ; figure de la boîte sortie dans `boiteMoustaches/figure.ts` (sans `docx`) ; lectures (min/max/mode, sommets du polygone, boîte tracée) comptées comme écrans de lecture.
- 6e ch. 4, 6gen23–29 : briques `6e-6h/ui6e/corrigeIntegrales1.ts` — substitution `substituer`,
  `[F]ₐᵇ` en `\Big[…\Big]` puis F(b) − F(a) substitué (`lignesCrochet`, `lignesIntegralePoly` ;
  quand cette ligne dépasserait ≈ 48 caractères visibles, F(b) et F(a) sont calculés chacun sur leur
  ligne AVANT, puis « … = F(b) − F(a) = valeurs »), rationnels `Q`, trinôme, carré développé, `entoure`
  (`\Big(` au-delà de 14 caractères) ; 6gen23 réutilisé par 6gen24/25 via `etapesPhasePrimitive`.
  Étape « signe » : le résultat nomme chaque intervalle (« f ≥ 0 sur ]−2 ; 1[ »), jamais « f ≥ 0, f ≤ 0 » seul.
  **Valeur arrondie ou exacte = UNE fonction pour l'écran, le corrigé et la vérification**
  (`moteur6e/valeursIntegralesProblemes.ts`, 6gen29) : surplus (famille F) calculé avec Q et P
  arrondis au centième (`equilibreArrondiF`), écrit au centième dans le corrigé, réponse = cet arrondi
  au dixième (`surplusAuDixiemeF`, « S ≈ 28,9 » ; Q, P écrits « 3,96 ») ; vérification à un
  demi-dixième de ce surplus OU du surplus exact. Archimède : fraction débordée EXACTE en entiers
  (`fractionDebordeeArchimede`, 8r³/(3k²L²)) puis « = » décimal exact (≤ 6 décimales) ou « ≈ » trois
  chiffres significatifs (`fractionDebordeeLatex` : « 2/1875 ≈ 0,00107 ») ; consigne « fraction exacte
  ou trois chiffres significatifs » (écran et papier), tolérance relative 0,6 % (l'ancienne tolérance
  absolue 0,01 acceptait 0 pour un tiers des tirages). 6gen81 « fonction donnée » : un coefficient
  imprimé est TOUJOURS exact — tirage refait si c = a·(W/2)² a plus de 4 décimales (8,26875 était
  imprimé 8,2688 : les pieds ±5,25 n'étaient plus racines) ; contrôle sur 3 000 tirages par variante :
  coefficients imprimés relus en rationnels = coefficients du modèle, f(pieds annoncés) = 0 exactement.
  6gen81, intégrale (mur, section, parcelle) : coefficients, primitive, F(b), F(a) et aire EXACTS,
  calculés en rationnels depuis les données (`moteur6e/modeleAiresFormesReelles.ts::coefficientsExacts`,
  `integraleExacte`, `aireExacte` ; `aireCourbe` de la parcelle = cette fraction) — relire un flottant
  en fraction (tolérance 1e-7) donnait des fractions VOISINES mais fausses (F(6,5) « 11953/321 »,
  aire « 2895/68 »), et la parcelle « à retrouver » écrivait la primitive avec −0,0159x³ (écart de
  0,006 à 0,009 sur l'aire). Corrigé : « f(x) = » développée, « F(x) = », 𝒜 = ∫ f, = F(b) − F(a),
  = valeurs (fractions), = fraction réduite ≈ arrondi (au centième pour la parcelle, comme la
  consigne) ; c écrit « = −55/1152 ≈ −0,0477 » ; conversion en m² et valeur du terrain à partir de
  la fraction. Écran (réponse attendue, aide « une primitive de f ») : mêmes fonctions. Collecteur en
  mode strict (« = » à 1e-11 près, F(x) = ∫₀ˣ f recalculée à part) : 0 égalité fausse sur 400 tirages
  de la variante et 3 500 tirages (500 par variante) ; niveaux et durées inchangés (2 100 tirages).
  Trouvés par le même contrôle : volume de la gouttière en cm³ écrit au centième avec « = » → « ≈ »
  s'il n'est pas exact ; fraction de `valeurContexteTex` gardée seulement si elle est juste à 1e-9
  (« 204374/11 » pour un volume de tunnel de 18 579,456 m³).
  6gen23/24/25, sous-type G3 : coefficients A, B, **D** de `A/x + (Bx + D)/(x² + 1)` (champ `D` du
  type) — C reste la constante d'intégration, comme dans le cours ; la saisie « Bx + C » de la
  décomposition (sans D) reste acceptée, « + C » / « + K » en fin de primitive aussi.
- 6e ch. 4, 6gen77–84 : briques `6e-6h/ui6e/corrigeIntegrales2.ts` (renvois `COURS_*` § 1–7,
  `crochet`, `integraleTexte`, `lignesDepuisJustification` — justification rédigée éclatée en lignes,
  condition « pour / sur / car » rattachée à la ligne précédente) ; collecteur `corrige-6e4-m2` : ∫ par
  quadrature (Simpson, découpée aux entiers), crochets [F]ₐᵇ, ≤/≥/≈ contrôlés, unités converties.
- 5e ch. 3, 5gen44–49 : briques `5e-4h/ui5e/corrigeSuites2.ts` (renvois `COURS_*` § 1–4, rationnels,
  `lignesSommeArithmetique`, `sansRepetition`) ; identités en n (uₙ₊₁, u₂ₙ, uₙ₊₁ − uₙ) vérifiées pour TOUS les n
  candidats, termes `u_{…}` évalués depuis la suite de l'instance (collecteur `corrige-5e3-m2`). 5gen46 : coefficients
  du trinôme notés α, β, γ (a, b, c = les trois termes) ; `equationSimplifiee` divise exactement (plus de 0,999…x).
- 5e ch. 3, 5gen14–19 : briques `5e-4h/ui5e/corrigeSuites1.ts` (`COURS_*` § 1–6, rationnels `Q`,
  `lignesPremierDegre` avec ligne « même dénominateur », `lignesSommeGeometrique` en `\frac` intérieurs
  comme le cours, `fragmentsListe` : un résultat à plusieurs valeurs = une formule par valeur, sinon la
  liste passait à la ligne dans la formule) ; parenthèses simples, jamais `\big(` (« \big(−18 » rendait
  un moins binaire). 5gen14 : l'appli passe `ordreComplet` (la famille « cohérence » a 3 étapes papier
  mais 7 écrans). Collecteur `corrige-5e3-m1` : limites `\lim_{n\to+\infty}` évaluées en n = 10⁹,
  inégalités contrôlées, ≈ toléré à la demi-unité du dernier chiffre écrit (notation scientifique
  comprise), coupure d'une formule DANS une cellule détectée (`.katex-base` qui repart à gauche).
- 6e ch. 3, seconde moitié (6gen22, 6gen85–92) : briques `6e-6h/ui6e/corrigeLogarithmes2.ts` (`COURS_*` § 1–10, `dec`/`vaut`/`sci`,
  `fragmentsAide`) ; chaînes de l'écran (`fiche(e).calculs`, `chaineEquation`, `resolution`) éclatées aux « = », « ≈ », « ⟺ » ;
  valeur arrondie : le corrigé calcule avec les valeurs NON arrondies de la chaîne de l'écran (6gen89 `chaineLinearisation`,
  6gen22 B/C), jamais « arrondis substitués ≈ résultat exact » ; 6gen87 : dérivée ligne à ligne (`FonctionTangente.lignesDerivee`).
- 6e ch. 3, première moitié (6gen13–21) : briques `6e-6h/ui6e/corrigeLogarithmes1.ts` (`COURS_*` § 1–9, `parN`,
  `sommeTermes`, `logBase`) ; `finaliserCorrige` = `fractionsLisibles` (`\frac` → `\dfrac` hors indices/exposants),
  `typoLog` (« log », jamais `\log_{10}`), `justificationsInsecables` (formule d'une justification en groupe `{…}` :
  elle ne se coupe plus dans la colonne étroite). 6gen13 : valeur connue remplacée AVANT de distribuer ; chaîne trop
  longue (> 28 car. pondérés avec son membre de gauche) → « Sur le logarithme qui reste » puis « Dans l'expression
  complète ». Collecteur `corrige-6e3-m1` : `\lim` (point lointain + second essai pour 1^∞), `\log_b`, sh/ch.
  Écritures corrigées à la source (écran = aides = papier = corrigé) : 6gen13 sans lettre auxiliaire « r » dans
  la réponse affichée et le corrigé (logarithme qui reste en toutes lettres ; la SAISIE « … + r » reste acceptée) ;
  6gen21 `deriveePremiereLatex`/`deriveeSecondeLatex`/`formeDistribueeALatex` + `familles/latex.ts::coefFoisLatex`,
  `fractionCoefLatex` (jamais « 2(0 − ln x) », « 1( », « −1( », « (x)² ») ; 6gen16 `carreMoinsCarreLatex` (« x² − 1 ») ;
  6gen22 `facteurLatex`/`produitLatex`/`coefDevantLatex`/`coefVariableLatex`/`exposantDixLatex`
  (`formatLogarithmesProblemes.ts` : « (−1)·(−7) », « −log(X) », « e^{−t} », « 10^{−1,2} »).

**Chaque étape (= écran du générateur, lettre `sousQuestion`) contient, dans cet ordre :**
1. **Ce qu'on utilise** (`utilise`) : propriété / formule / méthode, avec le renvoi « (cours, § n) »
   (numéro `number` de la section du chapitre) quand c'est pertinent ;
2. **Calcul** (`calcul`) : UNE transformation par ligne (`ligne(latex, justification)`), lignes
   alignées sur leur premier signe de relation (une ligne qui commence par « = » continue la
   précédente), règle utilisée à droite en petit italique (« on distribue », « car i² = −1 »,
   « on ajoute un tour, 2π = 8π/4 »). On ne saute que le calcul mental élémentaire. Jamais de « ; »
   entre deux égalités, jamais une ligne « Calcul » qui dit quoi faire sans le faire. Plusieurs
   blocs possibles dans une étape, avec un intitulé (`calcul(sq, lignes, intro, "Module")`) ;
3. **Résultat** (`resultat`), encadré (la réponse de l'écran, `formatReponseAttenduePhaseLatex…`) ;
4. **Vérification** (`verification`) quand elle est simple et parlante (substituer, recalculer un
   module, somme des racines nulle, valeur en x = π/3…) ;
5. **Piège** (`piege`), rattaché à SON étape (il s'affiche dans l'étape, plus à la fin).
Une étape de pure lecture ou de verdict peut n'avoir que « Ce qu'on utilise » + « Résultat ».
Typographie inchangée (« − », `{,}`, KaTeX, aucune notation clavier dans les justifications : une
formule y passe en fragments `[texte("car "), latex("i^{3}=-i")]`).

**Mécanique (commune à tous les chapitres) :**
- Contrat `EtapeCorrection` (`export/genererFeuilleExercices.ts`) : champs optionnels `type`
  (`utilise | calcul | resultat | verification | piege`) et `calcul: LigneCalcul[]`
  (`{ latex, justification? }`). Constructeurs et outils dans `export/corrigeTableau.ts` :
  `utilise`, `calcul`, `resultat`, `verification`, `piege`, `ligne`, `texte`/`latex` (SANS `docx`),
  `decouperLigneCalcul` (coupe au premier « = », `\approx`, `<`, `\notin`… de niveau 0),
  `lignesDepuisChaine` (éclate une chaîne « A=B=C » d'une fonction de l'écran en lignes alignées,
  avec une justification par égalité), `lignesDeLEtape`, `lettreEtape`.
- Rendu partagé : HTML `assemblerEvaluationHtml.ts::calculHtml` (grille 3 colonnes membre de
  gauche / suite / justification, `.calcul` insécable entre deux pages, KaTeX en ligne qui passe à
  la ligne dans sa cellule — mesuré : 0 formule coupée à 680, 820 et 1280 px), résultat
  `.resultat .cadre` ; Word `evaluationDocx.ts::calculDocx` (tableau sans bordure, rangées
  insécables, résultat dans un paragraphe encadré) ; écran `components/CorrigeDetailleEcran.tsx`.
- **Même source pour le papier et l'écran** : le corrigé de chaque générateur vit dans
  `generateurs*/<générateur>/corrigeDetaille.ts` (jamais dans `exportEvaluation.ts`, qui importe
  `docx`), importé par l'adaptateur ET par l'appli. L'appli passe
  `corrigeDetaille: <CorrigeDetailleEcran etapes={lignesDeLEtape(correction(exercice), lettreEtape(indexEcran))} />`
  dans son objet `validation` (`ValidationEtapeProps.corrigeDetaille`, affiché par `ValidationEcran`
  sous la réponse attendue quand elle est révélée) — aucun composant d'écran à modifier.
  Adaptateur enveloppé par `avecFractionsNormalisees` (6gen37, 6gen39) : l'appli applique le même
  enveloppement.
- Briques du chapitre « complexes » (`6e-6h/ui6e/corrigeComplexes.ts`, réutilisables) : produit,
  carré, division par le conjugué (dénominateur réel → division directe), somme, quotient
  `z = N/D`, racine carrée par identification, angles kπ/d ramenés dans ]−π ; π] ligne à ligne
  (`lignesRamenerAngle`), écritures exactes (`frac`, `cq`, `cv`, `parP`). Figures papier sans
  `docx` : `ui6e/papierComplexes.ts` (réexportées par `racinesNiemes/exportEvaluation.ts`).
- Valeurs intermédiaires toujours CALCULÉES depuis l'instance (jamais recopiées) ; quand l'écran a
  déjà une chaîne de calcul (`calculEtape`, `calculModuleLatex`…), l'éclater avec
  `lignesDepuisChaine` plutôt que la réécrire. Une chaîne d'écran n'écrit QUE des égalités vraies :
  pour ramener un angle dans ]−π ; π], la chaîne s'arrête à l'angle brut, puis une seconde chaîne
  (séparée par `\qquad`) retire / ajoute le tour — `calculArgumentZLatex` (6gen94) :
  « θ₁ + θ₂ = … = 19π/12 \qquad arg z = 19π/12 − 2π = 19π/12 − 24π/12 = −5π/12 » (l'ancienne
  écriture « 19π/12 = 19π/12 − 2π » était fausse) ; le corrigé l'éclate tel quel (source unique).
  Recherche faite sur les 16 générateurs du chapitre : c'était la seule chaîne de ce type fausse
  (`lignesRamenerAngle`, les corrections de quadrant « α ± π » de 6gen99 et 6gen39 sont justes).
- Pièges LaTeX trouvés par le contrôle : `\cdot${x}` collé à une lettre (`\cdoti`) → toujours
  `\cdot ` suivi d'une espace ; facteur « 2i » non parenthésé devant un exposant (`2i^2`) → `parP` ;
  deux nombres juxtaposés (« 33 » pour 3 × 3) → `juxtaposer(a, b)` (défaut de `lignesProduit`,
  `lignesProduitQ`) ; base fractionnaire d'une puissance toujours entre parenthèses.
- **Formule coupée sur papier** : KaTeX en ligne ne passe à la ligne qu'aux opérateurs de NIVEAU 0 ;
  un produit de longs facteurs `\left(…\right)\left(…\right)` est insécable et sortait de sa cellule
  à 680 px. Dans une ligne de calcul longue, crochets / parenthèses SIMPLES (`[(x+1)+(y+3)i]\,[…]`),
  jamais `\left…\right`.
- Ligne de calcul répétée (même LaTeX que la précédente, ou `\dfrac`/`\frac` près) : retirée
  (`sansDoublons`, filtre de `lignesEtape` dans 6gen42).

**6gen42 (problèmes avancés) — même niveau que les 15 autres.** Chaque étape de chaque variante a un
bloc « Calcul » (aucune étape de pure lecture) : lieux par le produit `(z − p₁)·conj(z − p₂)`
développé (partie Im ou Re, `mulLin` / `polyLatex` : polynômes exacts en x, y), carrés complétés
ligne à ligne, rayon `√(r²)` simplifié pas à pas (`lignesRacine` : carré extrait, racine d'un
quotient, dénominateur rendu rationnel) ; demi-droites par cos θ / sin θ ; droite et cercle vérifiés
en substituant leurs points ; système droite ∩ cercle par substitution (`y = ±…`, puis `x₁`, `x₂`) ;
famille C : développements, z z̄ = 1, différence `(p − p̄)(z − z̄) = −4b Im z` pour le contre-exemple ;
D : racines n-ièmes une par une, Δ et formule du second degré (indices x₁, x₂ dans l'ordre de
l'écran), α puis β avec vérification somme/produit ; E : quotient par le conjugué en entiers,
argument (forme r(cos θ + i sin θ) ou arctan + correction de quadrant), angle des directions.
**6gen93, étape « binôme »** : produit mixte → regroupement somme × différence, identité
remarquable, développement, exposants (une ligne chacun) ; puissance seule → binôme de Newton écrit
terme à terme, puis exposants.

**Contrôle numérique des équations (6gen42)** : l'évaluateur du collecteur reçoit des variables
(`x`, `y`, `m`, `\alpha`, `\beta`) fixées à un point du LIEU ou à la SOLUTION de l'instance
(`vars42.ts` : point d'un cercle, d'une demi-droite, milieu pondéré de [P₁P₂], q₁, x₁ et m₀, α et β…) :
chaque équation intermédiaire doit alors être vraie, comme chaque identité. Une ligne qui porte les
deux solutions s'écrit `y=\pm 2` puis `x_1=…`, `x_2=…` (sinon le point choisi en contredit une).

**Vérification (collecteur, ≥ 80 tirages + 12 par variante) :** chaque étape a « Ce qu'on
utilise » et « Résultat » ; aucune ligne non typée ; aucune ligne de calcul sans relation ; aucun
« ; » entre deux égalités ; KaTeX valide (`throwOnError`) ; pas de `NaN`/`undefined`/notation
clavier ; et **contrôle numérique de chaque égalité** : un évaluateur LaTeX → complexe (fractions,
racines, puissances, i, π, cos/sin, e^{iθ}, modules) compare les membres successifs de chaque
chaîne ; pour les identités trigonométriques (6gen38, 6gen93) la variable x est remplacée par 0,7.
Contrôles ajoutés au lot 6gen42 : étape sans « Calcul » (6gen42), et tout « - » précédé d'une espace
ou d'une parenthèse dans un texte (justification, « Ce qu'on utilise »…) — il a trouvé « argument
-π/2 » dans le corrigé de 6gen37 (corrigé).
Outils du pilote : `collecteur.ts`, `evalLatex.ts` (dossier de travail du chantier, à recopier).

**Lectures graphiques et décisions (4e ch. 3, 9 générateurs).** Toute étape a un bloc « Calcul »
(collecteur : 0 étape sans calcul), y compris les lectures et les verdicts. Conventions :
- **Lecture** = une ligne par chose lue, AVEC une relation, la justification dit où on lit :
  `x=-2` « asymptote verticale », `f(3)=0` « la courbe coupe Ox en x = 3 », `x\in]2;4[` « aucun
  tracé : exclus », `f(2)=f(5)=4` « palier », `(\text{TH};\text{TV})=(1;-3)` « point
  caractéristique lu ». Intervalles de variation : `x\in[a;b[` + « la courbe monte du point (a ; …)
  jusqu'au cercle vide (b ; …) » (extrémités lues : point plein, cercle vide, asymptote, bord).
- **Identifier la question** (gen70, écran « type ») : ligne « donnée » et ligne « cherché »,
  `x=10` puis `f(10)=\,?` (ou `f(x)=14`, `x=\,?`) ; inéquation `f(x)\geq 14` ; croissance
  `x_1<x_2\Rightarrow f(x_1)<f(x_2)`.
- **Facteur par le point croix** (gen10, gen69) : `\Delta x=x_c-\text{TH}` puis `=…`, idem Δy,
  puis `\text{CH}=\dfrac{1}{|\Delta x|}=2` (ou EH, EV, CV) ; signe de l'écart → symétrie (en
  justification). Écart vertical de la référence écrit `g(2)=2^3`, `=8`.
- **Équation construite transformation par transformation** (gen10) : `y=x^2`, puis une ligne
  `y=…` par transformation dans l'ordre de la formule unifiée (TH, CH/EH, SOY, EV/CV, SOX, TV),
  chaque expression produite par la fonction de l'écran (`formatEquationFonctionReferenceLatex`
  sur l'exercice partiellement « allumé »), dernière ligne `f(x)=…`, puis `=…` simplifiée (g paire
  / impaire). Vérification par le point croix (argument = 1, g(1) = 1).
- **Ensembles transformés** (gen72) : `D_0=[…]`, puis `D_1=…`, `D_2=…` — une ligne par
  transformation, la règle sur les bornes à droite (opération écrite en clair : `-2+3`,
  `\dfrac{-8}{2}` ; symétrie : bornes opposées ET échangées, chaque crochet suit sa borne ; borne
  infinie : `±\infty`, signe changé par une symétrie).
- **Parité** (gen13) : domaine non symétrique → `t\in\mathrm{dom}\,f`, `-t\notin\mathrm{dom}\,f` ;
  décalage → contre-exemple numérique `f(1)=…`, `f(-1)=…`, `f(-1)\neq f(1)` (t choisi pour que
  f(−t) ≠ ±f(t)) ; b = 0 → calcul littéral `f(-x)=…=f(x)` (ou `-f(x)`).
- **Raisonnement sur une fonction inconnue** (gen71 « déduction ») : la démonstration du sens de
  variation sur [−m ; 0] ligne à ligne (`-m\leq x_1<x_2\leq 0`, multiplication par −1, f sur
  [0 ; m], parité) ; comparaisons : ramener dans [0 ; m] avec la parité, ranger, conclure.
- **Choix d'une courbe** (gen71) : chaque condition testée sur la courbe (`f_{B}(1)=-6`,
  `\mathrm{im}\,f_{B}=…`, `\text{nombre d'asymptotes horizontales}=0`) — jamais une ligne sans
  relation.
- Un écran qui couvre plusieurs étapes papier (gen10 : « exercice » = b, c, d) : l'appli filtre
  par une table `LETTRES_PHASE` ; gen13 : `lettrePhaseCaracteristiquesAlgebriques(instance, phase)`
  (séparation/« se débarrasser » → étape intermédiaire, branches, validation). gen11 est
  `regroupable` : sur papier ses six étapes s'affichent à plat sous la lettre de l'instance (le
  collecteur compte 6 écrans pour lui).
- Fonctions intermédiaires (gen11, écrans EH/CH/SOY, TH, EV/CV/SOX) : `f_1`, `f_2`, `f_3` à
  l'écran (consignes, libellés des champs « f₁(x) = », légendes du graphique, réponse attendue,
  fiches des puces) ET dans le corrigé — une seule source, `formatGabaritEtape2Latex`… (noms
  `FONCTION_ETAPE2`…, `formatFormeCanoniqueFonctionsReference.ts`). f reste le nom de la fonction de
  départ et de la fonction finale ; la fonction de référence est g. La vérification ignore un
  préfixe « f(x) = » / « f₁(x) = » / « f_1(x) = » recopié (`sansPrefixeFonction`).
- gen69, modèle inverse : l'équation isolée s'écrit avec le numérateur a SIGNÉ
  (`modele.ts::fractionInverseLatex`, aide de l'écran 4 ET corrigé) ; les aides de l'écran 4
  disent « multiplie / divise par le coefficient a » avec sa valeur signée, jamais « le facteur »
  (qui vaut |a| au récapitulatif).
- gen69, numérateur du modèle inverse (écran 5, gaz/vélo) : on retire TV AVANT le produit,
  a = (y − TV)·(variable − TH), ou a = y(TH + 1) − TV — « le produit des deux grandeurs » seul donnait
  92 au lieu de 90 avec 2 h de pauses. Écritures communes à l'aide et au corrigé :
  `modele.ts::numerateurInverseLatex` (« T(v) − 2 = 90/v », « (T − 2) × v »). Son unité est le
  produit des unités des deux axes (km pour le vélo), pas celle de l'axe vertical.
- gen11, écran EV/CV/SOX et corrigé (étape e) : jamais « |a| » (a n'y est pas défini, et le
  coefficient de la forme canonique combine aussi CH/EH) — « le facteur écrit devant g dans le
  gabarit : son signe donne SOX, sa valeur sans le signe le rapport EV/CV ». Graphique : option
  `etiquettesLisibles` de `GrilleAdaptative` (nombres écrits = multiples du pas à écriture finie,
  espacés, jamais rognés ; pas de 1/3 → entiers seulement ; grille complète ; signe « − »).
  Mesuré : 0 chevauchement à 390 et 1280 px sur 300 tirages × 8 états par famille. **gen10**
  (`MafsGraphFonctionsReference`) : même option + `formatEtiquetteGrilleTypo` (`ui/mafsTransformation.ts`,
  virgule et « − », partagé avec gen11) et « − » dans la légende des points. Mesuré (harnais,
  300 tirages × 8 états — cible seule, avec curseurs neutres / justes / translations seules, zoom
  avant 1, 2, 4 crans, zoom arrière — boîtes englobantes) : états avec chevauchement 807 / 2 400
  à 390 px et 584 / 2 400 à 1 280 px (« 0,3333333333 » sur « 0,6666666666 » dans 386 états) →
  0 et 0 ; nombres rognés 2 062 et 1 834 → 0. `GrilleAdaptative` (option `etiquettesLisibles`) : un
  nombre Y qui toucherait un nombre X n'est pas écrit (croisement des deux lignes de nombres), et
  les nombres Y passent à gauche de l'axe quand il longe le bord droit.
  Autres graphes 4e à pas adaptatif par défaut (mantisse 10/3 de la décade 0,1–1 atteinte au zoom),
  mesurés dans l'appli (20 tirages × 12 états — initial, zoom avant cran par cran jusqu'à 8, retour,
  zoom arrière — à 390 et 1 280 px) : chevauchement de nombres d'un même axe au pas de 1/3 pour
  gen47 (`DistanceDroiteGraph`, 24–30 états / 240), gen38 (`ComparaisonSeriesGraph`, 5 / 96),
  gen33 (`PolygoneEffectifsGraph` / `LectureQuartileGraph`, 1 / 168) → option activée (gen35
  partage les deux graphes de gen33), formats `formatEtiquetteGrilleTypo` / `nombreFrTypo` : 0
  chevauchement après. gen8 (`MafsGraphTransformation`) et gen12 (`MafsGraphCaracteristiquesFonction`) :
  aucun chevauchement d'un même axe, mais au zoom un nombre X posé sur un nombre Y au croisement des
  axes (gen8 26 / 240 états à 390 px, 17 / 240 à 1 280 px ; gen12 1 / 240 et 1 / 240) et des nombres
  rognés au bord (gen8 214 et 173 états, gen12 213 et 135) → option activée + `formatEtiquetteGrilleTypo`,
  grille inchangée (valeurs à lire sur ses lignes) : 0 chevauchement, 0 nombre rogné après (même mesure).
  gen9 : option non activée (aucun chevauchement).
  Graphes à pas fixe (`EquationCercleGraph`, `EquationParaboleGraph`, `ConstructionDroiteGraph`,
  `LectureGraphiqueDroiteGraph`) ou à mantisses propres (`BoiteMoustachesGraph`) : pas de 1/3 impossible.
- Briques partagées sans `docx` : `4e/ui/corrigeChapitre3.ts` (`q` exact, `plusQ`, `mono`,
  `somme`, `polynome`, `lignesPremierDegre` — reste fractionnaire n/d divisé en `\dfrac{n}{d\cdot a}`,
  jamais de fraction de fraction —, `racineCarreeLatex`, `racineCubiqueLatex`, `sansDoublons`,
  renvois `COURS_*`). Figures sorties des adaptateurs : `fonctionsReference/figures.ts`,
  `caracteristiquesFonction/figure.ts`, `portraitRobotFonction/figures.ts` ;
  `formatTransformationsEnsembles.ts` importe `texte`/`latex` de `corrigeTableau` (plus de `docx`).
- Écran étroit : la justification passe sous sa ligne et s'enroule (`.cc-j { contain: inline-size }`,
  `theme.css`) — avant, une justification longue élargissait la grille et sortait de l'écran.
- Collecteur étendu (dossier `corrige-4e3`) : `env.ts` donne à l'évaluateur les fonctions nommées
  de l'instance (`f`, `t`, `c`, `E`…, valeur exacte du moteur) et des valeurs candidates des
  variables (solutions, bornes, points lus + valeurs génériques) : une identité doit être vraie pour
  une valeur générique, une équation pour au moins une valeur notable ; intervalles comparés borne
  à borne ET crochet par crochet ; équations sans solution réelle (Δ < 0, carré = négatif, aucune
  branche retenue) comptées « non testables ». Mesuré : 1 950 tirages (120 libres + 15 par variante), ≈ 19 000 égalités évaluées, 0 fausse.

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
