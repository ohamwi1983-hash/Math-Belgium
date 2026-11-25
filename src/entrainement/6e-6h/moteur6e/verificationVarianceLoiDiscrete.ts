import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice110, Loi110, Phase110 } from "../core6e/varianceLoiDiscrete";
import { ecartType, esperance, esperanceCarres, variance } from "../core6e/varianceLoiDiscrete";
import { MESSAGE_APPROCHEE, contientRacine, egalNum, estApprochee, lireVA, statutExact, vaut } from "./lectureVariablesAleatoiresLotH1";

/**
 * Vérification de `6gen110`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; valeurs exactes à 1e-9 (toute écriture : « 3,85 », « 77/20 ») ; décimal proche mais
 * faux = valeur approchée (message sans tentative). σ(X) est un décimal exact : une racine non
 * calculée (« √2,25 ») est à reprendre (sans tentative). Verdict « jeu le plus risqué » : choix fermé,
 * une tentative. Messages ciblés : moyenne non pondérée, E(X²) pris pour [E(X)]², V = E(X²) − E(X)
 * (carré oublié), σ = V (racine oubliée), σ = V², carré d'une valeur négative compté négatif.
 */

type E = Exercice110;
type P = Phase110;
const t = tx;
const l = lx;

function attendus(e: E, p: P): number[] {
  const L = e.loi;
  switch (p) {
    case "esperance":
      return [esperance(L)];
    case "carres":
      return [esperanceCarres(L)];
    case "variance":
      return [variance(L)];
    case "ecartType":
      return [ecartType(L)];
    case "esperances":
      return [esperance(L), esperance(e.loiB!)];
    case "variances":
      return [variance(L), variance(e.loiB!)];
    case "verdict":
      return [];
  }
}

export function diagnostiquer110(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "verdict") return [valeurs[0] === e.plusRisque ? "correct" : "not_equivalent"];
  return attendus(e, p).map((a, i) => statutExact(valeurs[i] ?? "", a));
}

export function approchee110(e: E, p: P, valeurs: string[]): string | null {
  if (p === "verdict") return null;
  const a = attendus(e, p);
  return a.some((x, i) => estApprochee(valeurs[i] ?? "", x)) ? MESSAGE_APPROCHEE : null;
}

export function aReprendre110(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p !== "ecartType") return null;
  const v = valeurs[0] ?? "";
  if (contientRacine(v) && vaut(v, ecartType(e.loi))) return [t("C'est la bonne valeur, mais calcule la racine : l'écart-type est ici un nombre décimal. Cela ne compte pas comme une tentative.")];
  return null;
}

const moyenneSimple = (L: Loi110) => L.valeurs.reduce((a, b) => a + b, 0) / L.valeurs.length;
/** E(X²) calculé avec le carré d'une valeur négative compté négatif (−2² = −4). */
const carresSignes = (L: Loi110) => L.valeurs.reduce((a, x, i) => a + Math.sign(x) * x * x * L.probas[i]!, 0) / 100;

function messagesLoi(L: Loi110, p: "esperance" | "carres" | "variance" | "ecartType", v: string, nom: string): Frag[] | null {
  const E = esperance(L);
  const cand: { valeur: number; message: Frag[] }[] = [];
  if (p === "esperance") cand.push({ valeur: moyenneSimple(L), message: [t("C'est la moyenne simple des valeurs : l'espérance pondère chaque valeur par sa probabilité.")] });
  if (p === "carres") {
    cand.push({ valeur: E * E, message: [t("C'est "), l(`[E(${nom})]^2`), t(" : "), l(`E(${nom}^2)`), t(" est la somme des "), l("x_i^2\\times P"), t(", on élève chaque valeur au carré avant de pondérer.")] });
    cand.push({ valeur: carresSignes(L), message: [t("Le carré d'une valeur négative est positif : "), l("(-2)^2=4"), t(".")] });
    cand.push({ valeur: E, message: [t("C'est l'espérance de "), l(nom), t(" : élève les valeurs au carré.")] });
  }
  if (p === "variance") {
    cand.push({ valeur: esperanceCarres(L) - E, message: [t("Il manque le carré : "), l(`V(${nom})=E(${nom}^2)-[E(${nom})]^2`), t(".")] });
    cand.push({ valeur: E * E - esperanceCarres(L), message: [t("Ordre inversé : une variance n'est jamais négative, c'est "), l(`E(${nom}^2)`), t(" moins le carré de l'espérance.")] });
    cand.push({ valeur: esperanceCarres(L), message: [t("C'est "), l(`E(${nom}^2)`), t(" : retire encore "), l(`[E(${nom})]^2`), t(".")] });
  }
  if (p === "ecartType") {
    cand.push({ valeur: variance(L), message: [t("C'est la variance : l'écart-type en est la racine carrée.")] });
    cand.push({ valeur: variance(L) ** 2, message: [t("L'écart-type est la racine carrée de la variance, pas son carré.")] });
    cand.push({ valeur: variance(L) / 2, message: [t("L'écart-type est la racine carrée de la variance, pas sa moitié.")] });
  }
  const r = lireVA(v);
  if (r === null) return null;
  const attendu = p === "esperance" ? E : p === "carres" ? esperanceCarres(L) : p === "variance" ? variance(L) : ecartType(L);
  for (const c of cand) if (!egalNum(c.valeur, attendu) && egalNum(r, c.valeur)) return c.message;
  return null;
}

export function piege110(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "verdict") {
    if (valeurs[0] === e.plusRisque) return null;
    return [t(`Les espérances sont égales : c'est la variance qui mesure le risque, et celle du jeu ${e.plusRisque} est la plus grande.`)];
  }
  if (p === "esperances" || p === "variances") {
    const base = p === "esperances" ? "esperance" : "variance";
    return messagesLoi(e.loi, base, valeurs[0] ?? "", "X") ?? messagesLoi(e.loiB!, base, valeurs[1] ?? "", "Y");
  }
  return messagesLoi(e.loi, p, valeurs[0] ?? "", "X");
}
