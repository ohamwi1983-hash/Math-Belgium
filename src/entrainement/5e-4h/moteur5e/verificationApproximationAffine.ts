import type { ExerciceApproximationAffine } from "../core5e/approximationAffine";
import { approximation, derivee, erreur, fa, fpa, nombre, pointsControle } from "../core5e/approximationAffine";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { aL, nomF } from "../ui5e/formatApproximationAffine";
import { decL } from "../ui5e/ecrituresApplicationsDerivees";
import type { PhaseApproximationAffine } from "../ui5e/formatApproximationAffine";
import { egal, lireFonctionVar, lireNombre, memesFonctions, statut, statutNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen68`. Saisie LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireNombre` (fractions, π, notation scientifique, unité finale ignorée),
 * f′(x) comparée en cinq ou six points (toute écriture équivalente ; sin, cos, tan en radians).
 * Erreur commise : tolérance de 6 % (arrondi à deux chiffres significatifs), jamais une valeur
 * négative. Messages ciblés : h de signe faux ou égal au nombre, a non remarquable, facteur ½ oublié,
 * signe de la dérivée de 1/x ou de cos, exposant non diminué, approximation sans h ou sans f(a).
 */

type E = ExerciceApproximationAffine;
const estTrigo = (e: E) => e.fn === "sin" || e.fn === "cos" || e.fn === "tan";

/** Tolérance relative de l'erreur commise (deux chiffres significatifs). */
export const TOLERANCE_ERREUR = 0.06;

export function diagnostiquer(e: E, p: PhaseApproximationAffine, valeurs: string[]): StatutVerification[] {
  if (p === "ah") return [statutNombre(valeurs[0] ?? "", e.a), statutNombre(valeurs[1] ?? "", e.h)];
  if (p === "derivee") {
    const f = lireFonctionVar(valeurs[0] ?? "");
    if (!f) return ["parse_error"];
    return [statut(memesFonctions(f, derivee(e), pointsControle(e)))];
  }
  if (p === "valeurs") return [statutNombre(valeurs[0] ?? "", fa(e)), statutNombre(valeurs[1] ?? "", fpa(e))];
  if (p === "approx") return [statutNombre(valeurs[0] ?? "", approximation(e))];
  const v = lireNombre(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  const err = erreur(e);
  return [statut(Math.abs(v - err) <= TOLERANCE_ERREUR * err)];
}

export function piege(e: E, p: PhaseApproximationAffine, valeurs: string[]): Frag[] | null {
  const F = nomF(e);
  if (p === "ah") {
    const a = lireNombre(valeurs[0] ?? "");
    const h = lireNombre(valeurs[1] ?? "");
    if (a !== null && egal(a, e.a) && h !== null) {
      if (egal(h, -e.h)) return [tx("Vérifie : "), lx("a+h"), tx(" doit redonner le nombre de départ. Ici h est "), tx(e.h < 0 ? "négatif." : "positif.")];
      if (egal(h, nombre(e))) return [tx("h n'est pas le nombre lui-même : c'est l'écart entre ce nombre et a.")];
      return null;
    }
    if (a !== null && !egal(a, e.a)) {
      if (e.aPi !== 0 && Math.abs(a - e.a) < 0.01) return [tx("Garde la valeur exacte de a (avec π) : "), lx(`${F}(a)`), tx(" et "), lx(`${F}'(a)`), tx(" deviennent alors remarquables.")];
      if (e.fn === "racine" && !e.contexte) return [tx("a doit être un carré parfait, pour que sa racine se calcule sans calculatrice.")];
      if (h !== null && egal(a + h, nombre(e))) return [tx("Ta décomposition redonne bien le nombre, mais choisis a pour que "), lx(`${F}(a)`), tx(" et "), lx(`${F}'(a)`), tx(" se calculent de tête, avec h le plus petit possible.")];
    }
    return null;
  }
  if (p === "derivee") {
    const f = lireFonctionVar(valeurs[0] ?? "");
    if (!f) return null;
    const pts = pointsControle(e);
    const g = derivee(e);
    if (memesFonctions(f, (x) => -g(x), pts)) return [tx("Le signe est faux : revois la dérivée de référence (cours, § 3).")];
    if (e.fn === "racine" && memesFonctions(f, (x) => 2 * g(x), pts)) return [tx("Il manque le facteur 2 au dénominateur : "), lx("(\\sqrt{x})'=\\dfrac{1}{2\\sqrt{x}}"), tx(".")];
    if (e.fn === "puissance" && memesFonctions(f, (x) => e.n * x ** e.n, pts)) return [tx("L'exposant passe devant, puis il diminue de 1.")];
    if (e.fn === "puissance" && memesFonctions(f, (x) => x ** (e.n - 1), pts)) return [tx("N'oublie pas l'ancien exposant, qui passe devant comme facteur.")];
    if (e.fn === "tan" && memesFonctions(f, (x) => 1 / Math.sin(x) ** 2, pts)) return [tx("La dérivée de la tangente fait intervenir le cosinus, pas le sinus.")];
    return null;
  }
  if (p === "valeurs") {
    const v1 = lireNombre(valeurs[1] ?? "");
    if (v1 === null) return null;
    if (egal(v1, -fpa(e))) return [tx("Signe de "), lx(`${F}'(${aL(e)})`), tx(estTrigo(e) ? " faux : vérifie la dérivée et la valeur du sinus ou du cosinus en a." : " faux : vérifie le signe de la dérivée.")];
    if (e.fn === "racine" && egal(v1, 2 * fpa(e))) return [tx("N'oublie pas le facteur 2 du dénominateur.")];
    if (egal(v1, fa(e)) && !egal(fa(e), fpa(e))) return [tx("Tu as recopié "), lx(`${F}(${aL(e)})`), tx(" : la pente se calcule avec la dérivée.")];
    return null;
  }
  if (p === "approx") {
    const v = lireNombre(valeurs[0] ?? "");
    if (v === null) return null;
    const A = fa(e);
    const B = fpa(e);
    if (egal(v, A - B * e.h) && e.h !== 0) return [tx("Attention au signe de h : remplace h par "), lx(decL(e.h)), tx(" avec son signe.")];
    if (egal(v, B * e.h) && A !== 0) return [tx("Tu as calculé la variation "), lx(`${F}'(a)\\cdot h`), tx(" : il faut encore l'ajouter à "), lx(`${F}(a)`), tx(".")];
    if (egal(v, A + B)) return [tx("La pente doit être multipliée par l'écart h.")];
    if (egal(v, A + e.h) && B !== 1) return [tx("Multiplie h par la pente "), lx(`${F}'(a)`), tx(" avant de l'ajouter.")];
    return null;
  }
  const v = lireNombre(valeurs[0] ?? "");
  if (v === null) return null;
  const err = erreur(e);
  if (v < 0 && Math.abs(-v - err) <= TOLERANCE_ERREUR * err) return [tx("L'erreur est un écart : on la donne positive (valeur absolue de la différence).")];
  for (const k of [10, 100, 0.1, 0.01])
    if (Math.abs(Math.abs(v) - err * k) <= TOLERANCE_ERREUR * err * k) return [tx("L'ordre de grandeur est faux : compte bien les zéros après la virgule.")];
  if (estTrigo(e) && egal(v, Math.abs(approximation(e)))) return [tx("C'est ton approximation : l'erreur est l'écart entre elle et la valeur affichée.")];
  return null;
}
