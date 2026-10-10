import { useState } from "react";
import type { ExerciceTransformationGraphique } from "./core/transformationsGraphiques.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionTransformationGraphique, soumettreReponse } from "./moteur/sessionTransformationsGraphiques";
import type { EtatSessionTransformationGraphique, ResultatExerciceTransformationGraphique } from "./moteur/typesTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./generateurs/transformationsGraphiques";
import { EtapeTransformationExercice } from "./components/EtapeTransformationExercice";
import { ResultatPanelTransformationsGraphiques } from "./components/ResultatPanelTransformationsGraphiques";
import { ResumeSessionTransformationsGraphiques } from "./components/ResumeSessionTransformationsGraphiques";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTransformationGraphique {
  return demarrerSessionTransformationGraphique(REGLAGES_DEMO, genererExerciceTransformationGraphique);
}

interface Bilan {
  resultat: ResultatExerciceTransformationGraphique;
  exercice: ExerciceTransformationGraphique;
}

export function AppTransformationsGraphiques() {
  const [etat, setEtat] = useState<EtatSessionTransformationGraphique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceTransformationGraphique, nouvelEtat: EtatSessionTransformationGraphique) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Transformations graphiques d'une parabole</h1>
        <p className="app-subtitle">Chapitre 1</p>
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelTransformationsGraphiques
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionTransformationsGraphiques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : (
            <EtapeTransformationExercice
              exercice={etat.exerciceCourant}
              tentativesEquation={etat.etapeEquation.tentativesUtilisees}
              tentativesCurseurs={etat.etapeCurseurs.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              equationFermee={etat.etapeEquation.terminee}
              curseursFermee={etat.etapeCurseurs.terminee}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponse(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
