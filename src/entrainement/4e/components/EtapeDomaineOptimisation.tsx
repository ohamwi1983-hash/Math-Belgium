import { useState } from "react";
import type { ExerciceOptimisationModelisation } from "../core/optimisation.types";
import { diagnostiquerDomaine } from "../moteur/verificationOptimisation";
import type { ReponseDomaine } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_DOMAINE } from "../moteur/sessionOptimisation";
import { consigneDomaine, formatFonctionDeveloppeeLatex, texteAideDomaineNiveau1, texteAideDomaineNiveau2, texteAideDomaineNiveau3 } from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceOptimisationModelisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDomaine) => void;
}

/** Écran 3 (`modelisation` uniquement) — déterminer le domaine de validité de la variable. */
export function EtapeDomaineOptimisation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [inf, setInf] = useState("");
  const [sup, setSup] = useState("");
  const complet = inf.trim() !== "" && sup.trim() !== "";
  const reponse: ReponseDomaine = { inf, sup };
  const statut = complet ? diagnostiquerDomaine(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut
    ? statut.inf === "parse_error" || statut.sup === "parse_error"
      ? "parse_error"
      : statut.inf === "correct" && statut.sup === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <EtatActuelPanel latex={formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable)} />
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
            onChange={(e) => setInf(e.target.value)}
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
            onChange={(e) => setSup(e.target.value)}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideDomaineNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAideDomaineNiveau2(exercice)}</p>}
          {niveauAide >= 3 && <p>{texteAideDomaineNiveau3(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_DOMAINE} onActiverAide={onActiverAide} />

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
