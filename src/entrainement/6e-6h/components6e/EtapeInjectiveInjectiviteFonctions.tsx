import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ReponseInjective } from "../moteur6e/verificationInjectiviteFonctions";
import { diagnostiquerInjective } from "../moteur6e/verificationInjectiviteFonctions";
import { diagnostiquerEnsembleReelGuide } from "../moteur6e/verificationEnsembleReel";
import { evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import { CONSIGNE_ECRAN_INJECTIVE, CONSIGNE_GENERALE, CONSIGNE_SOUS_QUESTION_INTERVALLE, formatFLatexAffichage } from "../ui6e/formatInjectiviteFonctions";
import { AIDE_INJECTIVE_1, AIDE_INTERVALLE_1, aideInjective2, aideIntervalle2, cibleIntervalle } from "../ui6e/aidesInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MESSAGE_APPROCHEE_CYCLO, MessageRetourCyclo, useRetourCyclo } from "./RetourSaisieCyclo";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseInjective) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 de `6gen1` — verdict « f est-elle injective ? » (Oui / Non : choix fermé, une seule
 * tentative — un verdict faux clôt l'écran, voir `soumettreReponseInjective`), puis, après « Non »,
 * le plus grand intervalle d'injectivité (champ : trois tentatives, les deux moitiés acceptées).
 * Borne illisible ou approchée : message sans tentative. Aides à deux niveaux qui ne donnent jamais
 * le verdict (niveau 2 : l'égalité f(x₁) = f(x₂) posée pour l'instance, la même quelle que soit la
 * réponse).
 */
export function EtapeInjectiveInjectiviteFonctions({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const [ouiNon, setOuiNon] = useState<boolean | null>(null);
  const [intervalle, setIntervalle] = useState<EnsembleReelGuide | null>(null);
  const [illisible, setIllisible] = useState(false);
  const retour = useRetourCyclo<ReponseInjective>();

  const complet = ouiNon === true || (ouiNon === false && (intervalle !== null || illisible));
  const derniere = retour.soumise;
  const statut = tentativesUtilisees > 0 && derniere !== null ? diagnostiquerInjective(exercice, derniere) : null;

  function valider() {
    if (ouiNon === null) return;
    if (ouiNon === false && illisible) return retour.tenter({ ouiNon, intervalle: null }, MESSAGES_ILLISIBLE_CYCLO.borne, onValider);
    if (ouiNon === false && intervalle === null) return;
    const reponse: ReponseInjective = { ouiNon, intervalle: ouiNon ? null : intervalle };
    const approchee =
      !ouiNon &&
      intervalle !== null &&
      !exercice.injective &&
      (diagnostiquerEnsembleReelGuide(intervalle, exercice.intervalleGauche) === "approchee" || diagnostiquerEnsembleReelGuide(intervalle, exercice.intervalleDroite) === "approchee");
    retour.tenter(reponse, approchee ? MESSAGE_APPROCHEE_CYCLO : null, onValider);
  }

  const aidesIntervalle = ouiNon === false;

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={CONSIGNE_GENERALE} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatFLatexAffichage(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={CONSIGNE_ECRAN_INJECTIVE} />
      </p>

      <div className="options-grid-compact">
        <button type="button" className={`btn${ouiNon === true ? " toggle-active" : ""}`} disabled={!!validation} onClick={() => setOuiNon(true)}>
          Oui
        </button>
        <button type="button" className={`btn${ouiNon === false ? " toggle-active" : ""}`} disabled={!!validation} onClick={() => setOuiNon(false)}>
          Non
        </button>
      </div>

      {ouiNon === false && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">
            <RenduFragments fragments={CONSIGNE_SOUS_QUESTION_INTERVALLE} />
          </p>
          <EnsembleReelGuideBuilder
            onChange={setIntervalle}
            onIllisible={setIllisible}
            label="x\in"
            erronee={statut !== null && statut.intervalleCorrect === false && intervalle === derniere?.intervalle}
            parseurNombre={evaluerValeurCyclometrique}
            disabled={!!validation}
          />
        </div>
      )}

      {aidesIntervalle ? (
        <AidesCyclo aide1={AIDE_INTERVALLE_1} aide2={aideIntervalle2(exercice)} niveauAide={niveauAide} />
      ) : (
        <AidesCyclo aide1={AIDE_INJECTIVE_1} aide2={aideInjective2(exercice)} niveauAide={niveauAide} />
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo
            blocage={retour.blocage}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={derniere !== null && derniere.intervalle !== null ? cibleIntervalle(exercice, derniere.intervalle) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
