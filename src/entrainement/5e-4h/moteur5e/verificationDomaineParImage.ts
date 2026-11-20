import type { ExerciceDomaineParImage } from "../core5e/domaineParImage";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDomaineParImage } from "../ui5e/formatDomaineParImage";
import { ensembleDePhase } from "../ui5e/formatDomaineParImage";
import { egalEns, intersection, lireEnsembleSaisi, normaliser, reunion } from "./ensembleSaisi";
import type { Ensemble } from "./ensembleSaisi";

/**
 * Couche B — vérification de `5gen62`. Les ensembles sont comparés en FORME NORMALE (intervalles
 * triés et fusionnés) : ℝ∖{0} saisi « ]−∞ ; 0[ ∪ ]0 ; +∞[ », intervalles dans n'importe quel ordre,
 * fractions, décimaux, « − – — », « +inf » / « ∞ » sont lus. Crochet fermé sur un infini, ou bornes
 * dans le désordre : signalé sans consommer de tentative (`aReprendre`). Messages ciblés : image
 * confondue avec le domaine, sens d'un carré, valeur atteinte exclue, réunion au lieu
 * d'intersection, condition oubliée, valeurs g(x) données à la place des x, moitié d'une condition
 * en x², 0 hors de dom g.
 */

type E = ExerciceDomaineParImage;
type P = PhaseDomaineParImage;

export function diagnostiquer(e: E, phase: P, valeurs: string[]): StatutVerification[] {
  const l = lireEnsembleSaisi(valeurs);
  if (l.type === "illisible") return ["parse_error"];
  if (l.type === "reprendre") return ["not_equivalent"];
  return [egalEns(l.ens, ensembleDePhase(e, phase)) ? "correct" : "not_equivalent"];
}

export function aReprendre(_e: E, _phase: P, valeurs: string[]): Frag[] | null {
  const l = lireEnsembleSaisi(valeurs);
  if (l.type !== "reprendre") return null;
  if (l.raison === "infini-ferme") return [tx("Un infini n'est jamais atteint : il a toujours un crochet ouvert, "), lx("\\mathopen{]}-\\infty"), tx(" et "), lx("+\\infty\\mathclose{[}"), tx(". Cette saisie ne compte pas comme une tentative.")];
  if (l.raison === "infini-mal-place") return [tx("Place "), lx("-\\infty"), tx(" à gauche et "), lx("+\\infty"), tx(" à droite d'un intervalle. Cette saisie ne compte pas comme une tentative.")];
  return [tx("Dans chaque intervalle, la borne de gauche doit être plus petite que celle de droite. Cette saisie ne compte pas comme une tentative.")];
}

/** Même ensemble, borne finie `b` ouverte/fermée basculée. */
function basculer(ens: Ensemble): Ensemble[] {
  const r: Ensemble[] = [];
  ens.forEach((i, k) => {
    if (i.g.inf === 0) r.push(ens.map((j, m) => (m === k ? { ...j, gf: !j.gf } : j)));
    if (i.d.inf === 0) r.push(ens.map((j, m) => (m === k ? { ...j, df: !j.df } : j)));
  });
  return r;
}

export function piege(e: E, phase: P, valeurs: string[]): Frag[] | null {
  const l = lireEnsembleSaisi(valeurs);
  if (l.type !== "ensemble") return null;
  const s = l.ens;
  const eq = (a: Ensemble) => egalEns(s, a);
  const attendu = ensembleDePhase(e, phase);
  const crochet = basculer(normaliser(attendu)).some(eq);
  switch (phase) {
    case "image": {
      if (!egalEns(e.domG, e.imG) && eq(e.domG)) return [tx("Tu as donné "), lx("\\operatorname{dom} g"), tx(", les nombres de départ. L'image, ce sont les valeurs "), lx("g(x)"), tx(" obtenues à l'arrivée.")];
      if (crochet) return [tx("Revois le crochet en "), lx(`${e.g.k}`), tx(" : cette valeur est-elle atteinte par g ?")];
      if (e.g.famille === "carre" || e.g.famille === "absolue" || e.g.famille === "racine") if (s.length === 1 && s[0].g.inf === -1) return [tx("Les valeurs de g sont au-dessus de "), lx(`g(0)=${e.g.k}`), tx(" : un carré, une valeur absolue, une racine ne sont jamais négatifs.")];
      if (e.g.famille === "oppCarre" && s.length === 1 && s[0].d.inf === 1) return [lx("-x^2\\leq 0"), tx(" : les valeurs de g sont au-dessous de "), lx(`g(0)=${e.g.k}`), tx(".")];
      if (e.g.famille === "inverse" && egalEns(s, [{ g: { inf: -1, q: { n: 0, d: 1 } }, gf: false, d: { inf: 1, q: { n: 0, d: 1 } }, df: false }])) return [lx("\\dfrac{1}{x}"), tx(" ne vaut jamais 0 : la valeur "), lx(`${e.g.k}`), tx(" n'est jamais atteinte.")];
      return null;
    }
    case "domaine":
      if (crochet) return e.f.famille === "inverseRacine" || e.f.famille === "inverseRacineMoins" ? [tx("En "), lx(`${e.f.c}`), tx(", la racine vaut 0 et elle est au dénominateur : cette valeur est exclue.")] : [tx("En "), lx(`${e.f.c}`), tx(", le radicande vaut 0 et "), lx("\\sqrt{0}=0"), tx(" existe : cette valeur est comprise.")];
      // Demi-droite du mauvais côté de c (sens de l'inégalité).
      if (s.length === 1 && attendu.length === 1 && (s[0].g.inf === -1) !== (attendu[0].g.inf === -1) && (s[0].g.inf === 0 || s[0].d.inf === 0) && [s[0].g, s[0].d].some((b) => b.inf === 0 && b.q.n === e.f.c * b.q.d)) return [tx("Vérifie le sens de l'inégalité : multiplier ou diviser par un nombre négatif le change.")];
      return null;
    case "valeurs":
      if (!egalEns(attendu, reunion(e.imG, e.domF)) && eq(reunion(e.imG, e.domF))) return [tx("C'est la réunion des deux ensembles : il faut les valeurs qui sont dans les deux à la fois (intersection).")];
      if (!egalEns(attendu, e.domF) && eq(e.domF)) return [tx("Tu as oublié de te limiter aux valeurs que g peut prendre : "), lx("\\operatorname{Im} g"), tx(".")];
      if (!egalEns(attendu, e.imG) && eq(e.imG)) return [tx("Certaines valeurs de g ne sont pas dans "), lx("\\operatorname{dom} f"), tx(" : retire-les.")];
      if (crochet) return [tx("Revois le crochet d'une borne : appartient-elle aux deux ensembles ?")];
      return null;
    case "composee": {
      if (!egalEns(attendu, e.valeurs) && eq(e.valeurs)) return [tx("Ce sont les valeurs "), lx("g(x)"), tx(" que f accepte, pas les "), lx("x"), tx(" : résous la condition en "), lx("x"), tx(".")];
      if (!egalEns(attendu, e.domG) && eq(e.domG)) return [tx("La condition 2 est oubliée : il faut aussi que "), lx("g(x)"), tx(" tombe dans "), lx("\\operatorname{dom} f"), tx(".")];
      const positifs = intersection(attendu, [{ g: { inf: 0, q: { n: 0, d: 1 } }, gf: true, d: { inf: 1, q: { n: 0, d: 1 } }, df: false }]);
      if ((e.g.famille === "carre" || e.g.famille === "oppCarre" || e.g.famille === "absolue") && !egalEns(positifs, attendu) && eq(positifs)) return [tx("Il manque les "), lx("x"), tx(" négatifs : "), lx("x"), tx(" et "), lx("-x"), tx(" ont la même image par g.")];
      if (e.g.famille === "inverse" && eq(reunion(attendu, [{ g: { inf: 0, q: { n: 0, d: 1 } }, gf: true, d: { inf: 0, q: { n: 0, d: 1 } }, df: true }]))) return [lx("0"), tx(" n'est pas dans "), lx("\\operatorname{dom} g"), tx(" : "), lx("g(0)"), tx(" n'existe pas.")];
      if (crochet) return [tx("Revois le crochet d'une borne : en cette valeur, "), lx("g(x)"), tx(" est-il dans "), lx("\\operatorname{dom} f"), tx(" ?")];
      return null;
    }
  }
}
