import type { PhaseSuiteGeometrique, ResultatExerciceSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import { ordreComplet } from "../moteur5e/typesSuiteGeometrique";
import { LIBELLE_PHASE_SUITE_GEOMETRIQUE, formatTermesDonneesLatex, formatTermesReponseAttendueSuiteGeometrique } from "../ui5e/formatSuiteGeometrique";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceSuiteGeometrique;
  aideParPhase: Partial<Record<PhaseSuiteGeometrique, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste À PLAT (jamais de score fractionnaire par écran, "X/100"), dans
 * l'ordre RÉEL des écrans traversés par cette instance (`ordreComplet`, y compris le doublement
 * B1/B2 quand `statutQ==="double"` — chaque occurrence a déjà son propre libellé distinct, voir
 * `LIBELLE_PHASE_SUITE_GEOMETRIQUE`, ex. "Formule générale uₙ (1ère suite)"/"...(2e suite)"). Chaque
 * ligne affiche la réponse RÉELLEMENT attendue (`formatTermesReponseAttendueSuiteGeometrique`),
 * coloriée via `statutRecap` (`LigneRecap.tsx`) à partir de `aideParPhase` — capturé côté
 * `App5gen15.tsx` au moment précis où chaque écran se ferme (`etat.niveauAide`/
 * `etat.etapeCourante.revelee` AVANT la transition), jamais reconstruit depuis le score déjà
 * pénalisé (qui ne permet pas de distinguer une tentative ratée sans aide d'une aide effectivement
 * utilisée).
 */
export function ResultatPanelSuiteGeometrique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const termes = formatTermesReponseAttendueSuiteGeometrique(exercice, phase);
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_SUITE_GEOMETRIQUE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {termes.map((t, i) => (
                <Katex key={i} expression={t} />
              ))}
            </span>
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
