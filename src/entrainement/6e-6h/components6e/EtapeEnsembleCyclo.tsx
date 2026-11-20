import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import { RenduFragments } from "../components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { EnTeteExercice } from "./EnTeteExercice";
import { AidesCyclo, MESSAGES_ILLISIBLE_CYCLO, MESSAGE_APPROCHEE_CYCLO, MessageRetourCyclo, useRetourCyclo } from "./RetourSaisieCyclo";
import type { AideCyclo } from "./RetourSaisieCyclo";

export type DiagnosticEnsembleCyclo = "correct" | "approchee" | "crochet" | "faux";

interface Props {
  consigneGenerale: ReactNode;
  blocDonnees: ReactNode;
  consigneEcran: FragmentConsigne[];
  /** Préfixe LaTeX de l'aperçu (« \\text{dom}\\,f= », « x\\in »…). */
  label: string;
  diagnostiquer: (reponse: EnsembleReelGuide) => DiagnosticEnsembleCyclo;
  cible?: (reponse: EnsembleReelGuide) => FragmentConsigne[] | null;
  aide1: AideCyclo;
  aide2: AideCyclo;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « ensemble » des générateurs 6gen1 et 6gen3 (domaine, image, CE, condition de
 * compatibilité) — règles communes du 6e ch. 1 (lot B) : borne illisible ou valeur approchée
 * (« 1,67 » pour 5/3, « 1,57 » pour π/2) signalée SANS tentative ; π, √, fractions et « − » lus ;
 * toute écriture équivalente acceptée (ℝ \ {2} ou ]−∞ ; 2[ ∪ ]2 ; +∞[) ; ±∞ toujours ouverts
 * (crochet verrouillé) ; message ciblé (crochet, sens de l'inégalité…) ; aides KaTeX à deux niveaux.
 */
export function EtapeEnsembleCyclo({
  consigneGenerale,
  blocDonnees,
  consigneEcran,
  label,
  diagnostiquer,
  cible,
  aide1,
  aide2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const [illisible, setIllisible] = useState(false);
  const retour = useRetourCyclo<EnsembleReelGuide>();
  const montrerErreurs = tentativesUtilisees > 0 && retour.soumise !== null;

  function valider() {
    if (illisible) return retour.tenter(reponse as EnsembleReelGuide, MESSAGES_ILLISIBLE_CYCLO.borne, onValider);
    if (reponse === null) return;
    retour.tenter(reponse, diagnostiquer(reponse) === "approchee" ? MESSAGE_APPROCHEE_CYCLO : null, onValider);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale} blocDonnees={blocDonnees} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <EnsembleReelGuideBuilder
        onChange={setReponse}
        onIllisible={setIllisible}
        label={label}
        erronee={montrerErreurs && reponse === retour.soumise}
        parseurNombre={evaluerValeurCyclometrique}
        disabled={!!validation}
      />
      <AidesCyclo aide1={aide1} aide2={aide2} niveauAide={niveauAide} />
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={reponse === null && !illisible} onClick={valider}>
            Valider
          </button>
          <MessageRetourCyclo blocage={retour.blocage} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={retour.soumise !== null && cible ? cible(retour.soumise) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
