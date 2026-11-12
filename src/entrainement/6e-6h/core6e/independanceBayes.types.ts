/**
 * Couche core (6e) — contrat pour `6gen32` ("Indépendance, conditionnement et Bayes", chapitre 8
 * "Probabilités" — 3e générateur du chapitre, après `6gen30` qui l'a fondé). 3 familles (A, B, C),
 * tirage ÉQUIPROBABLE de la famille puis d'un sous-type/contexte au sein de la famille (voir
 * `generateurs6e/independanceBayes/index.ts`).
 *
 * ============================================================================
 * **Pourquoi les probabilités sont stockées comme `number` (décimal), PAS comme un couple
 * entier/dénominateur (contrairement à `6gen30`)**
 * ============================================================================
 * `6gen30` stocke des EFFECTIFS entiers (`nA`, `nB`...) parce que ses données de départ SONT des
 * effectifs sur une population commune — la probabilité n'y est qu'un rapport dérivé. Ici, la donnée
 * de départ EST directement une probabilité décimale — la spec elle-même les énumère en notation
 * décimale (`p∈{0,1;0,15;0,2;0,25}`, famille C) : il n'existe pas de "dénominateur commun" naturel
 * dont ces probabilités seraient des effectifs (un défaut de fabrication, un taux de faux positifs,
 * un taux de réussite ne sont pas des comptages d'une population tirée). Stocker `number` reflète
 * donc fidèlement la donnée de l'énoncé, affichée avec la MÊME notation décimale que la spec
 * (`ui6e/formatIndependanceBayes.ts`, `formatDecimalVirgule`) — jamais une fausse précision
 * fractionnaire inventée pour l'occasion. La vérification (`moteur6e/verificationIndependanceBayes.ts`)
 * passe par `diagnostiquerProbabilite` (`moteur6e/verificationProbabilites.ts`, audit 6e ch. 6,
 * décision A) : valeur exacte, ou décimal CORRECTEMENT arrondi (2 décimales, 3 sous 0,1), ou
 * pourcentage — plus de tolérance absolue de 0,01.
 * Exception : famille B (tableaux) — leurs cellules SONT des effectifs entiers sur une population
 * commune (comme `6gen30`), donc stockées/vérifiées comme telles.
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — lire avant de modifier ce fichier**
 * ============================================================================
 * Réutilise EXPLICITEMENT (spec) le statut de réponse fraction/décimal et la vérification
 * d'indépendance établis par `6gen30` — voir l'en-tête de `moteur6e/verificationProbabilites.ts`
 * (module PARTAGÉ, chapitre 8) pour le détail exact de ce qui est importé. CE fichier-ci (types
 * Couche A) N'EST PAS partagé au-delà de `6gen32` — `ExerciceFamilleA`/`ExerciceFamilleB`/
 * `ExerciceFamilleC` sont des contrats propres à CE générateur, jamais réutilisés tels quels par un
 * autre `6genX`.
 */

// ============================================================================
// Famille A — Indépendance : produit, complément, comparaison.
// ============================================================================

export type SousTypeFamilleA = "pannes" | "unionIndependance";

/** Sous-type 1 — deux éléments indépendants, chacun avec une probabilité de "panne" (au sens large :
 * défaut, grillage, alerte...) donnée. `labelPanne`/`labelPanneNegatif` sont le VERBE/ÉTAT conjugué
 * au singulier, déjà accordés à la forme positive ET négative (ex. "tombe en panne"/"ne tombe pas en
 * panne") — jamais reconstruits par négation automatique côté `ui6e/formatIndependanceBayes.ts`
 * (le français ne se négative pas mécaniquement pour un verbe/groupe verbal arbitraire). */
export interface ContextePannes {
  id: string;
  texte: string;
  labelElement1: string;
  labelElement2: string;
  labelPanne: string;
  labelPanneNegatif: string;
}

/** Combinaison demandée à l'écran 2 du sous-type "pannes" — `"exactementUn"` est LA variante à
 * double application de l'indépendance (spec) : p1·(1−p2) + (1−p1)·p2, deux produits distincts,
 * jamais un seul. */
export type DemandeEcran2Pannes = "lesDeux" | "aucun" | "auMoinsUn" | "exactementUn";

export interface ExerciceFamilleAPannes {
  famille: "A";
  sousType: "pannes";
  contexte: ContextePannes;
  /** P(l'élément 1 tombe en panne), 0 < p1 < 1. */
  p1: number;
  /** P(l'élément 2 tombe en panne), 0 < p2 < 1, toujours ≠ p1. */
  p2: number;
  demandeEcran2: DemandeEcran2Pannes;
}

/** Sous-type 2 — P(A) et P(A∪B) donnés, A et B indépendants (affirmé explicitement dans
 * `texte`, jamais à déduire). */
export interface ContexteUnion {
  id: string;
  texte: string;
}

export interface ExerciceFamilleAUnion {
  famille: "A";
  sousType: "unionIndependance";
  contexte: ContexteUnion;
  /** P(A), donné. */
  pA: number;
  /** P(A∪B), donné — toujours > pA (implique pB > 0 par construction). */
  pAouB: number;
}

export type ExerciceFamilleA = ExerciceFamilleAPannes | ExerciceFamilleAUnion;

// ============================================================================
// Famille B — Lire un tableau à double entrée de données réelles.
// ============================================================================

/** Audit 6e ch. 6 : l'ancien sous-type « histogramme avec interpolation » (hors cours) a été
 * REMPLACÉ par « testIndependance » (tester l'indépendance depuis un tableau à double entrée). */
export type SousTypeFamilleB = "testIndependance" | "tableauDonne" | "tableauReconstruire";

/** Comment l'élève teste l'indépendance : P(A∩B) comparé à P(A)·P(B), ou P(A|B) comparé à P(A). */
export type MethodeTestIndependance = "produit" | "conditionnelle";

/** Ce que montrent les effectifs — dérivé des cellules (`verdictTestIndependance`), jamais saisi :
 * incompatibles ⟺ n(A∩B) = 0 ; indépendants ⟺ n(A∩B)·n = n(A)·n(B) (égalité EXACTE). Les deux à la
 * fois exigerait P(A) = 0 ou P(B) = 0, exclu par construction (toutes les marges sont > 0). */
export type VerdictTestIndependance = "incompatibles" | "independants" | "ni";

export interface ContexteTestIndependance {
  id: string;
  /** Phrase d'introduction, sans la définition de A et B. */
  texte: string;
  /** Définition de A (prose) : « l'élève pratique un sport en club ». */
  definitionA: string;
  definitionB: string;
}

export interface ExerciceFamilleBTestIndependance {
  famille: "B";
  sousType: "testIndependance";
  contexte: ContexteTestIndependance;
  /** Effectifs entiers, TOUJOURS dans cet ordre : [[n(A∩B), n(A∩B̄)], [n(Ā∩B), n(Ā∩B̄)]]. */
  cellules: [[number, number], [number, number]];
  methode: MethodeTestIndependance;
}

/** Comment parler d'une ligne ou d'une colonne d'un tableau à double entrée dans une consigne qui
 * n'annonce PAS la nature de la probabilité (audit 6e ch. 6) : `sujet` se place après « qu'il »
 * (subjonctif, « soit de niveau faible »), `groupe` après « parmi les » (« élèves de niveau faible »). */
export interface DescripteurModalite {
  sujet: string;
  groupe: string;
}

export interface DescripteursTable {
  /** « un élève », « un client »… */
  individu: string;
  /** Pronom sujet accordé à `individu` : « il »/« elle ». */
  pronom: string;
  lignes: DescripteurModalite[];
  colonnes: DescripteurModalite[];
}

/** Type de probabilité demandée à partir d'un tableau à double entrée déjà connu — le piège central
 * de la spec (famille B, sous-type "grand tableau donné") : ne jamais confondre une MARGINALE
 * (`margLigne`/`margColonne`, total d'une ligne/colonne divisé par le total général) avec une
 * CONDITIONNELLE (`condLigneSachantColonne`/`condColonneSachantLigne`, cellule divisée par le total
 * d'une SEULE ligne/colonne). */
export type TypeQuestionTable = "jointe" | "margLigne" | "margColonne" | "condLigneSachantColonne" | "condColonneSachantLigne";

/** Tableau à double entrée générique R×C — généralisation du tableau 2×2 de `6gen30` famille A
 * (voir en-tête de `generateurs6e/independanceBayes/familleB.ts` pour la discussion "pourquoi pas
 * réutilisé tel quel"). `cellules[i][j]` = effectif de (ligne i, colonne j), toujours un entier
 * exact (jamais un flottant stocké). */
export interface TableauDouble {
  libelleLignes: string[];
  libelleColonnes: string[];
  cellules: number[][];
}

export interface ExerciceFamilleBTableauDonne {
  famille: "B";
  sousType: "tableauDonne";
  contexte: { texte: string; descripteurs: DescripteursTable };
  /** Table déjà COMPLÈTE — rien à reconstruire, seulement à lire (contrairement à
   * `ExerciceFamilleBReconstruire`). Taille fixe 3×3 (voir `familleB.ts`). */
  table: TableauDouble;
  typeQuestion: TypeQuestionTable;
  ligneCible: number;
  colonneCible: number;
}

/** Sous-type 3 — table 3×2 à taille FIXE (convention CLAUDE.md : "une table genuinement fixe peut
 * être des champs fixes" — pas besoin du patron add-as-needed ici). Stocke les paramètres BRUTS de
 * génération (pourcentages entiers, jamais les cellules déjà calculées) — `moteur6e/
 * verificationIndependanceBayes.ts` dérive les 6 cellules à partir de ces champs à chaque appel,
 * jamais une valeur figée dupliquée (même discipline que `6gen30`, `pAetBbar` etc. dérivées de
 * `nA`/`nB`/`nAetB`/`denominateur` plutôt que stockées). Convention de reconstruction FIXE (répliquée
 * dans `verificationIndependanceBayes.ts`/`ui6e/formatIndependanceBayes.ts`) :
 * - Écran 1 ("cases directement calculables") : les 3 totaux de ligne (déduits de `pourcentageLigne`)
 *   PUIS les 2 cellules colonne-1 des lignes 1 et 2 (déduites de `pourcentageReussiteLigne1`/`2`).
 * - Écran 2 ("compléter par différence") : la cellule colonne-1 de la ligne 3 (par différence avec
 *   `pourcentageReussiteGlobale`, le total de la colonne 1), PUIS les 3 cellules colonne-2 (chacune
 *   = total de sa ligne moins sa cellule colonne-1 déjà connue).
 */
export interface ExerciceFamilleBReconstruire {
  famille: "B";
  sousType: "tableauReconstruire";
  contexte: { texte: string; libelleLignes: [string, string, string]; libelleColonnes: [string, string]; descripteurs: DescripteursTable };
  /** N — population totale, toujours choisie pour que TOUTES les cellules dérivées soient des
   * entiers exacts (voir `familleB.ts`, contrainte de génération). */
  total: number;
  /** % de N par ligne (entiers, multiples de 10, somme exactement 100). */
  pourcentageLigne: [number, number, number];
  /** % de la ligne 1 qui tombe en colonne 1. */
  pourcentageReussiteLigne1: number;
  /** % de la ligne 2 qui tombe en colonne 1. */
  pourcentageReussiteLigne2: number;
  /** % de N (population totale) qui tombe en colonne 1 — le total de la colonne 1, en pourcentage. */
  pourcentageReussiteGlobale: number;
  /** Question posée à l'écran 3, sur le tableau reconstruit — même contrat `TypeQuestionTable` que
   * `ExerciceFamilleBTableauDonne` (réutilisation directe de `probabiliteDepuisTable`, voir
   * `verificationIndependanceBayes.ts`). */
  typeQuestionFinale: TypeQuestionTable;
  ligneCibleFinale: number;
  colonneCibleFinale: number;
}

export type ExerciceFamilleB = ExerciceFamilleBTestIndependance | ExerciceFamilleBTableauDonne | ExerciceFamilleBReconstruire;

// ============================================================================
// Famille C — Arbre de probabilité et théorème de Bayes.
// ============================================================================

/** Quelle conditionnelle "retournée" est demandée à l'écran 3 — spec : "ex. P(cause1|pas effet) ou
 * P(cause1|effet)". */
export type DemandeEcran3FamilleC = "cause1SachantEffet" | "cause1SachantPasEffet";

export interface ContexteFamilleC {
  id: string;
  texte: string;
  labelCause1: string;
  labelCause2: string;
  labelEffet: string;
}

export interface ExerciceFamilleC {
  famille: "C";
  contexte: ContexteFamilleC;
  /** P(cause1) — p∈{0,1; 0,15; 0,2; 0,25} (spec). P(cause2) = 1−p, jamais stocké séparément. */
  p: number;
  /** P(effet | cause1) — un test réaliste (audit 6e ch. 6) : q1 ∈ [0,7 ; 0,99] (sensibilité). */
  q1: number;
  /** P(effet | cause2) — q2 ∈ [0,01 ; 0,3] (faux positifs), donc toujours < q1. */
  q2: number;
  demandeEcran3: DemandeEcran3FamilleC;
}

export type ExerciceIndependanceBayes = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC;

export type FamilleIndependanceBayes = ExerciceIndependanceBayes["famille"];

export type GenerateurExerciceIndependanceBayes = () => ExerciceIndependanceBayes;
