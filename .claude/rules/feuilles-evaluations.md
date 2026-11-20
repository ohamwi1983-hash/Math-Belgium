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
  - "src/components/admin/RepereNiveauDuree.tsx"
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
- **Page de conception : repère « niv. 2–3 · ≈ 7 min » sur chaque rangée de variante** (feuille
  d'exercices ET évaluation ; `components/admin/RepereNiveauDuree.tsx`). Valeurs du code réel :
  `estimationVariante(adaptateur, variante, { filtre, cleFiltre })` = `niveauEtDuree` sur 6 tirages
  (plus petit / plus grand niveau, durée moyenne), cache PARTAGÉ avec `dureeEstimeeVariante` (clé
  adaptateur + variante + réglages) : le repère, la « Durée estimée » au-dessus du tableau, le
  sous-total du générateur et le badge flottant ne peuvent pas se contredire. Réglages respectés :
  feuille d'exercices → tirages libres de la variante (le moteur n'y impose rien) ; évaluation →
  seulement les instances que le moteur peut tirer pour la rangée (`respecteContrainte` : exercice
  complet, paramètres décochés absents, calculatrice interdite / autorisée ; recherche bornée à
  4 000 essais / 80 ms, sinon tirages libres et l'infobulle le dit) ; un cas particulier coché (une
  seule question) n'est pas compté à part (dit dans l'infobulle). Numéros colorés par palier
  (Base / Intermédiaire / Avancé, `--good` / `--attn` / `--bad`), mot du palier quand toute la
  plage est dans un palier et la largeur > 640 px. Générateur pas encore noté : niveau converti
  avec « * » (« niv. 3* »), infobulle « Provisoire : … étoiles converties, durée = constante » ;
  sans étoiles : durée seule. **Calcul paresseux** : rien n'est tiré à l'ouverture ; une rangée
  calcule seulement quand elle approche de l'écran (IntersectionObserver, marge 200 px), une variante
  à la fois dans `requestIdleCallback`. Mesuré (build de production, 3 chapitres complets, 5 essais) :
  ouverture inchangée (≈ 1,1 s avant comme après), bascule de processus + 30 à 40 ms, repères
  visibles remplis en 0,1 à 0,35 s, 0 tâche longue (> 50 ms) en évaluation ; repères = valeurs de
  40 tirages indépendants de `niveauEtDuree` (9 / 9 rangées contrôlées).
  Sous chaque générateur dont une variante est choisie : rangée « Sous-total : n exercices · ≈ m min
  (· p pts en évaluation) » ; récapitulatif par processus de l'évaluation : « Appliquer : 12 pts
  (60 %) · ≈ 25 min ». Pas de nouvelle colonne (téléphone).
- **Badge flottant** (`CompteurFlottant`) : « n questions · p points · ≈ m min » (durée = la même
  « Durée estimée » que l'en-tête, variantes exclues non comptées), en évaluation et en feuille ;
  « /exercices » caché sous 480 px (≈ 225 px de large sur iPhone 13). Masqué (fondu) dès que la
  barre du bas (qui redonne le total) est à l'écran ou dépassée : il ne recouvre plus les documents
  générés ni le formulaire de remédiation.
- **Affichage** (maquette E) : cadre du NUMÉRO puis cadre du PALIER (« 5 » « Avancé »), noir et blanc
  (`niveauHtml`, `.niveau .num/.pal`) en tête de chaque exercice de la feuille et de sa version
  aménagée ; légende en tête de la feuille « Niveau 1 à 7 : Base 1–2 · Intermédiaire 3–4 · Avancé
  5–7. Il monte avec… ». Rien sur la copie d'évaluation ni en Word (les étoiles n'y étaient pas).
- **Chapitres notés** : 6e ch. 5, 6e ch. 4, 4e ch. 3, 6e ch. 3, 5e ch. 3, 4e ch. 4, 4e ch. 2, 4e ch. 5, 5e ch. 2, 6e ch. 2 (6gen6–12), 4e ch. 1 (gen7–9, gen55), 6e ch. 1 (6gen1–5) (ni `difficulte` ni
- **Chapitres notés** : 6e ch. 5, 6e ch. 4, 4e ch. 3, 6e ch. 3, 5e ch. 3, 4e ch. 4, 4e ch. 2, 4e ch. 5, 5e ch. 2, 6e ch. 2 (6gen6–12), 4e ch. 1 (gen7–9, gen55), 5e ch. 1 (5gen1–5) (ni `difficulte` ni
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
- **Groupes « à verdict »** (décision de l'utilisateur, audit 4e ch. 2) : quand le NOM d'une variante
  dit la réponse (« Δ < 0 », « aucune solution », « binôme conjugué », « deux dénominateurs » = une
  racine à rejeter), le professeur qui la choisit donne le verdict. Contrat :
  `groupesVerdict: { id, label, variantes }[]` (`export/genererFeuilleExercices.ts`, outils
  `export/groupesVerdict.ts`). Dans le panneau d'ÉVALUATION seulement
  (`catalogueVariantesExercice(gen, 'evaluation', clésActives)`), le groupe remplace ses membres
  par UNE rangée (un membre déjà demandé par un plan enregistré reste affiché) ; `construirePlan`
  tire la variante réelle de chaque question dans un paquet mélangé des membres, distribué série A
  q1…qn puis B… et re-mélangé quand il est vide (verdicts équilibrés, différents d'une série à
  l'autre) ; la série B garde le cas particulier oui/non de la série A, pas sa forme (propre à la
  variante). Le plan, le QR `?code=`, le corrigé et la remédiation portent la variante RÉELLE ;
  `tirerInstance` ne reçoit un id de groupe que pour une sonde (membre choisi par la graine) ;
  l'estimation niveau/durée de la rangée tire un membre au hasard à chaque tirage ;
  `varianteExigeCalculatrice` : groupe exclu seulement si tous ses membres l'exigent. La feuille
  d'exercices et le `SelecteurVarianteDev` gardent les variantes séparées. Déclarés : gen1
  `groupe_methode` (mise en évidence, binôme conjugué, produit remarquable, cas général, aucune
  solution ; la mise en évidence généralisée reste à part), gen2 `groupe_signe_delta`, gen4
  `groupe_racine_etrangere` (un dénominateur, deux dénominateurs, deux fractions du 1er degré ;
  P2/P1 et P1/P2 à part). Mesuré (30 plans × 2 séries, Playwright) : verdict de la série B ≠ série A
  dans 30 / 30 plans pour les trois générateurs, toutes les variantes membres tirées.
- **Même structure dans toutes les séries** : la série A fixe, question par question, le cas
  particulier et le TYPE de question (`ProfilInstance.forme`, ex. gen38 : centrage / dispersion /
  interprétation / lecture) ; les autres séries reproduisent cette structure avec d'autres nombres.
  Paramètres au choix et cas particulier coexistent (gen1 : case « racines irrationnelles » +
  case « équation incomplète ») ; `parametresNonApplicables` pour une instance où un paramètre est
  sans objet (racines irrationnelles en mise en évidence généralisée).
- `calculatriceIndispensable: true` pour un générateur dont toutes les instances exigent la
  calculatrice : le panneau avertit si le professeur choisit « calculatrice interdite ».
- **Variante exclue faute de calculatrice** (`calculatriceIndispensable` en liste, évaluation
  « calculatrice interdite », réglage par défaut) : la rangée grisée porte la raison ET la solution
  (« Demande une calculatrice : passe la calculatrice à « Autorisée » (en haut) pour l'utiliser. »)
  avec un bouton « Aller au réglage » qui fait défiler jusqu'au sélecteur, lui donne le focus et le
  surligne 2,6 s. Quand TOUTES les variantes d'un générateur sont exclues (6gen96), une seule note en
  tête du générateur (« … : toutes ses variantes demandent une calculatrice … ce réglage vaut pour
  toute l'évaluation ») et les rangées gardent « — demande une calculatrice ». Choix : le bouton ne
  bascule PAS le réglage d'office — il vaut pour toute l'évaluation (« autorisée » ne tire plus que
  des cas qui exigent la calculatrice, dans tous les générateurs).
- Recherche de graine bornée par le temps (200 ms par palier) : les cas rares (σ entier, combinaison
  précise de paramètres) sont trouvés sans bloquer le panneau. Un cas particulier va sur la DERNIÈRE
  question de la ligne qui peut le recevoir (cas propre à une seule variante).
- Pour chaque chapitre : mesurer (≥ 5 000 tirages par variante) la part des cas particuliers et des
  cas « calculatrice », écrire le profil, vérifier avec un plan réel (2 séries, calculatrice
  interdite/autorisée, case cochée ou non). Modèle : `5e-4h/generateurs5e/profilsEvaluationTrigonometrie.ts`.
- **Profils de forme du 4e ch. 2** (lot E, `profilsEvaluation4eCh2Ch3.ts`) : gen3 `delta-n` (trinômes à
  factoriser par Δ), gen5 `delta-n` + `|neg` (facteur du 1er degré à coefficient négatif), gen6
  `delta-n|large/strict`, gen57 `entre/exterieur|large/strict` (inéquation) ou `equation` ; jamais la
  méthode rapide précise, le nombre de racines ni une racine à rejeter. Forme la plus rare sur 5 000
  tirages par variante : gen3 8,4 %, gen5 11,8 %, gen6 4,1 %, gen57 24 %. Pas de case « cas
  particulier » (aucun raccourci). gen57 : calculatrice seulement pour les familles A
  (`calculatriceIndispensable: PAIRES_CALCULATRICE`).
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
tombent sur les lignes de sa grille. Valeurs irrationnelles (gen122, cercle trigonométrique) : un quadrillage NON
régulier dont les lignes passent par les valeurs remarquables elles-mêmes.

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
- **Retours de saisie des générateurs (lot B, 4e ch. 2 ; modèle pour les autres chapitres)** :
  `4e/components/RetourSaisie.tsx` — `useTentativeLisible` (une saisie ILLISIBLE n'est jamais
  transmise au moteur : aucune tentative consommée, message « … ne compte pas comme une tentative »),
  `MessageRetour` (message ciblé sur l'erreur du cours trahie par la dernière réponse fausse, puis
  « Incorrect — tentative n/3 » ; contenu dans UN `<span>` : `.alert-error` est un conteneur flex,
  chaque fragment KaTeX y devenait une colonne), `AidesNiveaux` (deux niveaux : propriété du cours,
  puis application à l'instance ; la première ouverture lève le drapeau d'aide du moteur). Textes
  dans `4e/ui/aidesSecondDegre.ts` (jamais la réponse). Nombres saisis : `ui/lireNombre.ts`
  (virgule, fraction, racine ; `null` = illisible). Choix fermés (méthode, catégorie, signe de a,
  « Pas de CE / Au moins une CE ») : 1 tentative (`TENTATIVES_CHOIX_FERME`), champs : 3.
- **4e ch. 5 (lots B, C, D)** : même modèle étendu aux anciens générateurs (gen14–19, gen58) —
  messages d'illisible PAR NATURE de champ (angle, longueur, valeur, valeur exacte, valeur approchée),
  `AidesNiveaux.figure` (figure d'aide au niveau 2). Valeur exacte (gen16, gen78) :
  `moteur/saisieExacteTrigo.ts` (approchée refusée sans tentative). Verdicts : gen75 famille « angle »
  (une amplitude ≈ 25 %, `casParticulier` null), gen79 inverse (une solution ≈ 20 %) — le nombre de
  solutions RETIRÉ de la `forme` (sinon la série B reproduisait le verdict de A). Cas particuliers
  (décision 1) : « aucune solution » de gen18 et de gen78. Groupes à verdict : gen81 `groupe_erreur`,
  gen73 `groupe_configuration`, gen19 `groupe_loi`, gen17 `groupe_famille_sincos` (avec 90° + α) et
  `groupe_famille_tan`. **Dans un groupe, le niveau et la durée imprimés ne doivent pas trahir le
  verdict** : mesurer par membre (`criteres.ts`) ; constants en gen73 (4, 12 min) et gen81 (4,
  11 min), piège constant en gen19 ; gen17 : seul le cas particulier (déjà visible) descend au
  niveau 2. Même contrôle pour un verdict DANS une variante (`verdictniv.ts`) : gen75 « angle » (nombres
  constant → 4, 9 min) et gen79 inverse (constants : 5, 12 min). Plans réels (`construirePlan`,
  30 × 2 séries) : verdict B ≠ A 30/30 par groupe.
- **5e ch. 2 (lots B, C, D, 5gen6–13)** : `5e-4h/components5e/RetourSaisieTrig.tsx` (hook du 4e,
  illisible par nature de champ `MESSAGES_ILLISIBLE_TRIG`, `AidesTrig` : formule en KaTeX EN LIGNE
  `\displaystyle`, sécable après une relation, `\qquad` ou « ou » — en display elle sortait du bloc à
  390 px) ; textes `ui5e/aidesTrigonometrie.ts`. **Le moteur lit la saisie AVANT tout verdict**
  (« aucune solution », racine à rejeter, φ absent de B1) : sinon une saisie illisible coûtait une
  tentative. Appel trig reconnu par `(?<![a-z])(sin|cos|tan)\s*\(`, jamais `\b` (« 13sin(…) » était
  jugé FAUX, 5gen10 / 5gen13). Toute notation AFFICHÉE (placeholder, réponse attendue) doit être
  lisible : `cos^2(x)`, `cos²(x)` et « = 0 » final (5gen10, `normaliserPuissanceTrig`), « f(t) = »
  recopié, ω, φ et `arcsin` (5gen13 ; le placeholder du système B3 était illisible).
  « — » lu comme « − » dans tout le 5e (`expressionGenerale`). φ ramené
  dans ]−π ; π] (5gen8 ; 5gen13 B2 : minimum −π/2 ; B3 : φ₀ puis « φ = φ₀ − 2π »). Tirage : profils
  `calcul` 5gen7 (exacte) et 5gen12 (calculatrice), `groupe_technique` 5gen10 (technique B ≠ A
  30/30 plans), cas particuliers 5gen10 directe/produit et 5gen13 (aucune solution, inéquation
  toujours vraie/fausse), `forme` 5gen11 (mode) et 5gen13 (type de 2ᵉ partie). Niveau et durée
  diffèrent d'une technique à l'autre du groupe (directe 10,6 min, produit 15,2) : sans effet, la
  copie d'évaluation n'imprime ni l'un ni l'autre.
- **6e ch. 2 (lots B, C, E, 6gen6–12)** : `6e-6h/components6e/RetourSaisieExpo.tsx` (hook du 4e,
  `MESSAGES_ILLISIBLE_EXPO` par nature de champ, `AidesExpo` en KaTeX en ligne), lecture
  `moteur6e/lectureSaisieExpo.ts`, messages ciblés `ui6e/retoursExponentielles.ts` ; choix fermés à
  1 tentative (`PHASES_CHOIX_FERME`, `tentativesMaxCourant`), un choix qui ouvre un champ garde 3.
  Écran « existence » (impossible / vraie pour tout x / à résoudre) en tête de 6gen9 A–C et 6gen10
  A, C-k, D, E ; écrans « forme » de 6gen6 B et C (cinq options KaTeX partout). 6gen6 G retirée en
  gardant l'entrée `retiree: true` (`CatalogueVarianteEntree.retiree`, filtrée du panneau et du
  sélecteur) : les indices des autres variantes et les `?code=` imprimés restent valables, un code G
  rouvre un tirage libre. 6gen12 G : objectif « rester » / « atteindre » du contexte, `verdictOui`
  équilibré 50/50. Profils `generateurs6e/profilsEvaluationExponentielles.ts` : `forme` = famille
  + sous-type structurel (jamais la forme indéterminée, le signe ni l'issue) ; cas particuliers
  `aucune-solution` (6gen9 D, B contradictoire, A3 Δ < 0, C sans t > 0) et `inequation-triviale`
  (6gen10 B, C-f, C-k — variantes entières tirées par le palier de repli quand le professeur les
  choisit) ; `calcul` + `calculatriceIndispensable` en 6gen12 seulement (A doublement exact) ;
  `groupe_triviale` (6gen10 B, C-f : B ≠ A 30 / 30 plans ; C-k laissé à part, il donnait le même ℝ
  que C-f une fois sur trois). Niveau constant dans un verdict : 6gen10 B et C-f (2, 4 min), 6gen6 B
  (piège constant, 4, 8 min). Mesures, outils et captures : rapport du lot (dossier de travail).
- **5e ch. 1 (lots B, C, D, 5gen1–5)** : pied d'écran commun `5e-4h/components5e/PiedEcranFonctions.tsx`
  (`AidesTrig` + `BoutonAide` + « Valider » + `MessageRetour`, `messageSansTentative`) ; textes
  `ui5e/retoursFonctions1.ts` (illisible par champ `MESSAGES_ILLISIBLE_FONCTIONS`, aides 2 niveaux
  5gen1/5gen2/5gen4, `cibleEnsemble` générique — crochet sur valeur interdite, sens inversé, réunion
  au lieu d'intersection —, ordre inversé / étage manquant de 5gen2, composition inversée et
  condition 2 oubliée de 5gen3, valeur intermédiaire / ordre / lecture directe de 5gen4) et
  `ui5e/aidesProblemesContexte.ts` (16 écrans de 5gen5, `lireNombre5e`, coût unitaire pour coût
  total, coût fixe oublié, × 1 000 oublié, intersection lue au lieu du minimum, x³ sans racine).
  `parserNombreOuFraction` du 5e lit « − – — », « + » et les milliers espacés. **Le moteur refuse
  l'illisible** (`soumettre*` rend l'état inchangé : 5gen2, 5gen3 formule et seuil NaN, 5gen4,
  5gen5 `estSaisieIllisible`) ; constructeur d'ensembles et grille de signes : message au lieu
  d'un bouton grisé muet ; choix fermés (CE de 5gen1, existence de 5gen4) : message ciblé sous la
  réponse révélée (`ValidationEcran.messageRevele` accepte un `ReactNode`). Domaine vide de 5gen3 =
  cas particulier `domaine-vide` (`PROBA_VIDE` 0,22 parmi les (combo, sens) qui le permettent,
  ≈ 11 % du tirage libre), bouton « ∅ » (`EnsembleReelGuideBuilder.avecVide`), formule d'une
  composée vide comparée en remplaçant √ par ∛ (`diagnostiquerFormuleDomaineVide`), corrigé « racine
  ≥ 0 face à un seuil négatif » sans élévation au carré ; LaTeX des directions calculé à la première
  lecture (getter) : plan d'évaluation 1 s → 0,1–0,5 s, cas particulier trouvé dans chaque série.
  Combinaisons `retiree` (racine sur fraction + racine sur fraction / + fraction sous racine) :
  hors tirage libre et panneau, gardées au sélecteur. 5gen4 : existence ≈ 30 % par question
  (0 à 3), `forme` = restreinte + nombre de questions, piège constant (niveau 2, 6–7 min dans
  les deux verdicts). 5gen5 : B4 `retiree`, x en centaines, V = 2πn³ écrit « kπ cm³ », minimum A2
  et seuil C construits entiers, fenêtre C ≤ 40, `svgGraph` `legendeSous` (ajout pur).
  Mesuré : moteurs 2 000 tirages par variante, 0 anomalie ; collecteur 3 380 tirages ≈ 17 900
  équivalences, 0 fausse ; Playwright iPhone 13 ≈ 140 parcours, 0 erreur console, scrollWidth 390 ;
  documents réels 26 (2 séries + aménagée + feuille, cas coché ou non) : même structure B = A, 0
  débordement à 680 / 1 280 px. Durées 5gen3 : libre 8–34 min (moy. 17), combinaisons retirées
  jusqu'à 38.
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
- **Cartouche (école, adresse, professeur)** : plus de constantes — `EnTeteEvaluation.cartouche`
  (école choisie dans le panneau + nom du profil, comptes professeurs : `.claude/rules/comptes.md`),
  rendu par `export/cartouche.ts` (copie, corrigé, examen, Word ; textes échappés, morceau vide =
  rien). Absent → `CARTOUCHE_DEFAUT` (anciennes valeurs), documents identiques à avant.
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
  boîte de marge n'a qu'un style), « page n / N » à droite ; **corrigé et grille d'évaluation**
  (documents du professeur, `stylePied(…, avecNom = false)`) : « **Série A** » à gauche, sans
  « Nom », « page n / N » à droite ; feuille d'exercices (énoncé, « Je vérifie » et corrigé détaillé
  forment UN document) et aménagée de la feuille : « page n / N » seulement. Marge basse 1,5 cm.
  Firefox ignore les boîtes de marge. Vérifié (PDF A4 d'une évaluation 2 séries + feuille, Chromium) :
  pied sur chaque page (corrigé 7 / 7, grille 2 / 2, feuille 10 / 10 dont « Corrigé détaillé »),
  0 collision corps / pied (`pdftotext -bbox`).
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
  corrigé, blocs `html`) rasterisées en PNG. Pied de page Word (`piedDocx`) : copie « Série **A** ·
  Nom : … », corrigé « Série **A** · Corrigé · document du professeur », grille « Série **A** · Grille
  de correction · ne pas distribuer aux élèves », « page n / N » (champs PAGE / NUMPAGES) au taquet
  droit — mention courte pour que le numéro ne passe jamais à la ligne. Pas d'annexe
  formulaire ni de deux colonnes en Word.

## Examen (décisions de l'utilisateur, maquette X3 « Sans page de garde »)

Second type de document d'évaluation, choisi dans la barre d'outils du panneau (« Document :
Évaluation / Examen », absent en feuille d'exercices). L'évaluation n'a PAS changé : même HTML, même
Word pour un plan d'évaluation (contrôlé octet par octet, KaTeX inliné neutralisé). Toutes les règles
de ce fichier valent pour l'examen (série en gras, vrai/faux en une question, aucune place de
réponse, points à droite, pas de majuscules d'insistance, pied de page, options du document).
- **Modèle** (`EnTeteEvaluation`, `lib/evaluationPayload.ts`) : `typeDocument: 'examen'`,
  `organisationExamen: 'chapitre' | 'processus'` (défaut chapitre), `totalExamen: { mode: 'libre' } |
  { mode: 'fixe', parPartie: Record<clé, number> }`, `heureDepart`, `dureeExamen`, `session`,
  `consignesSupplementaires` — textes TELS QUE SAISIS, lus à l'impression. Plan sans ces champs =
  évaluation. Ignorés en mode `exercice` (la remédiation d'un examen les efface : feuille ordinaire).
- **Module pur** `entrainement/export/examen.ts` (testé seul, esbuild) : `partiesExamen` (parties et
  numérotation CONTINUE ; partagé par le panneau, les documents, le Word et la remédiation),
  `mettreAEchelle`, `lireHeure` / `lireDuree` / `lireTotal`, `horaireExamen`, `sessionParDefaut`,
  `examenDeSession`, `titreCourtChapitre` (table `TITRES_COURTS`, à compléter pour un nouveau chapitre).
- **Parties** : par chapitre = une partie par chapitre du plan (ordre du plan), questions rangées par
  processus, étiquette = PROCESSUS ; par processus = I Connaître, II Appliquer, III Transférer (celles
  qui ont des questions ; numérotation = celle de l'évaluation), étiquette = CHAPITRE (titre court ;
  au-delà de deux, « Plusieurs chapitres »). Clés : `chapitre:<slug>`, `processus:<n>`, `vraiFaux`.
  **Choix fait** : par chapitre, le vrai/faux dont les affirmations viennent de PLUSIEURS chapitres
  forme sa propre partie « Vrai ou faux », placée EN PREMIER (question Connaître) ; d'un seul chapitre,
  il va dans la partie de ce chapitre.
- **Mise en page** (`assemblerEvaluationHtml.ts`, `STYLE_EXAMEN`) : bandeau plein `.bande` (accent,
  blanc, capitales espacées ; horaire `.nc` hors capitales : « 08h50 », jamais « 08H50 ») « Examen » /
  « Session de juin 2027 · 08h50 → 09h50 » au-dessus du cartouche (« Examen de mathématiques — 4e
  année », date, Série **A**, Nom/Classe/N°, pas de numéro) ; tableau des points PAR PARTIE
  (`.resultats.examen`, « I · Titre court », Total) + calculatrice ; « Consignes » (défaut +
  calculatrice + « Horaire : 08h50 → 09h50 (1 h). » ou « Durée : 1 h. » ; durée estimée seulement
  sans durée saisie et case cochée ; puis une puce par consigne supplémentaire, texte échappé, `$…$`
  en KaTeX) ; ouverture `.partie` (filet épais, « Partie I », titre, points, ligne grise couvert —
  numéros) jamais seule en bas de page (`break-after: avoid`, mesuré `pdftotext -layout`) ; en-tête
  courant à partir de la page 2 (`styleEnteteCourant`, boîtes `@top-left` / `@top-right` /
  `@top-right-corner`, vides sur `@page :first`) « Examen de juin 2027 · Mathématiques 4e » / « Série
  **A** » — piège : `"\00a0A"` est lu U+A0A (gurmukhi), écrire `"\00a0 A"`. Copie, corrigé, grille
  (libellé « processus · chapitre ») et aménagée (bandeau, consignes, ouverture de partie sur la page
  de sa première question, une question par page) ; deux colonnes : la partie s'ouvre en pleine
  largeur puis ses questions dans un bloc multicolonne propre (partie d'une seule question : pleine
  largeur).
- **Horaire** : heure « 08h50 », « 8h50 », « 8:50 », « 8 h 50 », « 8h » ; durée « 60 », « 60 min »,
  « 1h », « 1h30 », « 1 h 30 », « 1:30 », « 1,5 h » ; passage de minuit (« 23h30 → 00h30 ») ; sans
  heure : la durée seule ; illisible : message sous le champ, rien d'imprimé.
- **Total fixé** (`evaluationLocal.ts::itemsDuDocument`) : points des questions de la partie mis à
  l'échelle (proportionnels, demi-points, jamais 0 pt, reste corrigé sur la plus grosse question,
  somme exacte) ; critères et sous-questions suivent (`pointsCriteres` répartit `item.points`).
  Total illisible, vide ou impossible (< 0,5 pt par question) : points tels quels, signalé dans le
  panneau. **Total libre** : le panneau affiche en direct le total par partie et le total général.
  Badge flottant et barre du bas : total de l'examen. Saisie : texte libre, `normaliserSigneMoins`,
  jamais de champ numérique (les consignes supplémentaires ne sont PAS normalisées : tirets
  typographiques gardés).
- **Word** (`evaluationDocx.ts`) : bandeau (paragraphe ombré), tableau par partie, consignes (puces
  dans le même cadre), ouvertures de partie, étiquettes, en-tête courant (`titlePage`, première page
  sans en-tête).
- **Remédiation** : `questionsRemediables` suit l'ordre des parties pour un examen (même
  `partiesExamen`) — vérifié identique à la copie A, par chapitre et par processus.

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
(6gen23–29, 6gen77–84) ; 5e ch. 3 (5gen14–19, 5gen44–49) ; 6e ch. 3 (6gen13–22, 6gen85–92) ; 4e ch. 4 (gen30–38, gen108–112) ; 4e ch. 2 (gen1–6, gen57, gen67) ; 4e ch. 5 (gen14–19, gen58, gen73–81, gen122) ; 5e ch. 2 (5gen6–13) ; 6e ch. 2 (6gen6–12) ; 4e ch. 1 (gen7–9, gen55) ; 6e ch. 1 (6gen1–5). Les autres adaptateurs s'affichent comme avant (contrat rétrocompatible).
(6gen23–29, 6gen77–84) ; 5e ch. 3 (5gen14–19, 5gen44–49) ; 6e ch. 3 (6gen13–22, 6gen85–92) ; 4e ch. 4 (gen30–38, gen108–112) ; 4e ch. 2 (gen1–6, gen57, gen67) ; 4e ch. 5 (gen14–19, gen58, gen73–81, gen122) ; 5e ch. 2 (5gen6–13) ; 6e ch. 2 (6gen6–12) ; 4e ch. 1 (gen7–9, gen55) ; 5e ch. 1 (5gen1–5). Les autres adaptateurs s'affichent comme avant (contrat rétrocompatible).
- 4e ch. 2, moitié 1 (gen1–4, notés : `criteresDifficulte` ; lectures depuis le lot E de l'audit : signe de a (gen2), CE lue sur un dénominateur factorisé, racines lues sur une forme factorisée — la reconnaissance de la méthode est une DÉCISION et compte comme une étape) : briques `4e/ui/corrigeSecondDegre1.ts` (`COURS_*` § 1/2/4/5, nombres `c√k` exacts, reconnaissance testée ligne par ligne `c=0` / `b^2=4ac`…, factorisations jusqu'à la forme factorisée DE L'ÉCRAN, produit nul / CE facteur par facteur, Δ puis √Δ simplifiée et x₁, x₂, vérification Viète ou substitution, `finaliserCorrige` : formules des justifications et résultats rédigés groupées `{…}`) ; une lettre par ÉCRAN, lettres = `phasesExercice` du moteur (gen3 jusqu'à 11 écrans, gen4 jusqu'à 11) ; gen2 : figure allure + tableau de signes (racines marquées, solutions en gras), l'appli passe l'exercice COURANT (déjà réduit après simplification, `phasesInequation`) ; gen4 : produit en croix orienté pour retomber sur `equationIsolee`, sous-variante B factorisée par (x − p₃) avant de développer. Collecteur `corrige-4e2-m1` (ensemble final de gen2 relu point par point, solutions de gen1/gen4 remises dans l'équation de départ).
- 4e ch. 4, moitié 1 (gen30–36, notés : `criteresDifficulte`) : briques `4e/ui/corrigeStatistique1.ts` (`COURS_*` § 1–7, `lignesSomme` / `lignesSommeProduits` — membre de droite ≤ 26 caractères visibles, sinon paquets « a+b+c=P » de gauche ≤ 18 : la colonne du milieu ne fait que ≈ 230 px à 680 px —, `couperSiLongue`, `ligneSeuil`, `ligneFrequence` « ×100 % = 20 % », `formulesInsecables` : formules des lignes de texte groupées `{…}`, sinon « h₁ = 32 % » se coupait après « = » en fin de ligne) ; une lettre par ÉCRAN (gen33 : 4 / 5 étapes, Q₁ et Q₃ séparés ; gen35 : 11 / 13 étapes, `etapesParQuestion` groupe les écrans par vraie question, ordre « classes » des questions = ordre des écrans) ; constructeurs d'étapes de gen32/33/34/36 réutilisés par gen35 sur l'exercice « mappé » ; figure de la boîte sortie dans `boiteMoustaches/figure.ts` (sans `docx`) ; lectures (min/max/mode, sommets du polygone, boîte tracée) comptées comme écrans de lecture.
- 4e ch. 4, gen37/38/108–112 : briques `4e/ui/corrigeStatistique2.ts` (`COURS_*` § 1–8, `lignesSomme` — membre de droite ≤ 26 caractères visibles, sinon paquets `S_1`, `S_2`… puis leur somme —, `formulesInsecables` pour les formules d'un Résultat / Ce qu'on utilise rédigé) ; arrondi orienté écrit avec une relation VRAIE (« ≈ 1,3571 ≥ 1,35 » par défaut, « ≤ 1,30 » par excès, borne « = 44,8 ≥ 44 ») ; gen38 : figure `4e/ui/figureComparaisonSeries.ts` (seuils n/4, n/2, 3n/4 et quartiles lus marqués) ; gen112 : la correction reprend la copie bloc par bloc (« Ligne k »). Niveaux notés (`criteresDifficulte`) ; lectures : gen38 récapitulatif et seuil simple, gen111 bâtons a et trompeur b, gen108 d.
  Corrections validées par l'utilisateur (à la source, écran = aides = papier = corrigé) :
  **gen38 « graphique », dispersion à 2 arguments** : σ reste un argument (le cours, § 8, compare les
  écarts-types ; une courbe cumulée d'une série DISCRÈTE redonne tout le tableau, chaque saut = une
  valeur et son effectif/sa fréquence) — la consigne dit de le CALCULER à partir des valeurs lues
  (calculatrice, mode statistique), l'aide 2 dit comment, le barème « écarts-types calculés à partir
  des valeurs lues » ; vérification inchangée (σ + écart interquartile ; l'étendue reste le piège).
  Remplacer σ par un indicateur lisible aurait laissé un seul argument valide sur les courbes.
  **Figure papier des courbes cumulées** : axe vertical de 0 (aucune graduation négative) au cumul
  total ; grille verticale passant par les seuils n/4, n/2, 3n/4 des DEUX séries (pas 1, 0,5, 1,25…
  — `grilleVerticaleCourbesCumulees`) ou par 25/50/75 % (pas 5), grille horizontale passant par chaque
  valeur xᵢ (`grilleHorizontaleCourbesCumulees`), lignes chiffrées plus marquées, deux seuils proches
  écrits de part et d'autre du cadre. Écran : `GrilleAdaptative` option `etiquettesYMin={0}` (la marge
  sous l'axe, place des nombres X, ne porte aucun nombre négatif).
  **Consignes, aides, réponses attendues en KaTeX sur tout le chapitre** (« seuil $\dfrac{n}{2}$ »,
  $Q_1$, $x_{\min}$, $1-\dfrac{1}{k^2}$, « − » typographique devant un nombre négatif) : les fonctions
  d'écran (`consigneQ1`, `texteAide…Niveau2`, `consigneLecture`, `formatQ1AttendueTexte`…) renvoient
  des segments texte/KaTeX, convertis tels quels en fragments pour le papier (titres d'étape compris) ;
  libellés en chaîne seule (titres de fiche, en-têtes de tableau) : indices Unicode (Q₁). Balayage
  (`notation.ts`, dossier de travail) : sorties papier + toutes les fonctions/constantes exportées des
  14 `ui/format*.ts`, 300 tirages par variante.
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
- 4e ch. 2, moitié 2 (gen5, gen6, gen57, gen67 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeSecondDegre2.ts` (`COURS_*` § 1–7, un constructeur par écran du mécanisme « méthode la plus rapide » : réduction / mise en évidence, reconnaissance — tests c = 0, b = 0, b² = 4ac dans l'ordre du cours —, forme factorisée ou Δ, racines par produit nul ou formule, factorisation après Δ ; signes `ligneSigneLineaire` / `ligneSigneTrinome` « P < 0 ⟺ x ∈ ]r₁ ; r₂[ », lecture de S une ligne par zone et par racine) ; une lettre par ÉCRAN, séquence recalculée sur l'instance INITIALE (`ecransSignesProduit`, `ecransInequationRationnelle` = `ordrePhases` de l'appli ; gen6 garde l'instance initiale dans l'appli, la session réduit numérateur / dénominateur) ; vérification du tableau par une valeur test ; écrans de lecture (lot E de l'audit) : signe d'un facteur sans racine, réduction, racines lues sur la forme factorisée, phrase de conclusion (gen57) — le choix de la méthode et la factorisation après Δ comptent comme des étapes. Durées moyennes avant → après le lot E (1 000 tirages libres) : gen1 7,9 → 8,7 min ; gen2 8,6 → 8,5 ; gen3 13,4 → 14,8 ; gen4 18,1 → 18,7 ; gen5 12,9 → 14,4 ; gen6 16,9 → 18,5 ; gen57 13,1 → 13,1 ; gen67 8,0 → 8,0. Collecteur `corrige-4e2-m2` : équivalences de signe contrôlées en 60 points.
- 4e ch. 5, moitié 1 (gen14–18, gen76, gen78, gen79 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeCercleTrigo.ts` (`COURS_*` § 1–5, angles en degrés `deg` (plus de radians en 4e), réduction ligne à ligne « −480° + 2 × 360° = −480° + 720° », « = 240° » puis l'encadrement `0^\circ\leq 240^\circ<360^\circ`, `ligneQuadrant`, `lignesAnglePremierQuadrant` (+ retour comme vérification), signes une ligne par fonction, valeurs sur un axe `\cos 180^\circ=-1` « abscisse de M », `lignesValeurAssociee` « sin 300° = −sin 60° », « = −√3/2 », `lignesCandidats` (α₁, α₂, confondus sur un axe), `avecFinale` : la forme de l'écran en dernière ligne sauf si elle y est déjà) ; une lettre par ÉCRAN (`ecransDe` pour gen76/gen78, phases de l'appli ailleurs) ; écrans de lecture : gen14 b (quadrant) et d (signes) — sur un axe b et c —, gen15 a si l'angle est déjà dans [0° ; 360°[ et b sur un axe, gen76 « quadrant et signe » de chaque terme, gen79 a (départ et sens). Valeurs approchées depuis les valeurs NON arrondies : « α₂ = 180° − α₀ ≈ 162,5° » (gen78, `calculSolutionsLatex` qui substituait α₀ arrondi retiré), θ₀ = sin⁻¹|k| (gen79), « y non arrondi » ; gen17 : nombres = 0 (valeurs approchées DONNÉES, recopiées avec un signe) ; gen79 : méthode 2 (aucun modèle dans l'énoncé papier). Pièges de niveau : jamais la racine négative d'un carré ni le facteur nu d'un produit (gen78 : c'est la méthode). Collecteur `corrige-4e5-m1` : `^\circ` → × π/180, `\sin^{-1}`, `:`, `\pm` (comparaison en valeur absolue), « ≈ » toléré à la demi-unité du dernier chiffre écrit, équations en α / θ testées aux solutions EXACTES, équation sans solution détectée par balayage (non testable) ; 2 830 tirages (200 libres + 30 par variante), ≈ 26 900 égalités, 0 fausse. Corrigé à la source : intervalle `[0° ; 360°[` de gen18 écrit avec « ; » (la virgule se lisait comme une virgule décimale) ; `formatRotationsContexte`, `formatValeurExacte`, `formatEquationsTransformer` importent `texte`/`latex` de `corrigeTableau` (plus de `docx` dans les applis).

- 4e ch. 5, gen122 « Lire sur le cercle trigonométrique » (nouveau, Connaître ; noté) : corrigé `generateurs/lectureCercle/corrigeDetaille.ts` (partagé avec l'appli) — a) `\cos\theta=…`, `\sin\theta=…` « abscisse de M : graduation …, à gauche de l'axe vertical », vérification `\cos^2\theta+\sin^2\theta=\dfrac{3}{4}+\dfrac{1}{4}=1` ; b) `|\cos\theta|`, `\alpha`, les deux candidats de même cosinus (justification), `\sin\theta` qui tranche, formule du quadrant ligne à ligne (axes : candidats puis choix, sans α), vérification `\cos 120^\circ=…` ; c) `x_T=1`, `y_T=…` « graduation …, (OM) prolongée au-delà de O », `\tan\theta=y_T`, vérification par le quotient `\dfrac{\frac{…}{…}}{…}` — ou `\cos\theta=0` + verdict « n'est pas définie » ; figure (OM) + T en `figureHtml` (enveloppée à 8 cm). Lectures : a et c (`criteresDifficulte` = `etapesDuCorrige(…, ["a","c"])`, méthode 0, piège = M hors du quadrant I ou tan non définie) → niveaux 1–2, 6 min. Figure papier = figure de l'écran : quadrillage aux valeurs REMARQUABLES (lignes x, y = 0, ±1/2, ±√2/2, ±√3/2, ±1 dans [−1 ; 1]², graduées sur les demi-axes positifs seulement : le signe se lit au quadrant) et tangente x = 1 graduée en ±√3/3, ±1, ±√3 — √2/2 ≈ 0,71 et √3/2 ≈ 0,87 ne tombent sur aucune grille régulière. Collecteur (outils de `corrige-4e5-m1` recopiés dans le dossier `gen122`, variables θ, α, x_T, y_T) : 600 tirages, 12 620 égalités, 0 fausse.
- 4e ch. 5, moitié 2 — les triangles (gen19, gen58, gen73, gen74, gen75, gen77, gen80, gen81 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeTriangles.ts` (`COURS_*` § 3–7 ; loi des sinus isolée ligne à ligne pour un côté / pour un sinus, touche sin⁻¹ puis supplémentaire « (cours, § 4) », Al-Kashi pour un côté — substituée, carrés et produit calculés, carré, racine — et pour un angle — isolée en cos (ajout/retrait, division : une opération par ligne), fraction simplifiée, touche cos⁻¹ —, aire ½ · p · q · sin X, somme des angles). **Valeur en mémoire** (`Val` : `donnee`/`angleDonne` exactes, `coteMemoire`/`angleMemoire` écrites au centième / au dixième AVEC leurs zéros, « 125{,}0° ») : toute substitution d'une valeur arrondie est un « ≈ », le résultat qui la suit aussi (`relSubst`, `relApres`, `apres`) — jamais « 135 · sin 53,1° = 108 ». Une lettre par ÉCRAN (gen58 : pont, angles OU soustraction, cible, interprétation — l'écran « interprétation » manquait aux étapes papier : ajouté à `construireEnonce`). Figures dans le corrigé : parallélogramme résolu (gen80 a), arc de compas (gen74 d), deux configurations (gen75 « angle » c, `figureSvgPapier(e, true)`), figure résolue (gen77 e). Vérifications : Héron (gen19 b), aire retrouvée (gen75 « côté »), Al-Kashi après la loi des sinus (gen80 cap, gen75 Héron), contrôle de gen73 par Al-Kashi, inégalité triangulaire (gen80). gen81 (détective) sur le modèle de gen112 : la ligne refaite et « ≠ copie », constat chiffré (radians : la même fonction en rad et en degrés), blocs « Ligne k » — la copie recopie les valeurs ARRONDIES d'une ligne à l'autre et la valeur attendue de l'écran en dépend : le corrigé suit cette règle, avec « ≈ » devant toute valeur recopiée arrondie (même un entier issu d'un « ≈ » précédent). **Niveaux** — lectures : gen73 a (configuration), gen74 d (nombre de triangles), gen77 a et e, gen58 interprétation ; méthode 0 (gen74, gen75 sauf quadrilatère), 1 (gen19, gen73, gen81, gen75 quadrilatère), 2 (gen58, gen77, gen80) ; piège dans les données : gen19 Al-Kashi avec angle compris obtus, gen73 angle obtus à calculer en SAS/SSS, gen75 « angle » (un sinus, deux amplitudes) et quadrilatère à angle B obtus, gen77 « deux positions ». gen74 : niveau ET durée CONSTANTS (3 · Intermédiaire, 12 min, `sansCharge`) — 0, 1 ou 2 triangles est le verdict ; gen81 : piège constant 0 (le type d'erreur est la réponse de l'écran 2). Mesuré (200 tirages libres + 30 par variante) : gen19 niv. 3–4, 7 min ; gen58 4–5, 10–14 min (moy. 12,6) ; gen73 4–5, 12–14 (12,4) ; gen74 3, 12 ; gen75 1–5, 6–9 (7,5) ; gen77 5–6, 13–15 (13,3) ; gen80 5, 11–13 (12,5) ; gen81 4, 9–11 (10,1). Écritures corrigées à la source (écran = aides = papier = corrigé) : gen75 `egalOuEnviron` (« sin Ĉ = 0,875 », plus « ≈ » pour une valeur exacte) ; gen80 degrés `^\circ` (plus « ° » brut en mode math) et « ≈ » dans les aides qui substituent une valeur arrondie ; gen81 copie, aides et constats en `^\circ`, `membresLatex` / `relationResultat` (« a ≈ √52,42 », « 180° − sin⁻¹(0,8660) ≈ 120° », jamais « = ») ; formats d'écran de ces huit générateurs sans `docx` (`texte`/`latex` de `corrigeTableau`). Collecteur `corrige-4e5-m2` : degrés (`^\circ` → radians), `\hat{X}`, `\widehat{XYZ}`, noms de segments, `\sin^{-1}`, unités N/kN/km/h/nœuds ; « ≈ » toléré à la demi-unité du dernier chiffre écrit, PROPAGÉE à travers une substitution de valeurs arrondies — 2 800 tirages, ≈ 50 000 relations évaluées, 0 fausse.
- 5e ch. 2, moitié 1 (5gen6 arcs et secteurs, 5gen7 polygones, 5gen12 géométrie du cercle, 5gen8 paramètres d'une sinusoïde ; notés, `criteresDifficulte`) : brique `5e-4h/ui5e/corrigeTrigonometrie1.ts` (`COURS_*` § 1–4 avec espace insécable, rationnels `Q`, multiples de π exacts `piQ`/`piBrut` — la forme non réduite sur sa ligne puis « on simplifie par 15 » —, `lignesDegresVersRadians` « 75 × π/180 = 75π/180 = 5π/12 », `lignesRadiansVersDegres` « 5π/12 × 180/π = 5 × 180/12 = 5 × 15 = 75 » (nombre de degrés SANS ° dans la chaîne, ° au résultat), `lignesProduitPi`, `lignesQuotientPiParEntier`, `lignesQuotientPiParPi` (× inverse, π simplifié), `lignesAireSecteurExacte`, `lignesDifferencePi`, `RP` / `lignesFinRP` pour A, ω, φ, Φ, b, `approche` (arrondi avec ses zéros), `sansDoublons` qui retire aussi « =Y » après « X=Y ») ; une lettre par ÉCRAN (5gen6 `quantitesManquantes`, première ligne = substitution de l'aide de niveau 2 `formulesDisponibles(…)[0]`, r depuis A et θ par r² puis √ ; 5gen7 `sequencePolygone` ; 5gen12 `phasesDuScenario` ; 5gen8 `ORDRE_PHASES_SINUSOIDE`). 5gen12 : secteur balayé en valeurs EXACTES (θ multiple de π, A₁ − A₂ au même dénominateur, vérification ½(r₁² − r₂²)θ) ; segment et lentille : cos θ en fraction réduite, `\theta=\arccos\left(…\right)`, aires « = 72θ ≈ … » et « = 72(θ − sin θ) ≈ … » avec θ NON arrondi, lentille = somme des segments à 4 décimales ; croquis de l'énoncé en `figureHtml` de la première étape. Vérifications : retour aux degrés / radians, s ou A recalculé avec r trouvé, k × élémentaire (5gen7), ωT = 2π, −ωΦ = φ. **Lectures** (5gen8 seul) : A, ω, b, et φ en forme développée ou Φ en forme pré-factorisée (`lettresLectureSinusoide`). **Niveaux** : 5gen6 méthode 1 (2 → 3) / 0 (conversion), nombres 1 seulement pour la conversion décimale ; 5gen7 méthode 0, nombres 0 (valeurs en π acceptées sur papier) ; 5gen12 méthode 1 (secteur balayé, segment) / 2 (lentille), nombres 1 ; 5gen8 méthode 0, piège = A < 0 ou parenthèse « x + k » en forme pré-factorisée ; aucun piège ailleurs (convertir θ en radians est la méthode). Mesuré (200 tirages libres + 30 par variante) : 5gen6 2 → 3 niv. 3, 8 min, conversion niv. 1–2, 4–5 min (libre : moy. 7,2) ; 5gen7 niv. 2, 8 / 10 / 10 / 12 min selon les écrans « k côtés » ; 5gen8 niv. 2–3, 12 min ; 5gen12 secteur balayé et segment niv. 4, 11 min, lentille niv. 6, 23 min (9 écrans). Écritures corrigées à la source (écran = aides = papier = corrigé) : 5gen6 aide de niveau 2 « 75 × π/180 » (plus « 75° × π/180 »), fractions intérieures en `\frac` (plus deux `\dfrac` empilés, aussi 5gen8), conversion décimale « θ ≈ 2,15 » dans la réponse brève (plus « = »), consignes « valeur exacte, ou arrondie au centième » ; 5gen12 aides de niveau 1 en texte + KaTeX (plus « θ=acos(...) », « A=½r²θ » au clavier), « ≈ » dans les aides qui substituent une valeur arrondie (θ à 4 décimales), réponse attendue « θ ≈ 1,6961 ≈ 1,7 » (plus « 1,7 (1,6961) », deux nombres juxtaposés lus comme un produit). Collecteur `corrige-5e2-m1` (variables θ, r, s, A, θ₁, θ₂, A₁, A₂, ω, T, f_req, φ, Φ, b, x = 0,7 ; `\arccos` ajouté ; tolérance des « ≈ » additionnée sur une somme de valeurs arrondies) : 1 130 tirages, ≈ 24 000 égalités, 0 fausse.

- 6e ch. 2, moitié 1 (6gen6 limites, 6gen7 domaine et dérivée, 6gen8 graphique de la dérivée, 6gen9 équations ; notés, `criteresDifficulte` ; contrat papier complet — `enoncePapier`, `reponseBreve`, `bareme` —, `versionPapier` dans le registre) : brique `6e-6h/ui6e/corrigeExponentielles1.ts` (`COURS_*` § 1–4, `lim`, réexporte `finaliserCorrige`, nombres et termes de `corrigeLogarithmes1/2`) ; une lettre par ÉCRAN (`sequence…` = `phaseInitiale` → `phaseApres` du moteur) ; construireEnonce = une question par écran (titres « Étape n — … »), énoncé papier = l'expression + la consigne globale. 6gen6 : exposant / base (règle a > 1, 0 < a < 1, « on pose t = … »), terme dominant, « +∞ − ∞ » et « ∞·0 » levées par mise en évidence et croissances comparées, L'Hôpital écran par écran (forme 0/0 substituée, f′ et g′ par la règle de la chaîne avec u pour f et v pour g, « (cours, § 1) »), K : forme persistante vérifiée puis dérivées secondes, L : changement de variable puis pivot, N : loi des puissances ; G (retirée par un lot suivant) : corrigé minimal. Limites finies EXACTES partagées écran / corrigé / récapitulatif (`formatLimiteFinaleLatex` : « −\dfrac{2}{3}\ln(3) ≈ −0,7324 », 4 chiffres significatifs depuis la valeur non arrondie). 6gen7 : domaine résolu ligne à ligne (racine, dénominateur, arccos : « e^{x²−k} ≤ 1 = e⁰ »), chaîne u, u′, formule, substitution, forme finale (`deriveeFinaleLatex`), produit / quotient assemblés puis simplifiés (mise en évidence, simplification par k). 6gen8 : dérivée (quotient, 1/u) puis caractéristiques de f′ testées une par ligne, figure des candidats (bon mis en évidence) en `figureHtml`. 6gen9 : valeur réécrite en puissance de la même base, exposants égaux, premier / second degré (x₁ < x₂ quel que soit le signe de a), racine d'une puissance (contradiction écrite « n₁ ≠ 2n₂ », jamais une égalité fausse), t = bˣ (racine t ≤ 0 rejetée nommée), positivité ; AUCUN logarithme (décision de l'utilisateur) : t non puissance de la base → « x ≈ … » à la calculatrice. L'appli affiche le « Résultat » de l'étape comme réponse attendue (plus de flottant brut, plus de « vérifiée par équivalence numérique »). **Lectures** : 6gen7 domaine = ℝ (a) ; 6gen8 sélection après la dérivée (B, D : b). **Niveaux** : méthode 1 sauf 6gen6 A (0) et G (2), 6gen7 (0, E : 1), 6gen9 (0, C : 1) ; pièges dans les données : 6gen6 base < 1 ou x → 0⁻ sous une puissance impaire (A), « +∞ − ∞ » d'apparence −∞ (B), K, L, N, G ; 6gen7 racine cachée (C e), arccos (F) ; 6gen8 base < 1 (B), x = 0 exclu (D) ; 6gen9 racine t ≤ 0 (C) — « aucune solution » n'est pas un piège ; nombres : ln(a) ou e^{km} (6gen6 H–L), facteur ln(a), a ≠ e (6gen7), x non exact (6gen9 C). Mesuré (200 tirages libres + 30 par variante) : 6gen6 niv. 1–6, moy. 9,2 min (A 6, H–J 11, K 15) ; 6gen7 niv. 1–3, 5–9 min (moy. 6,9) ; 6gen8 niv. 2–3, 4–5 min ; 6gen9 niv. 1–5, 4–9 min (C 8,4–8,8). Écritures corrigées à la source (écran = aides = papier = corrigé) : 6gen6 base décimale « 0{,}5 » (plus « 0.5 »), « \sin(x−3) » au lieu de « \sin((x−3)) », « −x² » au lieu de « −1x² » (K), « −\frac{3}{x} » au lieu de « \frac{−3}{x} » (L, N), consignes de L sans « x/(−3) » ni « 1x », « (x)² » retiré (J), « \ln^{2}(a) » ; 6gen7 « x² − 9 » au lieu de « x² − 3² », aides du domaine (B) avec les données, facteur simple sans parenthèses ; 6gen8 base fractionnaire « \left(\dfrac{1}{4}\right)^{x} » et « \ln\left(\dfrac{1}{4}\right) » (l'exposant semblait porter sur le seul dénominateur), aide sans notation clavier ; 6gen9 « x ≈ 1{,}465 » (plus « x = 1.465 »), second membre en fraction au-delà de 3 décimales (plus « 0,001953125 », « 5,12e-7 »), consigne « t = 3ˣ » (plus « t = base^x »), consigne de l'écran 2 de A sans « CORRECT(E) ». `REECRITURES` : « Sélectionne le graphique qui représente la dérivée f'(x). ». Collecteur `corrige-6e2-m1` (outils de `corrige-6e3-m1`, limites infinies contrôlées en deux points de plus en plus lointains — signe et croissance —, « 0⁺ / 0⁻ » par le signe, f, g, u, v, w, N, D de l'instance, équations testées en leurs solutions) : 1 670 tirages, ≈ 15 300 égalités, 0 fausse.

- 5e ch. 2, moitié 2 (5gen9 lecture graphique, 5gen10 équations, 5gen11 extremums, 5gen13 modéliser ; notés, `criteresDifficulte`) : briques `5e-4h/ui5e/corrigeTrigonometrie2.ts` (`COURS_*` § 4–8, rationnels `Q`, expressions exactes a·π + b·α + c — α = arccos k donné par la calculatrice reste une LETTRE jusqu'à la dernière ligne « ≈ … » calculée depuis α non arrondi —, `lignesIsolerX` : on regroupe, on réduit, on multiplie par 1/a « chaque terme, la période aussi », on distribue ; `lignesSolutionsSerie` : une ligne par k « x = c + p·1 = valeur », plus un rejet de part et d'autre « < 0 », « ⩾ 2π »). Une lettre par ÉCRAN (5gen10 : `phaseInitiale`/`phaseApres` du moteur, la reconnaissance de la technique compte comme une étape ; 5gen13 : `ordreComplet`). 5gen10 : deux séries écrites ligne à ligne (même cosinus / angle opposé, même sinus / supplémentaire, une seule pour tan et pour ±1), produit (mise en évidence, deux équations, α et β si les deux facteurs demandent la calculatrice), substitution (remplacer, distribuer, réduire, Δ, t₁/t₂, produit des racines en vérification, racine rejetée « t₁ = 2 > 1 »), égalité (angle complémentaire réduit, série 2 « on distribue le signe − »), valeurs où une tangente n'est pas définie « cos(…) = 0 » en bloc « Valeurs écartées ». 5gen9 : max/min, deux maximums, x₀ lus une ligne chacun ; φ brut puis seconde chaîne « φ = brut + 2π » (jamais « φ = » deux valeurs). 5gen13 : B3 ω, φ par soustraction / addition membre à membre (α₁, α₂ en lettres), solutions `t = (1/ω)(α − φ + 2π·k) ≈ …`, intervalles `[t_g + kT ; t_d + kT] ≈ […]` coupés à la fenêtre. Écrans de lecture : 5gen9 a, b, c, f (b, |A|, T, Φ lus) ; 5gen13 « amplitude » de la grande roue (A = R). Écrans « solutions » / « intervalles » : étapes SANS charge (`lettresSansCharge`, comme les « termes proches » de 5gen15). Méthode : 5gen10 0 (directe) / 1 ; 5gen13 1 pour B2, B3 et l'inéquation (modèle donné : au plus 1). Pièges dans les données : 5gen9 b ≠ 0 ; 5gen10 ±1, produit non factorisé, tangente non définie, racine t rejetée ; 5gen11 A < 0 (maximums / minimums seuls) ; 5gen13 φ indéterminé (B1), minimum (3π/2), inéquation « ≤ ». Mesuré (200 tirages libres + 30 par variante) : 5gen9 niv. 3–4, 13 min ; 5gen10 1–6, 6–19 (moy. 12,9 ; produit 15,2) ; 5gen11 2–4, 8–9 ; 5gen13 1–6, 4–21 (moy. 13,0 ; B2 18,8). Écritures corrigées à la source (écran = papier = corrigé) : 5gen10 décimales au CENTIÈME (l'écran affichait « 1,3 + 6,3k », refusé par sa propre tolérance 0,01), « ≈ » devant une constante approchée (`relationBranche`), période 2π / π écrite en π, « 0 + » omis, ensemble des solutions en KaTeX (`formatEnsembleSolutionsLatex`, écran et récapitulatif), « t₁ = 0{,}5 : x = … » (virgule `{,}`, séries confondues écrites une fois), « −tan(x) » au lieu de « −1·tan(x) », texte « aucune solution » sans « |k| » (k est l'entier des séries) ; 5gen11 « \dfrac{1}{2}x » au lieu de « ½·x » ; 5gen13 séries « u ≈ … + 2kπ », « t ≈ … + 30k » (au lieu de « k·6,2832 »), modèle construit « f(t) ≈ … », « 28ω + φ ≈ … », « u = π/2 + kπ », consignes en fragments KaTeX (`consignePhaseFragments`, écran et titres papier, « − » typographique), données f₁, f₂ de B3 arrondies AVANT de calculer α₁, α₂, ω, φ (le modèle part des données imprimées). Collecteur `corrige-5e2-m2` (outils de `corrige-4e5-m1` + `\arccos`/`\arcsin`/`\arctan`, variables x, t, u, k, α, β, ω, φ, α₁, α₂, t_g, t_d prises dans chaque série ; une chaîne qui contient k doit être vraie pour au moins deux k ; solutions finales remises dans l'énoncé) : 1 100 tirages, ≈ 29 300 égalités, 0 fausse.
- 5e ch. 2, lot G (5gen54–57, nouveaux ; notés) : socle commun `ui5e/ecransTrigo.types.ts` (`DefinitionEcrans`), `moteur5e/sessionEcransTrigo.ts`, `components5e/EtapeEcransTrigo.tsx` + `AppEcransTrigo.tsx` (`?code=`, puces, corrigé de l'étape, `nombrePuces` : structure fixe quand un cas particulier a moins d'écrans), saisie `moteur5e/lectureValeurTrigo.ts` (π, √, fractions, arcsin, « 30° » = π/6, unités finales ignorées, « : » refusé), écritures `ui5e/nombresTrigo.ts` (`Q`, multiples de π). Corrigés dans `generateurs5e/<gen>/corrigeDetaille.ts`, une lettre par écran. **5gen54** (φ hors d'un extremum) : candidats exacts ou « π − arcsin m − 2π = −π − arcsin m ≈ … » (jamais « φ₂ = 7π/6 » puis « φ₂ = −5π/6 » : la forme brute est écrite sans « φ₂ = »), choix par le signe de cos φ, premier maximum k par k ; modèle « ≈ » quand φ est arrondi ; profil `calcul` = mode (sin φ ∈ {−1/2 ; 0 ; 1/2} ou touche sin⁻¹), sens au départ tiré 50/50 (verdict du choix fermé, jamais cas particulier). **5gen55** (inéquations) : exact partout, arc canonique du cours (sin ≥ : [α ; π − α], sin ≤ : [π − α ; 2π + α], cos ≥ : [−β ; β], cos ≤ : [β ; 2π − β]), figure du cercle en `figureHtml` (6,5 cm), intervalles k par k « [g ; d] ∩ [0 ; 2π[ = … » ; instance rejetée si 0 serait une solution isolée ; cas particulier « toujours » (|m| > 1) ; `forme` = fonction | sens inversé ou non. **5gen56** (Archimède) : trois vraies questions papier (n côtés, 2n, seuil), minorant arrondi par défaut et majorant par excès dans le corrigé (« ≤ » vrai même quand la borne est exacte), `calculatriceIndispensable`. **5gen57** (relevés réels) : trois vraies questions papier, tableau `tableauHtml` dans l'énoncé, argument de la prévision écrit à 5 décimales (sinon un « ≈ » tombe à la limite de la demi-unité). Pièges de niveau : 5gen54 1 (candidat à rejeter), 5gen55 1 si le coefficient est négatif ; méthode 1 / 0 / 0 / 2 ; lecture : 5gen57 a. Mesuré (300 tirages libres + 40 par variante) : 5gen54 niv. 4–5, 12–13 min ; 5gen55 1–3, 6–10 (moy. 9,5) ; 5gen56 3, 13 ; 5gen57 5, 14. Collecteur (outils de `corrige-5e2-m2` recopiés, variables φ, φ₁, φ₂, t, k, u, x, m, α) : 1 600 tirages, ≈ 36 600 égalités, 0 fausse. Barème : jamais « 0 pt sur c) » quand l'énoncé papier a de vraies questions (la lettre d'étape est réécrite en lettre de question) — nommer l'élément (« 0 pt sur le nombre de côtés »).

- 6e ch. 2, moitié 2 (6gen10 inéquations, 6gen11 étude de fonction, 6gen12 problèmes ; notés, `criteresDifficulte` ; lot D du contrat papier fait en même temps : `enoncePapier`, `reponseBreve`, `bareme`, `versionPapier` dans le registre) : brique `6e-6h/ui6e/corrigeExponentielles2.ts` (`COURS_*` § 1, 2, 4–7 ; réexporte les outils des briques logarithmes / intégrales ; `finaliserCorrige` = celui du 6e ch. 3 + fractions lisibles dans TOUTES les formules — une base `\frac{3}{10}` d'un « Ce qu'on utilise » sortait minuscule ; `lignesInequationAffine` sens changé en divisant par un négatif ; `demiDroite` ±∞ ouverts ; `lim` = `\lim\limits` (« x → a » sous « lim ») ; `tableauVariationLatex` (double barre d'une valeur interdite, limites des deux côtés)). Une lettre par ÉCRAN (6gen10 `phasesInequationExpo` = `phaseInitiale`/`phaseApres` ; 6gen11 séquence fixe a–f ; 6gen12 `PHASES_PAR_FAMILLE`). 6gen10 : second membre réécrit en puissance de la base une étape par ligne (décimal → fraction, `\dfrac{1}{5^2}`, `(a/b)^{-n}`), passage aux exposants avec « base > 1 : sens conservé / 0 < base < 1 : sens inversé » en justification, vérification par un entier de S (jamais 0) ; B : positivité « c·bˣ > 0 > −k », piège « logarithme d'un négatif » ; C-f / C-k : signe par zone (lignes conditionnelles « pour x < 0 »), Δ < 0 ; D variable : zéro puis équivalences « ⟺ » facteur par facteur, produit zone par zone, tableau de signes (`4e/…/tableauSignesLatex`) dans le résultat. 6gen11 : dérivées première et seconde ligne à ligne (B : règle du quotient sur f′, mise en évidence de −e^u), signes conditionnels, tableau de variation dans le résultat « croissance », graphiques candidats (le bon marqué) en `figureHtml` de l'étape f. 6gen12 : modèle, substitution, résolution (isoler la puissance, ln des deux membres), interprétation ; valeurs non arrondies jusqu'à la dernière ligne (`vautAbs` : « = » seulement si exact en ABSOLU — `vaut` compare en relatif et écrivait « = 9 954 834,2 »). **Lectures** : 6gen11 f (choisir le graphique), 6gen12 G c (comparer t_seuil et D). **Niveaux** (énoncé papier) : 6gen10 méthode 0 (A, B) / 1, piège = base ou rapport < 1, premier facteur négatif, facteur positif avant son zéro, C-k ; « toujours vraie / toujours fausse » (B, C-f) = cas particulier : pas de piège ; nombres 0. 6gen11 méthode 1 (B, C) / 0, piège = A coefficient de x négatif, B, C, D ; nombres 1 pour C (ln de la base). 6gen12 méthode 2 (A, B : l'élève construit le modèle) / 1 (forme donnée), piège = baisse (A), reste (B), r < 1 (C), C < 0 (D), G constant 0 (la décision est le verdict) ; nombres 1 sauf A « doublement ». Mesuré (200 tirages libres + 30 par variante) : 6gen10 niv. 1–4, 4–12 min (moy. 5,7 ; D variable 10,4) ; 6gen11 niv. 2–5, 13–15 min (moy. 13,8) ; 6gen12 niv. 3–6, 8–13 min (moy. 10,0 ; B 13 ; D 10,6). Énoncé papier : 6gen10 l'inéquation seule ; 6gen11 f + quatre graphiques + consigne globale (plus les six questions d'écran) ; 6gen12 contexte, données et vraies questions (B : modèle / complément(n) / seuil ; C : r et Q₀ / valeurs ; D : rapport / L / T(t) / prévision ; F, G : une par étape ; « k = … » retiré des données de A « doublement »). Écritures corrigées à la source (écran = aides = papier = corrigé) : 6gen10 aides sans notation clavier (« baseˣ », « base2^{2g(x)} », « ≤/< »), consignes de regroupement avec les vraies bases (plus de « [symbole] »), Δ avec (−b)², « 1·2ˣ », « 0−x », « −(x) », « 3·x² », zéro « x = −3 » ; 6gen11 asymptote oblique exacte (plus « y = −1.386…x »), positions à virgule, B « sur chaque intervalle du domaine » (plus « partout »), « Graphique C » (plus « n°3 »), consigne B avec la valeur de p, limites du récapitulatif en `\lim\limits` ; 6gen12 E « 0,5t » / « t » (plus « 0.5t », « 1t »), G « −t », « ≈ » et décision en `\text`, C « Q(5) ≈ … », unités en `\text`, aides sans notation clavier ; 6gen12 C : r, Q₀ et valeurs attendues recalculés depuis le v₂ IMPRIMÉ. **6gen12 D, données exactes** (décision de l'utilisateur, audit E1 : avant, la réponse de l'écran ne découlait pas des données imprimées dans 98 % des tirages, 10 % dégénérés) : ρ = r^d ∈ {1/2, 3/4, 4/5, 3/5, 2/5}, |C| multiple du carré du dénominateur, L ∈ {10, 15, 20, 25} ⇒ a, b, c ENTIERS, (b − c)/(a − b) = ρ et L exacts, jamais a − b = b − c ; « bas » : a = L − |C| ≥ 0 ; données nommées « a = … (t = 0) », consigne « il vaut r^d (d unités entre deux mesures) » ; tolérances : rapport 0,005, L 0,05, modèle 0,05 + l'écart d'un r arrondi au millième en chaque point testé. Test du moteur (3 000 tirages) : réponses recalculées sur les données imprimées = réponses de l'écran, acceptées par la vérification, L + 1 refusé ; 0 dégénéré. Niveau D : nombres 0 si d = 1.  Collecteur `corrige-6e2-m2` (outils de `corrige-6e3-m2` + `f''`, contrôles LOGIQUES `logique.ts` : lignes conditionnelles testées en 7 points de leur zone, équivalences « ⟺ » et inéquations successives d'un bloc à même valeur de vérité en 50 points, ensemble final relu contre l'énoncé, bornes testées exactement) : 570 tirages, ≈ 6 800 relations, ≈ 1 600 contrôles logiques, 0 fausse ; 6gen12 seul après les données exactes de D : 580 tirages, 9 200 relations, 0 fausse.

- 4e ch. 1 (gen7 analyse, gen8 transformations, gen9 forme canonique, gen55 optimisation ; notés) : brique `4e/ui/corrigeParabole.ts` (`COURS_*` § 1–3, trinôme, valeur f(x₀) ligne à ligne, x_S = −b/2a simplifiée, y_S, forme canonique a(x − x_S)² + y_S avec a DEVANT — p et q réservés aux translations ; réutilise `corrigeSecondDegre1`/`corrigeChapitre3`), figure `4e/ui/figureParabole.ts` (une seule échelle x / y, sommet et point croix sur les lignes, au moins 2 unités du côté de l'ouverture : figure du corrigé de gen8/gen9 ET graphique papier de gen8). Une lettre par écran ; gen7 sans Δ (raccourcis c = 0, b = 0 et a·c < 0, b² = 4ac, sinon sommet du côté de l'ouverture → « non factorisable », verdict de `groupe_methode`) ; gen8 un écran = une lettre (lecture + équation construite transformation par transformation, vérification par le point croix) ; gen55 : identification, relation, système (isoler, substituer, développer), domaine (avec la condition supplémentaire de l'énoncé), sommet, décision (bornes comparées quand le sommet est hors du domaine), conclusion ; espace fine des milliers dans tout le corrigé. Lectures : gen7 coefficients, allure, image, zéros ; gen9 b, d ; gen55 identification et conclusion. Méthode 2 en modélisation (gen55), 1 sinon ; piège = termes dans le désordre (gen7), x_S < 0 (gen9), p < 0 (gen8), 0 pour gen55 (le sommet hors du domaine est le verdict). Niveau et durée constants dans un verdict : gen7 « non factorisable » compté comme factorisation + zéros (14 min pour les 4 membres) ; gen55 identiques dans / hors du domaine (5 000 tirages par famille). Collecteur `corrige-4e1` : 1 130 tirages, ≈ 21 000 égalités, 0 fausse. Lots B–D de l'audit : modèle du 4e ch. 2 (`useTentativeLisible`, `AidesNiveaux`, textes `4e/ui/aidesParabole.ts`, `aidesOptimisation.ts`), « − – — » lus dans toutes les expressions ; choix fermés à 1 tentative : SOX (gen8, gen9), « sommet dans le domaine ? » (gen55) ; gen55 « forme parabolique » réécrite (t = 0, pieds au sol, hauteurs réalistes) ; « hors du domaine » ≈ 40 % par famille (`optimisation/contrainteSupplementaire.ts` : condition en mots « On ne retient que les cas où … vaut au moins k », présente dans 55 % des tirages ; tirages ajoutés APRÈS ceux de la famille : `?code=` inchangé quand le domaine ne change pas) ; gen7 `groupe_methode` (B ≠ A 30 / 30 plans réels), `forme` = ordre des termes.
- 5e ch. 1 (5gen1 domaine, 5gen2 décomposer, 5gen3 composer f et g, 5gen4 composée lue sur un graphique, 5gen5 fonctions en contexte ; notés, `criteresDifficulte`) : brique `5e-4h/ui5e/corrigeFonctions1.ts` (`COURS_*` § 1–5 ; `nb` = écriture de l'écran relue en fraction exacte d'abord — un 2/3 flottant n'est plus « 0.6667 » ; `lignesCondition` : condition résolue en chaîne « ⟺ » — on retire, on divise, sens changé par un négatif —, trinôme par Δ, racines x₁ < x₂ exactes ou « ≈ » au centième si Δ n'est pas un carré, racine double x₀, règle du signe de a en justification ; `ensembleDepuisPredicat`, `polyQLatex`, `ensFacteur` : réunion entre parenthèses avant « ∩ »). Une lettre par ÉCRAN : 5gen1 `phaseApresCE` (CE, résolution, domaine), 5gen3 `ordreComplet` (formule, conditions, c1, c2, domaine — `construireEnonce` réécrit : une question par écran, consignes de l'écran ; l'ancien découpage en 4 étapes ne suivait pas les écrans), 5gen4 une par question, 5gen5 `phasesContexte` (l'écran « tableau » de A1 devient l'étape a, rattachée à la première question papier). 5gen1 : une ligne par condition, facteurs d'un dénominateur factorisé un par un, intersection écrite `S₁ ∩ (ℝ \ {d})`, tableau de signes en `figureHtml`, vérification par une valeur exclue ou une borne. 5gen2 : une fonction par opération, puis la recomposition substitution par substitution (`h(g(x)) = h(A₁) = … = f(x)`). 5gen3 : x → g(x), parties affines calculées À PART (même dénominateur, développement), assemblage ; double condition ligne à ligne (dom de l'intérieure ; intérieure(x) dans le domaine de l'extérieure : quotient par tableau de signes, numérateur rendu entier — `lignesMoinsSeuil` —, racine élevée au carré, racine sur fraction zone par zone selon le signe du dénominateur, racine irrationnelle d'un trinôme nommée x₁ / x₂) ; intersection. 5gen4 : `(f∘g)(a) = f(g(a))`, une relation par chose lue, ou `dom f` lu et « b ∉ dom f ». 5gen5 : relevés → a, b, k ; Δ et solution négative rejetée ; système mis en forme (× x ou ÷ x), élimination, substitution ; chaînes de l'écran éclatées ; graphiques sortis dans `problemesContexte/graphes.ts` (sans `docx`, une ligne de quadrillage par unité de x), lecture annotée en figure ; valeurs retenues de l'appli passées au corrigé (`RetenusContexte`). **Lectures** : 5gen1 domaine de « pas de CE » ; 5gen4 toutes ; 5gen5 minimum lu (A1, A2), CV et CP lues, seuil. **Niveaux** : méthode 1 sauf 5gen1 simple (0), 5gen4 (0), 5gen5 A1 (2 : h, f, g construits) ; pièges dans les données : 5gen1 coefficient négatif / racine au dénominateur / exclusion dans l'intervalle / racine impaire / fraction sous racine (« pas de CE » et « toujours vraie » sont des cas particuliers), 5gen2 affine finale ou polynôme intérieur, 5gen3 intérieure rationnelle ou racine sur fraction, 5gen4 1, 5gen5 A2, B, C. Mesuré (200 tirages libres + 30 par variante) : 5gen1 niv. 1–4, 5–10 min (moy. 6,2 ; fraction sous racine 8,3) ; 5gen2 niv. 2–3, 4 min ; 5gen3 niv. 3–5, 8–38 min (moy. 18,4 ; racine sur fraction des deux côtés 26,6 : cinq écrans chargés) ; 5gen4 niv. 2, 6–7 min ; 5gen5 niv. 4–5, 10–14 min (moy. 11,8). Écritures corrigées à la source (écran = papier = corrigé) : 5gen1 facteur nul d'un dénominateur factorisé « x » / « x² » (plus « (x) », « (x)^2 ») ; 5gen3 écran « c2 » d'une fraction sous racine : la valeur qui annule le dénominateur n'est plus gardée (« ]−1 ; … », plus « [−1 ; … » — `solveur.ts`), réponse attendue sans « +- » ni « {x}^{2} » ni `-\left(15\sqrt{…}\right)`, quotient « (A/D)/(B/D) » simplifié par D (`simplificationExpression.ts::quotientMemeDenominateur` ; `rationalize` multipliait tout par D et développait : la réponse attendue sortait de l'écran à 390 px — le critère « simplifiée » de la vérification, structurel sur la saisie, est inchangé), consignes / aides sans « dom(f) » au clavier, `\operatorname{dom}` ; 5gen4 réponse attendue, réponse brève et barème en KaTeX (`resultatLatex`) ; 5gen5 « 1x^2 », « 1\sqrt{x} » retirés, « = » au lieu de « ≈ » devant une valeur exacte (évaluations de B, coût moyen), barème sans « g(x)/x ». Formules des textes (« Ce qu'on utilise », justifications, pièges : f(x), g(f(x)), Δ < 0, x³ = c, f + g…) en fragments KaTeX. Collecteur `corrige-5e1` (outils de `corrige-5e2-m1` + ensembles comparés borne à borne et crochet par crochet — intervalles, ℝ, `\setminus`, `∪`, `∩` —, chaînes « ⟺ » testées en ≈ 150 points, zones « Là où … » respectées, fonctions f, g, h… de l'instance) : 2 410 tirages, ≈ 17 000 égalités, ≈ 980 égalités d'ensembles, ≈ 13 700 équivalences, 0 fausse. Documents réels (2 graines, évaluation 2 séries + aménagée + feuille + Word du corrigé) : 0 débordement à 680, 820 et 1 280 px, 0 formule coupée, 0 `.katex-error` ; écran iPhone 13 : corrigé sous la réponse attendue, scrollWidth = 390. Piège d'outil : le serveur Vite de contrôle (`watch: null`) sert le code de son DÉMARRAGE — le relancer après chaque correction, sinon documents et captures montrent l'ancien code.

- 6e ch. 1 (6gen1 réciproque, 6gen2 valeurs cyclométriques, 6gen3 équations, 6gen4 dérivées, 6gen5 graphes ; notés ; contrat papier complet fait en même temps — `enoncePapier`, `reponseBreve`, `bareme`, `versionPapier`, `?code=` dans les 5 applis) : brique `6e-6h/ui6e/corrigeReciproques.ts` (`COURS_*` § 1–5, `NOM_ARC`, `IMAGE_ARC`, `DOMAINE_ARC`, `DERIVEE_ARC_U`, ensembles exacts ; réutilise `corrigeLogarithmes1/2` et les rationnels `Q` / `Poly` / `lignesTrinome` / `substituer` de `corrigeIntegrales1`). Une lettre par ÉCRAN (`PHASE_INITIALE`/`phaseApres` du moteur). 6gen1 : domaine (sens qui change), injectivité démontrée f(x₁) = f(x₂) ⟹ x₁ = x₂ (produit en croix pour l'homographique) ou contre-exemple symétrique p ± 1 + preuve sur la moitié, forme canonique, réciproque « on échange x et y, on isole y » ligne à ligne puis vérification f⁻¹(f(x₀)) = x₀, image encadrée ; la réciproque suit la moitié `cote` (papier : droite, l'autre acceptée ; appli : `coteChoisi`). 6gen2 : domaine testé, valeur remarquable (angle de référence, quadrant), angle principal justifié « trig(α) = y et α ∈ image », vérification par l'identité trig∘arc, piège arcsin(sin θ) ≠ θ. 6gen3 : tout en rationnels exacts depuis l'instance ; CE (encadrement, carré parfait), condition de compatibilité (variante 4), élimination (fonction appliquée aux deux membres, injectivité, identité puis carré), trinôme ramené à des coefficients entiers premiers entre eux, t = argument et T = t² (valeur négative de T écrite « T₁ < 0 », jamais une égalité fausse), tri par la CE puis par u, v et la condition. 6gen4 : u, u′, formule de la dérivée de l'arcfonction, substitution, simplification, une ligne chacune ; N′D et ND′ calculés à part (quotient) ; l'appli affiche le « Résultat » de l'étape comme réponse attendue (plus les aides de niveau 2 brutes) et partage ses consignes d'écran avec les titres papier (`consigneEcranDerivee`) ; plus `regroupable` (2 à 4 étapes). 6gen5 : domaine, bornes et asymptotes en valeurs EXACTES (multiples de π, π², racines de fractions) puis « ≈ » au centième, parité justifiée (bornes non opposées, f(−x) = ±f(x)), figure des candidats en `figureHtml`. **Lectures** : 6gen1 domaine ℝ (a), image ℝ (d), bijection (e) ; 6gen3 CE = ℝ ; 6gen4 B a. **Niveaux** : méthode 0 (6gen2 directe, 6gen3 1–2, 6gen4 A) / 1 ; piège : 6gen1 non injective ou inéquation de domaine à coefficient négatif, 6gen2 composée (constant : l'existence est la question) ou arccos d'un négatif, 6gen3 variante 4, même arcfonction (constant), coefficient négatif dans la CE, 6gen4 D, E, G, A arccos, 6gen5 k < 0 (A, B), D, E, F. Mesuré (300 tirages libres + 30 par variante) : 6gen1 niv. 2–4, 10–13 min (moy. 11,0) ; 6gen2 niv. 1–3, 4 min ; 6gen3 niv. 2–5, 9–16 min (moy. 10,9 ; variante 4 niv. 5, 14–16) ; 6gen4 niv. 1–4, 6–10 min (moy. 7,0) ; 6gen5 niv. 2–4, 5–7 min. Corrections à la source (écran = aides = papier = corrigé ; audit du chapitre, § 1) : 6gen3 4c CE fausse dans 100 % des tirages (u > 0 était dans la CE) → CE = domaine de arccos, u > 0 dans la condition de compatibilité, m > 0 toujours (sinon condition vide) ; 6gen5 E constante arrondie au centième À LA GÉNÉRATION, w₀ = −c/k recalculé ; 6gen5 A, B distracteur « échelle » jamais −k (deux graphes identiques, 5–6 % → 0 sur 2 000) ; 6gen2 valeur EXACTE exigée (`estFormeExacte`), aides « π/2 ou −π/2 » ; 6gen1 aides « monotone sur chacun des intervalles de son domaine » (domaine troué), consigne de l'écran image, réponse attendue « f⁻¹(x) = … » (plus un texte de méthode), « \sqrt{…} » pour l'indice 2, « −\dfrac{…}{5} » ; 6gen4 « [object Object] » du corrigé papier (B, C : 100 %) disparu avec l'ancien corrigé, aides sans « 1\cdot », « \sqrt{1x} », « −3^{2}x », « (x+(−2))^{2} » ; 6gen5 virgule décimale (« 0{,}25 », « 1{,}57 ») et « ≈ » ; 6gen3 consignes « sous la forme d'un intervalle pour x ». Collecteur `corrige-6e1` (outils de `corrige-6e2-m1`, variables x₁, x₂, y, t, T, u, v, fonctions f, u, N, D, w de l'instance ; réciproque contrôlée sur les deux moitiés) : 2 910 tirages, ≈ 29 600 égalités, 0 fausse. **0 formule coupée sur papier** (une ligne de calcul doit tenir dans la colonne du milieu, ≈ 230 px, même sécable) : 6gen3 variante 4 calculée avec les lettres u, v définies en tête (un produit de deux carrés de binômes en x sortait de la colonne ; le résultat remplace u et v), discriminant à gros coefficients en trois morceaux b², 4ac, Δ = b² − 4ac (`trinome`, au-delà de 20 caractères visibles ; brique partagée `lignesTrinome` intacte) ; 6gen4 D calculé avec R(x) = √(1 − u²), S(x) = N(x) + D(x) et D(x) nommés, expression complète seulement dans le Résultat encadré (produit de deux fractions) ; 6gen4 B produit éclaté u′g puis ug′ ; 6gen5 formules du résultat groupées `{…}`. Documents réels (2 graines × 4 plans partiels — la machine partagée tuait Chromium faute de mémoire sur le plan complet —, évaluation 2 séries + aménagée + feuille + Word du corrigé) : 0 débordement, 0 formule coupée à 680, 820 et 1 280 px, 0 `.katex-error`.

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

## 5e ch. 2, lot G — 5gen50–5gen53 (nouveaux, notés)

Corrigés `generateurs5e/{detectiveTrig,anglesRadians,sinusoidePoints,associerCourbes}/corrigeDetaille.ts`
(partagés avec l'appli, une lettre par écran). 5gen50 : a) contrôle de la ligne (règle face à la
copie, « ≠ »), b) la règle, c) résolution reprise, vérification (proportion du disque, f(x) = max,
une solution remise dans l'équation). 5gen51 : tours retirés / ajoutés au même dénominateur, repères
π/2, π, 3π/2 au dénominateur commun, angle de référence et signe, cos² + sin² = 1, quotient de tan ;
figure avec M en `figureHtml` (énoncé papier : cercle sans M). 5gen52 : T et Φ substitués (ω « en
ligne », jamais \dfrac{2π}{1}), une abscisse par ligne (+ T/4, ordonnée en justification), report
± T ; figures période puis courbe complète (la réponse est un graphique ; énoncé sans repère : aucune
place de réponse). 5gen53 : lectures ligne à ligne (y_max, y_min, b, |A|, T puis ω, Φ puis φ = −ωΦ),
figure annotée ; énoncé = 4 expressions + 4 courbes. Profils : 5gen50 `forme` = support (type
d'erreur = verdict tiré dans la série) ; 5gen51 cas particulier « quadrant-I » (axe et tan non définie
restent des verdicts) ; 5gen52 `forme` = variante (+ signe de A en « sansPi ») ; 5gen53 `forme` =
variante, l'association est le verdict (aucun groupe à verdict : aucun nom de variante ne donne la
réponse). Aucun `calcul` (tout exact). Niveaux (200 tirages libres + 30 par variante) : 5gen50 niv. 4,
8 min ; 5gen51 niv. 1–2, 8 min (lectures b, c) ; 5gen52 niv. 2–3, 8 min ; 5gen53 niv. 2, 6 min
(quatre lectures). Collecteur (outils de `corrige-5e2-m2` recopiés, `env.ts` : x = chaque solution,
plus π/2 + kπ pour les valeurs écartées) : 1 190 tirages, ≈ 12 600 égalités, 0 fausse. Documents réels
(2 graines, évaluation 2 séries + aménagée + feuille) : 0 débordement à 680 et 1 280 px, 0 formule
coupée, 0 `.katex-error`. Plan réel `construirePlan` (2 séries, calculatrice interdite / autorisée,
cas particulier coché) : même structure, verdicts différents, QR `?code=` 26 / 26 identiques.

## 6e ch. 2, lot G — 6gen148–6gen151 (nouveaux, notés)

Socle d'écrans de 5gen54–57 réutilisé (`AppEcransTrigo` + `DefinitionEcrans`, options ajoutées sans
effet sur le 5e : `eyebrow`/`sousTitre`, `ChampEcran.apercu`, `aidesChoixDeuxNiveaux`) ; saisie
`moteur6e/lectureExpoLotG.ts` (évaluateur du chapitre, milliers, unité finale, préfixe « k = »,
`lireDroite` : toute équation de droite), écritures `ui6e/nombresExpoLotG.ts`, figure
`ui6e/figureExpoLotG.ts` (quadrillage d'une unité, `clipPath` à identifiant dérivé du contenu).
Corrigés `generateurs6e/{lireCourbeExponentielle,tangenteExponentielle,modeleSaturation,interetsComposes}/corrigeDetaille.ts`,
une lettre par écran. **6gen148** (courbe k·aˣ + c) : énoncé papier = courbe + asymptote en
pointillés, sans point marqué, l'énoncé dit que les points d'abscisses 0 et ±1 sont sur des nœuds ;
figure annotée (points et coordonnées) en `figureHtml` sous l'étape b (7 cm) ; lectures « une relation
par chose lue » (`y = c`, `f(0) = …`, `f(1) = …`) ; cas particulier `asymptote-axe` (c = 0). **6gen149**
(tangente et ln a) : ln a = pente en (0 ; 1), écrit `\ln(a)` comme le cours, valeurs exactes jusqu'à
la dernière ligne ; en `en-zero` le signe est le verdict (choix fermé, 50/50) → piège constant 0
(niveau 3 dans les deux issues). **6gen150** (L + C·qᵗ) : trois vraies questions papier (modèle,
prévision, seuil), mesures entières exactes, q^t écrit r^{t/d} (q jamais arrondi dans un calcul),
seuil par ln à la calculatrice ; `calculatriceIndispensable`. **6gen151** (intérêts composés) : trois
vraies questions, formule des intérêts composés dans l'énoncé, limite par m = n/r, aucun logarithme ;
`calculatriceIndispensable`. Lectures : 6gen148 a seulement. Méthode 1 / 0 / 2 / 1 ; piège : 6gen148
k < 0 ou a < 1, 6gen149 pente négative ou x₀ < 0 (sauf `en-zero`), 6gen150 C < 0. Mesuré (400 tirages
libres + 50 par variante, `niveauEtDuree`) : 6gen148 niv. 3–4, 9 min ; 6gen149 3–4, 9 min ; 6gen150 5–6,
15 min ; 6gen151 4, 9 min. Collecteur (outils de `corrige-6e3-m1` recopiés ; espace fine des milliers
lue dans un nombre, « ≈ » toléré à la demi-unité du dernier chiffre écrit, × (1 + |x|) pour une droite
à coefficients arrondis) : 2 100 tirages, ≈ 47 700 égalités, 0 fausse. Documents réels (2 graines,
calculatrice interdite / autorisée, évaluation 2 séries + aménagée + feuille + Word du corrigé) :
0 débordement à 680, 820 et 1 280 px, 0 `.katex-error`.
## 6e ch. 2, lot G — 6gen144–6gen147 (nouveaux, notés)

Socle d'écrans de 5gen54–57 recopié dans le 6e (`ui6e/ecransExp.types.ts`, `moteur6e/sessionEcransExp.ts`,
`components6e/EtapeEcransExp.tsx` + `AppEcransExp.tsx`) avec quatre ajouts : `copie?` (copie numérotée de
6gen88, `CopieEleve`), `approchee?` (valeur décimale proche d'une valeur exacte : message, AUCUNE
tentative), aide à deux niveaux aussi sur un choix fermé, et `piege` ciblé affiché sous un choix fermé
révélé. Saisie `moteur6e/lectureValeurExp.ts` (équivalence numérique sur l'évaluateur du chapitre :
puissances, e, ln, fractions, ±∞, ensembles, « − »), écritures `ui6e/nombresExp.ts`. Corrigés
`generateurs6e/{puissancesSansCalculatrice,limitesReference,modeleTableau,detectiveExponentielles}/corrigeDetaille.ts`,
une lettre par écran. **6gen146** (puissances sans calculatrice, AUCUN logarithme) : simplifier
(exposant puis valeur), comparer (exposants, sens de la base, conclusion ; verdict <, =, > tiré
20/40/40), exposant en x puis valeur en x₀. **6gen145** (limites de référence) : forme de chaque
morceau, référence (R1 (eᵘ−1)/u, R2 (aˣ−1)/x, R3 xⁿ/aˣ, R4 xⁿaˣ en −∞, R5 « aucune ») — R1 et R2
acceptées l'une pour l'autre en expo0, R3 pour R4 —, valeur exacte ; L'Hôpital accepté au barème ;
`groupe_reference` (le nom de la variante = la référence). **6gen147** (tableau → modèle) : rapports
(exacts ou au centième), verdict exponentiel / linéaire 50/50 (choix fermé, pas un cas particulier),
paramètres exacts, prévision arrondie (« = » quand l'arrondi est la valeur exacte) ; tableau
`tableauHtml` dans l'énoncé ; deux vraies questions papier (modèle / prévision) ;
`calculatriceIndispensable`, `calcul: "calculatrice"`. **6gen144** (détective, mécanique de 6gen88) :
ligne, erreur (4 descriptions), correction ; huit types d'erreur = variantes, `groupe_erreur` ; énoncé
papier = copie numérotée (marge rouge) + consigne globale, étapes a, b, c dans le corrigé ; la saisie
qui reprend la valeur de la copie reçoit le piège ciblé. Lecture : 6gen146 comparer b (base comparée
à 1). Méthode 0 (6gen146, règles imposées) / 1 ailleurs ; piège : 6gen146 base < 1 (comparer) ou
inverse hors quotient, 6gen145 1 (constant dans le groupe), 6gen147 pas 2, 6gen144 0 (le type
d'erreur est la réponse de l'écran 2) ; nombres 1 pour 6gen147 seulement.
Mesuré (`niveauEtDuree`, 2 000 tirages par variante) : 6gen146 niv. 1–2, 6–7 min ; 6gen145 niv. 4,
8 min (constant dans le groupe) ; 6gen147 niv. 4 (pas 1) / 5 (pas 2), 11 min ; 6gen144 niv. 3, 8 min
(constant). Collecteur (outils de `corrige-6e3-m1` recopiés ; `\lim` évaluée en x = 400 — les
exponentielles débordent plus loin —, « ≈ » toléré à la demi-unité du dernier chiffre écrit, notation
scientifique comprise ; candidats de 6gen144 = solutions de la copie corrigée) : 2 280 tirages,
≈ 14 500 égalités, ≈ 1 700 relations, 0 fausse. Documents réels (`construirePlan`, évaluation 2 séries
+ aménagée + feuille, calculatrice interdite / autorisée) : 0 débordement à 680, 820 et 1 280 px,
0 `.katex-error`, groupes : verdict de B ≠ A ; QR `?code=` 25 / 25 identiques.
## 6e ch. 1, lot G — 6gen156–6gen159 (nouveaux, notés)

Socle d'écrans du 5e (`AppEcransTrigo`) avec deux options additives, sans effet ailleurs : `approchee`
(valeur décimale proche d'une valeur exacte, angle en radians ou arrondi à l'unité : message, AUCUNE
tentative) et `placeholders` des intervalles. Saisie commune `moteur6e/lectureCycloLotG.ts` (évaluateur
du chapitre : π, √, fractions, arcsin/arccos/arctan, « sin⁻¹ », « arcsinx » collé, unité finale,
préfixes « θ = », « f′(x) = », « g(x) = », ±∞ des bornes, listes « ; » ou « aucune »,
`diagnostiquerEnsemble` : crochets, ±∞ ouverts, ordre libre), écritures `ui6e/nombresCycloLotG.ts`,
figure `ui6e/figureCycloLotG.ts` (une même échelle ; lignes d'un axe en multiples de π/4 ou π/2, de
l'autre entières). Corrigés `generateurs6e/{problemesArcfonctions,etudeCyclometrique,lireTransformeeArc,restreindreInverser}/corrigeDetaille.ts`,
une lettre par écran. **6gen156** (problèmes, Transférer) : réfraction, angle limite (verdict « rayon
réfracté ? » en choix fermé 50/50, à 3° au moins de θ_L, jamais cas particulier : piège constant 1 →
niveau 5, 9 min dans les deux issues), angle de vue (méthode 2 : l'élève construit θ(x) = arctan(b/x) −
arctan(a/x), dérivée, √(ab)), échelle ; trois vraies questions papier, schéma sans valeur cherchée,
degrés au dixième ; `calculatriceIndispensable`, `calcul: "calculatrice"`. **6gen157** (étude, Transférer) :
domaine, dérivée, zéros, variations (choix fermé, « décroissante sur ℝ₀ » parmi les leurres), valeurs du
tableau ; énoncé papier = fonction + consigne globale, tableau de variation SVG en `figureHtml`
(`ui6e/tableauVariationsCyclo.ts` : double barre d'une valeur interdite, bornes sans f′) ; lecture : a
pour k·arctan x − x et x·arctan(x/k) (domaine ℝ) ; piège 1 pour le domaine fermé et ℝ₀. **6gen158**
(lire c + k·arc(mx + n), Appliquer) : forme donnée avec m > 0 ; bornes de l'image, centre et nœuds
marqués sur les lignes (testé sur 2 000 tirages par variante) ; arctan : k, c AVANT m, n ; énoncé
papier = courbe sans coordonnée (les nœuds marqués sont dits nœuds), figure annotée dans le corrigé ;
lectures a, b ; piège = k < 0 ou arccos. **6gen159** (restreindre, Appliquer) : trinôme (x₀ d'un côté du
sommet, piège si à gauche) ou sin / cos / tan hors restriction principale (piège 1) ; trois vraies
questions ; g(y₀) = angle DE L'INTERVALLE. Profils : `forme` = variante, aucun cas particulier, aucun
groupe à verdict (aucun nom de variante ne donne une réponse). Mesuré (`niveauEtDuree`, 300 tirages par
variante) : 6gen156 niv. 4 (réfraction, échelle) / 5 (réflexion, angle de vue), 9–11 min ; 6gen157 niv. 3–4,
11–12 min ; 6gen158 niv. 2–3, 8 min ; 6gen159 niv. 3–4, 8 min. Moteurs : 2 000 tirages par variante
(réponses recalculées numériquement, écritures justes variées, « − », illisible, approchée, pièges),
0 anomalie. Collecteur (outils de `6gen148-151/corrige` recopiés ; `^{\circ}` → × π/180 et tolérance des
« ≈ » en degrés convertie, `\limits` ignoré, variables indicées `\theta_2`) : 0 égalité fausse. Documents
réels (`construirePlan` 2 séries + aménagée + feuille, calculatrice interdite / autorisée ; Word du
corrigé) : 0 débordement à 680, 820 et 1 280 px, 0 `.katex-error`.
## 4e ch. 1, lot H — gen123–gen125 (nouveaux, notés)

Corrigés `4e/generateurs/{lectureParabole,differencesSecondes,equationParabolePoints}/corrigeDetaille.ts`
(partagés avec l'appli, une lettre par écran). **gen123** (Connaître) : a) a, puis `c=f(0)=…>0`, puis
`x_S=…<0`, `-\dfrac{b}{2a}<0`, `\dfrac{b}{2a}>0`, `b<0` (règle du cours) ; b) `x_S`, `y_S`, `x=…`,
vérification `f(x_S−2)=f(x_S+2)` ; c) `f(z)=0` par zéro (ou `y_S>0` « ne coupe jamais »), `f(0)=c`,
milieu des zéros ; d) image, figure annotée (S, zéros, (0 ; c), axe). Énoncé papier = figure + consigne
globale ; lectures b, c, d → niveau 1, 7 min (constants : le nombre de zéros est le verdict,
`groupe_zeros`). **gen124** : une ligne par différence `d_1=f(1)-f(0)=5-2=3`, puis `s_1=d_2-d_1=…`,
tableau en escalier (SVG, `tableauSvg(e, 2)`) en figure ; verdict testé (`d_j\neq d_{j+1}`,
`s_1=s_2=s_3`, `s_1\neq 0`) ; `2a=s`, `a`, `c=f(0)`, `a+b+c=f(1)` résolu ligne à ligne, vérification sur
la dernière valeur. Variantes second / premier / aucun dans `groupe_degre` (a demi-entier = issue à 40 %
dans « second » : deux variantes « second » donnaient le même verdict en A et B dans 7 plans sur 30) ;
niveau 2, 10 min CONSTANTS (`sansCharge`, comme gen74). **gen125** : données une par ligne, forme de
départ ; a par P une opération par ligne, ou système (1) B, (2) C, (1) × x₂, soustraction (b disparaît),
a, b par substitution ; développement ligne à ligne, vérification par un point ; énoncé papier = données
(ou figure, P marqué) avec la consigne, aucune question. Méthode 0 (sommet, zéros) / 1 (graphique, trois
points) → niveaux 2–3, 8 min ; pas de groupe à verdict (la forme découle des données ; en « graphique »,
sommet ou zéros lisibles tiré 50/50, hors `forme`). Mesures : moteurs 2 000 tirages par variante
(réponses recalculées depuis les données, écritures équivalentes, « − – — », illisible) 0 erreur ;
collecteur (outils de `corrige-4e2-m1`, relations =, <, >, ≠ évaluées) 1 300 tirages, ≈ 35 000
relations, 0 fausse ; plans réels (1 question, 30 × 2 séries) verdict B ≠ A 30/30 (gen123, gen124) ;
documents (feuille, évaluation 2 séries, aménagée) 0 débordement à 680 et 1 280 px, 0 `.katex-error`.
## 4e ch. 1, lot H — gen126–gen128 (nouveaux, notés)

Corrigés `4e/generateurs/{troisEcritures,detectiveFonction,associerParaboles}/corrigeDetaille.ts`
(partagés avec l'appli, une lettre par écran). Coquille commune `AppTransfertSecondDegre` pour
gen126 et gen128 ; extensions additives sans effet sur gen115–120 : `ChampExpression.forme`
(`developpee | canonique | factorisee | evidence`, `moteur/formeEcriturePolynome.ts` sur l'arbre de
`expressionGenerale::arbreExpressionGenerale`) — écriture JUSTE dans une autre forme = statut
`forme`, message sans perte de tentative (comme `parse_error`) ; préfixe « f(x) = » / « y = »
toléré ; `EcranTSD.choix.explications` (choix faux expliqué, texte brut) ; `ChampEnsemble.prefixeApercu` ;
`idDebug`. **gen126** (trois écritures) : développement (carré avec double produit, a distribué,
réduction), zéros sur la forme canonique (carré isolé, deux racines opposées ou « carré = négatif »),
forme factorisée revérifiée en développant ; a en évidence, carré complété, nombre sorti du crochet
× a ; sommet par le milieu des zéros. Verdict « aucun zéro » (variante canonique, 1/3 des tirages,
≈ 48 % dans 30 plans réels) : jamais cas particulier, l'écran factorisé disparaît, niveau et durée
CONSTANTS (3, 8 min, `sansCharge`). Lecture : le sommet de la variante développée. **gen127**
(détective, modèle gen121) : variante = support, type d'erreur tiré 50/50 (mêmes contraintes sur les
nombres), écran 3 = champs de la coquille (sommet, image construite, extremum), résultat de la copie
ciblé ; corrigé : ligne refaite « ≠ copie », règle, copie reprise bloc par bloc ; `sansCharge`
(niveau 3, 8 min pour les deux types). **gen128** (associer, modèle 5gen53) : sommets, zéros et
ordonnées à l'origine entiers, quadrillage d'une unité, MÊME échelle en x et y, fenêtre ≤ 14 × 14 ;
énoncé papier sans point marqué, figure annotée (sommet, zéros) dans le corrigé ; lectures a–d,
piège 1 → niveau 2, 6 min. Profils : `forme` = variante, aucun cas particulier, aucun groupe à
verdict (aucun nom de variante ne donne la réponse). Barème : « moitié des points sur b) » (pas
« de b) », que `reecrireRenvois` ne réécrit pas). Mesures : moteur 2 000 tirages par variante (0
anomalie ; gen126 : 21 300 champs — juste autrement écrite, « − – — », illisible, autre forme,
pièges, faux), collecteur (outils de `gen122` recopiés, `env.ts` : x générique + zéros, fonctions f,
g, h, p) 1 260 tirages, ≈ 17 700 égalités, 0 fausse ; documents réels `construirePlan` (2 graines,
évaluation 2 séries + aménagée + feuille + Word du corrigé) : 0 débordement à 680, 820 et 1 280 px,
0 `.katex-error` ; `?code=` 25 / 25.

## 5e ch. 1, lot G — 5gen61–5gen63 (nouveaux, notés)

Socle d'écrans du 5e ch. 2 (`AppEcransTrigo` + `DefinitionEcrans`) réutilisé, options ADDITIVES sans
effet sur 5gen54–57 et 6gen148–151 : `aReprendre?` (saisie juste en valeur mais pas sous la forme
demandée — polynôme non développé / non réduit, infini fermé, bornes dans le désordre : message,
AUCUNE tentative), `AideEcran.figure` (figure d'aide de niveau 2), écran « intervalles » avec
`placeholders` et `vide` (bouton ∅ → `VALEUR_VIDE`). Saisies : `moteur5e/polynomeSaisi.ts`
(coefficients + forme de l'écriture ; « x² », « x^2 », produits implicites, « − – — »),
`moteur5e/ensembleSaisi.ts` (réunions d'intervalles à bornes `Q` en forme normale, ∅, ℝ, ℝ∖{…},
« +inf », « ∞ », fractions ; écriture `ensembleL`). Corrigés `generateurs5e/{composerPolynomes,
domaineParImage,composeeDiagonale}/corrigeDetaille.ts`, une lettre par écran. **5gen61** (composer des
polynômes) : vraies questions papier a) (f∘g)(x) [étapes a, b], b) (g∘f)(x), c) vérification en un
point, d) f∘g = g∘f ? (deux affines seulement : une parabole et une affine non identité ne commutent
jamais) ; bloc « Carré » (A + B)² puis distributivité et réduction ligne à ligne, `f\left(…\right)`
(jamais `\big(` devant un moins) ; verdict « égales » 50/50 (même point fixe ou deux translations).
**5gen62** (domaine par l'image) : énoncé papier = f, g + consigne globale ; Im g, dom f,
Im g ∩ dom f et dom(f∘g) dans le corrigé (condition g(x) ∈ dom f résolue en x, vérification sur un x
entier du domaine) ; cas particulier `domaine-vide` (≈ 10 %, jamais filtré par le générateur),
Im g ⊂ dom f ≈ 25 % ; `forme` = famille de g. **5gen63** (composée sur un seul repère, y = x) :
`ui5e/figureComposeeDiagonale.ts` (même échelle en x et y, carreaux d'une unité, valeurs entières aux
nœuds, extrémités pleines / creuses, graphes complets, au plus un nœud commun entre Cf et Cg), énoncé
papier = figure + consigne ; TOUJOURS trois étapes au corrigé (c = seconde lecture ou conclusion
« n'existe pas »), figure de la construction en `figureHtml` (7 cm) ; « existe » 50/50 (verdict),
`forme` = variante. Niveaux (`niveauEtDuree`, 2 000 tirages par variante) : 5gen61 niv. 2, 12 min
(affines) / 10 min (second degré), identiques dans les deux verdicts ; 5gen62 niv. 2–3 (piège = valeur
exclue : 1/(x − c), racine au dénominateur, 1/x), 10 min ; 5gen63 niv. 2, 6 min (lectures a et c,
piège CONSTANT 1 : lié aux ronds vides, il était corrélé au verdict, 63 % / 54 %). Collecteur (outils
de `corrige-6e2-m2` recopiés, `env.ts` : f et g de l'instance, x générique et points du domaine, y
pour les identités « g(…) = y », étape d ignorée quand le domaine est vide) : 920 tirages, ≈ 8 300
relations, 0 fausse. Documents réels (`construirePlan`, 2 plans, évaluation 2 séries + aménagée +
corrigé + grille + feuille, calculatrice interdite / autorisée, cas particulier coché) : même
structure d'une série à l'autre, 0 débordement à 680, 820 et 1 280 px, 0 `.katex-error`.
## 6e ch. 1, lot G — 6gen152–6gen155 (nouveaux, notés)

Socle `AppEcransExp` du 6e ch. 2 réutilisé (ajouts sans effet sur 6gen144–147 : `eyebrow`/`sousTitre`,
`ChampEcran.apercu`) ; saisie `moteur6e/lectureValeurExp.ts` (π, √, e, arcfonctions, fractions, « − ») ;
écritures exactes `ui6e/nombresRecip.ts` (multiples de π, valeurs remarquables, c·√r simplifié et
dénominateur rationnel). Corrigés `generateurs6e/{detectiveCyclometriques,identitesCyclometriques,grapheReciproque,deriveeReciproquePoint}/corrigeDetaille.ts`,
une lettre par écran. **6gen152** (détective, mécanique de 6gen144) : neuf types d'erreur = variantes,
`groupe_erreur`, énoncé papier = copie numérotée + consigne globale, `sansCharge` (niveau 3, 8 min
constants). « Quelle ligne ? » est un verdict : 0 à 3 lignes justes (préliminaires du scénario puis
début de la copie canonique) précèdent la ligne fausse, tiré 1/4 chacun (`donnees.av`) — positions 1–4
à 25 % ± 3 dans chaque type (18 000 tirages), copies de 2 à 6 lignes ; `forme` = type d'erreur seul
(jamais la ligne). **6gen153** (identités) : arcTrig (θ dans l'image ? verdict 50/50, puis angle ramené :
bornes au même dénominateur, angle supplémentaire / opposé, tour retiré), trigArc (signe 50/50 — le
piège « a < 0 » pour cos∘arcsin… —, puis identité substituée et racine simplifiée ligne à ligne),
littéral (domaine parmi quatre, puis forme en x : deux vraies questions papier) ; une saisie qui
recopie sin/cos/tan/arc ou une valeur approchée est arrêtée SANS tentative (`approchee`) ; `forme` =
variante + arcfonction (jamais le verdict) ; piège constant par variante, trigArc `sansCharge`.
**6gen154** (graphe) : spline d'Hermite monotone par trois nœuds entiers, fenêtre [−6 ; 6]², même
échelle, pente p/q en A lue entre deux nœuds de la tangente ; domaine ≠ image (sinon l'échange ne se
voit pas) ; quatre vraies questions papier (A′, domaine et image, graphe A–D, pentes), figure + quatre
graphes dans l'énoncé, figure f / f⁻¹ / y = x annotée en `figureHtml` ; lectures a, b, c ; piège = rond
vide ou f décroissante. **6gen155** (dérivée d'une réciproque) : verdict f′(x₀) = 0 tiré 50/50 dans
chaque famille (jamais un cas particulier) ; l'appli n'a que trois écrans dans ce cas (quatre puces
fixes) mais le corrigé garde une étape d « n'existe pas » (tangente verticale) : niveau 3 et 10 min
constants (`sansCharge`) ; énoncé papier « Calcule (f⁻¹)′(y₀), ou justifie que ce nombre n'existe pas ».
Aucun `calcul: "calculatrice"` (tout exact). Mesuré (`niveauEtDuree`, 2 000 tirages par variante) :
6gen152 niv. 3, 8 min ; 6gen153 niv. 2 (arcTrig, littéral) / 3 (trigArc), 6 min ; 6gen154 niv. 1–2,
7 min ; 6gen155 niv. 3, 10 min — constants dans chaque verdict. Moteurs : 38 000 tirages (réponses
recalculées indépendamment, écritures équivalentes, « − – — », illisible, approchée, pièges) 0 erreur ;
collecteur (outils de `6gen144-147/corrige` recopiés, variables α, x, y, fonction f de l'instance,
`f'` par différence) 2 000 tirages, ≈ 12 400 égalités, ≈ 1 600 relations, 0 fausse ; plans réels
`construirePlan` (2 séries, calculatrice interdite / autorisée, + aménagée + feuille) : 0 débordement
à 680 et 1 280 px, 0 `.katex-error`, `groupe_erreur` B ≠ A, QR `?code=` 36 / 36.
## 5e ch. 1, lot G — 5gen58–5gen60 (nouveaux, notés)

Socle d'écrans du 5e ch. 2 réutilisé (`AppEcransTrigo` + `DefinitionEcrans`) avec des options
ADDITIVES, sans effet sur 5gen54–57 et 6gen148–151 : `copie?` (copie numérotée, `CopieEleve`),
`approchee?` (valeur décimale proche d'une valeur exacte : message, aucune tentative),
`piegeChoixRevele` (message ciblé sous un choix fermé révélé), `ChampEcran.raccourcis` (boutons qui
AJOUTENT « [ », « ∞ », « ∪ », « ℝ », « √ »…) et `ChampEcran.apercuLatex` (aperçu KaTeX propre au champ).
Ensembles de réels : `moteur5e/ensemblesReels.ts` (lecture libre — crochets, ∪/U, ±∞/inf, ℝ/R,
ℝ \ {a}, {a}, ∅, préfixe « dom f = » ignoré ; crochet fermé du côté de ∞ ou intervalle à l'envers =
écriture FAUSSE lue, jamais illisible ; normalisation, égalité borne à borne et crochet par crochet,
`ensembleL`). Corrigés `generateurs5e/{detectiveFonctions,lireDomaineImage,composeePoint}/corrigeDetaille.ts`,
une lettre par écran. **5gen58** (détective, mécanique de 6gen144) : six types d'erreur = variantes,
`groupe_erreur` ; énoncé papier = copie à marge rouge + consigne globale ; a) la ligne refaite ou une
valeur que la copie garde à tort, b) la règle (illustration numérique « 2 < 3 », « −2 × 2 > −2 × 3 »),
c) résolution reprise + vérification ; domaine vide de « union » = cas particulier `domaine-vide`
(≈ 8 %) ; « n'existe pas » saisi dans le champ numérique (portion) = réponse lisible fausse, ciblée.
**5gen59** (Connaître) : courbe affine par morceaux, sommets entiers, quadrillage d'une unité, axes
fléchés, extrémités pleines / creuses, flèches sinon graphique déclaré complet (`phraseGraphique`) ;
trois VRAIES questions papier (dom f, Im f, f(a) existe-t-il ?) ; figure des deux projections
(domaine en vert sur Ox, image en orange sur Oy) en `figureHtml` du résultat b ; f(a) existe = verdict
50/50, a pris en un endroit délicat (extrémité creuse ou pleine, trou, écart, saut, hors du graphe).
**5gen60** : ordre f∘g / g∘f tiré, écran 1 = fonction appliquée d'abord (symboles f / g) + valeur
intermédiaire, existence = verdict (« n'existe pas » ≈ 40 %, bord du domaine recherché : √0 existe,
√0 au dénominateur non), valeur exacte (√8 = 2√2, 2/√5 = 2√5/5 acceptées) ; une seule question papier
(« calcule, ou justifie que ce nombre n'existe pas ») ; écran 3 absent si la composée n'existe pas
(trois puces, `nombrePuces`). Niveaux CONSTANTS (`sansCharge`, mesurés sur 2 000 tirages par variante) :
5gen58 niv. 3, 8 min (groupe) ; 5gen59 niv. 2, 5 min (trois lectures) ; 5gen60 niv. 3, 8 min (les deux
issues). Profils : `forme` = scénario | ligne (5gen58), variante (5gen59), variante | ordre (5gen60) ;
tout exact. Mesures : moteurs 2 000 tirages par variante (réponses recalculées indépendamment —
domaines et images par balayage, composées par évaluation directe —, écritures équivalentes, « − – — »,
illisible, résultat de la copie) : 0 anomalie ; collecteur (outils de `corrige-6e2-m1` + relations
d'ordre numériques) 2 200 tirages, ≈ 10 200 égalités, 0 fausse ; documents réels `construirePlan`
(évaluation 2 séries + aménagée + feuille) : 0 débordement à 680, 820 et 1 280 px, 0 `.katex-error` ;
`groupe_erreur` : verdict B ≠ A 30 / 30 plans ; `?code=` 36 / 36.
