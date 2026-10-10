import { useState } from "react";
import type { ExerciceDispersion } from "./core/dispersion.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionDispersion,
  soumettreReponseTableau,
  soumettreReponseVarianceEcartType,
} from "./moteur/sessionDispersion";
import type { EtatSessionDispersion, PhaseDispersion, ResultatExerciceDispersion } from "./moteur/typesDispersion";
import { genererExerciceDispersion } from "./generateurs/dispersion";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeTableauDispersion } from "./components/EtapeTableauDispersion";
import { EtapeVarianceEcartTypeDispersion } from "./components/EtapeVarianceEcartTypeDispersion";
import { ResultatPanelDispersion } from "./components/ResultatPanelDispersion";
import { ResumeSessionDispersion } from "./components/ResumeSessionDispersion";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDispersion {
  return demarrerSessionDispersion(REGLAGES_DEMO, genererExerciceDispersion);
}

interface Bilan {
  resultat: ResultatExerciceDispersion;
  exercice: ExerciceDispersion;
}

const LIBELLE_PHASE: Record<PhaseDispersion, string> = {
  tableau: "Tableau et sommes intermédiaires",
  varianceEcartType: "Variance et écart-type",
};

export function AppDispersion() {
  const [etat, setEtat] = useState<EtatSessionDispersion>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceDispersion, nouvelEtat: EtatSessionDispersion) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Paramètres de dispersion</h1>
        <p className="app-subtitle">Chapitre 5</p>
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}

        <div className="card-body">
          {enCoursDeSession && etat.phase === "varianceEcartType" && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelDispersion
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionDispersion resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "tableau" ? (
            <EtapeTableauDispersion
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideTableau}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseTableau(etat, reponse))}
            />
          ) : (
            <EtapeVarianceEcartTypeDispersion
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideVarianceEcartType}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseVarianceEcartType(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
