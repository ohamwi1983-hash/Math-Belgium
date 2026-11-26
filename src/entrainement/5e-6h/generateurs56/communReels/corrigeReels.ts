import type { LigneCalcul } from "../../../export/genererFeuilleExercices";
import { ligne } from "../../../export/corrigeTableau";
import { decomposer, decompositionL, estPremier } from "./outilsReels";

/**
 * Briques de corrigé « comme au tableau » communes aux générateurs 56gen14–56gen19 (sans `docx`).
 */

/** Décomposition par divisions successives : « 72 = 2·36 », « = 2·2·18 »… puis la forme regroupée. */
export function lignesDecomposition(N: number): LigneCalcul[] {
  const premiers: number[] = [];
  let reste = N;
  const L: LigneCalcul[] = [];
  while (reste > 1) {
    let p = 2;
    while (reste % p !== 0) p++;
    premiers.push(p);
    reste /= p;
    const membre = [...premiers, ...(reste > 1 ? [reste] : [])].join("\\cdot ");
    L.push(ligne(`${L.length === 0 ? `${N}` : ""}=${membre}`, reste > 1 ? `on divise ${reste * p} par ${p}${estPremier(reste) ? `, ${reste} est premier` : ""}` : `${p} est premier`));
    if (estPremier(reste)) break;
  }
  const regroupe = decompositionL(decomposer(N));
  const dernier = [...premiers, ...(reste > 1 ? [reste] : [])].join("\\cdot ");
  if (regroupe !== dernier) L.push(ligne(`=${regroupe}`, "on regroupe les facteurs égaux"));
  return L;
}
