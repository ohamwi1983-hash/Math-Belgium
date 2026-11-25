import type { EquationTable, ExerciceLoiNormale, ExerciceLoiNormaleC, ExerciceLoiNormaleD, ExerciceLoiNormaleE } from "../core6e/loiNormale.types";
import { arrondir, bornesZ, formeAttendue, probabilitesDirectes, proportionsRegle, tAcceptes } from "../generateurs6e/loiNormale/calculs";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { entier, valeurArrondie, valeurParmi } from "./saisieVariablesAleatoires";
import { phasesPourExercice } from "./typesLoiNormale";
import type { PhaseLoiNormale } from "./typesLoiNormale";

/**
 * Vérification de `6gen51` (audit, G13, G16) — calée sur la TABLE : probabilité = lecture de table
 * (z au centième, Φ à 4 décimales) OU valeur de la calculatrice, arrondie à 10⁻⁴ (consigne) ; lecture
 * inverse : les valeurs de t voisines dans la table (deux si la cible tombe entre deux cases, toutes
 * celles de même case en queue de table) ; effectif : arrondi de N × p pour l'une ou l'autre p, ou
 * l'entier voisin ; règle empirique : pourcentages du cours (68,3 / 95,4 / 99,7 %) ou valeur exacte.
 */

export function equationJusteDe(e: ExerciceLoiNormaleC | ExerciceLoiNormaleD): EquationTable {
  return e.equations.find((q) => q.id === e.bonne)!;
}

/** z acceptés (C : t ; D : z) et valeur de la calculatrice. */
export function zAcceptes(e: ExerciceLoiNormaleC | ExerciceLoiNormaleD): { exactes: number[]; calculatrice: number } {
  return tAcceptes(equationJusteDe(e));
}

export function aAcceptes(e: ExerciceLoiNormaleD): { exactes: number[]; calculatrice: number } {
  const { exactes, calculatrice } = zAcceptes(e);
  const as = exactes.flatMap((z) => {
    const a = arrondir(e.mu + z * e.sigma, 4);
    return [a, arrondir(a, 1)];
  });
  return { exactes: [...new Set(as)], calculatrice: e.mu + calculatrice * e.sigma };
}

export function probabilitesAcceptees(e: ExerciceLoiNormale): number[] {
  if (e.famille === "A") return probabilitesDirectes(e.sousType, e.z1, e.z2);
  if (e.famille === "B") {
    const { z1, z2 } = bornesZ(e);
    return probabilitesDirectes(e.sousType, z1, z2);
  }
  if (e.famille === "E") return proportionsRegle(e.k, e.unCote);
  return [];
}

function effectifsAcceptes(population: number, ps: number[]): number[] {
  const r = new Set<number>();
  for (const p of ps) {
    const x = population * p;
    r.add(Math.floor(x));
    r.add(Math.ceil(x));
  }
  return [...r];
}

export function effectifReference(e: ExerciceLoiNormale): number {
  const ps = probabilitesAcceptees(e);
  const pop = e.famille === "B" || e.famille === "E" ? (e.population ?? 0) : 0;
  return Math.round(pop * ps[0]);
}

export function kE(e: ExerciceLoiNormaleE): number {
  return e.k;
}

export function attentesLoiNormale(e: ExerciceLoiNormale, p: PhaseLoiNormale): Attente[] {
  switch (e.famille) {
    case "A":
      return p === "aForme" ? [{ choix: formeAttendue(e.sousType, e.z1, e.z2) }] : [valeurArrondie(probabilitesAcceptees(e), { decimales: 4 })];
    case "B": {
      const { z1, z2 } = bornesZ(e);
      if (p === "bZ") return z2 === null ? [valeurArrondie(z1, { decimales: 2 })] : [valeurArrondie(z1, { decimales: 2 }), valeurArrondie(z2, { decimales: 2 })];
      if (p === "bForme") return [{ choix: formeAttendue(e.sousType, z1, z2) }];
      if (p === "bProba") return [valeurArrondie(probabilitesAcceptees(e), { decimales: 4 })];
      return [entier(effectifsAcceptes(e.population ?? 0, probabilitesAcceptees(e)))];
    }
    case "C":
    case "D": {
      if (p === "cEquation" || p === "dEquation") return [{ choix: e.bonne }];
      if (p === "cT" || p === "dZ") {
        const { exactes, calculatrice } = zAcceptes(e);
        return [valeurParmi(exactes, 2, [calculatrice])];
      }
      const { exactes, calculatrice } = aAcceptes(e as ExerciceLoiNormaleD);
      return [valeurParmi(exactes, 1, [calculatrice])];
    }
    case "E":
      if (p === "eK") return [entier(e.k)];
      if (p === "eProportion") return [valeurArrondie(probabilitesAcceptees(e), { decimales: 3 })];
      return [entier(effectifsAcceptes(e.population ?? 0, probabilitesAcceptees(e)))];
  }
}

export const DEFINITION_6GEN51: DefinitionSession<ExerciceLoiNormale, PhaseLoiNormale> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "aForme" || p === "bForme" || p === "cEquation" || p === "dEquation",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesLoiNormale(e, p), valeurs),
};
