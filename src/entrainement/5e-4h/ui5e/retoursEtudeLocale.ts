/**
 * 5gen29 (étude locale) — lot B, règles communes : aides à deux niveaux (niveau 1 = méthode du cours,
 * niveau 2 posé pour CETTE fonction — `texteAideNiveau2EtudeLocale`), messages ciblés (signe d'une
 * racine, « aucun zéro » face à une racine double, valeur calculée avec f′ ou f″ au lieu de f, terme
 * constant dérivé). Refus sans tentative : moteur (`refusValeursEtudeLocale`, `refusDeriveeEtudeLocale`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { EcranEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { deriveeFEtudeLocale, deriveeSecondeEtudeLocale, racinesFPrimeNumeriques, racinesFSecondeNumeriques, valeurFEtudeLocale, xDesExtremums, xDesInflexions } from "../moteur5e/verificationEtudeLocale";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1EtudeLocale, texteAideNiveau2EtudeLocale } from "./formatEtudeLocale";
import { aideDepuis, l, t } from "./retoursDerivees";

export function aidesEtudeLocale(e: ExerciceEtudeLocale, ecran: EcranEtudeLocale): AideTrig[] {
  const n1 = texteAideNiveau1EtudeLocale(ecran, e);
  const n2 = texteAideNiveau2EtudeLocale(ecran, e);
  return [aideDepuis(n1.texte, n1.latex), aideDepuis(n2.texte, n2.latex)];
}

function lire(s: string): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, ""), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function enX(s: string, x: number): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, ""), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const proche = (v: number | null, c: number) => v !== null && Math.abs(v - c) < 1e-6 * Math.max(1, Math.abs(c));
const memeEnsemble = (vs: (number | null)[], cs: number[]) => vs.length === cs.length && cs.every((c) => vs.some((v) => proche(v, c)));

/** Message ciblé sur l'erreur trahie par la réponse fausse (null : message générique). */
export function cibleEtudeLocale(e: ExerciceEtudeLocale, ecran: EcranEtudeLocale, valeurs: string[]): FragmentConsigne[] | null {
  const vs = valeurs.map(lire);
  switch (ecran) {
    case "resoudreFPrime":
    case "resoudreFSeconde": {
      const cs = ecran === "resoudreFPrime" ? racinesFPrimeNumeriques(e) : racinesFSecondeNumeriques(e);
      if (valeurs.length === 0 && cs.length > 0) return [t("L'équation a au moins une solution ici : reprends la factorisation ou le discriminant (une racine double compte aussi).")];
      if (cs.some((c) => c !== 0) && memeEnsemble(vs, cs.map((c) => -c))) return [t("Attention au signe : "), l("x-a=0"), t(" donne "), l("x=a"), t(", pas "), l("x=-a"), t(".")];
      return null;
    }
    case "extremums":
    case "inflexions": {
      const xs = ecran === "extremums" ? xDesExtremums(e) : xDesInflexions(e);
      const deriv = ecran === "extremums" ? (x: number) => deriveeFEtudeLocale(e, x) : (x: number) => deriveeSecondeEtudeLocale(e, x);
      if (memeEnsemble(vs, xs.map(deriv))) return [t(ecran === "extremums" ? "Tu as calculé f′ en ces points (elle y vaut 0) : la valeur de l'extremum se calcule avec f(x)." : "Tu as calculé f″ en ces points : la valeur se calcule avec f(x).")];
      if (memeEnsemble(vs, xs)) return [t("Ce sont les abscisses : on demande les valeurs de f en ces points, "), l("f(x_0)"), t(".")];
      if (xs.some((x) => !proche(valeurFEtudeLocale(e, x), -valeurFEtudeLocale(e, x))) && memeEnsemble(vs, xs.map((x) => -valeurFEtudeLocale(e, x)))) return [t("Le signe est changé : reprends le calcul de f(x₀), puissances comprises.")];
      return null;
    }
    case "deriverFPrime":
    case "deriverFSeconde": {
      const ordre = ecran === "deriverFPrime" ? 1 : 2;
      const g = (x: number) => (ordre === 1 ? deriveeFEtudeLocale(e, x) : deriveeSecondeEtudeLocale(e, x));
      const constante = ordre === 1 ? valeurFEtudeLocale(e, 0) - 0 : deriveeFEtudeLocale(e, 0);
      if (e.type === "polynomiale" && constante !== 0 && [0.5, 1.3, -0.7].every((x) => proche(enX(valeurs[0] ?? "", x), g(x) + constante))) return [t("Le terme constant a pour dérivée 0 : il disparaît.")];
      return null;
    }
    default:
      return null;
  }
}
