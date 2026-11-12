import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { diagnostiquerCtLectureC, type ReponseLectureC } from "../moteur5e/verificationProblemesContexte";
import { consigneContexteC, consigneLectureC, texteAideLectureC1 } from "../ui5e/formatProblemesContexte";
import { TexteRiche5e } from "./TexteRiche5e";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceScenarioC;
  /** Bloc "données" persistant (tableau de valeurs du scénario C) — rendu AVANT la question. */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLectureC) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 du scénario C (audit 5e ch. 1) : CT(xLecture) calculé à partir du TABLEAU de valeurs
 * (affiché dans `donnees`) — plus de lecture graphique de CF/CV/CP au demi-millier près. */
export function EtapeLectureC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [ct, setCt] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = ct.trim() !== "";
  const ctErronee = montrerErreurs && complet && diagnostiquerCtLectureC(exercice, Number(ct.replace(",", "."))) !== "correct";

  function valider() {
    if (!complet) return;
    onValider({ ct: Number(ct.replace(",", ".")) });
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<TexteRiche5e texte={consigneContexteC(exercice)} />} blocDonnees={donnees} />
      <p className="prompt-text">
        <TexteRiche5e texte={consigneLectureC(exercice)} />
      </p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CT({exercice.xLecture}) =</label>
        <input type="text" className={`text-input${ctErronee ? " is-erronee" : ""}`} value={ct} onChange={(e) => setCt(e.target.value.replace(/[^0-9.,-]/g, ""))} />
      </div>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>
            <TexteRiche5e texte={texteAideLectureC1(exercice)} />
          </p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
