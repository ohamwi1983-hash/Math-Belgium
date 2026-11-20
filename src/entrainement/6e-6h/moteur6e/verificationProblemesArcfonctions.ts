import type { ExerciceProblemesArcfonctions } from "../core6e/problemesArcfonctions";
import { ANGLE_SECURITE, verdictRayon } from "../core6e/problemesArcfonctions";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseProblemesArcfonctions } from "../ui6e/formatProblemesArcfonctions";
import { ID_NON, ID_OUI, estChoix, estLongueur, valeurAttendue } from "../ui6e/formatProblemesArcfonctions";
import { enDegres, enRadians } from "../ui6e/nombresCycloLotG";
import { lireValeur, statutProche, uniteSaisie } from "./lectureCycloLotG";

/**
 * Vérification de `6gen156` (statut à 3 valeurs). Angles en degrés au dixième (± 0,05°), longueurs au
 * centimètre (± 0,5 cm) ou exactes (« √1,08 », « √(0,6·1,8) ») ; choix fermé du verdict. Valeur en
 * RADIANS, ou angle arrondi à l'unité : message sans perte de tentative (`approchee`).
 */

type E = ExerciceProblemesArcfonctions;
const TOL_DEG = 0.0501;
const TOL_M = 0.00501;

export function diagnostiquer(e: E, phase: PhaseProblemesArcfonctions, v: string[]): StatutVerification[] {
  if (estChoix(e, phase)) {
    const attendu = e.variante === "reflexion-totale" && verdictRayon(e) ? ID_OUI : ID_NON;
    return [v[0] === attendu ? "correct" : "not_equivalent"];
  }
  return [statutProche(v[0], valeurAttendue(e, phase), estLongueur(e, phase) ? TOL_M : TOL_DEG)];
}

export function approchee(e: E, phase: PhaseProblemesArcfonctions, v: string[]): string | null {
  if (estChoix(e, phase) || estLongueur(e, phase)) return null;
  if (diagnostiquer(e, phase, v)[0] === "correct") return null;
  const x = lireValeur(v[0]);
  if (x === null) return null;
  const attendu = valeurAttendue(e, phase);
  if (uniteSaisie(v[0]) === "rad" || Math.abs(x - enRadians(attendu)) <= 0.0015)
    return "Cette valeur est un angle en radians : la question demande des degrés (règle la calculatrice en mode degrés). Cette saisie ne compte pas comme une tentative.";
  if (!/[.,]/.test(v[0]) && Number.isInteger(x) && Math.abs(x - attendu) <= 0.5) return "Donne l'angle au dixième de degré (un chiffre après la virgule). Cette saisie ne compte pas comme une tentative.";
  return null;
}

const asinDeg = (s: number) => (Math.abs(s) <= 1 ? enDegres(Math.asin(s)) : NaN);
const acosDeg = (s: number) => (Math.abs(s) <= 1 ? enDegres(Math.acos(s)) : NaN);
const atanDeg = (s: number) => enDegres(Math.atan(s));
const sinD = (d: number) => Math.sin(enRadians(d));

/** Message ciblé sur une erreur trahie par la réponse fausse (jamais la réponse). */
export function piege(e: E, phase: PhaseProblemesArcfonctions, v: string[]): Frag[] | null {
  if (estChoix(e, phase)) return null;
  const x = lireValeur(v[0]);
  if (x === null) return null;
  const pres = (c: number, tol = 0.06) => Number.isFinite(c) && Math.abs(x - c) <= tol;
  const MODE_RAD: Frag[] = [tx("Ta calculatrice semble réglée en radians : le sinus d'un angle donné en degrés a été calculé comme s'il était en radians.")];
  const SINUS_SEUL: Frag[] = [tx("Ce nombre est le sinus de l'angle : il reste à appliquer arcsin.")];
  switch (e.variante) {
    case "refraction":
    case "reflexion-totale": {
      const n1 = e.milieu1.n;
      const n2 = e.milieu2.n;
      if (phase === "q1" && e.variante === "reflexion-totale") {
        if (pres(acosDeg(n2 / n1))) return [tx("arccos donne ici l'angle avec la surface ; les angles se mesurent par rapport à la normale, et "), lx("\\sin\\theta_L=\\dfrac{n_2}{n_1}"), tx(".")];
        if (pres(atanDeg(n2 / n1))) return [tx("Le rapport des indices est un sinus, pas une tangente.")];
        if (pres(n2 / n1, 0.001)) return SINUS_SEUL;
        return null;
      }
      const [na, nb, theta] = e.variante === "refraction" && phase === "q2" ? [n2, n1, e.theta2Voulu] : e.variante === "refraction" && phase === "q3" ? [n1, n2, 90] : [n1, n2, e.theta1];
      if (pres(asinDeg((nb * sinD(theta)) / na))) return [tx("Les indices sont inversés : dans "), lx("n_1\\sin\\theta_1=n_2\\sin\\theta_2"), tx(", chaque indice multiplie le sinus de l'angle de son milieu.")];
      if (theta !== 90 && pres(asinDeg((na * Math.sin(theta)) / nb))) return MODE_RAD;
      if (pres((na * sinD(theta)) / nb, 0.001)) return SINUS_SEUL;
      if (theta !== 90 && pres((na * theta) / nb)) return [tx("C'est le sinus de l'angle qu'on multiplie par le rapport des indices, pas l'angle lui-même.")];
      if (phase === "q3" && pres(90, 0.001)) return [tx("90° est l'incidence rasante ; la question porte sur l'angle de réfraction correspondant.")];
      return null;
    }
    case "angle-de-vue": {
      const { a, b } = e;
      if (phase === "q2") {
        if (pres((a + b) / 2, 0.006)) return [tx("La moyenne des deux hauteurs n'annule pas la dérivée : résous "), lx("\\theta'(x)=0"), tx(".")];
        if (pres(Math.sqrt(b * b - a * a), 0.006) || pres(b - a, 0.006)) return [tx("Écris "), lx("\\theta'(x)"), tx(" avec la dérivée de "), lx("\\arctan\\dfrac{k}{x}"), tx(", puis résous "), lx("\\theta'(x)=0"), tx(".")];
        return null;
      }
      const xx = phase === "q1" ? e.x0 : Math.sqrt(a * b);
      if (pres(atanDeg(b / xx))) return [tx("C'est l'angle vers le bord supérieur seul : retire l'angle vers le bord inférieur.")];
      if (pres(atanDeg((b - a) / xx))) return [tx("L'angle de vue n'est pas "), lx("\\arctan\\dfrac{b-a}{x}"), tx(" : c'est la différence de deux angles, chacun mesuré depuis l'horizontale.")];
      if (phase === "q3" && pres(atanDeg(b / e.x0) - atanDeg(a / e.x0))) return [tx("C'est l'angle à la distance de la première question ; calcule-le à la distance trouvée juste avant.")];
      return null;
    }
    case "echelle": {
      const { L, d, h } = e;
      if (phase === "q1") {
        if (pres(asinDeg(d / L))) return [tx("Cet angle est celui avec le mur : la distance au mur est le côté adjacent à l'angle au sol.")];
        if (pres(atanDeg(d / L))) return [tx("L'échelle est l'hypoténuse : le rapport distance / longueur est un cosinus.")];
        if (pres(d / L, 0.001)) return [tx("Ce nombre est le cosinus de l'angle : il reste à appliquer arccos.")];
        return null;
      }
      if (phase === "q2") {
        if (pres(L * sinD(ANGLE_SECURITE), 0.006)) return [tx("La distance au mur est le côté adjacent à l'angle au sol : elle se calcule avec le cosinus.")];
        if (pres(L * Math.cos(ANGLE_SECURITE), 0.006)) return [tx("Ta calculatrice semble réglée en radians : le cosinus de 75° a été calculé comme s'il était en radians.")];
        return null;
      }
      if (pres(acosDeg(h / L))) return [tx("La hauteur sur le mur est le côté opposé à l'angle au sol : c'est arcsin, pas arccos.")];
      if (pres(h / L, 0.001)) return SINUS_SEUL;
      return null;
    }
  }
}
