import { useState } from "react";
import type { ExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "../core/positionDroitePlan.types";
import { NIVEAU_AIDE_MAX_JUSTIFICATION } from "../moteur/sessionPositionDroitePlan";
import { LIBELLE_CLASSIFICATION, consigneJustification, libelleCandidatSecante, libelleDroite, libellePlan, texteAideJustification } from "../ui/formatPositionDroitePlan";
import { formatMessageErreur } from "../ui/messageErreur";
import { Solide3DSketch } from "./Solide3DSketch";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExercicePositionDroitePlan;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseJustificationPositionDroitePlan) => void;
}

/**
 * Écran 2 — Justification structurée. L'interface s'adapte à `exercice.classification` (déjà
 * confirmée à l'écran 1, rappelée en tête) : "incluse" → sélection non ordonnée de 2 sommets parmi
 * TOUS ceux du solide ; "parallele"/"secante" → sélection unique parmi une liste de candidats
 * proposés par la Couche A. Jamais de texte libre — toujours vérifiable automatiquement.
 */
export function EtapeJustificationPositionDroitePlan({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [sommetsChoisis, setSommetsChoisis] = useState<string[]>([]);
  const [indexCandidat, setIndexCandidat] = useState<number | null>(null);
  const max = NIVEAU_AIDE_MAX_JUSTIFICATION;
  const erronee = tentativesUtilisees > 0;

  const tousLesSommets = Object.keys(exercice.solide.sommets);

  function basculerSommet(nom: string) {
    setSommetsChoisis((liste) => (liste.includes(nom) ? liste.filter((n) => n !== nom) : [...liste, nom]));
  }

  const complet =
    exercice.classification === "incluse" ? sommetsChoisis.length === 2 : indexCandidat !== null;

  function valider() {
    if (exercice.classification === "incluse") {
      if (sommetsChoisis.length !== 2) return;
      onValider({ type: "incluse", sommets: [sommetsChoisis[0], sommetsChoisis[1]] });
    } else if (exercice.classification === "parallele") {
      if (indexCandidat === null) return;
      onValider({ type: "parallele", indexCandidat });
    } else {
      if (indexCandidat === null) return;
      onValider({ type: "secante", indexCandidat });
    }
  }

  return (
    <div>
      <p className="prompt-text">
        Étudie la position de la droite {libelleDroite(exercice)} par rapport au plan {libellePlan(exercice)}.
      </p>

      <Solide3DSketch solide={exercice.solide} plan={exercice.plan} droite={exercice.droite} />

      <div className="equation-box">
        <p>État actuel : la droite est {LIBELLE_CLASSIFICATION[exercice.classification].toLowerCase()}.</p>
      </div>

      <p className="prompt-text">{consigneJustification(exercice.classification)}</p>

      {exercice.classification === "incluse" && (
        <div className="options-grid-compact">
          {tousLesSommets.map((nom) => {
            const actif = sommetsChoisis.includes(nom);
            return (
              <button
                key={nom}
                type="button"
                className={`btn${actif ? " toggle-active" : ""}${erronee && actif ? " is-erronee" : ""}`}
                onClick={() => basculerSommet(nom)}
              >
                {nom}
              </button>
            );
          })}
        </div>
      )}

      {exercice.classification === "parallele" && (
        <div className="options-grid-compact">
          {exercice.candidatsParallele.map((candidat, index) => (
            <button
              key={`${candidat.sommets[0]}-${candidat.sommets[1]}`}
              type="button"
              className={`btn${indexCandidat === index ? " toggle-active" : ""}${erronee && indexCandidat === index ? " is-erronee" : ""}`}
              onClick={() => setIndexCandidat(index)}
            >
              {candidat.label}
            </button>
          ))}
        </div>
      )}

      {exercice.classification === "secante" && (
        <div className="options-grid-compact">
          {exercice.candidatsSecante.map((candidat, index) => (
            <button
              key={candidat.type === "sommet" ? candidat.nom : `${candidat.sommets[0]}-${candidat.sommets[1]}`}
              type="button"
              className={`btn${indexCandidat === index ? " toggle-active" : ""}${erronee && indexCandidat === index ? " is-erronee" : ""}`}
              onClick={() => setIndexCandidat(index)}
            >
              {libelleCandidatSecante(candidat)}
            </button>
          ))}
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideJustification(exercice.classification)}</p>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
