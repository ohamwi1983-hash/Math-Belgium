import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { ReponseTableauEtudierFonction } from "../moteur5e/verificationEtudierFonction";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudierFonction";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatEnteteColonnesTableauEtudierFonction, formatTermesDonneesLatex, questionFinaleEtudierFonction, texteAideNiveau1EtudierFonction, texteAideNiveau2EtudierFonction } from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudierFonction } from "./EtatActuelEtudierFonction";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: "tableauFPrime" | "tableauFSeconde";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauEtudierFonction) => void;
}

/** Écrans "tableauFPrime"/"tableauFSeconde" — réutilise TEL QUEL `TableauEtudeLocaleBuilder`
 * (5gen29, générique dans son contrat — `colonnes`/`enteteColonnes`/`mode`/`attendu`, aucune
 * dépendance à `ExerciceEtudeLocale`), racines/exclusions déjà connues à la génération (pré-placées
 * en en-tête, jamais résolues par l'élève dans CE générateur — voir tête de fichier de
 * `typesEtudierFonction.ts`). Calculatrice ABSENTE (question structurelle). */
export function EtapeTableauEtudierFonction({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  const enteteColonnes = formatEnteteColonnesTableauEtudierFonction(exercice, attendu.colonnes, mode);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDIER_FONCTION}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <EtatActuelEtudierFonction exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigneEcranEtudierFonction(phase)}</p>
      <TableauEtudeLocaleBuilder
        colonnes={attendu.colonnes}
        enteteColonnes={enteteColonnes}
        mode={mode}
        attendu={attendu}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        onValider={onValider}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
      />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1EtudierFonction(phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudierFonction(phase)}</p>}
        </div>
      )}
    </div>
  );
}
