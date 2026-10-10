import { useState } from "react";
import type { ExerciceRelationsDroites } from "./core/relationsDroites.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsDroites } from "./generateurs/relationsDroites";
import type { VarianteRelationsDroites } from "./core/relationsDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionRelationsDroites, soumettreReponseConstruction, soumettreReponseEquation, soumettreReponseExtraction } from "./moteur/sessionRelationsDroites";
import type { EtatSessionRelationsDroites, PhaseRelationsDroites, ResultatExerciceRelationsDroites } from "./moteur/typesRelationsDroites";
import { EtapeConstructionRelationsDroites } from "./components/EtapeConstructionRelationsDroites";
import { EtapeEquationRelationsDroites } from "./components/EtapeEquationRelationsDroites";
import { EtapeExtractionRelationsDroites } from "./components/EtapeExtractionRelationsDroites";
import { ResultatPanelRelationsDroites } from "./components/ResultatPanelRelationsDroites";
import { ResumeSessionRelationsDroites } from "./components/ResumeSessionRelationsDroites";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationsDroites {
  return demarrerSessionRelationsDroites(REGLAGES_DEMO, genererExerciceRelationsDroites);
}

interface Bilan {
  resultat: ResultatExerciceRelationsDroites;
  exercice: ExerciceRelationsDroites;
}

const LIBELLE_PHASE: Record<PhaseRelationsDroites, string> = {
  extraction: "Extraction du vecteur directeur",
  construction: "Construction du vecteur cherché",
  equation: "Équation de la droite cherchée",
};

export function AppRelationsDroites() {
  const [etat, setEtat] = useState<EtatSessionRelationsDroites>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceRelationsDroites, nouvelEtat: EtatSessionRelationsDroites) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionRelationsDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteRelationsDroites)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Relations entre droites</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
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
          <ResultatPanelRelationsDroites
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionRelationsDroites resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "extraction" ? (
          <EtapeExtractionRelationsDroites
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseExtraction(etat, reponse))}
          />
        ) : etat.phase === "construction" ? (
          <EtapeConstructionRelationsDroites
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideConstruction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponseConstruction(etat, reponse))}
          />
        ) : (
          <EtapeEquationRelationsDroites
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
