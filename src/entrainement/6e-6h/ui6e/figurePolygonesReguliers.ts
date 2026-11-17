import type { ExercicePolygones, ExerciceSommets } from "../core6e/polygonesReguliers.types";
import type { FigurePolygone, PointFigurePolygone } from "../components6e/PlanPolygoneRegulier";
import { COULEURS, planComplexeSvg, positionLoinDe } from "../generateurs6e/figuresPlanComplexe40-42";
import type { PointPlan } from "../generateurs6e/figuresPlanComplexe40-42";
import { sommetFlottant, sommetsDemandes, valeurRayon } from "../moteur6e/modelePolygonesReguliers";
import { graineDepuis } from "../moteur6e/saisieComplexe";
import type { PhasePolygones } from "../moteur6e/typesPolygonesReguliers";
import { phasesDe } from "../moteur6e/typesPolygonesReguliers";

/**
 * Figures de `6gen97` — écran (`FigurePolygone`, rendu par `components6e/PlanPolygoneRegulier.tsx`)
 * et papier (SVG autonome, `planComplexeSvg` partagé avec 6gen40–42 et 6gen95).
 *
 * - `sommets` : fenêtre FIXE [−5 ; 5]², C, A et le cercle de centre C passant par A ; les sommets
 *   demandés n'apparaissent qu'une fois leur écran validé (le polygone complet à la toute fin) —
 *   l'énoncé ne trahit jamais leur position (pour n = 4, ils tomberaient sur le quadrillage).
 * - `mesures` : fenêtre FIXE [−6 ; 6]², le polygone complet, O, Z₀, Z₁ et le côté [Z₀Z₁] (rien à
 *   lire : les mesures demandées sont des valeurs exactes calculées à partir de z₀).
 * - `somme-nulle` : écrans de la démonstration → les n racines n-ièmes de l'unité sur le cercle
 *   unité (1, ω, ω², …) ; écrans d'application → le polygone de centre C (C et A étiquetés).
 * Identifiants SVG papier déterministes (dérivés du contenu).
 */

const INDICES = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈"];
const EXPOSANTS = ["", "", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸"];

export const BORNE_SOMMETS = 5;

/** Fenêtre de `mesures` : ajustée au rayon (rien n'est à lire sur cette figure, les mesures se
 * calculent à partir de z₀ donné dans l'énoncé). */
function borneMesures(r: number): number {
  return Math.max(3, Math.ceil(r + 0.6));
}

function nomZ(k: number): string {
  return `Z${INDICES[k]}`;
}

function nomOmega(k: number): string {
  return k === 0 ? "1" : `ω${EXPOSANTS[k]}`;
}

function tousSommets(e: ExercicePolygones): { x: number; y: number }[] {
  return Array.from({ length: e.n }, (_, k) => sommetFlottant(e, k));
}

/** Nombre de sommets demandés déjà validés (variante `sommets`) à l'écran donné. */
function sommetsValides(e: ExerciceSommets, phase: PhasePolygones, valide: boolean): number[] {
  const demandes = sommetsDemandes(e);
  const phases = phasesDe(e);
  const i = phases.indexOf(phase);
  if (i > phases.indexOf("sommet1") || (phase === "sommet1" && valide)) {
    if (i > phases.indexOf("autresSommets") || (phase === "autresSommets" && valide)) return demandes;
    return [1];
  }
  return [];
}

export function figureEcran(e: ExercicePolygones, phase: PhasePolygones, valide: boolean): FigurePolygone {
  if (e.variante === "sommets") {
    const r = Math.hypot(e.a.x - e.c.x, e.a.y - e.c.y);
    const trouves = sommetsValides(e, phase, valide);
    const points: PointFigurePolygone[] = [
      { x: e.c.x, y: e.c.y, label: "C", role: "centre" },
      { x: e.a.x, y: e.a.y, label: "A", role: "donnee" },
    ];
    for (const k of trouves) points.push({ ...sommetFlottant(e, k), label: nomZ(k), role: "trouve" });
    const fin = phase === "autresSommets" && valide;
    if (fin) {
      for (let k = 1; k < e.n; k++) if (!trouves.includes(k)) points.push({ ...sommetFlottant(e, k), label: "", role: "neutre" });
    }
    const noms = ["C", "A", ...trouves.map(nomZ)];
    return {
      borne: BORNE_SOMMETS,
      pas: 1,
      cercle: { cx: e.c.x, cy: e.c.y, r },
      polygone: fin ? tousSommets(e) : trouves.length ? [{ x: e.a.x, y: e.a.y }, ...trouves.map((k) => sommetFlottant(e, k))] : undefined,
      points,
      centreEtiquettes: e.c,
      legende: `Plan complexe quadrillé (une unité par carreau) : points ${noms.join(", ")} et cercle de centre C passant par A`,
    };
  }
  if (e.variante === "mesures") {
    const sommets = tousSommets(e);
    const points: PointFigurePolygone[] = sommets.map((p, k) => ({ ...p, label: k <= 1 ? nomZ(k) : "", role: k <= 1 ? "donnee" : "neutre" }));
    return {
      borne: borneMesures(valeurRayon(e)),
      pas: 1,
      cercle: { cx: 0, cy: 0, r: valeurRayon(e) },
      polygone: sommets,
      segment: { de: sommets[0], a: sommets[1] },
      points,
      centreEtiquettes: { x: 0, y: 0 },
      legende: `Polygone régulier à ${e.n} côtés inscrit dans le cercle de centre O ; côté [Z₀Z₁] mis en évidence`,
    };
  }
  if (phase === "identite" || phase === "conclusion") {
    const racines = Array.from({ length: e.n }, (_, k) => ({ x: Math.cos((2 * Math.PI * k) / e.n), y: Math.sin((2 * Math.PI * k) / e.n) }));
    return {
      borne: 1.5,
      pas: 0.5,
      cercle: { cx: 0, cy: 0, r: 1 },
      polygone: racines,
      points: racines.map((p, k) => ({ ...p, label: nomOmega(k), role: "donnee" })),
      centreEtiquettes: { x: 0, y: 0 },
      legende: `Les ${e.n} racines ${e.n}-ièmes de l'unité sur le cercle unité : 1, ω, ω², …`,
    };
  }
  const sommets = tousSommets(e);
  return {
    borne: BORNE_SOMMETS,
    pas: 1,
    cercle: { cx: e.c.x, cy: e.c.y, r: Math.hypot(e.a.x - e.c.x, e.a.y - e.c.y) },
    polygone: sommets,
    points: [
      { x: e.c.x, y: e.c.y, label: "C", role: "centre" },
      { x: e.a.x, y: e.a.y, label: "A", role: "donnee" },
      ...sommets.slice(1).map((p): PointFigurePolygone => ({ ...p, label: "", role: "neutre" })),
    ],
    centreEtiquettes: e.c,
    legende: `Polygone régulier à ${e.n} sommets de centre C, sommet A`,
  };
}

// ---------------------------------------------------------------------------------------------
// Figures papier.
// ---------------------------------------------------------------------------------------------

const VIOLET = "var(--plan, #5b4ea3)";

function idFigure(e: ExercicePolygones, sel: string): string {
  return `pr${sel}${graineDepuis(e, sel).toString(36)}`;
}

function pos(p: { x: number; y: number }, centre: { x: number; y: number }): PointPlan["position"] {
  return positionLoinDe([p.x, p.y], [centre.x, centre.y]);
}

/** Énoncé papier : `sommets` → C, A et le cercle ; `mesures` → polygone, O, Z₀, Z₁ ; `somme-nulle` → polygone de centre C. */
export function figureEnoncePolygonesSvg(e: ExercicePolygones): string {
  if (e.variante === "sommets") {
    return planComplexeSvg({
      points: [
        { x: e.c.x, y: e.c.y, etiquette: "C", couleur: VIOLET, position: pos(e.c, e.a) },
        { x: e.a.x, y: e.a.y, etiquette: "A", couleur: COULEURS.ciel, position: pos(e.a, e.c) },
      ],
      cercles: [{ cx: e.c.x, cy: e.c.y, r: Math.hypot(e.a.x - e.c.x, e.a.y - e.c.y), couleur: VIOLET, pointilles: true }],
      fenetreFixe: { xMin: -BORNE_SOMMETS, xMax: BORNE_SOMMETS, yMin: -BORNE_SOMMETS, yMax: BORNE_SOMMETS },
      idBase: idFigure(e, "e"),
      libelle: "Plan complexe quadrillé : centre C, sommet A et cercle de centre C passant par A",
    });
  }
  const sommets = tousSommets(e);
  const centre = e.variante === "mesures" ? { x: 0, y: 0 } : e.c;
  const borne = e.variante === "mesures" ? borneMesures(valeurRayon(e)) : BORNE_SOMMETS;
  const points: PointPlan[] = sommets.map((p, k) => ({
    x: p.x,
    y: p.y,
    etiquette: e.variante === "mesures" ? (k <= 1 ? nomZ(k) : undefined) : k === 0 ? "A" : undefined,
    couleur: k === 0 || (e.variante === "mesures" && k === 1) ? COULEURS.ciel : COULEURS.doux,
    position: pos(p, centre),
  }));
  if (e.variante === "somme-nulle") points.push({ x: e.c.x, y: e.c.y, etiquette: "C", couleur: VIOLET, position: pos(e.c, e.a) });
  return planComplexeSvg({
    points,
    cercles: [{ cx: centre.x, cy: centre.y, r: Math.hypot(sommets[0].x - centre.x, sommets[0].y - centre.y), couleur: VIOLET, pointilles: true }],
    polygones: [{ sommets: sommets.map((p): [number, number] => [p.x, p.y]), couleur: COULEURS.bon }],
    fenetreFixe: { xMin: -borne, xMax: borne, yMin: -borne, yMax: borne },
    idBase: idFigure(e, "e"),
    libelle: e.variante === "mesures" ? "Polygone régulier inscrit dans le cercle de centre O : sommets Z₀ et Z₁" : "Polygone régulier de centre C et de sommet A",
  });
}

/** Corrigé papier (`sommets`) : le polygone complet, sommets demandés étiquetés. */
export function figureCorrigeSommetsSvg(e: ExerciceSommets): string {
  const sommets = tousSommets(e);
  const demandes = sommetsDemandes(e);
  const points: PointPlan[] = [
    { x: e.c.x, y: e.c.y, etiquette: "C", couleur: VIOLET, position: pos(e.c, e.a) },
    ...sommets.map(
      (p, k): PointPlan => ({
        x: p.x,
        y: p.y,
        etiquette: k === 0 ? "A" : demandes.includes(k) ? nomZ(k) : undefined,
        couleur: k === 0 ? COULEURS.ciel : demandes.includes(k) ? COULEURS.bon : COULEURS.doux,
        position: pos(p, e.c),
      }),
    ),
  ];
  return planComplexeSvg({
    points,
    cercles: [{ cx: e.c.x, cy: e.c.y, r: Math.hypot(e.a.x - e.c.x, e.a.y - e.c.y), couleur: VIOLET, pointilles: true }],
    polygones: [{ sommets: sommets.map((p): [number, number] => [p.x, p.y]), couleur: COULEURS.bon }],
    fenetreFixe: { xMin: -BORNE_SOMMETS, xMax: BORNE_SOMMETS, yMin: -BORNE_SOMMETS, yMax: BORNE_SOMMETS },
    idBase: idFigure(e, "c"),
    libelle: "Corrigé : le polygone régulier complet, sommets demandés étiquetés",
  });
}
