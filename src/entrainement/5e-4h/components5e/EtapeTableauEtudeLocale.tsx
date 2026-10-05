import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { ReponseTableauEtudeLocale } from "../moteur5e/verificationEtudeLocale";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationEtudeLocale";
import { CONSIGNE_GENERALE_ETUDE_LOCALE, consigneEcranEtudeLocale, formatEnteteColonnesTableau, formatTermesDonneesLatex, questionFinaleEtudeLocale, texteAideNiveau1EtudeLocale, texteAideNiveau2EtudeLocale } from "../ui5e/formatEtudeLocale";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeLocale } from "./EtatActuelEtudeLocale";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: "tableauFPrime" | "tableauFSeconde";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauEtudeLocale) => void;
}

/** Écrans "tableauFPrime"/"tableauFSeconde" — tableau de signes étendu (`TableauEtudeLocaleBuilder`),
 * racines/exclusions déjà pré-placées en en-tête (résolues à l'écran précédent). Calculatrice
 * ABSENTE (question purement structurelle/qualitative). */
export function EtapeTableauEtudeLocale({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  const enteteColonnes = formatEnteteColonnesTableau(exercice, attendu.colonnes, mode);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_LOCALE}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudeLocale(exercice)} />
      <EtatActuelEtudeLocale exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigneEcranEtudeLocale(phase)}</p>
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
          <p>{texteAideNiveau1EtudeLocale(phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudeLocale(phase)}</p>}
        </div>
      )}
    </div>
  );
}
