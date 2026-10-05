import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReponseTableauEtudeLocale } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { consigneEcran, consigneGenerale, formatEnteteColonnesTableauFPrime, formatEnteteColonnesTableauFSeconde, questionFinale, texteAideNiveau1 } from "../ui5e/formatLectureGraphiqueDerivees";
import { QuestionFinale } from "../components/QuestionFinale";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelLectureGraphiqueDerivees } from "./EtatActuelLectureGraphiqueDerivees";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: "tableauFPrime" | "tableauFSeconde";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauEtudeLocale) => void;
}

/** Écrans "tableauFPrime"/"tableauFSeconde" — réutilise TEL QUEL `TableauEtudeLocaleBuilder`
 * (5gen29) : racines/exclusions PRÉ-PLACÉES en en-tête (positions déjà connues, lues sur le
 * graphique — ici l'élève ne fait QUE cliquer pour cycler signe/variations, jamais de saisie de
 * position, contrairement à 5gen29 où l'élève RÉSOUT f'(x)=0). Aide TEXTUELLE (repli documenté,
 * voir `ui5e/formatLectureGraphiqueDerivees.ts::texteAideNiveau1`) — le mécanisme de cellule
 * active du tableau, générique/partagé avec 5gen29, n'expose aucun callback de focus exploitable
 * pour un surlignage visuel du graphique sans le modifier. */
export function EtapeTableauLectureGraphiqueDerivees({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  const enteteColonnes = mode === "fprime" ? formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes) : formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes);

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <LectureGraphiqueDeriveesGraph exercice={exercice} />
      <QuestionFinale question={questionFinale(exercice)} />
      <EtatActuelLectureGraphiqueDerivees exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigneEcran(phase)}</p>
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
          <p>{texteAideNiveau1(phase)}</p>
        </div>
      )}
    </div>
  );
}
