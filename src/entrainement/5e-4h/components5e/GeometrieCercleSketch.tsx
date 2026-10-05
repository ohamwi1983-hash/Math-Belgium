import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import {
  CENTRE,
  HAUTEUR_CADRE_LENTILLE,
  LARGEUR_CADRE_LENTILLE,
  RAYON_MAX_PIXEL,
  TAILLE_CADRE,
  calculerCroquisLentille,
  calculerCroquisSecteurBalaye,
  calculerCroquisSegmentCirculaire,
} from "../ui5e/geometrieCercleSketch";

interface Props {
  exercice: ExerciceGeometrieCercle;
}

const COULEUR_TRAIT = "#495057";
const COULEUR_ZONE = "#f08c00";

function SecteurBalayeSvg({ exercice }: { exercice: Extract<ExerciceGeometrieCercle, { scenario: "secteurBalaye" }> }) {
  const c = calculerCroquisSecteurBalaye(exercice);
  return (
    <svg viewBox={`0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}`} width="100%" height={TAILLE_CADRE} role="img" aria-label={`Secteur balayé d'angle θ=${exercice.thetaDeg}° entre les rayons r1=${exercice.r1} et r2=${exercice.r2}`}>
      <line x1={c.pivot.x} y1={c.pivot.y} x2={c.rayonExterieurDepart.x} y2={c.rayonExterieurDepart.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <line x1={c.pivot.x} y1={c.pivot.y} x2={c.rayonExterieurArrivee.x} y2={c.rayonExterieurArrivee.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <path d={c.cheminZoneBalayee} fill={COULEUR_ZONE} fillOpacity={0.35} stroke={COULEUR_ZONE} strokeWidth={2} strokeLinejoin="round" />
      <path d={c.cheminAngle} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.5} />
      <circle cx={c.pivot.x} cy={c.pivot.y} r={3} fill={COULEUR_TRAIT} />
      <text x={c.labelTheta.x} y={c.labelTheta.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label" fontStyle="italic">
        θ
      </text>
      <text x={c.labelR1.x} y={c.labelR1.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label">
        r<tspan baselineShift="sub" fontSize="10">1</tspan>
      </text>
      <text x={c.labelR2.x} y={c.labelR2.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label">
        r<tspan baselineShift="sub" fontSize="10">2</tspan>
      </text>
    </svg>
  );
}

function SegmentCirculaireSvg({ exercice }: { exercice: Extract<ExerciceGeometrieCercle, { scenario: "segmentCirculaire" }> }) {
  const c = calculerCroquisSegmentCirculaire(exercice);
  return (
    <svg viewBox={`0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}`} width="100%" height={TAILLE_CADRE} role="img" aria-label={`Segment circulaire de rayon r=${exercice.r} et corde c=${exercice.c}`}>
      <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON_MAX_PIXEL} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.5} />
      <line x1={c.centre.x} y1={c.centre.y} x2={c.pointDepart.x} y2={c.pointDepart.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <line x1={c.centre.x} y1={c.centre.y} x2={c.pointArrivee.x} y2={c.pointArrivee.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <path d={c.cheminSegment} fill={COULEUR_ZONE} fillOpacity={0.35} stroke={COULEUR_ZONE} strokeWidth={2} strokeLinejoin="round" />
      <path d={c.cheminAngle} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.5} />
      <circle cx={c.centre.x} cy={c.centre.y} r={3} fill={COULEUR_TRAIT} />
      <text x={c.labelTheta.x} y={c.labelTheta.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label" fontStyle="italic">
        θ
      </text>
      <text x={c.labelR.x} y={c.labelR.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label" fontStyle="italic">
        r
      </text>
      <text x={c.labelC.x} y={c.labelC.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label" fontStyle="italic">
        c
      </text>
    </svg>
  );
}

function LentilleSvg({ exercice }: { exercice: Extract<ExerciceGeometrieCercle, { scenario: "lentille" }> }) {
  const c = calculerCroquisLentille(exercice);
  return (
    <svg viewBox={`0 0 ${LARGEUR_CADRE_LENTILLE} ${HAUTEUR_CADRE_LENTILLE}`} width="100%" height={HAUTEUR_CADRE_LENTILLE} role="img" aria-label={`Lentille formée de 2 cercles sécants, r1=${exercice.segment1.r}, r2=${exercice.segment2.r}, corde commune c=${exercice.c}`}>
      <circle cx={c.centre1.x} cy={c.centre1.y} r={c.rayon1Pixel} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.2} strokeDasharray="4 4" />
      <circle cx={c.centre2.x} cy={c.centre2.y} r={c.rayon2Pixel} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.2} strokeDasharray="4 4" />
      <line x1={c.pointA.x} y1={c.pointA.y} x2={c.pointB.x} y2={c.pointB.y} stroke={COULEUR_TRAIT} strokeWidth={1.6} />
      <line x1={c.centre1.x} y1={c.centre1.y} x2={c.pointA.x} y2={c.pointA.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <line x1={c.centre2.x} y1={c.centre2.y} x2={c.pointB.x} y2={c.pointB.y} stroke={COULEUR_TRAIT} strokeWidth={1.4} strokeDasharray="4 4" />
      <path d={c.cheminLentille} fill={COULEUR_ZONE} fillOpacity={0.35} stroke={COULEUR_ZONE} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={c.centre1.x} cy={c.centre1.y} r={3} fill={COULEUR_TRAIT} />
      <circle cx={c.centre2.x} cy={c.centre2.y} r={3} fill={COULEUR_TRAIT} />
      <text x={c.labelR1.x} y={c.labelR1.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label">
        r<tspan baselineShift="sub" fontSize="10">1</tspan>
      </text>
      <text x={c.labelR2.x} y={c.labelR2.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label">
        r<tspan baselineShift="sub" fontSize="10">2</tspan>
      </text>
      <text x={c.labelC.x} y={c.labelC.y} textAnchor="middle" dominantBaseline="middle" className="geometrie-cercle-label" fontStyle="italic">
        c
      </text>
    </svg>
  );
}

/**
 * Diagramme SVG PUR (jamais Mafs — voir CLAUDE.md/`docs/conventions-transversales.md`, "Choix du
 * rendu graphique") : θ/r₁/r₂/c sont déjà donnés en toutes lettres dans le bloc de données au-dessus
 * (`blocDonneesLatex`), aucune coordonnée n'est jamais lue par l'élève sur ce croquis — seule la
 * géométrie relative (proportion r₁:r₂, angle θ réel) compte. Persiste sur tous les écrans d'un
 * même exercice (bloc de données redondant classique, même convention que `PolygoneCercleSketch`) :
 * un seul appel par exercice, jamais paramétré par la phase courante.
 */
export function GeometrieCercleSketch({ exercice }: Props) {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return (
        <div className="geometrie-cercle-conteneur">
          <SecteurBalayeSvg exercice={exercice} />
        </div>
      );
    case "segmentCirculaire":
      return (
        <div className="geometrie-cercle-conteneur">
          <SegmentCirculaireSvg exercice={exercice} />
        </div>
      );
    case "lentille":
      return (
        <div className="geometrie-cercle-conteneur geometrie-cercle-conteneur-large">
          <LentilleSvg exercice={exercice} />
        </div>
      );
  }
}
