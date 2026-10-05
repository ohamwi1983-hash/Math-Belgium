import { Line, Mafs, Plot, Point, Polygon } from "mafs";
import "mafs/core.css";
import type { ExerciceCaracteristiquesFonction } from "../core/caracteristiquesFonction.types";
import type { Borne, Morceau } from "../core/inequation.types";
import { valeurHyperboleEnB5, valeurNaturelleEnB5 } from "../moteur/verificationCaracteristiquesFonction";
import {
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerSegmentsCaracteristiquesVisibles,
  calculerViewBoxCaracteristiques,
  evaluerPourGraphe,
  pointsPleinsGaps,
} from "../ui/mafsCaracteristiquesFonction";
import {
  EPAISSEUR_TRAIT_ACCENTUE,
  EPAISSEUR_TRAIT_ACCENTUE_FORT,
  EPAISSEUR_TRAIT_DISCRETE,
  EPAISSEUR_TRAIT_STANDARD,
  etendreViewBoxPourEtiquettes,
} from "../ui/mafsTransformation";
import { FenetreVisibleXY, GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  exercice: ExerciceCaracteristiquesFonction;
  /** Surlignage en temps réel (refonte 2, correction 3) — un morceau par intervalle déjà complet
   * de la construction en cours (domaine/croissance/décroissance/constance) ; absent/vide sur les
   * écrans qui n'en ont pas besoin. */
  surlignage?: Morceau[];
}

const COULEUR_COURBE = "#d6336c";
const COULEUR_SURLIGNAGE = "#37b24d";
const LARGEUR_PAR_DEFAUT = 480;
const LARGEUR_MIN = 280;
const LARGEUR_MAX = 560;

/**
 * Graphe Mafs (refonte point 4) — remplace l'ancien rendu SVG statique. Le graphique reste
 * affiché en permanence sur les 8 écrans, sans variation (section 3 de la spec) : une seule
 * courbe, jamais de courbe "live"/"cible" comme les générateurs à curseurs.
 *
 * Marqueurs : cercle vide au point creux (c, exclu du domaine depuis la refonte) et, à la MÊME
 * abscisse `b5` (refonte 3, correction 2 — une discontinuité de saut se produit à une seule
 * abscisse partagée, jamais deux x différents comme l'ancien couple b5/b6), un premier cercle vide
 * (valeur naturelle exclue de la zone 5, `y5Naturel`) TOUJOURS présent, relié par un SEGMENT
 * réellement VERTICAL EN POINTILLÉ (refonte 2, correction 4 — jamais un trait plein, qui
 * suggérerait à tort que ce trait fait partie de la courbe d'une fonction continue) jusqu'à la
 * valeur "naturelle" de la branche hyperbolique (`valeurHyperboleEnB5`, indépendante du cas tiré) —
 * ce second point est rendu PLEIN pour le cas "pointPlein" (il appartient réellement à la courbe)
 * ou VIDE pour "trou"/"pointRedefini" (3 cas possibles pour la discontinuité — voir
 * `CasDiscontinuite`, core/types) ; pour "pointRedefini" seulement, un troisième point PLEIN,
 * totalement ISOLÉ (aucun segment ne le relie aux deux autres), marque la valeur réellement prise
 * par f(b5) ailleurs sur l'axe vertical. Asymptotes en pointillé (x=AV, y=L), même style que la
 * famille `inverse` d'un générateur précédent.
 *
 * Bornes de gap (`promptcorrectionsgen17gen12gen21.md`, point 4) : chaque gap `]g1,g2[` de la
 * zone 4 exclut son intérieur strict du domaine mais PAS ses bornes — un point PLEIN à chaque borne
 * (`pointsPleinsGaps`, `ui/mafsCaracteristiquesFonction.ts`) le rend visuellement explicite, jamais
 * un simple arrêt de tracé ambigu. Générique sur 0/1/2 gaps.
 *
 * Refonte 2, correction 1 : la légende du pas de grille est retirée — les valeurs générées sont
 * désormais garanties entières partout (voir le générateur), l'indicateur n'apportait plus rien.
 */
function borneVersX(borne: Borne, xGauche: number, xDroite: number): number {
  if (borne === "-inf") return xGauche;
  if (borne === "+inf") return xDroite;
  return borne;
}

export function MafsGraphCaracteristiquesFonction({ exercice, surlignage }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = etendreViewBoxPourEtiquettes(calculerViewBoxCaracteristiques(exercice));

  const yCreux = valeurNaturelleEnB5(exercice);
  // Valeur "naturelle" de la branche hyperbolique en b5 — indépendante du cas tiré, contrairement à
  // evaluerPourGraphe(exercice, exercice.b5) qui vaudrait NaN ("trou") ou la valeur du point isolé
  // ("pointRedefini") : sert à positionner le second marqueur, plein ou vide selon le cas.
  const yZone6Naturel = valeurHyperboleEnB5(exercice);
  const { discontinuite } = exercice;
  const svgVide = { style: { fill: "none", stroke: COULEUR_COURBE, strokeWidth: 2 } };

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-caracteristiques">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} />
        {surlignage?.map((morceau, index) => {
          const gauche = borneVersX(morceau.borneGauche, viewBox.x[0], viewBox.x[1]);
          const droite = borneVersX(morceau.borneDroite, viewBox.x[0], viewBox.x[1]);
          if (gauche === droite) {
            return (
              <Line.Segment
                key={index}
                point1={[gauche, viewBox.y[0]]}
                point2={[gauche, viewBox.y[1]]}
                color={COULEUR_SURLIGNAGE}
                weight={EPAISSEUR_TRAIT_ACCENTUE_FORT}
                opacity={0.4}
              />
            );
          }
          return (
            <Polygon
              key={index}
              points={[
                [gauche, viewBox.y[0]],
                [droite, viewBox.y[0]],
                [droite, viewBox.y[1]],
                [gauche, viewBox.y[1]],
              ]}
              color={COULEUR_SURLIGNAGE}
              fillOpacity={0.18}
              strokeOpacity={0}
            />
          );
        })}
        <FenetreVisibleXY largeur={largeur} hauteur={hauteur}>
          {(visible, visibleY) =>
            calculerSegmentsCaracteristiquesVisibles(exercice, visible, visibleY).map((segment, index) => (
              <Plot.OfX key={index} y={(x) => evaluerPourGraphe(exercice, x)} domain={segment.domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY>
        <Line.Segment
          point1={[exercice.b5, yCreux]}
          point2={[exercice.b5, yZone6Naturel]}
          color={COULEUR_COURBE}
          style="dashed"
          weight={EPAISSEUR_TRAIT_STANDARD}
          opacity={0.7}
        />
        <Point x={exercice.c} y={exercice.valeurNaturelleC} color={COULEUR_COURBE} svgCircleProps={svgVide} />
        {pointsPleinsGaps(exercice).map((p, index) => (
          <Point key={index} x={p.x} y={p.y} color={COULEUR_COURBE} />
        ))}
        <Point x={exercice.b5} y={yCreux} color={COULEUR_COURBE} svgCircleProps={svgVide} />
        {discontinuite.type === "pointPlein" ? (
          <Point x={exercice.b5} y={yZone6Naturel} color={COULEUR_COURBE} />
        ) : (
          <Point x={exercice.b5} y={yZone6Naturel} color={COULEUR_COURBE} svgCircleProps={svgVide} />
        )}
        {discontinuite.type === "pointRedefini" && <Point x={exercice.b5} y={discontinuite.valeur} color={COULEUR_COURBE} />}
        <Line.PointAngle point={[exercice.AV, 0]} angle={Math.PI / 2} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
        <Line.PointAngle point={[0, exercice.L]} angle={0} color={COULEUR_COURBE} style="dashed" weight={EPAISSEUR_TRAIT_DISCRETE} opacity={0.5} />
      </Mafs>
    </div>
  );
}
