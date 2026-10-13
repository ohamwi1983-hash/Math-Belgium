import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { QuestionFinale } from "../components/QuestionFinale";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE_ETUDE_LOCALE, consigneEcranEtudeLocale, formatTermesDonneesLatex, questionFinaleEtudeLocale, texteAideNiveau1EtudeLocale, texteAideNiveau2EtudeLocale } from "../ui5e/formatEtudeLocale";
import { domaineAttendu } from "../moteur5e/verificationEtudeLocale";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEtudeLocale;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écran "domaine" — UNIQUEMENT `rationnelleAvecCE` (domaine=ℝ sinon, écran sauté). Réutilise
 * DIRECTEMENT `EnsembleReelGuideBuilder` (Couche B↔B partagée 5e/6e), jamais réimplémenté.
 * Calculatrice ABSENTE (question symbolique/structurelle). */
export function EtapeDomaineEtudeLocale({ exercice, estPremierEcran, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;

  return (
    <div>
      <EnTeteExercice
        estPremierEcran={estPremierEcran}
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_LOCALE}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinaleEtudeLocale(exercice)} />
      <p className="prompt-text">{consigneEcranEtudeLocale("domaine")}</p>
      <EnsembleReelGuideBuilder
        onValider={onValider}
        prefixApercu="domf ="
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        attendu={domaineAttendu(exercice)}
        apresEchec={montrerErreurs}
        validation={validation}
      />
      {!validation && montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1EtudeLocale("domaine")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudeLocale("domaine")}</p>}
        </div>
      )}
    </div>
  );
}
