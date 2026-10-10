import { useState } from "react";
import type { ExerciceEquationParabole, OrientationParabole } from "./core/equationParabole.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationParabole } from "./generateurs/equationParabole";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationParabole, soumettreReponseEquation, soumettreReponseSommetFoyer } from "./moteur/sessionEquationParabole";
import type { EtatSessionEquationParabole, PhaseEquationParabole, ResultatExerciceEquationParabole } from "./moteur/typesEquationParabole";
import { EtapeEquationEquationParabole } from "./components/EtapeEquationEquationParabole";
import { EtapeSommetFoyerEquationParabole } from "./components/EtapeSommetFoyerEquationParabole";
import { ResultatPanelEquationParabole } from "./components/ResultatPanelEquationParabole";
import { ResumeSessionEquationParabole } from "./components/ResumeSessionEquationParabole";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationParabole {
  return demarrerSessionEquationParabole(REGLAGES_DEMO, genererExerciceEquationParabole);
}

interface Bilan {
  resultat: ResultatExerciceEquationParabole;
  exercice: ExerciceEquationParabole;
}

const LIBELLE_PHASE: Record<PhaseEquationParabole, string> = {
  sommetFoyer: "Sommet et foyer",
  equation: "Équation de la parabole",
};

export function AppEquationParabole() {
  const [etat, setEtat] = useState<EtatSessionEquationParabole>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationParabole, nouvelEtat: EtatSessionEquationParabole) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationParabole(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as OrientationParabole)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'une parabole depuis un graphe</h1>
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
          <ResultatPanelEquationParabole
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionEquationParabole resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "sommetFoyer" ? (
          <EtapeSommetFoyerEquationParabole
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideSommetFoyer}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseSommetFoyer(etat, reponse))}
          />
        ) : (
          <EtapeEquationEquationParabole
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquation}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseEquation(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
