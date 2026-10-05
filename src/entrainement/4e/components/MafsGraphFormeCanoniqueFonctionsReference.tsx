import { useState } from "react";
import { Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import { evaluerFonctionReference, pivotX } from "../moteur/verificationFonctionsReference";
import {
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerSegmentsVisiblesFR,
  calculerViewBoxFonctionReferenceMultiple,
} from "../ui/mafsFormeCanoniqueFonctionsReference";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_STANDARD, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import type { ParametresCourbeFR } from "../ui/mafsFormeCanoniqueFonctionsReference";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { FenetreVisibleXY, GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";
import { Katex } from "./Katex";

/** Une courbe déjà confirmée à une étape précédente — même principe que
 * `CourbeConfirmee` ("Forme canonique et transformations", chapitre 1) : sa propre couleur, sa
 * propre légende (l'expression mathématique réelle), jamais un texte générique. */
export interface CourbeConfirmeeFR {
  parametres: ParametresCourbeFR;
  couleur: string;
  labelLatex: string;
}

interface Props {
  /** Courbes déjà confirmées aux étapes précédentes (0 à 3 selon la phase en cours) — toujours
   * dérivées des vraies valeurs confirmées de l'exercice, jamais d'une saisie résiduelle. */
  confirmees: CourbeConfirmeeFR[];
  /** Courbe en cours de construction — pilotée en direct par le(s) curseur(s) de l'étape courante. */
  live: ParametresCourbeFR;
}

/** Violet, distincte des 3 couleurs de trace confirmée (bleu/orange/vert, section 2 de la spec) —
 * "couleur principale du thème du site" pour la courbe actuellement pilotée par les curseurs. */
const COULEUR_LIVE = "#7048e8";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs pour "Forme canonique et transformations — fonctions de référence" — combine le
 * graphe adaptatif au zoom de "Transformations graphiques — fonctions de référence" (domaine par
 * segments, famille par famille — voir `calculerSegmentsTraceFR`) avec la trace cumulative
 * multi-couleurs de "Forme canonique et transformations" (chapitre 1). Le point caractéristique
 * (`pivotX`, cercle plein) de chaque courbe reste marqué comme repère visuel, mais — contrairement
 * au 10e exercice — sans second point en croix ni étiquette de coordonnées ni asymptotes dédiées à
 * `inverse` : la spec de ce générateur (section 2) ne demande que le tracé + la légende colorée, pas
 * ces raffinements supplémentaires (propres à `spec-fonctions-reference.md`, une spec différente).
 */
export function MafsGraphFormeCanoniqueFonctionsReference({ confirmees, live }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = etendreViewBoxPourEtiquettes(calculerViewBoxFonctionReferenceMultiple([...confirmees.map((c) => c.parametres), live]));
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-forme-canonique-fr">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {confirmees.map((courbe, index) => {
          const pivot = pivotX(courbe.parametres);
          const yPivot = evaluerFonctionReference(courbe.parametres, pivot);
          return (
            <g key={index}>
              <FenetreVisibleXY largeur={largeur} hauteur={hauteur}>
                {(visible, visibleY) =>
                  calculerSegmentsVisiblesFR(courbe.parametres, visible, visibleY).map((segment, segIndex) => (
                    <Plot.OfX
                      key={segIndex}
                      y={(x) => evaluerFonctionReference(courbe.parametres, x)}
                      domain={segment.domaine}
                      color={courbe.couleur}
                      weight={EPAISSEUR_TRAIT_STANDARD}
                    />
                  ))
                }
              </FenetreVisibleXY>
              {Number.isFinite(yPivot) && <Point x={pivot} y={yPivot} color={courbe.couleur} />}
            </g>
          );
        })}
        <FenetreVisibleXY largeur={largeur} hauteur={hauteur}>
          {(visible, visibleY) =>
            calculerSegmentsVisiblesFR(live, visible, visibleY).map((segment, index) => (
              <Plot.OfX key={index} y={(x) => evaluerFonctionReference(live, x)} domain={segment.domaine} color={COULEUR_LIVE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY>
        {(() => {
          const pivotLive = pivotX(live);
          const yPivotLive = evaluerFonctionReference(live, pivotLive);
          return Number.isFinite(yPivotLive) && <Point x={pivotLive} y={yPivotLive} color={COULEUR_LIVE} />;
        })()}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch mafs-graph-swatch-actuelle-fr" /> étape actuelle
        </span>
        {confirmees.map((courbe, index) => (
          <span className="mafs-graph-legende-item" key={index}>
            <span className="mafs-graph-swatch" style={{ background: courbe.couleur }} />
            <Katex expression={courbe.labelLatex} />
          </span>
        ))}
      </div>
    </div>
  );
}
