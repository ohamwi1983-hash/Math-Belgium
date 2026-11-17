import type { ExerciceRegions } from "../core6e/regionsPlanComplexe.types";
import { COULEURS, planComplexeSvg, positionLoinDe } from "../generateurs6e/figuresPlanComplexe40-42";
import type { CerclePlan, ConditionRegionPlan, DemiDroitePlan, DroitePlan, PointPlan } from "../generateurs6e/figuresPlanComplexe40-42";
import { BORNE_FENETRE, optionsRegion, zoneCondition } from "../moteur6e/modeleRegionsPlanComplexe";
import type { OptionRegion, RegionGeo, ZoneDessin } from "../moteur6e/modeleRegionsPlanComplexe";
import { graineDepuis } from "../moteur6e/saisieComplexe";

/**
 * Figures de `6gen98` « Régions du plan complexe » (SVG autonome, `planComplexeSvg` partagé avec
 * 6gen40–42 et 6gen95, étendu d'un remplissage de régions) — repère FIXE [−5 ; 5]², quadrillage
 * d'une unité, frontières sur le quadrillage :
 * - écran « bord » : la frontière seule, en gris (son style plein/pointillé est la réponse) ;
 * - écran « région » : les quatre figures proposées (bord au style correct, déjà validé) ;
 * - corrigé papier (`figureHtml`) : la région E colorée, frontière(s) en trait plein (incluse) ou
 *   en pointillés (exclue), points repères.
 * Identifiants SVG déterministes, dérivés du contenu (jamais un compteur global).
 */

const FENETRE = { xMin: -BORNE_FENETRE, xMax: BORNE_FENETRE, yMin: -BORNE_FENETRE, yMax: BORNE_FENETRE };

function regionPlan(r: RegionGeo): ConditionRegionPlan {
  return r;
}

interface Traces {
  cercles: CerclePlan[];
  droites: DroitePlan[];
  demiDroites: DemiDroitePlan[];
  points: PointPlan[];
}

function traces(zones: ZoneDessin[], couleur: string, styleBord: boolean): Traces {
  const res: Traces = { cercles: [], droites: [], demiDroites: [], points: [] };
  for (const z of zones) {
    const pointilles = styleBord ? !z.inclus : false;
    const epaisseur = styleBord ? 2 : 1.6;
    const b = z.bord;
    if (b.type === "cercle") res.cercles.push({ cx: b.cx, cy: b.cy, r: b.r, couleur, pointilles, epaisseur });
    else if (b.type === "droite") res.droites.push({ p1: b.p1, p2: b.p2, couleur, pointilles, epaisseur });
    else b.angles.forEach((angle) => res.demiDroites.push({ origine: [b.sx, b.sy], angle, couleur, pointilles, epaisseur }));
    const centreZone: [number, number] =
      b.type === "rayons" ? [b.sx + Math.cos((b.angles[0] + b.angles[1]) / 2), b.sy + Math.sin((b.angles[0] + b.angles[1]) / 2)] : z.reperes.length === 2 ? [(z.reperes[0].x + z.reperes[1].x) / 2, (z.reperes[0].y + z.reperes[1].y) / 2] : [0, 0];
    for (const r of z.reperes) {
      if (res.points.some((p) => p.x === r.x && p.y === r.y && p.etiquette === r.nom)) continue;
      res.points.push({ x: r.x, y: r.y, etiquette: r.nom, couleur: COULEURS.encre, creux: r.creux, position: r.nom === "Ω" ? "ne" : positionLoinDe([r.x, r.y], centreZone) });
    }
  }
  return res;
}

function figure(zones: ZoneDessin[], options: { remplir: boolean; styleBord: boolean; couleurBord: string; idBase: string; libelle: string }): string {
  const tr = traces(zones, options.couleurBord, options.styleBord);
  return planComplexeSvg({
    regions: options.remplir ? [{ conditions: zones.map((z) => regionPlan(z.region)), couleur: COULEURS.ciel, opacite: 0.32 }] : [],
    cercles: tr.cercles,
    droites: tr.droites,
    demiDroites: tr.demiDroites,
    points: tr.points,
    fenetreFixe: FENETRE,
    idBase: options.idBase,
    libelle: options.libelle,
  });
}

function idFigure(e: ExerciceRegions, sel: string): string {
  return `rg${sel}${graineDepuis(e, sel).toString(36)}`;
}

/** Zones de la bonne région (une par condition). */
export function zonesCorrectes(e: ExerciceRegions): ZoneDessin[] {
  return e.conditions.map((c) => zoneCondition(c, false, false));
}

/** Écran « bord » : la frontière seule, en violet (visible même sur un axe), sans style plein ou
 * pointillé (c'est la question). */
export function figureFrontiereSvg(e: ExerciceRegions): string {
  return figure(zonesCorrectes(e), { remplir: false, styleBord: false, couleurBord: "var(--plan, #5b4ea3)", idBase: idFigure(e, "f"), libelle: "Plan complexe : frontière de l'ensemble E" });
}

/** Écran « région » : une des quatre figures proposées. */
export function figureOptionSvg(e: ExerciceRegions, option: OptionRegion, numero: number): string {
  return figure(option.zones, {
    remplir: true,
    styleBord: true,
    couleurBord: COULEURS.accent,
    idBase: `${idFigure(e, "o")}${option.id}`,
    libelle: `Figure ${numero} : région colorée du plan complexe`,
  });
}

export function figuresOptions(e: ExerciceRegions): { option: OptionRegion; svg: string }[] {
  return optionsRegion(e).map((option, i) => ({ option, svg: figureOptionSvg(e, option, i + 1) }));
}

/** Corrigé papier : la région E. */
export function figureCorrigeSvg(e: ExerciceRegions): string {
  return figure(zonesCorrectes(e), {
    remplir: true,
    styleBord: true,
    couleurBord: COULEURS.accent,
    idBase: idFigure(e, "c"),
    libelle: "Corrigé : ensemble E colorié, frontière en trait plein si elle est incluse, en pointillés sinon",
  });
}
