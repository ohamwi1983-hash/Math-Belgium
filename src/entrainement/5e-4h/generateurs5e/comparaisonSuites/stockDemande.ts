import type { ExerciceStockDemande } from "../../core5e/comparaisonSuites.types";
import { basculeExactementA, trouverSeuil } from "./simulation";
import { entierAleatoire, resoudrePeriode, tirerContexte } from "./utils";

const TENTATIVES_MAX = 300;
const N_MAX_SIMULATION = 40;

/** Côté A (arithmétique décroissant) vs côté B (arithmétique croissant) — B finit toujours par
 * dépasser A. Contexte tiré une seule fois par exercice, dans le bassin partagé filtré aux branches
 * où il est narrativement cohérent. */
export function construireStockDemande(): ExerciceStockDemande {
  const contexte = tirerContexte("stockDemande");
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const u1 = entierAleatoire(800, 3000);
    const d1 = entierAleatoire(10, 80);
    const v1 = entierAleatoire(50, u1 - 200);
    const d2 = entierAleatoire(5, 50);

    const uDeN = (n: number) => u1 - (n - 1) * d1;
    const vDeN = (n: number) => v1 + (n - 1) * d2;

    const nSeuil = trouverSeuil(uDeN, vDeN, "vGeU", N_MAX_SIMULATION);
    if (nSeuil === null || nSeuil < 3 || nSeuil > 25) continue;
    if (!basculeExactementA(uDeN, vDeN, "vGeU", nSeuil)) continue;

    const nTable: [number, number, number] = [nSeuil - 1, nSeuil, nSeuil + 1];
    const { anneeDepart, traductionValeur, uniteContexte } = resoudrePeriode(contexte, nSeuil);
    return {
      famille: "stockDemande",
      condition: "vGeU",
      contexte,
      u1,
      d1,
      v1,
      d2,
      anneeDepart,
      nSeuil,
      nTable,
      uTable: [uDeN(nTable[0]), uDeN(nTable[1]), uDeN(nTable[2])],
      vTable: [vDeN(nTable[0]), vDeN(nTable[1]), vDeN(nTable[2])],
      traductionValeur,
      uniteContexte,
    };
  }
  throw new Error("construireStockDemande : aucune instance valide trouvée après " + TENTATIVES_MAX + " tentatives");
}
