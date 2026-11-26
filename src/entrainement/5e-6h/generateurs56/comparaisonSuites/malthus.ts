import type { ContexteComparaisonSuites, ExerciceVillesCroissance } from "./core/comparaisonSuites.types";
import { construireFenetre, trouverSeuil } from "./simulation";
import { entierAleatoire, resoudrePeriode } from "./utils";

/**
 * 56gen11, variante « Malthus » AJOUTÉE EN FIN de catalogue (5e (6h), étape 8 : comparer une suite
 * arithmétique et une suite géométrique). Population géométrique (taux de 2 à 4 % par an) contre
 * nombre de personnes que l'agriculture peut nourrir, arithmétique (croissance constante) : l'année de
 * bascule se trouve par la TABLE (jamais par logarithme). Même structure que la famille
 * `villesCroissance` (mêmes écrans, même corrigé, même papier), avec le contexte de Malthus et un
 * drapeau `malthus` pour la phrase d'introduction de l'énoncé.
 */

export const CONTEXTE_MALTHUS: ContexteComparaisonSuites = {
  id: "malthus",
  labelA: "Population",
  labelB: "Personnes nourries",
  nomA: "la population",
  nomB: "le nombre de personnes que l'agriculture peut nourrir",
  sujetA: "la population d'un pays",
  sujetB: "le nombre de personnes que son agriculture peut nourrir",
  unite: "milliers de personnes",
  periode: "an",
};

const N_MAX = 60;

export function construireMalthus(): ExerciceVillesCroissance {
  for (let essai = 0; essai < 4000; essai++) {
    const u1 = entierAleatoire(30, 90) * 100;
    const tauxPct = entierAleatoire(2, 4);
    const v1 = Math.round((u1 * entierAleatoire(130, 180)) / 1000) * 10;
    const d = Math.round((v1 * entierAleatoire(10, 25)) / 1000 / 10) * 10;
    if (d <= 0) continue;
    const uDeN = (n: number) => u1 * Math.pow(1 + tauxPct / 100, n - 1);
    const vDeN = (n: number) => v1 + (n - 1) * d;
    const nSeuil = trouverSeuil(uDeN, vDeN, "aDepasseB", N_MAX);
    if (nSeuil === null || nSeuil < 8 || nSeuil > 45) continue;
    const fenetre = construireFenetre(uDeN, vDeN, "aDepasseB", nSeuil, Math.max(u1, v1));
    if (fenetre === null) continue;
    const { anneeDepart, traductionValeur, uniteContexte } = resoudrePeriode(CONTEXTE_MALTHUS, nSeuil);
    return {
      famille: "villesCroissance",
      condition: "aDepasseB",
      contexte: CONTEXTE_MALTHUS,
      u1,
      tauxPct,
      v1,
      d,
      anneeDepart,
      nSeuil,
      ...fenetre,
      traductionValeur,
      uniteContexte,
      malthus: true,
    };
  }
  throw new Error("construireMalthus : aucune instance valide");
}
