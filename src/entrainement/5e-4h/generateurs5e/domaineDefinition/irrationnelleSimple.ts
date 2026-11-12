import type { ExerciceIrrationnelleSimple, SlotCE } from "../../core5e/domaineDefinition.types";
import { deuxEntiersDistincts, entierAleatoire, entierNonNulAleatoire } from "./aleatoire";
import { formatPolynomeLatex, polynomeLineaire, polynomeQuadratiqueDepuisRacines } from "./polynome";
import { resoudreLineaireSigne, resoudreQuadratiqueSigne } from "./resolutionSigne";

/** Coefficient/signe extérieur au radical, n'affecte jamais le domaine (spec, famille 2). */
function fLatexIrrationnelleSimple(radicandeLatex: string): string {
  if (Math.random() < 0.5) return `f(x) = \\sqrt{${radicandeLatex}}`;
  const k = entierNonNulAleatoire(2, 4) * (Math.random() < 0.5 ? -1 : 1);
  return `f(x) = ${k}\\sqrt{${radicandeLatex}}`;
}

/** Coefficient de x tiré dans [−3 ; 3]∖{0} (audit 5e ch. 1, point 7) : avec a < 0, le sens de
 * l'inégalité change (« −2x + 6 ≥ 0 ⇔ x ≤ 3 »), le piège classique de cette résolution. */
function construireLineaire(signeForce?: 1 | -1): ExerciceIrrationnelleSimple {
  const a = signeForce === undefined ? entierNonNulAleatoire(-3, 3) : signeForce * entierNonNulAleatoire(1, 3);
  const b = entierAleatoire(-9, 9);
  const coeffs = polynomeLineaire(a, b);
  const latex = formatPolynomeLatex(coeffs);
  const resolution = resoudreLineaireSigne(a, b, "≥");
  const slot: SlotCE = { id: "radicande", role: "radicande", latex, texte: latex, coeffs, symboleAttendu: "≥" };
  return {
    famille: "irrationnelleSimple",
    radicandeQuadratique: false,
    fLatex: fLatexIrrationnelleSimple(latex),
    slots: [slot],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

function construireQuadratique(): ExerciceIrrationnelleSimple {
  const [r1, r2] = deuxEntiersDistincts(-6, 6);
  const a = Math.random() < 0.5 ? 1 : -1;
  const coeffs = polynomeQuadratiqueDepuisRacines(a, r1, r2);
  const latex = formatPolynomeLatex(coeffs);
  const resolution = resoudreQuadratiqueSigne(a, r1, r2, "≥");
  const slot: SlotCE = { id: "radicande", role: "radicande", latex, texte: latex, coeffs, symboleAttendu: "≥" };
  return {
    famille: "irrationnelleSimple",
    radicandeQuadratique: true,
    fLatex: fLatexIrrationnelleSimple(latex),
    slots: [slot],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

export function construireIrrationnelleSimple(quadratique: boolean, signeForce?: 1 | -1): ExerciceIrrationnelleSimple {
  return quadratique ? construireQuadratique() : construireLineaire(signeForce);
}

export function genererExerciceIrrationnelleSimple(): ExerciceIrrationnelleSimple {
  return construireIrrationnelleSimple(Math.random() < 0.5);
}
