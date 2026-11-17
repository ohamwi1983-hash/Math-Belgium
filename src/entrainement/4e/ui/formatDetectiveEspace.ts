import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { texte } from "../../export/fragmentsDocx";
import type { CorrigeFigureEspace, DessinPave, ExerciceDetectiveEspace, FigureSolideEspace } from "../core/detectiveEspace.types";
import type { CadreDessin, PointDessin } from "../core/perspectiveCavaliere.types";
import { COULEURS_CAVALIERE, figureCavaliereSvg, type ModeFigure, type PointFigure, type SegmentFigure } from "./figureCavaliere";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, figurePositionsPlansSvg } from "./figurePositionsPlans";

/**
 * Textes et figures de gen107 (« Détective d'erreurs : géométrie dans l'espace ») — UNE source pour
 * l'écran et le papier. Les figures réutilisent celles du chapitre, sans en changer le rendu :
 * `figurePositionsPlansSvg` (gen101/gen103 : solide, points nommés, plans colorés par le triangle de
 * leurs trois points, droites prolongées avec parties cachées en pointillé) et `figureCavaliereSvg`
 * (gen104 : quadrillage de 1 cm, à l'échelle réelle sur papier).
 */

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette copie est fausse. Trouve-la, explique l'erreur et corrige-la.";

export const NOMBRE_ECRANS = 3;

export function consignesEcrans(e: ExerciceDetectiveEspace): FragmentConsigne[][] {
  const n = e.ligneFausse + 1;
  return [[texte("Quelle ligne de la copie est fausse ?")], [texte(`Ligne ${n} : quelle est l'erreur de l'élève ?`)], e.questionCorrection];
}

export function aidesEcran(e: ExerciceDetectiveEspace, ecran: number): FragmentConsigne[][] {
  return e.aides[ecran] ?? [];
}

export function descriptionCorrecte(e: ExerciceDetectiveEspace): FragmentConsigne[] {
  return e.descriptions.find((d) => d.correcte)!.fragments;
}

export function correctionCorrecte(e: ExerciceDetectiveEspace) {
  return e.corrections.find((d) => d.correcte)!;
}

// ---------------------------------------------------------------------------------------------
// Figure d'un solide
// ---------------------------------------------------------------------------------------------

export const COULEURS_DROITES = [COULEUR_DROITE, COULEUR_CONSTRUCTION];

/** Figure du solide : énoncé (rien que les données) ; `ligne` : tracés de cette ligne de la copie ;
 * `corrige` : éléments du corrigé. */
export function figureSolideSvg(f: FigureSolideEspace, mode: ModeFigure, options: { ligne?: number | null; corrige?: CorrigeFigureEspace | null } = {}): string {
  const dessin = options.ligne !== undefined && options.ligne !== null && f.dessins ? f.dessins[options.ligne] : null;
  const c = options.corrige ?? null;
  const droites = [...(dessin?.droites ?? []), ...(c?.droites ?? [])].map(([a, b], i) => ({ a, b, couleur: COULEURS_DROITES[i % 2]! }));
  const points = [
    ...(dessin?.points ?? []).map((position) => ({ position, label: "", couleur: COULEUR_DROITE })),
    ...(c?.points ?? []).map((p) => ({ position: p.position, label: p.nom, couleur: COULEUR_CONSTRUCTION })),
  ];
  const plans = c ? [...f.plans, ...c.plans.filter((p) => !f.plans.some((q) => q.join("") === p.join("")))] : f.plans;
  return figurePositionsPlansSvg({ solide: f.solide, milieux: f.points, plans }, { mode, droites, points, sections: !!c?.sections });
}

// ---------------------------------------------------------------------------------------------
// Dessin d'un pavé (thème cavalière)
// ---------------------------------------------------------------------------------------------

interface SommetsPave {
  [nom: string]: PointDessin;
}

export function sommetsPave(d: DessinPave): SommetsPave {
  const k = d.profondeur * d.coefficient;
  const a = (d.angle * Math.PI) / 180;
  const v = { x: k * Math.cos(a), y: k * Math.sin(a) };
  const A = { x: 0, y: 0 };
  const B = { x: d.largeur, y: 0 };
  const F = { x: d.largeur, y: d.hauteur };
  const E = { x: 0, y: d.hauteur };
  const plus = (p: PointDessin) => ({ x: p.x + v.x, y: p.y + v.y });
  return { A, B, F, E, D: plus(A), C: plus(B), G: plus(F), H: plus(E) };
}

const ARETES_PAVE: [string, string][] = [
  ["A", "B"],
  ["B", "F"],
  ["F", "E"],
  ["E", "A"],
  ["D", "C"],
  ["C", "G"],
  ["G", "H"],
  ["H", "D"],
  ["A", "D"],
  ["B", "C"],
  ["F", "G"],
  ["E", "H"],
];

export function cadrePave(d: DessinPave): CadreDessin {
  const s = Object.values(sommetsPave(d));
  return {
    xMin: Math.floor(Math.min(...s.map((p) => p.x))) - 1,
    xMax: Math.ceil(Math.max(...s.map((p) => p.x))) + 1,
    yMin: Math.floor(Math.min(...s.map((p) => p.y))) - 1,
    yMax: Math.ceil(Math.max(...s.map((p) => p.y))) + 1,
  };
}

/** Le dessin d'un pavé sur quadrillage : arêtes du sommet `cache` en pointillés. `cadre` : cadre
 * commun (les quatre dessins de l'écran c ont le même, pour être comparables). */
export function dessinPaveSvg(d: DessinPave, mode: ModeFigure, options: { etiquettes?: boolean; cadre?: CadreDessin; couleur?: string } = {}): string {
  const s = sommetsPave(d);
  const segments: SegmentFigure[] = ARETES_PAVE.map(([a, b]) => ({ a: s[a]!, b: s[b]!, pointille: a === d.cache || b === d.cache, couleur: options.couleur }));
  const etiquettes = options.etiquettes ?? true;
  const points: PointFigure[] = Object.entries(s).map(([nom, p]) => ({ p, label: etiquettes ? nom : undefined }));
  const centre = { x: Object.values(s).reduce((t, p) => t + p.x, 0) / 8, y: Object.values(s).reduce((t, p) => t + p.y, 0) / 8 };
  return figureCavaliereSvg({ mode, cadre: options.cadre ?? cadrePave(d), segments, points, centre, libelle: "Dessin d'un pavé droit en perspective sur un quadrillage de 1 cm" });
}

/** Cadre commun à plusieurs dessins (écran c). */
export function cadreCommun(dessins: DessinPave[]): CadreDessin {
  const c = dessins.map(cadrePave);
  return { xMin: Math.min(...c.map((x) => x.xMin)), xMax: Math.max(...c.map((x) => x.xMax)), yMin: Math.min(...c.map((x) => x.yMin)), yMax: Math.max(...c.map((x) => x.yMax)) };
}

export const COULEUR_DESSIN_JUSTE = COULEURS_CAVALIERE.juste;
