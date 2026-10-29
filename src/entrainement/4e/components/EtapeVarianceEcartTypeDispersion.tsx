import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseVarianceEcartType } from "../moteur/verificationDispersion";
import { diagnostiquerVarianceEcartType, ecartTypeDepuisVarianceNonArrondie } from "../moteur/verificationDispersion";
import { NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE } from "../moteur/sessionDispersion";
import { LABEL_ECART_TYPE, LABEL_VARIANCE, PLACEHOLDER_ECART_TYPE, PLACEHOLDER_VARIANCE, consigneEcartType, consigneVariance, texteAideVarianceEcartTypeNiveau1, texteAideVarianceEcartTypeNiveau2 } from "../ui/formatDispersion";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceDispersion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseVarianceEcartType) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — "Variance et écart-type" : 2 champs indépendants sur le MÊME écran (spec), soumis
 * ensemble en une seule tentative (tout ou rien) — σ déduit de la variance déjà arrondie (cascade,
 * `core/dispersion.types.ts`), jamais resaisie/redérivée depuis le ratio brut. Les 2 sommes
 * CONFIRMÉES à l'écran 1 sont rappelées dans le récapitulatif "Ce qu'on sait déjà"
 * (`RecapitulatifPanel`, câblé par `AppDispersion.tsx`/`AppExerciceSynthese.tsx`), toujours "="
 * (entiers exacts).
 */
export function EtapeVarianceEcartTypeDispersion({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [variance, setVariance] = useState("");
  const [ecartType, setEcartType] = useState("");

  const complet = variance.trim() !== "" && ecartType.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerVarianceEcartType(exercice, { variance, ecartType }) : null;
  const statut = evaluation && (evaluation.variance === "parse_error" || evaluation.ecartType === "parse_error") ? "parse_error" : undefined;
  const sigmaDepuisVarianceBrute = evaluation !== null && evaluation.ecartType !== "correct" && ecartTypeDepuisVarianceNonArrondie(exercice, ecartType);
  const consigneV = consigneVariance(exercice.contexte);
  const consigneS = consigneEcartType(exercice.contexte);
  const aide2 = texteAideVarianceEcartTypeNiveau2(exercice);

  return (
    <div>

      <p className="prompt-text prompt-text--question-multiple">
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

      <p className="prompt-text prompt-text--question-multiple">
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ variance, ecartType })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
            {sigmaDepuisVarianceBrute && (
              <>
                {" "}Ton écart-type est calculé à partir de la variance non arrondie : calcule <Katex expression={`${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`} /> à partir de la variance arrondie à 2 décimales.
              </>
            )}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
