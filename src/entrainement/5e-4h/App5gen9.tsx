import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { genererExerciceParametresSinusoideGraphique } from "./generateurs5e/parametresSinusoideGraphique";
import {
  NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE,
  activerAideSuivante,
  demarrerSessionParametresSinusoideGraphique,
  soumettreReponseParametresSinusoideGraphique,
} from "./moteur5e/sessionParametresSinusoideGraphique";
import type {
  EtatSessionParametresSinusoideGraphique,
  ResultatExerciceParametresSinusoideGraphique,
} from "./moteur5e/typesParametresSinusoideGraphique";
import { EtapeParametreSinusoideGraphique } from "./components5e/EtapeParametreSinusoideGraphique";
import { ResultatPanelParametresSinusoideGraphique } from "./components5e/ResultatPanelParametresSinusoideGraphique";
import { ResumeSessionParametresSinusoideGraphique } from "./components5e/ResumeSessionParametresSinusoideGraphique";
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

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

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

type AideParPhase = Partial<Record<PhaseParametresSinusoideGraphique, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceParametresSinusoideGraphique;
  aideParPhase: AideParPhase;
}

export function App5gen9() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoideGraphique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoideGraphique) {
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Paramètres d'une fonction sinusoïdale — lecture graphique</h1>
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
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
              />
            </>
          )}
          {dernierBilan && (
            <ResultatPanelParametresSinusoideGraphique
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionParametresSinusoideGraphique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
