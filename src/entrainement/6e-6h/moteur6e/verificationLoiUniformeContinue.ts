import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice115, Phase115 } from "../core6e/loiUniformeContinue";
import { densite115, ecartType115, esperance115, longueur, proba115, probaInv115, variance115 } from "../core6e/loiUniformeContinue";
import { val } from "../ui6e/outilsVariablesAleatoiresLotH1";
import { MESSAGE_APPROCHEE, MESSAGE_TROP_ARRONDI, egalNum, estApprochee, lireVA, statutArrondiCentieme, statutExact } from "./lectureVariablesAleatoiresLotH1";

/**
 * Vérification de `6gen115`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; valeurs exactes à 1e-9, décimal proche mais faux = valeur approchée (sans tentative) ;
 * σ(X) : valeur exacte (« √75 », « 5√3 ») ou arrondi au centième ; un arrondi plus grossier est refusé
 * sans tentative. Messages ciblés : b − a au lieu de son inverse, 1/b, intervalle qui déborde gardé
 * tel quel, (d − c)/b, b/2, (b − a)/2, (b − a)/12, (b − a)²/2, 12V sans racine, √V, bornes à E ± L.
 */

type E = Exercice115;
type P = Phase115;
const t = tx;
const l = lx;

function attendus(e: E, p: P): number[] {
  switch (p) {
    case "densite":
      return [val(densite115(e))];
    case "proba":
      return [val(proba115(e))];
    case "esperance":
      return [esperance115(e)];
    case "dispersion":
      return [val(variance115(e)), ecartType115(e)];
    case "longueur":
      return [longueur(e)];
    case "bornes":
      return [e.a, e.b];
    case "probaInv":
      return [val(probaInv115(e))];
  }
}

export function diagnostiquer115(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const a = attendus(e, p);
  if (p === "dispersion") {
    const s = statutArrondiCentieme(valeurs[1] ?? "", a[1]!);
    return [statutExact(valeurs[0] ?? "", a[0]!), s === "trop" ? "not_equivalent" : s];
  }
  return a.map((x, i) => statutExact(valeurs[i] ?? "", x));
}

export function approchee115(e: E, p: P, valeurs: string[]): string | null {
  const a = attendus(e, p);
  if (p === "dispersion") {
    if (estApprochee(valeurs[0] ?? "", a[0]!)) return MESSAGE_APPROCHEE;
    return statutArrondiCentieme(valeurs[1] ?? "", a[1]!) === "trop" ? MESSAGE_TROP_ARRONDI : null;
  }
  return a.some((x, i) => estApprochee(valeurs[i] ?? "", x)) ? MESSAGE_APPROCHEE : null;
}

export function piege115(e: E, p: P, valeurs: string[]): Frag[] | null {
  const L = longueur(e);
  const v = valeurs.map((s) => lireVA(s));
  const att = attendus(e, p);
  const cand: { indice: number; valeur: number; message: Frag[] }[] = [];
  if (p === "densite") {
    cand.push({ indice: 0, valeur: L, message: [t("C'est la longueur de l'intervalle : la densité est son inverse (l'aire du rectangle doit valoir 1).")] });
    cand.push({ indice: 0, valeur: 1 / e.b, message: [t("Il faut diviser par la longueur "), l("b-a"), t(", pas par b.")] });
  }
  if (p === "proba") {
    const { c, d } = e.evenement!;
    cand.push({ indice: 0, valeur: (d - c) / L, message: [t("L'intervalle demandé déborde de "), l(`[${e.a}\\,;${e.b}]`), t(" : X n'y prend aucune valeur en dehors, ne garde que la partie commune.")] });
    cand.push({ indice: 0, valeur: (Math.min(d, e.b) - Math.max(c, e.a)) / e.b, message: [t("Il faut diviser par la longueur "), l("b-a"), t(", pas par b.")] });
    cand.push({ indice: 0, valeur: 1 - att[0]!, message: [t("C'est la probabilité de l'événement contraire : relis l'intervalle demandé.")] });
  }
  if (p === "esperance") {
    cand.push({ indice: 0, valeur: e.b / 2, message: [t("C'est la moitié de b : l'espérance est le milieu de "), l("[a\\,;b]"), t(", soit "), l("\\dfrac{a+b}{2}"), t(".")] });
    cand.push({ indice: 0, valeur: L / 2, message: [t("C'est la moitié de la longueur : l'espérance est le milieu de "), l("[a\\,;b]"), t(", soit "), l("\\dfrac{a+b}{2}"), t(".")] });
  }
  if (p === "dispersion") {
    cand.push({ indice: 0, valeur: L / 12, message: [t("La longueur doit être élevée au carré : "), l("V(X)=\\dfrac{(b-a)^2}{12}"), t(".")] });
    cand.push({ indice: 0, valeur: (L * L) / 2, message: [t("On divise par 12, pas par 2 : "), l("V(X)=\\dfrac{(b-a)^2}{12}"), t(".")] });
    cand.push({ indice: 0, valeur: (e.b * e.b - e.a * e.a) / 12, message: [t("C'est le carré de la différence "), l("(b-a)^2"), t(", pas la différence des carrés.")] });
    cand.push({ indice: 1, valeur: val(variance115(e)), message: [t("C'est la variance : l'écart-type en est la racine carrée.")] });
    cand.push({ indice: 1, valeur: L / 12, message: [t("L'écart-type est la racine carrée de la variance "), l("\\dfrac{(b-a)^2}{12}"), t(".")] });
  }
  if (p === "longueur") {
    const V = val(variance115(e));
    cand.push({ indice: 0, valeur: 12 * V, message: [t("C'est "), l("(b-a)^2"), t(" : prends encore la racine carrée.")] });
    cand.push({ indice: 0, valeur: Math.sqrt(V), message: [t("C'est l'écart-type : multiplie d'abord la variance par 12, puis prends la racine.")] });
  }
  if (p === "bornes") {
    const E = esperance115(e);
    cand.push({ indice: 0, valeur: E - L, message: [t("L'espérance est au milieu : a et b sont à une demi-longueur de l'espérance.")] });
    cand.push({ indice: 1, valeur: E + L, message: [t("L'espérance est au milieu : a et b sont à une demi-longueur de l'espérance.")] });
  }
  if (p === "probaInv") cand.push({ indice: 0, valeur: e.cInv! / L, message: [t("Il faut la longueur de "), l(`[a\\,;${e.cInv}]`), t(", soit "), l(`${e.cInv}-a`), t(", divisée par "), l("b-a"), t(".")] });
  for (const c of cand) {
    const x = v[c.indice];
    if (x !== null && x !== undefined && !egalNum(c.valeur, att[c.indice]!) && egalNum(x, c.valeur)) return c.message;
  }
  return null;
}
