import type { ExerciceConiqueC, Point } from "../../core6e/identificationConiques.types";
import { classifierConiqueCentree, elementsConiqueCentree } from "./classification";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C de `6gen58` : forme "racine isolée"
 * `v_isolee = k ± m·√(a2·v_racine²+a1·v_racine+a0)`, construite à l'envers depuis une ellipse ou une
 * hyperbole cible (mission).
 *
 * **Le signe `s` sous la racine EST le point diagnostique central** (mission) : l'expression
 * développée sous la racine est `s·(v_racine-h)² + c0` avec `c0=-s·r²` — `s=-1` donne
 * `r²-(v_racine-h)²` (ellipse), `s=+1` donne `(v_racine-h)²-r²` (hyperbole). Une fois élevée au
 * carré et réarrangée sous forme canonique `coeffX(x-h')²+coeffY(y-k')²=M`, la classification est
 * déléguée à `classification.ts` SANS branchement local dupliqué — même fonction que les familles
 * A/B (`classifierConiqueCentree`), preuve que la forme canonique commune absorbe bien les 3
 * familles (voir en-tête `classification.ts`).
 *
 * `m` JAMAIS égal à 1 (sinon cercle, hors du choix {ellipse,hyperbole} de l'écran 3) — tiré parmi
 * des fractions simples `mNum/mDen`, `r` toujours multiple de `mDen` pour que `m·r` reste un entier
 * (valeurs "propres", CLAUDE.md). `m<1` ou `m>1` (mélange des 2, tirage équiprobable) fait varier
 * l'axe de l'ellipse (voir `classifierConiqueCentree`) ; l'axe de l'hyperbole, lui, est TOUJOURS
 * `variableRacine` quel que soit `m` (démontré dans l'en-tête de `familleC.test.ts`) — c'est donc la
 * variable sous la racine (x ou y, tirée équiprobable) qui couvre les 2 orientations d'hyperbole.
 */

const FRACTIONS_M: { num: number; den: number }[] = [
  { num: 1, den: 3 },
  { num: 1, den: 2 },
  { num: 2, den: 3 },
  { num: 3, den: 2 },
  { num: 2, den: 1 },
  { num: 3, den: 1 },
];

const FRACTIONS_M_PETITES = FRACTIONS_M.filter((f) => f.num < f.den);
const FRACTIONS_M_GRANDES = FRACTIONS_M.filter((f) => f.num > f.den);

export interface OverridesFamilleC {
  variableRacine?: "x" | "y";
  /** `-1` force la branche ellipse, `+1` force la branche hyperbole (voir en-tête de fichier). */
  s?: -1 | 1;
  /** `"petit"` force `m<1`, `"grand"` force `m>1` — seul levier qui fait varier l'axe d'une ellipse
   * (l'axe d'une hyperbole, lui, ne dépend que de `variableRacine`, jamais de `m` — voir en-tête).
   * Utilisé par `index.ts` (`CATALOGUE_VARIANTES`) pour forcer chacune des 4 combinaisons
   * ellipse/hyperbole × horizontal/vertical de façon déterministe. */
  mBucket?: "petit" | "grand";
}

export function construireFamilleC(overrides: OverridesFamilleC = {}): ExerciceConiqueC {
  const variableRacine = overrides.variableRacine ?? tirerParmi(["x", "y"] as const);
  const variableIsolee: "x" | "y" = variableRacine === "x" ? "y" : "x";
  const k = tirerEntier(-4, 4);
  const h = tirerEntier(-4, 4);
  const s = overrides.s ?? tirerParmi([-1, 1] as const);
  const bucket = overrides.mBucket ?? tirerParmi(["petit", "grand"] as const);
  const { num: mNum, den: mDen } = tirerParmi(bucket === "petit" ? FRACTIONS_M_PETITES : FRACTIONS_M_GRANDES);
  const m = mNum / mDen;
  const r = mDen * tirerEntier(2, 4);
  const signeRacine = tirerParmi([1, -1] as const);

  // Expression sous la racine développée : E(v) = s(v-h)² + c0 = a2 v² + a1 v + a0.
  const c0 = -s * r * r;
  const a2 = s;
  // `|| 0` normalise un éventuel `-0` JavaScript (h=0) en `0` propre — jamais affiché "-0".
  const a1 = -2 * s * h || 0;
  const a0 = s * h * h + c0;

  // Forme canonique coeffV(v_racine-h)² + coeffIsolee(v_isolee-k)² = M, obtenue en élevant au carré
  // puis réarrangeant : (v_isolee-k)² = m²(a2(v_racine-h)²+c0) ⟺ m²a2(v_racine-h)²-(v_isolee-k)²=-m²c0.
  const coeffV = m * m * s;
  const coeffIsolee = -1;
  const M = -m * m * c0;
  const coeffX = variableRacine === "x" ? coeffV : coeffIsolee;
  const coeffY = variableRacine === "x" ? coeffIsolee : coeffV;
  const centre: Point = variableRacine === "x" ? { x: h, y: k } : { x: k, y: h };

  const nature = classifierConiqueCentree(coeffX, coeffY, M, centre);
  const elements = elementsConiqueCentree(coeffX, coeffY, M, nature);

  return {
    famille: "C",
    variableRacine,
    variableIsolee,
    k,
    m,
    mNum,
    mDen,
    signeRacine,
    h,
    s,
    r,
    a2,
    a1,
    a0,
    c0,
    centre,
    coeffX,
    coeffY,
    M,
    nature,
    elements,
  };
}
