import { useState } from "react";
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
import { formatChampParametreGraphiqueLatex } from "./ui5e/formatParametresSinusoideGraphique";
import { Katex } from "./components/Katex";
import type { PhaseParametresSinusoideGraphique } from "./moteur5e/typesParametresSinusoideGraphique";
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

export function App5gen9() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoideGraphique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoideGraphique) {
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
      </header>
      <main className="card">
        <div className="card-body">
          <EtapeParametreSinusoideGraphique
            key={etat.phase}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseParametresSinusoideGraphique(etat, texte))}
            diagnostiquer={(texte) => diagnostiquerReponsePourPhase(exercice, etat.phase, texte)}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
