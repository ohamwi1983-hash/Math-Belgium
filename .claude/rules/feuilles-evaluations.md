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
  - "src/components/admin/ChampPoints.tsx"
  - "src/components/admin/conception/**"
  - "src/lib/pointsAutomatiques.ts"
  - "src/lib/compositionEleve.ts"
  - "src/components/eleve/**"
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
| `regroupement` | Regroupement a), b), c) : rempli par le REGISTRE depuis l'énoncé papier (`export/regroupementsPapier.ts`, une entrée dans `REGROUPEMENTS`) — rien à écrire dans l'adaptateur. Voir la section « Regroupement a), b), c) ». |
| `titrePapier` | Facultatif. `(instance) → { titre, sectionId? } \| null` : titre PROPRE à l'instance à la place de celui de la section du générateur (gen83 « lecture » : « Composantes d'un vecteur », `sectionId: "composantes"`). `evaluationLocal.ts::itemExercice` remplace alors `titreSection` (titre de section de la copie, du corrigé, de la copie et du corrigé Word), `notion` (étiquette de la feuille, « Exercice n — … » du corrigé de la feuille) et `sectionCours` (« Je fais le point » : section retrouvée par son id dans le chapitre de l'élément ; introuvable → le titre seul, sans numéro). Le titre entre dans la clé de regroupement : deux titres différents ne se regroupent pas. `null` / absent : rien ne change (documents identiques). |

Toutes les valeurs viennent des MÊMES fonctions que l'écran interactif (`formatReponseAttendue…`,
`consigneEcran`, aides) — jamais une seconde source recalculée à part.

Le pipeline (`lib/evaluationLocal.ts::appliquerEnoncePapier`) fait le reste : énoncé imprimé tiré de
`enoncePapier`, `etapesCorrige` (titres « Étape n — consigne » du corrigé, préfixe « Étape n (…) — »
retiré), critères rattachés à leur étape (`etape`), renvois « 0 pt sur a) et b) » réécrits en « sur
les étapes 1 et 2 » (ou en lettre de question papier).

## Niveau de difficulté et durée (décision de l'utilisateur)

Les étoiles ★/★★/★★★ (posées au jugement) sont remplacées par un **NIVEAU 1–7** calculé par une grille
commune, affiché « numéro · catégorie » (« 4 · difficile »), et la durée constante par générateur par une **durée PAR
EXERCICE** calculée avec les mêmes critères. Module commun `export/niveauDifficulte.ts`
(`niveauEtDuree(adaptateur, instance) → { niveau, categorie, score, criteres, dureeMinutes, provisoire }`,
testable seul) ; contrat `criteresDifficulte(instance) → CriteresDifficulte`
(`genererFeuilleExercices.ts`).

- **Score par exercice** (instance tirée), niveau = score + 1 (1 à 7 ; le 7 est gardé). **Catégories**
  (décision du 22/11/2026, calées sur la distribution mesurée — niveaux 6 et 7 presque inexistants :
  variantes d'exercices, tous chapitres, Appliquer 1:81 2:217 3:315 4:159 5:108 6:7 7:0, Transférer
  1:3 2:17 3:150 4:128 5:154 6:25 7:1, Connaître 1:14 2:18 + vrai/faux au niveau 2) : **1 très facile,
  2 facile, 3 moyen, 4 difficile, 5 à 7 très difficile** — `categorieDuNiveau`, SEULE fonction utilisée
  partout (avec `LIBELLE_CATEGORIE`, `libelleNiveau` « 4 · difficile », `libellePlageNiveaux`,
  `morceauxLegende`, `rangCategorie` 1–5 pour la couleur). Le calcul du niveau ne dépend pas de la
  catégorie. Plus aucun « Base / Intermédiaire / Avancé / Réel » comme libellé de niveau.
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
  seule question) n'est pas compté à part (dit dans l'infobulle « Niveaux 2 à 4 · facile à
  difficile, ≈ 7 min… »). Numéros sur une pastille teintée par catégorie (`niv-c1` … `niv-c5`,
  jetons `--niv1-fond` / `--niv1-encre` … `--niv5-*` de `index.css`, clair ET sombre), « · difficile »
  quand toute la plage est dans une catégorie et la largeur > 640 px. Générateur pas encore noté : niveau converti
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
- **Compte toujours visible** : l'ancien badge flottant (`CompteurFlottant`) et la barre du bas ont
  été remplacés par le panneau « Ma feuille / Mon évaluation / Mon examen » de la page de conception
  (section « Page de conception » plus bas) : mêmes totaux (questions, points, « Durée estimée »).
- **Affichage** : badge « numéro · mot » (« 4 · difficile », `badgeNiveau` / `niveauHtml`, `.niveau
  .num/.mot`) en tête de chaque exercice de la feuille et de sa version aménagée, et sur chaque ligne
  d'un groupe a), b), c) (en deux colonnes, la ligne n'imprime que la case du numéro : « · très
  facile » faisait passer les données sur trois lignes ; le mot reste dans l'`aria-label` et dans la
  plage en tête) ; groupe : « niv. 2–4 · facile à difficile » en tête. Le MOT porte
  l'information (lisible en noir et blanc) ; la case du numéro est teintée sur une échelle graduée à
  5 pas, du plus clair au plus foncé (`niv-c1` … `niv-c5`, `print-color-adjust: exact`), qui reste
  ordonnée en niveaux de gris. Légende en tête de la feuille « Niveau : 1 très facile · 2 facile ·
  3 moyen · 4 difficile · 5 à 7 très difficile. Il monte avec… » (numéros dans leurs cases teintées).
  Rien sur la copie d'évaluation, son corrigé, sa grille, l'examen ni en Word (les étoiles n'y
  étaient pas) : ces documents n'impriment pas de niveau.
- **Chapitres notés** : 6e ch. 5, 6e ch. 4, 4e ch. 3, 6e ch. 3, 5e ch. 3, 4e ch. 4, 4e ch. 2, 4e ch. 5, 5e ch. 2, 6e ch. 2 (6gen6–12), 4e ch. 1 (gen7–9, gen55), 6e ch. 1 (6gen1–5), 5e ch. 1 (5gen1–5), 5e ch. 4 (5gen20–24), 4e ch. 6 (gen20–29, gen82–91), 4e ch. 7 (gen42–54) (ni `difficulte` ni
  `dureeMinutes` : `criteresDifficulte` seul). **Conversion PROVISOIRE** pour les autres adaptateurs
  (non encore notés) : leurs étoiles → niveau ★ 2, ★★ 3, ★★★ 5, durée = leur
  constante `dureeMinutes` ; sans étoiles → rien d'affiché. Vrai/faux : niveau 2 (facile), provisoire.
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

## Regroupement a), b), c) (décision de l'utilisateur, aperçus validés)

« Pour des économies de place et une certaine cohérence, regroupe dans les feuilles (d'exercices, de
remédiation, d'évaluation et d'examen) tous les exercices au sein d'un même générateur qui ont la même
consigne générale, comme pour les vrai ou faux. » Exemples validés : « Exercice 1 — Résous chaque
équation par la méthode la plus rapide. a) x² + √7x = 0 b) x² − 40 = 0 c) … » ; « Question 1 — Calcule
et écris chaque résultat sous la forme a + bi. a) … 1 pt b) … 1 pt » ; « Détermine le domaine de
définition de chaque fonction, en justifiant. a) f(x) = … » (la consigne passe AVANT les données) ;
« Détermine le centre et le rayon de chaque cercle. Donne les rayons en valeur exacte. a) cercle
d'équation … ».

**Décisions** :
- Feuille d'exercices : NIVEAU (cadre numéro) et QR code « Refaire en ligne » PAR LIGNE — chaque ligne
  rouvre SON exercice (`?code=` de l'instance, inchangé), QR 56 px (52 px en deux colonnes), code écrit
  dessous ; en tête d'exercice, la plage « niv. 2–4 · facile à difficile » ; petite légende « QR code
  de chaque ligne : refaire en ligne, avec les aides ».
- Précision propre à certaines variantes (« Donne le rayon en valeur exacte », « Arrondis au centième
  les valeurs qui ne sont pas exactes ») : UNE consigne commune, la précision dite une fois (union des
  précisions des lignes, ordre de première apparition), au pluriel si l'entrée en donne un.
- Version aménagée : même énoncé que la version normale ; le groupe sur une page, lignes bien
  espacées, coupé entre deux lignes seulement s'il ne tient pas.
- Générateurs à un graphique par exercice : AUSSI regroupés (lot 2, validé sur aperçu), « graphiques
  côte à côte » : consigne une fois, puis a) [graphique] b) [graphique]…, DEUX graphiques par rangée
  quand ils sont assez petits, sinon un par rangée (section « Rendu des groupes à graphique » plus bas).
- **Figure commune (décision de l'utilisateur, 21/11/2026 : « la figure est exactement la même,
  pourquoi tu la reprends 4 fois ? »)** : quand TOUTES les lignes d'un groupe ont la même figure
  (comparée sans ses identifiants internes, `evaluationLocal.ts::empreinteFigure`), elle est imprimée
  UNE fois sous la consigne (`section.enteteHtml` du groupe, `.figure-commune` ; Word : déjà rendu
  par `enonceQuestionDocx`), et les lignes deviennent de simples lignes de texte (points, niveau, QR
  par ligne inchangés). L'entrée peut fournir `figureCommune: { consigne, ligne }` pour décrire la
  figure une seule fois — gen27 : « On considère la figure ci-dessous (un hexagone régulier et son
  centre). Réduis chaque expression en un seul vecteur, désigné par deux points de la figure. » puis
  a) l'expression seule. Figures différentes (hexagone + étoile…) : rendu « graphiques côte à côte »
  inchangé. Corrigé : identifiants SVG des figures annotées toujours rendus uniques par ligne.

**Règles** :
- On regroupe les instances d'un MÊME générateur, de la même ligne de sélection
  (`ElementPlan.ligne` = indice de l'item ; toutes ses variantes et copies « id~2 » comprises), du
  même processus, de la même série. Clé = consigne commune normalisée (texte + formules, sans les
  précisions fusionnables) : deux consignes → deux groupes ; une seule instance → exercice ordinaire,
  rendu inchangé. Le groupe prend le rang de sa première instance (comme le vrai/faux) — en série B,
  mélangée par processus, les mêmes lignes forment les mêmes groupes (ordre des lignes variable).
- Jamais pour un énoncé papier à vraies questions a) b) c) (plus d'une question papier : il resterait
  des sous-sous-questions), ni pour le vrai/faux (déjà regroupé) ou les questions ouvertes. Un énoncé
  à figure (`enteteHtml`) n'est regroupé que si son entrée le déclare (`figure: true`, lot 2).
- PUREMENT une mise en forme après tirage : le plan garde un élément par instance (graine, variante,
  points, `?code=`) ; anti-doublon, tirage équilibré, cas particuliers, groupes à verdict inchangés.
  Un ancien plan à élément multi-instances (ancien `regroupable`) est remis à plat (`elementsAPlat`).
- Numérotation APRÈS regroupement, partout : `evaluationLocal.ts::questionsDeSerie` est la SEULE
  règle — documents (`itemsDepuisSerie`) et remédiation (`questionsRemediables`, indices sur les
  éléments à plat) l'appellent tous deux ; examen : numérotation continue par parties (même items).
- Points : chaque ligne garde les points de son instance (colonne de droite, `pointsDesLignes`) ;
  total du groupe en tête. Barème du groupe (`baremeDuGroupe`) : critères de chaque ligne, avec leurs
  ÉTAPES, rattachés à la lettre de la ligne et ramenés à ses points (grille « a) Étape 1 … ») ; ligne
  sans barème → un critère « Réponse correcte et justifiée » ; erreurs fréquentes sans doublon ;
  réponses acceptées communes dites une fois, sinon précédées de leurs lettres ; réponse finale
  « a) … · b) … ». Examen à total fixé : mise à l'échelle LIGNE par ligne (0,5 pt au moins chacune ;
  le panneau compte donc chaque instance pour le contrôle « trop peu de points »). Durée = somme ;
  niveau = plage des lignes.
- Corrigé : une sous-partie par ligne (« a) » et ses données rappelées), puis le corrigé « comme au
  tableau » de l'instance avec SES étapes (« Étape 1 — … »). Chaque ligne est un item complet
  (`LigneGroupe.item`, passé par `appliquerEnoncePapier`) : `sousQuestion` / `etape` / `etapesCorrige`
  / renvois « sur l'étape 2 » / niveau et durée de l'instance restent ceux de l'instance — la lettre de
  ligne est un niveau AU-DESSUS (l'ancien chemin `regroupable`, qui écrasait la lettre d'étape, a
  disparu).
- « Je vérifie » : une carte par ligne (« Exercice 3 a) ») ; « Je fais le point » inchangé.
- Mise en page : lignes `.ligne-g` insécables (lettre | données | points ou niveau + QR), consigne
  `break-after: avoid` (jamais seule en bas de page) ; deux colonnes : le groupe est un bloc (`display:
  block`, pas un inline-block) qui ne se coupe qu'entre deux lignes. CSS `STYLE_GROUPES` ajoutée
  SEULEMENT aux documents qui contiennent un groupe : un document sans groupe reste identique, octet
  pour octet.
- Word : consigne, puis une ligne par instance avec ses points au taquet droit (première ligne liée à
  la consigne), figure de la ligne ; corrigé par ligne ; codes des lignes dans la grille.
- Remédiation : les exercices d'une question cochée sont repris EN ENTIER, n fois (a, b, c, puis a, b,
  c…), avec la ligne d'origine « r<n° de question> » : ils forment UN groupe dans la feuille de
  remédiation (une question d'un seul exercice reprise n fois devient donc « a) … b) … »).

**Contrat** (`export/genererFeuilleExercices.ts`) : `regroupement?(instance) → RegroupementInstance |
null` = `{ consigne /* forme « chaque », sans les données */, precisions?: { id, fragments, pluriel? }[],
ligne /* les données de l'instance */, figureHtml? }`. Le registre le remplit pour chaque adaptateur
avec `export/regroupementsPapier.ts::avecRegroupement(id, adaptateur)` (même enveloppe que les autres
champs, APRÈS `versionPapier`) : l'énoncé papier réel (`enoncePapier`, sinon `construireEnonce`) est
sérialisé (formules entre « $ », consigne d'une question unique après « \n ») et découpé par les
motifs de la table `REGROUPEMENTS` (groupe nommé `ligne`, `p_<id>` pour une précision ; consigne
écrite en mini-syntaxe, éventuellement construite depuis des groupes). Jamais une seconde source :
un énoncé que le motif ne reconnaît pas → `null`, l'instance reste ordinaire. Générateur à graphique :
entrée `figure: true` (helper `fig(...formes)`) — l'énoncé est sérialisé malgré son `enteteHtml`, qui
devient le `figureHtml` de la ligne, recopié TEL QUEL (mêmes figures que l'exercice seul, valeurs à
lire toujours sur les lignes de la grille) ; la ligne de texte peut être vide (`ligne: () => ""`,
gen10 : la courbe est la seule donnée) ou porter la courte donnée propre (gen12 « valeur en x = 7 »,
6gen5 « f(x) = … », gen117 l'inéquation). Un adaptateur peut
aussi écrire son propre `regroupement` (le registre ne le remplace pas). Les champs `regroupable` et
le chemin regroupé d'avant ont disparu ; les commentaires d'adaptateurs qui en parlent encore
expliquent une décision historique.

**Ajouter un générateur** : une entrée dans `REGROUPEMENTS`, puis relire son énoncé papier sur TOUTES
ses variantes (outil du chantier `verifReg.cjs`, dossier de travail : taux de reconnaissance par
variante, une consigne et une ligne par (variante, consigne), énoncés non reconnus) — juger la
consigne obtenue (forme « chaque », données d'instance toujours dans la ligne : une valeur tirée qui
reste dans la consigne empêche tout regroupement, ex. la norme visée de gen26 « paramètre » ramenée
dans la ligne).

**Activés (85 générateurs, table `REGROUPEMENTS`)** — tous ceux de la liste « consigne commune +
donnée » sauf deux, plus les quatre anciens `regroupable` (gen11, gen18, gen30, 6gen2) et ceux de la
classe « rien de commun » qui en avaient une en fait. 4e : gen1–7, gen11, gen13–18, gen22, gen24–26,
gen30, gen42, gen44–48, gen50, gen52, gen76, gen78, gen113–116, gen126, gen130 (réduire / simplifier,
démontrer ; pas « insérer »). 5e : 5gen1–3, 5gen6 (conversion
seulement), 5gen8, 5gen10, 5gen11, 5gen16, 5gen20, 5gen21, 5gen24 (pas « bonus »), 5gen26–29 (5gen28 :
pas « double tangence »), 5gen46, 5gen55, 5gen60, 5gen62. 6e : 6gen1–4, 6gen6, 6gen7, 6gen9, 6gen10,
6gen13–17, 6gen19, 6gen23–28 (6gen25 : pas « valeur moyenne », 6gen27 : pas D — vraies questions),
6gen34–38, 6gen40 (A et D ; B et C ont de vraies questions), 6gen87, 6gen93 (pas « application »),
6gen98, 6gen145, 6gen149 (pas « en zéro »), 6gen157. Mesuré (`verifReg.cjs`, 6 graines par variante) :
toutes les variantes visées reconnues ; seules les variantes à vraies questions ou à énoncé propre
restent `null`. Une valeur propre à l'instance va dans la LIGNE quand c'est possible (5gen11
« dans [0 ; 16[ », 5gen26 « f′(4) », gen26 « norme visée ») ; sinon seules les instances de même
consigne se regroupent (6gen37 « z⁴ », 6gen157 fin de consigne propre à la variante).

**Écartés et raisons** : gen54 (la question « Quel est le lieu des points qui sont à la fois … et … ? »
est formulée AUTOUR des deux lieux décrits en mots : la couper changerait la question) ; 5gen18
(contexte narratif long et propre à chaque instance — deux grandeurs, deux croissances, le n-ième
mois). Classe « rien de commun », non activés : gen31, gen33, gen34 (série de données ou tableau propre
à chaque instance : données nombreuses), gen37, 5gen14, 5gen15, 5gen45, 5gen47, 5gen54, 5gen34, 6gen22,
6gen32, 6gen76, 6gen86, 6gen90, 6gen155 (contexte propre à l'instance ou consigne qui embarque les
données), 5gen7 (contexte r, n et consigne de la variante), 6gen39, 6gen42 (énoncés longs, consigne
dépendante de l'instance), gen20 et gen21 (chaque variante a sa propre tournure « A a pour image A′… »,
« M est le milieu… » : possible, mais à reformuler à la main), 5gen52 (la réponse est un tracé — activé au
lot 2).

**Lot 2 — générateurs à graphique** (une figure par ligne, `figure: true`). Activés (38) — consigne
identique d'une instance à l'autre, donnée propre = la figure (+ au plus une courte ligne) : 4e gen8,
gen10, gen12 (« valeur en x = … » dans la ligne), gen23, gen27, gen43, gen49, gen51, gen53, gen71
(« caractéristiques » : liste HTML ; « courbe » : conditions + 4 courbes ; « déduction » a 3 vraies
questions → seule), gen72 (domaine, image et liste des transformations en HTML), gen82 (figures ET
composantes), gen83, gen117 (inéquation dans la ligne ; consigne avec / sans droite), gen122,
gen123, gen124 (tableau SVG), gen125 (lignes texte et ligne « parabole tracée » mêlées, même consigne),
gen128 ; 5e 5gen4, 5gen9, 5gen12 (une consigne par type), 5gen22, 5gen30, 5gen51, 5gen52 (sans figure :
la réponse est un tracé — écarté au lot 1, décidé ici), 5gen53, 5gen63 ; 6e 6gen5, 6gen8 (deux
consignes), 6gen11, 6gen18, 6gen20, 6gen21, 6gen77 (« calcul » et « aire/intégrale » ; « propriétés »
a deux données dans la consigne → seule), 6gen85, 6gen148 (abscisses des nœuds dans la ligne),
6gen158 (forme arcsin/arccos/arctan dans la ligne). Mesuré (`verifReg.cjs`, 6 graines par variante) :
toutes les variantes visées reconnues, une consigne par (générateur, forme).
**Écartés, avec raison** : gen69, gen70 (contexte propre à l'instance ET 2–4 vraies questions) ;
gen28, gen84, gen108, gen110, gen111, gen74, gen19, gen129, 5gen59, 6gen95, 6gen154, 6gen159, 6gen147 (vraies
questions) ; triangles et scènes géométriques gen58, gen73, gen75, gen77, gen79–81 (figure ET données
nombreuses propres à l'instance) ; solides et espace gen39–41, gen100–107 ; statistique avec contexte
gen32, gen36, gen38, gen109 ; détectives d'erreurs (copie d'élève longue propre à l'instance) gen91,
gen112, gen121, gen127, 5gen49, 5gen50, 5gen58, 6gen84, 6gen88, 6gen99, 6gen144, 6gen152 ; problèmes
en contexte gen29, gen55, gen57, gen86–90, gen119, 5gen5, 5gen32, 5gen48, 5gen56, 5gen57, 6gen30,
6gen74, 6gen80–83, 6gen89, 6gen96, 6gen97, 6gen150, 6gen156 ; gen85 (définitions des points propres à
l'instance) ; 5gen25 (un exercice = un jeu de 6 à 10 graphiques, déjà une demi-page) ; 6gen78, 6gen79
(consigne longue qui embarque les données : intervalle, valeurs demandées, fonctions).

**Rendu des groupes à graphique** (`assemblerEvaluationHtml.ts::corpsGroupeFiguresHtml`, CSS
`STYLE_GROUPES_FIGURES` ajoutée SEULEMENT à un document qui contient un groupe à graphique — documents
du lot 1 et sans groupe inchangés) : consigne, puis une CELLULE par ligne (`.cell-fig`) — en tête la
lettre, la courte donnée éventuelle et, à droite, les points (copie, aménagée, examen, corrigé) ou le
niveau (feuille) ; dessous la figure et, dans la feuille, le QR code de la ligne (`?code=` de
l'instance) à droite de la figure.
- **Coupes** : rangées `.rang-fig` insécables (aucune figure coupée entre deux pages) ; DÉBUT
  insécable `.debut-groupe` = titre (« Exercice 3 », « Question 3 » et ses points, bandeau de processus
  en deux colonnes ; inséré par `avecTete`, simple concaténation pour tout autre item) + consigne +
  première rangée. Le groupe (feuille, copie, examen) se coupe ENTRE deux rangées quand il ne tient
  pas — insécable, deux grands graphiques de gen12 laissaient la page précédente vide ; et
  l'équilibrage des colonnes ignorait `break-after` (« Exercice 7 » seul en bas de colonne). Aménagée :
  le groupe commence sa page (`.q-am`), même règle au-delà. En deux colonnes, un début plus haut que
  ce qui reste de la colonne (sous une question pleine largeur) passe, consigne entière, à la colonne
  voisine de la même page ; jamais au milieu d'une figure.
- **Deux par rangée** (`rangsDesFigures`, partagé avec le Word) quand chaque ligne a au plus une
  figure et que la plus large (même mesure que `largeurFigureMax` ; une figure à `width="100%"` est
  mesurée à sa `viewBox`, `mesureFiguresLigne`) ne dépasse pas 316 px (copie, corrigé, aménagée :
  cellule de 318–332 px sur 680) ou 266 px dans la feuille (le QR code prend 66 px) ; une ligne dont la
  « figure » n'est qu'un bloc de texte (gen71, gen72) ou qui porte plusieurs graphiques (6gen5,
  5gen53…) → un par rangée ; une dernière ligne seule garde une demi-largeur. La figure se réduit au
  besoin à sa cellule (réduction uniforme). Le choix se fait par groupe : la série B d'un même plan
  peut tirer un graphique plus large (gen10 « inverse », 320 px) et passer à un par rangée.
- **Deux colonnes** : une cellule par rangée dans la colonne, même à trois figures ou plus
  (`.une-par-ligne` annule le `column-span` de `.figures-multiples`) ; une ligne à plusieurs graphiques
  (6gen5, 5gen53) ou une figure trop large (`classeLargeur`, seuils 380 / 260 inchangés) fait passer
  tout le groupe en pleine largeur, comme avant.
- **Corrigé** : la figure annotée reste dans le corrigé de SA ligne (sous-partie « a) »).
- **Identifiants SVG** : la figure et le corrigé de chaque ligne ont leurs `id` / `url(#…)` /
  `href="#…"` suffixés (`identifiantsUniques`, suffixe = `?code=` de l'instance + lettre, « e »
  énoncé, « c » corrigé) — 6gen148, 6gen158, 6gen85 (identifiant dérivé du contenu), 5gen30, gen51,
  6gen77 (compteur) ne peuvent jamais se marcher dessus (mesuré : aucun doublon même sans suffixe ;
  le suffixe le garantit).
- **Word** : mêmes rangées (seuil de la copie) — deux cellules d'un tableau sans bordure dont la
  rangée ne se coupe pas, sinon la ligne liée à sa figure (`keepNext`) ; consigne liée à la première
  rangée ; figures rasterisées comme celles de l'énoncé. Limite héritée (comme l'exercice seul) : un
  bloc HTML sans SVG (listes de gen71 « caractéristiques », gen72) n'est pas repris en Word.

**Vérifié — lot 2** (documents réels, `construirePlan` → `genererDocumentsDepuisPlan`, scénarios
`g4e` / `g5e` / `g6e` de `docs.cjs` : groupes à graphique ET groupes du lot 1, vrai/faux) : feuille
(avec et sans deux colonnes, aménagée), évaluation 2 séries + aménagée + corrigé + grille + Word
(copie, corrigé, grille), examen par chapitre (total fixé à 20) et par processus (deux colonnes),
remédiation depuis une évaluation et depuis un examen : numérotation et points identiques copie =
corrigé = aménagée = grille, `questionsRemediables` = copie A, somme des lignes = points du groupe, une
carte « Je vérifie » par ligne, QR par ligne tous distincts et parmi les codes du plan, aucun
identifiant en double ni `url(#…)` sans cible dans chaque document, 0 débordement à 680, 820 et
1 280 px (un tracé rogné par son SVG — `clip-path`, `overflow: hidden` — ne compte plus : seul le SVG
compte), 0 `.katex-error`, PDF A4 relus (planches de pages) : aucune figure coupée, aucune consigne
seule en bas de page, deux figures par rangée quand elles tiennent. Non-régression (code d'avant
`ed74c46` / d'après, même plan) : plans sans groupe, générateurs à graphique compris (évaluation,
feuille, examen à total fixé) et plans du lot 1 (4e ch. 2, 5e, 4e mixte en examen deux colonnes,
anciens `regroupable`) : 72 / 72 documents identiques (HTML et Word) ; seul le plan 6e diffère, par le
corrigé de 6gen2 corrigé à dessein. **Piège d'outil** : le serveur Vite de contrôle doit servir les
polices KaTeX (`server.fs.strict: false` quand `node_modules` est un lien hors de la racine) — sinon
`obtenirCssKatexAutonome` inline une page « 403 » à la place des polices et `\mathbb{R}` s'affiche
« R » dans les aperçus (cause du « 1 ∈ R » signalé sur 6gen2 : le code écrivait déjà `\mathbb{R}`) ;
en revanche, pour comparer des Word octet par octet, le chargement des polices rend la taille des
formules rasterisées variable d'un chargement à l'autre : comparer les Word avec les polices bloquées
(comportement par défaut). Outils ajoutés (dossier de travail, à recopier) : `figs.cjs` (énoncés papier
d'un générateur à figure : texte, largeurs et identifiants SVG), `capgroupe.cjs` (capture d'un groupe),
`mont.sh` (planche des pages d'un PDF).

**Vérifié — lot 1** (documents réels, `construirePlan` → `genererDocumentsDepuisPlan`, 13 plans 4e/5e/6e) :
feuille (avec et sans deux colonnes, aménagée), évaluation 2 séries + aménagée + corrigé + grille +
Word (copie, corrigé, grille), examen par chapitre (total fixé à 20 par partie) et par processus (deux
colonnes), remédiation depuis une évaluation et depuis un examen qui contiennent des groupes :
numérotation et points identiques copie = corrigé = aménagée = grille, `questionsRemediables` = copie
A (numéros et nombre de lignes), somme des lignes = points du groupe, une carte « Je vérifie » par
ligne, un QR code par ligne, tous distincts et tous parmi les codes du plan (`?code=` de l'instance) ;
0 débordement à 680 (impression), 820 et 1 280 px, 0 `.katex-error` ; PDF A4 relus (`pdftotext
-layout`, captures) : aucune ligne coupée, aucune consigne de groupe seule en bas de page.
Non-régression : un plan sans groupe (une instance par générateur, dont gen30, ancien `regroupable`)
rendu par le code d'avant et d'après : 24 / 24 documents identiques octet pour octet (évaluation,
feuille, examen à total fixé ; HTML après neutralisation du CSS KaTeX inliné, Word comparé XML par
XML). Outils du chantier (dossier de travail, à recopier) : `verifReg.cjs`, `docs.cjs`,
`controle.cjs`, `nonreg.cjs`.

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
- **6e ch. 1 (lots B, C, E, 6gen1–5)** : `6e-6h/components6e/RetourSaisieCyclo.tsx` (hook du 4e et
  aides du 6e ch. 2 réutilisés, `useRetourCyclo` : blocage AVEC message — illisible par nature de
  champ `MESSAGES_ILLISIBLE_CYCLO`, valeur approchée, fonction trig/arc recopiée — sans tentative),
  `EtapeEnsembleCyclo` (domaine, image, CE, condition ; `diagnostiquerEnsembleReelGuide` : correct /
  approchée / crochet / faux, toute écriture équivalente acceptée), `EnsembleReelGuideBuilder.onIllisible`
  (saisie complète mais borne illisible : « Valider » reste actif, message — plus de bouton grisé muet).
  Évaluateur du chapitre délégué à celui du ch. 2 (`expressionCyclometrique.ts` : π, √, ·, ×, |…|,
  sin⁻¹ = arcsin) ; seule une erreur de SYNTAXE est illisible (`equivalenceCyclometrique`). Aides et
  cibles `ui6e/aides{InjectiviteFonctions,FonctionsCyclometriques,EquationsCyclometriques,DeriveesCyclometriques,GraphiquesCyclometriques}.ts` :
  niveau 2 = propriété posée pour l'instance, jamais le verdict ni le résultat (6gen1 f(x₁) = f(x₂)
  posée, 6gen2 « trig α = … et α ∈ image », 6gen3 aide de tri qui montre la CE — elle montrait
  l'équation —, 6gen4 plus de dérivée « déjà substituée », 6gen5 conditions sans domaine ni image).
  Choix fermés à 1 tentative : verdict de 6gen1 (« Non » juste ouvre l'intervalle à 3 tentatives) et
  bijection, « Existe » de 6gen2 (la valeur garde 3), « À accepter / À rejeter » de 6gen3, graphique
  de 6gen5 (validé SEUL, `soumettreLettre`) puis parité jugée une fois, figée et révélée
  (`pariteRevelee`, message « La parité était fausse… »). 6gen2 : valeur exacte à 1e-9 (« 0,5 » exact
  accepté). Lot C : 6gen3 4b/4c triplet 3-4-5 seul, 4a un seul cercle (dénominateur ≤ 26 ; 156/25 et
  1/195 disparus) ; 6gen5 E c = −k·w₀, w₀ remarquable (`CandidatE.cPi`, corrigé exact, plus de
  calculatrice ; domaine ≥ 0,29), petit graphe de la réponse attendue (180 px, `etiquettesLisibles`
  de la grille du 4e). Tirage (`generateurs6e/profilsEvaluationCyclometriques.ts`) : `forme` sans le
  verdict ; cas particulier `aucune-solution` (6gen3 variante 3) ; groupes 6gen1 `groupe_injectivite`
  (e, f), 6gen2 `groupe_existence_arc_trig` et `groupe_existence_trig_arc` (« existe » doublé) ;
  verdicts dans la variante : 6gen1 a, c injectives 50 %, 6gen2 libre « existe » 61 %, 6gen5 A, B, D
  impaires et F paire ≈ 35 %, C arctan 50 % (un seul extremum) ; E et C : parité forcée par la
  fonction. Niveau constant dans un verdict : 6gen1 a, c, e, f (4, 11 min), 6gen5 (2 étapes
  `sansCharge`, nombres 1 : 3–4, 7 min, selon k < 0 seulement). Mesures : moteur 82 000 tirages
  (2 000 par variante + 4 000 libres par générateur ; réponses recalculées par balayage, saisies
  autrement écrites, « − », illisible, ?code= 200/200) 0 anomalie ; collecteur 0 égalité fausse ;
  plans réels B ≠ A : groupes 6gen1 et 6gen2 arc∘trig 30/30, trig∘arc 22/30 (deux causes) ;
  iPhone 13 (bonnes réponses et erreurs) scrollWidth 390, 0 erreur console ; documents (2 plans,
  cas particulier coché ou non, interdite / autorisée) 0 débordement, 0 `.katex-error`.
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
- **5e ch. 4 (lots B, C, D, 5gen20–24)** : écrans génériques du chapitre
  `5e-4h/components5e/EcranSaisieLimites.tsx` (`EcranSaisieLimites` : champs, `normaliserSigneMoins`,
  aperçu KaTeX, `controleSansTentative` ; `EcranChoixLimites` : options KaTeX, une tentative) au-dessus
  de `PiedEcranFonctions` du 5e ch. 1 ; lecture `moteur5e/saisieLimites.ts` (`lireLimite` du lot G :
  « − – — », ±∞ / inf LISIBLES dans un champ numérique — un infini tapé pour une limite finie est une
  réponse fausse ciblée, jamais illisible —, `nombreExactRefuse` = illisible OU décimale approchée,
  `diagnostiquerValeurExacte` à 1e-9 : la tolérance 0,01 laissait passer 1,86 pour 13/7). **Refus dans
  le moteur** (état inchangé) : 5gen20 `saisieLimiteRefusee` (forme non factorisée comprise), 5gen21
  `saisieDivisionRefusee` / `formeDeveloppeeRefusee`, 5gen22 (illisible), 5gen23
  `moteur5e/saisieContexteLimites.ts` (expression en t lue comme en x), 5gen24
  `moteur5e/saisieEtudeComplete.ts::refusSaisieEtude` (message rendu, partagé avec l'écran) ; « — »
  ajouté aux normalisations de `formeSaisieLimites` et `verificationEtudeComplete`. Aides à deux niveaux
  (`AideTrig`) : niveau 2 posé pour l'instance — les anciens « exemple avec une autre fonction » de
  5gen20, 5gen21, 5gen23 (4 écrans) et 5gen24 (12 écrans) sont remplacés ; 5gen22 gagne deux niveaux
  (`niveauAide` dans son moteur). Textes : `formatLimites::aidesLimite/cibleLimite/cibleChoixLimite`,
  `formatAsymptoteOblique::aidesAsymptoteOblique/cibleAsymptoteOblique`,
  `ui5e/retours{LectureGraphiqueLimites,LimitesContexte,EtudeComplete}.ts`, messages d'illisible
  `ui5e/retoursLimites.ts`. Messages ciblés : fraction inversée, terme non dominant (termes non
  rangés), exposants additionnés, côtés gauche / droite échangés, carré positif des deux côtés,
  puissance impaire en −∞, abscisse de l'AV donnée pour la limite, AV / AH confondues, pente ou
  ordonnée de l'oblique, reste gardé dans l'asymptote, a et b échangés, b calculé sur f au lieu de
  f − ax, coût fixe, division par le volume ajouté, facteur oublié, mois non arrondi par excès, point
  vide compté comme AV ; message sous la réponse révélée de chaque choix fermé (une tentative). Composants
  5gen20 (8) et 5gen21 (2) supprimés : leurs écrans passent par les écrans génériques.
  **Défauts d'écran** (une seule source écran = aides = papier = corrigé) : 5gen23 `valeurClubReelle`
  (« ≈ » si arrondi, aussi dans le libellé du champ), `valeurPopulationLatex` (« = » si exact),
  `monomeTLatex` / `concentrationLatex` (plus de « 1t ») ; 5gen21 forme développée avec la graine + 1
  de l'énoncé, consignes en texte riche (titres d'étape en KaTeX) ; 5gen24 domaine `\{1\,;\,3\}`.
  **Tirage** : 5gen20 `groupe_infinie_point` (racine simple / double = la limite existe ou non), `forme`
  « limiteInfiniePoint » ; 5gen24 : la nature de chaque valeur exclue (point vide, AV simple / double)
  est le verdict de l'élève → retirée de la `forme` (= nombre d'exclusions | AH nulle, AH, AO, aucune |
  recoupement annoncé), huit groupes par structure visible, cinq variantes AJOUTÉES EN FIN de catalogue
  (`1-vaDouble-ahZero`, `1-vaDouble-ao`, `1-vaDouble-aucune`, `2-vaSimple-vaSimple-aucune`,
  `2-vaSimple-vaSimple-ahNonNul-special`) ; `1-vaDouble-ao-special` reste seule, renommée « 1 exclusion —
  AO + recoupement » (un recoupement exige un dénominateur réduit de degré ≥ 2). **Contrat** :
  `GroupeVerdict.formeCommune` (opt-in, 5gen24) — `construirePlan` impose la forme de la série A même
  quand le verdict change de variante (un recoupement tiré au hasard dans un membre changeait la
  structure) ; autres groupes inchangés. Niveaux : constants en 5gen20 (4, 9 min) ; en 5gen24 ils
  suivent les écrans (point vide + 1 écran, AV double + piège : 3–5, 12–24 min) — la copie
  d'évaluation n'imprime ni l'un ni l'autre (même choix que 5gen10). 5gen21 rejugé sur le papier :
  technique imposée (méthode 0), aucune donnée piège, deux étapes sans charge + une lecture → niveau 1,
  7 min, justifié.
  **Famille « position » de 5gen21** (`position-ao`, `position-ah`, indices 4 et 5 : codes 0–3
  inchangés ; tirage libre de l'adaptateur et des codes = ancien `genererExerciceAsymptoteOblique`,
  l'appli tire la nouvelle famille une fois sur trois via `genererExerciceGen21Libre`) : D(x) sans
  racine (Δ < 0), droite DONNÉE, reste R(x) = rx + s ; verdict au-dessus / en dessous / recoupe tiré au
  tiers AVANT les nombres (x₀ entier), jamais dans la `forme` (« position-oblique / horizontale »),
  paramètres a ≠ ±1, b ≠ 0 `parametresNonApplicables`. Quatre écrans pour tous les verdicts (moteur
  `sessionPositionAsymptote.ts`) : numérateur R(x) (champ), verdict (choix fermé), point de recoupement
  (x₀, y₀ ou « Aucun point commun »), côtés en −∞ / +∞ (choix fermés) ; niveau 3, 9 min dans les trois
  verdicts (lecture d, méthode 1 : le papier ne dit pas d'étudier le signe). Corrigé
  `asymptoteOblique/corrigePosition.ts` (écart au même dénominateur, Δ < 0 ⇒ D > 0, signe de R,
  tableau de signes HTML en `figureHtml`, x₀ et y₀ lus sur la droite, vérification f(x₀), limites de R
  en ±∞). Énoncé papier : f, la droite, une consigne SANS donnée tirée ; regroupement : seconde forme
  de l'entrée `5gen21` (ligne « f ; d (asymptote oblique) »). Appli : une session par famille
  (`App5gen21.tsx`, union `Session`), récapitulatif en morceaux courts.
  **Mesures** : moteurs 2 000 tirages par variante (5gen20–24, nouvelle famille comprise : réponses
  recalculées depuis les données — P = QD + R, f(x₀) = droite(x₀), signe de R, mois par balayage,
  domaine par racines de D, types par N(r), limites latérales par le signe de f en r ± 10⁻⁵ —,
  écritures équivalentes, « − – — », illisible et approchée sans tentative, réponse fausse = une
  tentative, choix fermé faux = clos) : 0 anomalie ; verdicts de « position » 1 978 / 2 017 / 2 005 sur
  6 000 ; `?code=` : 300 graines × (libre + 4 variantes) identiques. Collecteur (outils de
  `corrige-5e4` recopiés, `env.ts` : R, Q, x₀, y₀ de la famille position) : 2 520 tirages, ≈ 37 600
  relations, 0 fausse. Plans réels (30 × 2 séries) : verdict B ≠ A 30 / 30 pour `groupe_infinie_point`
  et les groupes 5gen24 testés (1 AH, 1 AO, 2 AO, 2 aucune, 2 AH + recoupement), forme B = A 30 / 30 sauf
  `groupe_1_ah` 27 / 30 (un recoupement tiré par l'AV double en série A ne se reproduit pas avec une AV
  simple : repli du moteur) ; famille position : B ≠ A 19 / 30 (verdict tiré dans la variante, ≈ 2/3
  attendu), niveau et durée constants. Documents réels (2 graines × avec / sans regroupement × 2 plans :
  évaluation 2 séries + aménagée + corrigé + grille + feuille + Word du corrigé) : 0 débordement à 680,
  820 et 1 280 px, 0 `.katex-error`. iPhone 13 (clair / sombre, 5gen20–24 et `?code=` de la famille
  position, parcours complet de la nouvelle famille) : scrollWidth 390, 0 erreur console, 0
  `.katex-error` ; page du chapitre 390 / 1 280 px, clair / sombre : idem, aucun « $ » ni « ** » visible.
- **4e ch. 6 (lots B, C, D ; gen20–29, points ouverts gen84, 87, 90, 91)** : règles communes dans
  `4e/ui/retoursVecteurs{,2,3,4}.ts` (illisible PAR NATURE de champ — coordonnée, composante,
  combinaison, critère, équation, valeurs, norme exacte / approchée, vecteur de la figure, égalité,
  angle —, aides à deux niveaux KaTeX, messages ciblés : A − B, milieu par différence, k sur la mauvaise
  origine, BA non retourné, colinéarité / orthogonalité confondues, racine oubliée, carré négatif,
  sommet faux, Chasles inversé, « + » / « − » de la formule de la résultante, calculatrice « pas en
  mode degrés » — jamais « radian ») ; écrans génériques `EcranChampVecteurs`, `PiedVecteurs`,
  `DeuxChampsVecteurs`, `EtapeValeursAvecChoix` (choix « aucune / au moins une » jugé UNE fois et
  figé, valeurs à 3 tentatives ; après un choix faux, les valeurs restent à donner), `EtapeConclusionNature`.
  Choix fermés à 1 tentative : conclusions gen24 / gen25 (figées dans le moteur, `ChoixFige`),
  identification gen25, sélection gen28 (cases CARRÉES `.options-multiples`). gen23 : tracé vide OU
  tracé initial laissé tel quel = aucune tentative. **Défauts** : gen22 « sans parenthèses » démarre à
  l'écran des composantes, coefficient 1 implicite ; gen26 cible toujours √N non simplifiée, « la ou les
  valeurs », p − r pair pour tous les verdicts ; gen25 x en 1ʳᵉ ou 2ᵉ composante, de u ou de v ; gen28
  écran « égalité » = une égalité PAR vecteur parallèle trouvé (`egalitesDemandees`, comme le corrigé),
  têtes de flèche 0,35 unité (`VecteurGraph.teteFleche`, figure papier proportionnée), flèche d'étiquette
  centrée ; gen84 « produit scalaire » ; gen87 x_A non arrondi avant `estExacte` ; gen90 `^\circ` ;
  `souderPonctuation` : virgule de ponctuation `,` (plus `{,}`) ; minuscules d'insistance gen84, gen90.
  **Nouvelles variantes EN FIN de catalogue** (codes 0–n inchangés ; les adaptateurs gardent l'ancien
  tirage libre, l'appli tire la nouvelle variante via `…Libre`) : gen20 « symétrique d'un point », gen24
  « paramètre au carré » (0 / 1 / 2 solutions au tiers, Δ, niveau 2, 6 min dans les trois verdicts),
  gen26 « nature d'un triangle » (quelconque / isocèle / rectangle / rectangle isocèle à 25 %, niveau 3,
  8 min). Constructions papier (gen23, gen82 graphique, gen83) : « Trace ta construction sur la figure
  de l'énoncé, que tu joins à ta feuille ». **Tirage (lot D)** : gen91 ligne fausse précédée de 0 à 3
  lignes justes (`av`, tiré EN DERNIER : un code imprimé rouvre les mêmes données et réponses, seule la
  mise en page de la copie change ; lignes préliminaires « Données », méthode, inconnue, ou vecteurs
  écrits dans la ligne fausse — `modeleDetectiveVecteurs.ts::structure`), ligne retirée de `forme`,
  `groupe_erreur` (6 variantes) ; gen29 « forces, angle quelconque » : Sud ≈ 30 % (0,295). Mesuré :
  gen91 L1–L4 ≈ 25 % chacune dans chaque variante ; gen26 « paramètre » 15 000 tirages : un tiers par
  verdict, mais « une solution » ⟺ N = 2m² (mathématique : Δ = 0) — P(une | N = 2m²) ≈ 65 % ; niveau et
  durée constants par variante pour tous les verdicts (gen24–26, gen82 « possible », gen88, gen89, gen91,
  nouvelles variantes) ; plans réels 30 × 2 : gen91 `groupe_erreur` B ≠ A 30/30 (même ligne A/B 6/30).
  Codes : 20 générateurs × 60 graines identiques, sauf gen25 et gen26 « paramètre » (tirage refait) et
  gen29 « forces, angle quelconque » (proportion de Sud).
- **4e ch. 6 (retouches, décisions de l'utilisateur)** : **gen28, étiquettes** — placement en PIXELS
  réels, à la taille de l'étiquette dessinée (`4e/ui/etiquettesComparaison.ts::placerEtiquettesComparaison`,
  `ETIQUETTE_ECRAN` / `ETIQUETTE_PAPIER`) : ancrages du milieu vers les extrémités (fractions 0,5 →
  0,1/0,9), des deux côtés de la normale, écart boîte–trait de 3 à 24 px, puis au-delà des extrémités
  (prolongement, ±45°) ; admis seulement sans contact avec un trait, une tête, une extrémité, une autre
  étiquette ni le cadre, centre ≥ 1,2 × sa distance à son vecteur (+ 4 px) de tout autre vecteur ;
  recherche avec retour arrière (étiquettes les plus contraintes d'abord, budget 20 000), repli glouton
  par pénalités. Écran : la largeur réelle du graphe (`VecteurGraph.onLargeurGraphe`, ajout pur) est
  passée au placement (`components/FigureComparaison.tsx`, placement mémorisé : une case cochée ne
  change que les couleurs). Papier : même placement dans la zone tracée, puis fenêtre resserrée autour
  des vecteurs et des étiquettes (`figure.ts::fenetreSerree`, jamais plus large que celle du placement :
  l'échelle ne peut que grandir). Générateur intact : `?code=` = mêmes données. Mesuré (`mesure28.ts`,
  600 tirages, 200 par variante ; boîte réelle lettre + flèche ; avant → après) : figures avec au moins
  un défaut papier 84 % → 0 %, écran 322 px (iPhone 13) 86 % → 0 %, 480 px 83 % → 0 % ; étiquettes plus
  proches d'un autre vecteur que du leur 27 % → 0 % (papier, 322, 480) ; chevauchement d'un vecteur 1,2 %
  → 0 (papier) et 2,1 % → 0 (322) ; d'une étiquette 0,5–0,8 % → 0 ; distance centre → son vecteur papier
  moy. 31 px, max 79 → moy. 18, max 26 ; 322 px moy. 26, max 62 → moy. 17, max 21. Limite : écran de 260 px
  (largeur mini du graphe) 0,8 % des figures gardent une étiquette ambiguë (police fixe de 22 px). Papier :
  énoncé, aménagée et corrigé ont les mêmes positions (couleurs seules différentes). **gen29** : aides à
  deux niveaux sur « modélisation » et « interprétation » (`retoursVecteurs4.ts::aidesModelisationPhysique`,
  `aidesInterpretationPhysique`), affichées par l'écran sans `onPremiereAide` (moteur et puces
  inchangés). **gen83 « lecture »** : `titrePapier` → « Composantes d'un vecteur », section à relire § 8
  (contrat dans le tableau « Contrat d'adaptateur »). Vérifié : même plan, code d'avant / d'après
  (gen28 ×2, gen83 lecture ×2 + somme, titres de section affichés, 2 graines) : seuls les titres
  changent — copie et corrigé A/B (titre de section), copie et corrigé Word, feuille (étiquette, notion
  du corrigé, ligne « Je fais le point » § 8) ; aménagées et grilles identiques (elles n'impriment pas
  de titre) ; 20 HTML × 680 / 820 / 1 280 px : 0 débordement, 0 `.katex-error`.
- **4e ch. 7 (lots B, C, D ; gen42–54)** : règles communes `4e/ui/retoursAnalytique.ts` (illisible PAR
  NATURE de champ `ILLISIBLE_ANALYTIQUE` — coordonnée, composante, coefficient, pente, angle, distance,
  rayon, paramètre, équation de droite / paramétriques / cercle / parabole / lieux —, lecture
  `lireNombreAnalytique` avec √ et « − – — », messages ciblés : vecteur normal pris pour directeur,
  droite décalée, pente inversée, paramétriques sans le point, centre au signe inversé, r² pour r) et
  pied commun `4e/components/PiedAnalytique.tsx` (`useTentativeLisible`, `MessageRetour`). Choix fermés
  jugés une fois et figés dans le moteur : gen42 « possible / impossible » (`choixPossibiliteFige`), gen54
  nature des lieux (`naturesFigees`) et « Aucun / Au moins un » (`choixResolutionFige`), gen50 nature
  (`natureFigee`). Aides à deux niveaux sans la réponse (gen44 points et tracé, gen45, gen46 extraction,
  gen47 choix du point et aide en vecteur normal, gen49). Typographie : `\,;\,` dans les coordonnées,
  graduations « − » espacées et jamais cachées (`4e/ui/graduationsSvg.ts` : un nombre qui toucherait un
  point ou une étiquette passe de l'autre côté de l'axe, sinon n'est pas écrit — gen43, 49, 51 écran et
  papier ; option `graduationsLisibles` de `figureLotG` (corrigé de gen47) et `figureRepere` (gen132),
  absente = figure inchangée pour gen92–99), tan⁻¹ et θ / θ_Oy (gen46), rayon r (gen49, 50, 54), titres
  papier de gen53 (`consignePapierEcran`). Angles 30°, 60°, 120°, 150° : valeurs exactes p + r√3
  (`4e/ui/radical3.ts`, parseurs √ / sqrt / rac de `verificationDroite.ts`), 0° / 90° ≈ 20 %
  (`PROBABILITE_ANGLE_AXE`, `PROPORTION_AXE`). **gen54** : pente tirée AVANT le verdict dans une même
  liste (14 pentes cercle-droite, r² ∈ {2, 5, 8, 10, 20, 25} ; ±1, ±2, ±1/2 droite-parabole), énoncé
  « s'obtient en multipliant l'abscisse par …, puis en ajoutant / retirant … », groupes
  `groupe_points_cercle` / `groupe_points_parabole`. **Variantes EN FIN de catalogue** : gen54
  `droiteParabole_axe` (parabole d'axe horizontal et droite y = k, ou d'axe vertical et droite
  x = k, à parts égales — `LieuDroite.abscisse`, bascule « Droite verticale : x = k » dans le bloc
  « Droite » de l'identification, offerte dans toutes les variantes — : un seul point, pas une
  tangence ; piège 1, niveau 4 et 8 min dans les deux orientations) ; gen50 `est_ce_un_cercle` (nature tirée au tiers, centre entier, second membre c
  TOUJOURS négatif — c ≥ 0 trahissait le cercle —, écran 3 : choix fermé puis centre et rayon si cercle ;
  énoncé papier « … est-elle celle d'un cercle ? Justifie. Si oui… » ; critères fixes 3 étapes
  `sansCharge` + piège : 3, 8 min pour les trois natures ; tirage libre de l'adaptateur et des codes
  inchangé, l'appli la tire une fois sur trois). Verdicts hors de la `forme` (la série B recopiait
  l'issue de la série A, 30 / 30) : gen42 « impossible », gen45 relation reconnue, gen48 conclusion —
  plans réels 30 × 2 : B ≠ A 7 / 30 (gen42, issue rare), 18–22 / 30 (gen45, gen48), niveau et durée
  constants dans chaque verdict. **Choix fermé jugé** (`4e/ui/choixFige.ts`, classes `is-faux` /
  `is-juste` de `theme.css`) : l'option choisie fausse en rouge avec ✗, la bonne en vert avec ✓ (avant,
  la bonne option prenait le style « sélectionné » juste au-dessus du message d'erreur) — gen42
  possible / impossible, gen50 nature, gen54 nature des lieux et « Aucun / Au moins un » ; les choix
  figés du 4e ch. 6 (`EtapeValeursAvecChoix`…) ont encore l'ancien rendu. Grille : ligne « codes a) … j) » sécable entre deux codes (style en
  ligne, documents sans groupe identiques). Mesuré : collecteurs `corrige-4e7-m1/m2` (outils recopiés)
  3 980 tirages, ≈ 52 000 égalités, 0 fausse ; gen54 15 000 tirages par groupe : écart max
  |P(pente | verdict) − P(pente)| 1,0 / 1,2 point ; gen42 angle 19,9 / 19,4 % d'axes, gen46 20,3 % ;
  gen50 33,6 / 33,3 / 33,1 % ; niveau et durée constants dans chaque verdict ; plans réels 30 × 2 :
  groupes gen54 B ≠ A 30 / 30, gen50 26 / 30 ; figures (300 tirages gen47, 300 gen132) : graduation
  touchée 9 % → 0 (gen47), 90 % → 0 (gen132 « escalier ») ; `?code=` : seuls gen42 / gen46 « angle »
  (et les tirages libres qui y tombent) et tout gen54 changent.
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
  forment UN document) et aménagée de la feuille : **nom du professeur** à gauche, « page n / N » à
  droite (décision de l'utilisateur ; nom du profil connecté, sinon « M. Hamwi » de `CARTOUCHE_DEFAUT` :
  la feuille est publique). Le nom figure aussi dans l'en-tête de la feuille (ligne « Professeur » sous
  Nom / Classe / Date ; aménagée : « Professeur : … » sur la ligne d'identité). Marge basse 1,5 cm.
  Firefox ignore les boîtes de marge. Vérifié (PDF A4 d'une évaluation 2 séries + feuille, Chromium) :
  pied sur chaque page (corrigé 7 / 7, grille 2 / 2, feuille 10 / 10 dont « Corrigé détaillé »),
  0 collision corps / pied (`pdftotext -bbox`).
- **Encadré « Consignes »** en tête de la copie d'évaluation et de l'aménagée (après le tableau des
  résultats) : « Réponds sur une feuille à part… ne rapporte pas tous les points. » + calculatrice
  autorisée/interdite + « Durée : n minutes. » seulement si `afficherDuree`. Jamais sur la feuille
  d'exercices. Même texte dans la copie Word (`TEXTE_CONSIGNES`).
  **Consignes supplémentaires de l'évaluation** (demande de l'utilisateur, comme l'examen) : le champ
  « Consignes supplémentaires (une par ligne) » du panneau s'affiche aussi pour le document
  « Évaluation » (bloc « Consignes de l'évaluation », même place que les réglages de l'examen ;
  absent en feuille d'exercices ; même état React : le texte est gardé en passant d'Examen à
  Évaluation). Plan : `EnTeteEvaluation.consignesSupplementaires` (texte tel que saisi, tirets
  typographiques gardés), écrit SEULEMENT s'il n'est pas vide ; `enteteSerie` le passe aux documents
  en lignes (`EnteteEvaluation.consignesSupplementaires`, ni en feuille ni en examen — l'examen garde
  `examen.consignesSupplementaires`). Rendu : une puce par ligne après les consignes par défaut,
  `$…$` en KaTeX, dans la copie et l'aménagée (`consignesSupplementairesHtml`, partagée avec
  l'examen ; CSS `STYLE_CONSIGNES_SUP` ajoutée SEULEMENT quand il y en a) et la copie Word
  (`pucesConsignesDocx`, partagée avec l'examen : paragraphes au même cadre) ; corrigé et grille :
  rien. Sans consigne : copie, aménagée et Word identiques à avant (vérifié octet par octet ; seul
  le compteur global `docPr id` des images Word avance pour les documents générés APRÈS une copie
  qui a une formule de plus dans la même page — contenu identique).
- **Liste de données affichée** (« Données : \text{…},\ \text{…} », 6gen44/46/48) : une formule
  display ne se coupe jamais et sortait à 30 % de sa largeur ; une formule affichée de niveau 0
  découpable à ses « ,\ » / « ;\ » et longue (> 45 caractères visibles) est rendue en formules EN
  LIGNE séparées par leurs virgules (`formuleAfficheeHtml`, `genererFeuilleExercicesHtml.ts`).

## Couleurs des compétences (décision de l'utilisateur, 22/11/2026)

1 Connaître = **vert sarcelle** (le plus clair), 2 Appliquer = **bleu franc** (clarté moyenne),
3 Transférer = **rouge bordeaux** (le plus foncé) — avant : `--sky` / `--accent` / `--plan`, Connaître et
Transférer se confondaient. Teinte ET clarté différentes (≈ 13 à 15 points de L* d'écart, lisibles en
niveaux de gris, en deutéranopie et en protanopie) ; le numéro reste dans la pastille, le nom de la
compétence est toujours écrit.
- **Site** : jetons dédiés `--proc1…3` (pastille, barre, point), `--on-procN` (texte posé dessus),
  `--procN-ink` (texte sur la page ou sur `--procN-soft`) dans `index.css`, clair et sombre ; JAMAIS
  `--sky`, `--accent`, `--plan`, `--good`, `--bad` pour une compétence (ils gardent leurs autres usages).
  Clair : `#0c828a` / `#1d52a8` / `#67152e`, encres `#05585e` / `#133f87` / `#60132a`, blanc dessus
  (4,6 / 7,4 / 12,2:1). Sombre : `#7be0df` / `#77a9f3` / `#c1628b`, encres `#98e4e3` / `#a7c9fc` /
  `#e6afc4`, texte `#10161d` dessus (11,8 / 7,6 / 4,7:1). Usages : `.conc-pc-N`, `.conc-rep-seg-N`,
  `.conc-barre-pN`, `.conc-legende-pN` (panneau, réglages Compétences / Répartition d'examen, assistant
  élève qui réutilise `ReglageCompetences`), `.coffre-pN` (fiche du coffre). Le texte posé sur une
  pastille ou un segment vient de `--on-procN` (l'assistant élève, hors `.conc`, n'avait pas de couleur
  de texte : l'ancien `--conc-on-pc` a disparu).
- **Documents** : seule source `export/couleursProcessus.ts` (valeurs CLAIRES du site, `trait` / `encre`,
  `CSS_VARIABLES_PROCESSUS` pour le HTML, `couleurProcessusDocx` pour le Word). Couleur seule, textes et
  mises en page inchangés : bandeau « Processus n — … » (filet + titre ; copie, corrigé, blanche), en-têtes
  du tableau « Points » / « Mon score », étiquette « notion · compétence » de la feuille, résumé et
  « Question n · compétence » de la grille, examen par processus (ouverture de partie, en-têtes du
  tableau des parties), examen par chapitre (étiquette de compétence des questions). Le reste de la
  charte papier (`--accent` #1d5b8f : surtitres, consignes, étapes du corrigé) ne change pas.

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

## Grille de correction plus rapide (décision de l'utilisateur)

Grille HTML ET Word, évaluation ET examen ; jamais sur la copie ni le corrigé. Logique pure partagée
`export/grilleCorrection.ts` (testable seule) ; CSS `STYLE_GRILLE` ajoutée à la SEULE grille (le CSS
commun ne change pas : copie, corrigé, aménagée, feuille identiques octet pour octet). Le reste de la
grille ne change pas (en-tête et résumé par processus, « Réponse : … » de chaque question, règle « une
erreur n'est pénalisée qu'une fois », codes, pied « Série A · page n / N », couleurs).
- **A. Page « Réponses — Série A »** juste sous l'en-tête de la grille, puis saut de page avant le
  détail (`.rep-page`, Word : paragraphe `pageBreakBefore`). Une entrée par question, numérotée comme
  la copie (mêmes items, `itemsNumerotes` / parties de l'examen), points à droite :
  `reponsesDeLaQuestion` — même source que l'en-tête de la question (`bareme.reponseFinale`, sinon
  `reponseBreve`) ; vrai/faux regroupé : une ligne par affirmation (« a) Vrai 1 ») ; question
  regroupée : une ligne par a), b), c) avec la réponse et les points de SA ligne ; question ouverte
  (formule, démonstration) : le corrigé s'il est court (≤ 560 px estimés), sinon « Voir le détail de
  la question n ». Colonnes (`colonnesReponses`, plus longue réponse estimée par `largeurFragments`) :
  3 si ≤ 140 px, 2 si ≤ 255 px, sinon 1 ; colonnes CSS équilibrées, une question jamais coupée. Word :
  une cellule de tableau sans bordure par colonne, remplie de haut en bas. Examen : un bloc par partie
  (« Partie I · titre », points de la partie).
- **B. Question regroupée en tableau** (`segmentsDuGroupe`) : les critères du groupe (rattachés à la
  lettre de leur ligne par `baremeDuGroupe`) sont séparés en libellé générique + valeur
  (`separerCritere` : premier « : » d'un fragment de TEXTE, jamais dans une formule — « Factorisation
  correcte : x(x + 4√3) = 0 » → « Factorisation correcte » | « x(x + 4√3) = 0 » ; critère réduit à une
  formule → libellé « Résultat » ; sans « : » → libellé entier, pas de valeur). Signature d'une ligne
  = suite (étape, libellé). Lignes de même signature (au moins deux) → UN tableau : une rangée par
  critère (« Étape 2 — Factorisation correcte »), une colonne par ligne a), b)…, dans chaque case la
  valeur propre à la ligne et ses points (`pointsCriteres` du groupe, inchangé), rangée « Total » par
  colonne (= points de la ligne) ; une valeur identique dans toutes les colonnes reste dans le
  libellé. Signatures différentes (variantes différentes, valeurs dans le libellé sans « : », ex.
  gen50 « Division par 4… ») : un tableau par signature, une ligne seule dans sa signature garde la
  liste d'avant (« e) Étape 1 … ») — chaque critère est dans exactement un segment, rien n'est perdu.
  Largeur : colonnes estimées (`largeurColonneTableau`, valeur + 46 px) ; au-delà de 660 px moins le
  libellé, coupe en blocs de colonnes équilibrés (`blocsDeColonnes`, libellé répété ; 5 colonnes →
  3 + 2), libellé élargi jusqu'à sa largeur naturelle quand il reste de la place
  (`largeurLibelleBloc`) ; Word : mêmes blocs, rangées insécables, en-tête répété.
- **C. Listes** : « Erreurs fréquentes » puis une erreur par ligne, son coût (« −0,5 », « 0 pt sur
  l'étape 3 », « moitié des points sur l'étape 3 ») aligné à droite (au plus 42 % de la largeur, plus
  de flèche « → ») ; « Accepter » : une réponse acceptée par ligne. Word : tableau sans bordure à
  deux colonnes (68 % / 32 %).
- **Vérifié** (documents réels, `construirePlan` → `genererDocumentsDepuisPlan`, scénarios `docs.cjs`
  4e ch. 2, 5e ch. 1/2/3, 6e ch. 5/3/1, 4e mixte, plan sans groupe ; évaluation 2 séries, examen par
  chapitre à total fixé et par processus en deux colonnes, Word de la grille ; outils du chantier
  `verif.cjs`, `debord.cjs`, `nonreg.cjs`, dossier de travail) : numérotation Réponses = copie =
  détail, points des lignes = points de la copie, réponses = « Réponse : … » de chaque question,
  colonnes des tableaux : somme des cases = total = points de la ligne, nombre de critères = grille
  d'avant (16 grilles, 0 défaut) ; 0 débordement à 680, 820 et 1 280 px, 0 `.katex-error` ; PDF A4 et
  Word (LibreOffice) relus. Non-régression (même plan, code d'avant / d'après) : copie, corrigé,
  aménagée, feuille et Word copie / corrigé identiques (8 / 11 documents par évaluation ou examen,
  seules les grilles changent ; feuille 2 / 2).

## Points pré-remplis du panneau (décision de l'utilisateur)

Panneau des évaluations et des examens (pas la feuille d'exercices, qui n'a pas de points). Règle
(`lib/pointsAutomatiques.ts`, pur) :
- **exercice** : points par exercice = durée estimée de SA variante arrondie à la minute — la valeur
  du repère « ≈ m min » de la rangée (`estimationVariante` / `dureeEstimeeVariante`, même cache, mêmes
  réglages de rangée : calculatrice, paramètres décochés) — ÷ 2, demi-point, bornée entre 1 et 8
  (`pointsDepuisDuree` ; « ≈ 7 min » → 3,5 ; ≥ 16 min → 8). Générateur pas encore noté : même règle
  sur sa durée provisoire (`dureeMinutes`). Calcul paresseux respecté : une rangée choisie calcule sa
  durée tout de suite (comme la durée de l'en-tête), une rangée pas encore choisie garde sa valeur
  enregistrée (4) jusqu'à ce que son repère soit calculé, puis affiche la valeur automatique
  (`useEstimationsCalculees` : le champ se re-rend à chaque estimation mise en cache, sans re-rendre
  tout le panneau) ;
- **vrai/faux** 1 pt par affirmation, **formule** 1 pt, **compréhension** 2 pts (valeur d'avant) ;
- **démonstration** (choix fait) : ≈ 1 pt pour 2 étapes du corrigé (`q.corrige.length`, le nombre
  affiché dans la liste « Choisir »), demi-point, borné 2–6 (4 étapes → 2 ; 9 → 4,5 ; 15 → 6) ; ligne
  sans choix (tirée une seule fois pour toutes les séries) : moyenne des démonstrations que la section
  peut tirer.
- **Unités et état** : une unité = une variante (clé de `parVariante`, copies « ~n » comprises), la
  ligne (`points`) ou une question choisie (`choix:<id>`, `pointsParChoix`). `LigneSelection.modePoints`
  (panneau seulement) : absent = automatique ; « verrouille » = saisi à la main ou plan rechargé ;
  « ajuste » = posé par « Ajuster au total ». Points EFFECTIFS (`pointsUnite`, `materialiser`) :
  utilisés par les totaux, le badge flottant, les parties de l'examen, et écrits dans les lignes
  envoyées à `construireItemsPayload` / `construirePlan` / `buildEvaluationUrl` (sans `modePoints`).
- **Verrou** (`ChampPoints`) : saisie en TEXTE libre lue avec tolérance (`lirePoints` : « 2 »,
  « 2,5 », « 2.5 pts », demi-points ; jamais `type="number"` ni filtre de frappe — les anciens champs
  numériques de points ont été remplacés) ; une valeur lisible est gardée et VERROUILLÉE, une saisie
  illisible est signalée (`aria-invalid`) sans rien écraser, le champ reprend la valeur en sortie.
  Cadenas : fermé = verrouillé (clic → la règle automatique reprend), ouvert = automatique / ajusté
  (clic → verrouiller la valeur affichée). Téléphone : cadenas sous le champ (la colonne « Points »
  garde sa largeur). Changer les réglages d'une rangée non verrouillée (calculatrice, paramètres)
  change son estimation, donc ses points ; une rangée verrouillée ne bouge jamais.
- **« Ajuster au total »** (panneau « Mon évaluation ») : total saisi en texte libre (`lireTotal` de l'examen,
  `normaliserSigneMoins`), les unités NON verrouillées sont mises à l'échelle pour que le total vaille
  la saisie (verrouillées comptées telles quelles) : `examen.ts::mettreAEchelleParGroupes` —
  `mettreAEchelle` lui-même quand chaque unité est une question, sinon mêmes règles (proportionnels,
  demi-points, jamais 0) avec le reste absorbé par les plus petits pas sur les unités de n questions
  (une variante de 3 exercices change le total par pas de 1,5) ; `null` → message (« total trop
  petit : n pts au moins », « somme exacte impossible avec ces nombres de questions : essaie … ») ;
  illisible → message de `lireTotal`. Testé seul (20 000 tirages : somme exacte, ≥ 0,5, demi-points ;
  identique à `mettreAEchelle` quand toutes les unités valent une question). Examen « total fixé par
  partie » : bouton désactivé avec une note (les points sont déjà mis à l'échelle partie par partie
  à l'impression, `itemsDuDocument`) — les deux mécanismes ne se contredisent jamais.
- **Plan rechargé** (`chargerPlan`, import JSON, « Recharger ») : toutes ses questions sont
  verrouillées → points EXACTEMENT ceux du plan, aucun recalcul ; les lignes sans question restent
  automatiques. Un plan enregistré porte déjà les points effectifs (lignes matérialisées).
- **Vérifié** (Playwright, 4e ch. 2 et 6e ch. 5, 1 280 px et iPhone 13, outil `panneau.cjs`) : 72 / 72
  rangées des processus 2 et 3 : points = « ≈ m min » ÷ 2 (de 3,5 à 8) ; badge, barre du bas (aujourd'hui : panneau de droite) et
  sous-totaux = somme des points ; saisie « 3,5 » verrouillée et inchangée quand la calculatrice
  change (les rangées non verrouillées suivent) ; « 2,3 » signalé ; « Ajuster au total » 20 et 37
  exacts (verrouillée inchangée), « vingt » et « 0,4 » refusés avec message ; plan enregistré puis
  rechargé après changement de réglages : mêmes points, tous verrouillés ; démonstrations 2 à 4,5 pts
  selon leur longueur ; scrollWidth 390 sur iPhone 13 (tableau : même largeur qu'avant) ; 0 erreur
  console.

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
  Panneau « Mon examen » : total de l'examen. Saisie : texte libre, `normaliserSigneMoins`,
  jamais de champ numérique (les consignes supplémentaires ne sont PAS normalisées : tirets
  typographiques gardés).
- **Word** (`evaluationDocx.ts`) : bandeau (paragraphe ombré), tableau par partie, consignes (puces
  dans le même cadre), ouvertures de partie, étiquettes, en-tête courant (`titlePage`, première page
  sans en-tête).
- **Remédiation** : `questionsRemediables` suit l'ordre des parties pour un examen (même
  `partiesExamen`) — vérifié identique à la copie A, par chapitre et par processus.

## Parcours élève : assistant « Me préparer à l'évaluation » et évaluation blanche (décisions du 21 et du 22/11/2026)

Maquettes validées « EleveAssistant », « EleveTelephone », « EvaluationBlanche ». Pages publiques
`/exercice` et `/…/exercices`, visiteur NON connecté (qui voit quoi : `.claude/rules/comptes.md`).
- **Assistant** (`components/eleve/AssistantEleve.tsx`, tutoiement, aucun mot « processus ») : 1. feuille
  d'exercices / évaluation blanche ; 2. chapitre (`/exercice` : année + chapitre — `/exercice?niveau=<levelSlug>`
  (`4e`, `5e-4h`, `6e-6h`) présélectionne l'année, lien de la page d'accueil ; valeur inconnue ou année sans
  chapitre proposé ignorée → première année ; page d'un chapitre :
  verrouillé, « Changer de chapitre » → `/exercice`), notions = sections ayant au moins un générateur
  du registre (`notionsDuChapitre`), « Tout le chapitre » (exclusif : cocher une notion ne garde
  qu'elle) ; téléphone : 3 puces + « + n » ; puis **Compétences** cochables Connaître / Appliquer /
  Transférer (une à trois, les trois par défaut ; aide « Coche ce que ton professeur a annoncé pour
  l'interrogation. » pour la blanche ; feuille : voir « Feuille d'exercices de l'élève » plus bas —
  jamais de pourcentages pour la feuille ; évaluation blanche : parts et démonstrations annoncées,
  voir plus bas) ; 3. durée 20 / 30 / 50 min (blanche seulement), **Niveaux** cochables
  (cinq cases « 1 très facile » … « 5–7 très difficile », numéro dans sa case teintée ; un ou
  plusieurs, TOUS par défaut = niveaux mélangés, l'ancien « Réel » ; « Tout cocher » quand il en
  manque), « Version aménagée ». Cases ≥ 44 px, case carrée avec ✓ (l'état ne repose pas sur la seule
  couleur), téléphone : deux par rangée. La dernière case cochée (niveau proposé, compétence ayant des
  exercices) ne se décoche pas (« Garde au moins un niveau / une compétence »).
  **Disponibilité EN DIRECT** (`compositionEleve.ts::disponibilite`, sur les candidats déjà préparés —
  niveaux des tirages d'estimation, pas de nouveau moteur) : un niveau sans aucun exercice des
  compétences cochées dans ces notions est grisé (`aria-disabled`, bordure pointillée, non cochable,
  infobulle) et la raison est écrite sous les cases : « Grisé : aucun exercice à ce niveau dans ces
  notions. Connaître : seulement en très facile et facile · … » (`texteSeulement`) ; une compétence
  cochée sans exercice aux niveaux cochés est signalée (« Transférer : aucun exercice aux niveaux
  cochés (seulement de moyen à très difficile) — son temps va aux autres compétences cochées. ») ; une
  compétence sans aucun exercice dans les notions est grisée (« aucun exercice ici »). Un niveau grisé
  qui était coché reste coché dans l'état (il revient si une notion le rend disponible) mais ne compte
  pas : rien n'est composé si aucun niveau coché n'est proposé. Jamais de substitution silencieuse.
  Récapitulatif EXACT : le plan est préparé dès qu'un réglage change (clé des réglages : un plan
  d'anciens réglages n'est jamais affiché ni généré), « 5 questions · ≈ 30 min · 20 points » = questions
  imprimées après regroupement (`questionsDeSerie`), puis « Niveaux : facile à difficile · Appliquer et
  Transférer » = niveaux (catégories) et compétences RÉELLEMENT imprimés (`ResumeEleve.categories`,
  `competences`, vrai/faux compté au niveau 2) ; « Générer » rend CE plan puis en prépare un nouveau
  (nouveau tirage à chaque clic). Téléphone : barre `position: sticky` en bas. Rien n'est enregistré
  (pas d'historique écrit ; `construirePlan` le lit seulement).
- **Composition** (`lib/compositionEleve.ts`, jamais un second moteur) : candidats = variantes non
  retirées (`catalogueVariantesExercice`, mode `evaluation` pour la blanche — groupes à verdict
  compris) + thèmes vrai/faux (2 min, 1 pt, niveau 2) ; niveau et durée par variante sur 8 tirages
  (`niveauEtDuree`, contrainte « exercice complet » de l'évaluation pour la blanche), calculés une
  variante à la fois (la page ne gèle pas), en cache. **Jamais une compétence non cochée**, même pour
  remplir la durée (filtre AVANT tout). Un candidat est retenu aux niveaux cochés si ≥ 50 % de ses
  tirages y tombent (`candidatAuxNiveaux` ; générateur sans niveau : seulement avec les cinq cochés) —
  la même règle décide la disponibilité, donc un niveau proposé, coché seul, donne au moins un
  exercice. **Proportions** (décision de l'utilisateur, 22/11/2026 : la répartition 25 / 50 / 25 ne
  vaut que pour l'EXAMEN) : ancien chemin « durée » de la feuille (plus utilisé par l'assistant depuis
  le nombre d'exercices, puce « Feuille d'exercices de l'élève ») : temps partagé à PARTS ÉGALES entre
  les compétences cochées (`repartitionProcessus.ts::partageEgal`, appelé par `budgetsParCompetence` ;
  une seule → 100 %) ; évaluation blanche : parts au hasard ou réglées (puce suivante) ; jamais le réglage
  du professeur ; une compétence cochée sans
  exercice aux niveaux cochés cède son temps aux autres cochées présentes, à parts égales (aucune
  présente → rien). Récapitulatif : « · Appliquer et Transférer, temps partagé à parts égales » dès
  que deux compétences au moins sont imprimées. Phrase des niveaux : « Tous cochés : les niveaux sont
  mélangés. » (plus « comme dans une vraie évaluation »). Remplissage :
  Transférer d'abord, puis Connaître (vrai/faux plafonnés à son budget), puis Appliquer jusqu'à la
  durée, puis n'importe quelle compétence cochée ; durée remplie jusqu'à la cible sans la dépasser de
  plus de 10 % ; variété (notion la moins servie, puis générateur, jamais deux fois la même variante
  tant qu'une autre convient). **Niveaux voisins** : durée remplie < 85 % → les niveaux à 1 pas de
  l'échelle complètent, puis à 2 pas…, toujours dans les compétences cochées (compétences en retard
  sur leur part d'abord) ; `Composition.niveauxAdmis` = cochés + voisins réellement utilisés. Puis
  LIGNES du panneau (`lignesDeComposition`) → `construireItemsPayload` → `construirePlan`. Retouches du
  plan figé : un exercice dont le niveau RÉEL sort des niveaux admis, ou qui ferait dépasser la durée,
  reçoit une autre graine de la même variante (40 essais / 120 ms, contrainte respectée, jamais un
  énoncé déjà dans le document) ; dépassement restant → l'exercice le moins utile est retiré. Un
  exercice imprimé hors des niveaux cochés → note « Peu d'exercices aux niveaux cochés dans ces
  notions : des exercices de niveau moyen complètent. » (`categoriesHorsChoix`). Points (blanche) :
  durée réelle → `pointsDepuisDuree`, vrai/faux 1 pt, puis 20 pts partagés à parts égales entre les
  compétences imprimées (`partageEgal` → `mettreAEchelle` : 20, 10 / 10, 7 / 6,5 / 6,5 ; puis
  `mettreAEchelleParGroupes`). Une seule compétence cochée : composition identique à celle d'avant le
  partage égal à graine égale (vérifié). (Avant le 22/11 : les cinq niveaux et les trois compétences
  cochés = exactement l'ancien « Réel ».)
  **Calculatrice** : « autorisée » imprimée (choix : aucun chapitre ne l'interdit dans ses données), le
  tirage n'est PAS contraint (sinon « autorisée » ne tirerait que des cas à la calculatrice) ; une
  variante `calculatriceIndispensable` reste donc permise.
- **Évaluation blanche : parts au hasard, réglables ; démonstrations annoncées** (décision de
  l'utilisateur, 22/11/2026, choix c : « je ne respecte pas les proportions […] je ne peux faire croire
  aux élèves que mon évaluation sera équilibrée comme dans leur simulation » ; « s'il y a des
  démonstrations à retenir, je leur dis lesquelles »). `ReglagesEleve.parts` (absent = feuille, code
  d'avant inchangé : non-régression 483 / 483 compositions feuille et 483 blanche sans parts).
  **Loi** (`repartitionProcessus.ts::tirerPartsHasard`) : parts multiples de 5 %, chacune de 15 à 70 %,
  somme 100, UNIFORME parmi les répartitions possibles (2 cochées : 9, 3 : 78 ; une part ≥ 50 % dans
  58 % des tirages à trois) ; une seule → 100 % ; tirée parmi les cochées QUI ONT des exercices
  (`partsVisees`) ; fonction de la seule graine (mulberry32, `aleatoireDepuisGraine`) : mêmes cochées +
  même graine → mêmes parts, et la composition est tirée avec la même graine (mêmes candidats → même
  composition). Nouvelle graine à chaque « Générer » et « Autre tirage » (bouton du récapitulatif) ;
  elle n'est pas un code de document (le plan dépend aussi de l'historique et des budgets de temps).
  **Réglage** : segments « Au hasard » (défaut) / « Je règle les parts » → `ReglageCompetences` du
  professeur avec la prop `eleve` (sans cases : les compétences sont cochées dans l'assistant, pas de
  « Préparer », « Revenir au hasard », Échap) : 33 / 34 / 33, − / + de 5, 5 % au moins, non mémorisé,
  remis à égalité quand une compétence change. **Composition** (`composerParParts`) : budgets = parts ×
  durée ; Transférer, Connaître (une démonstration annoncée d'abord si elle tient), Appliquer ; un ajout
  n'entre que s'il ne dépasse sa part ni de plus de la moitié de sa durée ni de plus de
  `DEPASSEMENT_MAX` (4 min, règle de « Préparer l'évaluation » du professeur) ; temps réservé pour la
  question la plus courte des compétences pas encore servies ; aucune question qui tienne → la plus
  courte si elle tient dans la durée (+ 10 %) ; jamais de temps donné à une autre compétence ; niveaux
  voisins pour les compétences en retard seulement. **Points** : 20 pts partagés selon les parts
  ramenées aux compétences imprimées (`partsAuProrata` → `mettreAEchelle`), dans une compétence selon
  la durée comme avant ; total impossible en demi-points à cause de vrai/faux à n affirmations → chaque
  affirmation devient son élément (même thème : toujours UNE question imprimée), nouvel essai.
  **Affichage** = parts des points (`ResumeEleve.parts`, `pourcentsEntiers`) : récapitulatif « Connaître
  20 % · Appliquer 65 % · Transférer 15 % — tirées au hasard : ta vraie interro peut être répartie
  autrement » (« réglées par toi » ; téléphone : avertissement final masqué dans la barre collante, il est
  écrit sous les segments) ; document et aménagée : « Parts : … » sous la durée
  (`EnTeteEvaluation.blanche.repartition`, `texteRepartitionBlanche`). **Démonstrations** : liste
  « Démonstrations annoncées » (titres des blocs « Démonstration — … », `demonstrationsDuChapitre`, notions
  retenues ou tout le chapitre) quand Connaître est cochée ; AUCUNE cochée par défaut (choix : l'élève
  coche ce que le professeur a annoncé ; tout cocher aurait tiré des démonstrations jamais annoncées) ;
  seules les cochées sont candidates (`CandidatDemonstration`, 1 fois au plus, jamais deux au même
  énoncé, durée = 2 × `pointsDemonstration`, sans niveau), ligne `demonstration` à `choix` explicite.
  **Vérifié — 22/11** (dossier de travail `blanche-eleve` : `tests.mjs`, `ui.mjs`) : loi 1 543 contrôles
  purs ; 23 chapitres × 7 combinaisons × 20 graines = 3 220 compositions : 0 part hors loi, 0 compétence
  non cochée, 0 non reproductible, 0 dépassement (total ≤ + 10 %, part ≤ + 4 min hors 28 « plus courte
  forcée »), écart temps − part de −10 à +9 min (moy. |écart| 1,35), durée remplie ≥ 85 % dans 3 099 / 3 140,
  80 vides = combinaisons sans aucune question ; 471 plans : points = parts, total 20, parts affichées
  = parts des points, 0 compétence cochée absente ; démonstrations 1 228 tirées, 0 hors des cochées,
  aucune sans case cochée ; Playwright (build de production, iPhone 13 et 1 280 px) 96 vérifications,
  documents HTML + PDF, 0 erreur console, `scrollWidth` = largeur.
- **Feuille d'exercices de l'élève : un NOMBRE d'exercices, ni durée ni points** (décision de
  l'utilisateur, 22/11/2026 : « pas de limite de temps ou de longueur […] rien à voir avec une
  évaluation » ; nombre : « les deux »). Plus de réglage « Durée », de « ≈ n min », de points ni de
  parts par compétence pour la feuille (la blanche ne change pas). Bloc 3 « Quels niveaux, et combien
  d'exercices ? » : niveaux, puis « Combien d'exercices ? » (`Compteur` − / +, 1 à 30, 10 par défaut,
  cibles 44 px, aucun champ numérique). `ReglagesEleve.exercices` (`ExercicesFeuille`, absent = ancien
  chemin « durée », gardé et inchangé) → `composerFeuille` : types = `typesFeuille` (notions,
  compétences cochées, niveaux cochés par la règle des 50 % ; AUCUN niveau voisin ; questions ouvertes de
  Connaître : puce suivante) ; **global** : un exercice à la fois, compétence la moins servie, puis
  notion la moins servie dans elle, puis type le moins servi (jamais deux fois le même type tant
  qu'un autre de cette notion et compétence est libre — l'équilibre passe avant), puis générateur,
  égalités au hasard ; au plus `MAX_PAR_TYPE` = 5 par type (vrai/faux : au plus la banque ; une
  affirmation = un exercice) ; moins que demandé → « Seulement n exercices disponibles avec ces
  choix » et « n exercices sur N demandés » ; **« Choisir exercice par exercice »** : la liste des
  types (`typesFeuille`, par notion, compétence et « niv. 2–4 · facile à difficile » en petit),
  pré-remplie avec la feuille préparée, compteur 0 à `capaciteType` par type, total, « Revenir au
  nombre global » ; rien de mémorisé (changer de chapitre revient au global). Retouche du plan : le
  niveau réel seulement (aucune durée visée, aucun exercice retiré). Récapitulatif « 10 exercices »
  (`ResumeEleve.exercices` = instances + affirmations, avant regroupement ; note « les exercices de
  même consigne sont regroupés sous un même numéro » quand il y en a). Document : celui d'avant
  (aucune durée ni aucun point n'y était imprimé). Case **« Joindre le formulaire du chapitre (juste après les exercices) »**
  (feuille seulement, chapitre qui a un `formulaire` ; décochée par défaut, décision du 22/11/2026) :
  `entete.joindreFormulaire` posé au moment de « Générer » (cocher ne refait pas le tirage), même annexe
  que la case du professeur, juste après l'énoncé, avant « Je vérifie ». **Vérifié — 22/11** (dossier de travail
  `feuille-eleve` : `tests.mjs`, `ui.mjs`) : 23 chapitres × 3 choix de notions × 7 combinaisons × 3
  choix de niveaux × 1, 5, 10, 30 = 5 796 compositions : nombre = min(demandé, disponibles), 0 hors
  choix, 0 déséquilibre, 0 répétition évitable, reproductible ; 2 898 « à la carte » exactes ;
  276 plans réels (deux passes) : nombres par variante / thème identiques, 0 puis 4 instances hors
  des niveaux cochés sur ≈ 3 400 (retouche sans autre tirage ; note « Un exercice tiré est de niveau… »
  affichée chaque fois) ; documents feuille + aménagée sans durée ni points ; blanche (hasard, réglée, sans parts) et ancien
  chemin feuille identiques à la branche de départ (4 × 644 compositions) ; Playwright iPhone 13 et
  1 280 px 86 vérifications, 0 erreur console, `scrollWidth` = largeur.
- **Connaître plus riche dans la feuille ; vrai/faux plafonnés dans la blanche** (décisions de l'utilisateur,
  22/11/2026). Feuille : Connaître reprend les questions ouvertes du panneau du professeur — types
  `CandidatOuverte` « Formule — <notion> » et « Question de compréhension — <notion> » par section qui en a
  (toutes les sections du chapitre, même sans générateur, comme les démonstrations), capacité
  min(`MAX_PAR_TYPE`, questions DISTINCTES de la banque) ; démonstrations : liste « Démonstrations à
  travailler » (même composant que la blanche, aide « Coche celles que tu veux travailler. », AUCUNE cochée
  par défaut), seules les cochées sont des types (compteur 0 ou 1 ; deux démonstrations au même énoncé
  imprimé : une seule par feuille — `disponiblesFeuille`, compteur de l'autre bloqué à 0). Global : même
  répartition équilibrée que les autres types ; une question = un exercice. Lignes `formule` /
  `comprehension` SANS choix (tirage de `nombre` questions distinctes par `construireItemsPayload`) et
  `demonstration` à `choix` → `construirePlan` → `genererDocumentsDepuisPlan` : rendu de la feuille du
  professeur (énoncé, carte « Je vérifie » « Voir le corrigé détaillé », corrigé ; l'aménagée de la
  feuille n'a que l'énoncé, comme celle du professeur). **Niveaux (choix fait)** : ces questions n'ont pas
  de niveau — toujours admises quels que soient les niveaux cochés (`estSansNiveau`, `candidatAuxNiveaux`),
  aucun badge ; Connaître sans autre question que celles-là reste composable même si tous les niveaux
  sont grisés (`sansNiveauSeules`) ; texte « …, plus des questions sans niveau (toujours proposées) »,
  récapitulatif « Questions sans niveau · Connaître ». L'ancien chemin « durée » ne les tire pas.
  Blanche : `MAX_VRAI_FAUX_BLANCHE = 5` affirmations au plus au total (plafond de temps vrai/faux de
  `remplir`, parts ou non) ; le reste de la part de Connaître va aux autres questions Connaître ; un
  seul vrai/faux imprimé, total 20. **Vérifié — 22/11** (dossier de travail `connaitre-eleve` :
  `tests.mjs`, `docs.mjs`, `ui.mjs`) : 23 chapitres (tous ont formules et compréhension ; 18 ont des
  démonstrations, 2 ont deux démonstrations au même énoncé) : 6 048 compositions globales (types Connaître
  tous présents, 0 démonstration non cochée, nombre = min(demandé, disponibles), 0 déséquilibre, 0
  répétition évitable) et 3 024 à la carte exactes ; 230 plans réels : 1 367 questions ouvertes, 0
  répétée, 0 hors banque ; blanche 14 490 compositions et 138 plans : ≤ 5 affirmations, total 20, 0
  compétence non cochée ; non-régression : feuille sans Connaître (1 632), ancien chemin (4 830), blanche
  sans vrai/faux (9 660) identiques ; blanche avec vrai/faux identique dès que le plafond ne joue pas
  (15 écarts, tous où le code d'avant tirait 5 affirmations et pouvait en tirer une 6e : le tirage
  aléatoire se décale) ; 24 documents réels : énoncé / « Je vérifie » / corrigé présents, 0
  `.katex-error`, 0 débordement ; Playwright 50 vérifications (iPhone 13 et 1 280 px), 0 erreur console.
- **Document « Évaluation blanche »** (`EnTeteEvaluation.blanche = { dureeConseillee }`, mode
  `evaluation`, une série ; `genererDocumentsDepuisPlan` → type `blanche` + aménagée si demandée ; ni
  corrigé séparé ni grille ; `assemblerEvaluationHtml.ts::genererEvaluationBlanche`) : cartouche
  « ÉVALUATION BLANCHE · 4e · ENTRAÎNEMENT PERSONNEL », titre = chapitre, « Durée conseillée : 30 min ·
  20 points indicatifs · sans valeur de note » (durée réelle arrondie aux 5 min), Nom / Début / Fin
  (choix : pas de professeur — « M. Hamwi » aurait été imprimé chez tous les visiteurs), tableau « Mon
  score » par processus + encadré calculatrice, consignes de l'élève (phrase QR seulement s'il y a un
  QR), bandeaux de processus, « Question n » et points à droite, QR « Refaire en ligne avec les aides »
  par question (par ligne dans un groupe, sans niveau — présentation d'une évaluation : option
  `niveau: false` des lignes ; la feuille d'exercices, elle, imprime « 4 · difficile »), puis
  « Corrigé détaillé » en fin de document (`pageCorrigeFeuilleHtml(…, "Question")`, rendu de la
  feuille) ; pied « Évaluation blanche — corrigé détaillé en fin de document » · page n / N. Aménagée :
  même énoncé et mêmes points, une question par page, sans QR, corrigé à la fin. Les autres modes ne
  changent pas.
- **Vérifié — 21/11** (outils `composition.mjs`, `docs.mjs`, `ui.mjs`, dossier de travail
  `conception-eleve`) : 2 400 plans (3 chapitres × 2 durées × 4 anciens niveaux × 2 types) : 0 erreur,
  0 plan vide, 0 dépassement de plus de 10 %, total 20 pts ; documents réels 0 `.katex-error`, 0
  débordement ; non-régression 72 / 72 HTML, Word 24 / 24.
- **Vérifié — 22/11, niveaux et compétences** (outils `tests.mjs`, `ui.mjs`, `docs.mjs`, dossier de
  travail `niveaux-refonte`) : proportions des 7 combinaisons de compétences et cessions exactes ;
  5 chapitres × 2 types × 25 plans aux réglages aléatoires (compétences, niveaux, durée) : 0 exercice
  d'une compétence non cochée (niveaux voisins compris), 0 dépassement, 0 erreur, blanche 20 pts et
  points par compétence à 1 pt au plus de la part recalculée ; disponibilité : 350 contrôles (chaque
  niveau seul × 7 combinaisons × 10 cas), 0 incohérence avec le moteur ; défaut ≡ ancien « Réel »
  (copie du code d'avant, même répartition) : 120 / 120 compositions et plans identiques à graine égale.

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
  regroupée a), b), c) : reprise en entier, n fois, et les exercices d'une question forment UN groupe
  dans la feuille (section « Regroupement a), b), c) »).
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
(6gen23–29, 6gen77–84) ; 5e ch. 3 (5gen14–19, 5gen44–49) ; 6e ch. 3 (6gen13–22, 6gen85–92) ; 4e ch. 4 (gen30–38, gen108–112) ; 4e ch. 2 (gen1–6, gen57, gen67) ; 4e ch. 5 (gen14–19, gen58, gen73–81, gen122) ; 5e ch. 2 (5gen6–13) ; 6e ch. 2 (6gen6–12) ; 4e ch. 1 (gen7–9, gen55) ; 6e ch. 1 (6gen1–5) ; 5e ch. 1 (5gen1–5) ; 5e ch. 4 (5gen20–24) ; 4e ch. 6 (gen20–29, gen82–91) ; 4e ch. 7 (gen42–48, gen49–54). Les autres adaptateurs s'affichent comme avant (contrat rétrocompatible).
- 4e ch. 7, moitié 2 (gen49–54 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeAnalytique2.ts` (`COURS_*` § 7–10, `lignesCompleterCarre` une parenthèse à la fois, `lignesRacine` — racine d'un quotient, carré extrait —, `lignesEquationCercle` centre et rayon substitués bruts puis signes simplifiés, `lignesPointSurCercle`, `lignesDiscriminant` / `lignesSolutions` (trinôme entier), `finaliserAnalytique2`) ; une lettre par ÉCRAN, branchés dans les 6 applis. Figures sans `docx` sorties des adaptateurs : `equationCercle/figure.ts` (centre C, [CP], écarts du triangle de Pythagore pour le rayon indirect), `equationParabole/figure.ts` (axe en pointillés, K sur d). gen50 : ligne « on remplace » à fractions entre accolades (pleine largeur : le bloc défilait à 390 px). gen51 : S milieu de [KF], p par la chaîne de l'écran, vérification y_S − p/2 = directrice lue. gen53 : `construireEnonce` réécrit à une question par écran (`consigneEcran`, 8 / 7 écrans), barème rattaché aux écrans, bloc « Construction » (relation garantie par chaque geste : PF = r, dist(P ; d) = r, MK = MF…) ; tracé final sans calcul (geste à main levée). gen54 : parabole ramenée à sa forme réduite avant la substitution (y² s'éliminent), trinôme entier = celui de l'écran, Δ, solutions, seconde coordonnée par la droite, point vérifié dans la courbe ; niveau CONSTANT (3, 8 min, `sansCharge`) quel que soit le nombre de points. Lectures : gen49 a (et b en rayon direct), gen51 a ; écrans répétitifs de gen53 (couples / points suivants, tracé) comptés comme lectures ; piège p < 0 (gen51, gen52). Collecteur `corrige-4e7-m2/coll`.
- 4e ch. 2, moitié 1 (gen1–4, notés : `criteresDifficulte` ; lectures depuis le lot E de l'audit : signe de a (gen2), CE lue sur un dénominateur factorisé, racines lues sur une forme factorisée — la reconnaissance de la méthode est une DÉCISION et compte comme une étape) : briques `4e/ui/corrigeSecondDegre1.ts` (`COURS_*` § 1/2/4/5, nombres `c√k` exacts, reconnaissance testée ligne par ligne `c=0` / `b^2=4ac`…, factorisations jusqu'à la forme factorisée DE L'ÉCRAN, produit nul / CE facteur par facteur, Δ puis √Δ simplifiée et x₁, x₂, vérification Viète ou substitution, `finaliserCorrige` : formules des justifications et résultats rédigés groupées `{…}`) ; une lettre par ÉCRAN, lettres = `phasesExercice` du moteur (gen3 jusqu'à 11 écrans, gen4 jusqu'à 11) ; gen2 : figure allure + tableau de signes (racines marquées, solutions en gras), l'appli passe l'exercice COURANT (déjà réduit après simplification, `phasesInequation`) ; gen4 : produit en croix orienté pour retomber sur `equationIsolee`, sous-variante B factorisée par (x − p₃) avant de développer. Collecteur `corrige-4e2-m1` (ensemble final de gen2 relu point par point, solutions de gen1/gen4 remises dans l'équation de départ).
- 4e ch. 6, moitié 1 (gen20–29, notés : `criteresDifficulte`) : briques `4e/ui/corrigeVecteurs1.ts` (`COURS_*` § 1–17, `lignesComposantes` « extrémité − origine », `lignesMultiple`, `lignesNorme` (carrés, somme, racine simplifiée), critères de colinéarité / d'orthogonalité substitués, `lignesCritereLin` — produits de facteurs affines développés en identités en x ; au-delà de ≈ 32 caractères visibles, P₁ et P₂ calculés chacun sur deux lignes puis combinés (sinon le membre de droite se coupait à 680 px ou défilait à l'écran) —, `lignesPremierDegreNul`, `milliers`, étapes partagées gen20/gen21 `etapesTranslationPoint` / `etapesMultiplePoint`). Corrigés `4e/generateurs/<gen>/corrigeDetaille.ts`, une lettre par ÉCRAN (`SEQUENCES` / phases des applis ; gen25 « triangle » et « triangle avec x » : `construireEnonce` réécrit à 5 questions = 5 écrans, barème rattaché aux écrans), branchés dans les 10 applis (`corrigeDetaille` de `validation`). Figures sans `docx` sorties des adaptateurs (`constructionVectorielle/figure.ts`, `comparaisonVecteurs/figure.ts`, `reductionVectorielle/figureHtml.ts` — chaîne de Chasles en pointillés et vecteur réduit) ; gen27 : somme nommée \vec{w}, termes opposés annulés dans leur bloc, retournement, rangement, Chasles un raccord par ligne ; gen29 : normes notées R, F₁, F₂ / v_R, v₁, v₂ comme au § 17, valeurs en mémoire (« ≈ »), α₀ = sin⁻¹ puis sens par F₁ + F₂ cos θ, aucun radian. Lectures : gen25 conclusion du triangle, gen26 nature isocèle, gen29 configuration et direction. Sans charge (même calcul répété) : gen26 les trois longueurs, gen28 la sélection, gen25 « triangle avec x » b–e (leur longueur dépendait du sommet de l'angle droit, donc de la réponse) ; gen29 piège constant 0 (une déviation obtuse donne « Sud »). Durées (constante → mesurée) : gen20 3 → 4 ; gen21 3 → 4/6 ; gen22 5 → 6 ; gen23 3 → 4 ; gen24 4 → 4–8 ; gen25 5 → 4–12 ; gen26 5 → 4–8 ; gen27 3 → 4–6 ; gen28 4 → 6 ; gen29 8 → 9. Collecteur `corrige-4e6-m1` (vecteurs évalués composante par composante : `\vec{AB}`, colonnes, normes, points de gen21 ; x générique pour les identités, solution pour les équations) : 2 160 tirages, ≈ 25 000 égalités, 0 fausse.
- 4e ch. 7, moitié 1 — droites (gen42–48, notés : `criteresDifficulte`) : brique `4e/ui/corrigeAnalytique1.ts` (`COURS_*` § 1–6, `lignesVecteurDeuxPoints` « extrémité − origine », `lignesMultipleEntier` (vecteur lu fractionnaire → multiple entier), `lignesCoefficientsCartesiens` a = y_u, b = −x_u, c = −(a·x_A + b·y_A) comme l'écran de gen42, `lignesCartesienneParNormale` y_u(x − x_A) − x_u(y − y_A) = 0 distribuée / réduite / simplifiée, `lignesExpliciteY/X`, `lignesParametriques`, `lignesPointCartesienne` (coordonnée choisie, l'autre résolue), `lignesPointSur…` (vérifications), critères de colinéarité / d'orthogonalité avec chaque produit écrit `x_u·y_v − y_u·x_v`, `lignesSysteme2` (système e·U + f·V = k, inconnues nommées x/y ou t/s : équation à une inconnue lue, substitution sur un coefficient ±1, sinon combinaison ; une opération par ligne, reste fractionnaire divisé en `\dfrac{n}{d\cdot c}`), `lignesDistanceDeuxPoints`). Corrigés `4e/generateurs/<gen>/corrigeDetaille.ts`, une lettre par ÉCRAN, branchés dans les 7 applis (`corrigeDetaille` de `validation`) ; gen44 (étape « tracé ») et gen47 (parallèles, après le choix du point) reçoivent les points CONFIRMÉS de l'écran (ceux de l'élève, ou du moteur après trois échecs) — `pointEntierSurDroite` / `donneesResolution` de gen47 vivent maintenant dans le corrigé (l'adaptateur les importe). Figures sans `docx` : `lectureGraphiqueDroite/figure.ts` (A, B lus et point de contrôle C étiquetés), `constructionDroite/figure.ts` (droite par deux points donnés) ; `figureLotG` pour d et d′ (gen45), d, b, P, Q et l'angle droit (gen47), les deux droites et I (gen48). gen46 : notations du cours § 3 (`\tan\alpha = m`, touche tan⁻¹ en mode degrés, + 180° si négatif ; angle avec Oy `90° − tan⁻¹ m`), angles calculés au centième puis à l'unité (« ≈ »), vérification par le point (0 ; p) dans l'équation cartésienne. gen48 : nombres exacts partout (l'ancien corrigé imprimait « 8·(−0.3333…) » en param_param). Lectures : gen42 « point + vecteur » a, gen44 b (placer, tracer), gen45 et gen46 extraction depuis des équations paramétriques. Pièges dans les données : gen42 angle avec Oy, gen45 perpendiculaire à une droite parallèle à un axe, gen46 pente négative pour l'angle avec Ox ; nombres : gen46 angle non remarquable. Niveau CONSTANT dans un verdict : gen42 (forme explicite possible / impossible), gen45 reconnaissance (relation), gen48 (critères fixes par variante : 2 étapes, 3 pour deux paramétrages, `sansCharge`, méthode 1). Durées (constante → mesurée) : gen42 5 → 5–6 ; gen43 4 → 4 ; gen44 4 → 5–7 ; gen45 5 → 7–8 ; gen46 5 → 5–11 ; gen47 7 → 8–12 ; gen48 6 → 6 / 8. Collecteur `corrige-4e7-m1/coll` (vecteurs composante par composante, degrés `^\circ` avec « ≈ » toléré à la demi-unité du dernier chiffre écrit en degrés, paramètres t / s et points des instances, contrôle « fraction de fraction ») : 2 240 tirages, ≈ 27 000 égalités, 0 fausse.
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
- 4e ch. 5, moitié 2 — les triangles (gen19, gen58, gen73, gen74, gen75, gen77, gen80, gen81 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeTriangles.ts` (`COURS_*` § 3–7 ; loi des sinus isolée ligne à ligne pour un côté / pour un sinus, touche sin⁻¹ puis supplémentaire « (cours, § 4) », Al-Kashi pour un côté — substituée, carrés et produit calculés, carré, racine — et pour un angle — isolée en cos (ajout/retrait, division : une opération par ligne), fraction simplifiée, touche cos⁻¹ —, aire ½ · p · q · sin X, somme des angles). **Valeur en mémoire** (`Val` : `donnee`/`angleDonne` exactes, `coteMemoire`/`angleMemoire` écrites au centième / au dixième AVEC leurs zéros, « 125{,}0° ») : toute substitution d'une valeur arrondie est un « ≈ », le résultat qui la suit aussi (`relSubst`, `relApres`, `apres`) — jamais « 135 · sin 53,1° = 108 ». Une lettre par ÉCRAN (gen58 : pont, angles OU soustraction, cible, interprétation — l'écran « interprétation » manquait aux étapes papier : ajouté à `construireEnonce`). Figures dans le corrigé : parallélogramme résolu (gen80 a), arc de compas (gen74 d), deux configurations (gen75 « angle » c, `figureSvgPapier(e, true)`), figure résolue (gen77 e). Vérifications : Héron (gen19 b), aire retrouvée (gen75 « côté »), Al-Kashi après la loi des sinus (gen80 cap, gen75 Héron), contrôle de gen73 par Al-Kashi, inégalité triangulaire (gen80). gen81 (détective) sur le modèle de gen112 : la ligne refaite et « ≠ copie », constat chiffré (radians : la même fonction en rad et en degrés), blocs « Ligne k » — la copie recopie les valeurs ARRONDIES d'une ligne à l'autre et la valeur attendue de l'écran en dépend : le corrigé suit cette règle, avec « ≈ » devant toute valeur recopiée arrondie (même un entier issu d'un « ≈ » précédent). **Niveaux** — lectures : gen73 a (configuration), gen74 d (nombre de triangles), gen77 a et e, gen58 interprétation ; méthode 0 (gen74, gen75 sauf quadrilatère), 1 (gen19, gen73, gen81, gen75 quadrilatère), 2 (gen58, gen77, gen80) ; piège dans les données : gen19 Al-Kashi avec angle compris obtus, gen73 angle obtus à calculer en SAS/SSS, gen75 « angle » (un sinus, deux amplitudes) et quadrilatère à angle B obtus, gen77 « deux positions ». gen74 : niveau ET durée CONSTANTS (3 · moyen, 12 min, `sansCharge`) — 0, 1 ou 2 triangles est le verdict ; gen81 : piège constant 0 (le type d'erreur est la réponse de l'écran 2). Mesuré (200 tirages libres + 30 par variante) : gen19 niv. 3–4, 7 min ; gen58 4–5, 10–14 min (moy. 12,6) ; gen73 4–5, 12–14 (12,4) ; gen74 3, 12 ; gen75 1–5, 6–9 (7,5) ; gen77 5–6, 13–15 (13,3) ; gen80 5, 11–13 (12,5) ; gen81 4, 9–11 (10,1). Écritures corrigées à la source (écran = aides = papier = corrigé) : gen75 `egalOuEnviron` (« sin Ĉ = 0,875 », plus « ≈ » pour une valeur exacte) ; gen80 degrés `^\circ` (plus « ° » brut en mode math) et « ≈ » dans les aides qui substituent une valeur arrondie ; gen81 copie, aides et constats en `^\circ`, `membresLatex` / `relationResultat` (« a ≈ √52,42 », « 180° − sin⁻¹(0,8660) ≈ 120° », jamais « = ») ; formats d'écran de ces huit générateurs sans `docx` (`texte`/`latex` de `corrigeTableau`). Collecteur `corrige-4e5-m2` : degrés (`^\circ` → radians), `\hat{X}`, `\widehat{XYZ}`, noms de segments, `\sin^{-1}`, unités N/kN/km/h/nœuds ; « ≈ » toléré à la demi-unité du dernier chiffre écrit, PROPAGÉE à travers une substitution de valeurs arrondies — 2 800 tirages, ≈ 50 000 relations évaluées, 0 fausse.
- 5e ch. 2, moitié 1 (5gen6 arcs et secteurs, 5gen7 polygones, 5gen12 géométrie du cercle, 5gen8 paramètres d'une sinusoïde ; notés, `criteresDifficulte`) : brique `5e-4h/ui5e/corrigeTrigonometrie1.ts` (`COURS_*` § 1–4 avec espace insécable, rationnels `Q`, multiples de π exacts `piQ`/`piBrut` — la forme non réduite sur sa ligne puis « on simplifie par 15 » —, `lignesDegresVersRadians` « 75 × π/180 = 75π/180 = 5π/12 », `lignesRadiansVersDegres` « 5π/12 × 180/π = 5 × 180/12 = 5 × 15 = 75 » (nombre de degrés SANS ° dans la chaîne, ° au résultat), `lignesProduitPi`, `lignesQuotientPiParEntier`, `lignesQuotientPiParPi` (× inverse, π simplifié), `lignesAireSecteurExacte`, `lignesDifferencePi`, `RP` / `lignesFinRP` pour A, ω, φ, Φ, b, `approche` (arrondi avec ses zéros), `sansDoublons` qui retire aussi « =Y » après « X=Y ») ; une lettre par ÉCRAN (5gen6 `quantitesManquantes`, première ligne = substitution de l'aide de niveau 2 `formulesDisponibles(…)[0]`, r depuis A et θ par r² puis √ ; 5gen7 `sequencePolygone` ; 5gen12 `phasesDuScenario` ; 5gen8 `ORDRE_PHASES_SINUSOIDE`). 5gen12 : secteur balayé en valeurs EXACTES (θ multiple de π, A₁ − A₂ au même dénominateur, vérification ½(r₁² − r₂²)θ) ; segment et lentille : cos θ en fraction réduite, `\theta=\arccos\left(…\right)`, aires « = 72θ ≈ … » et « = 72(θ − sin θ) ≈ … » avec θ NON arrondi, lentille = somme des segments à 4 décimales ; croquis de l'énoncé en `figureHtml` de la première étape. Vérifications : retour aux degrés / radians, s ou A recalculé avec r trouvé, k × élémentaire (5gen7), ωT = 2π, −ωΦ = φ. **Lectures** (5gen8 seul) : A, ω, b, et φ en forme développée ou Φ en forme pré-factorisée (`lettresLectureSinusoide`). **Niveaux** : 5gen6 méthode 1 (2 → 3) / 0 (conversion), nombres 1 seulement pour la conversion décimale ; 5gen7 méthode 0, nombres 0 (valeurs en π acceptées sur papier) ; 5gen12 méthode 1 (secteur balayé, segment) / 2 (lentille), nombres 1 ; 5gen8 méthode 0, piège = A < 0 ou parenthèse « x + k » en forme pré-factorisée ; aucun piège ailleurs (convertir θ en radians est la méthode). Mesuré (200 tirages libres + 30 par variante) : 5gen6 2 → 3 niv. 3, 8 min, conversion niv. 1–2, 4–5 min (libre : moy. 7,2) ; 5gen7 niv. 2, 8 / 10 / 10 / 12 min selon les écrans « k côtés » ; 5gen8 niv. 2–3, 12 min ; 5gen12 secteur balayé et segment niv. 4, 11 min, lentille niv. 6, 23 min (9 écrans). Écritures corrigées à la source (écran = aides = papier = corrigé) : 5gen6 aide de niveau 2 « 75 × π/180 » (plus « 75° × π/180 »), fractions intérieures en `\frac` (plus deux `\dfrac` empilés, aussi 5gen8), conversion décimale « θ ≈ 2,15 » dans la réponse brève (plus « = »), consignes « valeur exacte, ou arrondie au centième » ; 5gen12 aides de niveau 1 en texte + KaTeX (plus « θ=acos(...) », « A=½r²θ » au clavier), « ≈ » dans les aides qui substituent une valeur arrondie (θ à 4 décimales), réponse attendue « θ ≈ 1,6961 ≈ 1,7 » (plus « 1,7 (1,6961) », deux nombres juxtaposés lus comme un produit). Collecteur `corrige-5e2-m1` (variables θ, r, s, A, θ₁, θ₂, A₁, A₂, ω, T, f_req, φ, Φ, b, x = 0,7 ; `\arccos` ajouté ; tolérance des « ≈ » additionnée sur une somme de valeurs arrondies) : 1 130 tirages, ≈ 24 000 égalités, 0 fausse.

- 6e ch. 2, moitié 1 (6gen6 limites, 6gen7 domaine et dérivée, 6gen8 graphique de la dérivée, 6gen9 équations ; notés, `criteresDifficulte` ; contrat papier complet — `enoncePapier`, `reponseBreve`, `bareme` —, `versionPapier` dans le registre) : brique `6e-6h/ui6e/corrigeExponentielles1.ts` (`COURS_*` § 1–4, `lim`, réexporte `finaliserCorrige`, nombres et termes de `corrigeLogarithmes1/2`) ; une lettre par ÉCRAN (`sequence…` = `phaseInitiale` → `phaseApres` du moteur) ; construireEnonce = une question par écran (titres « Étape n — … »), énoncé papier = l'expression + la consigne globale. 6gen6 : exposant / base (règle a > 1, 0 < a < 1, « on pose t = … »), terme dominant, « +∞ − ∞ » et « ∞·0 » levées par mise en évidence et croissances comparées, L'Hôpital écran par écran (forme 0/0 substituée, f′ et g′ par la règle de la chaîne avec u pour f et v pour g, « (cours, § 1) »), K : forme persistante vérifiée puis dérivées secondes, L : changement de variable puis pivot, N : loi des puissances ; G (retirée par un lot suivant) : corrigé minimal. Limites finies EXACTES partagées écran / corrigé / récapitulatif (`formatLimiteFinaleLatex` : « −\dfrac{2}{3}\ln(3) ≈ −0,7324 », 4 chiffres significatifs depuis la valeur non arrondie). 6gen7 : domaine résolu ligne à ligne (racine, dénominateur, arccos : « e^{x²−k} ≤ 1 = e⁰ »), chaîne u, u′, formule, substitution, forme finale (`deriveeFinaleLatex`), produit / quotient assemblés puis simplifiés (mise en évidence, simplification par k). 6gen8 : dérivée (quotient, 1/u) puis caractéristiques de f′ testées une par ligne, figure des candidats (bon mis en évidence) en `figureHtml`. 6gen9 : valeur réécrite en puissance de la même base, exposants égaux, premier / second degré (x₁ < x₂ quel que soit le signe de a), racine d'une puissance (contradiction écrite « n₁ ≠ 2n₂ », jamais une égalité fausse), t = bˣ (racine t ≤ 0 rejetée nommée), positivité ; AUCUN logarithme (décision de l'utilisateur) : t non puissance de la base → « x ≈ … » à la calculatrice. L'appli affiche le « Résultat » de l'étape comme réponse attendue (plus de flottant brut, plus de « vérifiée par équivalence numérique »). **Lectures** : 6gen7 domaine = ℝ (a) ; 6gen8 sélection après la dérivée (B, D : b). **Niveaux** : méthode 1 sauf 6gen6 A (0) et G (2), 6gen7 (0, E : 1), 6gen9 (0, C : 1) ; pièges dans les données : 6gen6 base < 1 ou x → 0⁻ sous une puissance impaire (A), « +∞ − ∞ » d'apparence −∞ (B), K, L, N, G ; 6gen7 racine cachée (C e), arccos (F) ; 6gen8 base < 1 (B), x = 0 exclu (D) ; 6gen9 racine t ≤ 0 (C) — « aucune solution » n'est pas un piège ; nombres : ln(a) ou e^{km} (6gen6 H–L), facteur ln(a), a ≠ e (6gen7), x non exact (6gen9 C). Mesuré (200 tirages libres + 30 par variante) : 6gen6 niv. 1–6, moy. 9,2 min (A 6, H–J 11, K 15) ; 6gen7 niv. 1–3, 5–9 min (moy. 6,9) ; 6gen8 niv. 2–3, 4–5 min ; 6gen9 niv. 1–5, 4–9 min (C 8,4–8,8). Écritures corrigées à la source (écran = aides = papier = corrigé) : 6gen6 base décimale « 0{,}5 » (plus « 0.5 »), « \sin(x−3) » au lieu de « \sin((x−3)) », « −x² » au lieu de « −1x² » (K), « −\frac{3}{x} » au lieu de « \frac{−3}{x} » (L, N), consignes de L sans « x/(−3) » ni « 1x », « (x)² » retiré (J), « \ln^{2}(a) » ; 6gen7 « x² − 9 » au lieu de « x² − 3² », aides du domaine (B) avec les données, facteur simple sans parenthèses ; 6gen8 base fractionnaire « \left(\dfrac{1}{4}\right)^{x} » et « \ln\left(\dfrac{1}{4}\right) » (l'exposant semblait porter sur le seul dénominateur), aide sans notation clavier ; 6gen9 « x ≈ 1{,}465 » (plus « x = 1.465 »), second membre en fraction au-delà de 3 décimales (plus « 0,001953125 », « 5,12e-7 »), consigne « t = 3ˣ » (plus « t = base^x »), consigne de l'écran 2 de A sans « CORRECT(E) ». `REECRITURES` : « Sélectionne le graphique qui représente la dérivée f'(x). ». Collecteur `corrige-6e2-m1` (outils de `corrige-6e3-m1`, limites infinies contrôlées en deux points de plus en plus lointains — signe et croissance —, « 0⁺ / 0⁻ » par le signe, f, g, u, v, w, N, D de l'instance, équations testées en leurs solutions) : 1 670 tirages, ≈ 15 300 égalités, 0 fausse.

- 5e ch. 2, moitié 2 (5gen9 lecture graphique, 5gen10 équations, 5gen11 extremums, 5gen13 modéliser ; notés, `criteresDifficulte`) : briques `5e-4h/ui5e/corrigeTrigonometrie2.ts` (`COURS_*` § 4–8, rationnels `Q`, expressions exactes a·π + b·α + c — α = arccos k donné par la calculatrice reste une LETTRE jusqu'à la dernière ligne « ≈ … » calculée depuis α non arrondi —, `lignesIsolerX` : on regroupe, on réduit, on multiplie par 1/a « chaque terme, la période aussi », on distribue ; `lignesSolutionsSerie` : une ligne par k « x = c + p·1 = valeur », plus un rejet de part et d'autre « < 0 », « ⩾ 2π »). Une lettre par ÉCRAN (5gen10 : `phaseInitiale`/`phaseApres` du moteur, la reconnaissance de la technique compte comme une étape ; 5gen13 : `ordreComplet`). 5gen10 : deux séries écrites ligne à ligne (même cosinus / angle opposé, même sinus / supplémentaire, une seule pour tan et pour ±1), produit (mise en évidence, deux équations, α et β si les deux facteurs demandent la calculatrice), substitution (remplacer, distribuer, réduire, Δ, t₁/t₂, produit des racines en vérification, racine rejetée « t₁ = 2 > 1 »), égalité (angle complémentaire réduit, série 2 « on distribue le signe − »), valeurs où une tangente n'est pas définie « cos(…) = 0 » en bloc « Valeurs écartées ». 5gen9 : max/min, deux maximums, x₀ lus une ligne chacun ; φ brut puis seconde chaîne « φ = brut + 2π » (jamais « φ = » deux valeurs). 5gen13 : B3 ω, φ par soustraction / addition membre à membre (α₁, α₂ en lettres), solutions `t = (1/ω)(α − φ + 2π·k) ≈ …`, intervalles `[t_g + kT ; t_d + kT] ≈ […]` coupés à la fenêtre. Écrans de lecture : 5gen9 a, b, c, f (b, |A|, T, Φ lus) ; 5gen13 « amplitude » de la grande roue (A = R). Écrans « solutions » / « intervalles » : étapes SANS charge (`lettresSansCharge`, comme les « termes proches » de 5gen15). Méthode : 5gen10 0 (directe) / 1 ; 5gen13 1 pour B2, B3 et l'inéquation (modèle donné : au plus 1). Pièges dans les données : 5gen9 b ≠ 0 ; 5gen10 ±1, produit non factorisé, tangente non définie, racine t rejetée ; 5gen11 A < 0 (maximums / minimums seuls) ; 5gen13 φ indéterminé (B1), minimum (3π/2), inéquation « ≤ ». Mesuré (200 tirages libres + 30 par variante) : 5gen9 niv. 3–4, 13 min ; 5gen10 1–6, 6–19 (moy. 12,9 ; produit 15,2) ; 5gen11 2–4, 8–9 ; 5gen13 1–6, 4–21 (moy. 13,0 ; B2 18,8). Écritures corrigées à la source (écran = papier = corrigé) : 5gen10 décimales au CENTIÈME (l'écran affichait « 1,3 + 6,3k », refusé par sa propre tolérance 0,01), « ≈ » devant une constante approchée (`relationBranche`), période 2π / π écrite en π, « 0 + » omis, ensemble des solutions en KaTeX (`formatEnsembleSolutionsLatex`, écran et récapitulatif), « t₁ = 0{,}5 : x = … » (virgule `{,}`, séries confondues écrites une fois), « −tan(x) » au lieu de « −1·tan(x) », texte « aucune solution » sans « |k| » (k est l'entier des séries) ; 5gen11 « \dfrac{1}{2}x » au lieu de « ½·x » ; 5gen13 séries « u ≈ … + 2kπ », « t ≈ … + 30k » (au lieu de « k·6,2832 »), modèle construit « f(t) ≈ … », « 28ω + φ ≈ … », « u = π/2 + kπ », consignes en fragments KaTeX (`consignePhaseFragments`, écran et titres papier, « − » typographique), données f₁, f₂ de B3 arrondies AVANT de calculer α₁, α₂, ω, φ (le modèle part des données imprimées). Collecteur `corrige-5e2-m2` (outils de `corrige-4e5-m1` + `\arccos`/`\arcsin`/`\arctan`, variables x, t, u, k, α, β, ω, φ, α₁, α₂, t_g, t_d prises dans chaque série ; une chaîne qui contient k doit être vraie pour au moins deux k ; solutions finales remises dans l'énoncé) : 1 100 tirages, ≈ 29 300 égalités, 0 fausse.
- 5e ch. 2, lot G (5gen54–57, nouveaux ; notés) : socle commun `ui5e/ecransTrigo.types.ts` (`DefinitionEcrans`), `moteur5e/sessionEcransTrigo.ts`, `components5e/EtapeEcransTrigo.tsx` + `AppEcransTrigo.tsx` (`?code=`, puces, corrigé de l'étape, `nombrePuces` : structure fixe quand un cas particulier a moins d'écrans), saisie `moteur5e/lectureValeurTrigo.ts` (π, √, fractions, arcsin, « 30° » = π/6, unités finales ignorées, « : » refusé), écritures `ui5e/nombresTrigo.ts` (`Q`, multiples de π). Corrigés dans `generateurs5e/<gen>/corrigeDetaille.ts`, une lettre par écran. **5gen54** (φ hors d'un extremum) : candidats exacts ou « π − arcsin m − 2π = −π − arcsin m ≈ … » (jamais « φ₂ = 7π/6 » puis « φ₂ = −5π/6 » : la forme brute est écrite sans « φ₂ = »), choix par le signe de cos φ, premier maximum k par k ; modèle « ≈ » quand φ est arrondi ; profil `calcul` = mode (sin φ ∈ {−1/2 ; 0 ; 1/2} ou touche sin⁻¹), sens au départ tiré 50/50 (verdict du choix fermé, jamais cas particulier). **5gen55** (inéquations) : exact partout, arc canonique du cours (sin ≥ : [α ; π − α], sin ≤ : [π − α ; 2π + α], cos ≥ : [−β ; β], cos ≤ : [β ; 2π − β]), figure du cercle en `figureHtml` (6,5 cm), intervalles k par k « [g ; d] ∩ [0 ; 2π[ = … » ; instance rejetée si 0 serait une solution isolée ; cas particulier « toujours » (|m| > 1) ; `forme` = fonction | sens inversé ou non. **5gen56** (Archimède) : trois vraies questions papier (n côtés, 2n, seuil), minorant arrondi par défaut et majorant par excès dans le corrigé (« ≤ » vrai même quand la borne est exacte), `calculatriceIndispensable`. **5gen57** (relevés réels) : trois vraies questions papier, tableau `tableauHtml` dans l'énoncé, argument de la prévision écrit à 5 décimales (sinon un « ≈ » tombe à la limite de la demi-unité). Pièges de niveau : 5gen54 1 (candidat à rejeter), 5gen55 1 si le coefficient est négatif ; méthode 1 / 0 / 0 / 2 ; lecture : 5gen57 a. Mesuré (300 tirages libres + 40 par variante) : 5gen54 niv. 4–5, 12–13 min ; 5gen55 1–3, 6–10 (moy. 9,5) ; 5gen56 3, 13 ; 5gen57 5, 14. Collecteur (outils de `corrige-5e2-m2` recopiés, variables φ, φ₁, φ₂, t, k, u, x, m, α) : 1 600 tirages, ≈ 36 600 égalités, 0 fausse. Barème : jamais « 0 pt sur c) » quand l'énoncé papier a de vraies questions (la lettre d'étape est réécrite en lettre de question) — nommer l'élément (« 0 pt sur le nombre de côtés »).

- 6e ch. 2, moitié 2 (6gen10 inéquations, 6gen11 étude de fonction, 6gen12 problèmes ; notés, `criteresDifficulte` ; lot D du contrat papier fait en même temps : `enoncePapier`, `reponseBreve`, `bareme`, `versionPapier` dans le registre) : brique `6e-6h/ui6e/corrigeExponentielles2.ts` (`COURS_*` § 1, 2, 4–7 ; réexporte les outils des briques logarithmes / intégrales ; `finaliserCorrige` = celui du 6e ch. 3 + fractions lisibles dans TOUTES les formules — une base `\frac{3}{10}` d'un « Ce qu'on utilise » sortait minuscule ; `lignesInequationAffine` sens changé en divisant par un négatif ; `demiDroite` ±∞ ouverts ; `lim` = `\lim\limits` (« x → a » sous « lim ») ; `tableauVariationLatex` (double barre d'une valeur interdite, limites des deux côtés)). Une lettre par ÉCRAN (6gen10 `phasesInequationExpo` = `phaseInitiale`/`phaseApres` ; 6gen11 séquence fixe a–f ; 6gen12 `PHASES_PAR_FAMILLE`). 6gen10 : second membre réécrit en puissance de la base une étape par ligne (décimal → fraction, `\dfrac{1}{5^2}`, `(a/b)^{-n}`), passage aux exposants avec « base > 1 : sens conservé / 0 < base < 1 : sens inversé » en justification, vérification par un entier de S (jamais 0) ; B : positivité « c·bˣ > 0 > −k », piège « logarithme d'un négatif » ; C-f / C-k : signe par zone (lignes conditionnelles « pour x < 0 »), Δ < 0 ; D variable : zéro puis équivalences « ⟺ » facteur par facteur, produit zone par zone, tableau de signes (`4e/…/tableauSignesLatex`) dans le résultat. 6gen11 : dérivées première et seconde ligne à ligne (B : règle du quotient sur f′, mise en évidence de −e^u), signes conditionnels, tableau de variation dans le résultat « croissance », graphiques candidats (le bon marqué) en `figureHtml` de l'étape f. 6gen12 : modèle, substitution, résolution (isoler la puissance, ln des deux membres), interprétation ; valeurs non arrondies jusqu'à la dernière ligne (`vautAbs` : « = » seulement si exact en ABSOLU — `vaut` compare en relatif et écrivait « = 9 954 834,2 »). **Lectures** : 6gen11 f (choisir le graphique), 6gen12 G c (comparer t_seuil et D). **Niveaux** (énoncé papier) : 6gen10 méthode 0 (A, B) / 1, piège = base ou rapport < 1, premier facteur négatif, facteur positif avant son zéro, C-k ; « toujours vraie / toujours fausse » (B, C-f) = cas particulier : pas de piège ; nombres 0. 6gen11 méthode 1 (B, C) / 0, piège = A coefficient de x négatif, B, C, D ; nombres 1 pour C (ln de la base). 6gen12 méthode 2 (A, B : l'élève construit le modèle) / 1 (forme donnée), piège = baisse (A), reste (B), r < 1 (C), C < 0 (D), G constant 0 (la décision est le verdict) ; nombres 1 sauf A « doublement ». Mesuré (200 tirages libres + 30 par variante) : 6gen10 niv. 1–4, 4–12 min (moy. 5,7 ; D variable 10,4) ; 6gen11 niv. 2–5, 13–15 min (moy. 13,8) ; 6gen12 niv. 3–6, 8–13 min (moy. 10,0 ; B 13 ; D 10,6). Énoncé papier : 6gen10 l'inéquation seule ; 6gen11 f + quatre graphiques + consigne globale (plus les six questions d'écran) ; 6gen12 contexte, données et vraies questions (B : modèle / complément(n) / seuil ; C : r et Q₀ / valeurs ; D : rapport / L / T(t) / prévision ; F, G : une par étape ; « k = … » retiré des données de A « doublement »). Écritures corrigées à la source (écran = aides = papier = corrigé) : 6gen10 aides sans notation clavier (« baseˣ », « base2^{2g(x)} », « ≤/< »), consignes de regroupement avec les vraies bases (plus de « [symbole] »), Δ avec (−b)², « 1·2ˣ », « 0−x », « −(x) », « 3·x² », zéro « x = −3 » ; 6gen11 asymptote oblique exacte (plus « y = −1.386…x »), positions à virgule, B « sur chaque intervalle du domaine » (plus « partout »), « Graphique C » (plus « n°3 »), consigne B avec la valeur de p, limites du récapitulatif en `\lim\limits` ; 6gen12 E « 0,5t » / « t » (plus « 0.5t », « 1t »), G « −t », « ≈ » et décision en `\text`, C « Q(5) ≈ … », unités en `\text`, aides sans notation clavier ; 6gen12 C : r, Q₀ et valeurs attendues recalculés depuis le v₂ IMPRIMÉ. **6gen12 D, données exactes** (décision de l'utilisateur, audit E1 : avant, la réponse de l'écran ne découlait pas des données imprimées dans 98 % des tirages, 10 % dégénérés) : ρ = r^d ∈ {1/2, 3/4, 4/5, 3/5, 2/5}, |C| multiple du carré du dénominateur, L ∈ {10, 15, 20, 25} ⇒ a, b, c ENTIERS, (b − c)/(a − b) = ρ et L exacts, jamais a − b = b − c ; « bas » : a = L − |C| ≥ 0 ; données nommées « a = … (t = 0) », consigne « il vaut r^d (d unités entre deux mesures) » ; tolérances : rapport 0,005, L 0,05, modèle 0,05 + l'écart d'un r arrondi au millième en chaque point testé. Test du moteur (3 000 tirages) : réponses recalculées sur les données imprimées = réponses de l'écran, acceptées par la vérification, L + 1 refusé ; 0 dégénéré. Niveau D : nombres 0 si d = 1.  Collecteur `corrige-6e2-m2` (outils de `corrige-6e3-m2` + `f''`, contrôles LOGIQUES `logique.ts` : lignes conditionnelles testées en 7 points de leur zone, équivalences « ⟺ » et inéquations successives d'un bloc à même valeur de vérité en 50 points, ensemble final relu contre l'énoncé, bornes testées exactement) : 570 tirages, ≈ 6 800 relations, ≈ 1 600 contrôles logiques, 0 fausse ; 6gen12 seul après les données exactes de D : 580 tirages, 9 200 relations, 0 fausse.

- 4e ch. 1 (gen7 analyse, gen8 transformations, gen9 forme canonique, gen55 optimisation ; notés) : brique `4e/ui/corrigeParabole.ts` (`COURS_*` § 1–3, trinôme, valeur f(x₀) ligne à ligne, x_S = −b/2a simplifiée, y_S, forme canonique a(x − x_S)² + y_S avec a DEVANT — p et q réservés aux translations ; réutilise `corrigeSecondDegre1`/`corrigeChapitre3`), figure `4e/ui/figureParabole.ts` (une seule échelle x / y, sommet et point croix sur les lignes, au moins 2 unités du côté de l'ouverture : figure du corrigé de gen8/gen9 ET graphique papier de gen8). Une lettre par écran ; gen7 sans Δ (raccourcis c = 0, b = 0 et a·c < 0, b² = 4ac, sinon sommet du côté de l'ouverture → « non factorisable », verdict de `groupe_methode`) ; gen8 un écran = une lettre (lecture + équation construite transformation par transformation, vérification par le point croix) ; gen55 : identification, relation, système (isoler, substituer, développer), domaine (avec la condition supplémentaire de l'énoncé), sommet, décision (bornes comparées quand le sommet est hors du domaine), conclusion ; espace fine des milliers dans tout le corrigé. Lectures : gen7 coefficients, allure, image, zéros ; gen9 b, d ; gen55 identification et conclusion. Méthode 2 en modélisation (gen55), 1 sinon ; piège = termes dans le désordre (gen7), x_S < 0 (gen9), p < 0 (gen8), 0 pour gen55 (le sommet hors du domaine est le verdict). Niveau et durée constants dans un verdict : gen7 « non factorisable » compté comme factorisation + zéros (14 min pour les 4 membres) ; gen55 identiques dans / hors du domaine (5 000 tirages par famille). Collecteur `corrige-4e1` : 1 130 tirages, ≈ 21 000 égalités, 0 fausse. Lots B–D de l'audit : modèle du 4e ch. 2 (`useTentativeLisible`, `AidesNiveaux`, textes `4e/ui/aidesParabole.ts`, `aidesOptimisation.ts`), « − – — » lus dans toutes les expressions ; choix fermés à 1 tentative : SOX (gen8, gen9), « sommet dans le domaine ? » (gen55) ; gen55 « forme parabolique » réécrite (t = 0, pieds au sol, hauteurs réalistes) ; « hors du domaine » ≈ 40 % par famille (`optimisation/contrainteSupplementaire.ts` : condition en mots « On ne retient que les cas où … vaut au moins k », présente dans 55 % des tirages ; tirages ajoutés APRÈS ceux de la famille : `?code=` inchangé quand le domaine ne change pas) ; gen7 `groupe_methode` (B ≠ A 30 / 30 plans réels), `forme` = ordre des termes.
- 5e ch. 1 (5gen1 domaine, 5gen2 décomposer, 5gen3 composer f et g, 5gen4 composée lue sur un graphique, 5gen5 fonctions en contexte ; notés, `criteresDifficulte`) : brique `5e-4h/ui5e/corrigeFonctions1.ts` (`COURS_*` § 1–5 ; `nb` = écriture de l'écran relue en fraction exacte d'abord — un 2/3 flottant n'est plus « 0.6667 » ; `lignesCondition` : condition résolue en chaîne « ⟺ » — on retire, on divise, sens changé par un négatif —, trinôme par Δ, racines x₁ < x₂ exactes ou « ≈ » au centième si Δ n'est pas un carré, racine double x₀, règle du signe de a en justification ; `ensembleDepuisPredicat`, `polyQLatex`, `ensFacteur` : réunion entre parenthèses avant « ∩ »). Une lettre par ÉCRAN : 5gen1 `phaseApresCE` (CE, résolution, domaine), 5gen3 `ordreComplet` (formule, conditions, c1, c2, domaine — `construireEnonce` réécrit : une question par écran, consignes de l'écran ; l'ancien découpage en 4 étapes ne suivait pas les écrans), 5gen4 une par question, 5gen5 `phasesContexte` (l'écran « tableau » de A1 devient l'étape a, rattachée à la première question papier). 5gen1 : une ligne par condition, facteurs d'un dénominateur factorisé un par un, intersection écrite `S₁ ∩ (ℝ \ {d})`, tableau de signes en `figureHtml`, vérification par une valeur exclue ou une borne. 5gen2 : une fonction par opération, puis la recomposition substitution par substitution (`h(g(x)) = h(A₁) = … = f(x)`). 5gen3 : x → g(x), parties affines calculées À PART (même dénominateur, développement), assemblage ; double condition ligne à ligne (dom de l'intérieure ; intérieure(x) dans le domaine de l'extérieure : quotient par tableau de signes, numérateur rendu entier — `lignesMoinsSeuil` —, racine élevée au carré, racine sur fraction zone par zone selon le signe du dénominateur, racine irrationnelle d'un trinôme nommée x₁ / x₂) ; intersection. 5gen4 : `(f∘g)(a) = f(g(a))`, une relation par chose lue, ou `dom f` lu et « b ∉ dom f ». 5gen5 : relevés → a, b, k ; Δ et solution négative rejetée ; système mis en forme (× x ou ÷ x), élimination, substitution ; chaînes de l'écran éclatées ; graphiques sortis dans `problemesContexte/graphes.ts` (sans `docx`, une ligne de quadrillage par unité de x), lecture annotée en figure ; valeurs retenues de l'appli passées au corrigé (`RetenusContexte`). **Lectures** : 5gen1 domaine de « pas de CE » ; 5gen4 toutes ; 5gen5 minimum lu (A1, A2), CV et CP lues, seuil. **Niveaux** : méthode 1 sauf 5gen1 simple (0), 5gen4 (0), 5gen5 A1 (2 : h, f, g construits) ; pièges dans les données : 5gen1 coefficient négatif / racine au dénominateur / exclusion dans l'intervalle / racine impaire / fraction sous racine (« pas de CE » et « toujours vraie » sont des cas particuliers), 5gen2 affine finale ou polynôme intérieur, 5gen3 intérieure rationnelle ou racine sur fraction, 5gen4 1, 5gen5 A2, B, C. Mesuré (200 tirages libres + 30 par variante) : 5gen1 niv. 1–4, 5–10 min (moy. 6,2 ; fraction sous racine 8,3) ; 5gen2 niv. 2–3, 4 min ; 5gen3 niv. 3–5, 8–38 min (moy. 18,4 ; racine sur fraction des deux côtés 26,6 : cinq écrans chargés) ; 5gen4 niv. 2, 6–7 min ; 5gen5 niv. 4–5, 10–14 min (moy. 11,8). Écritures corrigées à la source (écran = papier = corrigé) : 5gen1 facteur nul d'un dénominateur factorisé « x » / « x² » (plus « (x) », « (x)^2 ») ; 5gen3 écran « c2 » d'une fraction sous racine : la valeur qui annule le dénominateur n'est plus gardée (« ]−1 ; … », plus « [−1 ; … » — `solveur.ts`), réponse attendue sans « +- » ni « {x}^{2} » ni `-\left(15\sqrt{…}\right)`, quotient « (A/D)/(B/D) » simplifié par D (`simplificationExpression.ts::quotientMemeDenominateur` ; `rationalize` multipliait tout par D et développait : la réponse attendue sortait de l'écran à 390 px — le critère « simplifiée » de la vérification, structurel sur la saisie, est inchangé), consignes / aides sans « dom(f) » au clavier, `\operatorname{dom}` ; 5gen4 réponse attendue, réponse brève et barème en KaTeX (`resultatLatex`) ; 5gen5 « 1x^2 », « 1\sqrt{x} » retirés, « = » au lieu de « ≈ » devant une valeur exacte (évaluations de B, coût moyen), barème sans « g(x)/x ». Formules des textes (« Ce qu'on utilise », justifications, pièges : f(x), g(f(x)), Δ < 0, x³ = c, f + g…) en fragments KaTeX. Collecteur `corrige-5e1` (outils de `corrige-5e2-m1` + ensembles comparés borne à borne et crochet par crochet — intervalles, ℝ, `\setminus`, `∪`, `∩` —, chaînes « ⟺ » testées en ≈ 150 points, zones « Là où … » respectées, fonctions f, g, h… de l'instance) : 2 410 tirages, ≈ 17 000 égalités, ≈ 980 égalités d'ensembles, ≈ 13 700 équivalences, 0 fausse. Documents réels (2 graines, évaluation 2 séries + aménagée + feuille + Word du corrigé) : 0 débordement à 680, 820 et 1 280 px, 0 formule coupée, 0 `.katex-error` ; écran iPhone 13 : corrigé sous la réponse attendue, scrollWidth = 390. Piège d'outil : le serveur Vite de contrôle (`watch: null`) sert le code de son DÉMARRAGE — le relancer après chaque correction, sinon documents et captures montrent l'ancien code.

- 6e ch. 1 (6gen1 réciproque, 6gen2 valeurs cyclométriques, 6gen3 équations, 6gen4 dérivées, 6gen5 graphes ; notés ; contrat papier complet fait en même temps — `enoncePapier`, `reponseBreve`, `bareme`, `versionPapier`, `?code=` dans les 5 applis) : brique `6e-6h/ui6e/corrigeReciproques.ts` (`COURS_*` § 1–5, `NOM_ARC`, `IMAGE_ARC`, `DOMAINE_ARC`, `DERIVEE_ARC_U`, ensembles exacts ; réutilise `corrigeLogarithmes1/2` et les rationnels `Q` / `Poly` / `lignesTrinome` / `substituer` de `corrigeIntegrales1`). Une lettre par ÉCRAN (`PHASE_INITIALE`/`phaseApres` du moteur). 6gen1 : domaine (sens qui change), injectivité démontrée f(x₁) = f(x₂) ⟹ x₁ = x₂ (produit en croix pour l'homographique) ou contre-exemple symétrique p ± 1 + preuve sur la moitié, forme canonique, réciproque « on échange x et y, on isole y » ligne à ligne puis vérification f⁻¹(f(x₀)) = x₀, image encadrée ; la réciproque suit la moitié `cote` (papier : droite, l'autre acceptée ; appli : `coteChoisi`). 6gen2 : domaine testé, valeur remarquable (angle de référence, quadrant), angle principal justifié « trig(α) = y et α ∈ image », vérification par l'identité trig∘arc, piège arcsin(sin θ) ≠ θ. 6gen3 : tout en rationnels exacts depuis l'instance ; CE (encadrement, carré parfait), condition de compatibilité (variante 4), élimination (fonction appliquée aux deux membres, injectivité, identité puis carré), trinôme ramené à des coefficients entiers premiers entre eux, t = argument et T = t² (valeur négative de T écrite « T₁ < 0 », jamais une égalité fausse), tri par la CE puis par u, v et la condition. 6gen4 : u, u′, formule de la dérivée de l'arcfonction, substitution, simplification, une ligne chacune ; N′D et ND′ calculés à part (quotient) ; l'appli affiche le « Résultat » de l'étape comme réponse attendue (plus les aides de niveau 2 brutes) et partage ses consignes d'écran avec les titres papier (`consigneEcranDerivee`) ; plus `regroupable` (2 à 4 étapes). 6gen5 : domaine, bornes et asymptotes en valeurs EXACTES (multiples de π, π², racines de fractions) puis « ≈ » au centième, parité justifiée (bornes non opposées, f(−x) = ±f(x)), figure des candidats en `figureHtml`. **Lectures** : 6gen1 domaine ℝ (a), image ℝ (d), bijection (e) ; 6gen3 CE = ℝ ; 6gen4 B a. **Niveaux** : méthode 0 (6gen2 directe, 6gen3 1–2, 6gen4 A) / 1 ; piège : 6gen1 non injective ou inéquation de domaine à coefficient négatif, 6gen2 composée (constant : l'existence est la question) ou arccos d'un négatif, 6gen3 variante 4, même arcfonction (constant), coefficient négatif dans la CE, 6gen4 D, E, G, A arccos, 6gen5 k < 0 (A, B), D, E, F. Mesuré (300 tirages libres + 30 par variante) : 6gen1 niv. 2–4, 10–13 min (moy. 11,0) ; 6gen2 niv. 1–3, 4 min ; 6gen3 niv. 2–5, 9–16 min (moy. 10,9 ; variante 4 niv. 5, 14–16) ; 6gen4 niv. 1–4, 6–10 min (moy. 7,0) ; 6gen5 niv. 2–4, 5–7 min. Corrections à la source (écran = aides = papier = corrigé ; audit du chapitre, § 1) : 6gen3 4c CE fausse dans 100 % des tirages (u > 0 était dans la CE) → CE = domaine de arccos, u > 0 dans la condition de compatibilité, m > 0 toujours (sinon condition vide) ; 6gen5 E constante arrondie au centième À LA GÉNÉRATION, w₀ = −c/k recalculé ; 6gen5 A, B distracteur « échelle » jamais −k (deux graphes identiques, 5–6 % → 0 sur 2 000) ; 6gen2 valeur EXACTE exigée (`estFormeExacte`), aides « π/2 ou −π/2 » ; 6gen1 aides « monotone sur chacun des intervalles de son domaine » (domaine troué), consigne de l'écran image, réponse attendue « f⁻¹(x) = … » (plus un texte de méthode), « \sqrt{…} » pour l'indice 2, « −\dfrac{…}{5} » ; 6gen4 « [object Object] » du corrigé papier (B, C : 100 %) disparu avec l'ancien corrigé, aides sans « 1\cdot », « \sqrt{1x} », « −3^{2}x », « (x+(−2))^{2} » ; 6gen5 virgule décimale (« 0{,}25 », « 1{,}57 ») et « ≈ » ; 6gen3 consignes « sous la forme d'un intervalle pour x ». Collecteur `corrige-6e1` (outils de `corrige-6e2-m1`, variables x₁, x₂, y, t, T, u, v, fonctions f, u, N, D, w de l'instance ; réciproque contrôlée sur les deux moitiés) : 2 910 tirages, ≈ 29 600 égalités, 0 fausse. **0 formule coupée sur papier** (une ligne de calcul doit tenir dans la colonne du milieu, ≈ 230 px, même sécable) : 6gen3 variante 4 calculée avec les lettres u, v définies en tête (un produit de deux carrés de binômes en x sortait de la colonne ; le résultat remplace u et v), discriminant à gros coefficients en trois morceaux b², 4ac, Δ = b² − 4ac (`trinome`, au-delà de 20 caractères visibles ; brique partagée `lignesTrinome` intacte) ; 6gen4 D calculé avec R(x) = √(1 − u²), S(x) = N(x) + D(x) et D(x) nommés, expression complète seulement dans le Résultat encadré (produit de deux fractions) ; 6gen4 B produit éclaté u′g puis ug′ ; 6gen5 formules du résultat groupées `{…}`. Documents réels (2 graines × 4 plans partiels — la machine partagée tuait Chromium faute de mémoire sur le plan complet —, évaluation 2 séries + aménagée + feuille + Word du corrigé) : 0 débordement, 0 formule coupée à 680, 820 et 1 280 px, 0 `.katex-error`.
- 5e ch. 4 (5gen20 limites, 5gen21 asymptote oblique, 5gen22 lecture graphique, 5gen23 contexte, 5gen24 étude complète ; notés, `criteresDifficulte`) : brique `5e-4h/ui5e/corrigeLimites.ts` (`COURS_*` § 1–5, `lim` = `\lim\limits`, 0⁺ / 0⁻, polynômes entiers ; `monomesDe` relit un polynôme AFFICHÉ — l'ordre des termes de l'énoncé, tiré par instance — pour que la substitution suive l'écriture de l'élève ; `lignesValeur` : substitution, termes, somme, puissances calculées d'emblée puis termes directs quand le membre de droite dépasserait ≈ 26 caractères ; `miseEnEvidence` ; `divisionEuclidienne` tour par tour ; `lignesFactoriserTrinome` : mise en évidence, identité remarquable, sinon Δ ; `finaliser` : `\lim_` → `\lim\limits_` dans toutes les formules, y compris les réponses d'écran recopiées). Corrigés `generateurs5e/{limites,asymptoteOblique,lectureGraphiqueLimites,limitesContexte,etudeComplete}/corrigeDetaille.ts`, une lettre par ÉCRAN (`ordreComplet` du moteur), branchés dans les 5 applis (`corrigeDetaille` de `validation`). Figures sorties des adaptateurs sans `docx` : `lectureGraphiqueLimites/figures.ts`, `etudeComplete/figure.ts`. 5gen20 : f = N/D nommés (relus dans `formatBlocDonneesLatex`) ; reconnaissance par substitution de N(a) et D(a) ; 0/0 et k/0 : l'autre racine par le produit des racines `x₂ = c/(k·a)` (a = 0 : mise en évidence de x), simplification par (x − a) puis substitution, vérification f(a ± 0,001) ; k/0 : signe de chaque facteur de part et d'autre (`\lim_{x\to a^{-}}(x-a)=0^{-}`, D(x) → 0⁻, f → ±∞), conclusion = comparaison des deux limites ; ±∞ : limites de N et D, mise en évidence du terme de plus haut degré, simplification par la puissance commune, limite du quotient des parenthèses, limite finale par la limite de référence de xⁿ. 5gen21 : division posée tour par tour (terme du quotient, produit, `P(x) − Q·D(x)`), vérification Q·D + R = P, puis f = Q + R/D et f − (ax + b) → 0 ; via les limites : `a = lim f(x)/x` et `b = lim [f(x) − ax]` (même dénominateur, termes de plus haut degré), vérification f − (ax + b) = c/D → 0. 5gen22 : une relation par limite lue (« juste à gauche de x = −1, la branche monte le long de la droite x = −1 »), asymptotes une par ligne, pente d'une oblique entre (0 ; b) et (1 ; a + b), graphique annoté en `figureHtml` du résultat de l'étape b ; `construireEnonce` = les deux écrans (le papier garde une consigne). 5gen23 : `construireEnonce` = un écran par étape, consignes papier (`consigneEtapeLimitesContexte` : plus de « Choisis… ») ; interprétations (choix fermés) : relation lue + phrase correcte de l'écran en résultat ; club : valeurs exactes en fraction puis « ≈ » à l'unité, équation f(x) = k₀ multipliée par x + d, Δ, racine négative rejetée, premier entier ; population : division euclidienne, f(0) − b = a/p, valeur au centième et comparaison au seuil. 5gen24 : domaine (facteurs du dénominateur AFFICHÉ, identité remarquable ou Δ), N(r) en chaque valeur exclue, point vide (N divisé par (x − r) un terme du quotient à la fois — produit, reste Rₖ —, N₁ et D₁ nommés, simplification, limite par N₁(r)/D₁(r)), limites latérales sur la forme simplifiée N₁/D₁ factorisée, a et b sur la forme simplifiée (degrés plus bas), recoupement (N₁ = (ax + b)·D₁, reste du premier degré = 0, vérification f(s)), graphe sous le résultat de la dernière étape ; bonus : asymptote + 1/(x − r) mis au même dénominateur. **Lectures** : 5gen20 conclusion de k/0 ; 5gen21 conclusion (c) ; 5gen22 a et b (b compte s'il y a une oblique) ; 5gen23 prix de revient b, c, eau salée c, club d, population b ; 5gen24 asymptotes verticales et asymptote à l'infini. **Niveaux** : méthode 0 pour 5gen20 nombre réel, 5gen21 (technique imposée par la variante), 5gen22, 5gen23 prix de revient ; 2 pour le bonus de 5gen24 ; 1 sinon. Pièges dans les données : 5gen20 k/0 (constant dans les deux sous-cas : le nombre de limites est le verdict — niveau 4, 9 min pour les deux) et xⁿ impair en −∞ quand la limite est infinie ; 5gen22 point plein, branches de même signe, deux AH, aucune asymptote ; 5gen23 prix de revient (x = 0 hors du domaine réel, constant) et club (racine rejetée, entier suivant) — jamais le verdict croissance / régression (population constante sur ce point) ; 5gen24 point vide ou racine double. Nombres : 5gen23 lus sur le profil `calcul` (l'écran écrit « ≈ » même devant une valeur exacte). Mesuré (300 tirages libres + 30 par variante) : 5gen20 niv. 1–4, 4–10 min (moy. 7,4 ; nombre réel 4, 0/0 8, k/0 9, ±∞ 8–10) ; 5gen21 niv. 1, 7 min (deux étapes de calcul + une lecture, technique imposée) ; 5gen22 niv. 1–2, 4–5 min ; 5gen23 niv. 2–5, 6–14 min (moy. 8,6 ; club niv. 5, 12–14 ; population 2–3 selon que la valeur est exacte) ; 5gen24 niv. 3–5, 12–22 min (moy. 14,6 ; point vide + racine double + AO 20,4), bonus niv. 3, 6 min. Collecteur `corrige-5e4` (outils de `corrige-5e1` + `\lim\limits` évaluées de part et d'autre et en des points de plus en plus lointains, ±∞ et 0⁺ / 0⁻ par le signe et la croissance entre deux points, N, D, f, P, N₁, D₁, Cᵤ, C, V, Q de l'instance, équations vraies en une racine de l'instance, lectures de 5gen22 comparées à l'instance, domaine et AV de 5gen24) : 2 730 tirages, ≈ 37 100 relations dont ≈ 6 600 limites infinies / 0±, 0 fausse. **0 formule coupée sur papier** : division du point vide écrite « produit » puis « reste R₁(x), R₂(x)… » (membres de gauche courts — un membre de gauche long « N(x) − (…)(x + 2) » réduisait la colonne du milieu de tout le bloc), N₁ et D₁ nommés avant la simplification, substitution de plus de ≈ 26 caractères remplacée par les puissances calculées, puis par les termes. Documents (graines 4242 et 777, avec et sans regroupement a)/b)/c), évaluation 2 séries, feuille, aménagée, Word corrigé) : 0 `.katex-error`, 0 formule coupée à 680/820/1280, 0 débordement ; écran iPhone 13 (étapes ratées, valeurs fausses lisibles) : corrigé présent, scrollWidth 390, 0 erreur console.

- 4e ch. 6, moitié 2 (gen82–91 ; notés, `criteresDifficulte`) : briques `4e/ui/corrigeVecteurs2.ts` (`COURS_*` § 1–17, composantes « extrémité − origine », `lignesNorme` exacte, critère de colinéarité / produit scalaire substitués puis produits, translation, `finaliserVecteurs` : formules des justifications et des textes groupées `{…}` — elles se coupaient après « = » dans la colonne étroite) ; corrigés `4e/generateurs/<gen>/corrigeDetaille.ts`, une lettre par écran, branchés dans les 10 applis ; gen85 (démontrer : base écartée par un calcul, Chasles, k, propriété) et gen91 (détective : ligne refaite « ≠ copie », règle, blocs « Ligne k ») suivent leurs écrans ; un mot du chantier (gen88) s'écrit en équivalence « alignés ⟺ AC = k·AB », jamais comme une égalité affirmée ; gen87 garde t et x_A exacts jusqu'au « ≈ » final. Niveaux constants dans un verdict (gen82 « possible », gen84, gen88, gen89, gen91 : `sansCharge`, piège 0). Format des écrans : `texte`/`latex` de `corrigeTableau` (plus de `docx`). Collecteur `corrige-4e6-m2/coll` (`vecteurs.ts` : membres vectoriels évalués composante par composante — colonnes, `\vec{AB}` = B − A, normes, produits scalaires, `x_{AB}` ; « ≈ » à la demi-unité du dernier chiffre écrit).

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
  insécables, résultat dans un paragraphe encadré) ; écran `components/CorrigeDetailleEcran.tsx`
  (bloc de calcul plus large que l'écran : police du bloc réduite juste assez pour tenir, jamais
  sous 85 %, recalculée au changement de largeur — `useAjusterLargeur` ; au-delà, défilement
  horizontal. Mesuré iPhone 13 : gen96, gen98, gen99 0 bloc qui défile, contre 1 / 659, 11 / 708,
  5 / 809 avant).
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
  regroupable a), b), c) : dans un groupe, ses six étapes s'affichent comme pour un exercice seul (à plat,
  sous la lettre de la ligne ; le collecteur compte 6 écrans pour lui).
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
- **`formule`** — « Formule » : **banque écrite à la main**, chapitre par chapitre (décision de
  l'utilisateur, 22/11/2026 : les questions fabriquées depuis le formulaire — membre de droite masqué,
  condition seule, « Écris la formule : pour $x\in[-1;1]$. » — n'avaient souvent aucun sens).
  `src/lib/questionsFormules/` (`niveau4e.ts`, `niveau5e.ts`, `niveau6e.ts`, type `QuestionFormuleBrute`
  `{ id, enonce, corrige }`) : `chapitre → section → questions` ; `deriveQuestionsFormules(chapitre,
  sectionId)` la lit (même signature ; le chapitre porte `slug` ou `chapitreSlug`). 384 questions,
  23 chapitres (8 à 34 par chapitre). **Règles de rédaction** : énoncé autonome (de quoi on parle, ce
  qu'on attend, notations du cours — relire la section), réponse jamais lisible dans l'énoncé (corrigé :
  la formule et sa condition si elle compte), formules jumelles regroupées mais courtes (≈ 1 pt),
  rattachée à la section où la formule est enseignée, jamais une formule absente du chapitre, RichText
  du site (KaTeX strict : `^\circ`, pas de « ° » ni d'accent en mode math → `\text{…}`), 4e : degrés,
  « critère de colinéarité ». **Ids** : une question qui reprend une ancienne formule garde l'ANCIEN id
  (`normaliserCle(formule.text)`, 371 / 384) — un plan enregistré avec un `choix` explicite recharge la
  question correspondante ; sinon un id court. **Plan rechargé avec un id disparu**
  (`nettoyerChoixIntrouvables`, appelé par `chargerPlan`) : id retiré du choix (et de ses points) ; plus
  aucun id → la ligne repasse au tirage au hasard du même nombre ; avis sous les messages du panneau
  (les documents rechargés gardent l'ancien énoncé, enregistré dans le plan). `construireItemsPayload` :
  un choix dont aucun id n'existe tire au hasard au lieu de faire disparaître la ligne. Contrôle au
  build (`verifier-enonces-evaluation.mjs`) : chapitre et section existants, ids uniques, pas de « $ »
  orphelin ni « $$ ». Ajouter une question : l'écrire dans le fichier du niveau, puis relire la liste.
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
## 5e ch. 4, lot G — 5gen64–5gen67 (nouveaux, notés)

Socle d'écrans du 5e (`AppEcransTrigo` + `DefinitionEcrans`) réutilisé SANS modification (options
`copie`, `approchee`, `aReprendre`, `piegeChoixRevele`, `raccourcis`, `apercuLatex` déjà là). Modules
communs du lot : `moteur5e/lectureLimitesLotG.ts` (`lireLimite` : « +∞ », « inf », « ∞ », « +inf »,
« plus l'infini », « − – — », préfixes « lim = » / « x = » ignorés ; `lireFonctionX` : expression lue
puis comparée en six points — une racine non définie en 0,37 n'est plus refusée), `ui5e/ecrituresLimitesLotG.ts`
(`limL` = `\lim\limits_{x\to a^+}`, `cibleL`, `exacteL` (c√r/d simplifié, dénominateur rationnel),
`polyL`, `moinsDroiteL` : « f(x) − x » mais « f(x) − (−x) », jamais « f(x) − (x) »),
`ui5e/figureLimitesLotG.ts` (`grapheSvg`, `grilleGraphesSvg` : même échelle, carreaux d'une unité,
valeurs entières aux nœuds, axes fléchés, asymptotes en pointillés, branches rognées par un `<svg>`
imbriqué `overflow="hidden"` — AUCUN `id`). Corrigés `generateurs5e/{limitesConjuguee,fonctionAsymptotes,
tableauLimitesGraphique,detectiveLimites}/corrigeDetaille.ts`, une lettre par écran. **5gen64**
(expression conjuguée) : variantes diffPlus, deuxRacines (B1 x + a / B2 second degré), zeroEnZero,
zeroEnA, moinsInfini (E1 x² en évidence et √(x²) = −x, E2 conjuguée en −∞) ; écrans forme (choix
fermé) → conjuguée + produit réduit (produit encore écrit avec une racine ou non réduit : `aReprendre`,
sans tentative) → limites partielles → limite exacte (décimale proche : `approchee`). **Piège de mise
en page** : pour deux racines, « (√A − √B)(√A + √B) / (√A + √B) » et « lim (√(1 + a/x + …) + √(…)) »
débordaient la colonne du calcul (87 px à 680 px) — la multiplication par la conjuguée est annoncée
dans l'intro de la chaîne, et la ligne au membre de gauche long est mise entre accolades (pas de « = »
de niveau 0 → pleine largeur, `decouperLigneCalcul`). **5gen65** (fonction depuis ses asymptotes) :
(ax + b)/(x + d) ou ax + b + c/(x − p), données algébriques ou graphique (fenêtre [−7 ; 7]², point A
sur un nœud) ; AV, AH ou AO, inconnue par le point, f(x) (écritures équivalentes par `lireFonctionX`),
vérification d'une limite latérale. **5gen66** (tableau → graphique) : 4 graphiques complets, la bonne
lettre en A–D à 25 % chacune ; intrus = erreurs classiques (côté de l'AV, gauche/droite échangés, AH
à la mauvaise valeur, pente ou ordonnée de l'AO, infinis échangés, AV déplacée), trois types distincts
par exercice, message ciblé par intrus ; puis équations des asymptotes (deux AH échangées : le message
« échangées » est testé AVANT « valeur de x » — une ordonnée peut coïncider avec l'abscisse de l'AV ;
autre droite affine pour l'AO : renvoi à la dernière ligne du tableau). **5gen67** (détective) : huit
types d'erreur = variantes, `groupe_erreur` ; ligne fausse en position 1–4 à 25 % (`donnees.av`,
préliminaires justes du scénario) ; copie à marge rouge ; énoncé papier = copie + consigne globale.
Regroupement a), b), c) : 5gen64 `simple` (« Calcule la valeur exacte de chaque limite. ») et 5gen65
`fig` (deux formes : algébrique, graphique) reconnus 30 / 30 par variante ; **5gen66 et 5gen67
écartés** (tableau + quatre graphes, copie d'élève : une consigne commune n'allège rien). Niveaux
(`niveauEtDuree`, 2 000 tirages par variante, constants dans chaque verdict) : 5gen64 niv. 3 (4 pour
moinsInfini, piège √(x²) = −x), 10 min ; 5gen65 niv. 3–4 (piège p < 0, `sansCharge`), 12 min ; 5gen66
niv. 2, 6 min (lectures b, c) ; 5gen67 niv. 3, 8 min (`sansCharge`). Tout exact (`calcul: "exacte"`).
Mesures : moteurs 42 000 tirages (réponses recalculées numériquement sur f, écritures équivalentes,
« − – — », ∞/inf, illisible, approchée, copie ≠ bonne réponse) 0 anomalie ; collecteur (outils de
`corrige-5e1` recopiés ; `\limits` ignoré, lim en ±∞ réessayée à 10⁶, fonctions indicées f_{A}, ligne
pleine largeur relue sans ses accolades) 3 180 tirages, ≈ 45 200 égalités, 0 fausse ; parcours iPhone 13
de chaque appli (toutes les variantes : illisible → message sans tentative, erreur ciblée, bonne
réponse, mauvais choix fermé révélé) : scrollWidth 390, 0 erreur console ; documents réels `construirePlan` (3 plans : évaluation 2 séries +
aménagée + feuille + Word du corrigé, calculatrice interdite / autorisée, avec et sans regroupement) :
0 débordement à 680, 820 et 1 280 px, 0 `.katex-error` ; `groupe_erreur` B ≠ A sur 30 plans ;
`?code=` 36 / 36.

## 4e ch. 7, lot G — gen92–gen95 (nouveaux, notés)

Coquille `components/AppTransfertSecondDegre.tsx` réutilisée ; seule extension (ajout pur, sans effet sur
gen115–gen128) : champ `type: "personnalise"` (`ui/ecransTransfertSecondDegre.ts::ChampPersonnalise` —
`verifier(saisie)` fourni par le générateur, `apercu`, `aideSaisie` ; un `case` dans `diagnostiquerChamp`,
une entrée dans `AIDE_SAISIE`). Socle du lot : `moteur/equationXY.ts` (équation en x et y — droite ou
cercle, toute forme : cartésienne, explicite, non développée, développée, multipliée — jugée en huit points :
« gauche − droite » proportionnel à l'attendu ; préfixe « d : », « d ≡ » ignoré ; sans « = » → `forme`,
illisible → `parse_error`, aucune tentative ; `verifierEquationM` pour une équation en m ;
`verifierValeurExacte` : décimale proche d'une racine → `forme`, « valeur exacte »), `ui/geometrieLotG.ts`
(droites réduites, `pointLatex`, `colonne`, `cercleLatex` / `cercleDeveloppeLatex`, champs `champsPoint`,
`champDroite`, `champCercle`, `champExact`), `ui/corrigeLotG.ts` (briques « comme au tableau » :
`lignesDroiteNormale` a(x − x_P) + b(y − y_P) = 0 distribuée / réduite / simplifiée, `lignesMilieu`,
`lignesVecteur`, `lignesNorme`, `lignesCentreRayon`, `lignesPied` — perpendiculaire paramétrique, t, H,
raccourci droite verticale / horizontale —, `lignesDistance`, `lignesIntersection` — équation sans x ou sans
y lue directement, substitution sur un coefficient ±1, sinon combinaison —, `lignesSysteme` (étiquettes
`\text{(1)}` : « (2) x − 3 » était relu 2·(x − 3) par le collecteur), `lignesEquationCercle`,
`lignesPointSurDroite`, `lignesPointSurCercle`), `ui/figureLotG.ts` (repère carré, quadrillage d'une
unité, aucun `id`). Corrigés `4e/generateurs/{droiteCercle,cercleConditions,droitesRemarquables,droitesParametre}/corrigeDetaille.ts`,
une lettre par écran ; figure annotée en `figureHtml` du résultat final (papier) et en `figureApres` (écran,
une seule fois : l'appli retire `figureHtml` du corrigé d'écran). Jamais « déterminant » (critère de
colinéarité), aucun radian.
- **gen92** (§ 8, processus 2) : `tangente-point` (C lu, CP, CP vecteur normal — choix fermé à options
  mélangées —, tangente ; pièges CP directeur, droite par C), `position-relative` (centre et rayon par
  complétion des carrés, pied H, CH, verdict extérieure / tangente / sécante — tiré AVANT les nombres, à
  parts égales, C = H + k·n à rebours, r² à au plus CH²/2 de CH² ; comparaison des carrés), `cercle-tangent`
  (H, r = CH, équation ; pièges r au lieu de r², signes). Cas particulier `parallele-axe` (droite ou rayon
  parallèle à un axe, ≈ 17 %). Niveau 2 constant par variante (8 / 10 / 8 min).
- **gen93** (§ 8, processus 3) : `diametre` (milieu, r = AB/2, équation), `trois-points` (médiatrices de [AB]
  et [BC], centre, rayon, équation), `centre-sur-droite` (médiatrice, d ∩ médiatrice…). Centre Ω entier,
  r² somme de deux carrés, points entiers ; médiatrice parallèle à un axe bridée (≈ 25 %). Méthode 0 / 1 →
  niveaux 2 / 3, 8 / 12 / 10 min. Vérifications : ΩB = ΩA, points donnés dans l'équation.
- **gen94** (§ 6, processus 3) : médiatrices + O (O équidistant, OA² = OB² = OC²), hauteurs + H (H = A + B +
  C − 2O entier, triangle non rectangle ; vérification CH · AB = 0), médianes + G (sommes multiples de 3 ;
  vecteur 2·AM sans fraction ; contrôle par la moyenne), aire (BC, (BC), pied H, AH, aire = BC · AH / 2 —
  produit de racines entier par construction). Côtés fixés ([AB], [BC] ; issues de A et de B) pour que la
  consigne reste commune. Niveau 3 (méthode 1), 8 à 12 min.
- **gen95** (§ 4, processus 2) : dₘ ≡ a(m)x + b(m)y + c(m) = 0, questions parallèle (A·v − B·u), perpendiculaire
  (A·u + B·v), point, horizontale (a = 0), verticale (b = 0) ; écrans condition (choix fermé), équation en m,
  valeurs (liste, « aucune ») ; racine annulant a et b REJETÉE (piège ciblé, contrôle écrit dans le corrigé).
  Degré tiré (1 ou 2 ; « point » toujours 2) puis le NOMBRE de valeurs (verdict : 0/1 au degré 1 — 0 par
  une racine rejetée —, 0/1/2 au degré 2) à parts égales avant la recherche ; `forme` = type + degré.
  **Motif masqué (décision de l'utilisateur, 21/11/2026)** : au degré 1, « aucune valeur » exigeait a(m) et
  b(m) affins PROPORTIONNELS (« (m − 2)x + 2(m − 2)y »), forme qu'on ne voyait que pour ce verdict.
  Désormais : jamais de coefficients proportionnels ; au degré 1, horizontale/verticale = coefficient
  annulé affin + l'autre TOUJOURS du second degré (rejet ⇔ racine commune), parallèle/perpendiculaire =
  deux coefficients du second degré dont les termes en m² s'éliminent dans la condition
  (`famillePremierDegre`). À tout degré, la FORME visible (degrés de a, b, c) est tirée d'une instance
  libre AVANT le verdict, puis le verdict à parts égales dans cette forme : mesuré sur 15 000 tirages,
  forme et verdict indépendants (avant : « un coefficient constant » ⇒ presque jamais une seule valeur).
  Niveau CONSTANT (3 étapes `sansCharge`, méthode 0, piège 1 pour toutes les instances : 3, 8 min). Ligne
  « condition posée » longue mise entre accolades (pleine largeur : elle comprimait la colonne « = 0 »,
  2 px de débordement à 680 px avant).
Profils : `forme` = variante (gen92, gen93, gen94) ; aucun groupe à verdict (aucun nom de variante ne
donne la réponse) ; pas de `calcul` (tout exact). Regroupement a), b), c) activé pour les quatre
(`regroupementsPapier.ts`, « Dans chaque cas, … » ; ligne = les données) : 300 / 300 reconnus par variante,
une consigne par variante. Page de conception : libellés de gen45 et gen47 renseignés.
Mesures : moteurs (saisies justes autrement écrites, « − », illisible, sans « = », valeur approchée,
pièges, faux ; contrôles géométriques — H sur d, CH ⟂ d, points sur le cercle, point de concours sur les
droites, aire = ½|det| recalculée, valeurs de m recalculées par balayage) gen92 6 000 tirages / 142 849
saisies, gen93 6 000 / 149 729, gen94 4 000 / 91 311, gen95 5 000 / 49 117 : 0 anomalie ; `?code=`
100 / 100 par générateur ; collecteur (outils de `corrige-4e5-m2` recopiés, candidats = points des droites
et cercles de l'instance, t, m aux racines ; Δ < 0 : lignes en m non testables) 3 800 tirages, 57 531
relations, 0 fausse, 0 KaTeX invalide ; parcours iPhone 13 (chaque variante, illisible → sans tentative,
faux → « tentative 1/3 », trois échecs → réponse et corrigé révélés, choix fermé raté, « Nouvel exercice »
→ champs vides) : scrollWidth 390, 0 erreur console ; plans réels `construirePlan` (16 × 3 séries,
interdite / autorisée, cas particulier coché ou non) : même multiset (variante, forme, cas) 16 / 16,
énoncés tous différents, verdict B ≠ A gen95 16 / 16, gen92 9 / 16 (une seule question à verdict par
plan, issue tirée à chaque série) ; documents réels (évaluation 2 séries + aménagée + grille + feuille +
Word du corrigé, avec regroupement) : 0 débordement à 680, 820 et 1 280 px, 0 `.katex-error`.
## 4e ch. 7, lot G — gen96–gen99 (nouveaux, notés)

Coquille commune `4e/components/AppTransfertSecondDegre.tsx` réutilisée, avec deux AJOUTS : champ
`libre` (`ChampLibre` dans `ui/ecransTransfertSecondDegre.ts` : `diagnostiquer(saisie)` → correct /
faux / piège / parse_error, `aideSaisie`, `apercu`, `affichee` ; branché dans
`moteur/verificationTransfertSecondDegre.ts` et `components/EtapesTransfertSecondDegre.tsx`) et
`figureApres` non répétée quand le corrigé RÉVÉLÉ de l'étape porte déjà sa figure (ligne non « piège »).
Outils du lot `4e/ui/outilsAnalytiqueLotG.ts` : `lireDroite` (toute écriture d'une droite : cartésienne,
explicite, « x = k », fractions, « − – — » ; comparée par proportionnalité), `lirePoints`
(« (1 ; 2) ; (3 ; −1) », « aucun »), `champDroite` (pièges par droite, message « bonne direction mais
décalée » / « passe par le point mais mauvaise direction »), `champPoints`, écritures (`membreDroite`,
`parametriquesL`, `produitTerme`, `termeProduit`, `valeurSubst`), `figureRepere` (repère SVG sans `id`,
graduations 1/2/5, points sur les nœuds). Corrigés `4e/generateurs/<gen>/corrigeDetaille.ts`, une lettre
par écran, partagés appli / papier. Jamais « déterminant » (« critère de colinéarité »), jamais de radian.
- **gen96** « Projeté orthogonal, symétrique et réflexion » (§ 6, processus 3) : **symétrique**
  (écrans : perpendiculaire p — champ droite —, H, A′ ; énoncé papier une consigne, regroupable
  a), b)) ; **réflexion** (contexte billard dm / miroir cm / mur m tiré dans la variante ; écrans A′,
  (A′B), I, longueur exacte ; énoncé papier = contexte + figure (d, A, B) + DEUX vraies questions,
  `etapesParQuestion` [[a, b, c], [d]]). Corrigé : blocs titrés (Perpendiculaire, Pied H, Coordonnées
  de H, Symétrique ; Vecteur directeur, Terme constant c, Équation ; Équations paramétriques,
  Paramètre de I, Coordonnées de I), vérification milieu / appartenance, AI + IB recalculé morceau par
  morceau, figure du trajet sous le résultat d. Niveaux : symétrique 3, 10 min ; réflexion 4, 14 min.
  Cours : méthode « Projeté orthogonal et symétrique d'un point » + astuce « Réflexion : où viser ? ».
  **Carte placée après gen47** : gen94 (prévu avant elle) n'existait pas dans la branche du lot — à
  remettre après gen94 à la fusion.
- **gen97** « Trajectoires et rencontre » (§ 5, processus 3) : variantes = contextes (bateaux km/h,
  drones m/s, joueurs m/s) ; verdict collision / croisement / parallèles tiré DANS la variante (1/3
  chacun, jamais cas particulier ni `forme` — `forme` = contexte). Écrans : nature (choix fermé, une
  tentative), t₁ et t₂, K, verdict (choix fermé), instant ou écart |t₁ − t₂| ; parallèles : nature,
  verdict (`nombrePuces` = 5 : structure fixe). Critère substitué en membre de gauche (« 4·(−3) −
  (−3)·4 = −12 + 12 ») — « formule = substitution » sur une rangée dépassait le bloc de calcul à
  390 px. Niveau et durée CONSTANTS (3, 11 min : `etapesTransformation 4`, une lecture, `sansCharge`).
  Cours : encadré « Deux mobiles : deux instants » avant la carte.
- **gen98** « Intersection de deux cercles » (§ 10, processus 2) : **cercle-cercle** (droite par
  soustraction — champ droite —, solutions de l'équation après substitution — liste, « aucune » —,
  points communs — liste de points, « aucun ») ; **cercle-parabole** (choix du carré commun à
  remplacer, options mélangées ; solutions ; points, racine qui rend le carré négatif = piège ciblé).
  Nombre de points 0 / 1 / 2 tiré à 1/3 (verdict dans la variante). Corrigé : discriminant (B = 0 : carré
  isolé), blocs Substitution (isolement en introduction) / Développement / Résolution, vérification sur
  c₂ en valeurs (« 9 + 1 − 36 + 10 + 16 = 0 »), « x₁ = −2 » (jamais « 0 − 2 »). Niveaux : cercle-cercle
  3, 8 min ; cercle-parabole 4, 8 min (piège : racine à rejeter, dans les données) — constants quel que
  soit le nombre de points. Cours : astuce « Cercle et parabole : le cas du carré commun ».
- **gen99** « Détective d'erreurs : géométrie analytique » (révision, processus 3) : modèle gen112 /
  gen121 / gen127 (copie numérotée à marge rouge, « Quelle ligne ? » à une tentative, ligne fausse
  précédée de 0 à 3 lignes justes à 25 % chacune — préliminaires du scénario). **Choix : variante =
  exercice support** (droite par un point et un vecteur directeur, perpendiculaire, pente, cercle
  développé, parabole, distance point-droite), le TYPE d'erreur (deux par support : normal pris pour
  directeur / signe de c ; vecteur normal pris pour directeur / composantes échangées sans signe ;
  pente inversée / signe de p ; signe du centre / r² pris pour r ; p au lieu de p/2 / directrice du côté
  du foyer ; forme non ramenée / carré négatif) tiré à pile ou face DANS la variante, avant les nombres,
  avec les mêmes contraintes pour les deux types (aucun nombre ne trahit l'erreur). Pas de
  `groupe_erreur` : un type n'a de sens que dans son support, et le type (réponse de l'écran 2) n'est
  jamais choisi par le professeur ; `forme` = support. Écrans : ligne (choix), erreur (quatre
  descriptions : les deux types du support + deux leurres, mélangées), correction (champ droite ou
  nombres). La ligne fausse porte son calcul (« A est sur d : …, donc c = … ») : lisible même en tête
  de copie. Distance : racines EXACTES de rationnels (`racineExacteL`, √(p/q) = √(pq)/q simplifié) —
  `nombreLatex` écrivait « 4,992302 » et un gabarit « \sqrt{48.40000000000001} ». Niveau et durée
  constants : 3, 8 min (`sansCharge`).

Regroupement a), b) : gen96 symétrique (« Dans chaque cas, détermine les coordonnées du projeté… »)
et gen98 (deux consignes : cercles, cercle et parabole) dans `REGROUPEMENTS` ; écartés : gen96
réflexion (vraies questions), gen97 (contexte narratif propre à l'instance), gen99 (copie d'élève).
Pilotes `evaluationPayload.ts` : gen96 `distance`, gen97 `intersection`, gen98 `lieux`, gen99
`revision`. Tout exact (`calcul: "exacte"`), pas de case « cas particulier » (aucun raccourci).

Mesures : moteurs (5 000 tirages par variante pour l'équilibre ; 300 par variante pour les champs :
la réponse du Résultat du corrigé, convertie en saisie clavier, est acceptée ; « − » lu ; pièges
reconnus ; « 2x+ », « ((( », « = » illisibles sans tentative ; écrans sans flottant brut ; `?code=`
200 / 200 par générateur) 0 anomalie — verdicts gen97 33 / 33 / 33 %, gen98 33 / 33 / 33 %, gen99 type
50 / 50 et ligne fausse 25 % par position dans chaque support ; collecteur (outils `corrige-5e1`
recopiés, nouveau contrôle « nombre brut » : point décimal, décimal de 4 chiffres ou plus, notation
scientifique dans tout l'imprimé, `enteteHtml` compris) 2 100 tirages, ≈ 27 800 égalités, 0 fausse ;
iPhone 13 (39 parcours : illisible, réponse fausse, bonnes réponses, choix raté révélé, trois échecs
→ corrigé) 0 erreur console, scrollWidth 390 ; corrigé de chaque étape rendu à l'écran (outil
`defile.cjs`) : blocs de calcul qui défilent horizontalement gen96 1 / 659, gen97 0 / 479, gen98
11 / 708 (substitution seule ≈ 300 px), gen99 5 / 809 — tous ramenés à 0 par la réduction de police
de `CorrigeDetailleEcran` (décision de l'utilisateur : supprimer ce défilement) ; plans réels (`construirePlan`, 30 × 3 séries,
interdite / autorisée) même structure 30 / 30, verdicts différents d'une série à l'autre 30 / 30
(gen97 interdite 29 / 30), niveau et durée constants par variante ; documents (2 plans : évaluation
2 séries + aménagée + feuille + aménagée + Word copie / corrigé / grille, interdite ; autorisée en deux
colonnes) 0 `.katex-error`, 0 débordement à 680, 820 et 1 280 px. Outils du lot (dossier de travail
`4e7-B`) : `moteur.ts`, `coll/`, `ecranlotG.cjs`, `defile.cjs`, `planG.cjs`, `docsG.cjs`.

## 4e ch. 6, lot H — gen129–gen130 (nouveaux, notés)

Coquille `4e/components/AppTransfertSecondDegre.tsx` réutilisée, avec trois AJOUTS sans effet sur les
autres générateurs : écran `type: "cases"` (`EcranTSD`, choix MULTIPLE à cases carrées — jamais la
pastille ronde —, juste si l'ensemble coché est exactement `bonnes`, une tentative, « à cocher » sur une
bonne réponse oubliée ; composant `components/EtapeCasesTransfert.tsx`, `tentativesMax` = 1 pour tout
écran qui n'est pas « champs ») ; `ChampPersonnalise.vecteurColonne` (deux cases empilées entre grandes
parenthèses SVG, saisie transmise « x\ny », « Valider » actif quand les deux cases sont remplies),
`apercuLatex` et `affichee` (aperçu KaTeX et fiche propres au champ) ; message révélé d'un choix fermé
rendu en KaTeX quand il contient « $…$ ». Corrigés `4e/generateurs/{vecteursDirecteurs,chaslesSansFigure}/corrigeDetaille.ts`,
une lettre par écran. Jamais « déterminant » (« critère de colinéarité »), aucun radian.
- **gen129** « Vecteurs directeurs d'une droite » (§ 15, processus 1, Connaître) : variantes
  `deux-points`, `horizontale-verticale`, `parallele` (d passe par C, parallèle à (EF)). Écrans : a) un
  vecteur directeur lu sur le quadrillage (`moteur/vecteurColonneSaisi.ts` : tout vecteur non nul
  colinéaire accepté, fractions et décimaux lus ; pièges composantes échangées, perpendiculaire, une
  composante de signe changé, coordonnées d'un point recopiées, vecteur nul) ; b) cocher les vecteurs
  directeurs parmi cinq (2 ou 3 justes tirés à pile ou face AVANT le reste — c'est la réponse, jamais
  dans `forme` ; l'opposé toujours proposé ; leurres toujours composantes échangées + perpendiculaire,
  plus un signe changé ; aucun leurre colinéaire : pente jamais ±1) ; c) un vecteur directeur de g :
  y = mx + p (m entier |m| ≥ 2, ou fraction irréductible de dénominateur 2 à 5, p ≠ 0, p ≠ m ; (1 ; m) et
  tout multiple acceptés ; pièges (m ; 1), (1 ; p), (1 ; −m)), ou x = k / y = k (variante
  horizontale-verticale : g perpendiculaire à d). Figure : fenêtre [−6 ; 6]², carreaux de 20 px, points
  lus sur des nœuds à au moins 2 unités des axes (leur nom ne chevauche aucune graduation), nom du point
  du côté opposé aux axes, « d » posé à côté de la droite loin des points, des axes et de (EF) (l'étiquette
  automatique de `figureRepere`, près du bord, chevauchait un point ou une graduation) ; figure du corrigé
  (coordonnées lues, flèche et ses deux déplacements) en `figureHtml` du résultat a et en `figureApres`.
  Énoncé papier = figure + phrase + TROIS VRAIES questions (`etapesParQuestion` [[a], [b], [c]]) : jamais
  regroupé. Corrigé : a) points lus en intro, « arrivée moins départ » ligne à ligne, vérification par
  les carreaux ; b) une ligne de critère par vecteur proposé (`3\cdot 2-1\cdot 6=0`, « ≠ 0 ») ;
  c) m, (1 ; m), multiple sans fraction, vérification par deux points de g. Lecture : c. Méthode 0,
  piège 0 → niveau 1, 7 min, constants (aucune dépendance au nombre de justes). `forme` = variante |
  type de m (entier / fraction, 50 / 50) ; horizontale-verticale : variante seule.
- **gen130** « Chasles sans figure : réduire et démontrer une égalité vectorielle » (§ 6, processus 2) :
  saisie `moteur/expressionChasles.ts` (« AB − CB + 2CD », « 2(AB + BC) », « 2/3AB », « (2/3)AB »,
  « AB/2 », « 0 », « vec(AB) », « \vec{AB} », « → », minuscules, « − – — » ; un vecteur à une ou trois
  lettres = illisible ; un point hors de l'exercice = réponse fausse ciblée) ; égalité jugée sur les
  COEFFICIENTS DE POINTS (XY = Y − X), hypothèse substituée (I milieu : I = ½A + ½B ; M défini par
  a·MA + b·MB = 0). Statut `forme` (message, aucune tentative) pour une écriture juste mais : non réduite
  (« réduis jusqu'à un seul vecteur »), un seul terme avec « − » (« −CA = AC »), un « − » restant à l'écran
  « des + seulement », un vecteur qui ne passe pas par le point à insérer, AM écrit avec M. Variantes :
  `reduire` (3 ou 4 vecteurs, 1 ou 2 retournés — `forme` ; vecteur nul une fois sur trois, tiré AVANT ;
  lettres de la chaîne mélangées, jamais déjà dans l'ordre, premier terme positif ; écrans « + seulement »
  puis le vecteur), `coefficients` (k·XY + k·YZ, l'un éventuellement retourné, + c·XZ éventuellement
  retourné — `forme` = les deux retournements ; coefficient final r ∈ {−1, 0, 1, 2, 3} \ {k} à parts
  égales ; écrans « le groupe » puis le résultat), `demontrer` (échange PQ + RS = PS + RQ : première ligne
  juste = insérer S dans PQ ou Q dans RS, tirée ; différence PQ − RQ = PS − RS ; écran a = choix fermé
  parmi quatre lignes dont trois FAUSSES, contrôlées par l'algèbre des points, explication par option ;
  écran b = le vecteur obtenu), `inserer` (milieu : MA + MB = 2MI ; point : AM = b/(a+b)·AB, sept couples
  (a ; b) dont (1 ; 1)). Énoncé papier = données + UNE consigne (réduire / démontrer / exprimer) ;
  regroupement a), b) : « Réduis chaque expression à un seul vecteur (multiplié au besoin par un nombre)
  ou au vecteur nul. » (réduire ET simplifier, même groupe) et « Démontre chaque égalité vectorielle,
  quels que soient les points qui y figurent. » — 300 / 300 reconnus par variante ; insérer jamais regroupé
  (données propres). Corrigé : chaque ligne est une égalité vraie pour TOUS points (ou sous l'hypothèse),
  télescopage de proche en proche « Chasles en B », démontrer : un seul membre transformé + contrôle
  « mêmes origines, mêmes extrémités », insérer : vérification en plaçant M en A / en reportant AM.
  Méthode 1 pour démontrer et insérer, 0 sinon ; piège = vecteur retourné dans les données (réduire
  toujours, simplifier si `forme` ≠ 00) → niveau 2 (simplifier sans retournement : 1), 6 min, constants
  quel que soit le résultat. Aucun `calcul`, aucun cas particulier, aucun groupe à verdict.
Pilotes `evaluationPayload.ts` : gen129 `directeur` (processus 1), gen130 `chasles` (processus 2) ;
libellé de gen27 renseigné (« Réduction d'une somme de vecteurs sur une figure (gen27) »).

Mesures (outils du lot, dossier de travail `4e6-H` : `coll.mts`, `formes.mts`, `reg.mts`,
`parcours.cjs`, `equilibre.cjs`, `docsH.cjs`, `deborde3.cjs`, `figs.mts`, `page.cjs`) : collecteur
2 250 tirages (250 libres + 250 par variante) — textes écran / papier / corrigé / barème / aides /
messages, KaTeX `throwOnError`, ≈ 20 900 relations du corrigé évaluées (vecteurs en colonne et points
tirés au hasard, hypothèse appliquée ; seules les formules littérales « x_B − x_A » non évaluées) :
0 fausse, 0 KaTeX invalide, 0 NaN, 0 notation clavier ; réponse de chaque écran (convertie en saisie
clavier) acceptée, illisibles reconnus ; gen129 3 000 tirages : options bien classées, champs a et c
(multiples, opposé, fraction, pièges, vecteur nul). Fréquences (5 000 tirages par variante) : gen129
justes 2 / 3 ≈ 50 / 50 dans chaque variante, type de m 50 / 50 ; gen130 formes de réduire et simplifier
24–26 % chacune, vecteur nul 33 %, r −1 / 0 / 1 / 2 / 3 : 23 / 24 / 23 / 15 / 15 %. iPhone 13
(`parcours.cjs`, chaque variante, 2 graines : illisible sans tentative, réponse fausse = tentative 1/3,
bonne réponse, case ou choix raté révélé, « Nouvel exercice » → champs vides) : 0 erreur console,
scrollWidth 390. Plans réels `construirePlan` (10 × 3 séries par générateur, interdite / autorisée, deux
questions par variante) : même multiset (variante, forme, cas) 20 / 20, énoncés tous différents,
verdicts variés d'une série à l'autre. Documents réels (2 plans : groupés interdite, une question par
variante autorisée en deux colonnes ; évaluation 2 séries + aménagée + corrigé + grille + feuille +
aménagée + Word copie / corrigé / grille) : 0 `.katex-error`, 0 débordement à 680, 820 et 1 280 px.
Page du chapitre 390 / 1 280 px : 0 « $ » ni « ** » visible, 0 erreur.

## 4e ch. 7, lot H — gen131–gen132 (nouveaux, notés)

Coquille `4e/components/AppTransfertSecondDegre.tsx` réutilisée telle quelle (aucun ajout). Corrigés
`4e/generateurs/{traduireLieu,lireDroite}/corrigeDetaille.ts`, une lettre par écran, partagés appli / papier.
Jamais « déterminant » (« critère de colinéarité »), aucun radian.
- **gen131** « Traduire un lieu géométrique en équation » (§ 7, processus 2) : `mediatrice` (a) traduction
  MA = MB → MA² = MB², choix fermé parmi quatre équations — sans carré, coordonnées mélangées, signes —,
  b) équation de la droite (`champDroite` du lot G : toute forme), c) nature (médiatrice / (AB) / cercle de
  diamètre / perpendiculaire en A) ; `distance-droite` (nature, puis pour une droite de vecteur normal 3-4-5 :
  B = A ± (r/5)·n — `champPoints`, r = 10 ou 15 —, puis les DEUX équations dans un champ « éq ; éq »
  (`champDeuxDroites` : « ; », « et », « ou » ; une seule droite juste = piège « il en manque une »,
  terme constant décalé de r = piège) ; droite horizontale / verticale = cas particulier `parallele-axe`, deux
  écrans, |y − k| = r) ; `deux-paralleles` (nature, parallèle médiane ; d₂ écrite multipliée par k ∈ {2, −1, 3}
  une fois sur deux : piège « moyenne sans ramener ») ; `parabole` (nature, S et p signé, équation du cours ;
  la traduction directe MF² = dist² développée est acceptée) ; `cercle` (nature, équation). Énoncé papier =
  « On considère le lieu des points M(x ; y) <description>. » + « Reconnais ce lieu et détermine son
  équation (ou ses équations). » ; regroupement a), b) (`REGROUPEMENTS.gen131`, ligne = « Points … », une
  consigne pour toutes les variantes, 300 / 300 reconnus par variante). Profil : `forme` = variante
  (+ `memes` / `multipliee`, + axe et signe de p pour la parabole) ; cas particulier `parallele-axe`. Niveaux :
  cercle 1 (6 min), distance axe 1 (6), parallèles 1 / 2 (6), médiatrice 3 (8), distance oblique 3 (8), parabole
  3 / 4 (8, piège p < 0). Figure du lieu sous le dernier résultat (repère d'au plus ≈ 300 px).
- **gen132** « Lire une droite : associer droites et équations » (§ 1–3, processus 1) : a)–d) quatre droites
  (base, pente opposée, p opposé, composantes échangées ; variante `axe` : base, un leurre, y = p et x = p),
  quatre formes (implicite, explicite en y, explicite en x, paramétrique), jamais une forme impossible,
  choix fermé à une tentative avec explication (« L'équation B est celle de … ») ; e) m et p lus en escalier
  (pièges −m, Δx/Δy, p opposé, abscisse à l'origine) ; f) écriture impossible pour g verticale / horizontale
  (pile ou face, verdict hors `forme`). Énoncé papier = quatre équations, six figures, TROIS vraies questions
  (`etapesParQuestion` [[a–d], [e], [f]]) ; jamais regroupé. Lectures a–f, piège 1 → niveau 2, 8 min constants.

Mesures (outils du dossier de travail `gen-4e7-H` : `moteur.ts`, `coll/`, `parcours.cjs`, `equilibre.cjs`,
`docsH.cjs`, `deborde3.cjs`, `reg.ts`, `figs.cjs`, `page.cjs`) : moteurs 2 000 tirages par variante
(réponses recalculées géométriquement, 113 937 saisies — juste autrement écrite, « − », illisible, sans « = »,
pièges, faux) 0 anomalie ; `?code=` 100 / 100 ; collecteur 2 500 tirages, ≈ 28 500 égalités, 0 fausse,
0 KaTeX invalide ; iPhone 13 (chaque variante, 2 graines) scrollWidth 390, 0 erreur console ; plans réels
24 × 3 séries : même structure 24 / 24, énoncés tous différents ; documents (2 plans) 0 `.katex-error`,
0 débordement à 680 / 820 / 1 280 px sauf la ligne « codes a) … j) » d'une grille à 10 lignes d'un même groupe
(limite commune, voir rapport).

## 4e ch. 8, lot H — gen133–gen134 (nouveaux, notés)

Coquille NOUVELLE `4e/components/AppEspaceLotH.tsx` (aucune autre appli ne change) : figure du solide
TOUJOURS visible hors de l'énoncé repliable (`EnTeteExercice` replie son `blocDonnees` dès le premier écran
clos), `FigureCliquable` de gen102 réutilisée (cadre 400 × 320), quatre sortes d'écrans — `choix` (une
tentative, jugé ✗ / ✓ par `ui/choixFige.ts`, explication du choix faux en `messageRevele`), `cases` (choix
multiple, une tentative, case cochée à tort ✗, bonne case ✓ même oubliée), `lignes` (un verdict par ligne
parmi les mêmes étiquettes, une tentative pour l'ensemble, chaque ligne jugée ; toucher une ligne la met
en couleur sur la figure), `toucher` (point numéroté touché sur la figure ou son bouton, TROIS tentatives,
message ciblé et point essayé en rouge à chaque essai faux, numéros retirés une fois l'écran clos).
Figures `4e/ui/figureEspaceLotH.ts` (même cavalière, même visibilité des arêtes et mêmes couleurs que
gen101/gen102 ; `toutesAretesPleines` ; arêtes surlignées avec texte ; droites prolongées, parties cachées
en pointillé ; aucun identifiant SVG). Corrigés `4e/generateurs/{lectureSolide,intersectionParallele}/corrigeDetaille.ts`,
une lettre par écran, partagés appli / papier. Aucun calcul chiffré (sauf doubler une fuyante), jamais
« déterminant », aucun radian.
- **gen133** « Lire un solide en perspective : vocabulaire et positions » (§ 1–4, processus 1) : solides
  à dimensions entières DESSINÉS À L'ÉCHELLE (cube, pavé ABCDEFGH ; prisme droit COUCHÉ ABC-DEF, triangles
  avant / arrière ; tétraèdre « coin de cube » ABCD, face avant ABC, fuyante [AD]). `dessin` : a) une ligne
  par face, « vraie grandeur » / « parallélogramme » (tétraèdre : « triangle déformé ») ; b) arêtes cachées
  à cocher — l'énoncé (écran ET papier) trace TOUTES les arêtes en trait plein, les pointillés n'arrivent
  qu'une fois b) clos et dans le corrigé ; c) « dessiné à l'échelle 1 : [AD] mesure 1,5 cm sur ce dessin »,
  quatre options (double, lue directement, moitié, « on ne peut pas la connaître ») ; une fuyante 2 fois
  sur 3, sinon une arête horizontale / verticale de face (avant OU arrière) — tiré AVANT tout le reste,
  jamais dans `forme`. `appartenance` : 2 ou 3 milieux d'arêtes nommés I, J, K ; trois plans (une face, un
  plan diagonal — ou par un milieu si le solide n'en a pas —, un plan par un milieu), 1 à 3 autres points
  à cocher, chacun JUSTIFIÉ de proche en proche (milieu d'une arête du plan, point d'une droite du plan,
  parallèle à une arête ou côté d'un parallélogramme de points nommés ; un plan qui demanderait la droite
  des milieux est écarté). `positions` : quatre paires (cube, pavé, prisme ; jamais le tétraèdre), chaque
  position au moins une fois (position doublée tirée AVANT la boucle de rejet), toujours au moins une paire
  gauche qui se croise sur le dessin, parallèles le plus souvent dans deux faces différentes ; raison =
  plan commun / arête témoin / parallélogramme / « aucun plan ne contient les quatre points ». Énoncé papier
  = figure + VRAIES questions (`etapesParQuestion` [[a], [b], [c]] ; positions : consigne commune et une paire
  par question a–d, corrigé à une lettre par paire, l'appli les montre toutes sous son écran unique avec un
  seul « Ce qu'on utilise »). Jamais regroupé. `titrePapier` par variante (§ 1 « Perspective cavalière »,
  § 2 « Déterminer un plan », § 3 « Positions de deux droites »). Profil : `forme` = variante | solide ;
  aucun cas particulier, pas de `calcul`. Niveaux (lectures, méthode 0) : dessin 2 (5 min, piège face
  arrière / fuyante toujours présent), appartenance 1 (5 min), positions 2 (6 min, croisement toujours
  présent) — constants.
- **gen134** « Intersection de deux plans par parallélisme » (§ 5 et § 8, processus 2) : cube (arête 4)
  ou pavé (4 ou 6) ; faces étudiées F0 / F1 = dessous / dessus, avant / arrière ou gauche / droite (axe au
  tiers). `faces-paralleles` : P, Q à l'intérieur de deux arêtes de F0, |PQ| ≥ 2 et oblique, triangle PQR
  d'aire dessinée ≥ 3 unités², R sur une arête de F1 jamais au-dessus de P ou Q ; écrans : a) le point connu
  (R ; leurres P, Q « pas dans la face », un sommet de F1 « pas dans le plan »), b) la droite (parallèle à
  (PQ) par R — propriété 1 ; leurres (RQ) ou (RP) « traverse le solide », parallèle à une arête par R,
  parallèle à (PQ) par un sommet), c) S touché sur la figure. `point-direction` (théorème du toit, § 8,
  ajouté par le lot A) : traces des deux plans dans F0 entre sommets et MILIEUX d'arêtes (deux milieux au
  plus : « I est le milieu de [EH], J celui de [FG] »), K à l'intérieur de F0 à une unité au moins du
  bord, angle ≥ 25° ; plans nommés par trois des quatre sommets de leur section (sections en couleur) ;
  a) K (leurres : croisement du dessin de deux côtés gauches, un point d'un seul plan, deux côtés
  parallèles à l'axe), b) la direction (arête parallèle à l'axe ; leurres : la trace d'un seul plan, une
  arête d'une autre direction), c) K′ touché dans F1. Écran c : 4 ou 5 points (`candidatsEcran3`) — le bon,
  les croisements du DESSIN de la droite tracée avec des arêtes / côtés hors de la face (droites gauches,
  message « ne fait que croiser [XY] sur le dessin »), puis des points de la droite hors de la face ou
  encore dans le solide ; ≥ 26 px entre points, numérotés de gauche à droite ; un faux croisement à moins de
  14 px du bon point → instance rejetée. Énoncé papier = texte + figure (plan (PQR) et [PQ], ou les deux
  sections) + UNE consigne (« Construis le segment… » / « Détermine la droite d'intersection… ») ; étapes
  dans le corrigé (`consignesEtapesPapier`), figure de la construction finale en `figureHtml`. Jamais
  regroupé (solides et espace). `titrePapier` « Positions de deux plans » (§ 5) / « Intersection de deux
  plans » (§ 8). Profil : `forme` = variante | axe ; aucun cas particulier. Niveau : 2 étapes + 1 lecture
  (placer le point), méthode 1, `sansCharge` → 2, 7 min, constants.
Pilotes `evaluationPayload.ts` : gen133 `cavaliere` (processus 1), gen134 `deux-plans` (processus 2) ;
les libellés vides de gen39 / gen40 laissés aux lots qui les retouchent. Cartes : gen133 en § 1 (après
gen104) et § 2 (variante « Points d'un plan ») ; gen134 en § 5 et § 8 (après gen102, variante « point et
direction »).

Mesures (dossier de travail `gen-4e8-H` : `sim133.mts`, `sim134.mts`, `coll.mts`, `code.mts`,
`parcours.cjs`, `equilibre.cjs`, `docsH.cjs`, `deborde3.cjs`, `cap*.cjs`, `page.cjs`) : moteurs 300 + 2 000
tirages par variante, réponses recontrôlées géométriquement (S dans (PQR) et dans F1, (RS) ∥ (PQ), K et K′
dans les deux plans, direction ∥ (KK′)) : 0 anomalie, exactement un bon point à l'écran c ; fréquences
gen133 positions doublées ≈ 1/3 chacune, croisement présent 100 % ; collecteur 1 500 tirages : 9 545
formules KaTeX strictes, 3 822 relations du corrigé vérifiées (∈, ⊂, ∥, doublement), 0 fausse, 0 NaN /
notation clavier / « déterminant » ; `?code=` 700 / 700 identiques ; iPhone 13 (chaque variante, 3 graines :
juste, faux, toucher faux 1 ou 3 fois) scrollWidth 390, 0 erreur console, réponse + corrigé révélés,
choix vides après « Nouvel exercice » ; plans réels 24 × 3 séries : même structure 24 / 24, énoncés tous
différents ; documents (2 plans, interdite / autorisée en deux colonnes ; évaluation 2 séries + aménagée +
corrigé + grille + feuille + aménagée + Word copie / corrigé / grille) : 0 `.katex-error`, 0 débordement à
680 / 820 / 1 280 px ; page du chapitre 390 px : cartes présentes, 0 « $ » ni « ** ».

## Page de conception — proposition A (décision de l'utilisateur, 21/11/2026)

`EvaluationGeneratorPanel.tsx` (feuille d'exercices, évaluation, examen ; maquettes `Main`,
`AEvaluation`, `ATelephone` + ajouts `CApercu` et `BAssistant`). État et règles inchangés (mêmes
`lignes`, même `construirePlan`) ; seul le rendu change. Sous-modules `components/admin/conception/` :
- **En-tête compact** : niveau / heures / chapitres (sauf page verrouillée), puis Document
  (Évaluation / Examen), titre, date, N°, vol./sem., **Séries** (compteur −/+, plus de
  `type="number"`), calculatrice, école (connecté) ; avertissement calculatrice dessous.
- **Catalogue à gauche** : « Façons de composer » repliables, recherche (sans accents, titre de
  section, nom de générateur, variantes, code genN), filtre par processus (Tout / 1 / 2 / 3 : plus
  d'onglets), sections en **accordéon** fermées (pastilles 1/2/3 des processus présents,
  « n choisis · x pts »). Lignes vides masquées (« Masqué : « Formule » … (aucune question pour ce
  point) ») ; section sans aucune question : liste « Sans question pour l'instant » sous le chapitre.
  Générateur : variantes en **puces** (clic = 1 exercice / 0 ; repère « niv. · ≈ min » DANS la puce,
  calcul paresseux inchangé), puis une rangée par variante choisie et par copie « ~n » : compteur,
  points + cadenas (`ChampPoints`), paramètres à inclure, cas particulier, « + Même variante, autres
  réglages », « Retirer cette copie » ; notes calculatrice (« Aller au réglage ») ; sous-total.
  Questions du processus 1 : compteur, « Voir et choisir » (liste `Choisir`), points.
- **Panneau de droite** (collant ≥ 960 px ; bouton « Générer » collé en bas du panneau quand il
  défile) : chiffres (questions imprimées, ≈ min, plage de niveaux tirée du cache des estimations,
  points), feuille : barre de répartition par processus ; évaluation : jauge durée / 50 min (examen :
  durée saisie si lisible), barre des points par processus (%, ≈ min), « Ajuster au total » (caché
  en examen à total fixé : la note reste) ; examen : jauge par partie. **Liste dans l'ordre
  d'impression** (`conception/ordreImpression.ts`) : éléments factices (graine fixe par générateur)
  numérotés par `questionsDeSerie` (vrai/faux en une question, regroupements a), b), c)), rangés par
  processus ou par parties (`partiesExamen`) ; exercices non regroupés d'une même ligne réunis
  (« Ex. 3–4 ×2 ») ; × remet à zéro les variantes / la ligne concernées. Résumé des options + «
  Modifier » (mise en page, consignes de l'évaluation, réglages complets de l'examen) ; Générer,
  **Aperçu**, Enregistrer (coffre / navigateur, actif dès qu'un tirage existe).
- **Aperçu** (`conception/ApercuDocument.tsx`) : `construirePlan` + `genererDocumentsDepuisPlan`
  (cartouche du panneau), document dans une fenêtre (iframe 820 px réduite à la largeur), puces
  pour passer d'un document à l'autre ; rien dans l'historique ; « Autre tirage », « Garder ce
  tirage » (= documents générés, historique). Indisponible si la génération passe par un lien.
- **Façons de composer** (`conception/composer.ts`, pur) : remplacent la sélection (bouton
  « Annuler » rend la précédente) sans rien tirer. Feuille / évaluation / examen équilibré(e) :
  ≈ 6 exercices (1 Connaître — vrai/faux 3 affirmations, sinon formule —, 4 Appliquer, 1 Transférer,
  la part d'un processus absent va à Appliquer), une notion après l'autre, chapitres en alternance ;
  « Sur quelques notions » : notions cochées, 2 exercices + 1 Connaître chacune ; « Préparer
  l'évaluation » (feuille, évaluation) / « Préparer l'examen » (examen) : durée visée 50 min (examen :
  durée saisie, sinon 50 min par chapitre, 150 au plus) répartie selon les parts
  (`ContexteComposition.repartition`, fractions) avec les durées estimées — examen : répartition
  d'examen du professeur (absente → `REPARTITION_PROCESSUS`, 25 / 50 / 25) ; évaluation / feuille :
  compétences cochées à parts égales ou parts ajustées du document (section suivante). Un processus
  à 0 % n'est JAMAIS choisi ; la part d'un processus sans question possible est cédée — examen
  (`cession` absente ou `'examen'`, `composer.ts::cederParts`) : Connaître ou Transférer → Appliquer
  s'il a des questions et une part > 0 (règle d'avant, résultat identique pour 25 / 50 / 25), sinon aux
  processus présents ayant une part, au prorata ; Appliquer absent → aux présents de la même façon
  (avant : sa part était perdue) ; évaluation / feuille (`cession: 'cochees'`, `cederPartsCochees`) :
  aux seules autres cochées présentes, au prorata (parts égales → à parts égales), jamais à une non
  cochée ; aucune présente → rien n'est composé (« Rien à proposer pour Transférer avec ces
  réglages… ») ; `ResultatComposition.cedees` = cochées sans question, dites dans le message
  (« Transférer : aucun exercice dans ces chapitres — son temps va à Connaître et Appliquer. »).
  **Respect des parts** (correction du 22/11/2026, examen ET évaluation / feuille) : un ajout n'est
  admis que s'il ne dépasse le budget du processus ni de plus de la moitié de sa durée NI de plus de
  `DEPASSEMENT_MAX` = 4 min, la PREMIÈRE question comprise ; si la question tirée pour une notion ne
  tient pas, une autre de la même notion qui tient est prise (aucun tirage de plus) ; si aucune ne
  tient, la plus courte du processus (un processus voulu est toujours présent). Avant, la première
  question était toujours admise et le dépassement allait jusqu'à la moitié de sa durée : gen35
  « classes » (28 min) remplissait un Appliquer de 15 min, 5gen31 (25 min) passait un budget de 40 min
  à 52. Équilibrée et « Sur quelques notions » inchangées. Variantes du
  panneau seulement (groupes « à verdict » = une rangée), calculatrice interdite : variantes et
  générateurs `calculatriceIndispensable` exclus, aucun cas particulier coché, jamais de
  démonstration. Mesuré (23 chapitres × modes × calculatrice, 207 compositions) : 0 défaut, 6
  exercices imprimés pour chaque « équilibrée », durée « Préparer l'évaluation » de 43 à 67 min (médiane 51,
mesurée avec l'ancienne répartition ; 25 / 50 / 25 : de 42 à 59 min, médiane 49).
- **Évaluation et feuille d'exercices : compétences cochées, parts égales** (décision de l'utilisateur,
  22/11/2026 : « hyper flexible » pour ses évaluations — une, deux ou trois compétences, sans
  répartition à respecter). Carte « Préparer l'évaluation » : « Tu choisis les compétences ; le temps
  est partagé entre elles (≈ 50 min). » (aucun pourcentage) ; bouton frère « ⚙ Compétences »
  (`aria-expanded`, nom « Choisir les compétences (Connaître, Appliquer et Transférer, parts égales) »,
  note « Appliquer · Transférer » / « parts ajustées » quand ce n'est plus le défaut). Il ouvre
  `conception/ReglageCompetences.tsx` (`#conc-comp`, mêmes classes `conc-rep-*`) : une rangée par
  compétence avec sa CASE À COCHER (cible 44 px), pastille, nom, « ≈ m min » / « non cochée » /
  « aucun exercice ici », boutons − / + ; trois cochées par défaut ; au moins une (décocher la dernière
  → « Garde au moins une compétence. ») ; parts égales EXACTES pour la composition
  (`partageEgal(cochées)`), affichées en entiers `pourcentsEgaux` (33 / 34 / 33, point restant à
  Appliquer) ; − / + (`ajusterParts`) : seules les autres COCHÉES compensent (même ordre que
  l'examen), une cochée garde au moins 5 %, une non cochée reste à 0 % (boutons désactivés) ; cocher /
  décocher remet les parts égales ; boutons « Préparer avec ces compétences » (« Préparer avec
  Transférer » s'il n'y en a qu'une), « Parts égales », « Fermer » (et Échap, focus rendu) ; une cochée
  sans question composable (`composer.ts::processusComposables`) est signalée (« son temps va à … »).
  Réglage du DOCUMENT : état du panneau (`reglageCompetences`), perdu au rechargement, JAMAIS mémorisé,
  aucun « Enregistrer » ; passer d'Évaluation à Examen ferme le réglage ouvert.
- **Examen : répartition d'examen réglable et mémorisée** (décision de l'utilisateur, 22/11/2026 ;
  mémorisation : `.claude/rules/comptes.md`, « Répartition mémorisée », `0005_repartition.sql` — SEUL
  endroit où elle apparaît). Carte « Préparer l'examen » : « Ta répartition d'examen : 25 % / 50 % /
  25 % de 50 min. » et, dans le même cadre, un bouton frère « ⚙ Modifier » (`aria-expanded`, nom
  « Modifier ta répartition d'examen (25 % / 50 % / 25 %) », note « ta répartition d'examen » /
  « réglée pour cette session »). Il ouvre sous les cartes le panneau
  `conception/ReglageRepartition.tsx` (titre « Ta répartition d'examen ») : barre empilée aux couleurs
  des processus, une rangée par compétence (pastille, nom, « ≈ m min » de la durée visée, boutons − / +
  de 5 en 5, cibles 44 px — aucune saisie, donc ni champ numérique ni valeur bloquée pendant la
  frappe). **Total toujours 100** (`repartitionProcessus.ts::ajusterRepartition`) : Appliquer compense
  quand on règle Connaître ou Transférer (Transférer si Appliquer est à 0) ; régler Appliquer reprend à
  la plus grande des deux autres (Transférer à égalité) ou donne à la plus petite (Connaître à
  égalité) ; bouton désactivé à une borne. Toutes les répartitions par pas de 5 (231) sont
  atteignables. Boutons : « Préparer l'examen avec 30 / 45 / 25 % » (compose aussitôt), « Revenir à
  25 / 50 / 25 », « Enregistrer comme ma répartition d'examen » (professeur connecté ; désactivé quand
  rien n'a changé), « Fermer » (et Échap : focus rendu à « Modifier ») ; état sous les boutons
  (`role=status`) : enregistrée (« sera proposée à chaque examen »), pas encore enregistrée (avec la
  valeur mémorisée), « Mémorisation pas encore activée : colle le fichier 0005_repartition.sql… »,
  sans compte (session seulement).
  Vérifié (`repartition/composer.cjs`, module réel, avant la décision « examen seulement ») : contrôle
  d'origine (207 compositions, 0 défaut), non-régression 1 863 / 1 863 compositions identiques au code
  d'avant à graine égale, 1 242 compositions sous 9 autres répartitions (0/100/0, 100/0/0, 0/0/100,
  50/50/0, 0/50/50, 40/40/20, 10/80/10, 35/30/35, 30/45/25) : 0 question d'un processus à 0 %, rien
  de vide, temps par processus à quelques minutes de sa part (écart médian 0 à 4 min) ; 1 346
  contrôles purs. Playwright : `.claude/rules/comptes.md`.
- **Vérifié — 22/11, compétences / examen** (outils `tests.mjs`, `ui.mjs` du dossier de travail
  `repartition-examen`, module réel via Vite) : 1 161 contrôles purs (`partageEgal` exact pour les
  7 combinaisons, toutes les suites de clics `ajusterParts` — 19 états à deux cochées, 136 à trois :
  total 100, non cochées à 0, cochées ≥ 5 —, cessions) ; 2 277 compositions « Préparer l'évaluation »
  (23 chapitres × feuille / évaluation × calculatrice × 7 combinaisons × 3 graines, parts égales et
  828 ajustées) : 0 question d'une compétence non cochée, 0 composition vide, `cedees` toujours juste,
  parts effectives exactement égales, temps par compétence de −5 à +13 min de la part égale (médiane
  1–2 ; après la correction « respect des parts » : de −6 à +4 min) ; examen : écart cible / obtenu
  par processus (`examen-ecarts.mjs`, 23 chapitres × calculatrice × 10 répartitions — 25/50/25,
  20/60/20, 30/45/25, 10/80/10, 35/30/35, 40/40/20, 0/50/50, 50/50/0, 0/100/0, 100/0/0 — × 3 graines,
  1 380 compositions, 3 144 mesures ; cible = part APRÈS cession) : code d'avant moy. |écart| 2,0 min,
  de −6 à +13,3 min, 95,2 % à 5 min près ; après correction moy. 1,8 min, de −5,5 à +7 min, 99,5 % à
  5 min près, 100 % à 8 min ; les +7 restants = un Transférer de 5 min dont l'exercice le plus court
  dure 12 min (incompressible). 0 processus à 0 % choisi, cession toujours d'abord à Appliquer ;
  compositions identiques au code d'avant quand le choix d'avant tient (848 / 1 380 ; équilibrée et
  notions : toutes) ; cession d'une
  compétence retirée des lignes : 88 / 88 (temps aux autres cochées seulement) ; assistant élève
  (5 chapitres × 2 types) : 420 compositions + 100 plans, 0 compétence non cochée, temps à ±9 min de
  la part égale (médiane 0), blanche 20 / 10-10 / 7-6,5-6,5 pts, une compétence = composition d'avant
  (90 / 90). Playwright (faux client, 1 280 px et iPhone 13) : 174 vérifications (carte sans
  pourcentage, cases, 33 / 34 / 33, décocher, ajuster, dernière gardée, compositions sans compétence
  non cochée, profil inchangé, rechargement → défaut ; examen : répartition du profil, réglage,
  enregistrer, relire ; assistant : aide, phrase des niveaux, récapitulatif « temps partagé à parts
  égales ») ; 0 erreur console, `scrollWidth` = largeur, aucun champ numérique.
- **Téléphone (< 960 px)** : une colonne ; barre fixée en bas « Ma feuille · n exercices ▴ ·
  ≈ m min · niveaux » + « Générer » ; le panneau s'ouvre en feuille du bas (voile, « Fermer ») ;
  cibles ≥ 44 px, champs à 16 px.
- **Vérifié** : non-régression (3 plans — feuille 4e ch. 6, évaluation 5e ch. 4 à 2 séries, examen
  4e ch. 2 + ch. 4 à total fixé — importés dans l'ancien et le nouveau panneau, « Générer » avec
  `Math.random` à graine fixe) : export après import = plan importé ; plans et 13 documents
  identiques ; sélection refaite à la main (puces, compteurs, options) = mêmes lignes, en-tête,
  séries et graines ; professeur connecté (faux client) : école, coffre, rechargement ; 1 280 px et
  iPhone 13 (clair / sombre) : scrollWidth = largeur, 0 erreur console du panneau. Outils :
  dossier de travail `conception-prof/` (`nonreg.cjs`, `uifeuille.cjs`, `facons.cjs`,
  `captures.cjs`, `connecte.cjs`).

