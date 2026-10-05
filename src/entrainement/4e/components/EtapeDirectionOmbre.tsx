import { useState } from "react";
import type { DirectionCandidate } from "../core/ombreSoleil.types";
import { NIVEAU_AIDE_MAX_LOOP } from "../moteur/sessionOmbreSoleil";
import {
  apercuDirection,
  CONSIGNE_DIRECTION,
  elementsExemple,
  elementsResolus,
  type ExerciceOmbreSoleilBoucle,
  itemBoucleCourant,
  libelleBoutonAide,
  libelleCandidat,
  ordreAffichageCandidats,
  pointSommetPiquet,
  segmentPiquet,
  solidePourAffichage,
  TEXTE_AIDE_DIRECTION_NIVEAU1,
  texteAideNiveau2SurfaceTouchee,
  texteProgressionBoucle,
} from "../ui/formatOmbreSoleil";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";

interface Props {
  exercice: ExerciceOmbreSoleilBoucle;
  resolus: number[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (id: string) => void;
}

/**
 * Boucle, étape 1 — sélectionner la droite parallèle à la direction de lumière (variantes
 * B/"obstacle" et C/"directionInconnue", spec section "Écran-type"). L'exemple affiché dépend de la
 * variante : le segment déjà résolu (`piquetExemple`) pour "obstacle", le piquet connu
 * (`piquetConnu`) pour "directionInconnue" — les deux jouent EXACTEMENT le même rôle de référence
 * visuelle, seul leur nom de champ diffère sur le contrat. `itemBoucleCourant` centralise le reste
 * de la divergence entre les 2 variantes (voir `ui/formatOmbreSoleil.ts`) : pour "obstacle", ce
 * n'est jamais un nouveau piquet à chaque itération, toujours le MÊME bâton.
 *
 * Le mélange des candidats est refait à chaque NOUVEL item (`useState` réinitialisé via `key`
 * côté `AppOmbreSoleil.tsx`, jamais recalculé à chaque rendu au sein d'un même item).
 */
export function EtapeDirectionOmbre({ exercice, resolus, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [candidats] = useState<DirectionCandidate[]>(() => ordreAffichageCandidats(exercice.directionsCandidates));
  const [choix, setChoix] = useState<DirectionCandidate | null>(null);
  const max = NIVEAU_AIDE_MAX_LOOP;
  const erronee = tentativesUtilisees > 0;

  const piquetExemple = exercice.variante === "obstacle" ? exercice.piquetExemple : exercice.piquetConnu;
  const ombreExemple = exercice.variante === "obstacle" ? exercice.ombreExemple : exercice.ombreConnue;
  const item = itemBoucleCourant(exercice, resolus.length);

  const solide = solidePourAffichage(exercice);
  const exemple = elementsExemple(piquetExemple, ombreExemple);
  const deja = elementsResolus(exercice, resolus);
  const apercu = apercuDirection(item.piquetOrigine, choix);

  const points = [...exemple.points, ...deja.points, pointSommetPiquet(item.piquetOrigine)];
  const segments = [...exemple.segments, ...deja.segments, segmentPiquet(item.piquetOrigine)];
  if (apercu) segments.push(apercu);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_DIRECTION}</p>
      <p className="prompt-text">{texteProgressionBoucle(exercice, resolus.length)}</p>

      <Solide3DSketch solide={solide} pointsExtra={points} segmentsExtra={segments} labelsSommets={false} />

      <div className="options-grid-compact">
        {candidats.map((candidat, index) => (
          <button
            key={candidat.id}
            type="button"
            className={`btn${choix?.id === candidat.id ? " toggle-active" : ""}${erronee && choix?.id === candidat.id ? " is-erronee" : ""}`}
            onClick={() => setChoix(candidat)}
          >
            {libelleCandidat(index)}
          </button>
        ))}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_DIRECTION_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2SurfaceTouchee(item.verite)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= max} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, max)}
      </button>

      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix.id)}>
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
