import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceEtudeLogNonE } from "../core6e/etudeFonctionLogarithme.types";
import { CIBLE_NOMBRE_LIGNES_QCM, evaluerCandidat, type ViewBoxEtudeFonctionLog } from "../ui6e/formatEtudeFonctionLogarithme";
import { EPAISSEUR_TRAIT_ACCENTUE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";

const COULEUR_COURBE = "#1971c2";

interface Props {
  exercice: ExerciceEtudeLogNonE;
  index: number;
  viewBox: ViewBoxEtudeFonctionLog;
  /** Mesurées par l'appelant (`EtapeSelectionGraphiqueQCM`, `useLargeurConteneur`) — les 4
   * graphiques d'un même écran partagent toujours la même taille. */
  largeur: number;
  hauteur: number;
}

/** Un des 4 graphiques de l'écran QCM final (familles A-D, empilés pleine largeur, lettrés A→D par
 * l'appelant — ce composant ne connaît PAS sa lettre, seulement son `index`) — même `viewBox`
 * INITIAL pour les 4 candidats. Réimplémenté ici plutôt qu'importé — module propre à ce générateur,
 * même principe que `GrapheOptionEtudeFonction.tsx` (6gen11). Composant purement illustratif —
 * jamais cliquable (le choix se fait via les 4 boutons de choix texte séparés sous la liste).
 *
 * **Zoom/pan réactivés** — voir la documentation complète sur `GrapheOptionCyclo.tsx` (même retour
 * utilisateur, même correctif, même justification pour la contrainte d'équité entre candidats).
 * `pan={true}`/`zoom={{min: ZOOM_MIN, max: ZOOM_MAX}}` (constantes partagées `ui/
 * mafsTransformation.ts`) remplacent l'ancien `pan={false}`/`zoom={false}` ; `DomaineTraceX` fait
 * suivre le tracé au zoom/pan courant (au lieu de rester figé au `viewBox` initial) ;
 * `formatIndicateurPasGrille` affiche l'échelle courante sous le graphique.
 *
 * `preserveAspectRatio={false}` EXPLICITE DÈS LA CONCEPTION — piège déjà documenté à plusieurs
 * reprises sur ce chantier (6gen5, 6gen8, 6gen11).
 *
 * **Densité de graduation augmentée / axe Y garanti visible** — voir la documentation complète sur
 * `GrapheOptionCyclo.tsx` (même retour utilisateur, même correctif) : `cibleNombreLignes` remonté
 * de `3` à `6`, `assurerAxesVisibles` (`ui/mafsTransformation.ts`) appliqué en bout de chaîne par
 * `calculerViewBox` (`ui6e/formatEtudeFonctionLogarithme.ts`) — familles A/B, domaine `x>0`,
 * laissaient sinon l'axe Y (x=0) entièrement hors du viewBox initial sur les 4 candidats.
 */
export function GrapheOptionEtudeFonctionLog({ exercice, index, viewBox, largeur, hauteur }: Props) {
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className="mafs-graph">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: [viewBox.xMin, viewBox.xMax], y: [viewBox.yMin, viewBox.yMax], padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
        preserveAspectRatio={false}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} cibleNombreLignes={CIBLE_NOMBRE_LIGNES_QCM} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX largeur={largeur}>
          {(domaine) => (
            <Plot.OfX
              y={(x) => {
                const v = evaluerCandidat(exercice, index, x);
                return v === null ? NaN : v;
              }}
              domain={domaine}
              color={COULEUR_COURBE}
              weight={EPAISSEUR_TRAIT_ACCENTUE}
            />
          )}
        </DomaineTraceX>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
