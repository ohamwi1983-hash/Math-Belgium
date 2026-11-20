import type { ExerciceLireCourbeExpo } from "../core6e/lireCourbeExponentielle";
import { evaluer, fZero } from "../core6e/lireCourbeExponentielle";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ratVal } from "../ui6e/nombresExpoLotG";
import type { PhaseLireCourbeExpo } from "../ui6e/formatLireCourbeExponentielle";
import { rapportEcarts, yPoint } from "../ui6e/formatLireCourbeExponentielle";
import { expressionVaut, lireDroite, lireValeur, statutExpression, statutProche } from "./lectureExpoLotG";

/**
 * Vérification de `6gen148` (statut à 3 valeurs). Toute écriture juste est acceptée :
 * - asymptote : toute équation équivalente à y = c (« y = −1 », « y + 1 = 0 », « −1 = y »), ou le
 *   nombre c seul ; une équation qui contient x (droite verticale ou oblique) est fausse ;
 * - k, a : valeur exacte (fraction, décimal exact, « 2^(−1) »), préfixe « k = » / « a = » toléré ;
 * - expression : équivalente à k·aˣ + c en 7 abscisses (préfixe « f(x) = » ou « y = » toléré).
 */

type E = ExerciceLireCourbeExpo;
const EPS = 1e-6;
const POINTS = [-2.3, -1, -0.4, 0.6, 1, 1.7, 2.4];

function statutAsymptote(e: E, brut: string): StatutVerification {
  const s = normaliserSigneMoins(brut).trim();
  if (s === "") return "parse_error";
  if (!s.includes("=")) return statutProche(s, e.c, EPS);
  if (/x/i.test(s.replace(/exp/gi, ""))) {
    const d = lireDroite(s);
    return d === "illisible" ? "parse_error" : "not_equivalent";
  }
  const d = lireDroite(s);
  if (d === "illisible") return "parse_error";
  if (d === "pas-une-droite") return "not_equivalent";
  return Math.abs(d.m) < EPS && Math.abs(d.p - e.c) < EPS ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, phase: PhaseLireCourbeExpo, v: string[]): StatutVerification[] {
  switch (phase) {
    case "asymptote":
      return [statutAsymptote(e, v[0])];
    case "k":
      return [statutProche(v[0], e.k, EPS)];
    case "a":
      return [statutProche(v[0], ratVal(e.base), EPS)];
    case "expression":
      return [statutExpression(v[0], (x) => evaluer(e, x), POINTS)];
  }
}

/** Valeur lue dans une équation « y = … » ou un nombre seul (message ciblé de l'écran asymptote). */
function valeurAsymptote(brut: string): number | null {
  const s = normaliserSigneMoins(brut).trim();
  if (!s.includes("=")) return lireValeur(s);
  const d = lireDroite(s);
  return typeof d === "object" && Math.abs(d.m) < EPS ? d.p : null;
}

export function piege(e: E, phase: PhaseLireCourbeExpo, v: string[]): Frag[] | null {
  const egal = (x: number | null, c: number) => x !== null && Math.abs(x - c) < EPS;
  switch (phase) {
    case "asymptote": {
      const s = normaliserSigneMoins(v[0]);
      const d = lireDroite(s);
      if (/x/i.test(s.replace(/exp/gi, "")) && typeof d !== "object") return [tx("L'asymptote est horizontale : son équation est de la forme "), lx("y=\\ldots"), tx(", sans "), lx("x"), tx(".")];
      const y = valeurAsymptote(s);
      if (egal(y, fZero(e)) && fZero(e) !== e.c) return [tx("C'est l'ordonnée à l'origine "), lx("f(0)"), tx(" : l'asymptote est la droite en pointillés, dont la courbe s'approche sans l'atteindre.")];
      if (egal(y, -e.c) && e.c !== 0) return [tx("Vérifie le signe : lis l'ordonnée de la droite en pointillés sur l'axe vertical.")];
      return null;
    }
    case "k": {
      const x = lireValeur(v[0]);
      if (egal(x, fZero(e)) && e.c !== 0) return [tx("C'est "), lx("f(0)=k+c"), tx(" : retire "), lx("c"), tx(", l'ordonnée de l'asymptote.")];
      if (egal(x, -e.k)) return [tx(`Signe : la courbe est ${e.k > 0 ? "au-dessus" : "en dessous"} de son asymptote, donc `), lx(e.k > 0 ? "k>0" : "k<0"), tx(".")];
      if (egal(x, fZero(e) + e.c) && e.c !== 0) return [tx("Il faut retirer "), lx("c"), tx(", pas l'ajouter : "), lx("k=f(0)-c"), tx(".")];
      return null;
    }
    case "a": {
      const x = lireValeur(v[0]);
      if (x === null) return null;
      const r = rapportEcarts(e);
      const yh = r.haut + e.c;
      const yb = r.bas + e.c;
      if (x <= 0) return [tx("La base d'une exponentielle est toujours strictement positive.")];
      if (egal(x, 1 / ratVal(e.base))) return [tx("Rapport à l'envers : divise l'écart en "), lx("x+1"), tx(" par l'écart en "), lx("x"), tx(" (abscisse la plus grande au numérateur).")];
      if (e.c !== 0 && yb !== 0 && egal(x, yh / yb)) return [tx("Fais le rapport des écarts à l'asymptote, pas des ordonnées : retire "), lx("c"), tx(" aux deux ordonnées.")];
      if (egal(x, Math.abs(r.haut - r.bas)) || egal(x, yh - yb)) return [tx("Une exponentielle se reconnaît au rapport de deux écarts, pas à leur différence.")];
      return null;
    }
    case "expression": {
      const s = v[0];
      const a = ratVal(e.base);
      if (expressionVaut(s, (x) => Math.pow(e.k * a, x) + e.c, POINTS) && e.k !== 1) return [tx("Parenthèses : "), lx("k"), tx(" multiplie "), lx("a^{x}"), tx(", il n'entre pas dans la base.")];
      if (e.c !== 0 && expressionVaut(s, (x) => e.k * Math.pow(a, x), POINTS)) return [tx("Il manque "), lx("c"), tx(" : la courbe ne s'approche pas de l'axe des abscisses mais de son asymptote.")];
      if (e.c !== 0 && expressionVaut(s, (x) => e.k * Math.pow(a, x) - e.c, POINTS)) return [tx("Signe de "), lx("c"), tx(" : l'asymptote est "), lx(`y=${e.c}`), tx(".")];
      if (expressionVaut(s, (x) => e.k * Math.pow(1 / a, x) + e.c, POINTS)) return [tx("Base inversée : compare le sens de variation de "), lx("a^{x}"), tx(" à celui de la courbe (et le signe de "), lx("k"), tx(").")];
      if (expressionVaut(s, (x) => -e.k * Math.pow(a, x) + e.c, POINTS)) return [tx("Signe de "), lx("k"), tx(" : la courbe est-elle au-dessus ou en dessous de son asymptote ?")];
      return null;
    }
  }
}

/** Contrôle indépendant (tests) : ordonnées entières aux points marqués. */
export const ordonneesEntieres = (e: E): boolean => [0, e.xAutre].every((x) => Math.abs(evaluer(e, x) - yPoint(e, x)) < 1e-9);
