import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";
import { QuestionFinale } from "../components/QuestionFinale";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatTermesDonneesLatex, questionFinaleEtudierFonction, texteAideNiveau1EtudierFonction, texteAideNiveau2EtudierFonction } from "../ui5e/formatEtudierFonction";
import { domaineAttendu } from "../moteur5e/verificationEtudierFonction";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceEtudierFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran "domaine" — uniquement présent si le domaine est restreint (voir
 * `moteur5e/typesEtudierFonction.ts`). Réutilise DIRECTEMENT `EnsembleReelGuideBuilder`, exactement
 * comme 5gen29 (`EtapeDomaineEtudeLocale.tsx`). Calculatrice ABSENTE (question structurelle). */
export function EtapeDomaineEtudierFonction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const montrerErreurs = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDIER_FONCTION}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <p className="prompt-text">{consigneEcranEtudierFonction("domaine")}</p>
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
          <p>{texteAideNiveau1EtudierFonction("domaine")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudierFonction("domaine")}</p>}
        </div>
      )}
    </div>
  );
}
