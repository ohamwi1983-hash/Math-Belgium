import { Line, Point as MafsPoint } from "mafs";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import { foyer, pointDeH, pointH, pointsOuverture, sommet } from "../moteur/geometrieConstructionParabole";
import { indiceHEcran, type AcquisConstruction, type EcranConstructionParabole, type TraceConstruction } from "../moteur/modeleConstructionParabole";
import { AngleDroit, COULEURS_PLAN, CodageEgalite, Etiquette, LongueDroite } from "./PlanConstructionParabole";

/** PF et PH codés égaux, avec l'angle droit en H (H = projeté de P sur d). */
function EgaliteDistances({ exercice, p, nomH = "H" }: { exercice: ExerciceConstructionParabole; p: Point; nomH?: string }) {
  const f = foyer(exercice);
  const h: Point = { x: p.x, y: 0 };
  const c = COULEURS_PLAN.resultat;
  return (
    <>
      <Line.Segment point1={[p.x, p.y]} point2={[f.x, f.y]} color={c} weight={2} />
      <Line.Segment point1={[p.x, p.y]} point2={[h.x, h.y]} color={c} weight={2} />
      <AngleDroit sommetAngle={h} u={{ x: p.x >= 0 ? -1 : 1, y: 0 }} v={{ x: 0, y: 1 }} couleur={c} />
      <CodageEgalite a={p} b={f} couleur={c} />
      <CodageEgalite a={p} b={h} couleur={c} />
      <Etiquette x={p.x} y={p.y} texte="P" couleur={c} dx={p.x >= 0 ? 12 : -12} dy={-10} />
      {nomH === "H" && <Etiquette x={h.x} y={h.y} texte="H" couleur={c} dx={0} dy={16} />}
    </>
  );
}

/** Médiatrice d'un segment [AB] (droite infinie). */
function Mediatrice({ a, b }: { a: Point; b: Point }) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2;
  return <LongueDroite point={[(a.x + b.x) / 2, (a.y + b.y) / 2]} angle={angle} color={COULEURS_PLAN.resultat} weight={1.6} style="dashed" />;
}

/** Ce que la clôture d'un écran fait apparaître : médiatrice, égalité PF = PH, symétrique. */
export function SurcoucheResultat({ exercice, ecran, acquis }: { exercice: ExerciceConstructionParabole; ecran: EcranConstructionParabole; acquis: AcquisConstruction }) {
  switch (ecran.type) {
    case "sommet":
      return <Mediatrice a={{ x: 0, y: 0 }} b={foyer(exercice)} />;
    case "cercleF":
    case "coupleRapide": {
      const r = acquis.ouvertures[acquis.ouvertures.length - 1];
      if (r === undefined) return null;
      const [gauche, droite] = pointsOuverture(exercice, r);
      return (
        <>
          <EgaliteDistances exercice={exercice} p={droite} />
          <Etiquette x={gauche.x} y={gauche.y} texte="P′" couleur={COULEURS_PLAN.resultat} dx={-12} dy={-10} />
        </>
      );
    }
    case "mediatriceH":
    case "pointRapide": {
      const i = indiceHEcran(ecran);
      const h = pointH(exercice, i);
      const p = pointDeH(exercice, h.x);
      const symetrique: Point = { x: -p.x, y: p.y };
      return (
        <>
          <Mediatrice a={foyer(exercice)} b={h} />
          <EgaliteDistances exercice={exercice} p={p} nomH={`H${i + 1}`} />
          <Line.Segment point1={[p.x, p.y]} point2={[symetrique.x, symetrique.y]} color={COULEURS_PLAN.axe} weight={1.2} style="dashed" />
          <MafsPoint x={symetrique.x} y={symetrique.y} color={COULEURS_PLAN.point} svgCircleProps={{ r: 5 }} />
          <Etiquette x={symetrique.x} y={symetrique.y} texte="P′" couleur={COULEURS_PLAN.resultat} dx={symetrique.x >= 0 ? 12 : -12} dy={-10} />
        </>
      );
    }
    default:
      return null;
  }
}

/** Tracés des écrans précédents du même couple / du même point, rappelés en pointillés. */
export function tracesContexte(exercice: ExerciceConstructionParabole, ecran: EcranConstructionParabole, acquis: AcquisConstruction): TraceConstruction[] {
  const r = acquis.ouvertureEnCours;
  switch (ecran.type) {
    case "parallele":
      return r === null ? [] : [{ type: "cercle", centre: "K", rayon: r }];
    case "cercleF":
      return r === null ? [] : [{ type: "cercle", centre: "K", rayon: r }, { type: "droite", reference: "axe", position: r }];
    case "mediatriceH":
      return [{ type: "droite", reference: "d", position: pointH(exercice, 0).x }];
    default:
      return [];
  }
}

/** Positions où l'équerre se cale : projections des points remarquables sur la droite de glissement. */
export function aimantsEquerre(exercice: ExerciceConstructionParabole, reference: "d" | "axe", traces: TraceConstruction[], points: Point[]): number[] {
  if (reference === "d") return [0, ...exercice.abscissesH, ...points.map((p) => p.x)];
  const coupes = traces.flatMap((t) => (t.type === "cercle" && t.centre === "K" ? [t.rayon, -t.rayon] : []));
  return [0, exercice.h, sommet(exercice).y, ...coupes, ...points.map((p) => p.y)];
}
