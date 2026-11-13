import type { ExerciceEquilibreForces, OptionCondition, Vecteur2 } from "../core/equilibreForces.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { angleF3, f1, f2, f3, intensiteExacteDemandee, intensiteF3, normeCarreeF3, resultante, sommeIntensites } from "./modeleEquilibreForces";

/**
 * Vérification de gen90.
 * - Écran 1 : choix fermé de la condition d'équilibre (une tentative).
 * - Écrans 2 et 3 : deux composantes ; chaque champ est jugé séparément (marquage du seul champ
 *   faux) et les erreurs typiques ont un statut propre : F₁ − F₂ au lieu de F₁ + F₂, F₃ = F₁ + F₂
 *   (oubli du signe moins : résultante et force d'équilibre confondues), carreaux non convertis en
 *   newtons (anneau). Écran 3 : jugé sur F₃ CORRECTE (jamais sur la résultante saisie à l'écran 2).
 * - Écran 4 : l'intensité, expression libre (« 10rac(13) », « √1300 », « 50 »…). Valeur exacte
 *   demandée : tolérance quasi nulle ; un décimal proche donne `approchee` (ne consomme PAS de
 *   tentative, comme une saisie illisible : seule la forme ne va pas). Valeur arrondie demandée :
 *   tolérance de 0,1 N. Pièges : somme des intensités de F₁ et F₂, somme des composantes, carré de
 *   la norme sans la racine.
 * - Écran 5 : l'angle aigu avec l'axe x, au dixième de degré (tolérance 0,15°). Pièges : angle avec
 *   l'axe y (complémentaire), calculatrice en radians, tangente donnée au lieu de l'angle.
 */

export type StatutComposantes = "correct" | "soustraction" | "oppose" | "oubli_signe" | "carreaux" | "faux" | "parse_error";
export type StatutIntensite = "correct" | "approchee" | "somme_intensites" | "somme_composantes" | "sans_racine" | "carreaux" | "faux" | "parse_error";
export type StatutAngle = "correct" | "complementaire" | "radians" | "tangente" | "obtus" | "faux" | "parse_error";

/** Nombre saisi : virgule ou point, signe moins typographique, « ° » et espaces tolérés. */
export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/°$/, "").replace(/[−–—]/g, "-").replace(",", ".");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function verifierCondition(choix: OptionCondition): boolean {
  return choix === "oppose";
}

function egal(v: Vecteur2, w: Vecteur2): boolean {
  return Math.abs(v.x - w.x) < 1e-9 && Math.abs(v.y - w.y) < 1e-9;
}

export interface DiagnosticComposantes {
  statut: StatutComposantes;
  xJuste: boolean;
  yJuste: boolean;
  lu: Vecteur2 | null;
}

function diagnostic(textes: [string, string], attendu: Vecteur2, pieges: [StatutComposantes, Vecteur2][]): DiagnosticComposantes {
  const x = lireNombre(textes[0]);
  const y = lireNombre(textes[1]);
  if (x === null || y === null) return { statut: "parse_error", xJuste: false, yJuste: false, lu: null };
  const lu = { x, y };
  const xJuste = Math.abs(x - attendu.x) < 1e-9;
  const yJuste = Math.abs(y - attendu.y) < 1e-9;
  if (xJuste && yJuste) return { statut: "correct", xJuste, yJuste, lu };
  const piege = pieges.find(([, v]) => egal(lu, v) && !egal(v, attendu));
  return { statut: piege ? piege[0] : "faux", xJuste, yJuste, lu };
}

function enCarreaux(e: ExerciceEquilibreForces, v: Vecteur2): Vecteur2 {
  return { x: v.x / e.unite, y: v.y / e.unite };
}

/** Écran 2 : résultante F₁ + F₂. */
export function diagnostiquerResultante(e: ExerciceEquilibreForces, textes: [string, string]): DiagnosticComposantes {
  const r = resultante(e);
  const a = f1(e);
  const b = f2(e);
  const pieges: [StatutComposantes, Vecteur2][] = [
    ["soustraction", { x: a.x - b.x, y: a.y - b.y }],
    ["soustraction", { x: b.x - a.x, y: b.y - a.y }],
    ["oppose", { x: -r.x, y: -r.y }],
  ];
  if (e.situation === "anneau") pieges.push(["carreaux", enCarreaux(e, r)]);
  return diagnostic(textes, r, pieges);
}

/** Écran 3 : F₃ = −(F₁ + F₂). */
export function diagnostiquerF3(e: ExerciceEquilibreForces, textes: [string, string]): DiagnosticComposantes {
  const v = f3(e);
  const pieges: [StatutComposantes, Vecteur2][] = [["oubli_signe", resultante(e)]];
  if (e.situation === "anneau") pieges.push(["carreaux", enCarreaux(e, v)]);
  return diagnostic(textes, v, pieges);
}

/** « − », « √3 », « √(…) » : ramenés à la syntaxe de l'évaluateur. */
function normaliserExpression(texte: string): string {
  return texte
    .replace(/[−–—]/g, "-")
    .replace(/√\s*\(/g, "rac(")
    .replace(/√\s*(\d+)/g, "rac($1)")
    .replace(/\s*N\s*$/, "")
    .trim();
}

/** Valeur d'une expression numérique (entier, décimal, racine), `null` si illisible. */
export function lireExpression(texte: string): number | null {
  const s = normaliserExpression(texte);
  if (s === "") return null;
  if (/[a-z]/i.test(s.replace(/racine|rac|sqrt/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s.replace(/,/g, "."), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function proche(v: number, cible: number, tolerance: number): boolean {
  return Math.abs(v - cible) <= tolerance;
}

/** Écran 4 : intensité de F₃. */
export function diagnostiquerIntensite(e: ExerciceEquilibreForces, texte: string): StatutIntensite {
  const v = lireExpression(texte);
  if (v === null) return "parse_error";
  const cible = intensiteF3(e);
  // Un simple nombre (sans racine) proche d'une valeur exacte irrationnelle : forme refusée, sans
  // pénalité.
  const nombreSeul = lireNombre(texte.replace(/\s*N\s*$/, "")) !== null;
  if (intensiteExacteDemandee(e)) {
    if (proche(v, cible, 1e-6 * Math.max(1, cible))) return "correct";
    if (nombreSeul && proche(v, cible, Math.max(0.1, 0.01 * cible))) return "approchee";
  } else if (proche(v, cible, 0.1)) {
    return "correct";
  }
  const t = Math.max(0.1, 0.005 * cible);
  if (proche(v, sommeIntensites(e), t)) return "somme_intensites";
  const g = f3(e);
  if (g.x !== 0 && g.y !== 0 && proche(v, Math.abs(g.x) + Math.abs(g.y), 1e-6)) return "somme_composantes";
  if (proche(v, normeCarreeF3(e), 1e-6)) return "sans_racine";
  if (e.situation === "anneau" && proche(v, cible / e.unite, Math.max(0.05, 0.005 * cible))) return "carreaux";
  return "faux";
}

/** Écran 5 : angle aigu entre F₃ et l'axe x. */
export function diagnostiquerAngle(e: ExerciceEquilibreForces, texte: string): StatutAngle {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  const a = angleF3(e);
  if (proche(v, a, 0.15)) return "correct";
  if (proche(v, 90 - a, 0.15)) return "complementaire";
  if (proche(v, 180 - a, 0.15)) return "obtus";
  if (proche(v, (a * Math.PI) / 180, 0.006)) return "radians";
  const g = f3(e);
  if (proche(v, Math.abs(g.y / g.x), 0.006)) return "tangente";
  return "faux";
}
