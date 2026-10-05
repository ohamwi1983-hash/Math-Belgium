import type { EcranLectureGraphiqueDerivees, ResultatExerciceLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { ordreEcransLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../moteur5e/verificationLectureGraphiqueDerivees";
import { LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES, formatEnteteColonnesTableauFPrime, formatEnteteColonnesTableauFSeconde, formatReponseAttenduePhaseLatex } from "../ui5e/formatLectureGraphiqueDerivees";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { LectureGraphiqueDeriveesGraph } from "./LectureGraphiqueDeriveesGraph";
import { TableauEtudeLocaleRecap } from "./TableauEtudeLocaleRecap";

interface Props {
  resultat: ResultatExerciceLectureGraphiqueDerivees;
  aideParPhase: Partial<Record<EcranLectureGraphiqueDerivees, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé, même patron
 * plat/coloré que les autres générateurs 5e. Le graphique lui-même sert de rappel visuel de
 * l'exercice (même choix que 5gen22) ; "tableauFPrime"/"tableauFSeconde" rendent le tableau étendu
 * en lecture seule (même choix que 5gen29). */
export function ResultatPanelLectureGraphiqueDerivees({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreEcransLectureGraphiqueDerivees(exercice);

  function statutPhase(phase: EcranLectureGraphiqueDerivees) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  function contenu(phase: EcranLectureGraphiqueDerivees) {
    if (phase === "tableauFPrime" || phase === "tableauFSeconde") {
      const mode = phase === "tableauFPrime" ? "fprime" : "fseconde";
      const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
      const enteteColonnes = mode === "fprime" ? formatEnteteColonnesTableauFPrime(exercice, attendu.colonnes) : formatEnteteColonnesTableauFSeconde(exercice, attendu.colonnes);
      return <TableauEtudeLocaleRecap colonnes={attendu.colonnes} enteteColonnes={enteteColonnes} mode={mode} attendu={attendu} />;
    }
    return (
      <span className="equation-box-termes">
        {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </span>
    );
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LectureGraphiqueDeriveesGraph exercice={exercice} />
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        return (
          <LigneRecap key={phase} label={LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES[phase]} statut={statutPhase(phase)}>
            {contenu(phase)}
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={phases
          .filter((phase) => resultat.scores[phase] !== undefined)
          .map((phase) => {
            const info = aideParPhase[phase];
            return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
          })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
