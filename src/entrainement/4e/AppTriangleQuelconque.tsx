import { useState } from "react";
import type { ExerciceTriangleQuelconque } from "./core/triangleQuelconque.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTriangleQuelconque,
  soumettreReponseAire,
  soumettreReponseDonneeManquante,
} from "./moteur/sessionTriangleQuelconque";
import type { EtatSessionTriangleQuelconque, PhaseTriangleQuelconque, ResultatExerciceTriangleQuelconque } from "./moteur/typesTriangleQuelconque";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTriangleQuelconque } from "./generateurs/triangleQuelconque";
import type { ConfigurationTriangleQuelconque } from "./core/triangleQuelconque.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeDonneeManquante } from "./components/EtapeDonneeManquante";
import { EtapeAireTriangleQuelconque } from "./components/EtapeAireTriangleQuelconque";
import { ResultatPanelTriangleQuelconque } from "./components/ResultatPanelTriangleQuelconque";
import { ResumeSessionTriangleQuelconque } from "./components/ResumeSessionTriangleQuelconque";
import { calculerRecapitulatifTriangleQuelconque } from "./ui/recapitulatifTriangleQuelconque";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTriangleQuelconque {
  return demarrerSessionTriangleQuelconque(REGLAGES_DEMO, genererExerciceTriangleQuelconque);
}

interface Bilan {
  resultat: ResultatExerciceTriangleQuelconque;
  exercice: ExerciceTriangleQuelconque;
}

const LIBELLE_PHASE: Record<PhaseTriangleQuelconque, string> = {
  donneeManquante: "Donnée manquante",
  aire: "Aire",
};

export function AppTriangleQuelconque() {
  const [etat, setEtat] = useState<EtatSessionTriangleQuelconque>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceTriangleQuelconque, nouvelEtat: EtatSessionTriangleQuelconque) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifTriangleQuelconque(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionTriangleQuelconque(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ConfigurationTriangleQuelconque)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Triangle quelconque</h1>
        <p className="app-subtitle">Chapitre 3</p>
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
          {enCoursDeSession && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelTriangleQuelconque
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionTriangleQuelconque resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "donneeManquante" ? (
            <EtapeDonneeManquante
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDonneeManquante}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur, unite) => setEtat(soumettreReponseDonneeManquante(etat, valeur, unite))}
            />
          ) : (
            <EtapeAireTriangleQuelconque
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              niveauAide={etat.niveauAideAire}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur, unite) => {
                const exerciceTermine = etat.exerciceCourant;
                terminerEtape(exerciceTermine, soumettreReponseAire(etat, valeur, unite));
              }}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
