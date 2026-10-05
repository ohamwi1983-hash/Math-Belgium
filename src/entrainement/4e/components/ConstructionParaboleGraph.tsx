import { Circle, Line, Mafs, MovablePoint, Point as MafsPoint, Transform } from "mafs";
import "mafs/core.css";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import { rCanonique } from "../moteur/verificationConstructionParabole";
import { DECALAGE_POIGNEE_LIGNE, pointsAffichesConstruction } from "../ui/constructionParaboleGraph";
import { calculerViewBoxGrilleTournee, demiPorteeGrilleTournee } from "../ui/grilleTourneeGraph";
import {
  EPAISSEUR_TRAIT_DISCRETE,
  EPAISSEUR_TRAIT_STANDARD,
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
} from "../ui/mafsTransformation";
import { GrilleTournee, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceConstructionParabole;
  r: number;
  ligneY: number;
  onChangeR: (r: number) => void;
  onChangeLigneY: (y: number) => void;
  /** Aide niveau 2 — superpose un cercle de référence correctement construit, absent par défaut. */
  afficherCercleReference?: boolean;
  /** Retour visuel rouge après un échec — même convention que `ConstructionDroiteGraph`. */
  rErronee?: boolean;
  ligneErronee?: boolean;
  /** Points d'intersection déjà validés aux itérations PRÉCÉDENTES de cette même instance — restent
   * affichés en permanence, jamais réinitialisés d'une itération à l'autre (contrairement au cercle/
   * à la droite de l'itération courante — voir A.1/A.2, `promptgen53corrections.md`). Vide par
   * défaut (première itération). */
  pointsConfirmes?: Point[];
}

const COULEUR_DIRECTRICE = "#495057";
const COULEUR_COMPAS = "#1971c2";
const COULEUR_EQUERRE = "#e8590c";
const COULEUR_FOYER = "#f08c00";
const COULEUR_REFERENCE = "#adb5bd";
const COULEUR_ERRONEE = "#e03131";
const COULEUR_POINT_CONFIRME = "#2f9e44";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

function snapEntierPositif(ancre: { x: number; y: number }) {
  return ([, y]: [number, number]): [number, number] => [ancre.x, ancre.y + Math.max(0, Math.round(y - ancre.y))];
}

function snapEntier(x: number) {
  return ([, y]: [number, number]): [number, number] => [x, Math.round(y)];
}

/**
 * Graphe Mafs de "Construction graphique de la parabole" — grille tournée (`GrilleTournee`,
 * `components/mafsGraphPartage.tsx`, voir son en-tête et celui de `ui/grilleTourneeGraph.ts` pour la
 * justification technique complète). TOUTE la scène (grille comprise) est placée dans un seul
 * `<Transform rotate={exercice.theta}>` — le repère LOCAL manipulé ici (poignées, cercle, droites)
 * reste entièrement "vertical" (directrice=y=0, foyer au-dessus), l'obliquité n'existant qu'au
 * rendu, Mafs composant la rotation pour nous (aucune trigonométrie ici).
 *
 * 2 poignées `MovablePoint` indépendantes : le rayon (glisse verticalement depuis F, jamais en
 * dessous de F) et la ligne (glisse verticalement à une abscisse décalée, LIBRE des deux côtés de
 * la directrice — le piège "mauvais côté" doit rester constructible, jamais mécaniquement empêché).
 *
 * `pointsConfirmes` (`promptgen53corrections.md`, A.2) — les points d'intersection déjà validés aux
 * itérations PRÉCÉDENTES, affichés en points fixes verts qui persistent d'un rendu à l'autre,
 * contrairement au cercle/à la droite de l'itération EN COURS (`r`/`ligneY`, remis à zéro à chaque
 * nouvelle itération côté appelant — voir A.1, `AppConstructionParabole.tsx`).
 */
export function ConstructionParaboleGraph({
  exercice,
  r,
  ligneY,
  onChangeR,
  onChangeLigneY,
  afficherCercleReference = false,
  rErronee = false,
  ligneErronee = false,
  pointsConfirmes = [],
}: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const { foyer, theta } = exercice;
  const refX = foyer.x + DECALAGE_POIGNEE_LIGNE;
  const pointsAffiches = pointsAffichesConstruction(exercice, r, ligneY, pointsConfirmes);
  const viewBox = calculerViewBoxGrilleTournee(pointsAffiches, theta);
  const demiPortee = demiPorteeGrilleTournee(pointsAffiches);
  const couleurCompas = rErronee ? COULEUR_ERRONEE : COULEUR_COMPAS;
  const couleurEquerre = ligneErronee ? COULEUR_ERRONEE : COULEUR_EQUERRE;

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <Transform rotate={theta}>
          <GrilleTournee demiPortee={demiPortee} />
          <Line.PointAngle point={[foyer.x, 0]} angle={0} color={COULEUR_DIRECTRICE} weight={EPAISSEUR_TRAIT_STANDARD} />
          {afficherCercleReference && <Circle center={[foyer.x, foyer.y]} radius={rCanonique(exercice)} color={COULEUR_REFERENCE} weight={EPAISSEUR_TRAIT_DISCRETE} />}
          <Line.Segment point1={[foyer.x, foyer.y]} point2={[foyer.x, foyer.y + r]} color={couleurCompas} weight={EPAISSEUR_TRAIT_DISCRETE} />
          <Circle center={[foyer.x, foyer.y]} radius={Math.max(0, r)} color={couleurCompas} weight={EPAISSEUR_TRAIT_STANDARD} />
          <Line.PointAngle point={[refX, ligneY]} angle={0} color={couleurEquerre} weight={EPAISSEUR_TRAIT_STANDARD} />
          <PointCroix x={foyer.x} y={foyer.y} color={COULEUR_FOYER} />
          {pointsConfirmes.map((p, index) => (
            <MafsPoint key={index} x={p.x} y={p.y} color={COULEUR_POINT_CONFIRME} />
          ))}
          <MovablePoint
            point={[foyer.x, foyer.y + r]}
            onMove={([, y]) => onChangeR(Math.max(0, Math.round(y - foyer.y)))}
            constrain={snapEntierPositif(foyer)}
            color={couleurCompas}
          />
          <MovablePoint point={[refX, ligneY]} onMove={([, y]) => onChangeLigneY(Math.round(y))} constrain={snapEntier(refX)} color={couleurEquerre} />
        </Transform>
      </Mafs>
    </div>
  );
}
