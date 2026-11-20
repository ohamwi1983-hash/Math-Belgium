import type { CasInequation, ExerciceInequationTrigo, FonctionTrig, Symbole, ValeurExacte, VarianteInequation } from "../../core5e/inequationsTrigo";
import { arcCanonique, estStrict, estSup, inverser, solutionsX } from "../../core5e/inequationsTrigo";
import { q, qAdd, qMul, qVal } from "../../ui5e/nombresTrigo";
import type { Q } from "../../ui5e/nombresTrigo";

export type IdVarianteInequation = VarianteInequation;

/**
 * Couche A — générateur de `5gen55` « Inéquations trigonométriques ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Ordre : fonction (sin / cos) et symbole tirés d'abord (lisibles dans
 * l'énoncé, jamais un verdict) ; cas particulier « toujours vraie / toujours fausse » (|m| > 1,
 * décision de l'utilisateur : cas particulier) avec une probabilité de 12 % ; sinon m remarquable
 * (0, ±1/2, ±√2/2, ±√3/2), a ∈ {2 ; 3} (60/40), b ∈ {0 ; ±π/6 ; ±π/4 ; ±π/3 ; ±π/2}.
 * « directe » : trig(ax + b) ◇ m ; « isoler » : k·trig(ax + b) + d ◇ e (k = 2, 3, −2 ou −1 : le sens
 * change pour k < 0, piège du cours).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

const SYMBOLES: Symbole[] = ["ge", "gt", "le", "lt"];
const M_REMARQUABLES: ValeurExacte[] = [
  { num: q(0), rad: 1 },
  { num: q(1, 2), rad: 1 },
  { num: q(-1, 2), rad: 1 },
  { num: q(1, 2), rad: 2 },
  { num: q(-1, 2), rad: 2 },
  { num: q(1, 2), rad: 3 },
  { num: q(-1, 2), rad: 3 },
];
const B_PI: Q[] = [q(0), q(1, 6), q(-1, 6), q(1, 4), q(-1, 4), q(1, 3), q(-1, 3), q(1, 2), q(-1, 2)];

export const PART_CAS_PARTICULIER = 0.12;

function construire(variante: VarianteInequation, cas: CasInequation | null | "auto"): ExerciceInequationTrigo {
  const fonction: FonctionTrig = Math.random() < 0.5 ? "sin" : "cos";
  const symboleAffiche = parmi(SYMBOLES);
  const casTire: CasInequation | null = cas === "auto" ? (Math.random() < PART_CAS_PARTICULIER ? (Math.random() < 0.5 ? "toujoursVraie" : "toujoursFausse") : null) : cas;
  for (;;) {
    const a = Math.random() < 0.6 ? 2 : 3;
    const bPi = parmi(B_PI);
    const k = variante === "directe" ? 1 : parmi([2, 3, -2, -1]);
    const inversion = k < 0;
    const symbole = inversion ? inverser(symboleAffiche) : symboleAffiche;
    let m: ValeurExacte;
    if (casTire) {
      // |m| > 1 : sin u ≥ −3/2 toujours vraie, sin u ≥ 3/2 toujours fausse…
      const grand = parmi([q(3, 2), q(2)]);
      const positif = (casTire === "toujoursVraie") !== estSup(symbole);
      m = { num: positif ? grand : q(-grand.n, grand.d), rad: 1 };
    } else m = parmi(M_REMARQUABLES);
    // Affichage : k·trig(u) + d ◇ e ; e = k·m + d.
    let d = q(0);
    if (variante === "isoler" && m.rad === 1 && m.num.n !== 0 && Math.random() < 0.6) d = q(-k * m.num.n, m.num.d); // second membre nul
    const e: ValeurExacte = m.rad === 1 ? { num: qAdd(qMul(q(k), m.num), d), rad: 1 } : { num: qMul(q(k), m.num), rad: m.rad };
    if (casTire) {
      return { variante, fonction, a, bPi, k, d, e, symboleAffiche, symbole, m, inversion, cas: casTire, arcU: null, xg: null, xd: null, periode: q(2, a), intervalles: [], cleCollecteur: `${variante}/${fonction}/${casTire}` };
    }
    const arc = arcCanonique(fonction, symbole, m);
    const sol = solutionsX(a, bPi, arc, estStrict(symbole));
    if (!sol || sol.intervalles.length === 0) continue;
    return {
      variante,
      fonction,
      a,
      bPi,
      k,
      d,
      e,
      symboleAffiche,
      symbole,
      m,
      inversion,
      cas: null,
      arcU: arc,
      xg: sol.xg,
      xd: sol.xd,
      periode: sol.periode,
      intervalles: sol.intervalles,
      cleCollecteur: `${variante}/${fonction}-${symbole}/a${a}/${sol.intervalles.length}int${qVal(bPi) === 0 ? "/b0" : ""}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteInequation; label: string }[] = [
  { id: "directe", label: "sin(ax + b) ou cos(ax + b) comparé à une valeur" },
  { id: "isoler", label: "Avec un coefficient à isoler (k·sin(ax + b) + d ◇ e)" },
];

export function construireAvecVarianteId(id: IdVarianteInequation): ExerciceInequationTrigo {
  return construire(id, "auto");
}

/** Pour les mesures : forcer (ou interdire) le cas particulier. */
export function construireAvecCas(id: IdVarianteInequation, cas: CasInequation | null): ExerciceInequationTrigo {
  return construire(id, cas);
}

export function genererExerciceInequationTrigo(): ExerciceInequationTrigo {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
