import { useState } from "react";
import type { ExerciceEquationCercle } from "./core/equationCercle.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./generateurs/equationCercle";
import type { VarianteEquationCercle } from "./core/equationCercle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationCercle, soumettreReponseCentre, soumettreReponseEquation, soumettreReponseRayon } from "./moteur/sessionEquationCercle";
import type { EtatSessionEquationCercle, PhaseEquationCercle, ResultatExerciceEquationCercle } from "./moteur/typesEquationCercle";
import { EtapeCentreEquationCercle } from "./components/EtapeCentreEquationCercle";
import { EtapeEquationEquationCercle } from "./components/EtapeEquationEquationCercle";
import { EtapeRayonEquationCercle } from "./components/EtapeRayonEquationCercle";
import { ResultatPanelEquationCercle } from "./components/ResultatPanelEquationCercle";
import { ResumeSessionEquationCercle } from "./components/ResumeSessionEquationCercle";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercle {
  return demarrerSessionEquationCercle(REGLAGES_DEMO, genererExerciceEquationCercle);
}

interface Bilan {
  resultat: ResultatExerciceEquationCercle;
  exercice: ExerciceEquationCercle;
}

const LIBELLE_PHASE: Record<PhaseEquationCercle, string> = {
  centre: "Centre du cercle",
  rayon: "Rayon du cercle",
  equation: "Équation du cercle",
};

export function AppEquationCercle() {
  const [etat, setEtat] = useState<EtatSessionEquationCercle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationCercle, nouvelEtat: EtatSessionEquationCercle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationCercle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercle)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'un cercle (non développée) à partir d'un graphe</h1>
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
          <ResultatPanelEquationCercle
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionEquationCercle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "centre" ? (
          <EtapeCentreEquationCercle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentre}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseCentre(etat, reponse))}
          />
        ) : etat.phase === "rayon" ? (
          <EtapeRayonEquationCercle
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseRayon(etat, reponse))}
          />
        ) : (
          <EtapeEquationEquationCercle
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
