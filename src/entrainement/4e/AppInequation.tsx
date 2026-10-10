import { useState } from "react";
import type { ExerciceInequation, ReponseRacines, SigneA, SolutionEnsemble } from "./core/inequation.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideIntervalle,
  activerAideSimplification,
  demarrerSessionInequation,
  soumettreReponseIntervalle,
  soumettreReponseRacines,
  soumettreReponseSigneA,
  soumettreReponseSimplification,
} from "./moteur/sessionInequation";
import type { EtatSessionInequation, PhaseInequation, ResultatExerciceInequation } from "./moteur/sessionInequation";
import { diagnostiquerSimplification } from "./moteur/verificationInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./generateurs/inequations";
import { EtapeRacines } from "./components/EtapeRacines";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSigneA } from "./components/EtapeSigneA";
import { EtapeInequation } from "./components/EtapeInequation";
import { EtapeSimplificationInequation } from "./components/EtapeSimplificationInequation";
import { ResultatPanelInequation } from "./components/ResultatPanelInequation";
import { ResumeSessionInequation } from "./components/ResumeSessionInequation";
import { calculerRecapitulatifInequation } from "./ui/recapitulatifInequation";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionInequation {
  return demarrerSessionInequation(REGLAGES_DEMO, genererExerciceInequation);
}

interface Bilan {
  resultat: ResultatExerciceInequation;
  exercice: ExerciceInequation;
}

const LIBELLE_PHASE: Record<PhaseInequation, string> = {
  simplification: "Simplification",
  racines: "Racines",
  signe_a: "Signe de a",
  intervalle: "Ensemble-solution",
};

export function AppInequation() {
  const [etat, setEtat] = useState<EtatSessionInequation>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerSimplification(reponse: string) {
    setEtat(soumettreReponseSimplification(etat, reponse));
  }

  function activerAideEtapeSimplification() {
    setEtat(activerAideSimplification(etat));
  }

  function validerRacines(reponse: ReponseRacines) {
    setEtat(soumettreReponseRacines(etat, reponse));
  }

  function validerSigneA(reponse: SigneA) {
    setEtat(soumettreReponseSigneA(etat, reponse));
  }

  function activerAide() {
    setEtat(activerAideIntervalle(etat));
  }

  function validerIntervalle(reponse: SolutionEnsemble) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseIntervalle(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatifInequation(etat);

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionInequation(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteInequationId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de signes d'un trinôme du second degré</h1>
        <p className="app-subtitle">Inéquations du second degré</p>
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
            <ResultatPanelInequation
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionInequation resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "simplification" ? (
            <EtapeSimplificationInequation
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              diagnostiquer={(v) => diagnostiquerSimplification(etat.exerciceCourant, v)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={activerAideEtapeSimplification}
              onValider={validerSimplification}
            />
          ) : etat.phase === "racines" ? (
            <EtapeRacines
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerRacines}
            />
          ) : etat.phase === "signe_a" ? (
            <EtapeSigneA
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={validerSigneA}
            />
          ) : (
            <EtapeInequation
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={activerAide}
              onValider={validerIntervalle}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
