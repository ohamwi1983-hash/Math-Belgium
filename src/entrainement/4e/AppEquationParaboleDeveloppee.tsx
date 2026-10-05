import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "./core/equationParaboleDeveloppee.types";
import type { OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParaboleDeveloppee } from "./generateurs/equationParaboleDeveloppee";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEquationParaboleDeveloppee,
  soumettreReponseCaracteristiques,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationParaboleDeveloppee";
import type { EtatSessionEquationParaboleDeveloppee, PhaseEquationParaboleDeveloppee, ResultatExerciceEquationParaboleDeveloppee } from "./moteur/typesEquationParaboleDeveloppee";
import { EtapeCaracteristiquesEquationParaboleDeveloppee } from "./components/EtapeCaracteristiquesEquationParaboleDeveloppee";
import { EtapeCompletionEquationParaboleDeveloppee } from "./components/EtapeCompletionEquationParaboleDeveloppee";
import { EtapeRegroupementEquationParaboleDeveloppee } from "./components/EtapeRegroupementEquationParaboleDeveloppee";
import { ResultatPanelEquationParaboleDeveloppee } from "./components/ResultatPanelEquationParaboleDeveloppee";
import { ResumeSessionEquationParaboleDeveloppee } from "./components/ResumeSessionEquationParaboleDeveloppee";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationParaboleDeveloppee {
  return demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, genererExerciceEquationParaboleDeveloppee);
}

interface Bilan {
  resultat: ResultatExerciceEquationParaboleDeveloppee;
  exercice: ExerciceEquationParaboleDeveloppee;
}

const LIBELLE_PHASE: Record<PhaseEquationParaboleDeveloppee, string> = {
  regroupement: "Orientation et factorisation",
  completion: "Complétion du carré",
  caracteristiques: "Caractéristiques finales",
};

export function AppEquationParaboleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationParaboleDeveloppee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationParaboleDeveloppee, nouvelEtat: EtatSessionEquationParaboleDeveloppee) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationParaboleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Sommet, foyer, p et directrice d'une parabole depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
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
          <ResultatPanelEquationParaboleDeveloppee
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionEquationParaboleDeveloppee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "regroupement" ? (
          <EtapeRegroupementEquationParaboleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRegroupement}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseRegroupement(etat, reponse))}
          />
        ) : etat.phase === "completion" ? (
          <EtapeCompletionEquationParaboleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCompletion}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseCompletion(etat, reponse))}
          />
        ) : (
          <EtapeCaracteristiquesEquationParaboleDeveloppee
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCaracteristiques}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCaracteristiques(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
