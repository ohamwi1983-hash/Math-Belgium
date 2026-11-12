import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReponseTableauEtudeLocale } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { consigneEcran, consigneGenerale, formatEnteteColonnesTableauFPrime, formatEnteteColonnesTableauFSeconde, questionFinale, texteAideNiveau1 } from "../ui5e/formatLectureGraphiqueDerivees";
import { QuestionFinale } from "../components/QuestionFinale";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { TableauEtudeLocaleBuilder } from "./TableauEtudeLocaleBuilder";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: "tableauFPrime" | "tableauFSeconde";
  tentativesUtilisees: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauEtudeLocale) => void;
  validation?: ValidationEtapeProps | null;
}

/** Écrans « tableau de f' » / « tableau de f'' » — `TableauEtudeLocaleBuilder` (5gen29). Les colonnes
 * sont les points validés à l'écran précédent (tangentes horizontales, resp. points d'inflexion) et
 * les AV ; l'élève choisit signes, variations ou concavité. Choix fermés : UNE seule tentative
 * (sinon les cellules marquées en rouge se corrigeraient par élimination). */
export function EtapeTableauLectureGraphiqueDerivees({ exercice, phase, tentativesUtilisees, niveauAide, niveauAideMax, onActiverAide, onValider, validation }: Props) {
  const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  const enteteColonnes = mode === "fprime" ? formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes) : formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes);

  return (
    <div>
      <EnTeteExercice consigneGenerale={consigneGenerale()} blocDonnees={<LectureGraphiqueDeriveesGraph exercice={exercice} />} />
      <QuestionFinale question={questionFinale(exercice)} />
      <p className="prompt-text">{consigneEcran(phase)}</p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(phase)}</p>
        </div>
      )}
      <TableauEtudeLocaleBuilder
        colonnes={attendu.colonnes}
        enteteColonnes={enteteColonnes}
        mode={mode}
        attendu={attendu}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={1}
        onValider={onValider}
        contenuAvantValider={<BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />}
        validation={validation}
      />
    </div>
  );
}
