import { useState } from "react";
import type { ExerciceEquationDroite } from "./core/equationDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationDroite } from "./generateurs/equationDroite";
import type { TypeDonneeEntree } from "./core/equationDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEquationDroite,
  soumettreReponseCoefficients,
  soumettreReponseExtraction,
  soumettreReponsePossibilite,
  soumettreReponsePossibiliteCoefficients,
} from "./moteur/sessionEquationDroite";
import type { EtatSessionEquationDroite, PhaseEquationDroite, ResultatExerciceEquationDroite } from "./moteur/typesEquationDroite";
import { EtapeCoefficientsEquationDroite } from "./components/EtapeCoefficientsEquationDroite";
import { EtapeExtractionEquationDroite } from "./components/EtapeExtractionEquationDroite";
import { EtapePossibiliteEquationDroite } from "./components/EtapePossibiliteEquationDroite";
import { EtapePossibiliteCoefficientsEquationDroite } from "./components/EtapePossibiliteCoefficientsEquationDroite";
import { ResultatPanelEquationDroite } from "./components/ResultatPanelEquationDroite";
import { ResumeSessionEquationDroite } from "./components/ResumeSessionEquationDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationDroite {
  return demarrerSessionEquationDroite(REGLAGES_DEMO, genererExerciceEquationDroite);
}

interface Bilan {
  resultat: ResultatExerciceEquationDroite;
  exercice: ExerciceEquationDroite;
}

const LIBELLE_PHASE: Record<PhaseEquationDroite, string> = {
  extraction: "Extraction",
  possibilite: "Possibilité de la forme",
  coefficients: "Coefficients",
  possibiliteCoefficients: "Possibilité et équation",
};

export function AppEquationDroite() {
  const [etat, setEtat] = useState<EtatSessionEquationDroite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceEquationDroite, nouvelEtat: EtatSessionEquationDroite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionEquationDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as TypeDonneeEntree)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équation d'une droite</h1>
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
          <ResultatPanelEquationDroite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionEquationDroite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "extraction" ? (
          <EtapeExtractionEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseExtraction(etat, reponse))}
          />
        ) : etat.phase === "possibilite" ? (
          <EtapePossibiliteEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponsePossibilite(etat, reponse));
            }}
          />
        ) : etat.phase === "possibiliteCoefficients" ? (
          <EtapePossibiliteCoefficientsEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePossibiliteCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponsePossibiliteCoefficients(etat, reponse));
            }}
          />
        ) : (
          <EtapeCoefficientsEquationDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCoefficients}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseCoefficients(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
