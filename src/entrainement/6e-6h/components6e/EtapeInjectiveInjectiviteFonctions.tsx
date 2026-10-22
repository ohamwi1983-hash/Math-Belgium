import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ReponseInjective } from "../moteur6e/verificationInjectiviteFonctions";
import { diagnostiquerInjective } from "../moteur6e/verificationInjectiviteFonctions";
import {
  CONSIGNE_ECRAN_INJECTIVE,
  CONSIGNE_GENERALE,
  CONSIGNE_SOUS_QUESTION_INTERVALLE,
  TEXTE_AIDE_INTERVALLE_NIVEAU1,
  aideIntervalleNiveau2,
  aideOuiNonNiveau2,
  formatFLatexAffichage,
  texteAideOuiNonNiveau1,
} from "../ui6e/formatInjectiviteFonctions";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceInjectiviteFonctions;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseInjective) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — injective (Oui/Non) + sous-question "plus grand intervalle d'injectivité" révélée
 * (`.contenu-conditionnel`) dès que "Non" est sélectionné localement, quelle que soit la famille
 * (spec : la sous-question n'a de sens que si la vraie réponse est "Non", mais l'écran reste GUIDÉ
 * par le choix courant de l'élève, jamais par `exercice.injective` directement — un clic "Non"
 * révèle toujours le générateur d'intervalle, même sur une famille toujours injective, où
 * l'ensemble de la réponse sera de toute façon faux). Aides à 2 niveaux CHACUN (oui/non ET
 * intervalle) : le composant choisit quelle paire afficher selon `ouiNon` (jamais les deux en même
 * temps).
 */
export function EtapeInjectiveInjectiviteFonctions({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [ouiNon, setOuiNon] = useState<boolean | null>(null);
  const [intervalle, setIntervalle] = useState<EnsembleReelGuide | null>(null);
  const [derniereReponse, setDerniereReponse] = useState<ReponseInjective | null>(null);

  const complet = ouiNon !== null && (ouiNon === true || intervalle !== null);
  const montrerErreurs = tentativesUtilisees > 0 && derniereReponse !== null;
  const statut = montrerErreurs ? diagnostiquerInjective(exercice, derniereReponse as ReponseInjective) : null;

  function valider() {
    if (ouiNon === null) return;
    if (ouiNon === false && intervalle === null) return;
    const reponse: ReponseInjective = { ouiNon, intervalle: ouiNon ? null : intervalle };
    setDerniereReponse(reponse);
    onValider(reponse);
  }

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
        <button
          type="button"
          className={`btn${ouiNon === true ? " toggle-active" : ""}${statut && ouiNon === true && !statut.ouiNonCorrect ? " is-erronee" : ""}`}
          onClick={() => setOuiNon(true)}
        >
          Oui
        </button>
        <button
          type="button"
          className={`btn${ouiNon === false ? " toggle-active" : ""}${statut && ouiNon === false && !statut.ouiNonCorrect ? " is-erronee" : ""}`}
          onClick={() => setOuiNon(false)}
        >
          Non
        </button>
      </div>

      {ouiNon === false && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">
            <RenduFragments fragments={CONSIGNE_SOUS_QUESTION_INTERVALLE} />
          </p>
          <EnsembleReelGuideBuilder onChange={setIntervalle} label="x\in" erronee={statut !== null && statut.intervalleCorrect === false} />
        </div>
      )}

      {niveauAide >= 1 && ouiNon !== false && (
        <div className="aide-5e">
          <p>{texteAideOuiNonNiveau1(exercice)}</p>
          {niveauAide >= 2 &&
            (() => {
              const aide2 = aideOuiNonNiveau2(exercice);
              return (
                <>
                  <p>{aide2.texte}</p>
                  {aide2.latex && <Katex expression={aide2.latex} block />}
                </>
              );
            })()}
        </div>
      )}
      {niveauAide >= 1 && ouiNon === false && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_INTERVALLE_NIVEAU1}</p>
          {niveauAide >= 2 &&
            (() => {
              const aide2 = aideIntervalleNiveau2(exercice);
              return (
                <>
                  <p>{aide2.texte}</p>
                  {aide2.latex && <Katex expression={aide2.latex} block />}
                </>
              );
            })()}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && !statut?.global && (
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
