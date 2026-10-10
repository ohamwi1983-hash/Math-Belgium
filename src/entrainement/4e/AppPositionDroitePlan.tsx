import { useState } from "react";
import type { ExercicePositionDroitePlan } from "./core/positionDroitePlan.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionPositionDroitePlan, soumettreReponseClassification, soumettreReponseJustification } from "./moteur/sessionPositionDroitePlan";
import type { EtatSessionPositionDroitePlan, PhasePositionDroitePlan, ResultatExercicePositionDroitePlan } from "./moteur/typesPositionDroitePlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePositionDroitePlan } from "./generateurs/positionDroitePlan";
import type { ConclusionPositionDroitePlan } from "./core/positionDroitePlan.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassificationPositionDroitePlan } from "./components/EtapeClassificationPositionDroitePlan";
import { EtapeJustificationPositionDroitePlan } from "./components/EtapeJustificationPositionDroitePlan";
import { ResultatPanelPositionDroitePlan } from "./components/ResultatPanelPositionDroitePlan";
import { ResumeSessionPositionDroitePlan } from "./components/ResumeSessionPositionDroitePlan";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionPositionDroitePlan {
  return demarrerSessionPositionDroitePlan(REGLAGES_DEMO, genererExercicePositionDroitePlan);
}

interface Bilan {
  resultat: ResultatExercicePositionDroitePlan;
  exercice: ExercicePositionDroitePlan;
}

const LIBELLE_PHASE: Record<PhasePositionDroitePlan, string> = {
  classification: "Classification",
  justification: "Justification",
};

export function AppPositionDroitePlan() {
  const [etat, setEtat] = useState<EtatSessionPositionDroitePlan>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExercicePositionDroitePlan, nouvelEtat: EtatSessionPositionDroitePlan) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionPositionDroitePlan(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ConclusionPositionDroitePlan)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Position d'une droite par rapport à un plan</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}
      </header>

      <main className="card">
        <div className="card-body">
        {dernierBilan ? (
          <ResultatPanelPositionDroitePlan
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionPositionDroitePlan resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "classification" ? (
          <EtapeClassificationPositionDroitePlan
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideClassification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseClassification(etat, reponse))}
          />
        ) : (
          <EtapeJustificationPositionDroitePlan
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideJustification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseJustification(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
