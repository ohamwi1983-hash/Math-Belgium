import { useState } from "react";
import type { ExerciceLieuxGeometriques } from "./core/lieuxGeometriques.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLieuxGeometriques } from "./generateurs/lieuxGeometriques";
import type { VarianteLieuxGeometriquesId } from "./generateurs/lieuxGeometriques";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLieuxGeometriques,
  soumettreReponseEquations,
  soumettreReponseIdentification,
  soumettreReponseResolution,
} from "./moteur/sessionLieuxGeometriques";
import type { EtatSessionLieuxGeometriques, PhaseLieuxGeometriques, ResultatExerciceLieuxGeometriques } from "./moteur/typesLieuxGeometriques";
import { EtapeEquationsLieuxGeometriques } from "./components/EtapeEquationsLieuxGeometriques";
import { EtapeIdentificationLieuxGeometriques } from "./components/EtapeIdentificationLieuxGeometriques";
import { EtapeResolutionLieuxGeometriques } from "./components/EtapeResolutionLieuxGeometriques";
import { ResultatPanelLieuxGeometriques } from "./components/ResultatPanelLieuxGeometriques";
import { ResumeSessionLieuxGeometriques } from "./components/ResumeSessionLieuxGeometriques";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionLieuxGeometriques {
  return demarrerSessionLieuxGeometriques(REGLAGES_DEMO, genererExerciceLieuxGeometriques);
}

interface Bilan {
  resultat: ResultatExerciceLieuxGeometriques;
  exercice: ExerciceLieuxGeometriques;
}

const LIBELLE_PHASE: Record<PhaseLieuxGeometriques, string> = {
  identification: "Identification",
  equations: "Équations",
  resolution: "Résolution",
};

export function AppLieuxGeometriques() {
  const [etat, setEtat] = useState<EtatSessionLieuxGeometriques>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceLieuxGeometriques, nouvelEtat: EtatSessionLieuxGeometriques) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionLieuxGeometriques(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteLieuxGeometriquesId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Lieux géométriques : intersection</h1>
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
          <ResultatPanelLieuxGeometriques
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionLieuxGeometriques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "identification" ? (
          <EtapeIdentificationLieuxGeometriques
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideIdentification}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseIdentification(etat, reponse));
            }}
          />
        ) : etat.phase === "equations" ? (
          <EtapeEquationsLieuxGeometriques
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquations}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseEquations(etat, reponse));
            }}
          />
        ) : (
          <EtapeResolutionLieuxGeometriques
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideResolution}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = etat.exerciceCourant;
              terminerEtape(exerciceTermine, soumettreReponseResolution(etat, reponse));
            }}
          />
        )}
        </div>
      </main>
    </div>
  );
}
