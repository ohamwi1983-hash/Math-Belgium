import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireValeur } from "../../../../5e-4h/moteur5e/lectureValeurTrigo";
import { pgcd } from "../../../../5e-4h/ui5e/nombresTrigo";
import type { ExerciceHeron, ExerciceHeronRectangles } from "../index";
import { ecartFraction, largeurDe, longueurDe, longueursHeron } from "../index";
import type { PhaseHeron } from "../ui/formatHeron";
import { avecNotationE, dixMoinsL } from "../../nombres56";

/**
 * Vérification de `56gen20`. Longueur a₂ exacte ; largeurs et bornes au dix-millième (±1,1·10⁻⁴ :
 * arrondi ordinaire, par défaut ou par excès) ; numéro de rectangle exact ; valeur approchée à 10⁻ᵏ
 * près de √A (|x − √A| ≤ 10⁻ᵏ) ; u et v entiers exacts ; fraction égale à u₂/v₂ (irréductible :
 * sinon « à reprendre », sans tentative) ; écart à deux chiffres significatifs (demi-unité du second
 * chiffre). Saisie illisible → `parse_error` (aucune tentative, l'écran le dit).
 */

type E = ExerciceHeron;
const TOL_DIX_MILLIEME = 1.1e-4;

/** Lecture d'un nombre (notation « 9,2e-5 » acceptée en plus). */
export function lireNombre(brut: string): number | null {
  return lireValeur(avecNotationE(brut ?? ""));
}

function statut(brut: string, cible: number, tol: number): StatutVerification {
  const v = lireNombre(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tol + 1e-12 ? "correct" : "not_equivalent";
}

/** Tolérance « deux chiffres significatifs » : une demi-unité du second chiffre, un peu élargie. */
export function toleranceDeuxChiffres(x: number): number {
  const unite = 10 ** (Math.floor(Math.log10(Math.abs(x))) - 1);
  return 0.55 * unite;
}

/** Saisie écrite comme une fraction « a/b » (entiers) : numérateur et dénominateur, sinon `null`. */
function fractionEcrite(brut: string): { n: number; d: number } | null {
  const m = /^\s*([-−]?\s*\d+)\s*\/\s*(\d+)\s*$/.exec(brut ?? "");
  if (!m) return null;
  return { n: Number(m[1].replace(/[−\s]/g, (c) => (c === "−" ? "-" : ""))), d: Number(m[2]) };
}

export function diagnostiquer(e: E, phase: PhaseHeron, v: string[]): StatutVerification[] {
  if (e.type === "heron") {
    switch (phase) {
      case "rect2":
        return [statut(v[0], longueurDe(e, 2), 1e-9), statut(v[1], largeurDe(e, 2), TOL_DIX_MILLIEME)];
      case "encadrement":
        return [statut(v[0], largeurDe(e, 3), TOL_DIX_MILLIEME), statut(v[1], longueurDe(e, 3), TOL_DIX_MILLIEME)];
      case "etapes":
        return [statut(v[0], e.nPrecision, 1e-9)];
      default:
        return [statut(v[0], Math.sqrt(e.A), 10 ** -e.k)];
    }
  }
  switch (phase) {
    case "carre1":
      return [statut(v[0], e.u1, 1e-9), statut(v[1], e.v1, 1e-9)];
    case "carre2":
      return [statut(v[0], e.u2, 1e-9), statut(v[1], e.v2, 1e-9)];
    case "fraction":
      return [statut(v[0], e.num / e.den, 1e-12)];
    default: {
      const ec = ecartFraction(e);
      return [statut(v[0], ec, toleranceDeuxChiffres(ec))];
    }
  }
}

/** Fraction demandée : une valeur décimale est refusée sans tentative. */
export function approchee(e: E, phase: PhaseHeron, v: string[]): string | null {
  if (e.type !== "puissances" || phase !== "fraction") return null;
  if (/[.,]/.test(v[0] ?? "") && lireNombre(v[0]) !== null) return "On demande une fraction (écrite avec une barre, par exemple 97/56), pas une valeur décimale. Cette saisie ne compte pas comme une tentative.";
  return null;
}

/** Fraction juste mais pas irréductible : à simplifier, sans tentative. */
export function aReprendre(e: E, phase: PhaseHeron, v: string[]): Frag[] | null {
  if (e.type !== "puissances" || phase !== "fraction") return null;
  const f = fractionEcrite(v[0]);
  if (!f || f.d === 0) return null;
  if (Math.abs(f.n / f.d - e.num / e.den) > 1e-12) return null;
  if (pgcd(f.n, f.d) === 1) return null;
  return [tx("La valeur est juste, mais la fraction n'est pas irréductible : simplifie-la (divise le numérateur et le dénominateur par leur plus grand diviseur commun).")];
}

function proche(brut: string, cible: number, tol: number): boolean {
  const x = lireNombre(brut);
  return x !== null && Math.abs(x - cible) <= tol + 1e-12;
}

function piegeEtapes(e: ExerciceHeronRectangles, brut: string): Frag[] | null {
  const x = lireNombre(brut);
  if (x === null) return null;
  const toutes = longueursHeron(e.A, e.q, 14);
  const ecart = (n: number) => toutes[n - 1] - e.A / toutes[n - 1];
  const eps = 10 ** -e.k;
  if (Number.isInteger(x) && x >= 1 && x <= toutes.length) {
    if (ecart(x) >= eps) return [tx("Au rectangle "), lx(`${x}`), tx(", l'écart est encore supérieur ou égal à "), lx(dixMoinsL(e.k)), tx(" : continue l'algorithme.")];
    if (x === e.nPrecision + 1) return [tx("L'écart était déjà inférieur à "), lx(dixMoinsL(e.k)), tx(" au rectangle précédent. Le rectangle de départ porte le numéro 1.")];
    return [tx("L'écart était déjà sous le seuil plus tôt : cherche le premier rectangle qui convient.")];
  }
  return [tx("Donne le numéro du rectangle (le rectangle de départ est le numéro 1), pas une longueur ni un écart.")];
}

export function piege(e: E, phase: PhaseHeron, v: string[]): Frag[] | null {
  if (e.type === "heron") {
    const A = e.A;
    switch (phase) {
      case "rect2": {
        const msg: Frag[] = [];
        if (proche(v[0], e.p + e.q, 1e-9)) msg.push(tx("La moyenne arithmétique des deux côtés est leur somme divisée par 2. "));
        else if (proche(v[0], Math.sqrt(A), 1e-3)) msg.push(tx("C'est la valeur de la calculatrice : on demande la longueur du deuxième rectangle de l'algorithme. "));
        if (proche(v[1], e.p, 1e-9)) msg.push(tx("La largeur change aussi : c'est l'aire divisée par la nouvelle longueur. "));
        else if (proche(v[1], longueurDe(e, 2), 1e-6) && proche(v[0], largeurDe(e, 2), TOL_DIX_MILLIEME)) msg.push(tx("Tu as inversé : la longueur est la moyenne des côtés, la largeur l'aire divisée par la longueur. "));
        else if (proche(v[1], A / (e.p + e.q), TOL_DIX_MILLIEME)) msg.push(tx("Divise l'aire par la longueur "), lx("a_2"), tx(", la moitié de la somme des côtés. "));
        return msg.length ? msg : null;
      }
      case "encadrement": {
        if (proche(v[0], largeurDe(e, 2), TOL_DIX_MILLIEME) || proche(v[1], longueurDe(e, 2), TOL_DIX_MILLIEME)) return [tx("C'est l'encadrement donné par le deuxième rectangle : calcule d'abord "), lx("a_3"), tx(".")];
        if (proche(v[0], longueurDe(e, 3), TOL_DIX_MILLIEME) && proche(v[1], largeurDe(e, 3), TOL_DIX_MILLIEME)) return [tx("Le minorant est la largeur (le plus petit côté), le majorant la longueur.")];
        if (proche(v[0], Math.sqrt(A), 2e-4) || proche(v[1], Math.sqrt(A), 2e-4)) return [tx("C'est la valeur de la calculatrice : les bornes sont la largeur et la longueur du troisième rectangle.")];
        return null;
      }
      case "etapes":
        return piegeEtapes(e, v[0]);
      default: {
        const x = lireNombre(v[0]);
        if (x === null) return null;
        if (Math.abs(x - Math.sqrt(A)) <= 10 ** -(e.k - 1)) return [tx("Pas assez précis : la valeur doit être à moins de "), lx(dixMoinsL(e.k)), tx(` de la racine ; garde au moins ${e.k} décimales.`)];
        return [tx("Prends un nombre compris entre la largeur et la longueur du rectangle trouvé à l'écran précédent.")];
      }
    }
  }
  switch (phase) {
    case "carre1":
    case "carre2": {
      const w = phase === "carre1" ? e.v1 : e.v2;
      if (proche(v[1], -w, 1e-9)) return [tx("Le résultat s'écrit "), lx(`u-v\\sqrt{${e.P}}`), tx(" : "), lx("v"), tx(" est positif (le signe « − » est déjà dans l'écriture).")];
      if (phase === "carre1") {
        if (proche(v[1], e.c, 1e-9)) return [tx("N'oublie pas le double produit : "), lx(`2\\cdot ${e.c}\\cdot\\sqrt{${e.P}}`), tx(".")];
        if (proche(v[0], e.c * e.c, 1e-9) || proche(v[0], e.c * e.c - e.P, 1e-9)) return [tx("Le carré de la racine est positif : "), lx(`(\\sqrt{${e.P}})^2=${e.P}`), tx(", qui s'ajoute à "), lx(`${e.c}^2`), tx(".")];
      } else {
        if (proche(v[0], e.u1 * e.u1 + e.v1 * e.v1, 1e-9)) return [tx("Le carré de "), lx(`${e.v1}\\sqrt{${e.P}}`), tx(" vaut "), lx(`${e.v1}^2\\cdot ${e.P}`), tx(", pas "), lx(`${e.v1}^2`), tx(".")];
        if (proche(v[0], e.u1 * e.u1 - e.P * e.v1 * e.v1, 1e-9)) return [tx("Le carré du second terme s'ajoute : "), lx("(a-b)^2=a^2-2ab+b^2"), tx(".")];
        if (proche(v[1], e.u1 * e.v1, 1e-9)) return [tx("N'oublie pas le facteur 2 du double produit.")];
      }
      return null;
    }
    case "fraction": {
      const x = lireNombre(v[0]);
      if (x === null) return null;
      if (Math.abs(x - e.den / e.num) < 1e-9) return [tx("Tu as inversé : "), lx(`v\\sqrt{${e.P}}\\approx u`), tx(" donne "), lx(`\\sqrt{${e.P}}\\approx\\dfrac{u}{v}`), tx(".")];
      if (Math.abs(x - e.u1 / e.v1) < 1e-9) return [tx("C'est la fraction obtenue avec le premier carré : utilise le deuxième, plus proche de 0, donc plus précis.")];
      return null;
    }
    default: {
      const x = lireNombre(v[0]);
      if (x === null) return null;
      const ec = ecartFraction(e);
      if (Math.abs(x + ec) <= toleranceDeuxChiffres(ec)) return [tx("La fraction est plus grande que la racine : l'écart demandé (la fraction moins la racine) est positif.")];
      for (const f of [10, 100, 0.1, 0.01]) if (Math.abs(x - ec * f) <= toleranceDeuxChiffres(ec * f)) return [tx("Vérifie la puissance de 10 : relis l'exposant affiché par la calculatrice.")];
      return null;
    }
  }
}
