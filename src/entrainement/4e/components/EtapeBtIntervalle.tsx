import { useState } from "react";
import type { ExerciceSynthese } from "../core/exerciceSynthese.types";
import { diagnostiquerBtIntervalle } from "../moteur/verificationExerciceSynthese";
import type { ReponseIntervalle } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { consigneBtIntervalle, formatEnonceTexte, formatEtatActuelXBarSigmaLatex, texteAideBtIntervalleNiveau1, texteAideBtIntervalleNiveau2 } from "../ui/formatExerciceSynthese";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceSynthese;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIntervalle) => void;
}

const MAX = 2;

/** `parse_error` prioritaire si l'un des deux champs échoue au parsing — même principe que
 * "Inégalité de Bienaymé-Tchebychev" (`EtapeIntervalleFinal.tsx`). */
function statutPrioritaire(statut: { borneInf: string; borneSup: string } | undefined): "parse_error" | "not_equivalent" | undefined {
  if (!statut) return undefined;
  if (statut.borneInf === "parse_error" || statut.borneSup === "parse_error") return "parse_error";
  return "not_equivalent";
}

/**
 * Écran "btIntervalle" — "gen37 adaptée" (`kBT` toujours fixé à 2, jamais résolu) : l'élève calcule
 * l'intervalle $[\bar{x}-k\sigma\,;\,\bar{x}+k\sigma]$ à partir des $\bar{x}$/$\sigma$ déjà
 * CONFIRMÉS aux écrans "quotient"/"varianceEcartType" (rappelés via `EtatActuelPanel`, jamais
 * resaisis). 2 champs indépendants (isole une erreur de signe sur une seule borne).
 */
export function EtapeBtIntervalle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [borneInf, setBorneInf] = useState("");
  const [borneSup, setBorneSup] = useState("");
  const complet = borneInf.trim() !== "" && borneSup.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerBtIntervalle(exercice, { borneInf, borneSup }) : undefined;

  return (
    <div>
      <div className="equation-box">
        <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
      </div>
      <EtatActuelPanel latex={formatEtatActuelXBarSigmaLatex(exercice)} />
      <p className="prompt-text">{consigneBtIntervalle(exercice)}</p>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="synthese-bt-intervalle-inf">
            Borne inférieure =
          </label>
          <input
            id="synthese-bt-intervalle-inf"
            className={`text-input${statut !== undefined && statut.borneInf !== "correct" ? " is-erronee" : ""}`}
            placeholder="ex : -0,66"
            value={borneInf}
            onChange={(e) => setBorneInf(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="synthese-bt-intervalle-sup">
            Borne supérieure =
          </label>
          <input
            id="synthese-bt-intervalle-sup"
            className={`text-input${statut !== undefined && statut.borneSup !== "correct" ? " is-erronee" : ""}`}
            placeholder="ex : 10,66"
            value={borneSup}
            onChange={(e) => setBorneSup(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideBtIntervalleNiveau1().texte}</p>
          <Katex expression={texteAideBtIntervalleNiveau1().latex} block />
        </div>
      )}
      {niveauAide >= 2 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideBtIntervalleNiveau2(exercice).texte}</p>
          <Katex expression={texteAideBtIntervalleNiveau2(exercice).latex} block />
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={MAX} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ borneInf, borneSup })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutPrioritaire(statut))}
        </p>
      )}
    </div>
  );
}
