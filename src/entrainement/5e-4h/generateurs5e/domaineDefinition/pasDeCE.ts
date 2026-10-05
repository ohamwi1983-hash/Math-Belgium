import type { ExercicePasDeCE, RaisonPasDeCE } from "../../core5e/domaineDefinition.types";
import { choisirParmi, entierAleatoire, entierNonNulAleatoire } from "./aleatoire";
import { formatPolynomeLatex, polynomeLineaire } from "./polynome";

const RAISONS: RaisonPasDeCE[] = ["racineImpaire", "valeurAbsolue"];
const INDICES_IMPAIRS = [3, 5];

const DOMF_REEL = { forme: "reel" as const, points: [], morceaux: [] };

function argumentAleatoire(): string {
  const a = entierNonNulAleatoire(1, 3);
  const b = entierAleatoire(-9, 9);
  return formatPolynomeLatex(polynomeLineaire(a, b));
}

export function construirePasDeCE(raison: RaisonPasDeCE): ExercicePasDeCE {
  const arg = argumentAleatoire();
  const fLatex = raison === "racineImpaire" ? `f(x) = \\sqrt[${choisirParmi(INDICES_IMPAIRS)}]{${arg}}` : `f(x) = |${arg}|`;
  return { famille: "pasDeCE", raison, fLatex, argumentLatex: arg, domf: DOMF_REEL, aucuneCE: true };
}

export function genererExercicePasDeCE(): ExercicePasDeCE {
  return construirePasDeCE(choisirParmi(RAISONS));
}
