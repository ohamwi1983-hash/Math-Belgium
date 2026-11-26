import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireEnsemble, memesBornes, normaliser } from "../../../../5e-4h/moteur5e/ensemblesReels";
import type { Ensemble } from "../../../../5e-4h/moteur5e/ensemblesReels";
import { lireValeur } from "../../../../5e-4h/moteur5e/lectureValeurTrigo";
import { egauxX, versNumerique } from "../../communReels/ensemblesExacts";
import type { ExerciceAbsolue, PhaseAbsolue } from "../core/types";
import { BL, estPetit, versEnsembleTexte } from "../ui/format";

/**
 * Couche B — vérification de `56gen18`. Ensemble des solutions lu par `ensemblesReels.lireEnsemble`
 * (accolades, intervalles, ∪, ℝ, ℝ ∖ {…}, ∅, bornes exactes avec √ ; « x = 3 ou x = −5 » ramené à
 * « {3 ; −5} ») et comparé NUMÉRIQUEMENT à l'ensemble exact. Crochet fermé sur un infini ou intervalle
 * à l'envers : à reprendre, sans tentative. Valeur décimale proche d'une valeur exacte : message, sans
 * tentative.
 */

type E = ExerciceAbsolue;
type P = PhaseAbsolue;
const EPS = 1e-9;

function lireX(texte: string): number | null {
  return lireValeur(texte.replace(/^\s*x\s*=\s*/i, ""));
}

const valeurAttendue = (e: E, p: P): number => (p === "egaux" ? e.x1!.n / e.x1!.d : e.x2!.n / e.x2!.d);

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "traduire") {
    if (!e.options.includes(v as never)) return ["parse_error"];
    return [v === e.bonne ? "correct" : "not_equivalent"];
  }
  if (p === "egaux" || p === "opposes") {
    const x = lireX(v);
    if (x === null) return ["parse_error"];
    return [Math.abs(x - valeurAttendue(e, p)) < EPS ? "correct" : "not_equivalent"];
  }
  const l = lireEnsemble(versEnsembleTexte(v));
  if (!l) return ["parse_error"];
  if (l.defauts.length > 0) return ["not_equivalent"];
  return [egauxX(e.solutions, l.ensemble) ? "correct" : "not_equivalent"];
}

export function aReprendre(_e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p !== "ensemble") return null;
  const l = lireEnsemble(versEnsembleTexte(valeurs[0] ?? ""));
  if (!l || l.defauts.length === 0) return null;
  if (l.defauts.includes("infiniFerme")) return [tx("Un infini n'est jamais atteint : le crochet est toujours ouvert de son côté, "), lx("\\mathopen{]}-\\infty"), tx(" et "), lx("+\\infty\\mathclose{[}"), tx(". Cette saisie ne compte pas comme une tentative.")];
  return [tx("Dans un intervalle, la borne de gauche doit être la plus petite. Cette saisie ne compte pas comme une tentative.")];
}

export function approchee(e: E, p: P, valeurs: string[]): string | null {
  if (p !== "egaux" && p !== "opposes") return null;
  const v = valeurs[0] ?? "";
  const x = lireX(v);
  if (x === null || !/[.,]\d/.test(v)) return null;
  const att = valeurAttendue(e, p);
  if (Math.abs(x - att) > EPS && Math.abs(x - att) < 0.01) return "C'est une valeur approchée : donne la valeur exacte (une fraction, par exemple 7/3). Cette saisie ne compte pas comme une tentative.";
  return null;
}

export function bonneOption(e: E): string {
  return e.bonne ?? "";
}

function memeForme(a: Ensemble, b: Ensemble): boolean {
  return a.length === b.length && memesBornes(a, b);
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (diagnostiquer(e, p, valeurs)[0] !== "not_equivalent") return null;
  if (p === "traduire") {
    if (v === "deux" && e.signe === "negatif") return [tx("Une valeur absolue n'est jamais négative : elle ne peut pas valoir "), lx(`${e.c}`), tx(".")];
    if (v === "aucune" && e.signe === "nul") return [tx("Une valeur absolue peut être nulle : quand le nombre entre les barres vaut 0.")];
    if ((v === "entre" || v === "dehors") && e.variante === "inequation" && e.signe !== "positif") return [tx("Ici, c n'est pas strictement positif : compare directement la valeur absolue, toujours positive ou nulle, à "), lx(`${e.c}`), tx(".")];
    if (v === "dehors" || v === "entre") return [tx(estPetit(e) ? "« Plus petit que c » : la distance à 0 est petite, le nombre est entre −c et c." : "« Plus grand que c » : le nombre est loin de 0, d'un côté ou de l'autre.")];
    if (v === "une") return [tx("Deux nombres ont la valeur absolue "), lx(`${Math.abs(e.c)}`), tx(" : "), lx(`${Math.abs(e.c)}`), tx(" et "), lx(`-${Math.abs(e.c)}`), tx(".")];
    if (v === "oubliK") return [tx("Le nombre entre les barres est "), lx(`x^{2}-${e.a}`), tx(" : ajoute "), lx(`${e.a}`), tx(" à chaque membre.")];
    if (v === "seulDroite") return [tx("Une valeur absolue donne deux conditions : il en manque une.")];
    return null;
  }
  if (p === "egaux" || p === "opposes") {
    if (p === "opposes") return [tx("Le signe « − » porte sur toute l'expression : "), lx(`-(${BL(e)})`), tx(" change le signe de chacun de ses termes.")];
    return [tx("Vérifie en remplaçant x par ta valeur dans les deux membres.")];
  }
  const l = lireEnsemble(versEnsembleTexte(v));
  if (!l) return null;
  const att = versNumerique(e.solutions);
  const s = normaliser(l.ensemble);
  if (memeForme(s, att)) return [tx("Les bornes sont justes : revois les crochets (inégalité stricte : borne exclue ; large : borne comprise).")];
  if (att.length > 0 && s.length === 0) return [tx("Il y a des solutions : reprends la traduction sans valeur absolue.")];
  if (e.variante === "equation" && e.signe === "positif" && s.length === 1) return [tx("Une seule solution ? L'équation donne deux cas : "), lx(`=${Math.abs(e.c)}`), tx(" et "), lx(`=-${Math.abs(e.c)}`), tx(".")];
  if (e.variante === "carre" && s.every((i) => i.g >= -EPS)) return [tx("Il manque les solutions négatives : "), lx("x^{2}"), tx(" et "), lx("(-x)^{2}"), tx(" sont égaux.")];
  if (e.variante === "deuxAbsolues" && s.length === 1) return [tx("L'équation a deux cas, « égaux » et « opposés » : réunis leurs solutions.")];
  return [tx("Vérifie tes bornes en remplaçant x par une valeur dans l'énoncé de départ.")];
}
