import { useState } from "react";
import type { DirectionCandidate } from "../core/ombreSoleil.types";
import { NIVEAU_AIDE_MAX_LOOP } from "../moteur/sessionOmbreSoleil";
import {
  apercuDirection,
  apercuPoint,
  CONSIGNE_POINT,
  directionCorrecte,
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
 * Boucle, étape 2 (dernière sous-étape de l'item courant) — sélectionner le point où l'ombre touche
 * réellement une surface (obstacle ou sol). Même unité pédagogique que `EtapeDirectionOmbre` (le
 * niveau d'aide n'est PAS réinitialisé entre les deux, voir `sessionOmbreSoleil.ts`) : les mêmes 2
 * textes d'aide restent affichés ici, avec en plus, au niveau 2, la droite déjà tracée (même
 * principe que l'aide 2 de la variante A, `EtapePointSimple`) — cohérent avec la spec ("la droite
 * correcte est affichée déjà tracée"). `itemBoucleCourant` fournit déjà l'obstacle RÉEL testé pour
 * cet item (`Solide3D` déjà filtré via `solideCollision`) — jamais recalculé ici.
 */
export function EtapePointOmbre({ exercice, resolus, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
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
  const apercu = apercuPoint(item.piquetOrigine, choix, item.obstacle);
  const directionRevelee = niveauAide >= 2 ? apercuDirection(item.piquetOrigine, directionCorrecte(exercice)) : null;

  const points = [...exemple.points, ...deja.points, pointSommetPiquet(item.piquetOrigine)];
  if (apercu) points.push(apercu.point);
  const segments = [...exemple.segments, ...deja.segments, segmentPiquet(item.piquetOrigine)];
  if (directionRevelee) segments.push(directionRevelee);
  if (apercu) segments.push(apercu.segment);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_POINT}</p>
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
