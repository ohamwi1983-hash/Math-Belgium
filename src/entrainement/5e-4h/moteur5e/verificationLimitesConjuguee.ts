import type { ExerciceConjuguee } from "../core5e/limitesConjuguee";
import { conjuguee, expressionAB, forme, limite, partielles, pointsControle, produit } from "../core5e/limitesConjuguee";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { exacteV, limiteL, polyV } from "../ui5e/ecrituresLimitesLotG";
import type { PhaseConjuguee } from "../ui5e/formatLimitesConjuguee";
import { MESSAGE_APPROCHEE, negatif, termesAB } from "../ui5e/formatLimitesConjuguee";
import { contientRacine, estApprochee, lireFonctionX, lireLimite, memeLimite, memesValeurs } from "./lectureLimitesLotG";

/**
 * Vérification de `5gen64`. Toute saisie est LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : expressions en x comparées en cinq points du domaine (`pointsControle` : grands x
 * pour ±∞, voisinage de la valeur visée pour 0/0), nombres et infinis par `lireLimite`. Une valeur
 * décimale proche d'une valeur exacte irrationnelle est « approchée » (message, aucune tentative) ;
 * un produit juste en valeur mais encore écrit avec une racine est « à reprendre » (aucune tentative).
 * Messages ciblés : ∞ − ∞ = 0, ∞/∞ = 1, conjuguée = expression elle-même, A² + B², carré du
 * coefficient oublié, √(x²) = x en −∞, r + r oublié.
 */

type E = ExerciceConjuguee;
type F = (x: number) => number;

const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");

function lireF(s: string): F | null {
  return lireFonctionX(s);
}

export function diagnostiquer(e: E, p: PhaseConjuguee, valeurs: string[]): StatutVerification[] {
  const pts = pointsControle(e);
  if (p === "forme") return [st(valeurs[0] === forme(e))];
  if (p === "transformer") {
    if (e.sous === "E1") {
      const f = lireF(valeurs[0] ?? "");
      if (!f) return ["parse_error"];
      return [st(memesValeurs(f, (x) => -x, pts))];
    }
    const c = lireF(valeurs[0] ?? "");
    const pr = lireF(valeurs[1] ?? "");
    const prod = produit(e)!;
    return [c ? st(memesValeurs(c, conjuguee(e)!, pts)) : "parse_error", pr ? st(memesValeurs(pr, (x) => polyV(prod, x), pts)) : "parse_error"];
  }
  if (p === "partielles") {
    const [n, d] = partielles(e);
    const a = lireLimite(valeurs[0] ?? "");
    const b = lireLimite(valeurs[1] ?? "");
    return [a === null ? "parse_error" : st(memeLimite(a, n)), b === null ? "parse_error" : st(memeLimite(b, d))];
  }
  const v = lireLimite(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  return [st(memeLimite(v, exacteV(limite(e))))];
}

export function approchee(e: E, p: PhaseConjuguee, valeurs: string[]): string | null {
  if (p === "limite") return estApprochee(valeurs[0] ?? "", exacteV(limite(e))) ? MESSAGE_APPROCHEE : null;
  if (p === "partielles") {
    const [n, d] = partielles(e);
    return estApprochee(valeurs[0] ?? "", n) || estApprochee(valeurs[1] ?? "", d) ? MESSAGE_APPROCHEE : null;
  }
  return null;
}

/** Produit juste en valeur mais encore écrit avec une racine ; facteur juste écrit |x| ou √(x²). */
export function aReprendre(e: E, p: PhaseConjuguee, valeurs: string[]): Frag[] | null {
  if (p !== "transformer") return null;
  const pts = pointsControle(e);
  if (e.sous === "E1") {
    const f = lireF(valeurs[0] ?? "");
    if (f && memesValeurs(f, (x) => -x, pts) && /\||√|sqrt|racine/i.test(valeurs[0] ?? "")) return [tx("C'est juste, mais écris-le sans valeur absolue ni racine : ici x < 0.")];
    return null;
  }
  const pr = lireF(valeurs[1] ?? "");
  const prod = produit(e)!;
  if (pr && memesValeurs(pr, (x) => polyV(prod, x), pts) && contientRacine(valeurs[1] ?? "")) {
    const [A] = termesAB(e);
    return [tx("C'est juste, mais développe et réduis le produit : "), lx(`\\left(${A}\\right)^2`), tx(" s'écrit sans racine.")];
  }
  return null;
}

export function piege(e: E, p: PhaseConjuguee, valeurs: string[]): Frag[] | null {
  const pts = pointsControle(e);
  const fo = forme(e);
  if (p === "forme") {
    const v = valeurs[0];
    if (v === "aucune") {
      if (fo === "infMoinsInf") return [tx("Les deux morceaux tendent vers l'infini : "), lx("\\infty-\\infty"), tx(" ne vaut pas 0, on ne peut pas conclure sans transformer l'expression.")];
      if (fo === "zeroSurZero") return [tx("Le numérateur et le dénominateur tendent tous deux vers 0 : "), lx("\\dfrac{0}{0}"), tx(" ne vaut ni 0 ni 1.")];
      return [tx("Le numérateur et le dénominateur tendent tous deux vers l'infini : "), lx("\\dfrac{\\infty}{\\infty}"), tx(" ne vaut pas 1.")];
    }
    if (fo === "infMoinsInf") return [tx("L'expression est une différence, pas un quotient : regarde la limite de chacun des deux termes.")];
    if (fo === "zeroSurZero") return [tx("x tend vers un nombre : remplace x par ce nombre dans le numérateur et dans le dénominateur.")];
    return [tx("L'expression est un quotient et x tend vers "), lx("-\\infty"), tx(" : regarde la limite du numérateur et celle du dénominateur.")];
  }
  if (p === "transformer") {
    if (e.sous === "E1") {
      const f = lireF(valeurs[0] ?? "");
      if (f && memesValeurs(f, (x) => x, pts)) return [tx("Ici x < 0 : "), lx("\\sqrt{x^2}=|x|=-x"), tx(", pas x (une racine carrée n'est jamais négative).")];
      return null;
    }
    const c = lireF(valeurs[0] ?? "");
    const ab = expressionAB(e)!;
    const conj = conjuguee(e)!;
    if (c && memesValeurs(c, ab, pts)) return [tx("C'est l'expression elle-même : l'expression conjuguée change le signe entre les deux termes.")];
    if (c && memesValeurs(c, (x) => -conj(x), pts)) return [tx("Change seulement le signe qui sépare les deux termes ; le premier terme garde son signe.")];
    const pr = lireF(valeurs[1] ?? "");
    if (!pr || !c || !memesValeurs(c, conj, pts)) return null;
    const B = termesAB(e)[1];
    // A² + B² au lieu de A² − B².
    const somme = (x: number) => 2 * a2(e, x) - polyV(produit(e)!, x);
    if (memesValeurs(pr, somme, pts)) return [lx("(A-B)(A+B)=A^2-B^2"), tx(" : le carré de "), lx(B), tx(" est soustrait, pas ajouté.")];
    // Coefficient de x non élevé au carré (A, E2 avec p ≥ 2) ; B non élevé au carré (C, D).
    if ((e.sous === "A" || e.sous === "E2") && e.d.p > 1 && memesValeurs(pr, (x) => a2(e, x) - e.d.p * x * x, pts)) return [lx(`\\left(${B.replace(/^-/, "")}\\right)^2=${e.d.p * e.d.p}x^2`), tx(" : le coefficient est aussi élevé au carré.")];
    if ((e.sous === "C" || e.sous === "D") && memesValeurs(pr, (x) => a2(e, x) - b1(e), pts)) return [tx("Le second terme "), lx(B), tx(" doit être élevé au carré, lui aussi.")];
    return null;
  }
  if (p === "partielles") {
    const [n, d] = partielles(e);
    const a = lireLimite(valeurs[0] ?? "");
    const b = lireLimite(valeurs[1] ?? "");
    if (b !== null && !memeLimite(b, d)) {
      if (e.sous === "E2" && memeLimite(b, -d)) return [tx("Pour x < 0, "), lx("x=-\\sqrt{x^2}"), tx(" : la racine divisée par x tend vers "), lx(`-${e.d.p}`), tx(", pas vers "), lx(`${e.d.p}`), tx(".")];
      if ((e.sous === "A" || e.sous === "E2" || e.sous === "B2") && memeLimite(Math.abs(b), Math.abs(d) / 2)) return [tx("Les deux termes du dénominateur, divisés par x, ont chacun une limite : additionne-les.")];
      if ((e.sous === "C" || e.sous === "D") && memeLimite(b, d / 2)) return [tx("Le dénominateur est une somme de deux termes qui tendent chacun vers la même valeur : n'en oublie pas un.")];
      if (e.sous === "B1" && Number.isFinite(b)) return [tx("Chaque racine du dénominateur tend vers "), lx("+\\infty"), tx(" quand x tend vers "), lx("+\\infty"), tx(".")];
    }
    if (a !== null && !memeLimite(a, n)) {
      if (e.sous === "E1" && memeLimite(a, -n)) return [tx("Pour x < 0, "), lx("\\sqrt{x^2}=-x"), tx(" : le numérateur divisé par x est négatif.")];
      if (!Number.isFinite(a)) return [tx("Après la division (ou la simplification), le numérateur a une limite finie : "), lx("\\dfrac{c}{x}"), tx(" tend vers 0.")];
    }
    return null;
  }
  const v = lireLimite(valeurs[0] ?? "");
  if (v === null) return null;
  const L = exacteV(limite(e));
  if (fo === "infMoinsInf" && v === 0 && L !== 0) return [lx("\\infty-\\infty=0"), tx(" est faux : c'est une forme indéterminée, la transformation donne la vraie limite.")];
  if (fo === "infSurInf" && v === 1) return [lx("\\dfrac{\\infty}{\\infty}=1"), tx(" est faux : c'est une forme indéterminée.")];
  if (!Number.isFinite(v)) {
    const [n, d] = partielles(e);
    return [tx("Le numérateur tend vers "), lx(limiteL(n)), tx(" et le dénominateur vers "), lx(limiteL(d)), tx(" : la limite n'est pas infinie.")];
  }
  if (negatif(e) && L !== 0 && memeLimite(v, -L)) return [tx("Signe faux : pour x < 0, "), lx("\\sqrt{x^2}=|x|=-x"), tx(".")];
  if ((e.sous === "C" || e.sous === "D" || e.sous === "A") && L !== 0 && memeLimite(v, 2 * L)) return [tx("Le dénominateur tend vers la somme de deux termes égaux : n'en oublie pas un.")];
  return null;
}

/** A² en x (le carré du premier terme : le radicande). */
function a2(e: E, x: number): number {
  const d = e.d;
  switch (e.sous) {
    case "A":
    case "E2":
      return d.p * d.p * x * x + d.b * x + d.c;
    case "B1":
      return x + d.a;
    case "B2":
      return x * x + d.a * x + d.c;
    case "C":
      return d.k * x + d.c;
    case "D":
      return x + d.p;
    case "E1":
      return d.m * d.m * x * x + d.b * x + d.c;
  }
}

/** B (constante) pour C et D. */
function b1(e: E): number {
  return e.sous === "C" ? Math.sqrt(e.d.c) : e.d.n;
}
