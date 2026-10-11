import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { construireAvecRegime, genererExerciceSuiteRecurrenteAffine } from "./generateurs5e/suiteRecurrenteAffine";
import type { RegimeSuiteRecurrenteAffine } from "./core5e/suiteRecurrenteAffine.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";

const OPTIONS_REGIME = [
  { id: "convergent", label: "Convergente (|a| < 1)" },
  { id: "divergent", label: "Divergente (|a| ≥ 1)" },
];
import {
  niveauAideMaxSuiteRecurrenteAffine,
  activerAideSuivante,
  demarrerSessionSuiteRecurrenteAffine,
  soumettreReponsePoserRecurrence,
  soumettreReponseRegimePermanent,
  soumettreReponseTermesSuccessifs,
} from "./moteur5e/sessionSuiteRecurrenteAffine";
import type { EtatSessionSuiteRecurrenteAffine, PhaseSuiteRecurrenteAffine } from "./moteur5e/typesSuiteRecurrenteAffine";
import {
  diagnostiquerPoserRecurrence,
  diagnostiquerRegimePermanent,
  diagnostiquerTermesSuccessifs,
} from "./moteur5e/verificationSuiteRecurrenteAffine";
import { EtapePoserRecurrence } from "./components5e/EtapePoserRecurrence";
import { EtapeRegimePermanent } from "./components5e/EtapeRegimePermanent";
import { EtapeTermesSuccessifs } from "./components5e/EtapeTermesSuccessifs";
import { CalculatriceScientifique } from "./components5e/CalculatriceScientifique";
import { formatReponseAttenduePhaseLatex } from "./ui5e/formatSuiteRecurrenteAffine";
import { calculerRecapitulatifSuiteRecurrenteAffine } from "./ui5e/recapitulatifSuiteRecurrenteAffine";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionSuiteRecurrenteAffine {
  return demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, genererExerciceSuiteRecurrenteAffine);
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionSuiteRecurrenteAffine;
  revele: boolean;
}

/** Séquence RÉELLE identique à `moteur5e/typesSuiteRecurrenteAffine.ts` (`phaseInitiale`/
 * `phaseApres`) — ORDRE_PHASES statique, comme `AppAnalyseFonction.tsx` (4e), puisque cette
 * séquence à 3 écrans est FIXE pour les 2 régimes (jamais de saut). "termesSuccessifs" (dernière
 * phase) n'a pas de branche "close" propre : tant que l'exercice n'est pas terminé elle est
 * forcément "courante", et une fois terminé un nouvel exercice démarre (même convention que
 * "tableauSignes" dans `AppAnalyseFonction.tsx`). */
const ORDRE_PHASES: PhaseSuiteRecurrenteAffine[] = ["poserRecurrence", "regimePermanent", "termesSuccessifs"];

function calculerSegmentsProgression(etat: EtatSessionSuiteRecurrenteAffine): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "poserRecurrence" ? etat.scorePoserRecurrencePartiel : phase === "regimePermanent" ? etat.scoreRegimePermanentPartiel : null;
    if (score === null) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen19() {
  const [etat, setEtat] = useState<EtatSessionSuiteRecurrenteAffine>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionSuiteRecurrenteAffine) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionSuiteRecurrenteAffine(REGLAGES_DEMO, () => construireAvecRegime(id as RegimeSuiteRecurrenteAffine)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, etat.phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Suite récurrente affine et régime permanent</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={OPTIONS_REGIME} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifSuiteRecurrenteAffine(etat)} />
          <>
              {etat.phase === "poserRecurrence" && (
                <EtapePoserRecurrence
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponsePoserRecurrence(etat, texte))}
                  diagnostiquer={(texte) => diagnostiquerPoserRecurrence(texte, exercice)}
                  validation={validation}
                />
              )}

              {etat.phase === "regimePermanent" && (
                <EtapeRegimePermanent
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseRegimePermanent(etat, reponse))}
                  diagnostiquer={(reponse) => diagnostiquerRegimePermanent(reponse, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "regimePermanent" && <CalculatriceScientifique />}

              {etat.phase === "termesSuccessifs" && (
                <EtapeTermesSuccessifs
                  key={cleEcran}
                  exercice={exercice}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={etat.niveauAide}
                  niveauAideMax={niveauAideMaxSuiteRecurrenteAffine(etat.phase)}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(textes) => terminerEtape(soumettreReponseTermesSuccessifs(etat, textes))}
                  diagnostiquer={(textes) => diagnostiquerTermesSuccessifs(textes, exercice)}
                  validation={validation}
                />
              )}
              {etat.phase === "termesSuccessifs" && <CalculatriceScientifique />}
            </>
        </div>
      </main>
    </div>
  );
}
