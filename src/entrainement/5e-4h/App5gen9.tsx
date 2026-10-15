import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceParametresSinusoideGraphique } from "./generateurs5e/parametresSinusoideGraphique";
import {
  NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE,
  activerAideSuivante,
  demarrerSessionParametresSinusoideGraphique,
  soumettreReponseParametresSinusoideGraphique,
} from "./moteur5e/sessionParametresSinusoideGraphique";
import type { EtatSessionParametresSinusoideGraphique } from "./moteur5e/typesParametresSinusoideGraphique";
import { EtapeParametreSinusoideGraphique } from "./components5e/EtapeParametreSinusoideGraphique";
import { formatChampParametreGraphiqueLatex, labelPhase } from "./ui5e/formatParametresSinusoideGraphique";
import { Katex } from "./components/Katex";
import type { PhaseParametresSinusoideGraphique } from "./moteur5e/typesParametresSinusoideGraphique";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE } from "./moteur5e/typesParametresSinusoideGraphique";
import type { ExerciceParametresSinusoideGraphique } from "./core5e/parametresSinusoideGraphique.types";
import type { StatutVerification } from "./moteur/statutVerification";
import {
  cibleAmplitude,
  cibleAscendantPrincipal,
  cibleDecalage,
  cibleFrequence,
  ciblePeriode,
  diagnostiquerPhiModuloT,
  diagnostiquerValeurSinusoide,
} from "./moteur5e/verificationParametresSinusoideGraphique";
import { calculerRecapitulatifParametresSinusoideGraphique } from "./ui5e/recapitulatifParametresSinusoideGraphique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionParametresSinusoideGraphique {
  return demarrerSessionParametresSinusoideGraphique(REGLAGES_DEMO, genererExerciceParametresSinusoideGraphique);
}

/** Réplique le dispatch `verifierReponse` (privé, `moteur5e/sessionParametresSinusoideGraphique.ts`)
 * — même phase→cible que le score, uniquement pour alimenter les fonctions `diagnostiquerXxx` déjà
 * existantes côté A.1 (promptcorrectionsregroupees.md), jamais une nouvelle logique de vérification. */
function diagnostiquerReponsePourPhase(
  exercice: ExerciceParametresSinusoideGraphique,
  phase: PhaseParametresSinusoideGraphique,
  texte: string,
): StatutVerification {
  switch (phase) {
    case "decalage":
      return diagnostiquerValeurSinusoide(texte, cibleDecalage(exercice));
    case "amplitude":
      return diagnostiquerValeurSinusoide(texte, cibleAmplitude(exercice));
    case "periode":
      return diagnostiquerValeurSinusoide(texte, ciblePeriode(exercice));
    case "frequence":
      return diagnostiquerValeurSinusoide(texte, cibleFrequence(exercice));
    case "phi":
      return diagnostiquerPhiModuloT(texte, cibleAscendantPrincipal(exercice), ciblePeriode(exercice));
  }
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionParametresSinusoideGraphique;
  revele: boolean;
}

/** Même ternaire que `calculerRecapitulatifParametresSinusoideGraphique` (`scoreXxxPartiel === 0 ⟺
 * révélée`) — `phi` (dernière phase) n'a pas de champ `scorePhiPartiel` : forcément "courante" tant
 * que l'exercice n'est pas terminé (dernière phase active). */
function calculerSegmentsProgression(
  etat: EtatSessionParametresSinusoideGraphique,
  aideUtiliseeParPhase: Partial<Record<string, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "decalage"
        ? etat.scoreDecalagePartiel
        : phase === "amplitude"
          ? etat.scoreAmplitudePartiel
          : phase === "periode"
            ? etat.scorePeriodePartiel
            : phase === "frequence"
              ? etat.scoreFrequencePartiel
              : null;
    if (score === null) return "a-venir";
    if (score === 0) return "revele";
    return aideUtiliseeParPhase[phase] ? "aide" : "correcte";
  });
}

export function App5gen9() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoideGraphique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des phases déjà closes (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionParametresSinusoideGraphique`, jamais dans le moteur. Remis à
   * vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<string, boolean>>>({});

  /** Réutilise `calculerRecapitulatifParametresSinusoideGraphique` pour la réponse ATTENDUE : la
   * phase qui vient de se clore est toujours la DERNIÈRE entrée du tableau. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionParametresSinusoideGraphique) {
    const recap = calculerRecapitulatifParametresSinusoideGraphique(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      { titre: derniere.libelle, votreReponse, correcte: !derniere.revele, reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT poussée dans l'historique quand la phase se clôt RÉELLEMENT (même
   * garde `transitionDEcran` que celui qui déclenche déjà `setEnAttente`), et JAMAIS pour "phi"
   * (dernière phase, jamais "close" au sens de `calculerRecapitulatifParametresSinusoideGraphique`
   * non plus) — détectée dynamiquement via `nouvelEtat.resultats.length > etat.resultats.length`. */
  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoideGraphique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: etat.niveauAide > 0 }));
      const exerciceTermine = nouvelEtat.resultats.length > etat.resultats.length;
      if (!exerciceTermine && votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
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
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatChampParametreGraphiqueLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Paramètres d'une fonction sinusoïdale — lecture graphique</h1>
        <ProgressionPuces
          segments={calculerSegmentsProgression(etat, aideUtiliseeParPhase)}
          onSegmentClick={(index) => setFicheOuverteIndex(index)}
        />
      </header>
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifParametresSinusoideGraphique(etat)} />
          <EtapeParametreSinusoideGraphique
            key={etat.phase}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseParametresSinusoideGraphique(etat, texte), `${labelPhase(etat.phase)} ${texte}`)}
            diagnostiquer={(texte) => diagnostiquerReponsePourPhase(exercice, etat.phase, texte)}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
