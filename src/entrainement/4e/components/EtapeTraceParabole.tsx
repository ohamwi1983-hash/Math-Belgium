import { useEffect, useState } from "react";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import { formatMessageErreur } from "../ui/messageErreur";
import { TraceParaboleGraph } from "./TraceParaboleGraph";

interface Props {
  exercice: ExerciceConstructionParabole;
  cibles: Point[];
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (selectionnes: Point[]) => void;
}

export const CONSIGNE_TRACE =
  "Clique les 6 points construits dans l'ordre, de gauche à droite, pour tracer la parabole — la courbe reliera les points dans l'ordre où tu les sélectionnes, donc un mauvais ordre donnerait une courbe qui ne ressemble pas à une parabole.";

/**
 * Écran "trace" (dernier, toujours terminal) — aucun tracé libre : l'élève clique les 6 points déjà
 * construits (marqueurs fixes, jamais `MovablePoint`), une interpolation parabolique se révèle entre
 * les points déjà sélectionnés (`TraceParaboleGraph`). L'état de sélection est local à cet écran
 * (jamais transmis au moteur avant "Valider" — même principe que le reste de la plateforme).
 *
 * Sélection trackée par INDEX dans `cibles`, jamais par valeur de point — voir l'en-tête de
 * `TraceParaboleGraph.tsx` : deux itérations ayant choisi le même `r` produisent des points cibles
 * strictement identiques, qu'un suivi par valeur rendrait indistinguables et donc bloquants.
 */
export function EtapeTraceParabole({ exercice, cibles, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [selectionnesIndices, setSelectionnesIndices] = useState<number[]>([]);

  // Une tentative ratée remet la sélection à zéro — un ordre incorrect ne peut pas être "corrigé"
  // point par point avec cette interaction (ajout/recommencer uniquement), donc la retentative doit
  // repartir d'une sélection vide plutôt que de laisser "Valider" ré-cliquable sans rien changer.
  useEffect(() => {
    setSelectionnesIndices([]);
  }, [tentativesUtilisees]);

  function ajouterPoint(index: number) {
    if (selectionnesIndices.includes(index)) return;
    setSelectionnesIndices([...selectionnesIndices, index]);
  }

  function recommencer() {
    setSelectionnesIndices([]);
  }

  const complet = selectionnesIndices.length === cibles.length;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_TRACE}</p>

      <TraceParaboleGraph exercice={exercice} cibles={cibles} selectionnesIndices={selectionnesIndices} onClicPoint={ajouterPoint} />
      <p className="mafs-graph-pas">
        {selectionnesIndices.length} / {cibles.length} points sélectionnés
      </p>

      <button type="button" className="btn btn-aide" disabled={selectionnesIndices.length === 0} onClick={recommencer}>
        Recommencer
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider(selectionnesIndices.map((i) => cibles[i]!))}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
