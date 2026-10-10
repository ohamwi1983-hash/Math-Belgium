import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import type { ReponseContrainteEtGrandeur } from "../moteur/verificationOptimisation";
import { diagnostiquerContrainteEtGrandeur } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR } from "../moteur/sessionOptimisation";
import { consigneContrainteEtGrandeur, segmentsPhraseEnonce, texteAideContrainteNiveau1, texteAideContrainteNiveau2, texteAideGrandeurNiveau1, texteAideGrandeurNiveau2 } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { CroquisOptimisation } from "./CroquisOptimisation";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { SegmentsInline } from "./SegmentsInline";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseContrainteEtGrandeur) => void;
}

/**
 * Écran 2 (`prompt-restructuration-architecture-modelisation.md`) — FUSIONNE les anciens écrans
 * "contrainte" (poser la relation NON isolée) et "exprimer la grandeur en x et y" en un seul écran à
 * 2 champs/2 statuts, comme un système à 2 équations en cours de pose (résolu ensuite à l'écran
 * "systeme"). Le croquis SVG (`prompt-implementation-3-diagrammes-svg.md`) est rendu ICI
 * spécifiquement — c'est l'écran où la relation géométrique est établie, jamais persistant sur
 * toute la séquence comme dans une version antérieure de cette fonctionnalité.
 */
export function EtapeContrainteEtGrandeurOptimisation({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
}: Props) {
  const [texteEquation, setTexteEquation] = useState("");
  const [texteGrandeur, setTexteGrandeur] = useState("");

  const complet = texteEquation.trim() !== "" && texteGrandeur.trim() !== "";
  const reponse: ReponseContrainteEtGrandeur = { texteEquation, texteGrandeur };
  const statut = complet ? diagnostiquerContrainteEtGrandeur(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut
    ? statut.equation === "parse_error" || statut.grandeur === "parse_error"
      ? "parse_error"
      : statut.equation === "correct" && statut.grandeur === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      {exercice.contexte.croquis && <CroquisOptimisation croquis={exercice.contexte.croquis} />}
      <p className="prompt-text">{consigneContrainteEtGrandeur(exercice)}</p>

      <div className="field">
        <label className="field-label" htmlFor="optimisation-contrainte">
          Relation entre {exercice.contexte.labelVariable} et {exercice.contrainte.lettreCherchee}
        </label>
        <input
          id="optimisation-contrainte"
          className={`text-input${apresEchec && statut && statut.equation !== "correct" ? " is-erronee" : ""}`}
          placeholder={`ex : 2${exercice.contexte.labelVariable}+2${exercice.contrainte.lettreCherchee}=40`}
          value={texteEquation}
          onChange={(e) => setTexteEquation(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="optimisation-grandeur">
          {exercice.contexte.nomGrandeur} =
        </label>
        <input
          id="optimisation-grandeur"
          className={`text-input${apresEchec && statut && statut.grandeur !== "correct" ? " is-erronee" : ""}`}
          placeholder={`ex : ${exercice.contexte.labelVariable}*${exercice.contrainte.lettreCherchee}`}
          value={texteGrandeur}
          onChange={(e) => setTexteGrandeur(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsPhraseEnonce(texteAideContrainteNiveau1(exercice))} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideContrainteNiveau2(exercice))} />
            </p>
          )}
          <p>
            <SegmentsInline segments={segmentsPhraseEnonce(texteAideGrandeurNiveau1(exercice))} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideGrandeurNiveau2(exercice))} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONTRAINTE_ET_GRANDEUR} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
