import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { ReponseTableauEtudierFonction } from "../moteur5e/verificationEtudierFonction";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudierFonction";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatEnteteColonnesTableauEtudierFonction, formatTermesDonneesLatex, questionFinaleEtudierFonction } from "../ui5e/formatEtudierFonction";
import { aidesEtudierFonction } from "../ui5e/retoursEtudierFonction";
import { AidesTrig } from "./RetourSaisieTrig";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: "tableauFPrime" | "tableauFSeconde";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauEtudierFonction) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écrans "tableauFPrime"/"tableauFSeconde" — réutilise TEL QUEL `TableauEtudeLocaleBuilder`
 * (5gen29, générique dans son contrat — `colonnes`/`enteteColonnes`/`mode`/`attendu`, aucune
 * dépendance à `ExerciceEtudeLocale`), racines/exclusions déjà connues à la génération (pré-placées
 * en en-tête, jamais résolues par l'élève dans CE générateur — voir tête de fichier de
 * `typesEtudierFonction.ts`). Calculatrice ABSENTE (question structurelle). Choix fermés : UNE seule
 * tentative (le moteur clôt l'écran ; sinon les cellules marquées se corrigeraient par élimination). */
export function EtapeTableauEtudierFonction({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  const enteteColonnes = formatEnteteColonnesTableauEtudierFonction(exercice, attendu.colonnes, mode);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDIER_FONCTION}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <p className="prompt-text">{consigneEcranEtudierFonction(phase)}</p>
      <AidesTrig niveauAide={niveauAide} aides={aidesEtudierFonction(exercice, phase)} />
      <TableauEtudeLocaleBuilder
        colonnes={attendu.colonnes}
        enteteColonnes={enteteColonnes}
        mode={mode}
        attendu={attendu}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={Math.min(1, tentativesMax)}
        onValider={onValider}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        validation={validation}
      />
    </div>
  );
}
