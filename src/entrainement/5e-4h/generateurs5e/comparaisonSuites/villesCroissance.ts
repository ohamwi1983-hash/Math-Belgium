import type { ExerciceVillesCroissance } from "../../core5e/comparaisonSuites.types";
import { construireFenetre, trouverSeuil } from "./simulation";
import { entierAleatoire, resoudrePeriode, tirerContexte } from "./utils";

const TENTATIVES_MAX = 2000;
const N_MAX_SIMULATION = 40;

/** Côté A (géométrique, taux de croissance élevé, valeur de départ plus faible) vs côté B
 * (arithmétique, croissance linéaire) — A finit toujours par dépasser B. Retry borné jusqu'à obtenir
 * un seuil dans [3,20] et une fenêtre de tableau valide (`construireFenetre` : bascule visible sur
 * les valeurs arrondies, valeurs réalistes). Contexte tiré une seule fois par exercice, dans le
 * bassin partagé filtré aux branches où il est narrativement cohérent. */
export function construireVillesCroissance(): ExerciceVillesCroissance {
  const contexte = tirerContexte("villesCroissance");
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const u1 = entierAleatoire(500, 2000);
    const tauxPct = entierAleatoire(8, 20);
    const v1 = u1 + entierAleatoire(500, 3000);
    const d = entierAleatoire(50, 300);

    const uDeN = (n: number) => u1 * Math.pow(1 + tauxPct / 100, n - 1);
    const vDeN = (n: number) => v1 + (n - 1) * d;

    const nSeuil = trouverSeuil(uDeN, vDeN, "aDepasseB", N_MAX_SIMULATION);
    if (nSeuil === null || nSeuil < 3 || nSeuil > 20) continue;
    const fenetre = construireFenetre(uDeN, vDeN, "aDepasseB", nSeuil, Math.max(u1, v1));
    if (fenetre === null) continue;
    const { nTable, uTable, vTable } = fenetre;
    const { anneeDepart, traductionValeur, uniteContexte } = resoudrePeriode(contexte, nSeuil);
    return {
      famille: "villesCroissance",
      condition: "aDepasseB",
      contexte,
      u1,
      tauxPct,
      v1,
      d,
      anneeDepart,
      nSeuil,
      nTable,
      uTable,
      vTable,
      traductionValeur,
      uniteContexte,
    };
  }
  throw new Error("construireVillesCroissance : aucune instance valide trouvée après " + TENTATIVES_MAX + " tentatives");
}
