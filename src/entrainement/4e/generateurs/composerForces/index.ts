import type {
  ExerciceComposerForces,
  NomTriangle,
  QuestionComposerForces,
  SituationComposerForces,
  UniteComposerForces,
} from "../../core/composerForces.types";
import { angleCap, angleSommetPetit, deviation, intensiteAvecTheta, intensiteRadians, intensiteResultante, triangleUtile } from "../../moteur/modeleComposerForces";

/**
 * Générateur de « Composer deux forces ou deux vitesses » (gen80). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - intensités entières, petit / grand entre 0,3 et 0,8 (sens direct) ou entre 0,25 et 0,65 (cap) :
 *   le parallélogramme reste lisible et la vitesse propre l'emporte toujours sur le courant / le vent ;
 * - angle (θ, ou β pour le cap) multiple de 5°, aigu dans [35° ; 75°] ou obtus dans [105° ; 145°] —
 *   jamais droit ni proche de 90° : les vecteurs perpendiculaires (Pythagore suffit) ne sont pas
 *   tirés, et le piège « θ au lieu de 180° − θ » donne toujours un résultat nettement faux ;
 * - les erreurs classiques (θ dans Al-Kashi, calculatrice en radians, angle avec l'autre vecteur)
 *   tombent toujours HORS de la tolérance de 1 % : elles sont toujours refusées ;
 * - cap : angle de correction γ ≥ 5° et angle en P ≥ 10° (triangle jamais aplati).
 * Le « cap à prendre » n'existe que pour des vitesses (bateau, avion).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

interface DonneesSituation {
  unite: UniteComposerForces;
  /** Plage du grand vecteur et pas (les intensités sont des multiples du pas). */
  grand: [number, number];
  pas: number;
}

const SITUATIONS: Record<SituationComposerForces, DonneesSituation> = {
  bateau: { unite: "nœuds", grand: [8, 20], pas: 1 },
  avion: { unite: "km/h", grand: [150, 320], pas: 10 },
  remorqueurs: { unite: "kN", grand: [40, 150], pas: 5 },
  charge: { unite: "N", grand: [150, 600], pas: 10 },
};

export const SITUATIONS_DIRECTES: SituationComposerForces[] = ["bateau", "avion", "remorqueurs", "charge"];
export const SITUATIONS_CAP: SituationComposerForces[] = ["bateau", "avion"];

const ANGLES_AIGUS = [35, 40, 45, 50, 55, 60, 65, 70, 75];
const ANGLES_OBTUS = [105, 110, 115, 120, 125, 130, 135, 140, 145];

/** Tolérance de la vérification (max(0,05 ; 1 %)) avec une marge ×1,5 : une erreur classique ne
 * doit jamais tomber dedans. */
function confondus(u: number, v: number): boolean {
  return Math.abs(u - v) <= 1.5 * Math.max(0.05, Math.abs(v) * 0.01);
}

function tirerIntensites(situation: SituationComposerForces, cap: boolean): [number, number] {
  const { grand, pas } = SITUATIONS[situation];
  const [rMin, rMax] = cap ? [0.25, 0.65] : [0.3, 0.8];
  for (;;) {
    const g = entier(grand[0] / pas, grand[1] / pas) * pas;
    const p = entier(Math.ceil((g * rMin) / pas), Math.floor((g * rMax) / pas)) * pas;
    if (p > 0 && p < g) return [g, p];
  }
}

function instanceValide(e: ExerciceComposerForces): boolean {
  if (e.question === "cap") {
    return angleCap(e) >= 5 && angleSommetPetit(e) >= 10 && !confondus(angleCap(e), e.angle);
  }
  const r = intensiteResultante(e);
  if (confondus(intensiteAvecTheta(e), r) || confondus(intensiteRadians(e), r)) return false;
  const a = deviation(e);
  return a >= 5 && !confondus(e.angle - a, a);
}

export interface OptionsComposerForces {
  situation?: SituationComposerForces;
  obtus?: boolean;
}

export function genererComposerForces(question: QuestionComposerForces, options: OptionsComposerForces = {}): ExerciceComposerForces {
  const cap = question === "cap";
  const situation = options.situation ?? choisir(cap ? SITUATIONS_CAP : SITUATIONS_DIRECTES);
  const obtus = options.obtus ?? Math.random() < 0.5;
  for (;;) {
    const [grand, petit] = tirerIntensites(situation, cap);
    const base: ExerciceComposerForces = {
      situation,
      question,
      unite: SITUATIONS[situation].unite,
      grand,
      petit,
      angle: choisir(obtus ? ANGLES_OBTUS : ANGLES_AIGUS),
      sommetGrand: Math.random() < 0.5 ? "A" : "B",
      ordreTriangles: [],
    };
    if (!instanceValide(base)) continue;
    const ordreTriangles: NomTriangle[] = melanger(["OAB", triangleUtile(base), "ABC"]);
    return { ...base, ordreTriangles };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: QuestionComposerForces; label: string }[] = [
  { id: "intensite", label: "Intensité de la résultante (Al-Kashi)" },
  { id: "direction", label: "Intensité et direction de la résultante" },
  { id: "cap", label: "Cap à prendre malgré le courant ou le vent (loi des sinus)" },
];

export function construireAvecVariante(id: string): ExerciceComposerForces {
  if (id === "intensite" || id === "direction" || id === "cap") return genererComposerForces(id);
  return genererExerciceComposerForces();
}

/** Tirage libre : intensité et direction une fois sur deux, intensité seule ou cap sinon. */
export function genererExerciceComposerForces(): ExerciceComposerForces {
  const r = Math.random();
  return genererComposerForces(r < 0.5 ? "direction" : r < 0.75 ? "intensite" : "cap");
}
