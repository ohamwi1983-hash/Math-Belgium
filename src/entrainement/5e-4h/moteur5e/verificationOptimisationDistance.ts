import type { ExerciceOptimisationDistance } from "../core5e/optimisationDistance";
import { modele, VITESSES } from "../core5e/optimisationDistance";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseOptimisationDistance } from "../ui5e/formatOptimisationDistance";
import { MESSAGE_APPROCHEE } from "../ui5e/formatOptimisationDistance";
import { estApprochee, lireFonctionX, lireLimite, memesValeurs } from "./lectureLimitesLotG";

/**
 * Vérification de `5gen71`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative). Expressions (modèle, dérivée) comparées en cinq points du domaine (toute écriture
 * équivalente, racine(…), sqrt(…), √, « − – — ») ; nombres exacts à 1e-9 (fractions, √) — une
 * décimale proche d'une valeur exacte non décimale est « approchée » (message, aucune tentative) ;
 * temps du sauveteur au dixième (écart ≤ 0,05 s). Messages ciblés sur les erreurs classiques :
 * distance au lieu de son carré, carré de la racine oublié, temps = distance × vitesse, facteur −1
 * de la chaîne oublié, solution négative ou hors du domaine gardée, carré de la distance donné
 * pour la distance.
 */

type E = ExerciceOptimisationDistance;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const egal = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
const lireNombre = (s: string): number | null => {
  const v = lireLimite(s);
  return v === null || !Number.isFinite(v) ? null : v;
};

export function diagnostiquer(e: E, p: PhaseOptimisationDistance, valeurs: string[]): StatutVerification[] {
  const m = modele(e);
  if (p === "signe") return [st(valeurs[0] === m.motif)];
  if (p === "modele" || p === "derivee") {
    const g = lireFonctionX(valeurs[0] ?? "");
    if (!g) return ["parse_error"];
    return [st(memesValeurs(g, p === "modele" ? m.f : m.fp, m.pts))];
  }
  if (p === "critique") {
    const v = lireNombre(valeurs[0] ?? "");
    return [v === null ? "parse_error" : st(egal(v, m.x0))];
  }
  const x = lireNombre(valeurs[0] ?? "");
  const val = lireNombre(valeurs[1] ?? "");
  return [x === null ? "parse_error" : st(egal(x, m.xOpt)), val === null ? "parse_error" : st(m.valExacte ? egal(val, m.valOpt) : Math.abs(val - m.valOpt) <= 0.05 + 1e-9)];
}

export function approchee(e: E, p: PhaseOptimisationDistance, valeurs: string[]): string | null {
  const m = modele(e);
  if (p === "critique") return estApprochee(valeurs[0] ?? "", m.x0) ? MESSAGE_APPROCHEE : null;
  if (p === "optimum") {
    if (estApprochee(valeurs[0] ?? "", m.xOpt)) return MESSAGE_APPROCHEE;
    if (m.valExacte && estApprochee(valeurs[1] ?? "", m.valOpt)) return MESSAGE_APPROCHEE;
  }
  return null;
}

/** Fonctions « fausses » classiques de l'écran 1 / 2, avec leur message. */
function erreursExpression(e: E, p: PhaseOptimisationDistance): { f: (x: number) => number; message: Frag[] }[] {
  const d = e.d;
  const m = modele(e);
  if (p === "modele") {
    const l: { f: (x: number) => number; message: Frag[] }[] = [{ f: (x) => Math.sqrt(m.f(x)), message: [tx("C'est la distance elle-même : on demande son carré (sans la racine), plus simple à dériver et minimal au même endroit.")] }];
    if (e.variante === "pointRacine") {
      l.push({ f: (x) => (x - d.a) ** 2 + Math.sqrt(d.k * x), message: [tx("Le carré de "), lx(d.k === 1 ? "\\sqrt{x}" : `\\sqrt{${d.k}x}`), tx(" vaut "), lx(d.k === 1 ? "x" : `${d.k}x`), tx(" : n'oublie pas d'élever l'ordonnée au carré.")] });
      l.push({ f: (x) => (x + d.a) ** 2 + d.k * x, message: [tx("Écart des abscisses : "), lx("x_M-x_A"), tx(", attention au signe de "), lx(`x_A=${d.a}`), tx(".")] });
    }
    if (e.variante === "pointHyperbole") l.push({ f: (x) => x * x + d.k / (x * x), message: [tx("Le carré de "), lx(`\\dfrac{${d.k}}{x}`), tx(" est "), lx(`\\dfrac{${d.k * d.k}}{x^2}`), tx(" : le numérateur est aussi élevé au carré.")] });
    if (e.variante === "sauveteur") {
      const V = VITESSES[d.s]!;
      l.push({ f: (x) => x * V.v1 + Math.sqrt((d.L - x) ** 2 + d.h ** 2) * V.v2, message: [tx("Une durée est une distance divisée par la vitesse, pas multipliée.")] });
      l.push({ f: (x) => x / V.v2 + Math.sqrt((d.L - x) ** 2 + d.h ** 2) / V.v1, message: [tx("Les vitesses sont échangées : il court sur le sable (AM) et nage dans l'eau (MN).")] });
    }
    if (e.variante === "cable") l.push({ f: (x) => Math.sqrt(x * x + d.b * d.b) + Math.sqrt((d.L - x) ** 2 + d.a * d.a), message: [tx("A est à "), lx(`${d.a}`), tx(" m de la rive et HM = x : le premier morceau est "), lx(`\\sqrt{x^2+${d.a}^2}`), tx(".")] });
    return l;
  }
  // Dérivée.
  if (e.variante === "pointRacine") return [{ f: (x) => 2 * (x - d.a), message: [tx("Il manque la dérivée du terme "), lx(d.k === 1 ? "x" : `${d.k}x`), tx(".")] }];
  if (e.variante === "pointHyperbole")
    return [
      { f: (x) => 2 * x + (2 * d.k ** 2) / x ** 3, message: [tx("Signe : "), lx("\\left(\\dfrac{1}{x^2}\\right)'=-\\dfrac{2}{x^3}"), tx(".")] },
      { f: (x) => 2 * x - (2 * d.k ** 2) / x, message: [tx("Puissance : la dérivée de "), lx("x^{-2}"), tx(" est "), lx("-2x^{-3}"), tx(".")] },
    ];
  if (e.variante === "sauveteur") {
    const V = VITESSES[d.s]!;
    const r = (x: number) => Math.sqrt((d.L - x) ** 2 + d.h ** 2);
    return [
      { f: (x) => 1 / V.v1 + (d.L - x) / (V.v2 * r(x)), message: [tx("Règle de la chaîne : la dérivée de "), lx(`(${d.L}-x)^2`), tx(" est "), lx(`-2(${d.L}-x)`), tx(" (facteur −1).")] },
      { f: (x) => 1 / V.v1 - (2 * (d.L - x)) / (V.v2 * r(x)), message: [tx("N'oublie pas le 2 du dénominateur : "), lx("\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}"), tx(".")] },
    ];
  }
  const r1 = (x: number) => Math.sqrt(x * x + d.a * d.a);
  const r2 = (x: number) => Math.sqrt((d.L - x) ** 2 + d.b * d.b);
  return [
    { f: (x) => x / r1(x) + (d.L - x) / r2(x), message: [tx("Règle de la chaîne : la dérivée de "), lx(`(${d.L}-x)^2`), tx(" est "), lx(`-2(${d.L}-x)`), tx(" (facteur −1).")] },
    { f: (x) => (2 * x) / r1(x) - (2 * (d.L - x)) / r2(x), message: [tx("N'oublie pas le 2 du dénominateur : "), lx("\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}"), tx(".")] },
  ];
}

export function piege(e: E, p: PhaseOptimisationDistance, valeurs: string[]): Frag[] | null {
  const m = modele(e);
  const d = e.d;
  if (p === "modele" || p === "derivee") {
    const g = lireFonctionX(valeurs[0] ?? "");
    if (!g) return null;
    for (const er of erreursExpression(e, p)) if (memesValeurs(g, er.f, m.pts)) return er.message;
    return null;
  }
  if (p === "signe") {
    const v = valeurs[0];
    if (v === m.motif) return null;
    if (m.dehors && (v === "neg-pos" || v === "pos-neg")) return [tx("Le zéro "), lx(`x_0=${m.x0L}`), tx(" n'est pas dans le domaine "), lx(m.domaineL), tx(" : la dérivée ne s'y annule pas.")];
    if (!m.dehors && (v === "pos" || v === "neg")) return [lx(`x_0=${m.x0L}`), tx(" est dans le domaine : la dérivée s'y annule et change de signe.")];
    return [tx("Teste le signe de la dérivée en une valeur proche de la borne gauche du domaine.")];
  }
  if (p === "critique") {
    const v = lireNombre(valeurs[0] ?? "");
    if (v === null) return null;
    if (e.variante === "pointHyperbole" && egal(v, -m.x0)) return [tx("Cette solution est négative : le domaine impose "), lx("x>0"), tx(".")];
    if (e.variante === "sauveteur") {
      const u = d.L - m.x0;
      if (egal(v, u)) return [tx("C'est la distance MH ("), lx(`${d.L}-x`), tx(") : il reste à en déduire x = AM.")];
      if (egal(v, d.L + u)) return [tx("Signe : MH = "), lx(`${d.L}-x`), tx(", donc "), lx("x=" + d.L + "-MH"), tx(".")];
    }
    if (e.variante === "cable" && egal(v, (d.b * d.L) / (d.a + d.b))) return [tx("C'est la distance MK : x = HM est du côté de A, "), lx(`\\dfrac{x}{${d.a}}=\\dfrac{${d.L}-x}{${d.b}}`), tx(".")];
    if (e.variante === "pointRacine" && egal(v, -m.x0)) return [tx("Signe : isole x dans "), lx(`${m.fpL}=0`), tx(".")];
    return null;
  }
  // Optimum.
  const x = lireNombre(valeurs[0] ?? "");
  const val = lireNombre(valeurs[1] ?? "");
  if (x !== null && m.dehors && egal(x, m.x0)) return [lx(`x_0=${m.x0L}`), tx(" est hors du domaine : le minimum est atteint à la borne "), lx("x=0"), tx(".")];
  if (val !== null && (e.variante === "pointRacine" || e.variante === "pointHyperbole") && egal(val, m.valOpt ** 2)) return [tx("C'est le carré de la distance (la valeur de D) : la distance est sa racine carrée.")];
  if (val !== null && e.variante === "sauveteur" && m.dehors && Math.abs(val - m.f(m.x0)) <= 0.05) return [tx("Ce temps correspond à "), lx("x_0"), tx(", hors du domaine : calcule T(0).")];
  return null;
}
