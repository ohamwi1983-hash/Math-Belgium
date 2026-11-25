import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice101, Phase101 } from "../core6e/equationsCombinatoires";
import { coefficients, nMin, polynome, racines101, solutionSymetrie } from "../core6e/equationsCombinatoires";
import { contientSymboleCombinatoire, lireCompte, lireListeEntiers, lirePolynomeN, memePolynome, vautEntier } from "./lectureCombinatoireLotH";

/**
 * Vérification de `6gen101`. Saisie lue avant tout verdict (illisible → `parse_error`, aucune
 * tentative). Polynôme : toute écriture équivalente (factorisée ou développée), comparée en sept
 * points ; une expression qui contient encore une factorielle ou un Cₙᵏ / Aₙᵏ est « à reprendre »
 * (message, aucune tentative). Racines : deux entiers dans n'importe quel ordre. Messages ciblés :
 * n! confondu avec n (pas de simplification), dénominateur 2! oublié, une seule racine donnée,
 * racine négative gardée, solution de l'équation du second degré qui ne convient pas, k = k + d.
 */

type E = Exercice101;
type P = Phase101;
const t = tx;
const l = lx;

export const BONNE_PROPRIETE = "somme";

export function diagnostiquer101(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  switch (p) {
    case "propriete":
      return [v === BONNE_PROPRIETE ? "correct" : "not_equivalent"];
    case "polynome": {
      // Encore écrit avec « ! », C ou A : lisible, mais à reprendre (`aReprendre101`, sans tentative).
      if (contientSymboleCombinatoire(v)) return ["not_equivalent"];
      const f = lirePolynomeN(v);
      if (!f) return ["parse_error"];
      return [memePolynome(f, polynome(e)) ? "correct" : "not_equivalent"];
    }
    case "racines": {
      const xs = lireListeEntiers(v);
      if (!xs) return ["parse_error"];
      const [a, b] = racines101(e);
      const tri = [...xs].sort((x, y) => x - y);
      return [tri.length === 2 && tri[0] === a && tri[1] === b ? "correct" : "not_equivalent"];
    }
    case "admissible":
      if (lireCompte(v) === null) return ["parse_error"];
      return [vautEntier(v, e.sol) ? "correct" : "not_equivalent"];
    case "valeur":
      if (lireCompte(v) === null) return ["parse_error"];
      return [vautEntier(v, solutionSymetrie(e)) ? "correct" : "not_equivalent"];
  }
}

/** Expression encore écrite avec « ! », Cₙᵏ ou Aₙᵏ : message, aucune tentative. */
export function aReprendre101(_e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p !== "polynome") return null;
  return contientSymboleCombinatoire(valeurs[0] ?? "")
    ? [t("Écris le membre de gauche sans factorielle ni "), l("C"), t(" ou "), l("A"), t(" : un polynôme en "), l("n"), t(" (développé ou factorisé). Cette saisie ne compte pas comme une tentative.")]
    : null;
}

export function piege101(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "propriete") {
    if (v === "aucune") return [t("Deux indices différents peuvent donner le même coefficient : c'est la symétrie "), l("C_n^k=C_n^{n-k}"), t(".")];
    if (v === "difference" || v === "produit") return [t("Par la symétrie "), l("C_n^k=C_n^{n-k}"), t(", les deux indices sont complémentaires : leur somme vaut le nombre du haut.")];
    return null;
  }
  if (p === "polynome") {
    const f = lirePolynomeN(v);
    if (!f) return null;
    const { alpha, beta, gamma } = coefficients(e);
    if (alpha === 0.5 && memePolynome(f, (n) => n * n + beta * n + gamma)) return [t("N'oublie pas de diviser par "), l("2!=2"), t(" : une combinaison est un arrangement divisé par "), l("k!"), t(".")];
    if (memePolynome(f, (n) => n)) return [t("Une factorielle n'est pas le nombre lui-même : "), l("n!=n\\times(n-1)\\times\\cdots\\times 1"), t(".")];
    return null;
  }
  if (p === "racines") {
    const xs = lireListeEntiers(v);
    if (!xs) return null;
    const [a, b] = racines101(e);
    if (xs.length === 1 && (xs[0] === a || xs[0] === b)) return [t("Une équation du second degré de discriminant positif a deux solutions : donne les deux (on triera à l'écran suivant).")];
    if (xs.length === 2 && [...xs].sort((x, y) => x - y)[0] === -b && [...xs].sort((x, y) => x - y)[1] === -a) return [t("Les signes des deux solutions sont inversés : "), l("n=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), t(".")];
    return null;
  }
  if (p === "admissible") {
    const r = lireCompte(v);
    const [a] = racines101(e);
    if (r === a) return [t("Cette solution est négative : "), l("n"), t(" est un nombre naturel (et il faut "), l(`n\\ge ${nMin(e)}`), t(").")];
    return null;
  }
  if (p === "valeur") {
    const r = lireCompte(v);
    if (e.inconnue === "n" && r === e.q - e.p) return [t("Les deux indices sont complémentaires : on additionne, "), l(`n=${e.p}+${e.q}`), t(".")];
    if (e.inconnue === "k" && r === (e.p - e.q) / 2 + e.q) return [t("C'est "), l(`k+${e.q}`), t(" ; on demande "), l("k"), t(".")];
    return null;
  }
  return null;
}
