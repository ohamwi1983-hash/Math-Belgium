import type { ExerciceSuiteClassique } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique, ResultatExerciceSuiteClassique } from "../moteur5e/typesSuiteClassique";
import { ordreComplet } from "../moteur5e/typesSuiteClassique";
import { LIBELLE_PHASE_SUITE_CLASSIQUE, formatTermesDonneesLatex, formatTermesReponseAttendueLatex, formatTermesSuitesFinalesLatex, texteReponseAttendueQCM } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceSuiteClassique;
  aideParPhase: Partial<Record<PhaseSuiteClassique, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1) et `ResultatPanelSuiteArithmetique.tsx` (5gen14) : une `LigneRecap` PAR PHASE RÉELLEMENT
 * TRAVERSÉE (`ordreComplet(exercice)` — toujours la séquence COMPLÈTE du scénario tiré ici, aucune
 * instance de ce générateur n'étant aléatoire, contrairement à 5gen1/5gen5/5gen12), contenant la
 * réponse ATTENDUE — jamais un score fractionnaire `X/100`.
 *
 * Coloriée via `statutRecap` (`LigneRecap.tsx`) à partir de `aideParPhase` — capturé côté
 * `App5gen17.tsx` au moment précis où chaque écran se ferme (`etat.niveauAide`/
 * `etat.etapeCourante.revelee` AVANT la transition), jamais reconstruit depuis le score déjà
 * pénalisé.
 */
function ContenuLigneRecap({ exercice, phase }: { exercice: ExerciceSuiteClassique; phase: PhaseSuiteClassique }) {
  if (phase === "suitesFinalesCombinees" && exercice.scenario === "suitesCombinees") {
    const { arithmetique, geometrique } = formatTermesSuitesFinalesLatex(exercice);
    return (
      // Fragment, jamais un <span> englobant : les 2 lignes ci-dessous sont des `<div>` (contenu de
      // flux), invalides comme descendants d'un `<span>` (contenu de phrase seulement) — même classe
      // de défaut de nesting DOM déjà trouvée et corrigée une fois par Playwright sur ce chantier
      // (`<table>` dans un `<p>`, voir CLAUDE.md).
      <>
        <div className="equation-box-termes">
          <em>Arithmétique :</em>
          {arithmetique.map((t, i) => (
            <Katex key={`a${i}`} expression={t} />
          ))}
        </div>
        <div className="equation-box-termes">
          <em>Géométrique :</em>
          {geometrique.map((t, i) => (
            <Katex key={`g${i}`} expression={t} />
          ))}
        </div>
      </>
    );
  }

  const termes = formatTermesReponseAttendueLatex(exercice, phase);
  if (termes !== null) {
    return (
      <span className="equation-box-termes">
        {termes.map((t, i) => (
          <Katex key={i} expression={t} />
        ))}
      </span>
    );
  }

  const labelQCM = texteReponseAttendueQCM(exercice, phase);
  return labelQCM === null ? null : (
    <span>
      <Katex expression={labelQCM} />
    </span>
  );
}

export function ResultatPanelSuiteClassique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice, phases[0]).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_SUITE_CLASSIQUE[phase]} statut={statut}>
            <ContenuLigneRecap exercice={exercice} phase={phase} />
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
