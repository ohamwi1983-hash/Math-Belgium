/**
 * Couche B (5e) — vérification pour 5gen28 ("Tangentes"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importés) `valeurFPointDonne`/`deriveeFPointDonne`/
 * `valeurFHorizontale`/`deriveeFHorizontale`/`valeurFDoubleTangence`/`deriveeFDoubleTangence`
 * (`generateurs5e/tangentes/index.ts`) — même patron que `verificationDefinitionDerivee.ts`
 * répliquant `valeurFonction` de 5gen26. Pour la variante C, la "vraie" f'(x) est la dérivée
 * FERMÉE du quartique STOCKÉ (terme à terme, règle de puissance) — jamais une différence finie,
 * contrairement à `verificationFonctionDerivee.ts` (5gen27) qui doit gérer des familles bien plus
 * variées : ici c'est un simple polynôme déjà développé, la formule fermée est directe.
 *
 * Tout champ numérique est comparé EXACTEMENT (`diagnostiquerNombre` local, 1e-6) — audit 5e ch. 5,
 * décision I : l'ancienne tolérance 0,01 de 5gen21 acceptait « 4,47 » pour 2√5 à l'écran f(a), puis
 * l'équation de tangente arrondie était refusée (1e-3).
 */
import type { ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "../core5e/tangentes.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

// ============================================================================
// Valeurs EXACTES (audit 5e ch. 5, décision I) : f(a), f'(a), racines, coordonnées et équations
// sont comparées à 1e-6 près — une valeur approchée (« 4,47 » pour 2√5) n'est plus acceptée à un
// écran puis refusée au suivant. Une valeur approchée PROCHE est signalée par un message dédié
// (`estValeurApprochee`), sans consommer de tentative.
// ============================================================================

const TOLERANCE_EXACTE = 1e-6;

function egalExact(valeur: number, cible: number): boolean {
  return Math.abs(valeur - cible) <= TOLERANCE_EXACTE * Math.max(1, Math.abs(cible));
}

function normaliserSignes(texte: string): string {
  return texte.replace(/[\u2212\u2013\u2014]/g, "-");
}

/** Nombre EXACT (√, fractions, « − », virgule acceptés par `evaluerExpressionGenerale`). */
export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(normaliserSignes(texte), 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return egalExact(valeur, cible) ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

/** Vrai si la saisie est lisible, FAUSSE, mais à moins de 1 % (ou 0,02) de la cible : c'est une
 * valeur arrondie alors qu'une valeur exacte est demandée. */
export function estValeurApprochee(texte: string, cible: number): boolean {
  try {
    const valeur = evaluerExpressionGenerale(normaliserSignes(texte), 0);
    if (!Number.isFinite(valeur) || egalExact(valeur, cible)) return false;
    return Math.abs(valeur - cible) <= Math.max(0.02, 0.01 * Math.abs(cible));
  } catch {
    return false;
  }
}

/** Préfixe recopié depuis l'étiquette ou la consigne (« y = … », « t = … », « t ≡ … ») — retiré
 * avant l'évaluation : c'est la même réponse (audit 5e ch. 5, point 6). */
export function retirerPrefixeTangente(texte: string): string {
  return normaliserSignes(texte)
    .trim()
    .replace(/^t\s*_?\s*(\{[^}]*\}|\([^)]*\))?\s*(≡|=)\s*/i, "")
    .replace(/^y\s*=\s*/i, "")
    .trim();
}


// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
  }
  return exercice.coeff * Math.sqrt(exercice.m * x + exercice.p);
}

export function deriveeFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    let s = 0;
    for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
    return s;
  }
  return (exercice.coeff * exercice.m) / (2 * Math.sqrt(exercice.m * x + exercice.p));
}

export function valeurFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return exercice.a * x * x * x + exercice.b * x * x + exercice.c * x + exercice.d;
}

export function deriveeFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return 3 * exercice.a * x * x + 2 * exercice.b * x + exercice.c;
}

export function valeurFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
}

export function deriveeFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  let s = 0;
  for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
  return s;
}

// ============================================================================
// Équivalence algébrique en x, échantillonnée — pour les 2 champs "y=" purement symboliques
// (variante A écran "tangente", variante C écran "tangenteEnP"). Le champ ne contient QUE le
// membre de droite (label "y=" affiché séparément, même convention que
// `formatAsymptoteOblique.ts::labelChamp("conclureEquationAsymptote")`).
// ============================================================================

const POINTS_ECHANTILLON = [0, 1, 2, -1, 3, -2];

function diagnostiquerExpressionEnX(texteBrut: string, cible: (x: number) => number): StatutVerification {
  const texte = retirerPrefixeTangente(texteBrut);
  if (texte === "") return "parse_error";
  try {
    for (const x of POINTS_ECHANTILLON) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (!egalExact(valeurEntree, cible(x))) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Même idée que `estValeurApprochee`, pour une équation de droite : lisible, fausse, mais proche
 * en chaque point d'échantillon (pente/ordonnée arrondies). */
function estExpressionApprochee(texteBrut: string, cible: (x: number) => number): boolean {
  const texte = retirerPrefixeTangente(texteBrut);
  try {
    let exacte = true;
    for (const x of POINTS_ECHANTILLON) {
      const valeur = evaluerExpressionGenerale(texte, x);
      const c = cible(x);
      if (!Number.isFinite(valeur)) return false;
      if (!egalExact(valeur, c)) exacte = false;
      if (Math.abs(valeur - c) > Math.max(0.05, 0.01 * Math.abs(c))) return false;
    }
    return !exacte;
  } catch {
    return false;
  }
}

// ============================================================================
// Variante A ("pointDonne") — écran "substituer" (f(a) et f'(a), nombres exacts) puis "tangente"
// (équation y=f'(a)(x-a)+f(a), équivalence algébrique).
// ============================================================================

export function diagnostiquerFAPointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  return diagnostiquerNombre(texte, valeurFPointDonne(exercice, exercice.a));
}

export function diagnostiquerFPrimeAPointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFPointDonne(exercice, exercice.a));
}

function cibleTangentePointDonne(exercice: ExerciceTangentePointDonne): (x: number) => number {
  const a = exercice.a;
  const fA = valeurFPointDonne(exercice, a);
  const fPrimeA = deriveeFPointDonne(exercice, a);
  return (x) => fA + fPrimeA * (x - a);
}

export function diagnostiquerEquationTangentePointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  return diagnostiquerExpressionEnX(texte, cibleTangentePointDonne(exercice));
}

export function equationTangentePointDonneApprochee(texte: string, exercice: ExerciceTangentePointDonne): boolean {
  return estExpressionApprochee(texte, cibleTangentePointDonne(exercice));
}

/** Écran "substituer" : f(a) ou f'(a) saisie comme une valeur arrondie. */
export function substitutionApprochee(reponse: { fA: string; fPrimeA: string }, exercice: ExerciceTangentePointDonne): boolean {
  return estValeurApprochee(reponse.fA, valeurFPointDonne(exercice, exercice.a)) || estValeurApprochee(reponse.fPrimeA, deriveeFPointDonne(exercice, exercice.a));
}

// ============================================================================
// Variante B ("horizontale") — écran "resoudre" (1 ou 2 racines de f'(x)=0, vérifiées comme un
// ENSEMBLE, ordre indifférent) puis "coordonnees" (point complet (x;y) par racine, idem).
// ============================================================================

/** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond à
 * L'UNE des racines attendues (peu importe la position du champ). */
export function diagnostiquerRacineChamp(texte: string, exercice: ExerciceTangenteHorizontale): StatutVerification {
  const base = diagnostiquerNombre(texte, exercice.racines[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return exercice.racines.some((r) => diagnostiquerNombre(texte, r) === "correct") ? "correct" : "not_equivalent";
}

/** Vérification COMBINÉE (notation/moteur) — ENSEMBLE exact, ordre indifférent : chaque racine
 * attendue doit être retrouvée EXACTEMENT une fois parmi les réponses. */
export function verifierRacinesHorizontale(reponses: string[], exercice: ExerciceTangenteHorizontale): boolean {
  const racines = exercice.racines;
  if (reponses.length !== racines.length) return false;
  if (racines.length === 1) return diagnostiquerNombre(reponses[0], racines[0]) === "correct";
  const direct = diagnostiquerNombre(reponses[0], racines[0]) === "correct" && diagnostiquerNombre(reponses[1], racines[1]) === "correct";
  if (direct) return true;
  return diagnostiquerNombre(reponses[0], racines[1]) === "correct" && diagnostiquerNombre(reponses[1], racines[0]) === "correct";
}

/** Problème de FORME d'une liste de solutions, signalé sans consommer de tentative (audit 5e
 * ch. 5, point 33) : « doublon » (la même valeur deux fois — une racine double ne s'écrit qu'une
 * fois), « incomplet » (toutes les valeurs saisies sont justes mais il en manque). `null` = la
 * saisie est soumise normalement. */
export type ProblemeListe = "doublon" | "incomplet" | null;

function valeurLisible(texte: string): number | null {
  try {
    const v = evaluerExpressionGenerale(normaliserSignes(texte), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function problemeListeRacines(reponses: string[], exercice: ExerciceTangenteHorizontale): ProblemeListe {
  const valeurs = reponses.map(valeurLisible);
  if (valeurs.some((v) => v === null)) return null;
  const nums = valeurs as number[];
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (egalExact(nums[i], nums[j])) return "doublon";
  const toutesJustes = nums.every((v) => exercice.racines.some((r) => egalExact(v, r)));
  return toutesJustes && nums.length < exercice.racines.length ? "incomplet" : null;
}

/** Point saisi comme 2 CHAMPS SÉPARÉS (x, y côte à côte) — convention établie sur 5gen24
 * (`EtapeCasSpecialEtudeComplete.tsx`), jamais un champ combiné "(x;y)" en texte libre
 * (`prompt5gen28variantesabc.md`, variante B écran "coordonnees"). */
export interface PointSaisi {
  x: string;
  y: string;
}

function pointsCiblesHorizontale(exercice: ExerciceTangenteHorizontale): { x: number; y: number }[] {
  return exercice.racines.map((r) => ({ x: r, y: valeurFHorizontale(exercice, r) }));
}

/** Diagnostic PAR SOUS-COMPOSANTE (x et y indépendamment) — correct si la valeur saisie pour cette
 * composante correspond à L'UNE des cibles possibles, indépendamment de l'appariement réel — même
 * principe que `diagnostiquerRacineChamp` (surlignage rouge PAR CHAMP, pas la vérification
 * combinée qui, elle, apparie x et y d'un même point). */
function diagnostiquerComposanteParmiCibles(texte: string, cibles: number[]): StatutVerification {
  const base = diagnostiquerNombre(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerNombre(texte, c) === "correct") ? "correct" : "not_equivalent";
}

/** Diagnostic PAR CHAMP (x et y du point à cet index) — même principe que `diagnostiquerRacineChamp` :
 * correct si chaque composante correspond à L'UNE des composantes attendues, indépendamment de sa
 * position. */
export function diagnostiquerCoordonneeChamp(point: PointSaisi, exercice: ExerciceTangenteHorizontale): { x: StatutVerification; y: StatutVerification } {
  const cibles = pointsCiblesHorizontale(exercice);
  return {
    x: diagnostiquerComposanteParmiCibles(point.x, cibles.map((c) => c.x)),
    y: diagnostiquerComposanteParmiCibles(point.y, cibles.map((c) => c.y)),
  };
}

function pointCorrespond(reponse: PointSaisi, cible: { x: number; y: number }): boolean {
  return diagnostiquerNombre(reponse.x, cible.x) === "correct" && diagnostiquerNombre(reponse.y, cible.y) === "correct";
}

export function problemeListePoints(reponses: PointSaisi[], exercice: ExerciceTangenteHorizontale): ProblemeListe {
  const xs = reponses.map((p) => valeurLisible(p.x));
  const ys = reponses.map((p) => valeurLisible(p.y));
  if (xs.some((v) => v === null) || ys.some((v) => v === null)) return null;
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (egalExact(xs[i] as number, xs[j] as number) && egalExact(ys[i] as number, ys[j] as number)) return "doublon";
  const cibles = pointsCiblesHorizontale(exercice);
  const tousJustes = reponses.every((p) => cibles.some((c) => pointCorrespond(p, c)));
  return tousJustes && reponses.length < cibles.length ? "incomplet" : null;
}

/** Valeur arrondie saisie là où une valeur exacte est demandée (x ou y d'un point). */
export function pointsApproches(reponses: PointSaisi[], exercice: ExerciceTangenteHorizontale): boolean {
  const cibles = pointsCiblesHorizontale(exercice);
  return reponses.some((p) => cibles.some((c) => estValeurApprochee(p.x, c.x) || estValeurApprochee(p.y, c.y)));
}

export function verifierCoordonneesHorizontale(reponses: PointSaisi[], exercice: ExerciceTangenteHorizontale): boolean {
  const cibles = pointsCiblesHorizontale(exercice);
  if (reponses.length !== cibles.length) return false;
  if (cibles.length === 1) return pointCorrespond(reponses[0], cibles[0]);
  const direct = pointCorrespond(reponses[0], cibles[0]) && pointCorrespond(reponses[1], cibles[1]);
  if (direct) return true;
  return pointCorrespond(reponses[0], cibles[1]) && pointCorrespond(reponses[1], cibles[0]);
}

// ============================================================================
// Variante C ("doubleTangence") — écran "tangenteEnP" (f'(p) exact + équation y=... symbolique),
// "trouverQ" (q exact, vérité terrain interne) puis "verifierPente" (f'(q), doit coïncider avec
// f'(p) — le CŒUR pédagogique de l'exercice).
// ============================================================================

export function diagnostiquerFPrimeP(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFDoubleTangence(exercice, exercice.p));
}

export function diagnostiquerEquationTangenteP(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  const p = exercice.p;
  const fP = valeurFDoubleTangence(exercice, p);
  const fPrimeP = deriveeFDoubleTangence(exercice, p);
  return diagnostiquerExpressionEnX(texte, (x) => fP + fPrimeP * (x - p));
}

export function diagnostiquerQ(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, exercice.q);
}

export function diagnostiquerFPrimeQ(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFDoubleTangence(exercice, exercice.q));
}
