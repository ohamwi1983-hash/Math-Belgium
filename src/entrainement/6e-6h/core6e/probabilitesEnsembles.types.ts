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

/** Sous-type de la question de déduction structurelle de l'écran 3 (spec : "soit reconnaître...
 * soit comparer..."). `"incompatibilite"` : A∩B̄ et Ā∩B sont TOUJOURS incompatibles, quels que
 * soient nA/nB/nAetB — un fait LOGIQUE (A vrai vs A faux, contradiction directe), jamais un calcul
 * numérique ; la réponse correcte est donc structurellement invariante (voir
 * `verificationProbabilitesEnsembles.ts`). `"comparaisonConditionnelle"` : compare P(A|B̄) à P(A|B)
 * — un résultat NUMÉRIQUE qui dépend des paramètres tirés, généralement différent (la génération
 * réessaie tant que l'écart est trop proche de 0, voir `generateurs6e/probabilitesEnsembles/
 * familleA.ts`). */
export type SousTypeEcran3FamilleA = "incompatibilite" | "comparaisonConditionnelle";

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
  demandeEcran2: DemandeEcran2FamilleB;
}

export type ExerciceProbabilitesEnsembles = ExerciceFamilleA | ExerciceFamilleB;

export type FamilleProbabilitesEnsembles = ExerciceProbabilitesEnsembles["famille"];

export type GenerateurExerciceProbabilitesEnsembles = () => ExerciceProbabilitesEnsembles;
