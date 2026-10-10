import { useState } from "react";
import type { ExercicePointVectoriel } from "./core/pointVectoriel.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionPointVectoriel, soumettreReponseCoordonnees } from "./moteur/sessionPointVectoriel";
import type { EtatSessionPointVectoriel, ResultatExercicePointVectoriel } from "./moteur/typesPointVectoriel";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePointVectoriel } from "./generateurs/pointVectoriel";
import type { VariantePointVectoriel } from "./core/pointVectoriel.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapePointVectoriel } from "./components/EtapePointVectoriel";
import { ResultatPanelPointVectoriel } from "./components/ResultatPanelPointVectoriel";
import { ResumeSessionPointVectoriel } from "./components/ResumeSessionPointVectoriel";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPointVectoriel {
  return demarrerSessionPointVectoriel(REGLAGES_DEMO, genererExercicePointVectoriel);
}

interface Bilan {
  resultat: ResultatExercicePointVectoriel;
  exercice: ExercicePointVectoriel;
}

export function AppPointVectoriel() {
  const [etat, setEtat] = useState<EtatSessionPointVectoriel>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExercicePointVectoriel, nouvelEtat: EtatSessionPointVectoriel) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionPointVectoriel(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VariantePointVectoriel)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Point à partir d'une relation vectorielle (libre)</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
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
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelPointVectoriel
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionPointVectoriel resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : (
          <EtapePointVectoriel
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseCoordonnees(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
