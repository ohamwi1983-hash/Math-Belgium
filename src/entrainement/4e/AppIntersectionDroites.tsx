import { useState } from "react";
import type { ExerciceIntersectionDroites } from "./core/intersectionDroites.types";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionIntersectionDroites, soumettreReponseDiagnostic, soumettreReponsePoint } from "./moteur/sessionIntersectionDroites";
import type { EtatSessionIntersectionDroites, PhaseIntersectionDroites, ResultatExerciceIntersectionDroites } from "./moteur/typesIntersectionDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionDroites } from "./generateurs/intersectionDroites";
import type { VarianteIntersectionDroites } from "./core/intersectionDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeDiagnosticIntersectionDroites } from "./components/EtapeDiagnosticIntersectionDroites";
import { EtapePointIntersectionDroites } from "./components/EtapePointIntersectionDroites";
import { ResultatPanelIntersectionDroites } from "./components/ResultatPanelIntersectionDroites";
import { ResumeSessionIntersectionDroites } from "./components/ResumeSessionIntersectionDroites";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionIntersectionDroites {
  return demarrerSessionIntersectionDroites(REGLAGES_DEMO, genererExerciceIntersectionDroites);
}

interface Bilan {
  resultat: ResultatExerciceIntersectionDroites;
  exercice: ExerciceIntersectionDroites;
}

const LIBELLE_PHASE: Record<PhaseIntersectionDroites, string> = {
  diagnostic: "Diagnostic",
  point: "Point d'intersection",
};

export function AppIntersectionDroites() {
  const [etat, setEtat] = useState<EtatSessionIntersectionDroites>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceIntersectionDroites, nouvelEtat: EtatSessionIntersectionDroites) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionIntersectionDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteIntersectionDroites)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Intersection entre deux droites</h1>
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
          <ResultatPanelIntersectionDroites
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionIntersectionDroites resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "diagnostic" ? (
          <EtapeDiagnosticIntersectionDroites
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideDiagnostic}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseDiagnostic(etat, reponse));
            }}
          />
        ) : (
          <EtapePointIntersectionDroites
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePoint}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponsePoint(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
