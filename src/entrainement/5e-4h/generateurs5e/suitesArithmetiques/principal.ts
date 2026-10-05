/**
 * Couche A (5e) — famille "principal" de 5gen14 : pipeline u1/r à 5 combinaisons de départ
 * ("2 données → le reste", même architecture que 5gen6 — `tirerU1EtR` choisit TOUJOURS u1/r en
 * premier, "cible d'abord", puis chaque combo dérive les données montrées à l'élève depuis cette
 * vérité terrain, jamais l'inverse).
 */
import type { ComboSuiteArithmetique, DonneesSuiteArithmetique, ExercicePrincipalSuiteArithmetique } from "../../core5e/suitesArithmetiques.types";
import { sommeArithmetique, termeArithmetique, tirerU1EtR } from "./parametres";

export const CATALOGUE_COMBOS: { id: ComboSuiteArithmetique; label: string }[] = [
  { id: "direct", label: "u1 et r donnés directement" },
  { id: "u1_up", label: "u1 et un terme up" },
  { id: "r_up", label: "r et un terme up" },
  { id: "up_uq", label: "Deux termes up et uq" },
  { id: "un_sn", label: "Un terme un et la somme Sn au même indice" },
];

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Indice p!=1 pour les combos u1_up/r_up (donner u_1 nommément "up" n'aurait pas de sens, u1 est
 * déjà connu par ailleurs dans ces 2 combos) — exportée : réutilisée telle quelle par
 * `algebrique.ts` (Couche A → Couche A, famille "algebriqueTermeGeneral"). */
export function tirerIndicePDistinctDe1(): number {
  return entierAleatoire(2, 14);
}

function donneesPourCombo(combo: ComboSuiteArithmetique, u1: number, r: number): DonneesSuiteArithmetique {
  switch (combo) {
    case "direct":
      return { combo: "direct" };
    case "u1_up": {
      const p = tirerIndicePDistinctDe1();
      return { combo: "u1_up", up: { indice: p, valeur: termeArithmetique(u1, r, p) } };
    }
    case "r_up": {
      const p = tirerIndicePDistinctDe1();
      return { combo: "r_up", up: { indice: p, valeur: termeArithmetique(u1, r, p) } };
    }
    case "up_uq": {
      // Ni p ni q nécessairement != 1 pour ce combo (spec explicite) — 2 indices distincts
      // quelconques dans [1,15].
      let p = entierAleatoire(1, 15);
      let q = entierAleatoire(1, 15);
      while (q === p) q = entierAleatoire(1, 15);
      return {
        combo: "up_uq",
        up: { indice: p, valeur: termeArithmetique(u1, r, p) },
        uq: { indice: q, valeur: termeArithmetique(u1, r, q) },
      };
    }
    case "un_sn": {
      const n = entierAleatoire(3, 15);
      return {
        combo: "un_sn",
        un: { indice: n, valeur: termeArithmetique(u1, r, n) },
        sn: sommeArithmetique(u1, r, n),
      };
    }
  }
}

function tirerIndicesTermesProches(): [number, number, number, number] {
  const n0 = entierAleatoire(2, 10);
  return [n0, n0 + 1, n0 + 2, n0 + 3];
}

export function construireAvecComboId(combo: ComboSuiteArithmetique): ExercicePrincipalSuiteArithmetique {
  const { u1, r } = tirerU1EtR();
  return {
    famille: "principal",
    base: { u1, r },
    donnees: donneesPourCombo(combo, u1, r),
    indicesTermesProches: tirerIndicesTermesProches(),
    indiceTermeEloigne: entierAleatoire(50, 200),
    indiceSn: entierAleatoire(5, 25),
  };
}

export function genererExercicePrincipal(): ExercicePrincipalSuiteArithmetique {
  const combo = CATALOGUE_COMBOS[Math.floor(Math.random() * CATALOGUE_COMBOS.length)].id;
  return construireAvecComboId(combo);
}
