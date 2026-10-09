import type { ConiqueCentree, ExerciceTangenteC } from "../../core6e/tangentesConique.types";
import { classifierConiqueCentree, tirerTripletCanonique } from "../identificationConiques/classification";
import { resoudreTangentesDepuisPoint } from "./algebreTangente";
import { tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération famille C ("tangentes depuis un point extérieur"), `6gen62`. ELLIPSE
 * UNIQUEMENT (voir `core6e/tangentesConique.types.ts`, en-tête, pour la justification).
 *
 * Réutilise `tirerTripletCanonique`/`classifierConiqueCentree` (6gen58) pour l'ellipse — les
 * "demi-axes" exacts (`semiX=√(M/coeffX)`, `semiY=√(M/coeffY)`) sont recalculés localement (2
 * lignes, jamais dupliqué depuis `elementsConiqueCentree` qui renomme `a`=max/`b`=min sans
 * distinguer x/y, inutile ici où seule l'échelle par AXE compte pour choisir un point).
 *
 * **Point intérieur, toujours garanti** : `x0,y0∈{-1,0,1}` (au moins un non nul) — comme
 * `semiX,semiY≥2` (bornes de `tirerTripletCanonique`), `x0²/semiX²+y0²/semiY²≤1/4+1/4<1` TOUJOURS.
 * **Point extérieur, toujours garanti** : `x0=±2ou3·semiX`, `y0=±2ou3·semiY` — chaque terme ≥4.
 * Dans les deux cas, `a2=coeffY·(coeffX·x0²-M)` (`algebreTangente.ts`) ne peut jamais s'annuler
 * (nécessiterait `x0=±semiX`, jamais atteint par ces 2 constructions) — aucune garde de retirage
 * nécessaire, contrairement à famille A/B.
 */

function construireEllipse(): { conique: ConiqueCentree; semiX: number; semiY: number } {
  const categorie = tirerParmi(["ellipseHorizontal", "ellipseVertical"] as const);
  const { coeffX, coeffY, M } = tirerTripletCanonique(categorie);
  const nature = classifierConiqueCentree(coeffX, coeffY, M);
  const semiX = Math.round(Math.sqrt(M / coeffX));
  const semiY = Math.round(Math.sqrt(M / coeffY));
  return { conique: { coeffX, coeffY, M, nature }, semiX, semiY };
}

export interface OverridesFamilleC {
  aSolution?: boolean;
}

export function construireFamilleC(overrides: OverridesFamilleC = {}): ExerciceTangenteC {
  const aSolutionCible = overrides.aSolution ?? tirerParmi([true, false] as const);
  const { conique, semiX, semiY } = construireEllipse();

  let P: { x: number; y: number };
  if (aSolutionCible) {
    const facteur = tirerEntier(2, 3);
    P = { x: tirerSigne() * facteur * semiX, y: tirerSigne() * facteur * semiY };
  } else {
    let x0 = tirerSigne() * tirerEntier(0, 1);
    let y0 = tirerSigne() * tirerEntier(0, 1);
    if (x0 === 0 && y0 === 0) x0 = tirerSigne(); // évite le centre exact (toujours valide, mais pour un peu de variété)
    P = { x: x0, y: y0 };
  }

  const resultat = resoudreTangentesDepuisPoint(conique, P);
  if (resultat.aSolution !== aSolutionCible) {
    // Garde de robustesse théorique (ne devrait jamais se produire, voir en-tête) — retirage complet.
    return construireFamilleC(overrides);
  }

  return { famille: "C", conique, P, aSolution: resultat.aSolution, tangentes: resultat.tangentes };
}
