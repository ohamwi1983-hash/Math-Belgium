import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseVarianceEcartType } from "../moteur/verificationDispersion";
import { diagnostiquerVarianceEcartType } from "../moteur/verificationDispersion";
import { NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE } from "../moteur/sessionDispersion";
import {
  LABEL_ECART_TYPE,
  LABEL_VARIANCE,
  PLACEHOLDER_ECART_TYPE,
  PLACEHOLDER_VARIANCE,
  consigneEcartType,
  consigneVariance,
  formatEtatActuelTableauLatex,
  libelleBoutonAide,
  texteAideVarianceEcartTypeNiveau1,
  texteAideVarianceEcartTypeNiveau2,
} from "../ui/formatDispersion";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceDispersion } from "./EnonceDispersion";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseVarianceEcartType) => void;
}

/**
 * Écran 2 — "Variance et écart-type" : 2 champs indépendants sur le MÊME écran (spec), soumis
 * ensemble en une seule tentative (tout ou rien) — σ déduit de la variance déjà arrondie (cascade,
 * `core/dispersion.types.ts`), jamais resaisie/redérivée depuis le ratio brut. Les 2 sommes
 * CONFIRMÉES à l'écran 1 sont rappelées via `EtatActuelPanel`, toujours "=" (entiers exacts).
 */
export function EtapeVarianceEcartTypeDispersion({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
}: Props) {
  const [variance, setVariance] = useState("");
  const [ecartType, setEcartType] = useState("");

  const complet = variance.trim() !== "" && ecartType.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerVarianceEcartType(exercice, { variance, ecartType }) : null;
  const statut = evaluation && (evaluation.variance === "parse_error" || evaluation.ecartType === "parse_error") ? "parse_error" : undefined;
  const consigneV = consigneVariance(exercice.contexte);
  const consigneS = consigneEcartType(exercice.contexte);
  const aide2 = texteAideVarianceEcartTypeNiveau2(exercice);

  return (
    <div>
      <EnonceDispersion exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelTableauLatex(exercice)} label="Sommes confirmées" />

      <p className="prompt-text">
        {consigneV.avant}
        <Katex expression={consigneV.latex} />
        {consigneV.apres}
      </p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="dispersion-variance">
          <Katex expression={`${LABEL_VARIANCE} =`} />
        </label>
        <input
          id="dispersion-variance"
          className={`text-input${evaluation && evaluation.variance !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_VARIANCE}
          value={variance}
          onChange={(e) => setVariance(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      <p className="prompt-text">
        {consigneS.avant}
        <Katex expression={consigneS.latex} />
        {consigneS.apres}
      </p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="dispersion-ecart-type">
          <Katex expression={`${LABEL_ECART_TYPE} =`} />
        </label>
        <input
          id="dispersion-ecart-type"
          className={`text-input${evaluation && evaluation.ecartType !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_ECART_TYPE}
          value={ecartType}
          onChange={(e) => setEcartType(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideVarianceEcartTypeNiveau1().texte}</p>
          <Katex expression={texteAideVarianceEcartTypeNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{aide2.texte}</p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      <button
        type="button"
        className="btn btn-aide"
        disabled={niveauAide >= NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE}
        onClick={onActiverAide}
      >
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ variance, ecartType })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
