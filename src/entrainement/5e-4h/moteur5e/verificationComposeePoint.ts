import type { ExerciceComposeePoint } from "../core5e/composeePoint";
import { nomExt, nomInt, radicande, valeurComposee, valeurExt, valeurOrdreInverse } from "../core5e/composeePoint";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { composeeL, MESSAGE_APPROCHEE, radicandeSubstitueL } from "../ui5e/formatComposeePoint";
import type { PhaseComposeePoint } from "../ui5e/formatComposeePoint";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen60` « Composée en un point ». La saisie est LUE avant tout verdict
 * (`lireValeur` : entiers, fractions, racines, décimaux, « − – — ») : illisible → `parse_error`
 * (aucune tentative) ; valeur décimale proche de la valeur exacte → message « approchée » (aucune
 * tentative) ; toute écriture exacte équivalente est juste (√8 = 2√2, 2/√5 = 2√5/5, 4/6 = 2/3…).
 * Messages ciblés : ordre inversé, oubli des parenthèses autour d'un négatif, valeur intermédiaire
 * recopiée, ≥ / > sous un dénominateur.
 */

type E = ExerciceComposeePoint;
const EPS = 1e-9;
const egal = (a: number, b: number) => Math.abs(a - b) < EPS * Math.max(1, Math.abs(b));

export function diagnostiquer(e: E, p: PhaseComposeePoint, valeurs: string[]): StatutVerification[] {
  if (p === "inter") {
    const sym: StatutVerification = valeurs[0] === nomInt(e) ? "correct" : "not_equivalent";
    const v = lireValeur(valeurs[1] ?? "");
    return [sym, v === null ? "parse_error" : egal(v, e.m) ? "correct" : "not_equivalent"];
  }
  if (p === "existence") return [(valeurs[0] === "existe") === e.existe ? "correct" : "not_equivalent"];
  const v = lireValeur(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  const attendu = valeurComposee(e);
  return [attendu !== null && egal(v, attendu) ? "correct" : "not_equivalent"];
}

/** Décimal écrit (sans racine) proche de la valeur exacte : approchée. */
export function approchee(e: E, p: PhaseComposeePoint, valeurs: string[]): string | null {
  if (p !== "valeur") return null;
  const texte = valeurs[0] ?? "";
  const v = lireValeur(texte);
  const attendu = valeurComposee(e);
  if (v === null || attendu === null || egal(v, attendu)) return null;
  if (!/\d[.,]\d/.test(texte) || /√|sqrt|racine/i.test(texte)) return null;
  return Math.abs(v - attendu) <= 6e-3 * Math.max(1, Math.abs(attendu)) ? MESSAGE_APPROCHEE : null;
}

/** Valeur lue de l'extérieure appliquée à a SANS parenthèses autour d'un négatif (−2² = −4). */
function sansParentheses(e: E): number | null {
  if (e.a >= 0 || e.int.genre !== "carre") return null;
  return e.int.s * -(e.a * e.a) + e.int.b;
}

export function piege(e: E, p: PhaseComposeePoint, valeurs: string[]): Frag[] | null {
  const ex = nomExt(e);
  const it = nomInt(e);
  if (p === "inter") {
    if (valeurs[0] && valeurs[0] !== it) return [tx("Dans "), lx(composeeL(e)), tx(", la fonction écrite à droite du rond, "), lx(it), tx(", reçoit "), lx(`${e.a}`), tx(" en premier.")];
    const v = lireValeur(valeurs[1] ?? "");
    if (v === null) return null;
    const ue = valeurExt(e.ext, e.a);
    if (ue !== null && egal(v, ue)) return [tx("C'est l'image de "), lx(`${e.a}`), tx(" par "), lx(ex), tx(" : calcule "), lx(`${it}(${e.a})`), tx(".")];
    const sp = sansParentheses(e);
    if (sp !== null && egal(v, sp)) return [tx("Mets "), lx(`${e.a}`), tx(" entre parenthèses avant d'élever au carré : "), lx(`(${e.a})^2=${e.a * e.a}`), tx(".")];
    return null;
  }
  if (p === "existence") {
    const choixExiste = valeurs[0] === "existe";
    const r = radicandeSubstitueL(e);
    if (choixExiste && !e.existe) {
      if (e.ext.genre === "inverse") return [tx("Le dénominateur vaudrait "), lx(`${r}=0`), tx(" : on ne divise pas par 0.")];
      if (e.ext.genre === "racineDen" && Math.abs(valeurRadicandeNum(e)) < EPS) return [tx("Sous la racine, "), lx(`${r}=0`), tx(" : "), lx("\\sqrt{0}=0"), tx(" serait au dénominateur. Il faut un nombre strictement positif (> 0, pas ≥ 0).")];
      return [tx("Le nombre sous la racine vaudrait "), lx(`${r}=${valeurRadicandeNum(e)}`), tx(", un nombre négatif.")];
    }
    if (!choixExiste && e.existe) {
      if (e.ext.genre === "racine" && Math.abs(valeurRadicandeNum(e)) < EPS) return [lx("\\sqrt{0}=0"), tx(" existe : sous une racine carrée, 0 est permis (condition ≥ 0).")];
      if (e.ext.genre === "inverse") return [tx("Le dénominateur vaut "), lx(`${r}=${valeurRadicandeNum(e)}`), tx(", il n'est pas nul.")];
      return [tx("Le nombre sous la racine vaut "), lx(`${r}=${valeurRadicandeNum(e)}`), tx(", il est strictement positif.")];
    }
    return null;
  }
  const v = lireValeur(valeurs[0] ?? "");
  if (v === null) return null;
  if (egal(v, e.m)) return [tx("C'est la valeur intermédiaire "), lx(`${it}(${e.a})`), tx(" : il reste à lui appliquer "), lx(ex), tx(".")];
  const inv = valeurOrdreInverse(e);
  if (inv !== null && egal(v, inv)) return [tx("C'est "), lx(`(${it}\\circ ${ex})(${e.a})`), tx(" : l'ordre compte, "), lx(it), tx(" s'applique d'abord.")];
  if (e.ext.genre === "inverse" && Math.abs(v) > EPS) {
    const attendu = valeurComposee(e);
    if (attendu !== null && egal(1 / v, attendu)) return [tx("La fraction est renversée : le numérateur est "), lx(`${e.ext.c}`), tx(".")];
  }
  return null;
}

function valeurRadicandeNum(e: E): number {
  return radicande(e.ext, e.m);
}
