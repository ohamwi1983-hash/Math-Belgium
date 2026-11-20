import type { ExerciceInverse, ExercicePuissances, ExerciceSimplifier } from "../core6e/puissancesSansCalculatrice.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { baseDecimaleL, idAttendu, puissanceExacte, valeurInverse } from "../ui6e/formatPuissancesSansCalculatrice";
import type { PhasePuissances } from "../ui6e/formatPuissancesSansCalculatrice";
import { qVal } from "../ui6e/nombresExp";
import { egal, estApprochee, lireFonction, lireNombre, memesFonctions, MESSAGE_APPROCHEE, statutNombre } from "./lectureValeurExp";

/**
 * Vérification de 6gen146 : comparaison NUMÉRIQUE (toute écriture exacte équivalente acceptée :
 * « 1+√3−√3 », « 2^(−3) », « 1/8 », « 0,125 » pour 1/8…), choix fermés comparés à leur identifiant.
 * Exposant en x : comparé en cinq points. Messages ciblés sur les erreurs du cours (exposants
 * multipliés au lieu d'additionnés, signe de 1/a = a⁻¹, base a² non réécrite…), jamais la réponse.
 */

type E = ExercicePuissances;
const POINTS_X = [-2, -1, 0.5, 1, 3];

/** Valeurs attendues des champs. */
export function valeurAttendue(e: ExerciceSimplifier | ExerciceInverse, phase: PhasePuissances): number {
  if (e.variante === "simplifier") return phase === "exposant" ? e.n : qVal(puissanceExacte(e.a, e.n));
  return qVal(valeurInverse(e));
}

export function diagnostiquer(e: E, phase: PhasePuissances, valeurs: string[]): StatutVerification[] {
  if (e.variante === "comparer") return [valeurs[0] === idAttendu(e, phase) ? "correct" : "not_equivalent"];
  if (e.variante === "inverse" && phase === "exposant") {
    const f = lireFonction(valeurs[0] ?? "", "x");
    if (!f) return ["parse_error"];
    return [memesFonctions(f, (x) => e.m * x + e.c, POINTS_X) ? "correct" : "not_equivalent"];
  }
  return [statutNombre(valeurs[0] ?? "", valeurAttendue(e, phase))];
}

export function approchee(e: E, phase: PhasePuissances, valeurs: string[]): string | null {
  if (e.variante === "comparer" || (e.variante === "inverse" && phase === "exposant")) return null;
  return estApprochee(valeurs[0] ?? "", valeurAttendue(e, phase)) ? MESSAGE_APPROCHEE : null;
}

export function piege(e: E, phase: PhasePuissances, valeurs: string[]): Frag[] | null {
  if (e.variante === "comparer") {
    if (phase === "conclusion" && !e.croissante && e.relation !== "=" && valeurs[0] === e.relationExposants) return [tx("La base est comprise entre 0 et 1 : la fonction exponentielle de cette base inverse l'ordre.")];
    if (phase === "sens") return [tx("Regarde la position de la base par rapport à 1.")];
    return null;
  }
  const v = valeurs[0] ?? "";
  if (e.variante === "simplifier") {
    const x = lireNombre(v);
    if (x === null) return null;
    if (phase === "exposant") {
      const rk = e.r * Math.sqrt(e.k);
      if (e.sousType === "produit" && egal(x, (e.p + rk) * (e.s - rk))) return [tx("Pour un produit de puissances de même base, on additionne les exposants (règle (1)), on ne les multiplie pas.")];
      if (e.sousType === "quotient" && (egal(x, e.p + e.s + 2 * rk) || egal(x, (e.p + rk) / (e.s + rk)))) return [tx("Pour un quotient de puissances de même base, on soustrait les exposants (règle (2)) : l'exposant du dénominateur est retranché en entier.")];
      if (e.sousType === "puissance" && egal(x, Math.sqrt(e.k) + rk)) return [tx("Pour une puissance de puissance, on multiplie les exposants (règle (4)), on ne les additionne pas.")];
      if (e.sousType === "base" && egal(x, e.s - e.r * Math.sqrt(e.k))) return [lx(`${e.a * e.a}`), tx(" n'est pas "), lx(`${e.a}`), tx(" : écris d'abord "), lx(`${e.a * e.a}=${e.a}^{2}`), tx(", ce qui double l'exposant.")];
      if (!Number.isInteger(Math.round(x * 1e9) / 1e9)) return [tx("Les termes en "), lx(`\\sqrt{${e.k}}`), tx(" doivent disparaître : l'exposant final est un entier.")];
      return null;
    }
    if (e.n < 0 && egal(x, -(e.a ** -e.n))) return [tx("Un exposant négatif donne un inverse, pas un nombre négatif : "), lx("a^{-n}=\\dfrac{1}{a^{n}}"), tx(".")];
    if (egal(x, e.a * e.n)) return [lx(`${e.a}^{${e.n}}`), tx(" n'est pas le produit "), lx(`${e.a}\\times${e.n < 0 ? `(${e.n})` : e.n}`), tx(".")];
    return null;
  }
  if (phase === "exposant") {
    const f = lireFonction(v, "x");
    if (f && memesFonctions(f, (x) => -(e.m * x + e.c), POINTS_X))
      return e.sousType === "decimale"
        ? [tx("Attention au signe : "), lx(`${baseDecimaleL(e.a, e.i)}=\\dfrac{1}{${e.a ** e.i}}=${e.a}^{-${e.i}}`), tx(".")]
        : [tx("Attention au signe : "), lx(`\\dfrac{1}{${e.a}}=${e.a}^{-1}`), tx(".")];
    if (f && e.sousType !== "inverse" && memesFonctions(f, (x) => (e.m + e.j - 1) * x + e.c, POINTS_X)) return [lx(`${e.a ** e.j}`), tx(" n'est pas "), lx(`${e.a}`), tx(" : "), lx(`${e.a ** e.j}=${e.a}^{${e.j}}`), tx(".")];
    return null;
  }
  const x = lireNombre(v);
  const e0 = e.m * e.x0 + e.c;
  if (x !== null && e0 < 0 && egal(x, -(e.a ** -e0))) return [tx("Un exposant négatif donne un inverse, pas un nombre négatif : "), lx("a^{-n}=\\dfrac{1}{a^{n}}"), tx(".")];
  return null;
}
