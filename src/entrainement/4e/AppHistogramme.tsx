import { useState } from "react";
import type { ExerciceHistogramme } from "./core/histogramme.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionHistogramme,
  soumettreReponseClassement,
  soumettreReponseFrequences,
  soumettreReponseTrace,
} from "./moteur/sessionHistogramme";
import type { EtatSessionHistogramme, PhaseHistogramme, ResultatExerciceHistogramme } from "./moteur/typesHistogramme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHistogramme } from "./generateurs/histogramme";
import type { VarianteHistogramme } from "./core/histogramme.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassementHistogramme } from "./components/EtapeClassementHistogramme";
import { EtapeFrequencesHistogramme } from "./components/EtapeFrequencesHistogramme";
import { EtapeTraceHistogramme } from "./components/EtapeTraceHistogramme";
import { ResultatPanelHistogramme } from "./components/ResultatPanelHistogramme";
import { ResumeSessionHistogramme } from "./components/ResumeSessionHistogramme";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionHistogramme {
  return demarrerSessionHistogramme(REGLAGES_DEMO, genererExerciceHistogramme);
}

interface Bilan {
  resultat: ResultatExerciceHistogramme;
  exercice: ExerciceHistogramme;
}

const LIBELLE_PHASE: Record<PhaseHistogramme, string> = {
  classement: "Classement",
  frequences: "Fréquences",
  trace: "Tracer l'histogramme",
};

export function AppHistogramme() {
  const [etat, setEtat] = useState<EtatSessionHistogramme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceHistogramme, nouvelEtat: EtatSessionHistogramme) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionHistogramme(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteHistogramme)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Regroupement en classes et histogramme</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
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

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelHistogramme
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionHistogramme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "classement" ? (
            <EtapeClassementHistogramme
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideClassement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseClassement(etat, reponse))}
            />
          ) : etat.phase === "frequences" ? (
            <EtapeFrequencesHistogramme
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseFrequences(etat, reponse))}
            />
          ) : (
            <EtapeTraceHistogramme
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideTrace}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseTrace(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
