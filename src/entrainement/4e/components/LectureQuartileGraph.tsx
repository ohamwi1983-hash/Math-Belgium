import { useState } from "react";
import { Line, Mafs, MovablePoint, Point as MafsPoint } from "mafs";
import "mafs/core.css";
import { EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, formatEtiquetteGrille } from "../ui/mafsTransformation";
import { calculerViewBoxPolygoneEffectifs, intersectionCourbeEnY } from "../ui/lectureQuartileGraph";
import type { PointPolygoneXY } from "../ui/lectureQuartileGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative, PointCroix } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  /** Le polygone des effectifs cumulés, déjà CONFIRMÉ (le point fixe + un point par classe) —
   * toujours la vraie donnée de l'exercice, jamais une saisie résiduelle de l'écran "Polygone". */
  points: PointPolygoneXY[];
  /** Les 2 sommets du polygone qui encadrent le seuil de l'écran, mis en évidence en ORANGE
   * (`promptgen33gen35aidesinterpolation.md`, aide 3) — absent/`undefined` par défaut (aucun
   * surlignage, comportement historique inchangé), fourni uniquement une fois l'aide 3 activée
   * (`pointsEncadresLecture`, `ui/formatMediane.ts` — même source de vérité que le texte de
   * l'aide, jamais recalculée séparément ici). Même orange que la barre déjà tracée sur ce graphe
   * (`COULEUR_BARRE`) — cohérence de couleur au sein du même générateur. */
  pointsEncadres?: { inf: PointPolygoneXY; sup: PointPolygoneXY };
}

const COULEUR_POLYGONE = "#212529";
const COULEUR_BARRE = "#f08c00";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

const PAS_SNAP_BARRE = 0.1;

function snapBarre(xFixe: number): (point: [number, number]) => [number, number] {
  return ([, y]) => [xFixe, Math.round(y / PAS_SNAP_BARRE) * PAS_SNAP_BARRE];
}

/**
 * Graphe partagé par les 3 écrans de lecture graphique (Q1/médiane/Q3, `promptgen33modifications2.md`)
 * — le polygone des effectifs cumulés déjà construit et confirmé (noir, statique, jamais
 * déplaçable — contrairement à `PolygoneEffectifsGraph`) plus une barre horizontale déplaçable
 * (orange, mobile uniquement sur l'axe Y via `constrain`) que l'élève positionne à la hauteur du
 * seuil qu'il a calculé. Dès que la barre existe (donc à chaque rendu, en TEMPS RÉEL pendant le
 * glissement — `MovablePoint.onMove` est appelé en continu par Mafs, jamais seulement au
 * relâchement) : pointillé horizontal depuis la poignée (ancrée à `points[0].x`, l'extrémité
 * gauche du polygone) jusqu'à son intersection avec la courbe (`intersectionCourbeEnY`, seule
 * source de vérité, jamais recalculée différemment), puis pointillé vertical de ce point
 * d'intersection jusqu'à l'axe X, marqué d'une croix (`PointCroix`, module déjà partagé). Zoom
 * disponible (`zoom={{min: ZOOM_MIN, max: ZOOM_MAX}}`, même bornes que les autres graphes Mafs du
 * projet). La position de la barre n'est jamais soumise à la vérification — c'est un outil visuel
 * uniquement, la réponse est saisie dans un champ libre séparé sous le graphe.
 *
 * **Légende "seuil = [valeur]" en temps réel** (`promptgen32gen33corrections.md`, point 2) — même
 * mécanique que la légende du point sélectionné de `PolygoneEffectifsGraph` : `barreY` (déjà l'état
 * qui pilote le tracé live des pointillés/de la croix ci-dessus) est mis à jour à CHAQUE tick du
 * glissement par `onMove` — jamais seulement au relâchement —, donc la légende affiche toujours
 * l'ordonnée courante de la barre, rafraîchie en direct pendant le geste. Contrairement au point
 * sélectionné du Polygone (qui n'existe qu'une fois touché), la barre a toujours une position dès
 * le premier rendu (`barreY=0`) : jamais de placeholder "—" nécessaire ici. `formatEtiquetteGrille`
 * (déjà partagée par les graphes Mafs du projet) nettoie le bruit de virgule flottante introduit par
 * `snapBarre` avant affichage.
 *
 * **Échelles horizontale/verticale DÉCOUPLÉES** (correction demandée directement en conversation,
 * sans fichier prompt dédié — même technique et même méthode "verify before fixing" que
 * `promptgen38fixechellegraphe.md`) : X (borne de classe, physique) et Y (effectif cumulé, un
 * compte) sont deux grandeurs sans rapport — `calculerViewBoxPolygoneEffectifs`
 * (`ui/lectureQuartileGraph.ts`, jamais `calculerViewBoxVecteurs`/`vecteurGraph.ts`, réservée aux
 * graphes où X et Y partagent réellement la même unité) ne force plus le ratio x/y, et
 * `preserveAspectRatio={false}` laisse Mafs calculer deux échelles pixel indépendantes.
 *
 * **Aide 3 — surlignage orange des 2 points d'encadrement ET du segment qui les relie**
 * (`promptgen33gen35aidesinterpolation.md`) — prop additive `pointsEncadres` (absente par défaut,
 * aucun surlignage) : une fois fournie (aide 3 activée), les 2 sommets du polygone qui encadrent le
 * seuil de l'écran sont redessinés en `COULEUR_BARRE` (même orange que la barre déjà présente sur ce
 * graphe), reliés par un segment de la même couleur (par-dessus le segment noir du polygone sous-
 * jacent, ces 2 points étant TOUJOURS deux sommets consécutifs — `pointsEncadrementSeuil` ne retourne
 * jamais une paire non adjacente), par-dessus les points noirs du polygone.
 */
export function LectureQuartileGraph({ points, pointsEncadres }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  const xGauche = points[0].x;
  const xDroite = points[points.length - 1].x;
  const [barreY, setBarreY] = useState(0);

  const viewBox = calculerViewBoxPolygoneEffectifs(points);

  const xIntersection = intersectionCourbeEnY(points, barreY);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {points.slice(0, -1).map((sommet, i) => (
          <Line.Segment key={`segment-${i}`} point1={[sommet.x, sommet.y]} point2={[points[i + 1].x, points[i + 1].y]} color={COULEUR_POLYGONE} weight={EPAISSEUR_TRAIT_STANDARD} />
        ))}
        {points.map((p, i) => (
          <MafsPoint key={`sommet-${i}`} x={p.x} y={p.y} color={COULEUR_POLYGONE} />
        ))}
        {pointsEncadres && (
          <>
            <Line.Segment
              point1={[pointsEncadres.inf.x, pointsEncadres.inf.y]}
              point2={[pointsEncadres.sup.x, pointsEncadres.sup.y]}
              color={COULEUR_BARRE}
              weight={EPAISSEUR_TRAIT_STANDARD}
            />
            <MafsPoint x={pointsEncadres.inf.x} y={pointsEncadres.inf.y} color={COULEUR_BARRE} />
            <MafsPoint x={pointsEncadres.sup.x} y={pointsEncadres.sup.y} color={COULEUR_BARRE} />
          </>
        )}

        <Line.Segment point1={[xGauche, barreY]} point2={[xIntersection ?? xDroite, barreY]} color={COULEUR_BARRE} weight={EPAISSEUR_TRAIT_STANDARD} style="dashed" />

        {xIntersection !== null && (
          <>
            <Line.Segment point1={[xIntersection, barreY]} point2={[xIntersection, 0]} color={COULEUR_BARRE} weight={EPAISSEUR_TRAIT_STANDARD} style="dashed" />
            <PointCroix x={xIntersection} y={0} color={COULEUR_BARRE} />
          </>
        )}

        {/* Rendue en dernier — son hitbox doit toujours rester au-dessus des pointillés/de la
            croix, y compris quand ceux-ci coïncident pixel pour pixel avec elle (cas initial
            barreY=0, qui égale toujours points[0].y — voir la doc de intersectionCourbeEnY).
            Sans cet ordre, la croix/le pointillé vertical (rendus après, donc peints par-dessus)
            interceptaient le clic destiné à la poignée, la rendant impossible à glisser au
            premier geste. */}
        <MovablePoint point={[xGauche, barreY]} constrain={snapBarre(xGauche)} onMove={([, y]) => setBarreY(y)} color={COULEUR_BARRE} />
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">seuil = {formatEtiquetteGrille(barreY)}</span>
      </div>
    </div>
  );
}
