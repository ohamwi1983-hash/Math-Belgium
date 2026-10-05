import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { QuestionFinale } from "../components/QuestionFinale";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE_ETUDE_LOCALE, consigneEcranEtudeLocale, formatTermesDonneesLatex, questionFinaleEtudeLocale, texteAideNiveau1EtudeLocale, texteAideNiveau2EtudeLocale } from "../ui5e/formatEtudeLocale";
import { domaineAttendu } from "../moteur5e/verificationEtudeLocale";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEtudeLocale;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran "domaine" — UNIQUEMENT `rationnelleAvecCE` (domaine=ℝ sinon, écran sauté). Réutilise
 * DIRECTEMENT `EnsembleReelGuideBuilder` (Couche B↔B partagée 5e/6e), jamais réimplémenté.
 * Calculatrice ABSENTE (question symbolique/structurelle). */
export function EtapeDomaineEtudeLocale({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_LOCALE}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudeLocale(exercice)} />
      <p className="prompt-text">{consigneEcranEtudeLocale("domaine")}</p>
      <EnsembleReelGuideBuilder
        onValider={onValider}
        prefixApercu="domf ="
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        attendu={domaineAttendu(exercice)}
        apresEchec={montrerErreurs}
      />
      {montrerErreurs && (
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
