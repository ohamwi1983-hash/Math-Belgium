import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { genererExerciceConstructionParabole } from "./generateurs/constructionParabole";
import {
  NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE,
  activerAideSuivante,
  ciblesTraceConstructionParabole,
  demarrerSessionConstructionParabole,
  soumettreReponseConstruction,
  soumettreReponseTrace,
} from "./moteur/sessionConstructionParabole";
import type { EtatSessionConstructionParabole, ResultatExerciceConstructionParabole } from "./moteur/typesConstructionParabole";
import { EtapeConstructionParabole } from "./components/EtapeConstructionParabole";
import { EtapeTraceParabole } from "./components/EtapeTraceParabole";
import { ResultatPanelConstructionParabole } from "./components/ResultatPanelConstructionParabole";
import { ResumeSessionConstructionParabole } from "./components/ResumeSessionConstructionParabole";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionParabole {
  return demarrerSessionConstructionParabole(REGLAGES_DEMO, genererExerciceConstructionParabole);
}

interface Bilan {
  resultat: ResultatExerciceConstructionParabole;
}

function libellePhase(etat: EtatSessionConstructionParabole): string {
  if (etat.phase === "trace") return "Tracé final";
  return `Itération ${etat.iterationCourante + 1} / ${NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE}`;
}

export function AppConstructionParabole() {
  const [etat, setEtat] = useState<EtatSessionConstructionParabole>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionConstructionParabole) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]! });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction de la parabole au compas et à l'équerre</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{libellePhase(etat)}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelConstructionParabole
            resultat={dernierBilan.resultat}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionConstructionParabole resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "construction" ? (
          <EtapeConstructionParabole
            key={etat.iterationCourante}
            exercice={exercice}
            numeroIteration={etat.iterationCourante + 1}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            rDejaUtilises={etat.iterationsCompletes.map((iteration) => iteration.r)}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstruction(etat, reponse))}
          />
        ) : (
          <EtapeTraceParabole
            exercice={exercice}
            cibles={ciblesTraceConstructionParabole(etat)}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(selectionnes) => terminerEtape(soumettreReponseTrace(etat, selectionnes))}
          />
        )}
        </div>
      </main>
    </div>
  );
}
