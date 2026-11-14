import { useState, type ReactNode } from "react";
import { Circle, Line, Mafs, MovablePoint, Point as MafsPoint, Polygon, Polyline, Transform, useTransformContext, vec } from "mafs";
import "mafs/core.css";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import {
  OUVERTURE_MAX,
  OUVERTURE_MIN,
  PIED_K,
  RAYON_AIMANT,
  cadreTourne,
  foyer,
  sommet,
  yParabole,
  type NomPoint,
} from "../moteur/geometrieConstructionParabole";
import { NOMS_H, coordonneesPoint, pointsConstruits, type AcquisConstruction, type TraceConstruction } from "../moteur/modeleConstructionParabole";
import { PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

/**
 * Figure de `gen53` : directrice oblique, foyer, ce qui est déjà construit, les tracés de l'écran
 * et les instruments (équerre qui glisse le long d'une droite, compas dont la pointe se pique sur un
 * point construit). Aucune grille ni coordonnée : seuls les instruments donnent les distances et les
 * angles droits. Tout est dessiné dans le repère LOCAL, sous `<Transform rotate={theta}>`.
 */

export const COULEURS_PLAN = {
  directrice: "#343a40",
  foyer: "#e67700",
  axe: "#868e96",
  compas: "#1971c2",
  equerre: "#d9480f",
  point: "#2f9e44",
  resultat: "#7048e8",
  coupe: "#d9480f",
};

/** Rapport largeur/hauteur : plus allongé sur grand écran, presque carré sur téléphone. */
const RATIO_LARGE = 1.6;
const RATIO_ETROIT = 1;
const LARGEUR_MIN = 260;
const LARGEUR_MAX = 900;
const LONGUEUR_JAMBE = 3.4;
const COTE_EQUERRE_LONG = 4.4;
const COTE_EQUERRE_COURT = 2.2;
const TAILLE_ANGLE_DROIT = 0.28;

export interface EtatCompas {
  pointe: NomPoint;
  /** Position de la mine (repère local) : l'ouverture est sa distance à la pointe. */
  mine: Point;
}

export interface InstrumentEquerre {
  reference: "d" | "axe";
  position: number;
  onChange: (position: number) => void;
  /** Positions remarquables où l'équerre se cale (aimant). */
  aimants: number[];
}

/** Compas : la pointe se choisit par boutons (un point construit), seule la mine se fait glisser —
 * deux poignées voisines se chevaucheraient au doigt pour une petite ouverture. */
export interface InstrumentCompas {
  etat: EtatCompas;
  onChange: (etat: EtatCompas) => void;
}

interface Props {
  exercice: ExerciceConstructionParabole;
  acquis: AcquisConstruction;
  /** Tracés des écrans précédents du même couple (cercle de centre K, parallèle, perpendiculaire en H₁). */
  tracesContexte?: TraceConstruction[];
  /** Tracés de l'écran courant. */
  traces?: TraceConstruction[];
  equerre?: InstrumentEquerre | null;
  compas?: InstrumentCompas | null;
  /** Éléments propres à l'écran, dessinés dans le repère local (médiatrice, égalités PF = PH…). */
  surcouche?: ReactNode;
  /** Masque les points construits (écran de tracé : il les dessine lui-même). */
  masquerPoints?: boolean;
  /** Marque les deux points où un cercle de centre K coupe l'axe (report de l'ouverture). */
  coupesK?: boolean;
}

function nomAffiche(nom: NomPoint): string {
  return nom.startsWith("H") ? `H${"₁₂₃"[Number(nom[1]) - 1]}` : nom;
}

/** Étiquette en espace pixel (toujours droite à l'écran), décalée de (dx, dy) pixels. */
export function Etiquette({ x, y, texte, couleur, dx = 8, dy = -8 }: { x: number; y: number; texte: string; couleur: string; dx?: number; dy?: number }) {
  const { viewTransform, userTransform } = useTransformContext();
  const [px, py] = vec.transform([x, y], vec.matrixMult(viewTransform, userTransform));
  return (
    <text x={px + dx} y={py + dy} fill={couleur} fontSize={15} fontWeight={700} fontStyle="italic" fontFamily="'Times New Roman', serif" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none", paintOrder: "stroke", stroke: "#ffffff", strokeWidth: 3 }}>
      {texte}
    </text>
  );
}

/** Deux petits traits perpendiculaires au milieu d'un segment (codage d'égalité de longueurs). */
export function CodageEgalite({ a, b, couleur }: { a: Point; b: Point; couleur: string }) {
  const { viewTransform, userTransform } = useTransformContext();
  const m = vec.matrixMult(viewTransform, userTransform);
  const [ax, ay] = vec.transform([a.x, a.y], m);
  const [bx, by] = vec.transform([b.x, b.y], m);
  const longueur = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / longueur;
  const uy = (by - ay) / longueur;
  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2;
  const traits = [-3, 3].map((decalage) => {
    const ox = cx + ux * decalage;
    const oy = cy + uy * decalage;
    return <line key={decalage} x1={ox - uy * 6} y1={oy + ux * 6} x2={ox + uy * 6} y2={oy - ux * 6} />;
  });
  return <g style={{ stroke: couleur, strokeWidth: 2 }}>{traits}</g>;
}

/** Petit carré d'angle droit au point `sommetAngle`, entre les directions unitaires u et v (local). */
export function AngleDroit({ sommetAngle, u, v, couleur }: { sommetAngle: Point; u: Point; v: Point; couleur: string }) {
  const s = TAILLE_ANGLE_DROIT;
  const p = sommetAngle;
  return (
    <Polygon
      points={[
        [p.x + u.x * s, p.y + u.y * s],
        [p.x + (u.x + v.x) * s, p.y + (u.y + v.y) * s],
        [p.x + v.x * s, p.y + v.y * s],
        [p.x, p.y],
      ]}
      color={couleur}
      fillOpacity={0}
      weight={1.4}
    />
  );
}

/** Droite « infinie » : un long segment. `Line.PointAngle` calcule ses extrémités avant la rotation
 * du `<Transform>` et paraît alors tronquée. */
export function LongueDroite({ point, angle, color, weight = 2, style = "solid", opacity }: { point: [number, number]; angle: number; color: string; weight?: number; style?: "solid" | "dashed"; opacity?: number }) {
  const L = 40;
  const c = Math.cos(angle) * L;
  const s = Math.sin(angle) * L;
  return <Line.Segment point1={[point[0] - c, point[1] - s]} point2={[point[0] + c, point[1] + s]} color={color} weight={weight} style={style} opacity={opacity} />;
}

/** Une droite tracée le long de l'équerre. */
function DroiteEquerre({ trace, couleur, style = "solid" }: { trace: Extract<TraceConstruction, { type: "droite" }>; couleur: string; style?: "solid" | "dashed" }) {
  if (trace.reference === "d") {
    return (
      <>
        <LongueDroite point={[trace.position, 0]} angle={Math.PI / 2} color={couleur} weight={2} style={style} />
        <AngleDroit sommetAngle={{ x: trace.position, y: 0 }} u={{ x: 1, y: 0 }} v={{ x: 0, y: 1 }} couleur={couleur} />
      </>
    );
  }
  return (
    <>
      <LongueDroite point={[0, trace.position]} angle={0} color={couleur} weight={2} style={style} />
      <AngleDroit sommetAngle={{ x: 0, y: trace.position }} u={{ x: 1, y: 0 }} v={{ x: 0, y: trace.position >= 0 ? -1 : 1 }} couleur={couleur} />
    </>
  );
}

function DessinTrace({ exercice, trace, discret, coupesK }: { exercice: ExerciceConstructionParabole; trace: TraceConstruction; discret: boolean; coupesK: boolean }) {
  if (trace.type === "droite") return <DroiteEquerre trace={trace} couleur={COULEURS_PLAN.equerre} style={discret ? "dashed" : "solid"} />;
  const centre = coordonneesPoint(exercice, trace.centre);
  return (
    <>
      <Circle center={[centre.x, centre.y]} radius={trace.rayon} color={COULEURS_PLAN.compas} weight={discret ? 1.2 : 1.8} fillOpacity={0} strokeStyle={discret ? "dashed" : "solid"} />
      {coupesK && trace.centre === "K" && (
        <>
          <MafsPoint x={0} y={trace.rayon} color={COULEURS_PLAN.coupe} svgCircleProps={{ r: 4.5, fill: "#ffffff", strokeWidth: 2.5, stroke: COULEURS_PLAN.coupe }} />
          <MafsPoint x={0} y={-trace.rayon} color={COULEURS_PLAN.coupe} svgCircleProps={{ r: 4.5, fill: "#ffffff", strokeWidth: 2.5, stroke: COULEURS_PLAN.coupe }} />
        </>
      )}
    </>
  );
}

function borner(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function aimanter(valeur: number, aimants: number[]): number {
  let meilleur = valeur;
  let ecart = RAYON_AIMANT;
  for (const a of aimants) {
    if (Math.abs(a - valeur) < ecart) {
      ecart = Math.abs(a - valeur);
      meilleur = a;
    }
  }
  return meilleur;
}

function Equerre({ instrument }: { instrument: InstrumentEquerre }) {
  const { reference, position, onChange, aimants } = instrument;
  const surD = reference === "d";
  const v: Point = surD ? { x: position, y: 0 } : { x: 0, y: position };
  // Côté long perpendiculaire à la référence (le côté qui trace), côté court le long de la référence.
  const long: Point = surD ? { x: 0, y: 1 } : { x: 1, y: 0 };
  const court: Point = surD ? { x: 1, y: 0 } : { x: 0, y: position >= 0 ? -1 : 1 };
  const pointes: [number, number][] = [
    [v.x, v.y],
    [v.x + long.x * COTE_EQUERRE_LONG, v.y + long.y * COTE_EQUERRE_LONG],
    [v.x + court.x * COTE_EQUERRE_COURT, v.y + court.y * COTE_EQUERRE_COURT],
  ];
  const [minPos, maxPos] = surD ? [-5, 5] : [-3, 5.8];
  return (
    <>
      <Polygon points={pointes} color={COULEURS_PLAN.equerre} fillOpacity={0.12} weight={1} />
      <Line.Segment point1={pointes[0]!} point2={pointes[1]!} color={COULEURS_PLAN.equerre} weight={3} />
      <LongueDroite point={[v.x, v.y]} angle={surD ? Math.PI / 2 : 0} color={COULEURS_PLAN.equerre} weight={1} style="dashed" opacity={0.55} />
      <MovablePoint
        point={[v.x, v.y]}
        color={COULEURS_PLAN.equerre}
        constrain={([x, y]) => {
          const brut = borner(surD ? x : y, minPos, maxPos);
          const cale = aimanter(brut, aimants);
          return surD ? [cale, 0] : [0, cale];
        }}
        onMove={([x, y]) => onChange(surD ? x : y)}
      />
    </>
  );
}

function Compas({ exercice, instrument }: { exercice: ExerciceConstructionParabole; instrument: InstrumentCompas }) {
  const { etat, onChange } = instrument;
  const pointe = coordonneesPoint(exercice, etat.pointe);
  const mine = etat.mine;
  const ouverture = Math.hypot(mine.x - pointe.x, mine.y - pointe.y);
  const ux = (mine.x - pointe.x) / (ouverture || 1);
  const uy = (mine.y - pointe.y) / (ouverture || 1);
  const demi = ouverture / 2;
  const hauteur = demi < LONGUEUR_JAMBE ? Math.sqrt(LONGUEUR_JAMBE * LONGUEUR_JAMBE - demi * demi) : 0.3;
  const charniere: [number, number] = [pointe.x + ux * demi - uy * hauteur, pointe.y + uy * demi + ux * hauteur];
  return (
    <>
      <Circle center={[pointe.x, pointe.y]} radius={ouverture} color={COULEURS_PLAN.compas} weight={1} fillOpacity={0} strokeStyle="dashed" strokeOpacity={0.6} />
      <Line.Segment point1={[pointe.x, pointe.y]} point2={charniere} color="#495057" weight={3} />
      <Line.Segment point1={[mine.x, mine.y]} point2={charniere} color="#495057" weight={3} />
      <MafsPoint x={charniere[0]} y={charniere[1]} color="#495057" svgCircleProps={{ r: 5 }} />
      <MovablePoint
        point={[mine.x, mine.y]}
        color={COULEURS_PLAN.compas}
        constrain={([x, y]) => {
          const dx = x - pointe.x;
          const dy = y - pointe.y;
          const d = Math.hypot(dx, dy) || 1;
          const r = borner(d, OUVERTURE_MIN, OUVERTURE_MAX);
          return [pointe.x + (dx / d) * r, pointe.y + (dy / d) * r];
        }}
        onMove={([x, y]) => onChange({ pointe: etat.pointe, mine: { x, y } })}
      />
      <MafsPoint x={pointe.x} y={pointe.y} color="#495057" svgCircleProps={{ r: 6 }} />
    </>
  );
}

/** Arc de parabole entre deux abscisses locales. */
export function ArcParabole({ exercice, x1, x2, couleur, poids = 3 }: { exercice: ExerciceConstructionParabole; x1: number; x2: number; couleur: string; poids?: number }) {
  const a = Math.min(x1, x2);
  const b = Math.max(x1, x2);
  const pas = Math.max(8, Math.ceil((b - a) * 12));
  const points: [number, number][] = Array.from({ length: pas + 1 }, (_, i) => {
    const x = a + ((b - a) * i) / pas;
    return [x, yParabole(exercice, x)];
  });
  return <Polyline points={points} color={couleur} weight={poids} fillOpacity={0} />;
}

export function PlanConstructionParabole({ exercice, acquis, tracesContexte = [], traces = [], equerre = null, compas = null, surcouche = null, masquerPoints = false, coupesK = false }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  /** Remonte la figure (annule zoom et déplacement). */
  const [vue, setVue] = useState(0);
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || 420));
  const ratio = largeur >= 600 ? RATIO_LARGE : RATIO_ETROIT;
  const hauteur = Math.round(largeur / ratio);
  const cadre = cadreTourne(exercice, largeur / hauteur);
  const f = foyer(exercice);
  const s = sommet(exercice);
  const construits = masquerPoints ? [] : pointsConstruits(exercice, acquis);
  const nomsH = exercice.methode === "mediatrice" ? NOMS_H.slice(0, exercice.abscissesH.length) : [];

  return (
    <div className="mafs-graph construction-figure" ref={wrapperRef} data-cadre={import.meta.env.DEV ? JSON.stringify(cadre) : undefined}>
      <button type="button" className="construction-recentrer" onClick={() => setVue((v) => v + 1)}>
        Recentrer
      </button>
      <Mafs key={vue} width={largeur} height={hauteur} viewBox={{ x: [cadre.xMin, cadre.xMax], y: [cadre.yMin, cadre.yMax], padding: 0 }} pan={true} zoom={{ min: 0.7, max: 4 }}>
        <Transform rotate={exercice.theta}>
          <LongueDroite point={[0, 0]} angle={0} color={COULEURS_PLAN.directrice} weight={2.4} />
          <Etiquette x={-4.3} y={0} texte="d" couleur={COULEURS_PLAN.directrice} dx={0} dy={-14} />
          {acquis.axe && (
            <>
              <LongueDroite point={[0, 0]} angle={Math.PI / 2} color={COULEURS_PLAN.axe} weight={1.4} style="dashed" />
              <AngleDroit sommetAngle={PIED_K} u={{ x: 1, y: 0 }} v={{ x: 0, y: 1 }} couleur={COULEURS_PLAN.axe} />
              <MafsPoint x={0} y={0} color={COULEURS_PLAN.directrice} svgCircleProps={{ r: 4 }} />
              <Etiquette x={0} y={0} texte="K" couleur={COULEURS_PLAN.directrice} dx={-12} dy={12} />
            </>
          )}
          {tracesContexte.map((t, i) => (
            <DessinTrace key={`c${i}`} exercice={exercice} trace={t} discret coupesK={coupesK} />
          ))}
          {traces.map((t, i) => (
            <DessinTrace key={`t${i}`} exercice={exercice} trace={t} discret={false} coupesK={coupesK} />
          ))}
          {nomsH.map((nom) => {
            const p = coordonneesPoint(exercice, nom);
            return (
              <g key={nom}>
                <MafsPoint x={p.x} y={p.y} color={COULEURS_PLAN.directrice} svgCircleProps={{ r: 4 }} />
                <Etiquette x={p.x} y={p.y} texte={nomAffiche(nom)} couleur={COULEURS_PLAN.directrice} dx={0} dy={16} />
              </g>
            );
          })}
          {construits.map((c, i) => (
            <MafsPoint key={`p${i}`} x={c.point.x} y={c.point.y} color={COULEURS_PLAN.point} svgCircleProps={{ r: 5 }} />
          ))}
          {acquis.sommet && (
            <>
              <MafsPoint x={s.x} y={s.y} color={COULEURS_PLAN.point} svgCircleProps={{ r: 5 }} />
              <Etiquette x={s.x} y={s.y} texte="S" couleur={COULEURS_PLAN.point} dx={-12} dy={-10} />
            </>
          )}
          <PointCroix x={f.x} y={f.y} color={COULEURS_PLAN.foyer} />
          <Etiquette x={f.x} y={f.y} texte="F" couleur={COULEURS_PLAN.foyer} dx={12} dy={-10} />
          {surcouche}
          {equerre && <Equerre instrument={equerre} />}
          {compas && <Compas exercice={exercice} instrument={compas} />}
        </Transform>
      </Mafs>
    </div>
  );
}
