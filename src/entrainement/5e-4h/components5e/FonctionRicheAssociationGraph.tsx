import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { FonctionRicheAssociation } from "../core5e/association.types";
import { X_MAX_AVANCEE, X_MIN_AVANCEE, evaluerDeriveeFonctionRiche, evaluerFonctionRiche, exclusionAffichageDerivee, exclusionAffichageF } from "../generateurs5e/association/index";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { construireSegmentsExclusionUnique } from "../ui5e/segmentsAssociationAvancee";
import { FenetreVisibleXY5e, GrilleAdaptative5e } from "./mafsGraphPartage5e";

const LARGEUR = 220;
const HAUTEUR = LARGEUR / RATIO_GRAPHE;
const COULEUR_COURBE = "#1971c2";
const NOMBRE_ECHANTILLONS = 60;

/** Cadrage vertical par échantillonnage, comme `PolynomeAssociationGraph` — mais en sautant la
 * marge autour d'une éventuelle exclusion (asymptote/cuspide/tangente verticale : valeurs énormes
 * ou non finies tout près du point, qui fausseraient sinon complètement le cadrage). */
function calculerYMinMax(evaluer: (x: number) => number, exclusion: number | null): { yMin: number; yMax: number } {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const [a, b] of construireSegmentsExclusionUnique(X_MIN_AVANCEE, X_MAX_AVANCEE, exclusion)) {
    for (let i = 0; i <= NOMBRE_ECHANTILLONS; i++) {
      const x = a + ((b - a) * i) / NOMBRE_ECHANTILLONS;
      const y = evaluer(x);
      if (!Number.isFinite(y)) continue;
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
  }
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) return { yMin: -5, yMax: 5 };
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { yMin: yMin - marge, yMax: yMax + marge };
}

/**
 * Mini-graphique Mafs pour une `FonctionRicheAssociation` (5gen25, famille A avancée,
 * `prompt5gen25varianteavanceerichessegraphique.md`) — soit f elle-même (`derivee` absent/false),
 * soit sa dérivée f' (`derivee=true`, réutilisé pour les candidats). Même structure que
 * `PolynomeAssociationGraph.tsx` (taille, légende, grille adaptative), mais le domaine tracé peut
 * se scinder en 2 segments autour d'une exclusion (`construireSegmentsExclusionUnique`, réévalué à
 * chaque changement de zoom/pan via `FenetreVisibleXY5e`) — jamais un seul `Plot.OfX` continu
 * quand une exclusion existe, contrairement à `PolynomeAssociationGraph` (toujours 1 seul
 * segment, aucune fonction de cette famille n'ayant d'exclusion).
 */
export function FonctionRicheAssociationGraph({ fonction, derivee = false }: { fonction: FonctionRicheAssociation; derivee?: boolean }) {
  const evaluer = (x: number) => (derivee ? evaluerDeriveeFonctionRiche(fonction, x) : evaluerFonctionRiche(fonction, x));
  const exclusion = derivee ? exclusionAffichageDerivee(fonction) : exclusionAffichageF(fonction);
  const { yMin, yMax } = calculerYMinMax(evaluer, exclusion);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className="courbe-graph-conteneur mafs-graph">
      <Mafs
        width={LARGEUR}
        height={HAUTEUR}
        viewBox={{ x: [X_MIN_AVANCEE, X_MAX_AVANCEE], y: [yMin, yMax], padding: 0 }}
        preserveAspectRatio={false}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative5e largeur={LARGEUR} hauteur={HAUTEUR} onPasChange={(x, y) => setPas({ x, y })} />
        <FenetreVisibleXY5e largeur={LARGEUR} hauteur={HAUTEUR}>
          {(visibleX) =>
            construireSegmentsExclusionUnique(visibleX[0], visibleX[1], exclusion).map(([a, b]) => (
              <Plot.OfX key={a} y={evaluer} domain={[a, b]} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            ))
          }
        </FenetreVisibleXY5e>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
