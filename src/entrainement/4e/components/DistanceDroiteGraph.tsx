import { useState } from "react";
import { Line, Mafs, Point as MafsPoint, Text } from "mafs";
import "mafs/core.css";
import type { Point } from "../core/vecteur.types";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import type { DroiteImplicite } from "../core/droite.types";
import type { LigneAffichee } from "../ui/distanceDroiteGraph";
import { anglePenteDroite, attacheEtiquettePoint, placerEtiquettesDroites, viewBoxCadrageDistanceDroite, viewBoxDistanceDroite } from "../ui/distanceDroiteGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { pointDepuisImpliciteDroite } from "../moteur/verificationDroite";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface PointAffiche {
  point: Point;
  label: string;
  couleur: string;
}

interface Props {
  lignes: LigneAffichee[];
  points?: PointAffiche[];
  /** Tout ce que l'exercice connaît déjà, affiché ou non (droites, P, Q) — fixe le cadre pour
   * qu'il ne bouge plus quand l'aide fait apparaître b ou Q (`viewBoxCadrageDistanceDroite`). */
  cadrage?: { droites: DroiteImplicite[]; points: Point[] };
}

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs illustratif partagé par les 4 écrans de "Distance point-droite et droite-droite"
 * (`promptgen47modifications.md`, points 3/7/10) — droite(s)/point(s) DONNÉS toujours affichés ;
 * la droite `b` et le point `Q` n'apparaissent que si l'appelant les inclut dans `lignes`/`points`
 * (soit parce qu'ils sont déjà confirmés à un écran antérieur, soit via l'aide de l'écran courant,
 * voir `EtapeEquationBDistanceDroite`/`EtapeIntersectionQDistanceDroite`). Reste illustratif — pas
 * assez précis pour lire la réponse directement dessus : la grille adaptative affiche les mêmes
 * axes/graduations que le reste du projet, mais ni `Q` (souvent une fraction) ni `b` ne tombent en
 * général sur une intersection entière lisible, et calculer la distance exige de toute façon un
 * vrai calcul, jamais une simple lecture graphique — même esprit "sans formule, sans raccourci
 * graphique" que le reste de ce générateur.
 */
export function DistanceDroiteGraph({ lignes, points = [], cadrage }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = cadrage ? viewBoxCadrageDistanceDroite(cadrage.droites, cadrage.points) : viewBoxDistanceDroite(lignes, points.map((p) => p.point));
  const viewBoxEtendu = etendreViewBoxPourEtiquettes(viewBox);
  const etiquettes = placerEtiquettesDroites(
    lignes.map((l) => l.droite),
    points.map((p) => p.point),
    viewBoxEtendu,
  );
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {lignes.map((l, i) => {
          const ancrage = pointDepuisImpliciteDroite(l.droite);
          const etiquette = etiquettes[i]!;
          return (
            <g key={`ligne-${i}`}>
              <Line.PointAngle point={[ancrage.x, ancrage.y]} angle={anglePenteDroite(l.droite)} color={l.couleur} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Text x={etiquette.x} y={etiquette.y} color={l.couleur}>
                {l.label}
              </Text>
            </g>
          );
        })}
        {points.map((p, i) => (
          <g key={`point-${i}`}>
            <MafsPoint x={p.point.x} y={p.point.y} color={p.couleur} />
            <Text x={p.point.x} y={p.point.y} attach={attacheEtiquettePoint(p.point, lignes.map((l) => l.droite))} attachDistance={10} color={p.couleur}>
              {p.label}
            </Text>
          </g>
        ))}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
