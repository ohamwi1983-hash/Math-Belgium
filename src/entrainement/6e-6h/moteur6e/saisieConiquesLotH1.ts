import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, egal, estApprochee, lireNombreExact, lirePoints, memeEnsemble, memePoint } from "../ui6e/outilsLieuxLotH1";
import type { Poly } from "../ui6e/outilsLieuxLotH2";
import { evalPoly } from "../ui6e/outilsLieuxLotH2";
import { lireEquation, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Lectures communes des générateurs 6gen132–6gen137 (6e ch. 10, lot H1). Jamais de filtre de frappe :
 * on lit ce qui est écrit (seul `normaliserSigneMoins`) ; une saisie qui ne se lit pas → `parse_error`
 * (aucune tentative). Points : ordre libre, coordonnées exactes (fractions, √, « 2 + √13 ») ; une
 * coordonnée écrite en décimal proche d'une valeur irrationnelle ou fractionnaire est refusée SANS
 * tentative. Équations : comparées par PROPORTIONNALITÉ au polynôme attendu (toute forme équivalente à
 * un facteur près : développée, réduite, membres échangés) ; lettres x′, y′ ou X, Y lues comme x, y.
 */

export const SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

/** Ensemble de points (ordre libre). `attendus` vide : on attend « aucun ». */
export function statutPoints(saisie: string, attendus: P[]): StatutVerification {
  const pts = lirePoints(saisie);
  if (pts === null || (pts.length === 0 && attendus.length > 0 && !/aucun|rien|vide|∅/i.test(saisie))) return "parse_error";
  return memeEnsemble(pts, attendus) ? "correct" : "not_equivalent";
}

const ecritEnDecimal = (s: string) => /\d[.,]\d/.test(s);

/** Points justes à l'approximation décimale près (coordonnées irrationnelles ou fractionnaires). */
export function pointsApproches(saisie: string, attendus: P[]): boolean {
  if (!ecritEnDecimal(saisie)) return false;
  const pts = lirePoints(saisie);
  if (!pts || pts.length !== attendus.length || memeEnsemble(pts, attendus)) return false;
  const proche = (u: P, v: P) => (egal(u.x, v.x) || estApprochee(u.x, v.x)) && (egal(u.y, v.y) || estApprochee(u.y, v.y));
  return pts.every((p) => attendus.some((a) => proche(p, a)));
}

export function nombreApproche(saisie: string, attendu: number): boolean {
  return ecritEnDecimal(saisie) && estApprochee(lireNombreExact(saisie), attendu);
}

export { MESSAGE_APPROCHEE };

/** Équation en x, y (x′, y′, X, Y acceptés) → fonction ; `null` si illisible. */
export function lireEquationXY(saisie: string): ((p: P) => number) | null {
  const s = normaliserSigneMoins(saisie).replace(/[′']/g, "").replace(/X/g, "x").replace(/Y/g, "y");
  const f = lireEquation(s, ["x", "y"]);
  if (!f) return null;
  return (p) => f({ x: p.x, y: p.y });
}

export function statutEquation(saisie: string, attendu: Poly): StatutVerification {
  const f = lireEquationXY(saisie);
  if (!f) return "parse_error";
  return proportionnelle(f, (p) => evalPoly(attendu, p.x, p.y)) ? "correct" : "not_equivalent";
}

/** L'équation lue est proportionnelle à ce polynôme (pour les messages ciblés). */
export function equationProportionnelle(saisie: string, q: Poly): boolean {
  const f = lireEquationXY(saisie);
  return !!f && proportionnelle(f, (p) => evalPoly(q, p.x, p.y));
}

export function contientPoint(saisie: string, cible: P): boolean {
  const pts = lirePoints(saisie);
  return !!pts && pts.some((p) => memePoint(p, cible));
}

/** Aperçu KaTeX léger d'une saisie libre (points, nombres, équations) : √, fractions a/b, ², « ; ». */
export function apercuLibre(saisie: string): string | null {
  const s0 = normaliserSigneMoins(saisie).trim();
  if (s0 === "") return null;
  let s = s0
    .replace(/\\/g, "")
    .replace(/[{}]/g, "")
    .replace(/√\s*\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([0-9]+|[a-zA-Z])/g, "\\sqrt{$1}")
    .replace(/sqrt\(([^()]*)\)/g, "\\sqrt{$1}")
    .replace(/²/g, "^2")
    .replace(/\^\s*\(([^()]*)\)/g, "^{$1}")
    .replace(/\*/g, "\\times ")
    .replace(/[×·]/g, "\\times ")
    .replace(/;/g, "\\,;\\,")
    .replace(/[′']/g, "'")
    .replace(/(\d),(\d)/g, "$1{,}$2");
  s = s.replace(/(\d+|\\sqrt\{[^}]*\})\/(\d+)/g, "\\dfrac{$1}{$2}");
  return s;
}
