import { useState } from "react";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ReponseVarianceEcartType } from "../moteur/verificationDispersion";
import { diagnostiquerVarianceEcartType, ecartTypeDepuisVarianceNonArrondie, ecartTypeSansRacine, saisieIllisible } from "../moteur/verificationDispersion";
import { NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE } from "../moteur/sessionDispersion";
import { LABEL_ECART_TYPE, LABEL_VARIANCE, MESSAGE_SAISIE_ILLISIBLE, PLACEHOLDER_ECART_TYPE, PLACEHOLDER_VARIANCE, consigneEcartType, consigneVariance, texteAideVarianceEcartTypeNiveau1, texteAideVarianceEcartTypeNiveau2 } from "../ui/formatDispersion";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { TexteInsistance } from "../../components/TexteInsistance";

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
  /** Voir `EtapeTableauDispersion` : `true` pour gen34 (saisie illisible non envoyée, aucune
   * tentative consommée) ; absent pour l'exercice de synthèse (comportement historique). */
  saisieIllisibleNonComptee?: boolean;
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
  saisieIllisibleNonComptee = false,
}: Props) {
  const [variance, setVarianceBrut] = useState("");
  const [ecartType, setEcartTypeBrut] = useState("");
  const [illisible, setIllisible] = useState(false);

  function setVariance(valeur: string) {
    setIllisible(false);
    setVarianceBrut(valeur);
  }
  function setEcartType(valeur: string) {
    setIllisible(false);
    setEcartTypeBrut(valeur);
  }
  function valider() {
    if (saisieIllisibleNonComptee && (saisieIllisible(variance) || saisieIllisible(ecartType))) {
      setIllisible(true);
      return;
    }
    onValider({ variance, ecartType });
  }

  const complet = variance.trim() !== "" && ecartType.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerVarianceEcartType(exercice, { variance, ecartType }) : null;
  const statut = evaluation && (evaluation.variance === "parse_error" || evaluation.ecartType === "parse_error") ? "parse_error" : undefined;
  const sigmaDepuisVarianceBrute = evaluation !== null && evaluation.ecartType !== "correct" && ecartTypeDepuisVarianceNonArrondie(exercice, ecartType);
  // Piège « écart-type sans la racine » : diagnostiqué pour la famille "classes" seulement (les
  // autres usages de cet écran gardent leur comportement historique).
  const sigmaSansRacine = exercice.enClasses !== undefined && evaluation !== null && evaluation.ecartType !== "correct" && ecartTypeSansRacine(exercice, ecartType);
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
          onChange={(e) => setVariance(normaliserSigneMoins(e.target.value))}
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
          onChange={(e) => setEcartType(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideVarianceEcartTypeNiveau1().texte}</p>
          <Katex expression={texteAideVarianceEcartTypeNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p><TexteInsistance texte={aide2.texte} /></p>
              <Katex expression={aide2.latex} block />
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {illisible && (
          <p className="alert-error" role="alert">
            {MESSAGE_SAISIE_ILLISIBLE}
          </p>
        )}
        {!illisible && tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {/* Un seul enfant : `.alert-error` est un conteneur flex, chaque morceau (texte, formule)
                deviendrait sinon une colonne étroite. */}
            <span>
              {formatMessageErreur(tentativesUtilisees, tentativesMax, saisieIllisibleNonComptee ? undefined : statut)}
              {sigmaSansRacine && (
                <>
                  {" "}Ton écart-type est égal à la variance : l'écart-type est sa racine carrée, <Katex expression={`${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`} />.
                </>
              )}
              {sigmaDepuisVarianceBrute && (
                <>
                  {" "}Ton écart-type est calculé à partir de la variance non arrondie : calcule <Katex expression={`${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`} /> à partir de la variance arrondie à 2 décimales.
                </>
              )}
            </span>
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
