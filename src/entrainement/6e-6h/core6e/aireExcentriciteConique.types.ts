/**
 * Couche core (6e) — contrat pour `6gen60` ("Aire via rayons focaux et excentricité depuis une
 * condition géométrique"), chapitre "Les coniques" (fondation `6gen58`, voir
 * `docs/historique-6e.md`). Contrairement à `6gen58`/`6gen59` (classification / reconstruction
 * d'équation), ce générateur exploite 2 propriétés MÉTRIQUES de l'ellipse déjà nommée par le
 * chapitre (jamais une équation à retrouver) :
 *
 * - Famille A : la propriété caractéristique |PF|+|PF'|=2a, combinée à un rapport k donné, pour
 *   calculer une aire de triangle foyer-point-foyer (loi des cosinus, technique déjà maîtrisée hors
 *   chapitre — AUCUNE fonction de `identificationConiques/classification.ts` n'est directement
 *   réutilisable ici, cette géométrie n'a pas d'infrastructure platform existante : voir
 *   `generateurs6e/aireExcentriciteConique/familleA.ts`).
 * - Famille B : une condition géométrique (parmi 3 sous-types) traduite en une équation reliant
 *   a,b,c (ou directement e), puis résolue pour l'excentricité e.
 *
 * Aucun type partagé avec `equationConiqueCaracteristiques.types.ts`/`identificationConiques.types.ts`
 * — `FractionExacte` redéfini localement (redondance intra-chapitre acceptée, CLAUDE.md) plutôt
 * qu'importé : chaque générateur du chapitre reste indépendant, jamais de contrat commun au-delà de
 * `NatureConique`/`Point` (non nécessaires ici, cette conique est TOUJOURS une ellipse).
 */

/** Fraction exacte réduite (jamais un décimal affiché pour une valeur EXACTE, CLAUDE.md) — utilisée
 * pour |PF|/|PF'| (famille A, écran 1) et cos(angle) (famille A, écran 2 — toujours rationnel par
 * construction, voir en-tête `familleA.ts`). L'aire finale (famille A, écran 3) et l'excentricité
 * de certains sous-types (famille B) restent en revanche des `number` simples : elles sont
 * GÉNÉRIQUEMENT irrationnelles (sin(angle) fait intervenir une racine carrée) — voir CLAUDE.md,
 * exception explicite pour ce générateur ("Angles/cos/sin/area ... inherently often irrational").
 */
export interface FractionExacte {
  num: number;
  den: number;
}

// ============================================================================
// Famille A — Aire du triangle foyer-point-foyer, via |PF|+|PF'|=2a et un rapport k=|PF|/|PF'|.
// ============================================================================

/** Écran 1 → `pf`,`pfPrime` (extraction, système {|PF|+|PF'|=2a, |PF|=k·|PF'|}). Écran 2 → `cosAngle`
 * (loi des cosinus dans FPF', |FF'|=2c). Écran 3 → `aire` (via (1/2)|PF||PF'|sin(angle)).
 *
 * PIÈGE CENTRAL (mission) : tenter de calculer |PF| et |PF'| séparément par une autre méthode SANS
 * utiliser d'abord |PF|+|PF'|=2a — cette propriété caractéristique de l'ellipse est la clé d'entrée
 * obligatoire du problème (aucune autre donnée du problème ne fixe |PF|/|PF'| individuellement).
 */
export interface ExerciceFamilleA {
  famille: "A";
  /** Demi-grand axe — entier strictement positif, `a>b`. */
  a: number;
  /** Demi-petit axe — entier strictement positif, `a>b`. */
  b: number;
  /** Rapport k=|PF|/|PF'|, k≠1 — fraction exacte (ex. 3/2, 2/1, 5/2, 3/1). */
  k: FractionExacte;
  /** `a²-b²` (=c²) — entier exact positif, réutilisé par la loi des cosinus SANS jamais extraire
   * `c=√(c²)` lui-même (qui peut être irrationnel) : seul `c²` est nécessaire (`|FF'|²=4c²`). */
  cCarre: number;
  /** `|PF'|` — fraction exacte réduite, `=2a/(k+1)`. */
  pfPrime: FractionExacte;
  /** `|PF|` — fraction exacte réduite, `=2a·k/(k+1)`. */
  pf: FractionExacte;
  /** `cos(angle FPF')` — fraction exacte réduite, TOUJOURS rationnelle par construction (loi des
   * cosinus ne fait intervenir que `c²`, jamais `c`). */
  cosAngle: FractionExacte;
  /** Aire du triangle FPF' — `number` simple, génériquement irrationnelle (`sin(angle)` fait
   * intervenir une racine carrée dès que `cosAngle²` n'est pas un carré parfait). */
  aire: number;
}

// ============================================================================
// Famille B — Excentricité depuis une condition géométrique. 3 sous-types.
// ============================================================================

export type SousTypeFamilleB = "abscisseFoyerParallele" | "angleDroitSommetSecondaire" | "distanceDirectrices";

/** Écran 1 → équation reliant a,b,c (ou directement e) traduisant la condition géométrique donnée
 * (texte libre). Écran 2 → résolution pour `e` (texte libre), à partir de l'équation CONFIRMÉE de
 * l'écran 1.
 *
 * - `abscisseFoyerParallele` : P sur l'ellipse a la même abscisse qu'un foyer ; OP est parallèle à
 *   la droite joignant un sommet principal à un sommet secondaire. Se traduit en `b=c`
 *   (indépendant de tout paramètre tiré) → `e=√2/2`.
 * - `angleDroitSommetSecondaire` : depuis un sommet B de l'axe secondaire, l'angle FBF' est droit.
 *   `|BF|=|BF'|=a` (propriété caractéristique) + Pythagore dans FBF' rectangle isocèle → `a²=2c²`
 *   (indépendant de tout paramètre tiré) → `e=√2/2`.
 * - `distanceDirectrices` : distance entre les directrices = `k` × distance entre les foyers (`k`
 *   tiré, entier ≥2). `2a/e = k·2ae` → `e²=1/k` → `e=1/√k`.
 */
export interface ExerciceFamilleB {
  famille: "B";
  sousType: SousTypeFamilleB;
  /** Présent ssi `sousType==="distanceDirectrices"` — entier ≥2 (garantit `e=1/√k<1`, ellipse). */
  k?: number;
  /** Valeur EXACTE de l'excentricité cible (`√2/2` pour les 2 premiers sous-types, `1/√k` pour le
   * 3ᵉ) — toujours un `number` simple : générique irrationnelle (voir en-tête de fichier), jamais
   * forcée en `FractionExacte` même quand `k` est un carré parfait (`e` reste alors accidentellement
   * une fraction propre, ex. `k=4→e=0.5`, mais rien ne distingue ce cas a priori). */
  excentricite: number;
}

export type ExerciceAireExcentriciteConique = ExerciceFamilleA | ExerciceFamilleB;
export type FamilleAireExcentriciteConique = ExerciceAireExcentriciteConique["famille"];
