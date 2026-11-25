import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDL, PhaseDL } from "../core6e/detectiveLieux";
import { t } from "../ui6e/outilsLieuxLotH2";
import { copie, evalPolyDL } from "./modeleDetectiveLieux";
import { egalNum, equationXY, lireNombre, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen131`. Ligne et description comparées à leur identifiant (choix fermés, une
 * tentative) ; écran 3 LU avant tout verdict (illisible → `parse_error`, aucune tentative) : points
 * (ensemble sans ordre), nombre EXACT (fraction, racine ; décimal proche refusé sans tentative), équation
 * (proportionnalité ; deux droites « … ou … »). Messages ciblés : résultat de la copie repris.
 */

type E = ExerciceDL;

export function messageIllisible(e: E): string {
  const type = copie(e).type;
  if (type === "points") return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (1 ; 2) ; (−3 ; 0). Cette saisie ne compte pas comme une tentative.";
  if (type === "nombre") return "Valeur non reconnue : écris un nombre exact, par exemple 3, 5/2 ou √13. Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple 2x − y + 3 = 0 (deux droites : x = 4 ou 3x − 4y + 5 = 0). Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseDL, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  const c = copie(e);
  if (p === "ligne") return [v === `L${c.ligneFausse + 1}` ? "correct" : "not_equivalent"];
  if (p === "erreur") return [v === e.variante ? "correct" : "not_equivalent"];
  if (c.type === "points") {
    const pts = lirePoints(v);
    if (pts === null) return ["parse_error"];
    return [memesPoints(pts, c.points) ? "correct" : "not_equivalent"];
  }
  if (c.type === "nombre") {
    const n = lireNombre(v.replace(/^\s*[a-zA-Z]\s*=\s*/, ""));
    if (n === null) return ["parse_error"];
    return [egalNum(n, c.nombre, 1e-9) ? "correct" : "not_equivalent"];
  }
  const f = equationXY(v);
  if (!f) return ["parse_error"];
  return [proportionnelle(f, (m) => evalPolyDL(c.poly, m)) ? "correct" : "not_equivalent"];
}

/** Décimal proche de la valeur exacte demandée : refusé SANS tentative. */
export function approchee(e: E, p: PhaseDL, valeurs: string[]): string | null {
  if (p !== "correction" || copie(e).type !== "nombre") return null;
  const n = lireNombre((valeurs[0] ?? "").replace(/^\s*[a-zA-Z]\s*=\s*/, ""));
  const c = copie(e);
  if (n === null || egalNum(n, c.nombre, 1e-9)) return null;
  if (Math.abs(n - c.nombre) < 0.01 && /[.,]\d/.test(valeurs[0] ?? "")) return "C'est une valeur approchée : donne la valeur exacte (une racine si besoin). Cette saisie ne compte pas comme une tentative.";
  return null;
}

export function aReprendre(): Frag[] | null {
  return null;
}

export function piege(e: E, p: PhaseDL, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const c = copie(e);
  const v = valeurs[0] ?? "";
  if (p === "ligne") {
    const k = Number(v.slice(1)) - 1;
    if (k > c.ligneFausse) return [t(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [t(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  if (c.type === "points") {
    const pts = lirePoints(v);
    if (!pts) return null;
    if (c.pointsCopie.length && memesPoints(pts, c.pointsCopie)) return c.piege.length ? c.piege : null;
    if (pts.length !== c.points.length) return [t(`Il faut ${c.points.length === 1 ? "un seul point" : `${c.points.length} points`}.`)];
    return null;
  }
  if (c.type === "nombre") {
    const n = lireNombre(v.replace(/^\s*[a-zA-Z]\s*=\s*/, ""));
    if (n !== null && egalNum(n, c.nombreCopie, 1e-9)) return c.piege;
    if (n !== null && egalNum(n, c.nombre * c.nombre, 1e-9)) return [t("C'est le carré du rayon : prends sa racine.")];
    return null;
  }
  const f = equationXY(v);
  if (f && Object.keys(c.polyCopie).length && proportionnelle(f, (m) => evalPolyDL(c.polyCopie, m))) return c.piege;
  return null;
}
