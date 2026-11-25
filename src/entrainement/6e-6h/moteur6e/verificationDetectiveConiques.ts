import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDC, PhaseDC } from "../core6e/detectiveConiques";
import { t } from "../ui6e/outilsConiquesLotH2";
import { estApprochee, lireMesure } from "../ui6e/outilsConiquesLotH2";
import { copie, evalPolyDC } from "./modeleDetectiveConiques";
import { egalNum, equationXY, lirePoints, memesPoints, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen143`. Ligne et description comparées à leur identifiant (choix fermés, une
 * tentative) ; écran 3 LU avant tout verdict (illisible → `parse_error`, aucune tentative) : points
 * (ensemble sans ordre, « aucun »), nombre EXACT (fraction ; décimal arrondi refusé sans tentative),
 * équation (proportionnalité). Messages ciblés : résultat de la copie repris.
 */

type E = ExerciceDC;

export function messageIllisible(e: E): string {
  const type = copie(e).type;
  if (type === "points") return "Points non reconnus : écris-les entre parenthèses, séparés par « ; », par exemple (5 ; 0) ; (−5 ; 0). Cette saisie ne compte pas comme une tentative.";
  if (type === "nombre") return "Valeur non reconnue : écris un nombre exact, par exemple 4/5. Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple 3x + 5y = 25. Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseDC, valeurs: string[]): StatutVerification[] {
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
    const n = lireMesure(v);
    if (n === null) return ["parse_error"];
    return [egalNum(n, c.nombre, 1e-9) ? "correct" : "not_equivalent"];
  }
  const f = equationXY(v);
  if (!f) return ["parse_error"];
  return [proportionnelle(f, (m) => evalPolyDC(c.poly, m)) ? "correct" : "not_equivalent"];
}

export function approchee(e: E, p: PhaseDC, valeurs: string[]): string | null {
  const c = copie(e);
  if (p !== "correction" || c.type !== "nombre") return null;
  const v = valeurs[0] ?? "";
  return estApprochee(v, lireMesure(v), c.nombre) ? "C'est une valeur approchée : donne la valeur exacte (une fraction). Cette saisie ne compte pas comme une tentative." : null;
}

export function piege(e: E, p: PhaseDC, valeurs: string[]): Frag[] | null {
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
    if (c.pointsCopie.length && memesPoints(pts, c.pointsCopie)) return c.piege;
    if (pts.length === 0 && c.points.length > 0) return c.piege;
    if (pts.length !== c.points.length) return [t(`Il faut ${c.points.length === 1 ? "un seul point" : `${c.points.length} points`}.`)];
    return null;
  }
  if (c.type === "nombre") {
    const n = lireMesure(v);
    if (n !== null && egalNum(n, c.nombreCopie, 1e-9)) return c.piege;
    return null;
  }
  const f = equationXY(v);
  if (f && Object.keys(c.polyCopie).length && proportionnelle(f, (m) => evalPolyDC(c.polyCopie, m))) return c.piege;
  return null;
}
