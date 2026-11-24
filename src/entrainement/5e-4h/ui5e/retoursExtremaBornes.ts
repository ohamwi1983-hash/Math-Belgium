/**
 * 5gen34 (extrema en contexte borné) — lot B : aides à deux niveaux (niveau 2 posé pour l'instance),
 * messages ciblés (f recopiée, constante dérivée, signe d'une racine, f′ au lieu de f, abscisses au
 * lieu des valeurs) et message sous la réponse révélée de la comparaison (bornes oubliées). Refus de
 * l'illisible : moteur (`refusSaisieExtremaBornes`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import { candidatsComparaisonBorne, deriveeFExtremaBornes, evalPoly, indexMaxAbsoluBorne, indexMinAbsoluBorne } from "../moteur5e/verificationExtremaBornes";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "./formatExtremaBornes";
import { aideDepuis, l, PREFIXE_CHOIX_FERME, t } from "./retoursDerivees";

export function aidesExtremaBornes(e: ExerciceExtremaBornes, ecran: EcranExtremaBornes): AideTrig[] {
  const n1 = texteAideNiveau1ExtremaBornes(ecran, e);
  const n2 = texteAideNiveau2ExtremaBornes(ecran, e);
  return [aideDepuis(n1.texte, n1.latex), aideDepuis(n2.texte, n2.latex)];
}

function lire(s: string, x = 0): number | null {
  try {
    const v = evaluerExpressionGenerale(s.replace(/[−–—]/g, "-").replace(/^[^=]*=/, "").replace(/(?<![a-zA-Z])t(?![a-zA-Z])/g, "x"), x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const proche = (v: number | null, c: number) => v !== null && Math.abs(v - c) <= 1e-6 * Math.max(1, Math.abs(c));
const memeEnsemble = (vs: (number | null)[], cs: number[]) => vs.length === cs.length && cs.every((c) => vs.some((v) => proche(v, c)));

export function cibleExtremaBornes(e: ExerciceExtremaBornes, ecran: EcranExtremaBornes, valeurs: string[]): FragmentConsigne[] | null {
  const f = (x: number) => evalPoly(e.coeffs, x);
  const fp = (x: number) => deriveeFExtremaBornes(e, x);
  const vs = valeurs.map((v) => lire(v));
  switch (ecran) {
    case "deriver": {
      const xs = [0.3, 1.7, 2.9].map((k) => (k * e.T) / 4);
      if (xs.every((x) => proche(lire(valeurs[0] ?? "", x), f(x)))) return [t("Tu as recopié f(t) : il faut la dériver.")];
      const c0 = e.coeffs[0] ?? 0;
      if (c0 !== 0 && xs.every((x) => proche(lire(valeurs[0] ?? "", x), fp(x) + c0))) return [t("Le terme constant a pour dérivée 0 : il disparaît.")];
      return null;
    }
    case "racines":
      if (memeEnsemble(vs, e.racinesFPrime.map((r) => -r))) return [t("Attention au signe : "), l("t-a=0"), t(" donne "), l("t=a"), t(".")];
      return null;
    case "valeursExtremums":
      if (memeEnsemble(vs, e.racinesFPrime.map(fp))) return [t("Tu as remplacé t dans f′(t) (elle vaut 0 en un extremum) : la valeur se calcule avec f(t).")];
      if (memeEnsemble(vs, e.racinesFPrime)) return [t("Ce sont les abscisses : on demande les valeurs de f en ces instants.")];
      return null;
    case "valeursBornes":
      if (memeEnsemble(vs, [fp(0), fp(e.T)])) return [t("Tu as remplacé t dans f′(t) : la valeur aux bornes se calcule avec f(t).")];
      return null;
    default:
      return null;
  }
}

/** Message sous la réponse révélée de l'écran « comparaison » (choix fermé : une seule tentative). */
export function messageComparaisonExtremaBornes(e: ExerciceExtremaBornes, reponse: { indexMax: number; indexMin: number }): string {
  const candidats = candidatsComparaisonBorne(e);
  const iMax = indexMaxAbsoluBorne(e);
  const iMin = indexMinAbsoluBorne(e);
  const borne = (i: number) => candidats[i]?.origine === "borne";
  const fauxMax = reponse.indexMax !== iMax;
  const fauxMin = reponse.indexMin !== iMin;
  if ((fauxMax && borne(iMax)) || (fauxMin && borne(iMin))) return `${PREFIXE_CHOIX_FERME} Les bornes de l'intervalle comptent aussi : une valeur en t = 0 ou en t = ${e.T} peut dépasser les extremums locaux.`;
  return `${PREFIXE_CHOIX_FERME} Compare toutes les valeurs : le maximum absolu est la plus grande, le minimum absolu la plus petite.`;
}
