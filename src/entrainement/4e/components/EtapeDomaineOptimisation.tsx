import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import { diagnostiquerDomaine } from "../moteur/verificationOptimisation";
import type { ReponseDomaine } from "../moteur/verificationOptimisation";
import { consigneDomaine, segmentsPhraseEnonce } from "../ui/formatOptimisation";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { aidesDomaine, messageDomaine, MESSAGE_VALEUR_OPTIMISATION_ILLISIBLE } from "../ui/aidesOptimisation";
import { EnTeteExercice } from "./EnTeteExercice";
import { Katex } from "./Katex";
import { QuestionFinale } from "./QuestionFinale";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDomaine) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3 (`modelisation` uniquement) — déterminer le domaine de validité de la variable. */
export function EtapeDomaineOptimisation({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation}: Props) {
  const [inf, setInf] = useState("");
  const [sup, setSup] = useState("");
  const saisie = useTentativeLisible<ReponseDomaine>();
  const lisible = parserNombreOuFraction(inf) !== null && parserNombreOuFraction(sup) !== null;
  const complet = inf.trim() !== "" && sup.trim() !== "";
  const reponse: ReponseDomaine = { inf, sup };
  const statut = complet ? diagnostiquerDomaine(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<SegmentsInline segments={segmentsPhraseEnonce(exercice.contexte.phraseEnonce)} />}
        blocDonnees={<QuestionFinale question={exercice.contexte.questionFinale} />}
      />
      <p className="prompt-text">{consigneDomaine(exercice)}</p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="optimisation-domaine-inf">
            <Katex expression={`${exercice.contexte.labelVariable}_{min} =`} />
          </label>
          <input
            id="optimisation-domaine-inf"
            className={`text-input${apresEchec && statut && statut.inf !== "correct" ? " is-erronee" : ""}`}
            value={inf}
            onChange={(e) => setInf(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="optimisation-domaine-sup">
            <Katex expression={`${exercice.contexte.labelVariable}_{max} =`} />
          </label>
          <input
            id="optimisation-domaine-sup"
            className={`text-input${apresEchec && statut && statut.sup !== "correct" ? " is-erronee" : ""}`}
            value={sup}
            onChange={(e) => setSup(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>

      {!validation && (
        <>
        <AidesNiveaux aides={aidesDomaine(exercice)} onPremiereAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse, lisible, onValider)}>
          Valider
        </button>
        <MessageRetour illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} texteIllisible={MESSAGE_VALEUR_OPTIMISATION_ILLISIBLE} cible={saisie.soumise ? messageDomaine(exercice, saisie.soumise.inf, saisie.soumise.sup) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
