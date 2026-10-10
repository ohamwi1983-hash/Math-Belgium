import { useState } from "react";
import type { ExerciceConstructionVectorielle } from "./core/constructionVectorielle.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionConstructionVectorielle, soumettreReponseConstruction } from "./moteur/sessionConstructionVectorielle";
import type { EtatSessionConstructionVectorielle, ResultatExerciceConstructionVectorielle } from "./moteur/typesConstructionVectorielle";
import { genererExerciceConstructionVectorielle } from "./generateurs/constructionVectorielle";
import { EtapeConstructionVectorielle } from "./components/EtapeConstructionVectorielle";
import { ResultatPanelConstructionVectorielle } from "./components/ResultatPanelConstructionVectorielle";
import { ResumeSessionConstructionVectorielle } from "./components/ResumeSessionConstructionVectorielle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionVectorielle {
  return demarrerSessionConstructionVectorielle(REGLAGES_DEMO, genererExerciceConstructionVectorielle);
}

interface Bilan {
  resultat: ResultatExerciceConstructionVectorielle;
  exercice: ExerciceConstructionVectorielle;
}

export function AppConstructionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionConstructionVectorielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceConstructionVectorielle, nouvelEtat: EtatSessionConstructionVectorielle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }


  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction graphique de vecteurs</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelConstructionVectorielle
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionConstructionVectorielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : (
          <EtapeConstructionVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseConstruction(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
