import type { ExerciceFonctionAsymptotes } from "../core5e/fonctionAsymptotes";
import { estOblique, fonction, limiteDroite, numerateurEnP, pointsControle } from "../core5e/fonctionAsymptotes";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseFonctionAsymptotes } from "../ui5e/formatFonctionAsymptotes";
import { lireFonctionX, lireLimite, memeLimite, memesValeurs } from "./lectureLimitesLotG";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen65`. Saisie LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireValeur` (« − – — », fractions), f(x) comparée en cinq points hors de
 * p (toute écriture équivalente : k + N/(x − p), forme développée…), limite par `lireLimite`
 * (+∞, inf, ∞). Messages ciblés : signe de d (x + d s'annule en −d), a = 1/k, b sans le
 * dénominateur, c sans multiplier par x₀ − p, limite finie ou de signe faux.
 */

type E = ExerciceFonctionAsymptotes;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const egal = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));

function nombre(s: string, cible: number): StatutVerification {
  const v = lireValeur(s.replace(/^\s*[a-z]\s*=/i, ""));
  return v === null ? "parse_error" : st(egal(v, cible));
}

export function diagnostiquer(e: E, p: PhaseFonctionAsymptotes, valeurs: string[]): StatutVerification[] {
  const d = e.d;
  const ob = estOblique(e);
  if (p === "av") return [nombre(valeurs[0] ?? "", ob ? d.p : -d.p)];
  if (p === "horiz") return ob ? [nombre(valeurs[0] ?? "", d.m), nombre(valeurs[1] ?? "", d.q)] : [nombre(valeurs[0] ?? "", d.k)];
  if (p === "point") return [nombre(valeurs[0] ?? "", ob ? d.c : d.b)];
  if (p === "fonction") {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (!f) return ["parse_error"];
    return [st(memesValeurs(f, fonction(e), pointsControle(e)))];
  }
  const v = lireLimite(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  return [st(memeLimite(v, limiteDroite(e)))];
}

export function piege(e: E, p: PhaseFonctionAsymptotes, valeurs: string[]): Frag[] | null {
  const d = e.d;
  const ob = estOblique(e);
  const v0 = lireValeur((valeurs[0] ?? "").replace(/^\s*[a-z]\s*=/i, ""));
  if (p === "av") {
    if (v0 === null) return null;
    if (!ob && egal(v0, d.p)) return [lx("x+d"), tx(" s'annule en "), lx("x=-d"), tx(" : pour qu'il s'annule en "), lx(`x=${d.p}`), tx(", il faut "), lx(`${d.p}+d=0`), tx(".")];
    if (ob && egal(v0, -d.p)) return [lx("x-p"), tx(" s'annule en "), lx("x=p"), tx(" : attention au signe.")];
    return null;
  }
  if (p === "horiz") {
    if (ob) {
      const v1 = lireValeur((valeurs[1] ?? "").replace(/^\s*[a-z]\s*=/i, ""));
      if (v0 !== null && v1 !== null && egal(v0, d.q) && egal(v1, d.m)) return [tx("a est la pente (le coefficient de x) et b l'ordonnée à l'origine : tu les as échangés.")];
      return null;
    }
    if (v0 !== null && d.k !== 0 && egal(v0, 1 / d.k) && Math.abs(d.k) !== 1) return [tx("En l'infini, "), lx("\\dfrac{ax+b}{x+d}"), tx(" tend vers "), lx("\\dfrac{a}{1}=a"), tx(" : a est l'ordonnée de l'asymptote.")];
    if (v0 !== null && egal(v0, -d.k)) return [tx("Le signe compte : la limite en l'infini vaut a elle-même.")];
    return null;
  }
  if (p === "point") {
    if (v0 === null) return null;
    if (ob) {
      const r = d.y0 - d.m * d.x0 - d.q;
      if (egal(v0, r) && d.x0 - d.p !== 1) return [tx("Tu as trouvé "), lx(`\\dfrac{c}{${d.x0 - d.p}}`), tx(" : multiplie encore par "), lx(`${d.x0}${plusT(-d.p)}`), tx(" pour obtenir c.")];
      if (egal(v0, d.c * -1)) return [tx("Vérifie le signe de "), lx(`${d.x0}${plusT(-d.p)}`), tx(".")];
      return null;
    }
    if (egal(v0, d.y0 - d.k * d.x0) && d.x0 - d.p !== 1) return [tx("Multiplie les deux membres par le dénominateur "), lx(`${d.x0}${plusT(-d.p)}`), tx(" avant d'isoler b.")];
    if (egal(v0, d.y0 * (d.x0 + d.p) - d.k * d.x0)) return [tx("Le dénominateur vaut "), lx(`x+d=x${plusT(-d.p)}`), tx(" : en "), lx(`x=${d.x0}`), tx(", il vaut "), lx(`${d.x0 - d.p}`), tx(".")];
    return null;
  }
  if (p === "fonction") {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (!f) return null;
    const pts = [-d.p - 2.7, -d.p - 0.6, -d.p + 0.45, -d.p + 1.9, -d.p + 5.3];
    const signe = ob ? (x: number) => d.m * x + d.q + d.c / (x + d.p) : (x: number) => (d.k * x + d.b) / (x + d.p);
    if (memesValeurs(f, signe, pts)) return [tx("Le dénominateur doit s'annuler en "), lx(`x=${d.p}`), tx(" : c'est "), lx(polyT(d.p)), tx(".")];
    return null;
  }
  const v = lireLimite(valeurs[0] ?? "");
  if (v === null) return null;
  if (Number.isFinite(v)) return [tx("Le dénominateur tend vers 0 et le numérateur vers un nombre non nul : la limite est infinie.")];
  if (memeLimite(v, -limiteDroite(e))) return [tx("Signe faux : le numérateur tend vers "), lx(`${numerateurEnP(e)}`), tx(", et pour "), lx(`x>${d.p}`), tx(" le dénominateur est positif.")];
  return null;
}

/** « − 3 », « + 3 » collés (LaTeX). */
function plusT(v: number): string {
  return v === 0 ? "" : v > 0 ? `+${v}` : `${v}`;
}
/** « x − p ». */
function polyT(p: number): string {
  return `x${plusT(-p)}`;
}
