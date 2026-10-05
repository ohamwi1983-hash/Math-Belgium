import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import { CIBLE_NOMBRE_LIGNES_QCM, evaluerCandidat, type ViewBoxEtudeFonction } from "../ui6e/formatEtudeFonctionExponentielle";
import { EPAISSEUR_TRAIT_ACCENTUE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";

const COULEUR_COURBE = "#1971c2";

interface Props {
  exercice: ExerciceEtudeFonctionExponentielle;
  index: number;
  viewBox: ViewBoxEtudeFonction;
  /** Mesurées par l'appelant (`EtapeSelectionGraphiqueQCM`, `useLargeurConteneur`) — les 4
   * graphiques d'un même écran partagent toujours la même taille. */
  largeur: number;
  hauteur: number;
}

/**
 * Un des 4 graphiques de l'écran QCM final (`6gen11`, empilés pleine largeur, lettrés A→D par
 * l'appelant — ce composant ne connaît PAS sa lettre, seulement son `index`) — même `viewBox`
 * INITIAL pour les 4 candidats (contrainte impérative, jamais dérivée du seul candidat réel).
 * Réimplémenté ici plutôt qu'importé — module propre à ce générateur, même principe que
 * `GrapheOptionCyclo.tsx` (6gen5)/`GrapheOptionDeriveeExpo.tsx` (6gen8). Composant purement
 * illustratif — jamais cliquable (le choix se fait via les 4 boutons de choix texte séparés sous
 * la liste).
 *
 * **Zoom/pan réactivés** — voir la documentation complète sur `GrapheOptionCyclo.tsx` (même retour
 * utilisateur, même correctif, même justification pour la contrainte d'équité entre candidats).
 * `pan={true}`/`zoom={{min: ZOOM_MIN, max: ZOOM_MAX}}` (constantes partagées `ui/
 * mafsTransformation.ts`) remplacent l'ancien `pan={false}`/`zoom={false}` ; `DomaineTraceX` fait
 * suivre le tracé au zoom/pan courant (au lieu de rester figé au `viewBox` initial) ;
 * `formatIndicateurPasGrille` affiche l'échelle courante sous le graphique.
 *
 * `preserveAspectRatio={false}` EXPLICITE DÈS LA CONCEPTION — piège déjà documenté à 2 reprises sur
 * ce chantier (6gen5, 6gen8) : Mafs applique par défaut `preserveAspectRatio="contain"`, qui ÉTIRE
 * l'axe le plus étroit pour forcer un même pas pixel/unité sur les deux axes, écrasant
 * silencieusement l'échelle Y réelle dès que l'étendue X est bien plus large. `calculerViewBox`
 * (`ui6e/formatEtudeFonctionExponentielle.ts`) plafonne déjà les magnitudes extrêmes (croissance
 * exponentielle non bornée des familles A/C/D, pôle de la famille B) — voir sa doc — mais sans ce
 * flag, l'échelle resterait quand même déformée.
 *
 * **Densité de graduation augmentée / axes garantis visibles** — voir la documentation complète sur
 * `GrapheOptionCyclo.tsx` (même retour utilisateur, même correctif) : `cibleNombreLignes` remonté
 * de `3` à `6`, `assurerAxesVisibles` (`ui/mafsTransformation.ts`) appliqué en bout de chaîne par
 * `calculerViewBox` (`ui6e/formatEtudeFonctionExponentielle.ts`) — utile ici en particulier pour la
 * famille B, dont la fenêtre `[p-4,p+4]` est centrée sur un paramètre `p` de l'exercice sans lien
 * garanti avec 0.
 */
export function GrapheOptionEtudeFonction({ exercice, index, viewBox, largeur, hauteur }: Props) {
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
