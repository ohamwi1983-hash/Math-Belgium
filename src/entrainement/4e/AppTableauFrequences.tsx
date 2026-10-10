import { useState } from "react";
import type { ExerciceTableauFrequences } from "./core/tableauFrequences.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTableauFrequences,
  soumettreReponseCumules,
  soumettreReponseFrequences,
  soumettreReponseFrequencesCumulees,
  soumettreReponseIdentification,
} from "./moteur/sessionTableauFrequences";
import type { EtatSessionTableauFrequences, PhaseTableauFrequences, ResultatExerciceTableauFrequences } from "./moteur/typesTableauFrequences";
import { genererExerciceTableauFrequences } from "./generateurs/tableauFrequences";
import { EtapeIdentificationTableauFrequences } from "./components/EtapeIdentificationTableauFrequences";
import { EtapeFrequencesTableauFrequences } from "./components/EtapeFrequencesTableauFrequences";
import { EtapeCumulesTableauFrequences } from "./components/EtapeCumulesTableauFrequences";
import { EtapeFrequencesCumuleesTableauFrequences } from "./components/EtapeFrequencesCumuleesTableauFrequences";
import { ResultatPanelTableauFrequences } from "./components/ResultatPanelTableauFrequences";
import { ResumeSessionTableauFrequences } from "./components/ResumeSessionTableauFrequences";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTableauFrequences {
  return demarrerSessionTableauFrequences(REGLAGES_DEMO, genererExerciceTableauFrequences);
}

interface Bilan {
  resultat: ResultatExerciceTableauFrequences;
  exercice: ExerciceTableauFrequences;
}

const LIBELLE_PHASE: Record<PhaseTableauFrequences, string> = {
  identification: "Identification",
  frequences: "Fréquences",
  cumules: "Effectifs cumulés",
  frequencesCumulees: "Fréquences cumulées",
};

export function AppTableauFrequences() {
  const [etat, setEtat] = useState<EtatSessionTableauFrequences>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceTableauFrequences, nouvelEtat: EtatSessionTableauFrequences) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de fréquences</h1>
        <p className="app-subtitle">Chapitre 5</p>
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
            <ResultatPanelTableauFrequences
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionTableauFrequences resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "identification" ? (
            <EtapeIdentificationTableauFrequences
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideIdentification}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseIdentification(etat, reponse))}
            />
          ) : etat.phase === "frequences" ? (
            <EtapeFrequencesTableauFrequences
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseFrequences(etat, reponse))}
            />
          ) : etat.phase === "cumules" ? (
            <EtapeCumulesTableauFrequences
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCumules}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => setEtat(soumettreReponseCumules(etat, reponse))}
            />
          ) : (
            <EtapeFrequencesCumuleesTableauFrequences
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequencesCumulees}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseFrequencesCumulees(etat, reponse));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
