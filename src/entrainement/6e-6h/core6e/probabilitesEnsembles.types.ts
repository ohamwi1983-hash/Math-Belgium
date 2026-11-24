/**
 * Couche core (6e) — contrat pour `6gen30` ("Probabilités et ensembles", chapitre 8 —
 * "Probabilités", PREMIER générateur de ce chapitre : zéro infrastructure chapitre 8 avant ce
 * fichier, même rôle fondateur que `core6e/proprietesLogarithme.types.ts` pour le chapitre 3 ou
 * `core6e/calculPrimitives.types.ts` pour le chapitre 4). 2 familles (A, B), tirage ÉQUIPROBABLE de
 * la famille puis d'un contexte/sous-type au sein de la famille (voir
 * `generateurs6e/probabilitesEnsembles/index.ts`).
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — lire avant de modifier ce fichier**
 * ============================================================================
 * `6gen31`/`6gen32`/`6gen33` (pas encore construits) réutiliseront la brique de vérification
 * d'indépendance et le statut de réponse fraction/décimal établis ICI — voir l'en-tête de
 * `moteur6e/verificationProbabilites.ts` (module PARTAGÉ, chapitre 8) pour le détail de ce qui est
 * réellement exporté avec un nom stable. CE fichier-ci (types Couche A) N'EST PAS partagé au-delà
 * de `6gen30` — `ExerciceFamilleA`/`ExerciceFamilleB` sont des contrats propres à CE générateur
 * (tableau à double entrée / cartes-dés), jamais réutilisés tels quels par un autre `6genX` (à la
 * différence de `core6e/calculPrimitives.types.ts`, dont les familles A/B/C/G elles-mêmes sont
 * réutilisées Couche A par 6gen24/25/26 : ici, seule la Couche B générique d'indépendance l'est).
 *
 * ============================================================================
 * Toutes les valeurs numériques générées restent des ENTIERS exacts (effectifs `nA`/`nB`/`nAetB`/
 * `denominateur`, ou `count` pour la famille B) — jamais un flottant stocké (convention CLAUDE.md,
 * "fraction irréductible, jamais de décimal"). Toute probabilité (P(A), P(A∩B)...) se calcule à la
 * volée en divisant deux de ces entiers — voir `moteur6e/verificationProbabilitesEnsembles.ts` et
 * `ui6e/formatProbabilitesEnsembles.ts`, jamais un champ `pA: number` stocké séparément qui
 * risquerait de diverger de `nA/denominateur`.
 */

// ============================================================================
// Famille A — Inclusion-exclusion, tableau à double entrée.
// ============================================================================

export type IdContexteFamilleA = "menus" | "sportsCamp" | "appareils";

/** Un contexte de la banque — `texte` est la phrase COMPLÈTE (situation + définition de A et de
 * B), consommée telle quelle par `ui6e/formatProbabilitesEnsembles.ts` comme consigne générale
 * (prose, jamais passée à KaTeX — même convention que `CONTEXTES_A_EVALUER.phrase(...)` de
 * `generateurs6e/exponentiellesProblemes/contextes.ts`, mais ici une chaîne fixe plutôt qu'une
 * fonction : aucun paramètre numérique n'apparaît dans la phrase elle-même pour cette famille, les
 * valeurs numériques vivent uniquement dans le bloc données KaTeX). */
export interface ContexteFamilleA {
  id: IdContexteFamilleA;
  texte: string;
}

/** Laquelle des 3 quantités {P(A∩B), P(A∪B), P(ni A ni B)} est présentée comme DONNÉE à l'élève
 * (en plus de P(A) et P(B), toujours donnés) — détermine quelle quantité doit être DÉDUITE à
 * l'écran 1 (voir spec : "la troisième varie"). `"PAetB"` donné ⟹ P(A∪B) à déduire ; `"PAouB"` ou
 * `"PniAniB"` donné ⟹ P(A∩B) à déduire (P(ni A ni B) se convertit d'abord en P(A∪B) par
 * complément, 1-P(niAniB), avant d'appliquer la même relation d'inclusion-exclusion). */
export type TroisiemeDonneeFamilleA = "PAetB" | "PAouB" | "PniAniB";

/** Quelle probabilité dérivée est demandée à l'écran 2 — tirée équiprobablement parmi les 4
 * formes listées par la spec ("P(A∩B̄), P(Ā∩B), ou une probabilité conditionnelle simple", la
 * probabilité conditionnelle se déclinant elle-même dans les 2 sens possibles). */
export type DemandeEcran2FamilleA = "AetBbar" | "AbaretB" | "condAsachantB" | "condBsachantA";

/** Sous-type de la question de déduction structurelle de l'écran 3.
 * `"relation"` (audit 6e ch. 6, décision C — remplace l'ancien `"incompatibilite"`, dont la réponse
 * était TOUJOURS « incompatibles ») : deux événements construits sur le tableau (`paireEcran3`) sont-ils
 * incompatibles, indépendants, ou ni l'un ni l'autre ? La réponse dépend de la paire ET des effectifs
 * (voir `relationPaireEcran3` dans `verificationProbabilitesEnsembles.ts`) ; « incompatibles ET
 * indépendants » n'arrive que si l'un des deux est de probabilité nulle, exclu ici (les 4 cases du
 * tableau sont toujours non vides).
 * `"comparaisonConditionnelle"` : compare P(A|B̄) à P(A|B) — égales exactement quand A et B sont
 * indépendants (cas désormais tiré, voir `familleA.ts`), sinon d'écart au moins 0,05. */
export type SousTypeEcran3FamilleA = "relation" | "comparaisonConditionnelle";

/** Les 4 cases du tableau à double entrée. */
export type CaseTableauA = "AB" | "ABbar" | "AbarB" | "AbarBbar";

/** Événement lisible sur le tableau : A, Ā, B, B̄, ou l'une des 4 intersections (une case). */
export type EvenementTableauA = "A" | "Abar" | "B" | "Bbar" | "AetB" | "AetBbar" | "AbaretB" | "AbaretBbar";

/** Réponse de l'écran 3 « relation ». */
export type RelationEcran3A = "incompatibles" | "independants" | "ni_l_un_ni_l_autre";

export interface ExerciceFamilleA {
  famille: "A";
  contexte: ContexteFamilleA;
  /** N — taille de la population (effectif total, dénominateur commun de toutes les
   * probabilités de cet exercice). */
  denominateur: number;
  /** Effectif de A, 0 < nA < denominateur. */
  nA: number;
  /** Effectif de B, 0 < nB < denominateur. */
  nB: number;
  /** Effectif de A∩B — vérité terrain, TOUJOURS connue en interne indépendamment de ce qui est
   * présenté comme "donné" à l'élève (voir `troisiemeDonnee`). */
  nAetB: number;
  troisiemeDonnee: TroisiemeDonneeFamilleA;
  demandeEcran2: DemandeEcran2FamilleA;
  sousTypeEcran3: SousTypeEcran3FamilleA;
  /** Paire d'événements de l'écran 3 « relation » ; `null` pour « comparaisonConditionnelle ». */
  paireEcran3: readonly [EvenementTableauA, EvenementTableauA] | null;
}

// ============================================================================
// Famille B — Cartes, dés et indépendance.
// ============================================================================

export type SousTypeFamilleB = "cartes" | "des";

/** Un événement simple (A ou B) tel que présenté à l'élève — `label` est la définition en prose
 * ("la carte est rouge", "la somme des deux dés vaut 7"), `count` son effectif favorable exact
 * dans l'univers (dénombré par énumération complète à la génération, jamais par une formule
 * combinatoire — voir `generateurs6e/probabilitesEnsembles/familleB.ts`). */
export interface EvenementFamilleB {
  label: string;
  count: number;
  /** Issues favorables, en texte (« valet de cœur », « (2 ; 5) ») — corrigé détaillé ; absent dans
   * les instances antérieures (rien d'autre n'en dépend). */
  issues?: string[];
  /** Comptage expliqué (cartes : « 3 figures dans chacune des 4 couleurs ») — corrigé détaillé. */
  explication?: string;
}

/** Laquelle des deux opérations (intersection/union) est demandée à l'écran 2 — tirée
 * équiprobablement (spec : "dénombrement direct, ou inclusion-exclusion"). */
export type DemandeEcran2FamilleB = "intersection" | "union";

export interface ExerciceFamilleB {
  famille: "B";
  sousType: SousTypeFamilleB;
  /** Nombre de faces d'un dé — uniquement pertinent/présent pour `sousType==="des"` (4 ou 6,
   * spec). `undefined` pour `sousType==="cartes"`. */
  facesParDe?: 4 | 6;
  /** Taille de l'univers Ω — 52 pour les cartes, `facesParDe²` pour les dés. */
  denominateur: number;
  eventA: EvenementFamilleB;
  eventB: EvenementFamilleB;
  /** Effectif de A∩B — vérité terrain, dénombré par énumération complète. */
  countAetB: number;
  /** Issues communes à A et B, en texte (corrigé détaillé) ; absent dans les anciennes instances. */
  issuesAetB?: string[];
  demandeEcran2: DemandeEcran2FamilleB;
}

// ============================================================================
// Famille C — diagramme de Venn à trois ensembles (décision du professeur, ajoutée EN FIN de
// catalogue : les codes imprimés des familles A et B ne changent pas).
// ============================================================================

/** Zone d'un diagramme de Venn à trois ensembles : appartenance à A, B, C (« 110 » : dans A et B,
 * pas dans C ; « 000 » : à l'extérieur des trois). */
export type ZoneVennTrois = "111" | "110" | "101" | "011" | "100" | "010" | "001" | "000";

export interface ContexteFamilleC {
  id: string;
  /** Phrase d'introduction (« {N} » remplacé par l'effectif total). */
  introduction: string;
  /** « un élève », « un membre »… (« On choisit … au hasard »). */
  individu: string;
  /** Définitions des événements, en prose (jamais en mode math). */
  definitions: [string, string, string];
}

/** Probabilité de l'écran 3 : réunion des trois, « exactement un », « au moins deux ». */
export type DemandeEcran3FamilleC = "union" | "exactementUn" | "auMoinsDeux";

/** Probabilité conditionnelle de l'écran 4 : P(X | Ȳ) ou P(X | « au moins deux »). Indices 0, 1, 2
 * = A, B, C. */
export type ConditionnelleFamilleC = { type: "XsachantNonY"; x: 0 | 1 | 2; y: 0 | 1 | 2 } | { type: "XsachantAuMoinsDeux"; x: 0 | 1 | 2 };

export interface ExerciceFamilleC {
  famille: "C";
  contexte: ContexteFamilleC;
  /** Effectifs ENTIERS des 8 zones (source de vérité de toutes les données et réponses). */
  zones: Record<ZoneVennTrois, number>;
  /** Effectif total (somme des 8 zones). */
  total: number;
  demandeEcran3: DemandeEcran3FamilleC;
  conditionnelle: ConditionnelleFamilleC;
}

export type ExerciceProbabilitesEnsembles = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC;

export type FamilleProbabilitesEnsembles = ExerciceProbabilitesEnsembles["famille"];

export type GenerateurExerciceProbabilitesEnsembles = () => ExerciceProbabilitesEnsembles;
