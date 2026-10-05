import type { ExerciceEpargneCroissance } from "../../core5e/comparaisonSuites.types";
import { basculeExactementA, trouverSeuil } from "./simulation";
import { entierAleatoire, resoudrePeriode, tirerContexte } from "./utils";

const TENTATIVES_MAX = 300;
const N_MAX_SIMULATION = 40;

/** Côté A (géométrique, taux élevé, valeur initiale plus faible) vs côté B (géométrique, taux plus
 * faible, valeur initiale plus élevée) — A finit toujours par dépasser B. Contexte tiré une seule
 * fois par exercice, dans le bassin partagé filtré aux branches où il est narrativement cohérent. */
export function construireEpargneCroissance(): ExerciceEpargneCroissance {
  const contexte = tirerContexte("epargneCroissance");
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const u1 = entierAleatoire(500, 2000);
    const r1Pct = entierAleatoire(8, 15);
    const v1 = u1 + entierAleatoire(1000, 5000);
    const r2Pct = entierAleatoire(2, 6);

    const uDeN = (n: number) => u1 * Math.pow(1 + r1Pct / 100, n - 1);
    const vDeN = (n: number) => v1 * Math.pow(1 + r2Pct / 100, n - 1);

    const nSeuil = trouverSeuil(uDeN, vDeN, "uGeV", N_MAX_SIMULATION);
    if (nSeuil === null || nSeuil < 3 || nSeuil > 25) continue;
    if (!basculeExactementA(uDeN, vDeN, "uGeV", nSeuil)) continue;

    const nTable: [number, number, number] = [nSeuil - 1, nSeuil, nSeuil + 1];
    const { anneeDepart, traductionValeur, uniteContexte } = resoudrePeriode(contexte, nSeuil);
    return {
      famille: "epargneCroissance",
      condition: "uGeV",
      contexte,
      u1,
      r1Pct,
      v1,
      r2Pct,
      anneeDepart,
      nSeuil,
      nTable,
      uTable: [uDeN(nTable[0]), uDeN(nTable[1]), uDeN(nTable[2])],
      vTable: [vDeN(nTable[0]), vDeN(nTable[1]), vDeN(nTable[2])],
      traductionValeur,
      uniteContexte,
    };
  }
  throw new Error("construireEpargneCroissance : aucune instance valide trouvée après " + TENTATIVES_MAX + " tentatives");
}
