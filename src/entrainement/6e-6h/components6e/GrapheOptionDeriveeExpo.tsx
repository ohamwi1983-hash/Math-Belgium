import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import { CIBLE_NOMBRE_LIGNES_QCM, evaluerCandidat, type ViewBoxGraphiqueDeriveeExpo } from "../ui6e/formatGraphiquesDeriveeExponentielles";
import { EPAISSEUR_TRAIT_ACCENTUE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";

const COULEUR_COURBE = "#1971c2";

interface Props {
  exercice: ExerciceGraphiqueDeriveeExponentielle;
  index: number;
  viewBox: ViewBoxGraphiqueDeriveeExpo;
  /** Mesurées par l'appelant (`EtapeSelectionGraphiqueQCM`, `useLargeurConteneur`) — les 4
   * graphiques d'un même écran partagent toujours la même taille. */
  largeur: number;
  hauteur: number;
}

/** Un des 4 graphiques d'un écran QCM `6gen8` (empilés pleine largeur, lettrés A→D par l'appelant —
 * ce composant ne connaît PAS sa lettre, seulement son `index`) — même `viewBox` INITIAL pour les 4
 * candidates d'une instance (contrainte impérative de la spec : la seule échelle de DÉPART ne doit
 * jamais trahir la bonne réponse). Rendu via `Plot.OfX` — les discontinuités (famille D, `null`
 * retourné dans la marge autour du pôle x=0) créent naturellement une coupure du tracé, exactement
 * le comportement voulu pour distinguer une vraie asymptote verticale d'une courbe continue
 * (distracteur "continu" de la famille D). Même patron que `GrapheOptionCyclo.tsx` (`6gen5`),
 * réimplémenté ici plutôt qu'importé — module propre à ce générateur. Composant purement
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
 * `preserveAspectRatio={false}` EXPLICITE — bug trouvé par vérification Playwright (capture
 * confirmant les 4 bosses de la famille B rendues quasi PLATES, alors que
 * `calculerViewBoxGraphique` calculait déjà correctement une fenêtre Y étroite, cohérente avec la
 * faible amplitude réelle de `f'`) : Mafs applique par défaut `preserveAspectRatio="contain"`
 * (`node_modules/mafs/build/index.d.ts`), qui ÉTIRE l'axe le plus étroit pour forcer le même pas
 * pixel/unité sur les deux axes — ici l'étendue X (jusqu'à 12 unités) est bien plus large que
 * l'étendue Y réelle (souvent <2 unités pour la famille B), donc l'axe Y était silencieusement
 * gonflé jusqu'à ±5, écrasant visuellement la bosse. Même piège déjà documenté ailleurs sur la
 * plateforme (`CLAUDE.md`, "Graphes Mafs génériques") pour des axes de natures différentes — ici
 * x et f'(x), pas seulement des grandeurs hétérogènes au sens métier.
 *
 * **Densité de graduation augmentée / axes garantis visibles** — voir la documentation complète sur
 * `GrapheOptionCyclo.tsx` (même retour utilisateur, même correctif) : `cibleNombreLignes` remonté
 * de `3` à `6`, `assurerAxesVisibles` (`ui/mafsTransformation.ts`) appliqué en bout de chaîne par
 * `calculerViewBoxGraphique` (`ui6e/formatGraphiquesDeriveeExponentielles.ts`). */
export function GrapheOptionDeriveeExpo({ exercice, index, viewBox, largeur, hauteur }: Props) {
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
