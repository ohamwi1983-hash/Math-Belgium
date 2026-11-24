/**
 * 5gen33 (contexte économique) — lot B : aides à deux niveaux (niveau 2 posé pour l'instance, plus
 * d'« Exemple : » avec une autre fonction), messages ciblés (C au lieu de C′, coût fixe gardé, une
 * seule des deux valeurs de C_T, écart rapporté au mauvais coût, prix au lieu de la recette, recette au
 * lieu du bénéfice, coût fixe oublié, signe d'une soustraction, quantité négative retenue) et message
 * sous la réponse révélée d'un choix fermé faux de la dichotomie. Refus de l'illisible : moteur.
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { deriveeCoutTotal, valeurCoutTotal } from "../moteur5e/verificationContexteEconomique";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1, texteAideNiveau2 } from "./formatContexteEconomique";
import { aideDepuis, l, PREFIXE_CHOIX_FERME, t } from "./retoursDerivees";

export function aidesContexteEconomique(e: ExerciceContexteEconomique, ecran: EcranContexteEconomique): AideTrig[] {
  const n1 = texteAideNiveau1(ecran, e);
  const n2 = texteAideNiveau2(e, ecran);
  return [aideDepuis(n1.texte, n1.latex), aideDepuis(n2.texte, n2.latex)];
}

function lire(s: string, x = 0): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, "").replace(/(?<![a-zA-Z])[qx](?![a-zA-Z])/g, "x"), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const proche = (v: number | null, c: number) => v !== null && Math.abs(v - c) <= 1e-6 * Math.max(1, Math.abs(c));
const egale = (s: string, g: (x: number) => number) => [1.3, 2.7, 4.1].every((x) => proche(lire(s, x), g(x)));

/** Message ciblé (champs à 3 tentatives) — null : message générique. */
export function cibleContexteEconomique(e: ExerciceContexteEconomique, ecran: EcranContexteEconomique, v: string[]): FragmentConsigne[] | null {
  const v0 = v[0] ?? "";
  if (e.famille === "A") {
    const C = (q: number) => valeurCoutTotal(e.coutTotal, q);
    const Cp = (q: number) => deriveeCoutTotal(e.coutTotal, q);
    const fixe = e.coutTotal.degre === 2 ? e.coutTotal.c : e.coutTotal.d;
    switch (ecran) {
      case "coutMarginalDiscret":
        if (proche(lire(v0), C(e.q0 + 1)) || proche(lire(v0), C(e.q0))) return [t("C'est un coût total : le coût marginal est la DIFFÉRENCE "), l("C_T(q_0+1)-C_T(q_0)"), t(".")];
        return null;
      case "deriveeSymbolique":
        if (egale(v0, C)) return [t("C'est C_T recopié : il faut le dériver.")];
        if (egale(v0, (q) => Cp(q) + fixe)) return [t("Le coût fixe est une constante : sa dérivée est 0.")];
        return null;
      case "deriveeValeur":
        if (proche(lire(v0), C(e.q0))) return [t("Tu as calculé "), l("C_T(q_0)"), t(" : le coût marginal se calcule avec la dérivée "), l("C'_T(q_0)"), t(".")];
        return null;
      case "comparaisonEcart": {
        const pc = lire(v[1] ?? "");
        if (pc !== null && proche(pc, (e.ecartAbsolu / e.cmDiscret) * 100) && !proche(pc, e.ecartPourcent)) return [t("L'écart en % se rapporte à la valeur de la dérivée "), l("C'_T(q_0)"), t(" (la valeur de référence).")];
        return null;
      }
      case "extremum": {
        const q = lire(v0);
        if (e.minimum.grandeur === "coutMoyen" && q !== null && proche(Cp(q), 0)) return [t("On cherche le minimum du coût MOYEN "), l("C_M(q)=\\frac{C_T(q)}{q}"), t(", pas celui de C_T.")];
        return null;
      }
      default:
        return null;
    }
  }
  if (e.famille === "B") {
    const RT = (x: number) => e.k * x + e.m * x * x;
    const CT = (x: number) => e.a * x ** 3 + e.b * x * x + e.c * x + e.d;
    switch (ecran) {
      case "recetteTotale":
        if (egale(v0, (x) => e.k + e.m * x)) return [t("C'est le prix unitaire : la recette multiplie le prix par la quantité, "), l("R_T(x)=x\\cdot p(x)"), t(".")];
        return null;
      case "beneficeFormule":
        if (egale(v0, RT)) return [t("C'est la recette : le bénéfice retire le coût total, "), l("B(x)=R_T(x)-C_T(x)"), t(".")];
        if (egale(v0, (x) => RT(x) - CT(x) + 2 * e.d)) return [t("Le coût fixe est soustrait lui aussi (parenthèses autour de "), l("C_T(x)"), t(").")];
        if (egale(v0, (x) => RT(x) - CT(x) + e.d)) return [t("Le coût fixe fait partie du coût total : il ne disparaît pas.")];
        return null;
      case "beneficeMaximum": {
        const b = lire(v0);
        if (proche(b, RT(e.xOpt))) return [t("C'est la recette pour cette quantité : le bénéfice retire le coût total.")];
        if (proche(b, CT(e.xOpt))) return [t("C'est le coût total : le bénéfice est la recette moins le coût.")];
        return null;
      }
      case "resoudreEgaliteMarginales":
        if (proche(lire(v[2] ?? ""), e.xNeg)) return [t("Une quantité produite ne peut pas être négative : garde l'autre solution.")];
        return null;
      default:
        return null;
    }
  }
  return null;
}

/** Message sous la réponse révélée d'une itération de dichotomie close par un choix faux. */
export function messageChoixDichotomie(): string {
  return `${PREFIXE_CHOIX_FERME} On garde la moitié où P change de signe : compare le signe de P au milieu à celui de P à une borne.`;
}
