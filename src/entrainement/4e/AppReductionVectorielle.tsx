import { useState } from "react";
import type { ExerciceReductionVectorielle } from "./core/reductionVectorielle.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionReductionVectorielle, soumettreReponseReduction } from "./moteur/sessionReductionVectorielle";
import type { EtatSessionReductionVectorielle, ResultatExerciceReductionVectorielle } from "./moteur/typesReductionVectorielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./generateurs/reductionVectorielle";
import type { FigureReduction } from "./core/reductionVectorielle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionVectorielle } from "./components/EtapeReductionVectorielle";
import { ResultatPanelReductionVectorielle } from "./components/ResultatPanelReductionVectorielle";
import { ResumeSessionReductionVectorielle } from "./components/ResumeSessionReductionVectorielle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionReductionVectorielle {
  return demarrerSessionReductionVectorielle(REGLAGES_DEMO, genererExerciceReductionVectorielle);
}

interface Bilan {
  resultat: ResultatExerciceReductionVectorielle;
  exercice: ExerciceReductionVectorielle;
}

export function AppReductionVectorielle() {
  const [etat, setEtat] = useState<EtatSessionReductionVectorielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceReductionVectorielle, nouvelEtat: EtatSessionReductionVectorielle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionReductionVectorielle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FigureReduction)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Réduction d'une somme de vecteurs (Chasles)</h1>
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
          <ResultatPanelReductionVectorielle
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionReductionVectorielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : (
          <EtapeReductionVectorielle
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseReduction(etat, texte));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
