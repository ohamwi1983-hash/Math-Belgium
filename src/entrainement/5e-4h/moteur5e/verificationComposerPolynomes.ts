import type { ExerciceComposerPolynomes } from "../core5e/composerPolynomes";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseComposerPolynomes } from "../ui5e/formatComposerPolynomes";
import { lireRationnel } from "./ensembleSaisi";
import { addP, composerP, egauxP, evalP, formePolynome, lirePolynome, mulP, scalP } from "./polynomeSaisi";
import type { Polynome } from "./polynomeSaisi";
import { qVal } from "../ui5e/nombresTrigo";

/**
 * Couche B — vérification de `5gen61`. Polynômes comparés par leurs COEFFICIENTS (jamais par la
 * chaîne) : toute écriture juste est lue. Écran « substitution » : n'importe quelle écriture
 * équivalente à f(g(x)) ; écrans « fog » / « gof » : forme développée réduite exigée — une écriture
 * équivalente non développée ou non réduite est signalée sans consommer de tentative
 * (`aReprendre`). Messages ciblés sur les erreurs du cours (ordre inversé, produit au lieu de
 * composée, double produit oublié ou de mauvais signe, facteur distribué sur le premier terme).
 */

type E = ExerciceComposerPolynomes;
type P = PhaseComposerPolynomes;

function attendu(e: E, phase: P): Polynome {
  return phase === "gof" ? e.gof : e.fog;
}

export function diagnostiquer(e: E, phase: P, valeurs: string[]): StatutVerification[] {
  if (phase === "verdict") return [valeurs[0] === (e.commutent ? "egales" : "differentes") ? "correct" : "not_equivalent"];
  if (phase === "point") {
    const cibles = [e.ga, e.fga];
    return valeurs.map((v, i) => {
      const r = lireRationnel(v);
      if (!r) return "parse_error";
      return Math.abs(qVal(r) - cibles[i]) < 1e-9 ? "correct" : "not_equivalent";
    });
  }
  const p = lirePolynome(valeurs[0]);
  if (!p) return ["parse_error"];
  if (!egauxP(p, attendu(e, phase))) return ["not_equivalent"];
  if (phase === "substitution") return ["correct"];
  return [formePolynome(valeurs[0]) === "developpee-reduite" ? "correct" : "not_equivalent"];
}

export function aReprendre(e: E, phase: P, valeurs: string[]): Frag[] | null {
  if (phase !== "fog" && phase !== "gof") return null;
  const p = lirePolynome(valeurs[0]);
  if (!p || !egauxP(p, attendu(e, phase))) return null;
  const forme = formePolynome(valeurs[0]);
  const carre = (phase === "fog" ? e.f : e.g).length === 3;
  if (forme === "non-developpee")
    return carre
      ? [tx("Ton expression est juste, mais elle n'est pas encore développée : supprime les parenthèses ("), lx("(A+B)^2=A^2+2AB+B^2"), tx(", puis distributivité). Cette saisie ne compte pas comme une tentative.")]
      : [tx("Ton expression est juste, mais elle n'est pas encore développée : supprime les parenthèses (distributivité, "), lx("k(A+B)=kA+kB"), tx("). Cette saisie ne compte pas comme une tentative.")];
  if (forme === "non-reduite") return [tx("Ton expression est juste, mais elle n'est pas encore réduite : regroupe les termes de même degré (un seul terme en "), lx("x^2"), tx(", un seul en "), lx("x"), tx(", une seule constante). Cette saisie ne compte pas comme une tentative.")];
  return null;
}

/** Erreurs classiques du développement de ext(int). */
function erreursDeveloppement(ext: Polynome, int: Polynome): { p: Polynome; message: Frag[] }[] {
  const r: { p: Polynome; message: Frag[] }[] = [];
  if (ext.length === 3 && int.length === 2) {
    const [c0, c1, c2] = ext;
    const [q, m] = int;
    const reste = addP(scalP(c1, int), [c0]);
    r.push({ p: addP(scalP(c2, [q * q, 0, m * m]), reste), message: [lx("(A+B)^2"), tx(" n'est pas "), lx("A^2+B^2"), tx(" : il manque le double produit "), lx("2AB"), tx(".")] });
    r.push({ p: addP(scalP(c2, [q * q, -2 * m * q, m * m]), reste), message: [tx("Vérifie le signe du double produit "), lx("2AB"), tx(" : il a le signe du produit de "), lx("A"), tx(" et "), lx("B"), tx(".")] });
    if (c2 !== 1) r.push({ p: addP([q * q, 2 * m * q, c2 * m * m], reste), message: [tx("Le coefficient "), lx(`${c2}`), tx(" multiplie tout le carré développé, pas seulement son premier terme.")] });
  }
  if (ext.length === 2) {
    const [p, m] = ext;
    const lead = int.length - 1;
    const partiel = int.map((c, k) => (k === lead ? m * c : c));
    if (m !== 1) r.push({ p: addP(partiel, [p]), message: [tx("Le facteur "), lx(`${m}`), tx(" multiplie toute la parenthèse : chaque terme, pas seulement le premier.")] });
  }
  return r;
}

export function piege(e: E, phase: P, valeurs: string[]): Frag[] | null {
  if (phase === "verdict") return null;
  if (phase === "point") {
    const ga = lireRationnel(valeurs[0]);
    const fga = lireRationnel(valeurs[1]);
    if (ga && Math.abs(qVal(ga) - evalP(e.f, e.a)) < 1e-9 && evalP(e.f, e.a) !== e.ga) return [tx("Tu as calculé "), lx(`f(${e.a})`), tx(" : dans "), lx("f\\circ g"), tx(", c'est g qui agit d'abord.")];
    const gfa = evalP(e.g, evalP(e.f, e.a));
    if (fga && Math.abs(qVal(fga) - gfa) < 1e-9 && gfa !== e.fga) return [tx("Ce nombre est "), lx(`(g\\circ f)(${e.a})`), tx(" : calcule f du nombre "), lx(`g(${e.a})`), tx(".")];
    if (ga && Math.abs(qVal(ga) - e.ga) < 1e-9 && fga) return [tx("Le premier étage est juste : calcule maintenant "), lx(`f(${e.ga})`), tx(" en remplaçant chaque "), lx("x"), tx(" de f par "), lx(`${e.ga}`), tx(".")];
    return null;
  }
  const p = lirePolynome(valeurs[0]);
  if (!p) return null;
  const [ext, int] = phase === "gof" ? [e.g, e.f] : [e.f, e.g];
  const inverse = composerP(int, ext);
  if (egauxP(p, inverse) && !egauxP(inverse, attendu(e, phase)))
    return phase === "gof"
      ? [tx("Tu as calculé "), lx("f\\big(g(x)\\big)"), tx(" : dans "), lx("g\\circ f"), tx(", c'est f qui agit d'abord ; on remplace x dans g.")]
      : [tx("Tu as calculé "), lx("g\\big(f(x)\\big)"), tx(", c'est-à-dire "), lx("g\\circ f"), tx(" : dans "), lx("f\\circ g"), tx(", c'est g qui agit d'abord ; on remplace x dans f.")];
  if (egauxP(p, mulP(e.f, e.g))) return [tx("Composer n'est pas multiplier : on remplace "), lx("x"), tx(" par une expression, on ne multiplie pas "), lx("f(x)"), tx(" par "), lx("g(x)"), tx(".")];
  for (const err of erreursDeveloppement(ext, int)) if (egauxP(p, err.p)) return err.message;
  return null;
}
