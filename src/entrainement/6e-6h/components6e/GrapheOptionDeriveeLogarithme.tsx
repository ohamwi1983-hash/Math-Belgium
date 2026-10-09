import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import { CIBLE_NOMBRE_LIGNES_QCM, evaluerCandidat, type ViewBoxGraphiqueDeriveeLogarithme } from "../ui6e/formatGraphiqueDeriveeLogarithme";
import { EPAISSEUR_TRAIT_ACCENTUE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";

const COULEUR_COURBE = "#1971c2";

interface Props {
  exercice: ExerciceGraphiqueDeriveeLogarithme;
  index: number;
  viewBox: ViewBoxGraphiqueDeriveeLogarithme;
  /** Mesurées par l'appelant (`EtapeSelectionGraphiqueQCM`, `useLargeurConteneur`) — les 4
   * graphiques d'un même écran partagent toujours la même taille. */
  largeur: number;
  hauteur: number;
}

/** Un des 4 graphiques d'un écran QCM `6gen20` (empilés pleine largeur, lettrés A→D par l'appelant
 * — ce composant ne connaît PAS sa lettre, seulement son `index`) — même `viewBox` INITIAL pour les
 * 4 candidats d'une instance (contrainte impérative de la spec : la seule échelle de DÉPART ne doit
 * jamais trahir la bonne réponse). Rendu via `Plot.OfX` — même patron que
 * `GrapheOptionDeriveeExpo.tsx` (`6gen8`), réimplémenté ici plutôt qu'importé — module propre à ce
 * générateur (domaine x>0 pour les 3 familles, retourne `null` hors domaine — `Plot.OfX` coupe
 * naturellement le tracé en dehors, comportement voulu). Composant purement illustratif — jamais
 * cliquable (le choix se fait via les 4 boutons de choix texte séparés sous la liste).
 *
 * **Zoom/pan réactivés** — voir la documentation complète sur `GrapheOptionCyclo.tsx` (même retour
 * utilisateur, même correctif, même justification pour la contrainte d'équité entre candidats).
 * `pan={true}`/`zoom={{min: ZOOM_MIN, max: ZOOM_MAX}}` (constantes partagées `ui/
 * mafsTransformation.ts`) remplacent l'ancien `pan={false}`/`zoom={false}` ; `DomaineTraceX` fait
 * suivre le tracé au zoom/pan courant (au lieu de rester figé au `viewBox` initial — sans quoi un
 * dézoom au-delà du domaine x>0 déjà cadré laisserait un vide) ; `formatIndicateurPasGrille`
 * affiche l'échelle courante sous le graphique.
 *
 * `preserveAspectRatio={false}` EXPLICITE — piège déjà rencontré et documenté sur `6gen8` : Mafs
 * applique par défaut `preserveAspectRatio="contain"`, qui étire l'axe le plus étroit pour forcer
 * le même pas pixel/unité sur les deux axes — ici x et f'(x) sont deux grandeurs de nature
 * différente, l'étendue X (jusqu'à 7 unités pour la famille A) est généralement bien plus large que
 * l'étendue Y réelle après plafonnement (`calculerViewBoxGraphique`) : sans ce réglage, l'axe Y
 * serait silencieusement gonflé, écrasant visuellement la forme réelle (pic ou droite). Voir
 * CLAUDE.md, "Transversal 3 chantiers" et `docs/historique-6e.md` (6gen8).
 *
 * **Densité de graduation augmentée / axe Y garanti visible** — voir la documentation complète sur
 * `GrapheOptionCyclo.tsx` (même retour utilisateur, même correctif) : `cibleNombreLignes` remonté
 * de `3` à `6`, `assurerAxesVisibles` (`ui/mafsTransformation.ts`) appliqué en bout de chaîne par
 * `calculerViewBoxGraphique` (`ui6e/formatGraphiqueDeriveeLogarithme.ts`) — cas le plus concret sur
 * ce chantier : domaine `x>0` pour les 3 familles, `fenetreX` restait donc TOUJOURS strictement à
 * droite de 0, laissant l'axe Y (x=0) entièrement hors du viewBox initial sur les 4 candidats. */
export function GrapheOptionDeriveeLogarithme({ exercice, index, viewBox, largeur, hauteur }: Props) {
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
