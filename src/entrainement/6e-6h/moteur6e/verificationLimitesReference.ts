import type { ExerciceLimitesRef } from "../core6e/limitesReference.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { formeAttendue, limite, morceaux, referencesAcceptees, valeurLimiteNum } from "../ui6e/formatLimitesReference";
import type { PhaseLimitesRef } from "../ui6e/formatLimitesReference";
import { egal, estApprochee, lireLimite, MESSAGE_APPROCHEE, statutLimite } from "./lectureValeurExp";

/**
 * Vérification de 6gen145 : choix fermés comparés à leur identifiant (deux références acceptées
 * quand le cours en offre deux), valeur comparée NUMÉRIQUEMENT (fraction, « 3ln2/2 », « ln(3/2) »,
 * « ln3 − ln2 », « +∞ », « -inf »…). Messages ciblés sur les erreurs du cours (rapport inversé,
 * facteur ln a oublié, dominance renversée, terme constant oublié, signe de xⁿ en −∞).
 */

type E = ExerciceLimitesRef;

export function diagnostiquer(e: E, phase: PhaseLimitesRef, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (phase === "forme") return [v === formeAttendue(e) ? "correct" : "not_equivalent"];
  if (phase === "reference") return [(referencesAcceptees(e) as string[]).includes(v) ? "correct" : "not_equivalent"];
  return [statutLimite(v, valeurLimiteNum(limite(e)))];
}

export function approchee(e: E, phase: PhaseLimitesRef, valeurs: string[]): string | null {
  if (phase !== "valeur") return null;
  return estApprochee(valeurs[0] ?? "", valeurLimiteNum(limite(e))) ? MESSAGE_APPROCHEE : null;
}

/** Limites des morceaux, en une phrase (explications des choix fermés). */
function phraseMorceaux(e: E): Frag[] {
  return morceaux(e).flatMap((m, i) => [tx(i === 0 ? "Le " : " ; le "), tx(m.role), tx(" tend vers "), lx(m.lim)]);
}

export function piege(e: E, phase: PhaseLimitesRef, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (phase === "forme") {
    if (v === "aucune") return [...phraseMorceaux(e), tx(" : c'est une forme indéterminée, il faut transformer l'expression.")];
    if (formeAttendue(e) === "aucune") return [...phraseMorceaux(e), tx(" : les règles de calcul donnent directement la limite, il n'y a rien d'indéterminé.")];
    return [...phraseMorceaux(e), tx(".")];
  }
  if (phase === "reference") {
    if (e.variante === "pasFI") return [tx("La forme n'est pas indéterminée : aucune limite de référence n'est nécessaire.")];
    if (v === "R5") return [tx("La forme est indéterminée : les règles de calcul ne suffisent pas, il faut une limite de référence.")];
    if (e.point === "0") return [tx("En 0, les références sont celles du nombre dérivé de l'exponentielle : "), lx(e.variante === "base0" ? "\\dfrac{a^{x}-1}{x}\\to\\ln a" : "\\dfrac{e^{u}-1}{u}\\to 1"), tx(".")];
    return [tx("En l'infini, c'est la dominance de l'exponentielle (base plus grande que 1) qui conclut.")];
  }
  const x = lireLimite(v);
  if (x === null) return null;
  const L = valeurLimiteNum(limite(e));
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      if (egal(x, e.m / e.k)) return [tx("Tu as inversé le rapport : le coefficient de "), lx("x"), tx(" dans l'exponentielle va au numérateur.")];
      if (egal(x, 1)) return [tx("La limite de référence vaut 1, mais il reste un facteur constant devant.")];
      break;
    case "expo0/inverse":
      if (egal(x, e.k / e.m)) return [tx("Ici l'exponentielle est au dénominateur : le rapport est inversé par rapport à "), lx("\\dfrac{e^{u}-1}{u}"), tx(".")];
      break;
    case "base0/quotient":
      if (egal(x, e.k / e.m)) return [tx("Il manque le facteur "), lx(`\\ln ${e.a}`), tx(" : la référence en base "), lx(`${e.a}`), tx(" vaut "), lx(`\\ln ${e.a}`), tx(", pas 1.")];
      if (egal(x, Math.log(e.a))) return [tx("La référence vaut "), lx(`\\ln ${e.a}`), tx(", mais il reste un facteur constant devant.")];
      break;
    case "base0/difference":
      if (egal(x, Math.log(e.a / e.b) * -1)) return [tx("Attention à l'ordre : le premier quotient donne "), lx(`\\ln ${e.a}`), tx(".")];
      break;
  }
  if (L === 0 && x === Infinity && e.variante === "plusInfini") return [tx("L'exponentielle l'emporte sur toute puissance de "), lx("x"), tx(", même de grand exposant.")];
  if (L === Infinity && x === 0 && e.variante === "plusInfini") return [tx("Ici l'exponentielle est au numérateur (ou c'est elle qu'on garde) : c'est elle qui l'emporte.")];
  if (L === Infinity && x === -Infinity && e.variante === "plusInfini") return [tx("L'exponentielle l'emporte sur le terme retranché : la différence tend vers "), lx("+\\infty"), tx(".")];
  if (e.variante === "moinsInfini" && !Number.isFinite(x)) return [tx("En "), lx("-\\infty"), tx(", l'exponentielle tend vers 0 et l'emporte sur "), lx("x^{n}"), tx(".")];
  if (e.variante === "moinsInfini" && e.d !== 0 && egal(x, 0)) return [tx("Le produit tend vers 0, mais le terme constant reste.")];
  if (e.sousType === "quotientMoins" && egal(x, -L)) return [tx("Attention au signe de "), lx("x^{n}"), tx(" quand "), lx("x\\to-\\infty"), tx(" : l'exposant "), lx(`${e.n}`), tx(e.n % 2 === 0 ? " est pair." : " est impair.")];
  if (e.variante === "pasFI" && L === Infinity && egal(x, 0)) return [tx("Un produit (ou une somme) de deux quantités qui tendent vers "), lx("+\\infty"), tx(" n'est pas indéterminé.")];
  return null;
}
