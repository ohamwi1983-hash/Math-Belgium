import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice111, Phase111 } from "../core6e/transformationAffineVA";
import { eY, sY, vX, vY } from "../core6e/transformationAffineVA";
import { MESSAGE_APPROCHEE, egalNum, estApprochee, lireVA, statutExact } from "./lectureVariablesAleatoiresLotH1";

/**
 * Vérification de `6gen111`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; valeurs exactes à 1e-9 ; décimal proche mais faux = valeur approchée (sans tentative).
 * Messages ciblés : signe de b (mise ajoutée), a et b échangés, b oublié dans E(Y), a oublié,
 * V(aX + b) = aV(X) + b, a non élevé au carré, écart-type non élevé au carré, σ(Y) négatif
 * (σ = aσ(X) avec a < 0), b ajouté à l'écart-type, σ(Y) = a²σ(X).
 */

type E = Exercice111;
type P = Phase111;
const t = tx;
const l = lx;

function attendus(e: E, p: P): number[] {
  switch (p) {
    case "coefficients":
      return [e.a, e.b];
    case "esperance":
      return [eY(e)];
    case "variance":
      return [vY(e)];
    case "ecartType":
      return [sY(e)];
  }
}

export function diagnostiquer111(e: E, p: P, valeurs: string[]): StatutVerification[] {
  return attendus(e, p).map((a, i) => statutExact(valeurs[i] ?? "", a));
}

export function approchee111(e: E, p: P, valeurs: string[]): string | null {
  return attendus(e, p).some((x, i) => estApprochee(valeurs[i] ?? "", x)) ? MESSAGE_APPROCHEE : null;
}

export function piege111(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v0 = lireVA(valeurs[0] ?? "");
  if (p === "coefficients") {
    const v1 = lireVA(valeurs[1] ?? "");
    if (v0 !== null && v1 !== null) {
      if (egalNum(v0, e.b) && egalNum(v1, e.a) && e.a !== e.b) return [t("a et b sont échangés : a est le nombre qui multiplie X, b la partie fixe.")];
      if (e.b !== 0 && egalNum(v1, -e.b)) return [t("Regarde le signe de b : la partie fixe est-elle ajoutée ou retirée ?")];
      if (e.a < 0 && egalNum(v0, -e.a)) return [t("Regarde le signe de a : quand X augmente, Y augmente-t-il ou diminue-t-il ?")];
    }
    return null;
  }
  if (v0 === null) return null;
  const att = attendus(e, p)[0]!;
  const cand: { valeur: number; message: Frag[] }[] = [];
  const V = vX(e);
  if (p === "esperance") {
    cand.push({ valeur: e.a * e.eX, message: [t("Il manque b : "), l("E(aX+b)=aE(X)+b"), t(".")] });
    cand.push({ valeur: e.eX + e.b, message: [t("Il manque a : l'espérance est aussi multipliée par a.")] });
  }
  if (p === "variance") {
    cand.push({ valeur: e.a * V + e.b, message: [t("La variance ne se transforme pas comme l'espérance : b décale les valeurs sans changer leur dispersion, et a intervient au carré : "), l("V(aX+b)=a^2V(X)"), t(".")] });
    cand.push({ valeur: e.a * e.a * V + e.b, message: [t("Le décalage b ne change pas la dispersion : il ne s'ajoute pas à la variance.")] });
    cand.push({ valeur: e.a * V, message: [t("a intervient au carré dans la variance : "), l("V(aX+b)=a^2V(X)"), t(".")] });
    if (e.donnee === "ecartType") cand.push({ valeur: e.a * e.a * e.sX, message: [t("On donne l'écart-type de X : sa variance est "), l("\\sigma(X)^2"), t(".")] });
    cand.push({ valeur: V, message: [t("C'est la variance de X : multiplie-la par "), l("a^2"), t(".")] });
  }
  if (p === "ecartType") {
    cand.push({ valeur: e.a * e.sX, message: [t("Un écart-type n'est jamais négatif : "), l("\\sigma(aX+b)=|a|\\,\\sigma(X)"), t(".")] });
    cand.push({ valeur: Math.abs(e.a) * e.sX + e.b, message: [t("Le décalage b ne change pas la dispersion : il ne s'ajoute pas à l'écart-type.")] });
    cand.push({ valeur: e.a * e.a * e.sX, message: [t("L'écart-type est multiplié par "), l("|a|"), t(", pas par "), l("a^2"), t(" (c'est la variance qui porte le carré).")] });
    cand.push({ valeur: e.sX, message: [t("C'est l'écart-type de X : multiplie-le par "), l("|a|"), t(".")] });
  }
  for (const c of cand) if (!egalNum(c.valeur, att) && egalNum(v0, c.valeur)) return c.message;
  return null;
}
