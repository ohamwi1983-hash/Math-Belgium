import type { ExerciceMethodeNombreSolutions, IdAffirmation, MethodeRapide } from "../core/methodeNombreSolutions.types";
import { mono, polynome } from "../ui/corrigeChapitre3";

/**
 * Modèle de gen113 « Reconnaître la méthode et le nombre de solutions » : Δ, solutions, vérité des
 * affirmations de l'écran 2, méthodes acceptées. Une seule source pour l'écran, le papier et le
 * corrigé.
 */

type E = ExerciceMethodeNombreSolutions;

export function delta(e: E): number {
  return e.b * e.b - 4 * e.a * e.c;
}

/** Racine évidente : 1 si a + b + c = 0, −1 si a − b + c = 0, sinon `null`. */
export function racineEvidente(e: E): 1 | -1 | null {
  if (e.b === 0 || e.c === 0) return null;
  if (e.a + e.b + e.c === 0) return 1;
  if (e.a - e.b + e.c === 0) return -1;
  return null;
}

/** Méthodes acceptées à l'écran 1 (décision 1 : racine évidente OU discriminant). */
export function methodesAcceptees(e: E): MethodeRapide[] {
  return e.methode === "racineEvidente" ? ["racineEvidente", "discriminant"] : [e.methode];
}

export function nombreSolutions(e: E): 0 | 1 | 2 {
  const d = delta(e);
  return d > 0 ? 2 : d === 0 ? 1 : 0;
}

/** Solutions (rangées) ; `[]` sans solution. */
export function solutions(e: E): number[] {
  const d = delta(e);
  if (d < 0) return [];
  const s = Math.sqrt(d);
  const v = [(-e.b - s) / (2 * e.a), (-e.b + s) / (2 * e.a)].sort((x, y) => x - y);
  return d === 0 ? [v[0]!] : v;
}

/** L'écran 3 (solutions évidentes) existe-t-il ? */
export function aEcranSolutions(e: E): boolean {
  return e.methode !== "aucuneSolution" && e.methode !== "discriminant";
}

export function nombreEcrans(e: E): number {
  return aEcranSolutions(e) ? 3 : 2;
}

/** Prémisse vraie pour l'équation (une affirmation est vraie ssi sa prémisse l'est). */
export function affirmationVraie(id: IdAffirmation, e: E): boolean {
  switch (id) {
    case "facteurX":
      return e.c === 0 && e.b !== 0;
    case "moinsCaPositif":
      return e.b === 0 && -e.c / e.a > 0;
    case "moinsCaNegatif":
      return e.b === 0 && -e.c / e.a < 0;
    case "deltaNul":
      return delta(e) === 0;
    case "deltaPositif":
      return delta(e) > 0;
    case "deltaNegatif":
      return delta(e) < 0;
    case "racineEvidente1":
      return e.b !== 0 && e.c !== 0 && e.a + e.b + e.c === 0 && e.c !== e.a;
    case "racineEvidenteMoins1":
      return e.b !== 0 && e.c !== 0 && e.a - e.b + e.c === 0 && e.c !== e.a;
    case "produitNegatif":
      return e.c !== 0 && e.c / e.a < 0;
  }
}

/** L'affirmation attendue (celle de la méthode). */
export function affirmationAttendue(e: E): IdAffirmation {
  switch (e.methode) {
    case "miseEnEvidence":
      return "facteurX";
    case "differenceCarres":
      return "moinsCaPositif";
    case "aucuneSolution":
      return "moinsCaNegatif";
    case "carreParfait":
      return "deltaNul";
    case "racineEvidente":
      return racineEvidente(e) === 1 ? "racineEvidente1" : "racineEvidenteMoins1";
    case "discriminant":
      return delta(e) > 0 ? "deltaPositif" : "deltaNegatif";
  }
}

export const NOMBRE_AFFIRMATION: Record<IdAffirmation, 0 | 1 | 2> = {
  facteurX: 2,
  moinsCaPositif: 2,
  moinsCaNegatif: 0,
  deltaNul: 1,
  deltaPositif: 2,
  deltaNegatif: 0,
  racineEvidente1: 2,
  racineEvidenteMoins1: 2,
  produitNegatif: 2,
};

/** Membre de gauche réduit. */
export function trinomeLatex(e: E): string {
  return polynome([e.a, e.b, e.c]);
}

/** L'équation telle qu'elle est présentée. */
export function enonceLatex(e: E): string {
  if (e.presentation === "reduite") return `${trinomeLatex(e)}=0`;
  if (e.termeDeplace === 1) return `${polynome([e.a, 0, e.c])}=${mono(-e.b, "x")}`;
  return `${polynome([e.a, e.b, 0])}=${mono(-e.c)}`;
}
