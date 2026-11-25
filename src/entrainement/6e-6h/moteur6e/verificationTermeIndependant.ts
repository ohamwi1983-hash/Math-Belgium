import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTI, PhaseTI } from "../core6e/termeIndependant";
import { coefficient, exposant, kIndependant, pq, termeIndependant } from "../core6e/termeIndependant";
import { C } from "../ui6e/nombresCombinatoireLotH2";
import { affineLue, estAucun, lireRationnel, ratVal, statutExpressionAffine } from "./lectureCombinatoireLotH2";

/**
 * Vérification de `6gen107`. Saisies LUES avant tout verdict (illisible → `parse_error`, aucune
 * tentative) : écran 1, une expression en k (« 18 − 3k », « 2(9 − k) − k », préfixe « x^ » toléré)
 * comparée en plusieurs valeurs de k ; écran 2, un entier ou « aucun » ; écran 3, un entier (calcul
 * « C(9,6)·64 » accepté), « 0 » ou « aucun » quand il n'y a pas de terme indépendant. Un décimal non
 * entier au terme : message, aucune tentative. Messages ciblés : exposant négatif de 1/x^q oublié,
 * exposant du second facteur oublié, puissances échangées, (x^p)^(n−k) mal développé, k non entier,
 * coefficient du binôme seul, signe de bᵏ, rang k au lieu de k + 1, puissances de a et b échangées.
 */

type E = ExerciceTI;
type P = PhaseTI;
const t = tx;
const l = lx;

export function messageIllisible(_e: E, p: P): string {
  if (p === "exposant") return "Expression non reconnue : écris l'exposant en fonction de k, par exemple 12 − 3k. Cette saisie ne compte pas comme une tentative.";
  if (p === "k") return "Valeur non reconnue : écris un entier, ou « aucun ». Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un entier (ou un calcul comme C(9,6)·64), ou 0. Cette saisie ne compte pas comme une tentative.";
}

function preparerExposant(v: string): string {
  return v
    .trim()
    .replace(/K/g, "k")
    .replace(/^x\s*\^\s*/i, "")
    .replace(/^\{(.*)\}$/, "$1");
}

const lire = (v: string): number | null => {
  const r = lireRationnel(v);
  return r === null ? null : ratVal(r);
};
const egal = (a: number, b: number) => Math.abs(a - b) < 1e-6;

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "exposant") {
    const { c, pente } = exposant(e);
    return [statutExpressionAffine(preparerExposant(v), "k", c, pente)];
  }
  const k = kIndependant(e);
  if (p === "k") {
    if (estAucun(v)) return [k === null ? "correct" : "not_equivalent"];
    const x = lire(v);
    if (x === null) return ["parse_error"];
    return [k !== null && egal(x, k) ? "correct" : "not_equivalent"];
  }
  if (estAucun(v)) return [k === null ? "correct" : "not_equivalent"];
  const x = lire(v);
  if (x === null) return ["parse_error"];
  return [egal(x, termeIndependant(e)) ? "correct" : "not_equivalent"];
}

export function approchee(_e: E, p: P, valeurs: string[]): string | null {
  if (p !== "terme") return null;
  const x = lire(valeurs[0] ?? "");
  if (x !== null && Math.abs(x - Math.round(x)) > 1e-9) return "Le terme indépendant est ici un entier (produit d'entiers) : vérifie ton calcul. Cette saisie ne compte pas comme une tentative.";
  return null;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  const { p: pp, q } = pq(e);
  const n = e.n;
  if (p === "exposant") {
    const lu = affineLue(preparerExposant(v), "k");
    if (!lu) return null;
    const { c, pente } = exposant(e);
    if (egal(lu.a, c) && egal(lu.b, pente)) return null;
    if (egal(lu.a, pp * n) && egal(lu.b, q - pp)) return [t("Le second facteur est "), l(`\\dfrac{1}{x^{${q}}}=x^{-${q}}`), t(" : élevé à la puissance "), l("k"), t(", il donne un exposant négatif, "), l(`-${q === 1 ? "" : q}k`), t(".")];
    if (egal(lu.a, pp * n) && egal(lu.b, -pp)) return [t("Il manque l'exposant apporté par le second facteur, "), l(`\\left(\\dfrac{1}{x^{${q}}}\\right)^{k}`), t(".")];
    if (egal(lu.a, -q * n) && egal(lu.b, pp + q)) return [t("Dans "), l("T_{k+1}=C_n^k\\,a^{n-k}\\,b^{k}"), t(", c'est le second terme du binôme qui est à la puissance "), l("k"), t(", le premier à la puissance "), l("n-k"), t(".")];
    if (egal(lu.a, pp * n) && egal(lu.b, -q)) return [l(`\\left(x^{${pp}}\\right)^{${n}-k}=x^{${pp}(${n}-k)}`), t(" : développe tout le produit, le terme en "), l("k"), t(" compris.")];
    return null;
  }
  const k = kIndependant(e);
  if (p === "k") {
    if (estAucun(v)) return k !== null ? [t("Résous l'équation « exposant = 0 » : sa solution est ici un entier entre 0 et "), l(`${n}`), t(".")] : null;
    const x = lire(v);
    if (x === null || (k !== null && egal(x, k))) return null;
    const kReel = (pp * n) / (pp + q);
    if (k === null && egal(x, kReel)) return [t("C'est bien la solution de l'équation, mais "), l("k"), t(" est un rang : il doit être un entier. Ici, aucun terme ne convient.")];
    if (k === null && Math.abs(x - kReel) < 1) return [t("Ne l'arrondis pas : "), l("k"), t(" doit annuler exactement l'exposant. La solution n'étant pas entière, aucun terme ne convient.")];
    if (k !== null && egal(x, n - k)) return [t("C'est "), l("n-k"), t(", l'exposant du premier terme ; "), l("k"), t(" est celui du second.")];
    return null;
  }
  if (k === null) {
    const x = lire(v);
    if (x !== null && !egal(x, 0)) return [t("Aucun entier "), l("k"), t(" n'annule l'exposant de "), l("x"), t(" : aucun terme n'est constant, le terme indépendant vaut "), l("0"), t(".")];
    return null;
  }
  if (estAucun(v)) return [t("L'écran précédent a donné un entier "), l("k"), t(" : le terme indépendant existe, calcule "), l(`T_{${k + 1}}`), t(".")];
  const x = lire(v);
  if (x === null) return null;
  const juste = termeIndependant(e);
  if (egal(x, juste)) return null;
  if (egal(x, C(n, k))) return [t("C'est seulement le coefficient du binôme : il faut encore multiplier par "), l(`${e.a === 1 ? "1" : e.a}^{${n - k}}`), t(" et par "), l(`(${e.b})^{${k}}`), t(".")];
  if (egal(x, -juste)) return [t("Attention au signe : "), l(`(${e.b})^{${k}}`), t(e.b < 0 ? (k % 2 === 1 ? " est négatif (exposant impair)." : " est positif (exposant pair).") : " est positif.")];
  if (k >= 1 && egal(x, coefficient(e, k - 1))) return [t("C'est le terme de rang "), l(`k=${k - 1}`), t(" ; le terme indépendant est "), l(`T_{${k + 1}}`), t(", où l'exposant de "), l("b"), t(" vaut "), l(`${k}`), t(".")];
  if (k + 1 <= n && egal(x, coefficient(e, k + 1))) return [t("Le rang du terme est "), l("k+1"), t(", mais l'exposant de "), l("b"), t(" vaut "), l("k"), t(" : prends "), l(`k=${k}`), t(".")];
  if (egal(x, C(n, k) * e.a ** k * e.b ** (n - k))) return [t("Les puissances sont échangées : "), l("a"), t(" porte l'exposant "), l("n-k"), t(" et "), l("b"), t(" l'exposant "), l("k"), t(".")];
  return null;
}
