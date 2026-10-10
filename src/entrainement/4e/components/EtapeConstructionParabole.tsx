import { useState } from "react";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import { NIVEAU_AIDE_MAX_CONSTRUCTION } from "../moteur/sessionConstructionParabole";
import { diagnostiquerConstruction, pointsCiblesIteration } from "../moteur/verificationConstructionParabole";
import type { ReponseConstructionParabole } from "../moteur/verificationConstructionParabole";
import {
  CONSIGNE_CONSTRUCTION,
  TEXTE_AIDE_CONSTRUCTION_NIVEAU1,
  TEXTE_AIDE_CONSTRUCTION_NIVEAU2,
  formatLegendeDistanceLigne,
  formatLegendeRayon,
  messageRayonDejaUtilise,
  messageRayonInvalide,
  rEstDejaUtilise,
} from "../ui/formatConstructionParabole";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConstructionParaboleGraph } from "./ConstructionParaboleGraph";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceConstructionParabole;
  numeroIteration: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  /** Les r déjà confirmés aux itérations précédentes de ce même exercice — un r réutilisé est
   * rejeté (voir `verificationConstructionParabole.ts::rEstValide`). */
  rDejaUtilises: number[];
  onActiverAide: () => void;
  onValider: (reponse: ReponseConstructionParabole) => void;
}

const R_INITIAL = 1;
const LIGNE_Y_INITIALE = 0;

/**
 * Écran "construction", répété `NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE` fois — un geste de compas
 * (rayon r, poignée bleue) suivi d'un geste d'équerre (droite parallèle à la directrice, poignée
 * orange), sur la même grille tournée. Aucun champ de saisie : les 2 poignées `MovablePoint` PORTENT
 * la réponse — `onValider` soumet leur position courante telle quelle.
 *
 * `pointsConfirmes` (`promptgen53corrections.md`, A.2/A.3) — recalculés à chaque rendu depuis
 * `rDejaUtilises` (jamais stockés séparément, même principe de cohérence interne que le reste du
 * moteur) et transmis en permanence à `ConstructionParaboleGraph` : dès qu'une itération se clôt
 * avec succès, son `r` rejoint `rDejaUtilises` et ses 2 points apparaissent donc immédiatement, sans
 * étape de transition séparée. Le cercle/la droite de l'itération EN COURS, eux, sont remis à zéro à
 * chaque nouvelle itération via `key={numeroIteration}` posé par l'appelant (A.1,
 * `AppConstructionParabole.tsx`) — jamais réinitialisés ici (ce composant n'a aucune connaissance de
 * son propre remontage).
 *
 * Rayon déjà utilisé à une itération précédente (A.4/A.5) : message INFORMATIF (`.info-banner`,
 * jamais une alerte rouge) affiché en direct pendant la manipulation, ET bouton "Valider" verrouillé
 * tant que la valeur crantée courante est un doublon — rend cette situation impossible à soumettre,
 * donc jamais rencontrée après validation.
 */
export function EtapeConstructionParabole({
  exercice,
  numeroIteration,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  rDejaUtilises,
  onActiverAide,
  onValider,
}: Props) {
  const [r, setR] = useState(R_INITIAL);
  const [ligneY, setLigneY] = useState(LIGNE_Y_INITIALE);

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerConstruction(exercice, { r, ligneY }, rDejaUtilises) : undefined;
  const rErronee = apresEchec && statut !== undefined && !statut.rValide;
  const ligneErronee = apresEchec && statut !== undefined && !statut.ligneValide;
  const avertissementRayon = messageRayonInvalide(exercice, r);
  const rDejaUtiliseActuellement = rEstDejaUtilise(r, rDejaUtilises);
  const messageDejaUtilise = messageRayonDejaUtilise(r, rDejaUtilises);
  const pointsConfirmes = rDejaUtilises.flatMap((rConfirme) => pointsCiblesIteration(exercice, rConfirme));

  return (
    <div>
      <p className="prompt-text">
        Itération {numeroIteration} / 3 — {CONSIGNE_CONSTRUCTION}
      </p>

      <ConstructionParaboleGraph
        exercice={exercice}
        r={r}
        ligneY={ligneY}
        onChangeR={setR}
        onChangeLigneY={setLigneY}
        afficherCercleReference={niveauAide >= 2}
        rErronee={rErronee}
        ligneErronee={ligneErronee}
        pointsConfirmes={pointsConfirmes}
      />
      <p className="mafs-graph-pas">
        {formatLegendeRayon(r)} — {formatLegendeDistanceLigne(ligneY)}
      </p>
      {avertissementRayon && (
        <p className="alert-error" role="alert">
          {avertissementRayon}
        </p>
      )}
      {messageDejaUtilise && <p className="info-banner">{messageDejaUtilise}</p>}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{TEXTE_AIDE_CONSTRUCTION_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_CONSTRUCTION_NIVEAU2}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONSTRUCTION} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={rDejaUtiliseActuellement} onClick={() => onValider({ r, ligneY })}>
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
