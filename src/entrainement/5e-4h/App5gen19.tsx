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
import { consigneGenerale, formatReponseAttenduePhaseLatex } from "./ui5e/formatSuiteRecurrenteAffine";
import { EnTeteExercice } from "./components5e/EnTeteExercice";
import { calculerRecapitulatifSuiteRecurrenteAffine } from "./ui5e/recapitulatifSuiteRecurrenteAffine";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

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

function calculerSegmentsProgression(
  etat: EtatSessionSuiteRecurrenteAffine,
  aideUtiliseeParPhase: Partial<Record<PhaseSuiteRecurrenteAffine, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score = phase === "poserRecurrence" ? etat.scorePoserRecurrencePartiel : phase === "regimePermanent" ? etat.scoreRegimePermanentPartiel : null;
    if (score === null) return "a-venir";
    const revele = phase === "poserRecurrence" ? etat.poserRecurrenceRevele : phase === "regimePermanent" ? etat.regimePermanentRevele : false;
    if (revele) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

function formatReponseRegimePermanent(reponse: { existe: boolean; L: string }): string {
  return reponse.existe ? `L = ${reponse.L}` : "N'existe pas";
}

export function App5gen19() {
  const [etat, setEtat] = useState<EtatSessionSuiteRecurrenteAffine>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionSuiteRecurrenteAffine`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Capture locale de `etat.niveauAide > 0` pour chaque phase CLOSE — le moteur remet
   * `niveauAide` à 0 à chaque transition de phase (même mécanique que les autres générateurs de
   * ce chantier). */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseSuiteRecurrenteAffine, boolean>>>({});

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * RÉELLEMENT (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde
   * qu'`AppAnalyseFonction.tsx`). Réutilise `calculerRecapitulatifSuiteRecurrenteAffine` pour la
   * réponse ATTENDUE. Jamais appelée pour "termesSuccessifs" (dernière phase, jamais visible comme
   * puce close avant la fin de l'exercice — voir `calculerSegmentsProgression`). */
  function terminerEtape(nouvelEtat: EtatSessionSuiteRecurrenteAffine, votreReponse?: string) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereEtapeRevelee;
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        const recap = calculerRecapitulatifSuiteRecurrenteAffine(nouvelEtat);
        const derniere = recap[recap.length - 1];
        if (derniere) {
          setHistorique((h) => [
            ...h,
            {
              titre: derniere.libelle,
              votreReponse,
              correcte: !derniere.revele,
              reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
            },
          ]);
        }
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={OPTIONS_REGIME} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigneGenerale(exercice)} blocDonnees={null} />
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
                  onValider={(texte) => terminerEtape(soumettreReponsePoserRecurrence(etat, texte), texte)}
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
                  onValider={(reponse) => terminerEtape(soumettreReponseRegimePermanent(etat, reponse), formatReponseRegimePermanent(reponse))}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
