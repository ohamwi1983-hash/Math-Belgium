import { useState } from "react";
import type { ExerciceConstructionDroite } from "./core/constructionDroite.types";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./generateurs/constructionDroite";
import type { VarianteConstructionDroite } from "./core/constructionDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionConstructionDroite, soumettreReponsePoints, soumettreReponseTrace } from "./moteur/sessionConstructionDroite";
import type { EtatSessionConstructionDroite, PhaseConstructionDroite, ResultatExerciceConstructionDroite } from "./moteur/typesConstructionDroite";
import { EtapePointsConstructionDroite } from "./components/EtapePointsConstructionDroite";
import { EtapeTraceConstructionDroite } from "./components/EtapeTraceConstructionDroite";
import { ResultatPanelConstructionDroite } from "./components/ResultatPanelConstructionDroite";
import { ResumeSessionConstructionDroite } from "./components/ResumeSessionConstructionDroite";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionConstructionDroite {
  return demarrerSessionConstructionDroite(REGLAGES_DEMO, genererExerciceConstructionDroite);
}

interface Bilan {
  resultat: ResultatExerciceConstructionDroite;
  exercice: ExerciceConstructionDroite;
}

const LIBELLE_PHASE: Record<PhaseConstructionDroite, string> = {
  points: "Points de la droite",
  trace: "Tracé sur le graphe",
};

export function AppConstructionDroite() {
  const [etat, setEtat] = useState<EtatSessionConstructionDroite>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceConstructionDroite, nouvelEtat: EtatSessionConstructionDroite) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!, exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionConstructionDroite(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteConstructionDroite)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Construction graphique — tracer une droite</h1>
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
          <ResultatPanelConstructionDroite
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSessionConstructionDroite resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : etat.phase === "points" ? (
          <EtapePointsConstructionDroite
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAidePoints}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => setEtat(soumettreReponsePoints(etat, reponse))}
          />
        ) : etat.cible1 !== null && etat.cible2 !== null ? (
          <EtapeTraceConstructionDroite
            exercice={exercice}
            cible1={etat.cible1}
            cible2={etat.cible2}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideTrace}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => {
              const exerciceTermine = exercice;
              terminerEtape(exerciceTermine, soumettreReponseTrace(etat, reponse));
            }}
          />
        ) : null}
        </div>
      </main>
    </div>
  );
}
