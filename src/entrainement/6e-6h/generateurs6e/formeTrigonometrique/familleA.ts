import type { ValeurExacte } from "../../core6e/cyclometrique.types";
import type { AngleRemarquable, ExerciceFormeTrigA, FacteurComplexe } from "../../core6e/formeTrigonometrique.types";
import { pgcd, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Forme trigonométrique/exponentielle depuis a+bi") de
 * `6gen37`, chapitre 7 "Nombres complexes" (deuxième générateur de ce chapitre, après `6gen34`).
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — 6gen39/6gen40/6gen41 (et transitivement 6gen42), lire avant de
 * modifier ce fichier** (voir prompt de mission 6gen37)
 * ============================================================================
 * - `calculerModule(a: number, b: number): number` — `√(a²+b²)`, TOUJOURS ≥0.
 * - `calculerArgument(a: number, b: number): AngleRemarquable` — l'argument PRINCIPAL (dans
 *   `(-π;π]`) de `a+bi`, avec correction de quadrant CORRECTE pour les 4 quadrants ET les 2 cas
 *   d'axe (`a=0` ou `b=0`, voir `familleA.test.ts` pour la couverture des 8 octants/axes). Calculé
 *   via `Math.atan2(b, a)` — DÉLIBÉRÉMENT, jamais une réimplémentation manuelle de "arctan(b/a) puis
 *   correction du signe selon le quadrant" : cette dernière est le piège PÉDAGOGIQUE que l'écran 2
 *   de cette famille fait travailler à l'ÉLÈVE (voir `argumentNaifSansCorrection` ci-dessous, gardée
 *   séparée EXPRÈS pour piloter ce piège côté vérification/aide), mais c'est un risque d'erreur
 *   inutile pour la VÉRITÉ DE RÉFÉRENCE côté plateforme — `Math.atan2` est l'implémentation standard,
 *   déjà correcte par construction pour les 4 quadrants et les 2 axes, aucune raison de la
 *   redupliquer à la main ici. Résultat ensuite apparié à `ANGLES_REMARQUABLES` (tolérance
 *   `1e-6`) pour retourner un LaTeX exact plutôt qu'un flottant arrondi (fallback décimal si aucun
 *   angle remarquable ne correspond — safety net, jamais atteint par les 5 familles de ce
 *   générateur, `a,b` étant toujours construits depuis un angle de la banque).
 * - `argumentNaifSansCorrection(a: number, b: number): number` — `Math.atan(b/a)` SANS aucune
 *   correction de quadrant (peut être `Infinity`/`NaN` si `a=0`) — piège central de la famille A
 *   écran 2, exposé pour que la vérification/les tests puissent le distinguer explicitement de
 *   `calculerArgument`.
 * - `ANGLES_REMARQUABLES: AngleRemarquable[]` — les 16 angles remarquables (multiples de π/6 ou
 *   π/4) réduits à leur valeur PRINCIPALE dans `(-π;π]` (voir en-tête `angles.ts` pour la
 *   justification de cette convention, différente de `BANQUE_16_POINTS` du chapitre 1).
 * - `tirerZAvecAngleRemarquable(): FacteurComplexe` — tire un `z=a+bi` "propre" (module entier
 *   simple 1-4 × angle remarquable), réutilisé par les familles B/D de ce même générateur.
 *
 * ============================================================================
 * **Pourquoi `ANGLES_REMARQUABLES` est reconstruite ICI plutôt qu'importée de
 * `generateurs6e/cyclometrique/banqueAngles.ts`**
 * ============================================================================
 * `BANQUE_16_POINTS` (chapitre 1) encode les 16 points dans `[0;2π[` — convention DIFFÉRENTE de
 * l'argument principal `(-π;π]` attendu ici (voir en-tête `angles.ts`). Plutôt que de convertir la
 * banque à la volée à chaque appel (fragile, logique de conversion dupliquée partout), les 16
 * entrées sont réénumérées ICI directement dans la convention principale — MÊMES valeurs numériques
 * (cross-vérifiées par test contre `Math.cos`/`Math.sin` ET contre `BANQUE_16_POINTS` elle-même pour
 * les 9 angles qui se recouvrent exactement, `[0;π]`), donc bien une "réutilisation" au sens propre
 * de la donnée mathématique (même table exacte), pas une redécouverte indépendante à risque
 * d'erreur.
 *
 * ============================================================================
 * **`r` toujours un entier simple (1 à 4) — jamais √2/√3 comme MODULE de départ**
 * ============================================================================
 * Le prompt source cite "1,2,3,√2,√3..." comme exemples de modules "simples" — mais choisir `r`
 * lui-même irrationnel obligerait à combiner 2 radicaux différents (`r=√3` × `cos=√2/2` → `√6/2`,
 * un radical composé jamais rencontré ailleurs sur la plateforme et hors de portée de ce chapitre).
 * Avec `r` toujours entier, `a=r·cos(θ)`/`b=r·sin(θ)` restent TOUJOURS un radical simple unique
 * (`combinerModuleAngle`, ci-dessous) — et √2/√3 apparaissent bien naturellement dans `a`/`b`
 * (ex. r=2,θ=π/4 → a=b=√2 ; r=3,θ=π/3 → a=3/2, b=3√3/2), exactement dans l'esprit de la consigne
 * source, juste positionnés dans `a`/`b` plutôt que dans `r` lui-même. Sans conséquence pour cette
 * famille (l'élève ne tape jamais `a+bi`, seulement `r`/`θ`, tous deux réels — évaluateur
 * `moteur6e/expressionExponentielle.ts`, `sqrt` supporté nativement).
 */

const TOLERANCE_ANGLE = 1e-6;

// ============================================================================
// Valeurs trigonométriques exactes réutilisées — mêmes 9 valeurs distinctes que
// `generateurs6e/cyclometrique/banqueAngles.ts` (`BANQUE_16_POINTS`).
// ============================================================================

const R2 = Math.SQRT2 / 2;
const R3 = Math.sqrt(3) / 2;

const V0: ValeurExacte = { latex: "0", numerique: 0 };
const V1: ValeurExacte = { latex: "1", numerique: 1 };
const VM1: ValeurExacte = { latex: "-1", numerique: -1 };
const V_DEMI: ValeurExacte = { latex: "\\frac{1}{2}", numerique: 0.5 };
const VM_DEMI: ValeurExacte = { latex: "-\\frac{1}{2}", numerique: -0.5 };
const V_R2: ValeurExacte = { latex: "\\frac{\\sqrt{2}}{2}", numerique: R2 };
const VM_R2: ValeurExacte = { latex: "-\\frac{\\sqrt{2}}{2}", numerique: -R2 };
const V_R3: ValeurExacte = { latex: "\\frac{\\sqrt{3}}{2}", numerique: R3 };
const VM_R3: ValeurExacte = { latex: "-\\frac{\\sqrt{3}}{2}", numerique: -R3 };

interface PointRemarquable {
  angle: AngleRemarquable;
  cos: ValeurExacte;
  sin: ValeurExacte;
}

function angle(p: number, q: number, latex: string): AngleRemarquable {
  return { p, q, latex, numerique: (p / q) * Math.PI };
}

/** Les 16 points remarquables du cercle trigonométrique, argument PRINCIPAL dans `(-π;π]` — voir
 * en-tête de fichier. */
export const POINTS_REMARQUABLES: PointRemarquable[] = [
  { angle: angle(0, 1, "0"), cos: V1, sin: V0 },
  { angle: angle(1, 6, "\\frac{\\pi}{6}"), cos: V_R3, sin: V_DEMI },
  { angle: angle(1, 4, "\\frac{\\pi}{4}"), cos: V_R2, sin: V_R2 },
  { angle: angle(1, 3, "\\frac{\\pi}{3}"), cos: V_DEMI, sin: V_R3 },
  { angle: angle(1, 2, "\\frac{\\pi}{2}"), cos: V0, sin: V1 },
  { angle: angle(2, 3, "\\frac{2\\pi}{3}"), cos: VM_DEMI, sin: V_R3 },
  { angle: angle(3, 4, "\\frac{3\\pi}{4}"), cos: VM_R2, sin: V_R2 },
  { angle: angle(5, 6, "\\frac{5\\pi}{6}"), cos: VM_R3, sin: V_DEMI },
  { angle: angle(1, 1, "\\pi"), cos: VM1, sin: V0 },
  { angle: angle(-5, 6, "-\\frac{5\\pi}{6}"), cos: VM_R3, sin: VM_DEMI },
  { angle: angle(-3, 4, "-\\frac{3\\pi}{4}"), cos: VM_R2, sin: VM_R2 },
  { angle: angle(-2, 3, "-\\frac{2\\pi}{3}"), cos: VM_DEMI, sin: VM_R3 },
  { angle: angle(-1, 2, "-\\frac{\\pi}{2}"), cos: V0, sin: VM1 },
  { angle: angle(-1, 3, "-\\frac{\\pi}{3}"), cos: V_DEMI, sin: VM_R3 },
  { angle: angle(-1, 4, "-\\frac{\\pi}{4}"), cos: V_R2, sin: VM_R2 },
  { angle: angle(-1, 6, "-\\frac{\\pi}{6}"), cos: V_R3, sin: VM_DEMI },
];

export const ANGLES_REMARQUABLES: AngleRemarquable[] = POINTS_REMARQUABLES.map((pt) => pt.angle);

// ============================================================================
// calculerModule / calculerArgument — voir CONTRAT DE RÉUTILISATION en en-tête de fichier.
// ============================================================================

export function calculerModule(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

/** Piège central de la famille A, écran 2 — `arctan(b/a)` SANS correction de quadrant. Vaut
 * `±π/2`/`NaN` selon le cas quand `a=0` (comportement natif de `Math.atan`/division par 0),
 * jamais utilisé comme vérité de référence (voir `calculerArgument`). */
export function argumentNaifSansCorrection(a: number, b: number): number {
  return Math.atan(b / a);
}

function angleDecimalFallback(numerique: number): AngleRemarquable {
  // Safety net — jamais atteint par les 5 familles de ce générateur (voir en-tête de fichier) :
  // p/q n'ont ici aucune signification exacte, seuls latex/numerique sont fiables.
  return { p: Math.round(numerique * 1e6), q: 1e6, latex: numerique.toFixed(4), numerique };
}

/** L'argument PRINCIPAL de `a+bi`, dans `(-π;π]`, avec correction de quadrant correcte pour les 4
 * quadrants ET les 2 axes (`a=0` ou `b=0`) — voir CONTRAT DE RÉUTILISATION en en-tête de fichier. */
export function calculerArgument(a: number, b: number): AngleRemarquable {
  const numerique = a === 0 && b === 0 ? 0 : Math.atan2(b, a);
  const trouve = ANGLES_REMARQUABLES.find((e) => Math.abs(e.numerique - numerique) < TOLERANCE_ANGLE);
  return trouve ?? angleDecimalFallback(numerique);
}

// ============================================================================
// Construction de a/b exacts depuis (r entier, point remarquable) — un seul radical simple.
// ============================================================================

function fracSimplifiee(num: number, den: number): ValeurExacte {
  if (num === 0) return V0;
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  return { latex: d === 1 ? `${n}` : `\\frac{${n}}{${d}}`, numerique: n / d };
}

function radicalSimplifie(coefNum: number, coefDen: number, radicalLatex: string, radicalNumerique: number): ValeurExacte {
  const g = pgcd(Math.abs(coefNum), coefDen);
  const n = coefNum / g;
  const d = coefDen / g;
  const numerique = (n / d) * radicalNumerique;
  if (d === 1) {
    if (n === 1) return { latex: radicalLatex, numerique };
    if (n === -1) return { latex: `-${radicalLatex}`, numerique };
    return { latex: `${n}${radicalLatex}`, numerique };
  }
  const signe = n < 0 ? "-" : "";
  const coefMagnitude = Math.abs(n) === 1 ? "" : `${Math.abs(n)}`;
  return { latex: `\\frac{${signe}${coefMagnitude}${radicalLatex}}{${d}}`, numerique };
}

/** `r` (entier positif) × une valeur trigonométrique exacte de `POINTS_REMARQUABLES` → un radical
 * simple exact (jamais de radical composé — voir en-tête de fichier). `trig.latex` DOIT être l'une
 * des 9 valeurs exactes de la table ci-dessus. */
export function combinerModuleAngle(r: number, trig: ValeurExacte): ValeurExacte {
  switch (trig.latex) {
    case "0":
      return V0;
    case "1":
      return fracSimplifiee(r, 1);
    case "-1":
      return fracSimplifiee(-r, 1);
    case "\\frac{1}{2}":
      return fracSimplifiee(r, 2);
    case "-\\frac{1}{2}":
      return fracSimplifiee(-r, 2);
    case "\\frac{\\sqrt{2}}{2}":
      return radicalSimplifie(r, 2, "\\sqrt{2}", Math.SQRT2);
    case "-\\frac{\\sqrt{2}}{2}":
      return radicalSimplifie(-r, 2, "\\sqrt{2}", Math.SQRT2);
    case "\\frac{\\sqrt{3}}{2}":
      return radicalSimplifie(r, 2, "\\sqrt{3}", Math.sqrt(3));
    case "-\\frac{\\sqrt{3}}{2}":
      return radicalSimplifie(-r, 2, "\\sqrt{3}", Math.sqrt(3));
    default:
      throw new Error(`combinerModuleAngle : valeur trigonométrique non gérée : "${trig.latex}"`);
  }
}

const MODULES_SIMPLES = [1, 2, 3, 4] as const;

/** Tire un `z=a+bi` "propre" : module entier simple (1-4) × un des 16 angles remarquables —
 * réutilisé par les familles A/B/D de ce générateur (voir CONTRAT DE RÉUTILISATION en en-tête de
 * fichier). */
export function tirerZAvecAngleRemarquable(): FacteurComplexe {
  const r = tirerParmi(MODULES_SIMPLES);
  const point = tirerParmi(POINTS_REMARQUABLES);
  const a = combinerModuleAngle(r, point.cos);
  const b = combinerModuleAngle(r, point.sin);
  return { r, angle: point.angle, a, b };
}

export function construireFamilleA(): ExerciceFormeTrigA {
  const { r, angle: angleTire, a, b } = tirerZAvecAngleRemarquable();
  return { famille: "A", r, angle: angleTire, a, b };
}
