import type { ExerciceTangenteA, ExerciceTangenteA_Centree, ExerciceTangenteA_Parabole } from "../../core6e/tangentesConique.types";
import { classifierConiqueCentree, classifierUnSeulCarre } from "../identificationConiques/classification";
import { tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération famille A ("tangente en un point donné, sur la conique"), `6gen62`.
 *
 * **Construction "point d'abord"** : plutôt que tirer une conique puis chercher un point dessus
 * (généralement irrationnel), le point ENTIER `P=(x0,y0)` est choisi EN PREMIER, et la conique est
 * construite APRÈS pour passer exactement par lui (`M=coeffX·x0²+coeffY·y0²` pour le cas centré) —
 * garantit un point de tangence entier ET une conique par construction valide, jamais une recherche
 * après-coup. `classifierConiqueCentree` (6gen58, `identificationConiques/classification.ts`) est
 * réutilisée TELLE QUELLE pour produire le champ `nature` à partir de `coeffX`/`coeffY`/`M` déjà
 * connus — même fonction que celle utilisée par tout le chapitre pour classifier une conique.
 */

const CONIQUE_MIN = 1;
const CONIQUE_MAX = 5;
const POINT_MIN = 1;
const POINT_MAX = 4;

function construireCentree(natureCible: "ellipse" | "hyperbole"): ExerciceTangenteA_Centree {
  for (let essai = 0; essai < 30; essai++) {
    let coeffX: number;
    let coeffY: number;
    if (natureCible === "ellipse") {
      coeffX = tirerEntier(CONIQUE_MIN, CONIQUE_MAX);
      do {
        coeffY = tirerEntier(CONIQUE_MIN, CONIQUE_MAX);
      } while (coeffY === coeffX); // évite le cercle (dégénérescence hors périmètre)
    } else {
      coeffX = tirerEntier(CONIQUE_MIN, CONIQUE_MAX);
      coeffY = -tirerEntier(CONIQUE_MIN, CONIQUE_MAX);
    }
    const x0 = tirerSigne() * tirerEntier(POINT_MIN, POINT_MAX);
    const y0 = tirerSigne() * tirerEntier(POINT_MIN, POINT_MAX);
    const M = coeffX * x0 * x0 + coeffY * y0 * y0;
    if (M === 0) continue; // dégénérescence (point/droites sécantes) — hors périmètre, retirer.
    const nature = classifierConiqueCentree(coeffX, coeffY, M);
    if (nature.type !== natureCible) continue; // garde de robustesse (ex. cercle accidentel)
    return { famille: "A", typeConique: "centree", conique: { coeffX, coeffY, M, nature }, P: { x: x0, y: y0 }, valeurConfirmation: M };
  }
  throw new Error(`construireCentree (famille A) : impossible de construire une ${natureCible} après 30 essais`);
}

function construireParabole(axe: "horizontal" | "vertical"): ExerciceTangenteA_Parabole {
  const p = tirerSigne() * tirerEntier(1, 4);
  const t = tirerSigne() * tirerEntier(1, 3);
  const P = axe === "horizontal" ? { x: p * t * t, y: 2 * p * t } : { x: 2 * p * t, y: p * t * t };
  const valeurConfirmation = axe === "horizontal" ? P.y * P.y : P.x * P.x;
  // Nature via `classifierUnSeulCarre` (6gen58) — même fondation que le reste du chapitre :
  // y²-4px=0 (horizontal, variableCarre="y") / x²-4py=0 (vertical, variableCarre="x").
  const nature = axe === "horizontal" ? classifierUnSeulCarre(1, "y", -4 * p, false) : classifierUnSeulCarre(1, "x", -4 * p, false);
  return { famille: "A", typeConique: "parabole", conique: { axe, p, nature }, P, valeurConfirmation };
}

export interface OverridesFamilleA {
  typeConique?: "centree" | "parabole";
  natureCible?: "ellipse" | "hyperbole";
  axe?: "horizontal" | "vertical";
}

export function construireFamilleA(overrides: OverridesFamilleA = {}): ExerciceTangenteA {
  const typeConique = overrides.typeConique ?? tirerParmi(["centree", "parabole"] as const);
  if (typeConique === "centree") {
    const natureCible = overrides.natureCible ?? tirerParmi(["ellipse", "hyperbole"] as const);
    return construireCentree(natureCible);
  }
  const axe = overrides.axe ?? tirerParmi(["horizontal", "vertical"] as const);
  return construireParabole(axe);
}
