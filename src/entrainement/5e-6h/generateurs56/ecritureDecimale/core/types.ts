import type { Developpement, LigneDivision } from "./decimales";

/**
 * `56gen16` — « Écriture décimale et fraction » (5e (6h), « Nombres réels et suites », étape 2
 * « ecritures-decimales », processus 2 APPLIQUER). Trois variantes : écrire une fraction en décimal
 * (division posée, longueur de la période, borne n − 1 par les restes) ; écriture périodique → fraction
 * irréductible (10ᵏ⁺ᵖx − 10ᵏx) ; limitée ou périodique selon le dénominateur irréductible (verdict tiré
 * à parts égales AVANT la fraction).
 */

export type VarianteDecimale = "diviser" | "versFraction" | "critere";
export type VerdictCritere = "limitee" | "periodique";

export interface ExerciceDecimale {
  variante: VarianteDecimale;
  /** Fraction irréductible (valeur du nombre étudié). */
  num: number;
  den: number;
  /** Développement décimal (période minimale). */
  dev: Developpement;
  /** Division posée (variante « diviser »). */
  lignesDivision: LigneDivision[];
  resteRepete: number | null;
  /** « critere » : fraction donnée (réductible) et facteur commun g, verdict. */
  numDonne: number;
  denDonne: number;
  g: number;
  verdict: VerdictCritere | null;
  /** « versFraction » : exposants k (chiffres avant la période) et k + p ; options du premier écran
   * (paires d'exposants, ordre fixe croissant) ; période « 9 » (le nombre est un décimal limité). */
  k: number;
  p: number;
  paires: [number, number][];
  neuf: boolean;
}

export type PhaseDecimale = "ecriture" | "longueur" | "borne" | "puissances" | "difference" | "fraction" | "simplifier" | "denominateur" | "verdict";

export const PHASES_PAR_VARIANTE: Record<VarianteDecimale, PhaseDecimale[]> = {
  diviser: ["ecriture", "longueur", "borne"],
  versFraction: ["puissances", "difference", "fraction"],
  critere: ["simplifier", "denominateur", "verdict"],
};
