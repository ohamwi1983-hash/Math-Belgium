import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./generateurs5e/parametresSinusoide";
import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "./core5e/parametresSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_SINUSOIDE,
  activerAideSuivante,
  demarrerSessionParametresSinusoide,
  soumettreReponseParametresSinusoide,
} from "./moteur5e/sessionParametresSinusoide";
import type { EtatSessionParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import { EtapeParametreSinusoide } from "./components5e/EtapeParametreSinusoide";
import { formatChampParametreLatex } from "./ui5e/formatParametresSinusoide";
import { Katex } from "./components/Katex";
import type { PhaseParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import {
  cibleAmplitude,
  cibleDecalage,
  cibleDephasage,
  cibleFrequence,
  ciblePeriode,
  diagnostiquerValeurSinusoide,
} from "./moteur5e/verificationParametresSinusoide";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionParametresSinusoide {
  return demarrerSessionParametresSinusoide(REGLAGES_DEMO, genererExerciceParametresSinusoide);
}

/** Réplique le dispatch `cibleActuelle` (privé, `moteur5e/sessionParametresSinusoide.ts`) — même
 * phase→cible que le score, uniquement pour alimenter `diagnostiquerValeurSinusoide` côté A.1
 * (promptcorrectionsregroupees.md), jamais une nouvelle logique de vérification. */
function cibleActuellePourDiagnostic(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): number {
  switch (phase) {
    case "amplitude":
      return cibleAmplitude(exercice);
    case "phi":
      return cibleDephasage(exercice);
    case "periode":
      return ciblePeriode(exercice);
    case "frequence":
      return cibleFrequence(exercice);
    case "decalage":
      return cibleDecalage(exercice);
  }
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionParametresSinusoide;
  revele: boolean;
}

export function App5gen8() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoide>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoide) {
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
    setEtat(demarrerSessionParametresSinusoide(REGLAGES_DEMO, () => construireAvecFormeId(id as FormeAffichageSinusoide)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={formatChampParametreLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Paramètres d'une fonction sinusoïdale</h1>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FORMES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EtapeParametreSinusoide
            key={etat.phase}
            exercice={exercice}
            phase={etat.phase}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX_SINUSOIDE}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte) => terminerEtape(soumettreReponseParametresSinusoide(etat, texte))}
            diagnostiquer={(texte) => diagnostiquerValeurSinusoide(texte, cibleActuellePourDiagnostic(exercice, etat.phase))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
